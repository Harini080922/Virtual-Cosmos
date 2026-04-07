import React from "react";
import { getAvatarConfig } from "../utils/avatarConfig";

export default function ProximityToast({ notifications }) {
  if (notifications.length === 0) return null;

  return (
    <div className="flex flex-col gap-2" style={{ minWidth: "260px" }}>
      {notifications.map((notif) => {
        const config     = getAvatarConfig(notif.avatar ?? 0);
        const isConnect  = notif.type === "connect";
        return (
          <div
            key={notif.id}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl animate-slide-up"
            style={{
              background: isConnect
                ? "rgba(16,185,129,0.15)"
                : "rgba(239,68,68,0.12)",
              border: isConnect
                ? "1px solid rgba(16,185,129,0.4)"
                : "1px solid rgba(239,68,68,0.3)",
              backdropFilter: "blur(20px)",
              boxShadow: isConnect
                ? "0 8px 32px rgba(16,185,129,0.15)"
                : "0 8px 32px rgba(239,68,68,0.1)",
            }}
          >
            {/* Mini avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: config.body }}
            >
              <svg width="14" height="14" viewBox="0 0 36 36">
                <circle cx="18" cy="14" r="8" fill={config.face} opacity="0.9" />
                <ellipse cx="18" cy="28" rx="10" ry="6" fill={config.face} opacity="0.7" />
              </svg>
            </div>

            <div className="flex flex-col">
              <span
                className="text-xs font-semibold"
                style={{
                  color:      isConnect ? "#10b981" : "#ef4444",
                  fontFamily: "Syne, sans-serif",
                }}
              >
                {isConnect ? "✦ Connected" : "✦ Disconnected"}
              </span>
              <span
                className="text-xs"
                style={{ color: "#94a3b8", fontFamily: "DM Sans" }}
              >
                {isConnect ? "Now chatting with " : "Lost connection to "}
                <strong style={{ color: "#e2e8f0" }}>{notif.username}</strong>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}