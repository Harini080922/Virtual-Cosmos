import React, { useState } from "react";
import { AVATAR_CONFIGS } from "../utils/avatarConfig";

export default function JoinScreen({ onJoin }) {
  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [error, setError] = useState("");

  const handleJoin = () => {
    const trimmed = username.trim();
    if (!trimmed) {
      setError("Please enter your name");
      return;
    }
    if (trimmed.length > 20) {
      setError("Name must be 20 characters or less");
      return;
    }
    onJoin(trimmed, selectedAvatar);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleJoin();
  };

  return (
    <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-cosmos-bg">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 30% 50%, rgba(124,58,237,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(6,182,212,0.08) 0%, transparent 60%)",
          }}
        />
        {/* Floating orbs */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20 animate-float"
            style={{
              width: `${60 + i * 30}px`,
              height: `${60 + i * 30}px`,
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              background: i % 2 === 0 ? "#7c3aed" : "#06b6d4",
              filter: "blur(40px)",
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-md mx-4 animate-slide-up"
        style={{
          background: "rgba(18,18,31,0.9)",
          border: "1px solid rgba(124,58,237,0.3)",
          borderRadius: "24px",
          backdropFilter: "blur(20px)",
          boxShadow:
            "0 0 60px rgba(124,58,237,0.15), 0 32px 64px rgba(0,0,0,0.6)",
          padding: "48px 40px",
        }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                boxShadow: "0 0 20px rgba(124,58,237,0.5)",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
              </svg>
            </div>
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Virtual Cosmos
            </h1>
          </div>
          <p className="text-cosmos-muted text-sm leading-relaxed">
            Move around the cosmos. Come close to connect.
            <br />
            Drift apart to disconnect.
          </p>
        </div>

        {/* Username */}
        <div className="mb-6">
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "#a855f7" }}
          >
            Your Name
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError("");
            }}
            onKeyDown={handleKey}
            placeholder="Enter your name..."
            maxLength={20}
            autoFocus
            className="w-full px-4 py-3 rounded-xl text-cosmos-text placeholder-cosmos-muted outline-none transition-all duration-200"
            style={{
              background: "rgba(42,42,69,0.5)",
              border: "1px solid rgba(124,58,237,0.3)",
              fontFamily: "DM Sans, sans-serif",
              fontSize: "15px",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = "rgba(124,58,237,0.8)")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = "rgba(124,58,237,0.3)")
            }
          />
          {error && (
            <p className="mt-2 text-sm" style={{ color: "#ef4444" }}>
              {error}
            </p>
          )}
        </div>

        {/* Avatar Selection */}
        <div className="mb-8">
          <label
            className="block text-sm font-medium mb-3"
            style={{ color: "#a855f7" }}
          >
            Choose Avatar
          </label>
          <div className="grid grid-cols-4 gap-3">
            {AVATAR_CONFIGS.map((config, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedAvatar(idx)}
                className="relative flex flex-col items-center p-3 rounded-xl transition-all duration-200"
                style={{
                  background:
                    selectedAvatar === idx
                      ? "rgba(124,58,237,0.2)"
                      : "rgba(42,42,69,0.3)",
                  border:
                    selectedAvatar === idx
                      ? "2px solid rgba(124,58,237,0.8)"
                      : "2px solid transparent",
                  transform:
                    selectedAvatar === idx ? "scale(1.05)" : "scale(1)",
                }}
              >
                {/* Mini avatar preview */}
                <svg width="36" height="36" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill={config.body} />
                  <circle cx="18" cy="14" r="8" fill={config.face} opacity="0.9" />
                  <ellipse cx="18" cy="28" rx="10" ry="6" fill={config.face} opacity="0.7" />
                </svg>
                <span
                  className="text-xs mt-1 font-medium"
                  style={{ color: selectedAvatar === idx ? "#a855f7" : "#64748b" }}
                >
                  {config.name}
                </span>
                {selectedAvatar === idx && (
                  <div
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: "#7c3aed" }}
                  >
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="white">
                      <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Join button */}
        <button
          onClick={handleJoin}
          className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)",
            fontFamily: "Syne, sans-serif",
            fontSize: "16px",
            letterSpacing: "0.02em",
            boxShadow: "0 0 30px rgba(124,58,237,0.4)",
          }}
          onMouseEnter={(e) =>
            (e.target.style.boxShadow = "0 0 40px rgba(124,58,237,0.6)")
          }
          onMouseLeave={(e) =>
            (e.target.style.boxShadow = "0 0 30px rgba(124,58,237,0.4)")
          }
        >
          Enter Cosmos →
        </button>

        {/* Controls hint */}
        <p className="text-center text-xs mt-4" style={{ color: "#475569" }}>
          Use{" "}
          <kbd
            className="px-1.5 py-0.5 rounded text-xs"
            style={{
              background: "rgba(42,42,69,0.8)",
              border: "1px solid rgba(124,58,237,0.3)",
              color: "#a855f7",
            }}
          >
            WASD
          </kbd>{" "}
          or{" "}
          <kbd
            className="px-1.5 py-0.5 rounded text-xs"
            style={{
              background: "rgba(42,42,69,0.8)",
              border: "1px solid rgba(124,58,237,0.3)",
              color: "#a855f7",
            }}
          >
            ↑↓←→
          </kbd>{" "}
          to move · Click to teleport
        </p>
      </div>
    </div>
  );
}
