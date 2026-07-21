import React, { useEffect, useRef, useCallback } from "react";

/**
 * QuantumGrid — "The Quantum Core Telemetry Grid"
 *
 * A single, self-contained, GPU-accelerated HTML5 Canvas component that renders:
 *   1. A 3D perspective grid floor with exponential depth spacing
 *   2. Simplex-noise-displaced terrain elevation (living data ocean)
 *   3. Electric Cyan (#00F0FF) + Warm Gold (#FFD700) grid lines & pulse streams
 *   4. Floating micro-particles drifting through 3D space
 *   5. Interactive mouse-driven shockwave ripples on the terrain
 *   6. Smooth camera parallax tied to cursor position
 *   7. Soft radial bloom glow and vignette for text legibility
 *
 * Zero external WebGL dependencies. Pure Canvas 2D for maximum compatibility
 * and guaranteed 60 fps on all devices without WebGL context limits.
 */

// ─── Simplex Noise (compact, self-contained) ────────────────────────────
function buildNoise() {
  const F2 = 0.5 * (Math.sqrt(3) - 1);
  const G2 = (3 - Math.sqrt(3)) / 6;
  const grad3 = [
    [1, 1], [-1, 1], [1, -1], [-1, -1],
    [1, 0], [-1, 0], [0, 1], [0, -1],
  ];
  const perm = new Uint8Array(512);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

  return function noise2D(xin, yin) {
    let n0, n1, n2;
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;
    let i1, j1;
    if (x0 > y0) { i1 = 1; j1 = 0; } else { i1 = 0; j1 = 1; }
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;
    const ii = i & 255;
    const jj = j & 255;
    const gi0 = perm[ii + perm[jj]] % 8;
    const gi1 = perm[ii + i1 + perm[jj + j1]] % 8;
    const gi2 = perm[ii + 1 + perm[jj + 1]] % 8;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 < 0) n0 = 0; else { t0 *= t0; n0 = t0 * t0 * (grad3[gi0][0] * x0 + grad3[gi0][1] * y0); }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 < 0) n1 = 0; else { t1 *= t1; n1 = t1 * t1 * (grad3[gi1][0] * x1 + grad3[gi1][1] * y1); }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 < 0) n2 = 0; else { t2 *= t2; n2 = t2 * t2 * (grad3[gi2][0] * x2 + grad3[gi2][1] * y2); }
    return 70 * (n0 + n1 + n2);
  };
}

