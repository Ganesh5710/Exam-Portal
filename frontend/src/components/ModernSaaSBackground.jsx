import React from "react";

/**
 * ModernSaaSBackground
 *
 * A hyper-sleek, Vercel/Linear-inspired enterprise SaaS background.
 * Pure CSS + SVG — zero Three.js, zero WebGL, zero Canvas, zero bundle bloat.
 *
 * Layers (back to front):
 *   1. Deep midnight charcoal base (#080C14)
 *   2. SVG micro-dot matrix texture (8–12% opacity)
 *   3. Hero radial backlight glow (cyan + gold)
 *   4. Edge accent light flares
 *   5. Bottom fade vignette
 */
export default function ModernSaaSBackground({ isDarkMode = true }) {
  if (!isDarkMode) {
    // Light mode: clean, minimal gradient
    return (
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-100" />
        {/* Subtle dot texture */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots-light" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill="#94a3b8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots-light)" />
        </svg>
        {/* Soft top glow */}
        <div
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-30"
          style={{
            background: "radial-gradient(ellipse at center, rgba(124,92,252,0.15), transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* ── Layer 1: Deep midnight charcoal base ── */}
      <div className="absolute inset-0 bg-[#080C14]" />

      {/* ── Layer 2: SVG micro-dot matrix texture ── */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.10]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots-dark" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.7" fill="#334155" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots-dark)" />
      </svg>

      {/* ── Layer 3: Hero radial backlight glow (cyan) ── */}
      <div
        className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[1100px] h-[700px] rounded-full"
        style={{
          background: "radial-gradient(ellipse at center, rgba(0,240,255,0.12), transparent 70%)",
          filter: "blur(140px)",
        }}
      />

      {/* ── Layer 3b: Hero radial backlight glow (gold, offset) ── */}
      <div
        className="absolute top-[-5%] left-[55%] -translate-x-1/2 w-[800px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(ellipse at center, rgba(255,215,0,0.07), transparent 70%)",
          filter: "blur(140px)",
        }}
      />

      {/* ── Layer 4a: Left edge accent flare ── */}
      <div
        className="absolute top-[20%] left-[-5%] w-[500px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(ellipse at center, rgba(0,240,255,0.06), transparent 70%)",
          filter: "blur(100px)",
        }}
      />

      {/* ── Layer 4b: Right edge accent flare ── */}
      <div
        className="absolute top-[35%] right-[-5%] w-[400px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(ellipse at center, rgba(255,215,0,0.04), transparent 70%)",
          filter: "blur(100px)",
        }}
      />

      {/* ── Layer 5: Bottom fade vignette ── */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, transparent 50%, rgba(8,12,20,0.6) 75%, #080C14 100%)",
        }}
      />

      {/* ── Layer 6: Top-edge subtle horizon line ── */}
      <div className="absolute top-[38%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent" />
    </div>
  );
}
