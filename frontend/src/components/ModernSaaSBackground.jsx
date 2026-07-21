import React from "react";

/**
 * ModernSaaSBackground
 * Hyper-sleek, Vercel/Linear-inspired SaaS background with vibrant cyan/purple/gold
 * ambient glow orbs, crisp grid mesh texture, and zero WebGL crash risks.
 */
export default function ModernSaaSBackground({ isDarkMode = true }) {
  if (!isDarkMode) {
    return (
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-100" />
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: "linear-gradient(rgba(148, 163, 184, 0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.25) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(ellipse 80% 70% at 50% 30%, black 40%, transparent 90%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 30%, black 40%, transparent 90%)",
          }}
        />
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-30 bg-purple-300 blur-[90px]" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
      {/* Base Dark Atmosphere Background */}
      <div className="absolute inset-0 bg-[#04060E]" />

      {/* Primary Vibrant Cyan Glow Orb (Hero Center) */}
      <div
        className="absolute top-[-12%] left-1/2 -translate-x-1/2 w-[950px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(ellipse at center, rgba(0, 240, 255, 0.4) 0%, rgba(0, 240, 255, 0.12) 45%, transparent 75%)",
          filter: "blur(60px)",
        }}
      />

      {/* Core Violet/Fuchsia Glow Orb (Directly behind Title) */}
      <div
        className="absolute top-[3%] left-[48%] -translate-x-1/2 w-[800px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(ellipse at center, rgba(168, 85, 247, 0.4) 0%, rgba(147, 51, 234, 0.15) 50%, transparent 75%)",
          filter: "blur(65px)",
        }}
      />

      {/* Warm Gold Accent Orb (Hero Top Right) */}
      <div
        className="absolute top-[-5%] left-[65%] -translate-x-1/2 w-[650px] h-[450px] rounded-full"
        style={{
          background: "radial-gradient(ellipse at center, rgba(245, 158, 11, 0.3) 0%, rgba(245, 158, 11, 0.1) 50%, transparent 75%)",
          filter: "blur(60px)",
        }}
      />

      {/* Left Edge Electric Cyan Flare */}
      <div
        className="absolute top-[18%] left-[-10%] w-[600px] h-[700px] rounded-full"
        style={{
          background: "radial-gradient(ellipse at center, rgba(0, 240, 255, 0.22) 0%, transparent 70%)",
          filter: "blur(75px)",
        }}
      />

      {/* Right Edge Fuchsia Flare */}
      <div
        className="absolute top-[28%] right-[-10%] w-[550px] h-[650px] rounded-full"
        style={{
          background: "radial-gradient(ellipse at center, rgba(236, 72, 153, 0.2) 0%, transparent 70%)",
          filter: "blur(75px)",
        }}
      />

      {/* Crisp 40px High-Tech Grid Mesh */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(124, 92, 252, 0.22) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(124, 92, 252, 0.22) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse 90% 80% at 50% 35%, black 50%, transparent 95%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 80% at 50% 35%, black 50%, transparent 95%)",
        }}
      />

      {/* Fine 20px Micro Grid Accent */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(rgba(0, 240, 255, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
          maskImage: "radial-gradient(ellipse 85% 75% at 50% 35%, black 40%, transparent 90%)",
          WebkitMaskImage: "radial-gradient(ellipse 85% 75% at 50% 35%, black 40%, transparent 90%)",
        }}
      />

      {/* Soft Bottom Vignette Transition */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, transparent 40%, rgba(4, 6, 14, 0.6) 75%, #04060E 100%)",
        }}
      />
    </div>
  );
}
