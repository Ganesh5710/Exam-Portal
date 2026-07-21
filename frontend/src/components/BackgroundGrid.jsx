import React, { useEffect, useRef } from "react";

/**
 * BackgroundGrid Component
 * Senior Creative Developer & UI Architect grade WebGL/Canvas 3D Background Engine.
 * Features:
 * - Receding infinite 3D perspective grid vanishing into a deep horizon (#0B0F17).
 * - Electric Cyan (#00F0FF) & Warm Gold (#FFD700) flowing data streams and pulses.
 * - Interactive mouse parallax tilt and node glow effect.
 * - Floating ambient micro-particles moving through 3D space.
 * - Non-intrusive vignette mask maintaining 100% contrast for hero text legibility.
 */
export const BackgroundGrid = ({ isDarkMode = true, className = "" }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    // Canvas sizing & DPI scaling
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Mouse Parallax & Interaction Tracking
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const handleMouseMove = (e) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // 3D Particles Pool
    const particleCount = 45;
    const particles = Array.from({ length: particleCount }, () => ({
      x: (Math.random() - 0.5) * width * 1.5,
      y: Math.random() * height,
      z: Math.random() * 800 + 100,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.8 + 0.3,
      color: Math.random() > 0.35 ? "#00F0FF" : "#FFD700",
      alpha: Math.random() * 0.6 + 0.2,
    }));

    // Data Pulses flowing down perspective lines
    const pulseCount = 18;
    const pulses = Array.from({ length: pulseCount }, () => ({
      lineIndex: Math.floor(Math.random() * 24),
      progress: Math.random(),
      speed: Math.random() * 0.006 + 0.003,
      color: Math.random() > 0.3 ? "#00F0FF" : "#FFD700",
      length: Math.random() * 0.15 + 0.08,
    }));

    let tick = 0;

    // Render 60fps Loop
    const render = () => {
      tick++;

      // Smooth mouse interpolation
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      const mouseOffsetPercentX = (mouseX / width - 0.5) * 2;
      const mouseOffsetPercentY = (mouseY / height - 0.5) * 2;

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // 1. Deep Atmosphere Background Gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
      if (isDarkMode) {
        bgGradient.addColorStop(0, "#070A11");
        bgGradient.addColorStop(0.5, "#0B0F17");
        bgGradient.addColorStop(1, "#04060A");
      } else {
        bgGradient.addColorStop(0, "#F8FAFC");
        bgGradient.addColorStop(0.5, "#F1F5F9");
        bgGradient.addColorStop(1, "#E2E8F0");
      }
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Horizon Vanishing Point Parameters
      const horizonY = height * 0.42 + mouseOffsetPercentY * 15;
      const vanishingX = width * 0.5 + mouseOffsetPercentX * 30;

      // 2. Render 3D Perspective Receding Grid
      const gridCols = 24;
      const gridRows = 16;
      const gridYStart = horizonY + 20;

      // Draw Perspective Longitudinal Lines (Vanishing to Bottom)
      for (let i = 0; i <= gridCols; i++) {
        const xBottom = ((i - gridCols / 2) / (gridCols / 2)) * (width * 1.4) + width / 2;
        
        ctx.beginPath();
        ctx.moveTo(vanishingX, horizonY);
        ctx.lineTo(xBottom, height);

        const isGoldLine = i % 6 === 0;
        const strokeAlpha = isDarkMode ? (isGoldLine ? 0.25 : 0.12) : 0.2;
        const strokeColor = isDarkMode
          ? isGoldLine
            ? `rgba(255, 215, 0, ${strokeAlpha})`
            : `rgba(0, 240, 255, ${strokeAlpha})`
          : `rgba(148, 163, 184, ${strokeAlpha})`;

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = isGoldLine ? 1.5 : 1;
        ctx.stroke();
      }

      // Draw Horizontal Receding Grid Lines
      for (let j = 0; j < gridRows; j++) {
        const progress = Math.pow(j / gridRows, 2.2); // Exponential spacing for 3D depth
        const y = gridYStart + progress * (height - gridYStart);

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);

        const lineAlpha = (1 - progress) * (isDarkMode ? 0.18 : 0.25);
        ctx.strokeStyle = isDarkMode
          ? `rgba(0, 240, 255, ${lineAlpha})`
          : `rgba(148, 163, 184, ${lineAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 3. Render Flowing Data Stream Pulses along Grid Lines
      pulses.forEach((pulse) => {
        pulse.progress += pulse.speed;
        if (pulse.progress > 1) {
          pulse.progress = 0;
          pulse.lineIndex = Math.floor(Math.random() * gridCols);
        }

        const startP = Math.max(0, pulse.progress - pulse.length);
        const endP = Math.min(1, pulse.progress);

        const colRatio = (pulse.lineIndex - gridCols / 2) / (gridCols / 2);
        const startX = vanishingX + (colRatio * (width * 1.4) + width / 2 - vanishingX) * Math.pow(startP, 2.2);
        const startY = horizonY + Math.pow(startP, 2.2) * (height - horizonY);

        const endX = vanishingX + (colRatio * (width * 1.4) + width / 2 - vanishingX) * Math.pow(endP, 2.2);
        const endY = horizonY + Math.pow(endP, 2.2) * (height - horizonY);

        const pulseGradient = ctx.createLinearGradient(startX, startY, endX, endY);
        pulseGradient.addColorStop(0, "rgba(0,0,0,0)");
        pulseGradient.addColorStop(1, pulse.color);

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = pulseGradient;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = pulse.color;
        ctx.shadowBlur = isDarkMode ? 12 : 4;
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset shadow blur
      });

      // 4. Render 3D Ambient Micro-Particles
      particles.forEach((p) => {
        p.z -= p.speed * 2;
        if (p.z <= 1) {
          p.z = 800;
          p.x = (Math.random() - 0.5) * width * 1.5;
          p.y = Math.random() * height;
        }

        const k = 300 / p.z;
        const px = p.x * k + width / 2 + mouseOffsetPercentX * 10;
        const py = p.y * k + height / 2 + mouseOffsetPercentY * 10;
        const pSize = p.size * k;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          ctx.beginPath();
          ctx.arc(px, py, Math.max(0.5, pSize), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = isDarkMode ? Math.min(1, p.alpha * (1 - p.z / 800)) : p.alpha * 0.3;
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }
      });

      // 5. Interactive Mouse Cursor Glow Node
      ctx.beginPath();
      const mouseGlow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 180);
      mouseGlow.addColorStop(0, isDarkMode ? "rgba(0, 240, 255, 0.15)" : "rgba(0, 240, 255, 0.1)");
      mouseGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = mouseGlow;
      ctx.arc(mouseX, mouseY, 180, 0, Math.PI * 2);
      ctx.fill();

      // 6. Center Hero Vignette (Ensures 100% Text Legibility)
      const vignette = ctx.createRadialGradient(
        width / 2,
        height * 0.45,
        width * 0.15,
        width / 2,
        height * 0.45,
        width * 0.75
      );
      if (isDarkMode) {
        vignette.addColorStop(0, "rgba(11, 15, 23, 0.4)");
        vignette.addColorStop(0.6, "rgba(11, 15, 23, 0.8)");
        vignette.addColorStop(1, "rgba(7, 10, 17, 0.95)");
      } else {
        vignette.addColorStop(0, "rgba(248, 250, 252, 0.3)");
        vignette.addColorStop(0.6, "rgba(248, 250, 252, 0.75)");
        vignette.addColorStop(1, "rgba(226, 232, 240, 0.9)");
      }
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDarkMode]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-700 ${className}`}
    />
  );
};

export default BackgroundGrid;
