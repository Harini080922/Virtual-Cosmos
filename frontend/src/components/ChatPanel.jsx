import React, { useState, useRef, useEffect, useCallback } from "react";
import { getAvatarConfig } from "../utils/avatarConfig";

const TYPING_TIMEOUT = 2500; 

export default function ChatPanel({
  connections, messages, onSendMessage,
  mySocketId, myUsername,
  typingUsers = {},          
  onTyping,                  
}) {
  const [input, setInput]       = useState("");
  const [activeTab, setActiveTab] = useState(null);
  const messagesEndRef           = useRef(null);

  useEffect(() => {
    if (connections.length === 0) { setActiveTab(null); return; }
    const stillValid = connections.some((c) => c.roomId === activeTab);
    if (!stillValid) setActiveTab(connections[0].roomId);
  }, [connections]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  const send = () => {
    const trimmed = input.trim();
    if (!trimmed || !activeTab) return;
    onSendMessage(activeTab, trimmed);
    setInput("");
  };

  //  IMPROVEMENT — emit typing event on each keystroke (throttled in App)
  const handleInput = (e) => {
    setInput(e.target.value);
    if (activeTab && onTyping) onTyping(activeTab);
  };

  const activeMessages   = messages.filter((m) => m.roomId === activeTab);
  const activeConnection = connections.find((c) => c.roomId === activeTab);
  //  IMPROVEMENT — show who is typing in the active tab
  const whoIsTyping      = (typingUsers[activeTab] || []).filter((u) => u !== myUsername);
  const isOpen           = connections.length > 0;

  return (
    <div
      className="flex flex-col h-full transition-all duration-300"
      style={{
        background:  "rgba(10,10,20,0.95)",
        borderLeft:  "1px solid rgba(42,42,69,0.8)",
        backdropFilter: "blur(20px)",
        width:    isOpen ? "320px" : "64px",
        minWidth: isOpen ? "320px" : "64px",
        flexShrink: 0,
      }}
    >
      {!isOpen ? (
        <div className="flex flex-col items-center pt-6 gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(42,42,69,0.5)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="text-xs font-medium"
            style={{ color:"#475569", writingMode:"vertical-rl", textOrientation:"mixed", fontFamily:"DM Sans,sans-serif" }}>
            No connections
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-2 flex-shrink-0"
            style={{ borderBottom:"1px solid rgba(42,42,69,0.6)" }}>
            <div className="w-2 h-2 rounded-full"
              style={{ background:"#10b981", boxShadow:"0 0 6px #10b981" }} />
            <span className="text-sm font-semibold"
              style={{ fontFamily:"Syne,sans-serif", color:"#e2e8f0" }}>Nearby Chat</span>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background:"rgba(124,58,237,0.2)", color:"#a855f7" }}>
              {connections.length}
            </span>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-3 py-2 overflow-x-auto flex-shrink-0"
            style={{ borderBottom:"1px solid rgba(42,42,69,0.4)" }}>
            {connections.map((conn) => {
              const config   = getAvatarConfig(conn.avatar ?? 0);
              const isActive = activeTab === conn.roomId;
              // IMPROVEMENT — dot on tab if someone is typing there
              const hasTyping = (typingUsers[conn.roomId] || []).filter(u => u !== myUsername).length > 0;
              return (
                <button key={conn.roomId} onClick={() => setActiveTab(conn.roomId)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all duration-150 relative"
                  style={{
                    background: isActive ? "rgba(124,58,237,0.25)" : "rgba(42,42,69,0.3)",
                    border:     isActive ? "1px solid rgba(124,58,237,0.5)" : "1px solid transparent",
                    color:      isActive ? "#a855f7" : "#64748b",
                    fontFamily: "DM Sans,sans-serif", fontWeight:"500",
                  }}>
                  <svg width="12" height="12" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill={config.body} />
                    <circle cx="18" cy="14" r="8" fill={config.face} opacity="0.9" />
                  </svg>
                  {conn.username}
                  {/*  typing dot on inactive tab */}
                  {hasTyping && !isActive && (
                    <span style={{
                      width:6, height:6, borderRadius:"50%",
                      background:"#10b981", display:"inline-block", flexShrink:0,
                    }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2 min-h-0">
            {activeMessages.length === 0 && whoIsTyping.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 opacity-60">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <p className="text-xs text-center" style={{ color:"#475569", fontFamily:"DM Sans" }}>
                  Say hello to <span style={{ color:"#a855f7" }}>{activeConnection?.username}</span>!
                </p>
              </div>
            ) : (
              <>
                {activeMessages.map((msg) => {
                  const isMe   = msg.senderId === mySocketId;
                  const config = getAvatarConfig(msg.avatar ?? 0);
                  return (
                    <div key={msg.id}
                      className={`flex gap-2 chat-msg-enter ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                      <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                        style={{ background: config.body }}>
                        <svg width="14" height="14" viewBox="0 0 36 36">
                          <circle cx="18" cy="14" r="8" fill={config.face} opacity="0.9" />
                          <ellipse cx="18" cy="28" rx="10" ry="6" fill={config.face} opacity="0.7" />
                        </svg>
                      </div>
                      <div className={`flex flex-col gap-0.5 max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                        <span className="text-xs font-medium px-1"
                          style={{ color: isMe ? "#a855f7" : "#64748b", fontFamily:"DM Sans" }}>
                          {isMe ? "You" : msg.username}
                        </span>
                        <div className="px-3 py-2 text-sm leading-relaxed break-words"
                          style={{
                            background: isMe ? "rgba(124,58,237,0.3)" : "rgba(42,42,69,0.6)",
                            border:     isMe ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(42,42,69,0.8)",
                            color: "#e2e8f0", fontFamily:"DM Sans",
                            borderRadius: isMe ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                          }}>
                          {msg.message}
                        </div>
                        <span className="text-xs px-1" style={{ color:"#334155", fontFamily:"JetBrains Mono" }}>
                          {new Date(msg.timestamp).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/*  IMPROVEMENT — typing indicator bubble */}
                {whoIsTyping.length > 0 && (
                  <div className="flex gap-2 items-center chat-msg-enter">
                    <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                      style={{ background: "rgba(42,42,69,0.6)" }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs px-1" style={{ color:"#64748b", fontFamily:"DM Sans" }}>
                        {whoIsTyping.join(", ")}
                      </span>
                      <div className="px-3 py-2 rounded-2xl flex items-center gap-1"
                        style={{
                          background: "rgba(42,42,69,0.6)",
                          border: "1px solid rgba(42,42,69,0.8)",
                          borderRadius: "4px 16px 16px 16px",
                        }}>
                        {[0,1,2].map(i => (
                          <span key={i} style={{
                            width:6, height:6, borderRadius:"50%", background:"#64748b",
                            display:"inline-block",
                            animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite`,
                          }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 flex gap-2 items-end flex-shrink-0"
            style={{ borderTop:"1px solid rgba(42,42,69,0.4)" }}>
            <textarea
              value={input}
              onChange={handleInput}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
              }}
              placeholder={activeConnection ? `Message ${activeConnection.username}…` : "Type a message…"}
              rows={1}
              className="flex-1 resize-none px-3 py-2 rounded-xl text-sm outline-none transition-all duration-200"
              style={{
                background:"rgba(26,26,46,0.8)", border:"1px solid rgba(42,42,69,0.6)",
                color:"#e2e8f0", fontFamily:"DM Sans", lineHeight:"1.5", maxHeight:"80px",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.5)")}
              onBlur={(e)  => (e.target.style.borderColor = "rgba(42,42,69,0.6)")}
            />
            <button onClick={send} disabled={!input.trim()}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150"
              style={{
                background: input.trim() ? "linear-gradient(135deg,#7c3aed,#06b6d4)" : "rgba(42,42,69,0.5)",
                cursor: input.trim() ? "pointer" : "not-allowed",
              }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </>
      )}

      {/*  bounce keyframe injected inline so no external CSS needed */}
      <style>{`
        @keyframes bounce {
          0%,80%,100%{transform:translateY(0)}
          40%{transform:translateY(-5px)}
        }
      `}</style>
    </div>
  );
}