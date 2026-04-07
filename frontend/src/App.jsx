import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "./hooks/useSocket";
import JoinScreen     from "./components/JoinScreen";
import PixiCanvas     from "./components/PixiCanvas";
import ChatPanel      from "./components/ChatPanel";
import HUD            from "./components/HUD";
import BottomToolbar  from "./components/BottomToolbar";
import ProximityToast from "./components/ProximityToast";

let toastIdCounter = 0;

function playTone(freq, type = "sine", duration = 0.15, vol = 0.15) {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + duration);
    setTimeout(() => ctx.close(), (duration + 0.1) * 1000);
  } catch (_) {}
}

export default function App() {
  const { emit, on, off, connected, disconnect } = useSocket();

  const [joined, setJoined]           = useState(false);
  const [myUsername, setMyUsername]   = useState("");
  const [mySocketId, setMySocketId]   = useState(null);
  const [users, setUsers]             = useState([]);
  const [connections, setConnections] = useState([]);
  const [messages, setMessages]       = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});

  // ── TOOL STATE — lifted here so Toolbar and Canvas share it ───────────────
  const [activeTool, setActiveTool] = useState("move");

  // Ref to PixiCanvas's spawnEmoji function (set via onEmojiSpawn callback)
  const spawnEmojiRef = useRef(null);

  const typingThrottleRef = useRef({});

  const handleJoin = useCallback((username, avatarIndex) => {
    setMyUsername(username);
    emit("user:join", { username, avatar: avatarIndex });
    setJoined(true);
  }, [emit]);

  const handleLeave = useCallback(() => {
    disconnect();
    setJoined(false);
    setMySocketId(null);
    setUsers([]);
    setConnections([]);
    setMessages([]);
    setNotifications([]);
    setTypingUsers({});
    setActiveTool("move");
  }, [disconnect]);

  // ── Tool change from BottomToolbar ────────────────────────────────────────
  const handleToolChange = useCallback((tool) => {
    setActiveTool(tool);
  }, []);

  // ── Emoji: triggered when user picks from emoji picker in toolbar ──────────
  const handleEmoji = useCallback((emoji) => {
    // Spawn floating emoji above local avatar on canvas
    spawnEmojiRef.current?.(emoji);
    // Return to move tool automatically
    setActiveTool("move");
  }, []);

  // ── Receive spawnEmoji function from PixiCanvas ───────────────────────────
  const handleEmojiSpawn = useCallback((fn) => {
    spawnEmojiRef.current = fn;
  }, []);

  useEffect(() => {
    if (!joined) return;
    const cleanups = [];

    const handleUserJoined = ({ socketId }) => setMySocketId(socketId);
    on("user:joined", handleUserJoined);
    cleanups.push(() => off("user:joined", handleUserJoined));

    const handleUsersUpdate = (u) => setUsers(u);
    on("users:update", handleUsersUpdate);
    cleanups.push(() => off("users:update", handleUsersUpdate));

    const handleProximityConnected = ({ socketId, userId, username, avatar, roomId }) => {
      emit("chat:join", { roomId });
      setConnections((prev) => {
        if (prev.find((c) => c.roomId === roomId)) return prev;
        return [...prev, { socketId, userId, username, avatar, roomId }];
      });
      playTone(440); setTimeout(() => playTone(660), 80);
      const id = ++toastIdCounter;
      setNotifications((prev) => [...prev, { id, type:"connect", username, avatar }]);
      setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 3000);
    };
    on("proximity:connected", handleProximityConnected);
    cleanups.push(() => off("proximity:connected", handleProximityConnected));

    const handleProximityDisconnected = ({ socketId, roomId }) => {
      setConnections((prev) => {
        const conn = prev.find((c) => c.roomId === roomId);
        if (conn) {
          emit("chat:leave", { roomId });
          setMessages((m) => m.filter((msg) => msg.roomId !== roomId));
          playTone(440); setTimeout(() => playTone(330), 80);
          const id = ++toastIdCounter;
          setNotifications((n) => [...n, { id, type:"disconnect", username:conn.username, avatar:conn.avatar }]);
          setTimeout(() => setNotifications((n) => n.filter((x) => x.id !== id)), 3000);
        }
        setTypingUsers((prev) => { const next = {...prev}; delete next[roomId]; return next; });
        return prev.filter((c) => c.roomId !== roomId);
      });
    };
    on("proximity:disconnected", handleProximityDisconnected);
    cleanups.push(() => off("proximity:disconnected", handleProximityDisconnected));

    const handleChatMessage = (msg) =>
      setMessages((prev) => [...prev.slice(-200), msg]);
    on("chat:message", handleChatMessage);
    cleanups.push(() => off("chat:message", handleChatMessage));

    const handleChatHistory = ({ roomId, messages: history }) => {
      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const newMsgs = history.filter((m) => !existingIds.has(m.id));
        return [...prev, ...newMsgs].slice(-300);
      });
    };
    on("chat:history", handleChatHistory);
    cleanups.push(() => off("chat:history", handleChatHistory));

    const handleTyping = ({ roomId, usernames }) => {
      setTypingUsers((prev) => ({ ...prev, [roomId]: usernames }));
    };
    on("chat:typing", handleTyping);
    cleanups.push(() => off("chat:typing", handleTyping));

    return () => cleanups.forEach((fn) => fn());
  }, [joined, on, off, emit]);

  const handleMove = useCallback((x, y) => emit("user:move", { x, y }), [emit]);

  const handleSendMessage = useCallback((roomId, message) => {
    emit("chat:message", { roomId, message });
  }, [emit]);

  const handleTyping = useCallback((roomId) => {
    const now = Date.now();
    if (!typingThrottleRef.current[roomId] || now - typingThrottleRef.current[roomId] > 500) {
      typingThrottleRef.current[roomId] = now;
      emit("chat:typing", { roomId });
    }
  }, [emit]);

  if (!joined) return <JoinScreen onJoin={handleJoin} />;

  return (
    <div className="flex flex-col w-full h-full" style={{ background:"#0a0a14" }}>
      <HUD
        userCount={users.length}
        connections={connections}
        myUsername={myUsername}
        isConnected={connected}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="relative flex-1 overflow-hidden">
          {mySocketId ? (
            <PixiCanvas
              users={users}
              mySocketId={mySocketId}
              onMove={handleMove}
              activeTool={activeTool}
              onEmojiSpawn={handleEmojiSpawn}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <div className="px-6 py-4 rounded-2xl text-center"
                style={{ background:"rgba(18,18,31,0.85)", border:"1px solid rgba(42,42,69,0.5)", backdropFilter:"blur(12px)" }}>
                <p className="text-sm font-medium" style={{ color:"#64748b", fontFamily:"Syne" }}>
                  Connecting to cosmos...
                </p>
              </div>
            </div>
          )}

          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <ProximityToast notifications={notifications} />
          </div>

          {mySocketId && users.length <= 1 && (
            <div className="absolute top-1/2 left-1/2 pointer-events-none"
              style={{ transform:"translate(-50%,-50%)" }}>
              <div className="px-6 py-4 rounded-2xl text-center"
                style={{ background:"rgba(18,18,31,0.85)", border:"1px solid rgba(42,42,69,0.5)", backdropFilter:"blur(12px)" }}>
                <p className="text-sm font-medium mb-1" style={{ color:"#64748b", fontFamily:"Syne" }}>
                  You're alone in the cosmos
                </p>
                <p className="text-xs" style={{ color:"#334155", fontFamily:"DM Sans" }}>
                  Open another tab to test multiplayer
                </p>
              </div>
            </div>
          )}
        </div>

        <ChatPanel
          connections={connections}
          messages={messages}
          onSendMessage={handleSendMessage}
          mySocketId={mySocketId}
          myUsername={myUsername}
          typingUsers={typingUsers}
          onTyping={handleTyping}
        />
      </div>

      {/* ── BottomToolbar: activeTool lifted to App ─────────────────────── */}
      <BottomToolbar
        onLeave={handleLeave}
        activeTool={activeTool}
        onToolChange={handleToolChange}
        onEmoji={handleEmoji}
      />
    </div>
  );
}