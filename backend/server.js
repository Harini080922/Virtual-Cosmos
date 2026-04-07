require("dotenv").config();
const express   = require("express");
const http      = require("http");
const { Server } = require("socket.io");
const cors      = require("cors");
const mongoose  = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

// ─── MongoDB ──────────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/virtual-cosmos";
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err.message));

// ★ IMPROVEMENT — Message schema so chat history survives server restarts
const messageSchema = new mongoose.Schema({
  id:        { type: String, required: true, unique: true },
  roomId:    { type: String, required: true, index: true },
  senderId:  String,
  username:  String,
  avatar:    Number,
  message:   String,
  timestamp: { type: Date, default: Date.now },
});
const Message = mongoose.model("Message", messageSchema);

// ─── In-Memory User State ─────────────────────────────────────────────────────
const users = new Map();
// ★ IMPROVEMENT — typing state: Map<roomId, Map<socketId, timeoutId>>
const typingTimers = new Map();

const PROXIMITY_RADIUS = 120;
const CANVAS_WIDTH     = 1200;
const CANVAS_HEIGHT    = 750;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function distance(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

function getUsersPublic() {
  return Array.from(users.values()).map((u) => ({
    socketId:    u.socketId,
    userId:      u.userId,
    username:    u.username,
    avatar:      u.avatar,
    x:           u.x,
    y:           u.y,
    connections: Array.from(u.connections),
  }));
}

function broadcastUsers() {
  io.emit("users:update", getUsersPublic());
}

// ★ IMPROVEMENT — broadcast current typing users for a room
function broadcastTyping(roomId) {
  const roomTimers = typingTimers.get(roomId);
  if (!roomTimers) return;
  const usernames = [];
  roomTimers.forEach((_, socketId) => {
    const u = users.get(socketId);
    if (u) usernames.push(u.username);
  });
  io.to(roomId).emit("chat:typing", { roomId, usernames });
}

function clearTyping(roomId, socketId) {
  const roomTimers = typingTimers.get(roomId);
  if (!roomTimers) return;
  const timer = roomTimers.get(socketId);
  if (timer) clearTimeout(timer);
  roomTimers.delete(socketId);
  if (roomTimers.size === 0) typingTimers.delete(roomId);
  broadcastTyping(roomId);
}

function checkProximity(movedSocketId) {
  const movedUser   = users.get(movedSocketId);
  if (!movedUser) return;
  const movedSocket = io.sockets.sockets.get(movedSocketId);

  users.forEach((otherUser, otherSocketId) => {
    if (otherSocketId === movedSocketId) return;
    const otherSocket  = io.sockets.sockets.get(otherSocketId);
    const dist         = distance(movedUser, otherUser);
    const wasConnected = movedUser.connections.has(otherSocketId);
    const isNowClose   = dist < PROXIMITY_RADIUS;

    if (isNowClose && !wasConnected) {
      movedUser.connections.add(otherSocketId);
      otherUser.connections.add(movedSocketId);
      const roomId = [movedSocketId, otherSocketId].sort().join("_");
      if (movedSocket) movedSocket.join(roomId);
      if (otherSocket) otherSocket.join(roomId);

      io.to(movedSocketId).emit("proximity:connected", {
        socketId: otherSocketId, userId: otherUser.userId,
        username: otherUser.username, avatar: otherUser.avatar, roomId,
      });
      io.to(otherSocketId).emit("proximity:connected", {
        socketId: movedSocketId, userId: movedUser.userId,
        username: movedUser.username, avatar: movedUser.avatar, roomId,
      });

      // ★ IMPROVEMENT — send last 50 messages for this room from MongoDB
      Message.find({ roomId }).sort({ timestamp: -1 }).limit(50).lean()
        .then((msgs) => {
          const history = msgs.reverse();
          if (history.length > 0) {
            io.to(movedSocketId).emit("chat:history", { roomId, messages: history });
            io.to(otherSocketId).emit("chat:history", { roomId, messages: history });
          }
        })
        .catch(() => {});

    } else if (!isNowClose && wasConnected) {
      movedUser.connections.delete(otherSocketId);
      otherUser.connections.delete(movedSocketId);
      const roomId = [movedSocketId, otherSocketId].sort().join("_");
      if (movedSocket) movedSocket.leave(roomId);
      if (otherSocket) otherSocket.leave(roomId);

      // Clear typing state for both on disconnect
      clearTyping(roomId, movedSocketId);
      clearTyping(roomId, otherSocketId);

      io.to(movedSocketId).emit("proximity:disconnected", { socketId: otherSocketId, roomId });
      io.to(otherSocketId).emit("proximity:disconnected", { socketId: movedSocketId, roomId });
    }
  });
}

// ─── Socket.IO Events ─────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  socket.on("user:join", ({ username, avatar }) => {
    const userId = uuidv4();
    const user   = {
      socketId: socket.id, userId,
      username: username || `User_${socket.id.slice(0, 4)}`,
      avatar:   avatar ?? 0,
      x: Math.random() * (CANVAS_WIDTH  - 200) + 100,
      y: Math.random() * (CANVAS_HEIGHT - 200) + 100,
      connections: new Set(),
    };
    users.set(socket.id, user);
    socket.emit("user:joined", { socketId: socket.id, userId, x: user.x, y: user.y });
    broadcastUsers();
    console.log(`👤 ${user.username} joined (${socket.id})`);
  });

  socket.on("user:move", ({ x, y }) => {
    const user = users.get(socket.id);
    if (!user) return;
    user.x = Math.max(20, Math.min(CANVAS_WIDTH  - 20, x));
    user.y = Math.max(20, Math.min(CANVAS_HEIGHT - 20, y));
    checkProximity(socket.id);
    broadcastUsers();
  });

  socket.on("chat:message", ({ roomId, message }) => {
    const user = users.get(socket.id);
    if (!user) return;
    const socketRooms = io.sockets.sockets.get(socket.id)?.rooms;
    if (!socketRooms?.has(roomId)) return;

    // Stop typing indicator when message is sent
    clearTyping(roomId, socket.id);

    const msg = {
      id: uuidv4(), roomId,
      senderId: socket.id, username: user.username,
      avatar: user.avatar, message,
      timestamp: new Date().toISOString(),
    };
    io.to(roomId).emit("chat:message", msg);

    // ★ IMPROVEMENT — persist to MongoDB
    Message.create(msg).catch((err) => console.error("Message save error:", err.message));
  });

  // ★ IMPROVEMENT — typing indicator
  socket.on("chat:typing", ({ roomId }) => {
    const user = users.get(socket.id);
    if (!user) return;
    const socketRooms = io.sockets.sockets.get(socket.id)?.rooms;
    if (!socketRooms?.has(roomId)) return;

    if (!typingTimers.has(roomId)) typingTimers.set(roomId, new Map());
    const roomTimers = typingTimers.get(roomId);

    // Reset timeout on each keystroke
    const existing = roomTimers.get(socket.id);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => clearTyping(roomId, socket.id), 2500);
    roomTimers.set(socket.id, timer);
    broadcastTyping(roomId);
  });

  socket.on("chat:join",  ({ roomId }) => { socket.join(roomId); });
  socket.on("chat:leave", ({ roomId }) => { socket.leave(roomId); });

  socket.on("disconnect", () => {
    const user = users.get(socket.id);
    if (user) {
      user.connections.forEach((otherSocketId) => {
        const otherUser   = users.get(otherSocketId);
        const otherSocket = io.sockets.sockets.get(otherSocketId);
        if (otherUser) {
          otherUser.connections.delete(socket.id);
          const roomId = [socket.id, otherSocketId].sort().join("_");
          if (otherSocket) otherSocket.leave(roomId);
          clearTyping(roomId, socket.id);
          io.to(otherSocketId).emit("proximity:disconnected", { socketId: socket.id, roomId });
        }
      });
      console.log(`👋 ${user.username} left (${socket.id})`);
      users.delete(socket.id);
    }
    broadcastUsers();
  });
});

// ─── REST ─────────────────────────────────────────────────────────────────────
app.get("/health", (_, res) => res.json({ status: "ok", users: users.size }));

// ★ IMPROVEMENT — endpoint to fetch chat history for a room (REST fallback)
app.get("/messages/:roomId", async (req, res) => {
  try {
    const msgs = await Message.find({ roomId: req.params.roomId })
      .sort({ timestamp: -1 }).limit(100).lean();
    res.json(msgs.reverse());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`   Canvas: ${CANVAS_WIDTH}×${CANVAS_HEIGHT}, Proximity radius: ${PROXIMITY_RADIUS}px`);
});