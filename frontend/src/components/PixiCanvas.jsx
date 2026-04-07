import React, { useEffect, useRef, useCallback } from "react";
import * as PIXI from "pixi.js";
import { getAvatarConfig, PROXIMITY_RADIUS } from "../utils/avatarConfig";

const CANVAS_WIDTH  = 1200;
const CANVAS_HEIGHT = 750;
const MOVE_SPEED    = 3;
const AVATAR_RADIUS = 20;

const FLOOR_COLOR  = 0xd4b896;
const FLOOR_COLOR2 = 0xc9a882;
const WALL_COLOR   = 0x8b6f47;
const WALL_DARK    = 0x6b5237;
const ROOM_FLOOR   = 0xc8a97e;
const CARPET_COLOR = 0x7b9db5;
const CARPET2      = 0x6a8fa8;
const BORDER_COLOR = 0x5a4530;

const ROOMS = [
  { x: 40,  y: 40,  w: 340, h: 280, label: "Room 1",     carpet: true  },
  { x: 420, y: 40,  w: 340, h: 280, label: "Room 2",     carpet: true  },
  { x: 800, y: 40,  w: 360, h: 280, label: "Room 3",     carpet: false },
  { x: 40,  y: 420, w: 520, h: 290, label: "Lounge",     carpet: false },
  { x: 600, y: 420, w: 560, h: 290, label: "Open Space", carpet: false },
];

const FURNITURE = [
  { type: "table_rect", x: 100, y: 130, w: 180, h: 90, color: 0x8b5e3c },
  { type: "chair", x: 100, y: 114, color: 0x4a3728 }, { type: "chair", x: 155, y: 114, color: 0x4a3728 },
  { type: "chair", x: 210, y: 114, color: 0x4a3728 }, { type: "chair", x: 100, y: 228, color: 0x4a3728 },
  { type: "chair", x: 155, y: 228, color: 0x4a3728 }, { type: "chair", x: 210, y: 228, color: 0x4a3728 },
  { type: "plant", x: 300, y: 265 },
  { type: "desk", x: 455, y: 85,  color: 0x9b6b4a }, { type: "desk", x: 565, y: 85,  color: 0x9b6b4a },
  { type: "desk", x: 455, y: 175, color: 0x9b6b4a }, { type: "desk", x: 565, y: 175, color: 0x9b6b4a },
  { type: "monitor", x: 462, y: 90  }, { type: "monitor", x: 572, y: 90  },
  { type: "monitor", x: 462, y: 180 }, { type: "monitor", x: 572, y: 180 },
  { type: "plant", x: 720, y: 70  },
  { type: "sofa", x: 830, y: 75, w: 200, color: 0x4a6fa5 },
  { type: "coffee_table", x: 885, y: 185 }, { type: "plant", x: 1105, y: 55 }, { type: "plant", x: 820, y: 265 },
  { type: "sofa", x: 70, y: 475, w: 150, color: 0x7b6b4a },
  { type: "sofa_side", x: 238, y: 475, h: 150, color: 0x7b6b4a },
  { type: "coffee_table", x: 160, y: 545 }, { type: "tv", x: 385, y: 455 },
  { type: "plant", x: 65, y: 670 }, { type: "plant", x: 520, y: 670 },
  { type: "desk", x: 630, y: 460, color: 0x9b6b4a }, { type: "desk", x: 740, y: 460, color: 0x9b6b4a },
  { type: "desk", x: 850, y: 460, color: 0x9b6b4a }, { type: "desk", x: 630, y: 560, color: 0x9b6b4a },
  { type: "desk", x: 740, y: 560, color: 0x9b6b4a }, { type: "desk", x: 850, y: 560, color: 0x9b6b4a },
  { type: "monitor", x: 637, y: 465 }, { type: "monitor", x: 747, y: 465 }, { type: "monitor", x: 857, y: 465 },
  { type: "monitor", x: 637, y: 565 }, { type: "monitor", x: 747, y: 565 }, { type: "monitor", x: 857, y: 565 },
  { type: "plant", x: 1108, y: 675 }, { type: "plant", x: 610, y: 675 },
];

