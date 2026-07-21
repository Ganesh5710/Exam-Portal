import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

/**
 * Hero3DBackground Component
 * World-Class Three.js + GSAP + GLSL 3D WebGL Background Engine.
 *
 * Features:
 * - 3D Cyber Perspective Grid with custom GLSL Vertex & Fragment Shaders.
 * - Dynamic wave displacement & exponential horizon fog (#090D16).
 * - Floating low-poly 3D data nodes with GSAP organic floating & rotation timelines.
 * - Interactive mouse parallax inertia & electric cyan (#00F0FF) / warm gold (#FFD700) light streams.
 * - Non-intrusive center vignette mask guaranteeing 100% text legibility overlay.
 */
export const Hero3DBackground = ({ isDarkMode = true, className = "" }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    const bgColor = isDarkMode ? new THREE.Color("#090D16") : new THREE.Color("#F8FAFC");
    // Keep scene transparent so elements blend cleanly
    scene.fog = new THREE.FogExp2(bgColor, 0.012);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 6, 22);
    camera.lookAt(0, 2, 0);

    // 3. WebGL Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    container.appendChild(renderer.domElement);

    // 4. Custom GLSL Cyber-Grid Shader Material
    const vertexShader = `
      uniform float uTime;
      uniform float uWaveSpeed;
      varying vec2 vUv;
      varying float vElevation;

      void main() {
        vUv = uv;
        vec3 pos = position;
        
        // Subtle 3D wave displacement along horizontal grid
        float elevation = sin(pos.x * 0.18 + uTime * uWaveSpeed) * cos(pos.y * 0.18 + uTime * uWaveSpeed) * 0.8;
        pos.z += elevation;
        vElevation = elevation;

        vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectedPosition = projectionMatrix * viewPosition;

        gl_Position = projectedPosition;
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform vec3 uColorCyan;
      uniform vec3 uColorGold;
      uniform vec3 uBgColor;
      varying vec2 vUv;
      varying float vElevation;

      void main() {
        // Grid pattern calculations
        vec2 grid = abs(fract(vUv * 36.0 - 0.5) - 0.5) / fwidth(vUv * 36.0);
        float line = min(grid.x, grid.y);
        float gridAlpha = 1.0 - min(line, 1.0);

        // Gold grid lines every 6th division
        vec2 goldGrid = abs(fract(vUv * 6.0 - 0.5) - 0.5) / fwidth(vUv * 6.0);
        float goldLine = min(goldGrid.x, goldGrid.y);
        float goldAlpha = 1.0 - min(goldLine, 1.0);

        // Mix Cyan and Gold glowing colors
        vec3 strokeColor = mix(uColorCyan, uColorGold, goldAlpha * 0.8);

        // Distance fog fade towards horizon
        float distanceFade = smoothstep(1.0, 0.0, vUv.y);
        
        // Dynamic pulse wave travelling forward
        float pulse = sin(vUv.y * 40.0 - uTime * 3.5) * 0.5 + 0.5;
        pulse = pow(pulse, 3.0);

        vec3 finalColor = strokeColor * (gridAlpha * 1.5 + goldAlpha * 2.0);
        finalColor += uColorCyan * pulse * distanceFade * 0.8;

        float alpha = (gridAlpha * 0.7 + goldAlpha * 0.95 + pulse * 0.5) * distanceFade;

        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    const gridMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uWaveSpeed: { value: 1.2 },
        uColorCyan: { value: new THREE.Color(isDarkMode ? "#00F0FF" : "#0284C7") },
        uColorGold: { value: new THREE.Color(isDarkMode ? "#FFD700" : "#D97706") },
        uBgColor: { value: bgColor },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const gridGeometry = new THREE.PlaneGeometry(160, 160, 80, 80);
    const gridMesh = new THREE.Mesh(gridGeometry, gridMaterial);
    gridMesh.rotation.x = -Math.PI / 2;
    gridMesh.position.y = -2;
    scene.add(gridMesh);

    // 5. Floating 3D Low-Poly Data Nodes
    const nodesGroup = new THREE.Group();
    scene.add(nodesGroup);

    const nodeGeometries = [
      new THREE.IcosahedronGeometry(1.4, 0),
      new THREE.OctahedronGeometry(1.2, 0),
      new THREE.TetrahedronGeometry(1.0, 0),
    ];

    const nodeCount = 18;
    const nodeMeshes = [];

    for (let i = 0; i < nodeCount; i++) {
      const geom = nodeGeometries[i % nodeGeometries.length];
      const isGold = i % 3 === 0;

      const mat = new THREE.MeshBasicMaterial({
        color: isGold ? "#FFD700" : "#00F0FF",
        wireframe: true,
        transparent: true,
        opacity: isDarkMode ? 0.85 : 0.6,
      });

      const mesh = new THREE.Mesh(geom, mat);
      
      // Random position spread in 3D perspective space
      mesh.position.set(
        (Math.random() - 0.5) * 45,
        Math.random() * 12 + 2,
        (Math.random() - 0.5) * 40 - 5
      );

      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      nodesGroup.add(mesh);
      nodeMeshes.push(mesh);

      // GSAP Organic Floating & Continuous Rotation Timeline
      gsap.to(mesh.position, {
        y: mesh.position.y + Math.random() * 2.5 + 1.5,
        duration: Math.random() * 4 + 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: Math.random() * 2,
      });

      gsap.to(mesh.rotation, {
        x: Math.PI * 2,
        y: Math.PI * 2,
        duration: Math.random() * 12 + 10,
        repeat: -1,
        ease: "none",
      });
    }

    // 6. Interactive Mouse Parallax & GSAP Smooth Inertia
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;

      // GSAP Smooth Camera Tilt Transition
      gsap.to(camera.position, {
        x: mouseX * 5,
        y: 6 - mouseY * 3,
        duration: 1.2,
        ease: "power2.out",
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 7. Window Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", handleResize);

    // 8. Animation Clock & Render Loop
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      
      // Update Shader Uniforms
      gridMaterial.uniforms.uTime.value = elapsedTime;

      // Gentle continuous Group Swaying
      nodesGroup.rotation.y = Math.sin(elapsedTime * 0.15) * 0.12;

      // Camera lookAt center
      camera.lookAt(0, 2, 0);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      gridGeometry.dispose();
      gridMaterial.dispose();
      renderer.dispose();
    };
  }, [isDarkMode]);

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}>
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 z-0" />

      {/* Subtle Soft Center Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-700"
        style={{
          background: isDarkMode
            ? "radial-gradient(circle at 50% 40%, transparent 20%, rgba(9, 13, 22, 0.4) 70%, rgba(4, 6, 10, 0.75) 100%)"
            : "radial-gradient(circle at 50% 40%, transparent 20%, rgba(248, 250, 252, 0.3) 70%, rgba(226, 232, 240, 0.6) 100%)",
        }}
      />
    </div>
  );
};

export default Hero3DBackground;
