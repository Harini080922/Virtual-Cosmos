// ── Office Map Layout ─────────────────────────────────────────────────────────
// All coordinates are in world pixels (1400 x 900 canvas)

export const WORLD_WIDTH = 1400;
export const WORLD_HEIGHT = 900;
export const TILE = 40; // base tile size

// Floor regions: { x, y, w, h, color, label? }
export const ROOMS = [
  // Main open area (lobby/lounge)
  {
    id: "lobby",
    label: null,
    x: 0, y: 0, w: WORLD_WIDTH, h: WORLD_HEIGHT,
    floor: 0x1a1a2e,   // dark base
  },
  // Room 1 - top left meeting room
  {
    id: "room1",
    label: "Room 1",
    x: 40, y: 40, w: 340, h: 260,
    floor: 0x16213e,
    border: 0x2a2a6e,
    carpet: 0x0f3460,
  },
  // Room 2 - top right meeting room
  {
    id: "room2",
    label: "Room 2",
    x: 1020, y: 40, w: 340, h: 260,
    floor: 0x16213e,
    border: 0x2a2a6e,
    carpet: 0x0f3460,
  },
  // Office area - bottom left
  {
    id: "office",
    label: "Office",
    x: 40, y: 580, w: 380, h: 280,
    floor: 0x12122a,
    border: 0x2a2a6e,
    carpet: 0x1a1a3e,
  },
  // Chill zone - bottom right
  {
    id: "chill",
    label: "Chill Zone",
    x: 980, y: 580, w: 380, h: 280,
    floor: 0x12122a,
    border: 0x1a3a2a,
    carpet: 0x0a2a1a,
  },
];

