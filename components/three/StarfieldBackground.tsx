"use client";
import { useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ── Helper: High-Res Soft Gaussian Champagne Bokeh Texture ─── */
function createChampagneBokehTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, "rgba(255, 255, 255, 1)");
  grad.addColorStop(0.18, "rgba(255, 245, 220, 0.95)");
  grad.addColorStop(0.45, "rgba(255, 225, 160, 0.45)");
  grad.addColorStop(0.72, "rgba(240, 195, 90, 0.12)");
  grad.addColorStop(0.9, "rgba(212, 175, 55, 0.02)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

/* ── Camera parallax on mouse move ─────────────────────────── */
function CameraParallax() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useFrame(() => {
    camera.position.x += (mouse.current.x * 0.4 - camera.position.x) * 0.025;
    camera.position.y += (mouse.current.y * 0.25 - camera.position.y) * 0.025;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/* ── Floating Champagne Effervescence (Upward Drifting Bokeh) ─── */
function ChampagneEffervescence({ bokehTexture }: { bokehTexture: THREE.Texture }) {
  const count = 90;
  const meshRef = useRef<THREE.Points>(null);

  const [positions, speeds, phases] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const phs = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
      spd[i] = 0.04 + Math.random() * 0.08;
      phs[i] = Math.random() * Math.PI * 2;
    }
    return [pos, spd, phs];
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 2.8,
        color: new THREE.Color("#fef08a"),
        transparent: true,
        opacity: 0.45,
        map: bokehTexture,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [bokehTexture]
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const posAttr = meshRef.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const elapsed = clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      // Float upward gently
      arr[i * 3 + 1] += speeds[i];
      // Subtle horizontal sway
      arr[i * 3] += Math.sin(elapsed * 0.8 + phases[i]) * 0.015;

      // Wrap around when rising past top
      if (arr[i * 3 + 1] > 22) {
        arr[i * 3 + 1] = -22;
        arr[i * 3] = (Math.random() - 0.5) * 50;
      }
    }
    posAttr.needsUpdate = true;
  });

  return <points ref={meshRef} geometry={geometry} material={material} />;
}

/* ── Deep Gala Cosmic Stardust (Soft Circular Embers) ────────── */
function SoftStardustLayer({
  count,
  radius,
  size,
  color,
  opacity,
  bokehTexture,
}: {
  count: number;
  radius: number;
  size: number;
  color: string;
  opacity: number;
  bokehTexture: THREE.Texture;
}) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = radius * (0.35 + Math.random() * 0.65);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [count, radius]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size,
        color: new THREE.Color(color),
        transparent: true,
        opacity,
        map: bokehTexture,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [size, color, opacity, bokehTexture]
  );

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.008;
      ref.current.rotation.x += delta * 0.003;
    }
  });

  return <points ref={ref} geometry={geometry} material={material} />;
}

/* ── Lush Large Background Bokeh Orbs (Out of Focus Dream) ───── */
function LargeAmbientBokeh({ bokehTexture }: { bokehTexture: THREE.Texture }) {
  const count = 35;
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 60;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 45;
      arr[i * 3 + 2] = -15 + (Math.random() - 0.5) * 20;
    }
    return arr;
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 7.5,
        color: new THREE.Color("#d4af37"),
        transparent: true,
        opacity: 0.18,
        map: bokehTexture,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [bokehTexture]
  );

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y -= delta * 0.004;
    }
  });

  return <points ref={ref} geometry={geometry} material={material} />;
}

/* ── Cinema Gala Ambient Scene ─────────────────────────────── */
function GalaStardustScene({ bokehTexture, isMobile }: { bokehTexture: THREE.Texture; isMobile?: boolean }) {
  return (
    <>
      {/* 1. Large dreamy ambient out-of-focus bokeh orbs */}
      <LargeAmbientBokeh bokehTexture={bokehTexture} />

      {/* 2. Upward drifting effervescent champagne bubbles */}
      <ChampagneEffervescence bokehTexture={bokehTexture} />

      {/* 3. Deep cosmic golden stardust — reduced on mobile */}
      <SoftStardustLayer
        count={isMobile ? 200 : 550}
        radius={45}
        size={isMobile ? 2.0 : 1.6}
        color="#f3e5ab"
        opacity={0.65}
        bokehTexture={bokehTexture}
      />

      {/* 4. Warm amber-gold midground embers — reduced on mobile */}
      <SoftStardustLayer
        count={isMobile ? 100 : 280}
        radius={35}
        size={isMobile ? 2.8 : 2.4}
        color="#d4af37"
        opacity={0.55}
        bokehTexture={bokehTexture}
      />

      {/* 5. Foreground radiant sparks — reduced on mobile */}
      <SoftStardustLayer
        count={isMobile ? 30 : 80}
        radius={22}
        size={isMobile ? 4.0 : 3.6}
        color="#fef08a"
        opacity={0.7}
        bokehTexture={bokehTexture}
      />

      {/* Camera subtle mouse parallax — skip on touch devices */}
      {!isMobile && <CameraParallax />}
    </>
  );
}

/* ── Main Export ───────────────────────────────────────────── */
export default function StarfieldBackground() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const bokehTexture = useMemo(() => {
    if (typeof document === "undefined") return null;
    return createChampagneBokehTexture();
  }, [mounted]);

  useEffect(() => {
    setMounted(true);
    // Detect mobile/touch to reduce GPU load
    const mq = window.matchMedia("(hover: none) and (pointer: coarse)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (!mounted || !bokehTexture) return null;

  // On mobile: limit pixel ratio to 1x (vs 2x retina) — saves ~50% GPU fill
  const dprRange: [number, number] = isMobile ? [1, 1] : [1, 2];

  return (
    <div className="canvas-fixed-bg" style={{ zIndex: 0 }}>
      <Canvas
        dpr={dprRange}
        camera={{ position: [0, 0, 15], fov: 60 }}
        style={{ width: "100%", height: "100%" }}
        gl={{
          antialias: !isMobile,
          powerPreference: "high-performance",
          alpha: true,
        }}
      >
        <GalaStardustScene bokehTexture={bokehTexture} isMobile={isMobile} />
      </Canvas>
    </div>
  );
}

