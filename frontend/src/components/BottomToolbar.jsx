import React, { useState } from "react";

const tools = [
  {
    id: "share",
    label: "Share",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
        <polyline points="16 6 12 2 8 6"/>
        <line x1="12" y1="2" x2="12" y2="15"/>
      </svg>
    ),
  },
  {
    id: "invite",
    label: "Invite",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <line x1="19" y1="8" x2="19" y2="14"/>
        <line x1="22" y1="11" x2="16" y2="11"/>
      </svg>
    ),
  },
  {
    id: "move",
    label: "Move",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polyline points="5 9 2 12 5 15"/>
        <polyline points="9 5 12 2 15 5"/>
        <polyline points="15 19 12 22 9 19"/>
        <polyline points="19 9 22 12 19 15"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <line x1="12" y1="2" x2="12" y2="22"/>
      </svg>
    ),
  },
  {
    id: "hand",
    label: "Hand",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/>
        <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/>
        <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/>
        <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
      </svg>
    ),
  },
  {
    id: "react",
    label: "React",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
        <line x1="9" y1="9" x2="9.01" y2="9"/>
        <line x1="15" y1="9" x2="15.01" y2="9"/>
      </svg>
    ),
  },
  {
    id: "action",
    label: "Action",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
  },
];

// Emoji picker options for React tool
const EMOJIS = ["👋", "❤️", "😂", "🎉", "👍", "🔥", "✨", "😮"];

export default function BottomToolbar({ onLeave, onToolChange, activeTool, onEmoji }) {
  // FIX: Share and Invite both have distinct behaviours now
  const [showShareModal, setShowShareModal]   = useState(false);
  const [showInviteToast, setShowInviteToast] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleTool = (id) => {
    // ── Share: show a share sheet modal ────────────────────────────────────
    if (id === "share") {
      setShowShareModal((v) => !v);
      setShowEmojiPicker(false);
      return;
    }
    // ── Invite: copy link to clipboard ─────────────────────────────────────
    if (id === "invite") {
      navigator.clipboard?.writeText(window.location.href).catch(() => {});
      setShowInviteToast(true);
      setTimeout(() => setShowInviteToast(false), 2500);
      return;
    }
    // ── React: toggle emoji picker ─────────────────────────────────────────
    if (id === "react") {
      setShowEmojiPicker((v) => !v);
      setShowShareModal(false);
      onToolChange("react");
      return;
    }
    // ── All other tools: pass to canvas ───────────────────────────────────
    setShowEmojiPicker(false);
    setShowShareModal(false);
    onToolChange(id);
  };

  const handleEmojiClick = (emoji) => {
    onEmoji?.(emoji);
    setShowEmojiPicker(false);
    // Return to move tool after reacting
    onToolChange("move");
  };

  const toolHint = {
    move:   "WASD or click to move",
    hand:   "Click + drag to pan the map",
    react:  "Pick an emoji to react",
    action: "Click to wave!",
  }[activeTool] || "WASD / click to move";

  return (
    <>
      {/* ── Share Modal ──────────────────────────────────────────────────── */}
      {showShareModal && (
        <div
          className="absolute bottom-20 left-6 z-50 animate-slide-up"
          style={{
            background: "rgba(18,18,31,0.97)",
            border: "1px solid rgba(124,58,237,0.4)",
            borderRadius: "16px",
            backdropFilter: "blur(20px)",
            padding: "16px 20px",
            minWidth: "260px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          <p className="text-xs font-semibold mb-3" style={{ color: "#a855f7", fontFamily: "Syne" }}>
            Share this cosmos
          </p>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3 text-xs"
            style={{
              background: "rgba(42,42,69,0.6)",
              border: "1px solid rgba(42,42,69,0.8)",
              color: "#94a3b8",
              fontFamily: "JetBrains Mono",
              wordBreak: "break-all",
            }}
          >
            {window.location.href}
          </div>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href).catch(() => {});
              setShowShareModal(false);
              setShowInviteToast(true);
              setTimeout(() => setShowInviteToast(false), 2500);
            }}
            className="w-full py-2 rounded-xl text-xs font-semibold transition-all duration-150"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
              color: "white",
              fontFamily: "DM Sans",
            }}
          >
            Copy Link
          </button>
        </div>
      )}

      {/* ── Invite Toast ─────────────────────────────────────────────────── */}
      {showInviteToast && (
        <div
          className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm font-medium animate-slide-up pointer-events-none z-50"
          style={{
            background: "rgba(16,185,129,0.15)",
            border: "1px solid rgba(16,185,129,0.4)",
            color: "#10b981",
            fontFamily: "DM Sans",
            backdropFilter: "blur(10px)",
          }}
        >
          ✓ Link copied to clipboard!
        </div>
      )}

      {/* ── Emoji Picker ─────────────────────────────────────────────────── */}
      {showEmojiPicker && (
        <div
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 animate-slide-up"
          style={{
            background: "rgba(18,18,31,0.97)",
            border: "1px solid rgba(124,58,237,0.4)",
            borderRadius: "16px",
            backdropFilter: "blur(20px)",
            padding: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          <p className="text-xs text-center mb-2" style={{ color: "#64748b", fontFamily: "DM Sans" }}>
            React to everyone nearby
          </p>
          <div className="flex gap-2">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className="text-xl rounded-xl transition-all duration-100 flex items-center justify-center"
                style={{ width: 40, height: 40, background: "rgba(42,42,69,0.5)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124,58,237,0.3)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(42,42,69,0.5)")}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Main toolbar ─────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-6"
        style={{
          height: "60px",
          background: "rgba(10,10,20,0.95)",
          borderTop: "1px solid rgba(42,42,69,0.6)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Left – tool buttons */}
        <div className="flex items-center gap-1">
          {tools.map((tool) => {
            const isActive = activeTool === tool.id ||
              (tool.id === "react" && showEmojiPicker) ||
              (tool.id === "share" && showShareModal);
            return (
              <button
                key={tool.id}
                onClick={() => handleTool(tool.id)}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-150"
                style={{
                  color:      isActive ? "#a855f7" : "#64748b",
                  background: isActive ? "rgba(124,58,237,0.15)" : "transparent",
                  border:     isActive ? "1px solid rgba(124,58,237,0.3)" : "1px solid transparent",
                  minWidth:   "52px",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = "#94a3b8"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "#64748b"; }}
              >
                {tool.icon}
                <span style={{ fontSize: "10px", fontFamily: "DM Sans", fontWeight: "500" }}>
                  {tool.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Center – dynamic hint based on active tool */}
        <div
          className="hidden md:flex items-center gap-3 text-xs"
          style={{ color: "#334155", fontFamily: "JetBrains Mono" }}
        >
          <span>{toolHint}</span>
          {activeTool === "move" && (
            <>
              <span style={{ color: "#1e293b" }}>·</span>
              <span>approach others to chat</span>
            </>
          )}
        </div>

        {/* Right – leave */}
        <button
          onClick={onLeave}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150"
          style={{
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#ef4444",
            fontFamily: "DM Sans",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.2)";
            e.currentTarget.style.borderColor = "rgba(239,68,68,0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.12)";
            e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Leave
        </button>
      </div>
    </>
  );
}