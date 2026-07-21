import React from "react";

/**
 * ModernSaaSBackground
 *
 * Vercel/Linear-inspired enterprise SaaS background — pure CSS, zero WebGL.
 * Dramatically boosted glow intensities for visible, premium atmosphere.
 */
export default function ModernSaaSBackground({ isDarkMode = true }) {
  if (!isDarkMode) {
    return (
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-100" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots-l" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill="#94a3b8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots-l)" />
        </svg>
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full opacity-40" style={{ background: "radial-gradient(ellipse at center, rgba(124,58,237,0.2), transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute top-[10%] right-[10%] w-[600px] h-[400px] rounded-full opacity-30" style={{ background: "radial-gradient(ellipse at center, rgba(6,182,212,0.15), transparent 70%)", filter: "blur(80px)" }} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* ── Base: Deep midnight ── */}
      <div className="absolute inset-0 bg-[#080C14]" />

      {/* ── Micro-dot texture ── */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.12]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots-d" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.7" fill="#475569" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots-d)" />
      </svg>

      {/* ── MASSIVE Hero Cyan Backlight ── */}
      <div
        className="absolute top-[-25%] left-1/2 -translate-x-1/2 w-[1400px] h-[900px] rounded-full"
        style={{
          background: "radial-gradient(ellipse at center, rgba(0,240,255,0.25), rgba(0,240,255,0.08) 40%, transparent 70%)",
          filter: "blur(120px)",
        }}
      />

      {/* ── Violet core glow (behind hero text) ── */}
      <div
        className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[700px] rounded-full"
        style={{
          background: "radial-gradient(ellipse at center, rgba(139,92,246,0.22), transparent 65%)",
          filter: "blur(100px)",
        }}
      />

      {/* ── Gold accent glow (offset right) ── */}
      <div
        className="absolute top-[5%] left-[58%] -translate-x-1/2 w-[900px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(ellipse at center, rgba(255,215,0,0.12), transparent 65%)",
          filter: "blur(120px)",
        }}
      />

      {/* ── Left edge cyan flare ── */}
      <div
        className="absolute top-[15%] left-[-8%] w-[600px] h-[700px] rounded-full"
        style={{
          background: "radial-gradient(ellipse at center, rgba(0,240,255,0.10), transparent 70%)",
          filter: "blur(90px)",
        }}
      />

      {/* ── Right edge fuchsia flare ── */}
      <div
        className="absolute top-[30%] right-[-8%] w-[500px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(ellipse at center, rgba(236,72,153,0.08), transparent 70%)",
          filter: "blur(90px)",
        }}
      />

      {/* ── Bottom-center upward warm glow ── */}
      <div
        className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[1200px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(ellipse at center, rgba(139,92,246,0.10), transparent 70%)",
          filter: "blur(100px)",
        }}
      />

      {/* ── Horizon accent line ── */}
      <div className="absolute top-[36%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/15 to-transparent" />

      {/* ── Soft grid overlay for depth ── */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(rgba(148,163,184,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 35%, black 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 35%, black 30%, transparent 80%)",
        }}
      />

      {/* ── Bottom vignette fade ── */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, transparent 55%, rgba(8,12,20,0.7) 80%, #080C14 100%)",
        }}
      />
    </div>
  );
}
