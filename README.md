# 🌌 Virtual Cosmos

A 2D proximity-based virtual space where users can move around and automatically connect/disconnect with others based on distance — built for the Tutedude MERN Intern Assignment.

---

## ✨ Features

- **2D Canvas World** — Rendered with PixiJS; stars, grid, nebula effects
- **Real-Time Multiplayer** — All users visible and synced via Socket.IO
- **Proximity Detection** — Automatic connect/disconnect at configurable radius (120px)
- **Proximity Chat** — Chat panel appears/disappears based on closeness
- **Multi-User Chat Tabs** — Chat with multiple nearby users simultaneously
- **Keyboard + Click Movement** — WASD / Arrow keys or click to teleport
- **Avatar System** — 8 unique avatar color themes
- **Connection Toasts** — Visual notifications on connect/disconnect
- **Live HUD** — Shows online count, your name, connection status

---

## 🛠 Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React + Vite | Fast HMR, modern DX |
| Canvas | PixiJS | WebGL-accelerated 2D rendering |
| Styling | Tailwind CSS | Utility-first, rapid UI |
| Backend | Node.js + Express | Lightweight HTTP server |
| Real-time | Socket.IO | Bi-directional events, rooms |
| Database | MongoDB + Mongoose | Flexible schema for user/session data |

---

## 📁 Project Structure

```
virtual-cosmos/
├── backend/
│   ├── server.js          # Express + Socket.IO server
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── JoinScreen.jsx     # Username + avatar selection
│   │   │   ├── PixiCanvas.jsx     # 2D world rendering
│   │   │   ├── ChatPanel.jsx      # Proximity chat UI
│   │   │   ├── HUD.jsx            # Top status bar
│   │   │   └── ProximityToast.jsx # Connect/disconnect notifications
│   │   ├── hooks/
│   │   │   └── useSocket.js       # Socket.IO React hook
│   │   ├── utils/
│   │   │   └── avatarConfig.js    # Avatar colors + constants
│   │   ├── App.jsx                # Root state orchestrator
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

---

## 🚀 Setup & Running

### Prerequisites
- Node.js v18+
- MongoDB running locally (or MongoDB Atlas URI)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd virtual-cosmos
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env or Copy-Item .env.example .env
# Edit .env with your MongoDB URI if needed
npm install
npm run dev
# Server runs on http://localhost:4000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

### 4. Test Multiplayer
Open **multiple browser tabs** at `http://localhost:5173`, join with different names, and move avatars close together to see chat connect!

---

## ⚙️ Environment Variables

**Backend** (`backend/.env`):
```
PORT=4000
MONGO_URI=mongodb://localhost:27017/virtual-cosmos
CLIENT_URL=http://localhost:5173
```

**Frontend** (optional `frontend/.env`):
```
VITE_SOCKET_URL=http://localhost:4000
```

---

## 🎮 Controls

| Action | Control |
|--------|---------|
| Move up | `W` or `↑` |
| Move down | `S` or `↓` |
| Move left | `A` or `←` |
| Move right | `D` or `→` |
| Teleport | Click anywhere on canvas |

---

## 🔌 Socket.IO Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `user:join` | `{ username, avatar }` | Join the cosmos |
| `user:move` | `{ x, y }` | Update position |
| `chat:message` | `{ roomId, message }` | Send a message |
| `chat:join` | `{ roomId }` | Join a chat room |
| `chat:leave` | `{ roomId }` | Leave a chat room |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `user:joined` | `{ socketId, userId, x, y }` | Confirms join + spawn position |
| `users:update` | `User[]` | Broadcasts all user positions |
| `proximity:connected` | `{ socketId, username, avatar, roomId }` | Two users entered proximity |
| `proximity:disconnected` | `{ socketId, roomId }` | Two users left proximity |
| `chat:message` | `Message` | New chat message in room |



---

## 🎨 Design Decisions

- **PixiJS over plain Canvas**: WebGL acceleration gives smooth rendering for many simultaneous avatars
- **In-memory user state**: Fast for real-time position updates; MongoDB used for persistence layer
- **Room ID = sorted socket IDs**: Deterministic, collision-free chat room naming
- **Lerp for remote avatars**: Smooth interpolation (`pos += (target - pos) * 0.15`) avoids jittery movement
- **Throttled emit (50ms)**: Prevents socket flooding on keyboard hold

---

## 📌 Conclusion

Virtual Cosmos demonstrates real-time multiplayer interaction, proximity-based chat, and smooth 2D rendering in a browser-based environment using the MERN stack and Socket.IO.