export default function QuantumGrid({ isDarkMode = true }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    mouseX: 0.5,
    mouseY: 0.5,
    smoothMouseX: 0.5,
    smoothMouseY: 0.5,
    ripples: [],
    raf: null,
  });

  const handleMouseMove = useCallback((e) => {
    stateRef.current.mouseX = e.clientX / window.innerWidth;
    stateRef.current.mouseY = e.clientY / window.innerHeight;
  }, []);

  const handleClick = useCallback((e) => {
    stateRef.current.ripples.push({
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
      birth: performance.now(),
      strength: 1.0,
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const noise = buildNoise();
    const state = stateRef.current;

    let W, H;
    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);

    // ─── Particle pool ──────────────────────────────────────────────
    const PARTICLE_COUNT = 60;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random() * 600 + 100,
      size: Math.random() * 1.8 + 0.6,
      speed: Math.random() * 0.4 + 0.15,
      isCyan: Math.random() > 0.3,
      alpha: Math.random() * 0.5 + 0.3,
    }));

    // ─── Grid parameters ────────────────────────────────────────────
    const COLS = 50;
    const ROWS = 35;

    // ─── Render loop ────────────────────────────────────────────────
    const render = (now) => {
      state.raf = requestAnimationFrame(render);
      const t = now * 0.001;

      // Smooth mouse interpolation
      state.smoothMouseX += (state.mouseX - state.smoothMouseX) * 0.04;
      state.smoothMouseY += (state.mouseY - state.smoothMouseY) * 0.04;
      const mx = (state.smoothMouseX - 0.5) * 2;
      const my = (state.smoothMouseY - 0.5) * 2;

      ctx.clearRect(0, 0, W, H);

      // ── 1. Deep space background ──────────────────────────────────
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      if (isDarkMode) {
        bg.addColorStop(0, "#030712");
        bg.addColorStop(0.4, "#050a18");
        bg.addColorStop(1, "#020408");
      } else {
        bg.addColorStop(0, "#f8fafc");
        bg.addColorStop(0.5, "#f1f5f9");
        bg.addColorStop(1, "#e2e8f0");
      }
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // ── 2. Perspective 3D terrain grid ────────────────────────────
      const horizonY = H * 0.38 + my * 12;
      const vanishX = W * 0.5 + mx * 25;
      const gridBottom = H * 1.15;
      const gridHeight = gridBottom - horizonY;

      // Build grid points with noise displacement
      const points = [];
      for (let r = 0; r <= ROWS; r++) {
        const row = [];
        const rowT = r / ROWS;
        // Exponential depth curve for 3D perspective
        const depthT = Math.pow(rowT, 2.5);
        const screenY = horizonY + depthT * gridHeight;
        const spreadFactor = 0.05 + depthT * 1.4;

        for (let c = 0; c <= COLS; c++) {
          const colT = (c / COLS - 0.5) * 2;
          const screenX = vanishX + colT * (W * 0.9) * spreadFactor;

          // Noise-based elevation
          const nx = c * 0.12 + t * 0.3;
          const ny = r * 0.12 + t * 0.2;
          const elevation = noise(nx, ny) * 18 * (1 - depthT * 0.7);

          // Ripple distortion from clicks
          let rippleOffset = 0;
          for (let ri = state.ripples.length - 1; ri >= 0; ri--) {
            const rp = state.ripples[ri];
            const age = (now - rp.birth) * 0.001;
            if (age > 3) { state.ripples.splice(ri, 1); continue; }
            const dx = (screenX / W) - rp.x;
            const dy = (screenY / H) - rp.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const waveRadius = age * 0.4;
            const waveDelta = Math.abs(dist - waveRadius);
            if (waveDelta < 0.12) {
              const env = Math.exp(-age * 1.5) * rp.strength;
              rippleOffset += Math.sin(waveDelta * 80) * env * 12;
            }
          }

          // Cursor proximity distortion
          const cdx = (screenX / W) - state.smoothMouseX;
          const cdy = (screenY / H) - state.smoothMouseY;
          const cursorDist = Math.sqrt(cdx * cdx + cdy * cdy);
          const cursorWave = Math.sin(cursorDist * 35 - t * 5) * Math.exp(-cursorDist * 6) * 8;

          row.push({
            x: screenX,
            y: screenY - elevation - rippleOffset - cursorWave,
            depth: depthT,
            elevation,
          });
        }
        points.push(row);
      }

      // Draw horizontal grid lines
      for (let r = 0; r <= ROWS; r++) {
        const row = points[r];
        const depthFade = 1 - row[0].depth;
        if (depthFade < 0.02) continue;

        const isGoldRow = r % 7 === 0;
        const alpha = depthFade * (isGoldRow ? 0.55 : 0.3);

        ctx.beginPath();
        ctx.moveTo(row[0].x, row[0].y);
        for (let c = 1; c <= COLS; c++) {
          ctx.lineTo(row[c].x, row[c].y);
        }
        if (isDarkMode) {
          ctx.strokeStyle = isGoldRow
            ? `rgba(255, 215, 0, ${alpha})`
            : `rgba(0, 240, 255, ${alpha})`;
        } else {
          ctx.strokeStyle = `rgba(100, 116, 139, ${alpha * 0.8})`;
        }
        ctx.lineWidth = isGoldRow ? 1.5 : 0.8;
        ctx.stroke();
      }

      // Draw vertical grid lines
      for (let c = 0; c <= COLS; c++) {
        const isGoldCol = c % 10 === 0;

        ctx.beginPath();
        let started = false;
        for (let r = 0; r <= ROWS; r++) {
          const pt = points[r][c];
          const depthFade = 1 - pt.depth;
          if (depthFade < 0.02) continue;
          if (!started) { ctx.moveTo(pt.x, pt.y); started = true; }
          else ctx.lineTo(pt.x, pt.y);
        }
        const alpha = isGoldCol ? 0.45 : 0.2;
        if (isDarkMode) {
          ctx.strokeStyle = isGoldCol
            ? `rgba(255, 215, 0, ${alpha})`
            : `rgba(0, 240, 255, ${alpha})`;
        } else {
          ctx.strokeStyle = `rgba(100, 116, 139, ${alpha * 0.8})`;
        }
        ctx.lineWidth = isGoldCol ? 1.2 : 0.6;
        ctx.stroke();
      }

      // ── 3. Energy pulse streams along grid ────────────────────────
      const pulseCount = 8;
      for (let p = 0; p < pulseCount; p++) {
        const colIdx = Math.floor(((Math.sin(t * 0.3 + p * 1.7) * 0.5 + 0.5) * COLS));
        const headRow = Math.floor(((t * 0.35 + p * 0.4) % 1) * ROWS);
        const tailLen = 6;

        ctx.beginPath();
        let first = true;
        for (let r = Math.max(0, headRow - tailLen); r <= Math.min(ROWS, headRow); r++) {
          const pt = points[r]?.[colIdx];
          if (!pt) continue;
          if (first) { ctx.moveTo(pt.x, pt.y); first = false; }
          else ctx.lineTo(pt.x, pt.y);
        }
        const pulseAlpha = (1 - points[headRow]?.[colIdx]?.depth || 0) * 0.9;
        const isGoldPulse = p % 3 === 0;
        ctx.strokeStyle = isGoldPulse
          ? `rgba(255, 215, 0, ${pulseAlpha})`
          : `rgba(0, 240, 255, ${pulseAlpha})`;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = isGoldPulse ? "#FFD700" : "#00F0FF";
        ctx.shadowBlur = isDarkMode ? 16 : 6;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Pulse head glow node
        const headPt = points[headRow]?.[colIdx];
        if (headPt && (1 - headPt.depth) > 0.05) {
          ctx.beginPath();
          ctx.arc(headPt.x, headPt.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = isGoldPulse ? "#FFD700" : "#00F0FF";
          ctx.shadowColor = isGoldPulse ? "#FFD700" : "#00F0FF";
          ctx.shadowBlur = isDarkMode ? 20 : 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // ── 4. Floating 3D micro-particles ────────────────────────────
      for (const p of particles) {
        p.z -= p.speed * 1.5;
        if (p.z <= 1) {
          p.z = 700;
          p.x = Math.random();
          p.y = Math.random();
        }
        const k = 250 / p.z;
        const px = (p.x - 0.5) * W * k + W / 2 + mx * 8;
        const py = (p.y - 0.5) * H * k + H / 2 + my * 8;
        const pSize = Math.max(0.4, p.size * k);

        if (px < 0 || px > W || py < 0 || py > H) continue;

        const fadeIn = Math.min(1, (700 - p.z) / 200);
        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fillStyle = p.isCyan ? "#00F0FF" : "#FFD700";
        ctx.globalAlpha = isDarkMode ? p.alpha * fadeIn : p.alpha * fadeIn * 0.4;
        ctx.shadowColor = p.isCyan ? "#00F0FF" : "#FFD700";
        ctx.shadowBlur = isDarkMode ? 8 : 3;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }

      // ── 5. Cursor glow halo ───────────────────────────────────────
      if (isDarkMode) {
        const gx = state.smoothMouseX * W;
        const gy = state.smoothMouseY * H;
        const cursorGlow = ctx.createRadialGradient(gx, gy, 0, gx, gy, 200);
        cursorGlow.addColorStop(0, "rgba(0, 240, 255, 0.12)");
        cursorGlow.addColorStop(0.5, "rgba(0, 240, 255, 0.04)");
        cursorGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = cursorGlow;
        ctx.fillRect(0, 0, W, H);
      }

      // ── 6. Ambient radial bloom glow ──────────────────────────────
      if (isDarkMode) {
        const bloom1 = ctx.createRadialGradient(W * 0.3, H * 0.35, 0, W * 0.3, H * 0.35, W * 0.5);
        bloom1.addColorStop(0, "rgba(0, 240, 255, 0.06)");
        bloom1.addColorStop(1, "transparent");
        ctx.fillStyle = bloom1;
        ctx.fillRect(0, 0, W, H);

        const bloom2 = ctx.createRadialGradient(W * 0.7, H * 0.5, 0, W * 0.7, H * 0.5, W * 0.4);
        bloom2.addColorStop(0, "rgba(255, 215, 0, 0.04)");
        bloom2.addColorStop(1, "transparent");
        ctx.fillStyle = bloom2;
        ctx.fillRect(0, 0, W, H);
      }

      // ── 7. Vignette overlay (text legibility) ─────────────────────
      const vignette = ctx.createRadialGradient(
        W / 2, H * 0.42, W * 0.12,
        W / 2, H * 0.42, W * 0.85
      );
      if (isDarkMode) {
        vignette.addColorStop(0, "rgba(3, 7, 18, 0.15)");
        vignette.addColorStop(0.5, "rgba(3, 7, 18, 0.55)");
        vignette.addColorStop(1, "rgba(2, 4, 8, 0.92)");
      } else {
        vignette.addColorStop(0, "rgba(248, 250, 252, 0.1)");
        vignette.addColorStop(0.5, "rgba(248, 250, 252, 0.5)");
        vignette.addColorStop(1, "rgba(226, 232, 240, 0.85)");
      }
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, W, H);
    };

    state.raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(state.raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
    };
  }, [isDarkMode, handleMouseMove, handleClick]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}