// Furniture items: { type, x, y, w, h, color, accent }
export const FURNITURE = [
  // ── Room 1 furniture ──────────────────────────────────────────────────────
  // Big meeting table
  { type: "table-round", x: 180, y: 155, r: 60, color: 0x4a3728, accent: 0x6b5240 },
  // Chairs around table
  { type: "chair", x: 180, y: 80,  color: 0x2d5a8e },
  { type: "chair", x: 260, y: 110, color: 0x2d5a8e },
  { type: "chair", x: 280, y: 190, color: 0x2d5a8e },
  { type: "chair", x: 200, y: 240, color: 0x2d5a8e },
  { type: "chair", x: 110, y: 230, color: 0x2d5a8e },
  { type: "chair", x: 80,  y: 160, color: 0x2d5a8e },
  { type: "chair", x: 100, y: 90,  color: 0x2d5a8e },

  // ── Room 2 furniture ──────────────────────────────────────────────────────
  { type: "table-round", x: 1190, y: 155, r: 60, color: 0x4a3728, accent: 0x6b5240 },
  { type: "chair", x: 1190, y: 80,  color: 0x2d5a8e },
  { type: "chair", x: 1270, y: 110, color: 0x2d5a8e },
  { type: "chair", x: 1290, y: 190, color: 0x2d5a8e },
  { type: "chair", x: 1210, y: 240, color: 0x2d5a8e },
  { type: "chair", x: 1120, y: 230, color: 0x2d5a8e },
  { type: "chair", x: 1090, y: 160, color: 0x2d5a8e },
  { type: "chair", x: 1110, y: 90,  color: 0x2d5a8e },

  // ── Main area - center lounge ─────────────────────────────────────────────
  // Long couch top
  { type: "couch-h", x: 480, y: 80, w: 200, h: 44, color: 0x7c3aed, accent: 0x5b21b6 },
  // Coffee table
  { type: "table-rect", x: 540, y: 150, w: 90, h: 50, color: 0x4a3728, accent: 0x6b5240 },
  // Couch bottom facing
  { type: "couch-h", x: 480, y: 210, w: 200, h: 44, color: 0x7c3aed, accent: 0x5b21b6 },
  // Left couch
  { type: "couch-v", x: 460, y: 100, w: 44, h: 120, color: 0x7c3aed, accent: 0x5b21b6 },
  // Right couch
  { type: "couch-v", x: 700, y: 100, w: 44, h: 120, color: 0x7c3aed, accent: 0x5b21b6 },

  // Center area - desks cluster
  { type: "desk", x: 540, y: 380, w: 110, h: 60, color: 0x4a3728, accent: 0x6b5240 },
  { type: "desk", x: 700, y: 380, w: 110, h: 60, color: 0x4a3728, accent: 0x6b5240 },
  { type: "desk", x: 860, y: 380, w: 110, h: 60, color: 0x4a3728, accent: 0x6b5240 },
  { type: "monitor", x: 570, y: 390, color: 0x1a1a3e },
  { type: "monitor", x: 730, y: 390, color: 0x1a1a3e },
  { type: "monitor", x: 890, y: 390, color: 0x1a1a3e },
  { type: "chair", x: 580, y: 460, color: 0x374151 },
  { type: "chair", x: 740, y: 460, color: 0x374151 },
  { type: "chair", x: 900, y: 460, color: 0x374151 },

  // ── Office area desks ─────────────────────────────────────────────────────
  { type: "desk", x: 80,  y: 620, w: 110, h: 55, color: 0x4a3728, accent: 0x6b5240 },
  { type: "desk", x: 240, y: 620, w: 110, h: 55, color: 0x4a3728, accent: 0x6b5240 },
  { type: "desk", x: 80,  y: 740, w: 110, h: 55, color: 0x4a3728, accent: 0x6b5240 },
  { type: "desk", x: 240, y: 740, w: 110, h: 55, color: 0x4a3728, accent: 0x6b5240 },
  { type: "monitor", x: 110, y: 628, color: 0x1a1a3e },
  { type: "monitor", x: 270, y: 628, color: 0x1a1a3e },
  { type: "monitor", x: 110, y: 748, color: 0x1a1a3e },
  { type: "monitor", x: 270, y: 748, color: 0x1a1a3e },
  { type: "chair", x: 120, y: 694, color: 0x374151 },
  { type: "chair", x: 280, y: 694, color: 0x374151 },
  { type: "chair", x: 120, y: 814, color: 0x374151 },
  { type: "chair", x: 280, y: 814, color: 0x374151 },

  // ── Chill zone ────────────────────────────────────────────────────────────
  { type: "couch-h", x: 1010, y: 630, w: 180, h: 44, color: 0x10b981, accent: 0x059669 },
  { type: "table-rect", x: 1060, y: 690, w: 80, h: 45, color: 0x4a3728, accent: 0x6b5240 },
  { type: "couch-h", x: 1010, y: 750, w: 180, h: 44, color: 0x10b981, accent: 0x059669 },
  { type: "plant", x: 1310, y: 620, r: 18, color: 0x10b981 },
  { type: "plant", x: 1310, y: 820, r: 18, color: 0x10b981 },

  // ── Plants / decor around edges ───────────────────────────────────────────
  { type: "plant", x: 40,   y: 320, r: 18, color: 0x10b981 },
  { type: "plant", x: 1360, y: 320, r: 18, color: 0x10b981 },
  { type: "plant", x: 700,  y: 560, r: 15, color: 0x10b981 },
  { type: "plant", x: 400,  y: 40,  r: 15, color: 0x10b981 },
  { type: "plant", x: 1000, y: 40,  r: 15, color: 0x10b981 },

  // Whiteboard in rooms
  { type: "whiteboard", x: 55,   y: 55,  w: 100, h: 55, color: 0xf1f5f9 },
  { type: "whiteboard", x: 1245, y: 55,  w: 100, h: 55, color: 0xf1f5f9 },

  // Water cooler
  { type: "cooler", x: 420, y: 580, color: 0x06b6d4 },
  { type: "cooler", x: 970, y: 580, color: 0x06b6d4 },
];

// Walkable spawn points (safe areas away from furniture)
export const SPAWN_POINTS = [
  { x: 700, y: 280 },
  { x: 600, y: 500 },
  { x: 800, y: 500 },
  { x: 500, y: 280 },
  { x: 900, y: 280 },
  { x: 700, y: 700 },
];
