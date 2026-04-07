// Avatar color palettes - each avatar gets a unique look
export const AVATAR_CONFIGS = [
  { body: "#7c3aed", face: "#fbbf24", name: "Violet" },
  { body: "#06b6d4", face: "#f97316", name: "Cyan" },
  { body: "#10b981", face: "#a78bfa", name: "Emerald" },
  { body: "#f43f5e", face: "#34d399", name: "Rose" },
  { body: "#f59e0b", face: "#60a5fa", name: "Amber" },
  { body: "#3b82f6", face: "#fb7185", name: "Blue" },
  { body: "#8b5cf6", face: "#fcd34d", name: "Purple" },
  { body: "#14b8a6", face: "#f87171", name: "Teal" },
];

export const PROXIMITY_RADIUS = 120;

export function getAvatarConfig(index) {
  return AVATAR_CONFIGS[index % AVATAR_CONFIGS.length];
}

export function generateStars(count, width, height) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.5 + 0.3,
    alpha: Math.random() * 0.6 + 0.2,
  }));
}