export default function PixiCanvas({ users, mySocketId, onMove, activeTool, onEmojiSpawn }) {
  const containerRef    = useRef(null);
  const appRef          = useRef(null);
  const worldRef        = useRef(null);
  const userSpritesRef  = useRef(new Map());
  const keysRef         = useRef({});
  const myPosRef        = useRef({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 });
  const animFrameRef    = useRef(null);
  const mySocketIdRef   = useRef(mySocketId);
  const activeToolRef   = useRef(activeTool);

  // Hand-pan state
  const isPanningRef    = useRef(false);
  const panStartRef     = useRef({ x: 0, y: 0 });
  const worldStartRef   = useRef({ x: 0, y: 0 });

  // Floating emoji particles: [{ id, emoji, x, y, alpha, vy }]
  const emojiParticlesRef = useRef([]);
  let emojiIdCounter = 0;

  // Wave/jump animation state per sprite: { waving: bool, frame: number }
  const waveStateRef = useRef({});

  useEffect(() => { mySocketIdRef.current = mySocketId; }, [mySocketId]);
  useEffect(() => { activeToolRef.current = activeTool; }, [activeTool]);

  // ── Public: spawn an emoji above the local avatar ─────────────────────────
  // Called from App when user picks from emoji picker
  useEffect(() => {
    if (!onEmojiSpawn) return;
    // onEmojiSpawn is called imperatively from App via a ref, not a prop change
  }, [onEmojiSpawn]);

  // ── Init Pixi ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    const app = new PIXI.Application({
      width:           containerRef.current.clientWidth,
      height:          containerRef.current.clientHeight,
      backgroundColor: 0x2d2416,
      antialias:       true,
      resolution:      window.devicePixelRatio || 1,
      autoDensity:     true,
    });
    containerRef.current.appendChild(app.view);
    appRef.current = app;

    const world = new PIXI.Container();
    app.stage.addChild(world);
    worldRef.current = world;

    const mapContainer = new PIXI.Container();
    drawOfficeMap(mapContainer);
    world.addChild(mapContainer);

    const avatarLayer = new PIXI.Container();
    avatarLayer.name = "avatarLayer";
    world.addChild(avatarLayer);

    // ── TOOL: HAND — drag to pan ──────────────────────────────────────────
    app.stage.interactive = true;
    app.stage.hitArea = app.screen;

    app.stage.on("pointerdown", (e) => {
      const tool = activeToolRef.current;

      if (tool === "hand") {
        // Start pan drag
        isPanningRef.current = true;
        panStartRef.current  = { x: e.global.x, y: e.global.y };
        worldStartRef.current = { x: world.x, y: world.y };
        app.view.style.cursor = "grabbing";
        return;
      }

      if (tool === "move") {
        // Teleport (convert screen → world coords)
        const wx = e.global.x - world.x;
        const wy = e.global.y - world.y;
        const nx = Math.max(30, Math.min(CANVAS_WIDTH  - 30, wx));
        const ny = Math.max(30, Math.min(CANVAS_HEIGHT - 30, wy));
        myPosRef.current = { x: nx, y: ny };
        const sid = mySocketIdRef.current;
        if (sid) {
          const s = userSpritesRef.current.get(sid);
          if (s) { s.container.x = nx; s.container.y = ny; }
        }
        onMove(nx, ny);
        return;
      }

      // ── TOOL: ACTION — wave animation on click ────────────────────────
      if (tool === "action") {
        const sid = mySocketIdRef.current;
        if (sid) {
          waveStateRef.current[sid] = { waving: true, frame: 0 };
        }
        return;
      }
    });

    app.stage.on("pointermove", (e) => {
      if (!isPanningRef.current) return;
      const dx = e.global.x - panStartRef.current.x;
      const dy = e.global.y - panStartRef.current.y;
      const screenW = app.renderer.width  / (window.devicePixelRatio || 1);
      const screenH = app.renderer.height / (window.devicePixelRatio || 1);
      world.x = Math.min(0, Math.max(screenW - CANVAS_WIDTH,  worldStartRef.current.x + dx));
      world.y = Math.min(0, Math.max(screenH - CANVAS_HEIGHT, worldStartRef.current.y + dy));
    });

    app.stage.on("pointerup", () => {
      if (isPanningRef.current) {
        isPanningRef.current = false;
        app.view.style.cursor = activeToolRef.current === "hand" ? "grab" : "crosshair";
      }
    });
    app.stage.on("pointerupoutside", () => { isPanningRef.current = false; });

    // ── Emoji container (above avatarLayer) ──────────────────────────────
    const emojiLayer = new PIXI.Container();
    emojiLayer.name = "emojiLayer";
    world.addChild(emojiLayer);

    // ── Ticker: lerp + camera + bob + wave + emoji particles ─────────────
    const ticker = new PIXI.Ticker();
    ticker.add(() => {
      const sid     = mySocketIdRef.current;
      const tool    = activeToolRef.current;
      const screenW = app.renderer.width  / (window.devicePixelRatio || 1);
      const screenH = app.renderer.height / (window.devicePixelRatio || 1);

      userSpritesRef.current.forEach((sprite, id) => {
        // Lerp remote avatars
        if (id !== sid && sprite.targetX !== undefined) {
          sprite.container.x += (sprite.targetX - sprite.container.x) * 0.12;
          sprite.container.y += (sprite.targetY - sprite.container.y) * 0.12;
        }

        // Bob while moving
        if (sprite.body) {
          const k = keysRef.current;
          const moving = id === sid
            ? (k["ArrowUp"]||k["w"]||k["W"]||k["ArrowDown"]||k["s"]||k["S"]||
               k["ArrowLeft"]||k["a"]||k["A"]||k["ArrowRight"]||k["d"]||k["D"])
            : (Math.abs((sprite.targetX??0) - sprite.container.x) > 1 ||
               Math.abs((sprite.targetY??0) - sprite.container.y) > 1);
          sprite.body.y = moving ? Math.sin(Date.now() / 120) * 2.5 : 0;
        }

        // ── TOOL: ACTION — wave/jump animation ───────────────────────────
        const ws = waveStateRef.current[id];
        if (ws?.waving && sprite.body) {
          ws.frame++;
          // Jump arc: up then down over 30 frames
          const progress = ws.frame / 30;
          if (progress <= 1) {
            sprite.body.y = -Math.sin(progress * Math.PI) * 18;
          } else {
            sprite.body.y = 0;
            ws.waving = false;
          }
        }
      });

      // Camera follow (only in move mode — in hand mode user controls manually)
      if (tool === "move" && sid) {
        const me = userSpritesRef.current.get(sid);
        if (me) {
          const tX = screenW / 2 - me.container.x;
          const tY = screenH / 2 - me.container.y;
          const cX = Math.min(0, Math.max(screenW  - CANVAS_WIDTH,  tX));
          const cY = Math.min(0, Math.max(screenH - CANVAS_HEIGHT, tY));
          world.x += (cX - world.x) * 0.1;
          world.y += (cY - world.y) * 0.1;
        }
      }

      // ── TOOL: REACT — animate floating emoji particles ────────────────
      const emojiLayer = world.getChildByName("emojiLayer");
      if (emojiLayer) {
        emojiParticlesRef.current = emojiParticlesRef.current.filter((p) => {
          p.vy -= 0.15;             // float upward
          p.y  += p.vy;
          p.alpha -= 0.012;         // fade out
          if (p.sprite) {
            p.sprite.y     = p.y;
            p.sprite.alpha = Math.max(0, p.alpha);
          }
          if (p.alpha <= 0) {
            if (p.sprite) emojiLayer.removeChild(p.sprite);
            return false;
          }
          return true;
        });
      }
    });
    ticker.start();

    const handleResize = () => {
      if (!containerRef.current || !appRef.current) return;
      appRef.current.renderer.resize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      ticker.destroy();
      app.destroy(true, { children: true });
      appRef.current  = null;
      worldRef.current = null;
      userSpritesRef.current.clear();
      emojiParticlesRef.current = [];
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Update cursor on tool change ──────────────────────────────────────────
  useEffect(() => {
    const canvas = appRef.current?.view;
    if (!canvas) return;
    const cursors = {
      move:   "crosshair",
      hand:   "grab",
      react:  "pointer",
      action: "pointer",
    };
    canvas.style.cursor = cursors[activeTool] || "crosshair";
  }, [activeTool]);

  // ── TOOL: REACT — public method: spawn emoji above local avatar ───────────
  const spawnEmoji = useCallback((emoji) => {
    const world = worldRef.current;
    if (!world) return;
    const emojiLayer = world.getChildByName("emojiLayer");
    if (!emojiLayer) return;
    const sid = mySocketIdRef.current;
    if (!sid) return;
    const sprite = userSpritesRef.current.get(sid);
    if (!sprite) return;

    const text = new PIXI.Text(emoji, { fontSize: 28 });
    text.anchor.set(0.5, 1);
    text.x = sprite.container.x;
    text.y = sprite.container.y - 40;
    emojiLayer.addChild(text);

    emojiParticlesRef.current.push({
      id:     ++emojiIdCounter,
      emoji,
      x:      sprite.container.x,
      y:      sprite.container.y - 40,
      vy:     -1.5,
      alpha:  1,
      sprite: text,
    });
  }, []);

  // Expose spawnEmoji via ref so App can call it imperatively
  useEffect(() => {
    if (onEmojiSpawn) onEmojiSpawn(spawnEmoji);
  }, [spawnEmoji, onEmojiSpawn]);

  // ── Keyboard movement (TOOL: MOVE only) ───────────────────────────────────
  useEffect(() => {
    const down = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;
      // Only capture movement keys in move mode
      if (activeToolRef.current !== "move") return;
      keysRef.current[e.key] = true;
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) e.preventDefault();
    };
    const up = (e) => { keysRef.current[e.key] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup",   up);

    let lastEmit = 0;
    const loop = (ts) => {
      if (activeToolRef.current === "move") {
        const k = keysRef.current;
        let dx = 0, dy = 0;
        if (k["ArrowUp"]    || k["w"] || k["W"]) dy -= MOVE_SPEED;
        if (k["ArrowDown"]  || k["s"] || k["S"]) dy += MOVE_SPEED;
        if (k["ArrowLeft"]  || k["a"] || k["A"]) dx -= MOVE_SPEED;
        if (k["ArrowRight"] || k["d"] || k["D"]) dx += MOVE_SPEED;

        if (dx !== 0 || dy !== 0) {
          if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }
          const nx = Math.max(30, Math.min(CANVAS_WIDTH  - 30, myPosRef.current.x + dx));
          const ny = Math.max(30, Math.min(CANVAS_HEIGHT - 30, myPosRef.current.y + dy));
          myPosRef.current = { x: nx, y: ny };
          const sid = mySocketIdRef.current;
          if (sid) {
            const s = userSpritesRef.current.get(sid);
            if (s) {
              s.container.x = nx; s.container.y = ny;
              if (dx !== 0 && s.body) s.body.scale.x = dx < 0 ? -1 : 1;
            }
          }
          if (ts - lastEmit > 40) { onMove(nx, ny); lastEmit = ts; }
        }
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup",   up);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [onMove]);

  // ── Render / update user sprites ──────────────────────────────────────────
  useEffect(() => {
    const app   = appRef.current;
    const world = worldRef.current;
    if (!app || !world) return;
    const avatarLayer = world.getChildByName("avatarLayer");
    if (!avatarLayer) return;

    const existing = new Set(userSpritesRef.current.keys());

    users.forEach((user) => {
      const isMe        = mySocketId !== null && user.socketId === mySocketId;
      const config      = getAvatarConfig(user.avatar ?? 0);
      const isConnected = user.connections?.includes(mySocketId);

      if (!userSpritesRef.current.has(user.socketId)) {
        const container = new PIXI.Container();

        if (isMe) {
          const ring = new PIXI.Graphics();
          ring.lineStyle(1.5, 0x7c3aed, 0.4);
          ring.beginFill(0x7c3aed, 0.04);
          ring.drawCircle(0, 0, PROXIMITY_RADIUS);
          ring.endFill();
          container.addChild(ring);
        }

        const connRing = new PIXI.Graphics();
        container.addChild(connRing);

        const body = new PIXI.Container();
        const shadow = new PIXI.Graphics();
        shadow.beginFill(0x000000, 0.2); shadow.drawEllipse(0, 30, 18, 7); shadow.endFill();
        body.addChild(shadow);

        const bodyHex = parseInt(config.body.replace("#", ""), 16);
        const skinHex = parseInt(config.face.replace("#", ""), 16);

        const legs = new PIXI.Graphics();
        legs.beginFill(bodyHex); legs.drawRoundedRect(-10,14,8,16,3); legs.drawRoundedRect(2,14,8,16,3); legs.endFill();
        legs.beginFill(0x2d1f0e); legs.drawRoundedRect(-12,28,11,6,2); legs.drawRoundedRect(1,28,11,6,2); legs.endFill();
        body.addChild(legs);

        const torso = new PIXI.Graphics();
        torso.beginFill(bodyHex); torso.drawRoundedRect(-13,-2,26,18,5); torso.endFill();
        torso.beginFill(0xffffff,0.25); torso.drawRoundedRect(-4,-2,8,6,2); torso.endFill();
        body.addChild(torso);

        const arms = new PIXI.Graphics();
        arms.beginFill(bodyHex); arms.drawRoundedRect(-20,-2,8,14,3); arms.drawRoundedRect(12,-2,8,14,3); arms.endFill();
        arms.beginFill(skinHex); arms.drawCircle(-16,14,5); arms.drawCircle(16,14,5); arms.endFill();
        body.addChild(arms);

        const head = new PIXI.Graphics();
        head.beginFill(skinHex); head.drawRoundedRect(-13,-28,26,26,9); head.endFill();
        head.beginFill(0x2d1f0e); head.drawRoundedRect(-13,-28,26,11,7); head.endFill();
        head.beginFill(0x1a1a2e); head.drawCircle(-5,-16,3); head.drawCircle(5,-16,3); head.endFill();
        head.beginFill(0xffffff); head.drawCircle(-4,-17,1); head.drawCircle(6,-17,1); head.endFill();
        head.lineStyle(1.5,0x8b5e3c,0.8); head.arc(0,-10,5,0.2,Math.PI-0.2);
        body.addChild(head);

        const nameW = Math.max(user.username.length * 6.5 + 20, 40);
        const badge = new PIXI.Graphics();
        badge.beginFill(isMe ? 0x7c3aed : 0x12121f, 0.9);
        badge.drawRoundedRect(-nameW/2,-54,nameW,20,5); badge.endFill();
        body.addChild(badge);

        if (isMe) {
          const dot = new PIXI.Graphics();
          dot.beginFill(0xfbbf24); dot.drawCircle(nameW/2-10,-44,4); dot.endFill();
          body.addChild(dot);
        }

        const label = new PIXI.Text(user.username, { fontFamily:"DM Sans,sans-serif", fontSize:11, fill:0xffffff, fontWeight:"600" });
        label.anchor.set(0.5,0.5); label.y = -44;
        body.addChild(label);
        container.addChild(body);

        container.x = isMe ? myPosRef.current.x : user.x;
        container.y = isMe ? myPosRef.current.y : user.y;
        avatarLayer.addChild(container);
        userSpritesRef.current.set(user.socketId, { container, body, connRing, targetX:user.x, targetY:user.y });
      } else {
        const sprite = userSpritesRef.current.get(user.socketId);
        if (!isMe) {
          const prevX = sprite.targetX ?? user.x;
          if (sprite.body) {
            if (user.x < prevX - 0.5) sprite.body.scale.x = -1;
            else if (user.x > prevX + 0.5) sprite.body.scale.x = 1;
          }
          sprite.targetX = user.x;
          sprite.targetY = user.y;
        }
        sprite.connRing.clear();
        if (isConnected && !isMe) {
          sprite.connRing.lineStyle(3, 0x10b981, 0.9);
          sprite.connRing.drawCircle(0, 0, AVATAR_RADIUS + 8);
          sprite.connRing.lineStyle(7, 0x10b981, 0.15);
          sprite.connRing.drawCircle(0, 0, AVATAR_RADIUS + 13);
        }
      }
      existing.delete(user.socketId);
    });

    existing.forEach((sid) => {
      const s = userSpritesRef.current.get(sid);
      if (s) { avatarLayer.removeChild(s.container); s.container.destroy({ children:true }); }
      userSpritesRef.current.delete(sid);
    });
  }, [users, mySocketId]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{
        background: "#2d2416",
        cursor: activeTool === "hand" ? "grab"
              : activeTool === "react" || activeTool === "action" ? "pointer"
              : "crosshair",
      }}
    />
  );
}

// ── Map drawing ───────────────────────────────────────────────────────────────
function drawOfficeMap(container) {
  const g = new PIXI.Graphics();
  drawCheckerFloor(g, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 40, FLOOR_COLOR, FLOOR_COLOR2);
  ROOMS.forEach((room) => {
    const [fc,fc2] = room.carpet ? [CARPET_COLOR,CARPET2] : [ROOM_FLOOR,FLOOR_COLOR2];
    drawCheckerFloor(g, room.x+5, room.y+5, room.w-10, room.h-10, 40, fc, fc2);
    g.lineStyle(6, WALL_COLOR, 1); g.beginFill(0,0); g.drawRect(room.x,room.y,room.w,room.h); g.endFill();
    g.lineStyle(2, WALL_DARK, 0.4); g.drawRect(room.x+3,room.y+3,room.w-6,room.h-6);
  });
  container.addChild(g);
  ROOMS.forEach((room) => {
    const lw = room.label.length * 7.5 + 30;
    const pill = new PIXI.Graphics();
    pill.beginFill(0x12121f,0.8); pill.drawRoundedRect(0,0,lw,22,6); pill.endFill();
    pill.x = room.x+10; pill.y = room.y+10; container.addChild(pill);
    const icon = new PIXI.Graphics();
    icon.beginFill(0x7c3aed); icon.drawRoundedRect(0,0,10,8,2); icon.endFill();
    icon.beginFill(0x7c3aed); icon.drawPolygon([2,8,2,11,7,8]); icon.endFill();
    icon.x = room.x+16; icon.y = room.y+17; container.addChild(icon);
    const lbl = new PIXI.Text(room.label, { fontFamily:"DM Sans,sans-serif", fontSize:11, fill:0xd4c5b0, fontWeight:"700" });
    lbl.x = room.x+30; lbl.y = room.y+14; container.addChild(lbl);
  });
  const fg = new PIXI.Graphics();
  FURNITURE.forEach((f) => drawFurniture(fg, f));
  container.addChild(fg);
  const border = new PIXI.Graphics();
  border.lineStyle(8, BORDER_COLOR, 1); border.drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
  container.addChild(border);
}

function drawCheckerFloor(g, x, y, w, h, size, c1, c2) {
  const cols = Math.ceil(w/size), rows = Math.ceil(h/size);
  for (let r=0;r<rows;r++) for (let c=0;c<cols;c++) {
    g.beginFill((r+c)%2===0?c1:c2);
    const tx=x+c*size, ty=y+r*size;
    g.drawRect(tx,ty,Math.min(size,x+w-tx),Math.min(size,y+h-ty)); g.endFill();
  }
}

function drawFurniture(g, f) {
  switch(f.type) {
    case "table_rect": g.beginFill(f.color); g.drawRoundedRect(f.x,f.y,f.w,f.h,6); g.endFill(); g.lineStyle(2,0x000000,0.12); g.drawRoundedRect(f.x+4,f.y+4,f.w-8,f.h-8,4); g.lineStyle(0); break;
    case "desk": g.beginFill(f.color); g.drawRoundedRect(f.x,f.y,90,55,4); g.endFill(); g.lineStyle(1.5,0x000000,0.1); g.drawRoundedRect(f.x+3,f.y+3,84,49,3); g.lineStyle(0); break;
    case "chair": g.beginFill(f.color); g.drawRoundedRect(f.x,f.y,28,28,5); g.endFill(); g.lineStyle(2,f.color); g.moveTo(f.x+4,f.y-5); g.lineTo(f.x+4,f.y); g.moveTo(f.x+24,f.y-5); g.lineTo(f.x+24,f.y); g.lineStyle(0); break;
    case "monitor": g.beginFill(0x1a2740); g.drawRoundedRect(f.x,f.y,65,38,4); g.endFill(); g.beginFill(0x2a3f60,0.8); g.drawRoundedRect(f.x+3,f.y+3,59,32,3); g.endFill(); g.beginFill(0x3a3a3a); g.drawRect(f.x+28,f.y+38,10,8); g.drawRoundedRect(f.x+20,f.y+44,26,5,2); g.endFill(); break;
    case "sofa": g.beginFill(f.color); g.drawRoundedRect(f.x,f.y,f.w,16,6); g.endFill(); g.beginFill(f.color); g.drawRoundedRect(f.x,f.y+14,f.w,34,4); g.endFill(); g.beginFill(shadeColor(f.color,-40)); g.drawRoundedRect(f.x,f.y+12,14,36,4); g.drawRoundedRect(f.x+f.w-14,f.y+12,14,36,4); g.endFill(); g.lineStyle(1,0x000000,0.1); g.moveTo(f.x+f.w/2,f.y+14); g.lineTo(f.x+f.w/2,f.y+48); g.lineStyle(0); break;
    case "sofa_side": g.beginFill(f.color); g.drawRoundedRect(f.x,f.y,16,f.h,6); g.endFill(); g.beginFill(f.color); g.drawRoundedRect(f.x+14,f.y,34,f.h,4); g.endFill(); g.beginFill(shadeColor(f.color,-40)); g.drawRoundedRect(f.x+12,f.y,36,14,4); g.drawRoundedRect(f.x+12,f.y+f.h-14,36,14,4); g.endFill(); break;
    case "coffee_table": g.beginFill(0x8b6b3a); g.drawRoundedRect(f.x,f.y,70,45,8); g.endFill(); g.lineStyle(1.5,0x000000,0.1); g.drawRoundedRect(f.x+4,f.y+4,62,37,6); g.lineStyle(0); break;
    case "tv": g.beginFill(0x1a1a1a); g.drawRoundedRect(f.x,f.y,120,70,6); g.endFill(); g.beginFill(0x0d1a2e); g.drawRoundedRect(f.x+5,f.y+5,110,55,4); g.endFill(); g.lineStyle(1,0x1e3a5f,0.7); for(let i=0;i<4;i++){g.moveTo(f.x+10,f.y+18+i*10);g.lineTo(f.x+110,f.y+18+i*10);} g.lineStyle(0); g.beginFill(0x2a2a2a); g.drawRect(f.x+50,f.y+70,20,10); g.drawRoundedRect(f.x+35,f.y+78,50,6,3); g.endFill(); break;
    case "plant": g.beginFill(0xc17f50); g.drawRoundedRect(f.x-10,f.y+10,20,18,3); g.endFill(); g.beginFill(0x4a2f1a); g.drawEllipse(f.x,f.y+10,10,4); g.endFill(); g.beginFill(0x2d6a2d); g.drawCircle(f.x,f.y,12); g.drawCircle(f.x-8,f.y+4,9); g.drawCircle(f.x+8,f.y+4,9); g.drawCircle(f.x,f.y+6,10); g.endFill(); g.beginFill(0x3a8c3a); g.drawCircle(f.x,f.y-2,8); g.drawCircle(f.x-5,f.y+2,6); g.drawCircle(f.x+5,f.y+2,6); g.endFill(); break;
    default: break;
  }
}
function shadeColor(hex,amt){return(Math.min(255,Math.max(0,((hex>>16)&0xff)+amt))<<16)|(Math.min(255,Math.max(0,((hex>>8)&0xff)+amt))<<8)|Math.min(255,Math.max(0,((hex)&0xff)+amt));}