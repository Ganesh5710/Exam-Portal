import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing";
import * as THREE from "three";
import gsap from "gsap";

/**
 * GLSL Vertex Shader:
 * Implements 3D Perlin/Simplex Noise displacement and interactive mouse wave ripple distortion.
 */
const terrainVertexShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uRippleIntensity;
  
  varying vec2 vUv;
  varying float vElevation;
  varying vec3 vWorldPosition;

  // GLSL 2D Simplex Noise Helper
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Organic Simplex Data-Terrain Elevation
    float noise1 = snoise(pos.xy * 0.06 + vec2(uTime * 0.15, uTime * 0.1));
    float noise2 = snoise(pos.xy * 0.12 - vec2(uTime * 0.2, uTime * 0.15)) * 0.5;
    float elevation = (noise1 + noise2) * 1.8;

    // Interactive Cursor Wave Ripple Effect
    vec2 cursorDist = pos.xy - uMouse * 40.0;
    float dist = length(cursorDist);
    float ripple = sin(dist * 0.8 - uTime * 4.0) * exp(-dist * 0.1) * uRippleIntensity * 2.5;

    pos.z += elevation + ripple;
    vElevation = elevation + ripple;

    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPosition.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

/**
 * GLSL Fragment Shader:
 * Renders glowing cyan & gold cyber grid lines, pulse streams, and distance attenuation fog.
 */
const terrainFragmentShader = `
  uniform float uTime;
  uniform vec3 uColorCyan;
  uniform vec3 uColorGold;
  uniform vec3 uBgColor;
  
  varying vec2 vUv;
  varying float vElevation;
  varying vec3 vWorldPosition;

  void main() {
    // 3D Grid Line Logic
    vec2 grid = abs(fract(vUv * 50.0 - 0.5) - 0.5) / fwidth(vUv * 50.0);
    float line = min(grid.x, grid.y);
    float gridAlpha = 1.0 - min(line, 1.0);

    // Major Gold Accent Lines every 8th grid
    vec2 goldGrid = abs(fract(vUv * 6.25 - 0.5) - 0.5) / fwidth(vUv * 6.25);
    float goldLine = min(goldGrid.x, goldGrid.y);
    float goldAlpha = 1.0 - min(goldLine, 1.0);

    // Dynamic Pulse Wave travelling along terrain
    float pulse = sin(vUv.y * 60.0 - uTime * 4.0 + vElevation * 2.0) * 0.5 + 0.5;
    pulse = pow(pulse, 4.0);

    // Mix Cyan and Gold Light Colors
    vec3 strokeColor = mix(uColorCyan, uColorGold, goldAlpha * 0.85);

    // Horizon Distance Fog Attenuation
    float distanceToCenter = length(vWorldPosition.xy);
    float fog = smoothstep(65.0, 10.0, distanceToCenter);

    // Elevation Color Boost
    vec3 finalColor = strokeColor * (gridAlpha * 1.8 + goldAlpha * 2.5);
    finalColor += uColorCyan * pulse * 1.2;
    finalColor += uColorGold * max(0.0, vElevation * 0.4);

    float alpha = (gridAlpha * 0.8 + goldAlpha * 0.95 + pulse * 0.6) * fog;

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

/**
 * 3D Data Terrain Mesh Component
 */
const CyberTerrain = ({ isDarkMode }) => {
  const meshRef = useRef();
  const materialRef = useRef();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uRippleIntensity: { value: 0 },
      uColorCyan: { value: new THREE.Color(isDarkMode ? "#00F0FF" : "#0284C7") },
      uColorGold: { value: new THREE.Color(isDarkMode ? "#FFD700" : "#D97706") },
      uBgColor: { value: new THREE.Color(isDarkMode ? "#05070D" : "#F8FAFC") },
    }),
    [isDarkMode]
  );

  const targetMouse = useRef(new THREE.Vector2(0, 0));

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = -(e.clientY / window.innerHeight - 0.5) * 2;
      
      gsap.to(targetMouse.current, {
        x,
        y,
        duration: 0.8,
        ease: "power2.out",
      });

      // Pulse ripple on movement
      if (materialRef.current) {
        gsap.to(materialRef.current.uniforms.uRippleIntensity, {
          value: 1.0,
          duration: 0.2,
          onComplete: () => {
            gsap.to(materialRef.current.uniforms.uRippleIntensity, {
              value: 0.2,
              duration: 1.5,
              ease: "power2.out",
            });
          },
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
      materialRef.current.uniforms.uMouse.value.lerp(targetMouse.current, 0.08);
    }
    
    // Smooth Terrain Rotation
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.3, 0, 0]} position={[0, -5, -5]}>
      <planeGeometry args={[140, 140, 100, 100]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={terrainVertexShader}
        fragmentShader={terrainFragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
};

/**
 * Camera Motion Controller with Parallax
 */
const CameraRig = () => {
  const { camera } = useThree();

  useFrame((state) => {
    const { x, y } = state.pointer;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, x * 3, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 8 + y * 2, 0.05);
    camera.lookAt(0, 2, 0);
  });

  return null;
};

/**
 * Master3DBackground Component
 * Renders the 3D WebGL Canvas with Post-Processing Bloom & Vignette.
 */
export const Master3DBackground = ({ isDarkMode = true, className = "" }) => {
  return (
    <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}>
      {/* 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [0, 8, 25], fov: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        {/* Ambient Fog */}
        <color attach="background" args={[isDarkMode ? "#05070D" : "#F8FAFC"]} />
        <fog attach="fog" args={[isDarkMode ? "#05070D" : "#F8FAFC"], 10, 70} />

        <CameraRig />

        {/* 3D Cyber Data Terrain */}
        <CyberTerrain isDarkMode={isDarkMode} />

        {/* Floating 3D Sparkles & Energy Dust */}
        <Sparkles
          count={70}
          scale={[50, 20, 50]}
          size={3}
          speed={0.6}
          opacity={0.8}
          color={isDarkMode ? "#00F0FF" : "#0284C7"}
        />
        <Sparkles
          count={30}
          scale={[40, 15, 40]}
          size={4}
          speed={0.4}
          opacity={0.9}
          color={isDarkMode ? "#FFD700" : "#D97706"}
        />

        {/* Post-Processing Effects Pipeline */}
        <EffectComposer disableNormalPass>
          <Bloom
            intensity={isDarkMode ? 1.5 : 0.6}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <ChromaticAberration offset={new THREE.Vector2(0.0008, 0.0008)} />
        </EffectComposer>
      </Canvas>

      {/* Non-Intrusive Hero Vignette Overlay (Guarantees 100% Text Legibility) */}
      <div
        className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-700"
        style={{
          background: isDarkMode
            ? "radial-gradient(circle at 50% 40%, transparent 25%, rgba(5, 7, 13, 0.5) 65%, rgba(2, 3, 7, 0.9) 100%)"
            : "radial-gradient(circle at 50% 40%, transparent 25%, rgba(248, 250, 252, 0.4) 65%, rgba(226, 232, 240, 0.85) 100%)",
        }}
      />
    </div>
  );
};

export default Master3DBackground;
