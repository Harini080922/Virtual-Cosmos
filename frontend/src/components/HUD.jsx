import React from "react";

export default function HUD({ userCount, connections, myUsername, isConnected }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5"
      style={{
        background: "rgba(10,10,20,0.9)",
        borderBottom: "1px solid rgba(42,42,69,0.6)",
        backdropFilter: "blur(20px)",
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83" />
          </svg>
        </div>
        <span
          className="text-sm font-bold tracking-tight"
          style={{ fontFamily: "Syne, sans-serif", color: "#e2e8f0" }}
        >
          Virtual Cosmos
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-4" style={{ background: "rgba(42,42,69,0.8)" }} />

      {/* Server status */}
      <div className="flex items-center gap-1.5">
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: isConnected ? "#10b981" : "#ef4444",
            boxShadow: isConnected ? "0 0 6px #10b981" : "0 0 6px #ef4444",
          }}
        />
        <span
          className="text-xs"
          style={{
            color: isConnected ? "#10b981" : "#ef4444",
            fontFamily: "JetBrains Mono",
          }}
        >
          {isConnected ? "LIVE" : "OFFLINE"}
        </span>
      </div>

      {/* Users online */}
      <div className="flex items-center gap-1.5">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <span
          className="text-xs font-medium"
          style={{ color: "#94a3b8", fontFamily: "JetBrains Mono" }}
        >
          {userCount} {userCount === 1 ? "explorer" : "explorers"}
        </span>
      </div>

      {/* Active connections */}
      {connections.length > 0 && (
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
          style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)" }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "#10b981", boxShadow: "0 0 6px #10b981" }}
          />
          <span
            className="text-xs font-medium"
            style={{ color: "#10b981", fontFamily: "JetBrains Mono" }}
          >
            {connections.length} connected
          </span>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* My name */}
      <div
        className="flex items-center gap-2 px-3 py-1 rounded-xl"
        style={{
          background: "rgba(124,58,237,0.12)",
          border: "1px solid rgba(124,58,237,0.25)",
        }}
      >
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "#a855f7" }}
        />
        <span
          className="text-xs font-medium"
          style={{ color: "#a855f7", fontFamily: "DM Sans" }}
        >
          {myUsername}
        </span>
      </div>

      {/* Controls hint */}
      <div
        className="hidden lg:flex items-center gap-1 text-xs"
        style={{ color: "#334155", fontFamily: "JetBrains Mono" }}
      >
        <kbd
          className="px-1.5 py-0.5 rounded text-xs"
          style={{
            background: "rgba(42,42,69,0.6)",
            border: "1px solid rgba(42,42,69,1)",
            color: "#64748b",
          }}
        >
          WASD
        </kbd>
        <span>/ click to move</span>
      </div>
    </div>
  );
}
