"use client";
import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import * as THREE from "three";
import confetti from "canvas-confetti";

/* ── Helper: Soft Contact Shadow Texture ────────────────────── */
function createContactShadowTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, "rgba(8, 2, 5, 0.72)");
  grad.addColorStop(0.3, "rgba(8, 2, 5, 0.45)");
  grad.addColorStop(0.6, "rgba(8, 2, 5, 0.18)");
  grad.addColorStop(0.85, "rgba(8, 2, 5, 0.04)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  return texture;
}

/* ── Helper: Embossed Chocolate Plaque Texture ──────────────── */
function createPlaqueTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 196;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Dark Belgian chocolate background
  ctx.fillStyle = "#220e14";
  ctx.beginPath();
  ctx.roundRect(8, 8, 496, 180, 20);
  ctx.fill();

  // Ornate Gold border
  ctx.strokeStyle = "#ffd166";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(14, 14, 484, 168, 16);
  ctx.stroke();

  // Subtle inner gold line
  ctx.strokeStyle = "rgba(255, 209, 102, 0.45)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(22, 22, 468, 152, 12);
  ctx.stroke();

  // Gold embossed typography
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "#ffe082";
  ctx.font = "bold 24px 'Cinzel', Georgia, serif";
  ctx.fillText("HAPPY 23RD BIRTHDAY", 256, 68);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 38px 'Dancing Script', 'Brush Script MT', cursive";
  ctx.fillText("Divija 👑✨", 256, 124);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  return texture;
}

/* ── Single flickering flame + point light ──────────────────── */
function Flame({ pos, phase, blowing }: { pos: [number, number, number]; phase: number; blowing: boolean }) {
  const groupRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);
  const lightRef = useRef<THREE.PointLight>(null!);
  const intensityRef = useRef(1);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime() + phase;

    if (blowing) {
      intensityRef.current = Math.max(0, intensityRef.current - delta * 3.5);
    } else {
      intensityRef.current = Math.min(1, intensityRef.current + delta * 2.2);
    }

    const currentIntensity = intensityRef.current;
    const isVisible = currentIntensity > 0.005;

    if (groupRef.current) {
      groupRef.current.visible = isVisible;
      if (isVisible) {
        const flicker = currentIntensity * (1 + 0.25 * Math.sin(t * 8) + 0.12 * Math.sin(t * 14));
        groupRef.current.scale.set(
          currentIntensity * (1 + 0.1 * Math.sin(t * 9)),
          currentIntensity * (1 + 0.15 * Math.cos(t * 11)),
          currentIntensity * (1 + 0.1 * Math.sin(t * 9))
        );
        if (meshRef.current) {
          (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = Math.max(0, flicker * 2.2);
        }
        if (coreRef.current) {
          (coreRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = Math.max(0, flicker * 3.5);
        }
        if (lightRef.current) {
          lightRef.current.intensity = Math.max(0, flicker * 2.6);
        }
      } else {
        if (lightRef.current) lightRef.current.intensity = 0;
      }
    }
  });

  return (
    <group ref={groupRef} position={pos}>
      {/* Flame outer teardrop */}
      <mesh ref={meshRef} position={[0, 0.2, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.08, 0.35, 14]} />
        <meshStandardMaterial
          color="#ff7700"
          emissive="#ff3300"
          emissiveIntensity={1.8}
          transparent
          opacity={0.94}
        />
      </mesh>
      {/* Inner warm core */}
      <mesh ref={coreRef} position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshStandardMaterial color="#fff066" emissive="#ffbb00" emissiveIntensity={3.5} />
      </mesh>
      {/* Point light */}
      <pointLight ref={lightRef} color="#ffaa22" intensity={2.6} distance={3.2} decay={2} />
    </group>
  );
}

/* ── 3D Confetti burst (instanced boxes) ────────────────────── */
const CONFETTI_COLORS = ["#d4af37", "#f3e5ab", "#80182a", "#c59b27", "#fef08a", "#5c111d"];
const N_CONF = 120;

function ConfettiBurst({ active, onDone }: { active: boolean; onDone: () => void }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const particles = useRef<{ pos: THREE.Vector3; vel: THREE.Vector3; rot: THREE.Euler; rotV: THREE.Euler; life: number; color: THREE.Color }[]>([]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const started = useRef(false);

  useEffect(() => {
    if (active && !started.current) {
      started.current = true;
      particles.current = Array.from({ length: N_CONF }, () => {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const speed = 4 + Math.random() * 6;
        return {
          pos: new THREE.Vector3(0, 2.2, 0),
          vel: new THREE.Vector3(Math.sin(phi) * Math.cos(theta) * speed, (1 + Math.random()) * 4, Math.sin(phi) * Math.sin(theta) * speed),
          rot: new THREE.Euler(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, 0),
          rotV: new THREE.Euler((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, 0),
          life: 1,
          color: new THREE.Color(CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]),
        };
      });
      setTimeout(() => {
        started.current = false;
        onDone();
      }, 2500);
    }
  }, [active, onDone]);

  useFrame((_, delta) => {
    if (!meshRef.current || particles.current.length === 0) return;
    particles.current.forEach((p, i) => {
      p.vel.y -= 9.8 * delta;
      p.pos.addScaledVector(p.vel, delta);
      p.rot.x += p.rotV.x;
      p.rot.y += p.rotV.y;
      p.life -= delta * 0.45;
      dummy.position.copy(p.pos);
      dummy.rotation.copy(p.rot);
      const s = Math.max(0, p.life) * 0.12;
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      meshRef.current.setColorAt(i, p.life > 0 ? p.color : new THREE.Color(0, 0, 0));
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  if (!active && !started.current) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, N_CONF]}>
      <boxGeometry args={[1, 1, 0.1]} />
      <meshStandardMaterial vertexColors />
    </instancedMesh>
  );
}

/* ── Smoke puff after blowing ───────────────────────────────── */
function SmokePuff({ active }: { active: boolean }) {
  const puffs = useRef<{ pos: THREE.Vector3; vel: THREE.Vector3; life: number; maxLife: number; size: number }[]>([]);
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeded = useRef(false);

  useEffect(() => {
    if (active && !seeded.current) {
      seeded.current = true;
      const candles: [number, number][] = [[-0.75, -0.75], [0.75, -0.75], [-0.75, 0.75], [0.75, 0.75]];
      puffs.current = candles.flatMap(([x, z]) =>
        Array.from({ length: 8 }, () => ({
          pos: new THREE.Vector3(x + (Math.random() - 0.5) * 0.12, 3.55 + Math.random() * 0.1, z + (Math.random() - 0.5) * 0.12),
          vel: new THREE.Vector3((Math.random() - 0.5) * 0.2, 0.55 + Math.random() * 0.6, (Math.random() - 0.5) * 0.2),
          life: 1,
          maxLife: 1.4 + Math.random() * 0.8,
          size: 0.05 + Math.random() * 0.07,
        }))
      );
    }
    if (!active) seeded.current = false;
  }, [active]);

  useFrame((_, delta) => {
    if (!meshRef.current || puffs.current.length === 0) return;
    puffs.current.forEach((p, i) => {
      if (p.life > 0) {
        p.life -= delta / p.maxLife;
        p.pos.addScaledVector(p.vel, delta);
        p.pos.x += Math.sin(p.pos.y * 3) * delta * 0.15;
        dummy.position.copy(p.pos);
        const s = Math.sin(Math.max(0, p.life) * Math.PI) * p.size * 3.5;
        dummy.scale.setScalar(Math.max(0, s));
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      } else {
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 32]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial color="#cccccc" transparent opacity={0.35} roughness={0.9} />
    </instancedMesh>
  );
}

/* ── Realistic Dripping Berry Ganache Component ─────────────── */
function DripGanache({
  radius,
  y,
  color,
  drips,
}: {
  radius: number;
  y: number;
  color: string;
  drips: number[];
}) {
  const n = drips.length;
  return (
    <group position={[0, y, 0]}>
      {/* Top Glossy Ganache Pool Rim */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <torusGeometry args={[radius - 0.02, 0.08, 16, 48]} />
        <meshStandardMaterial color={color} roughness={0.16} metalness={0.12} />
      </mesh>
      {/* Top Pool Cap */}
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[radius - 0.04, radius - 0.04, 0.04, 40]} />
        <meshStandardMaterial color={color} roughness={0.18} metalness={0.1} />
      </mesh>

      {/* Individual cascading drip droplets */}
      {drips.map((len, i) => {
        const angle = (i / n) * Math.PI * 2;
        const x = Math.cos(angle) * (radius + 0.01);
        const z = Math.sin(angle) * (radius + 0.01);
        return (
          <group key={i} position={[x, 0, z]}>
            {/* Drip stem */}
            <mesh position={[0, -len / 2, 0]}>
              <cylinderGeometry args={[0.07, 0.045, len, 10]} />
              <meshStandardMaterial color={color} roughness={0.16} metalness={0.12} />
            </mesh>
            {/* Rounded droplet bulb tip */}
            <mesh position={[0, -len, 0]}>
              <sphereGeometry args={[0.065, 10, 10]} />
              <meshStandardMaterial color={color} roughness={0.15} metalness={0.15} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* ── Piped Buttercream Rosette Swirl with Gold Pearl ────────── */
function PipedRosette({ pos, scale = 1 }: { pos: [number, number, number]; scale?: number }) {
  return (
    <group position={pos} scale={scale}>
      {/* Buttercream spiral star base */}
      <mesh position={[0, 0.06, 0]} rotation={[0, Math.random() * Math.PI, 0]}>
        <coneGeometry args={[0.13, 0.16, 8]} />
        <meshStandardMaterial color="#fffef7" roughness={0.42} />
      </mesh>
      {/* Swirled fluff */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.09, 0.05, 8, 12]} />
        <meshStandardMaterial color="#fff8ee" roughness={0.45} />
      </mesh>
      {/* Crown gold pearl */}
      <mesh position={[0, 0.16, 0]}>
        <sphereGeometry args={[0.038, 10, 10]} />
        <meshStandardMaterial color="#d4af37" roughness={0.15} metalness={0.92} />
      </mesh>
    </group>
  );
}

/* ── Handcrafted Glazed Ruby Strawberry ─────────────────────── */
function GlazedStrawberry({ pos, rot = [0, 0, 0], scale = 1 }: { pos: [number, number, number]; rot?: [number, number, number]; scale?: number }) {
  return (
    <group position={pos} rotation={rot} scale={scale}>
      {/* Berry ruby-red body */}
      <mesh position={[0, 0.2, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.19, 0.42, 16]} />
        <meshStandardMaterial color="#c81e3a" roughness={0.22} metalness={0.08} />
      </mesh>
      {/* Rounded berry shoulder */}
      <mesh position={[0, 0.22, 0]}>
        <sphereGeometry args={[0.18, 14, 14]} />
        <meshStandardMaterial color="#b91c32" roughness={0.25} />
      </mesh>
      {/* Fresh green calyx leaves (5-star cluster) */}
      {Array.from({ length: 5 }).map((_, i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.1, 0.36, Math.sin(a) * 0.1]}
            rotation={[0.3, a, 0.2]}
          >
            <coneGeometry args={[0.05, 0.14, 4]} />
            <meshStandardMaterial color="#467a36" roughness={0.6} />
          </mesh>
        );
      })}
      {/* Tiny stem */}
      <mesh position={[0, 0.44, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.12, 6]} />
        <meshStandardMaterial color="#355e28" roughness={0.7} />
      </mesh>
    </group>
  );
}

/* ── Artisanal French Macaron ───────────────────────────────── */
function FrenchMacaron({
  pos,
  rot = [0, 0, 0],
  shellColor,
  creamColor = "#fff7ed",
}: {
  pos: [number, number, number];
  rot?: [number, number, number];
  shellColor: string;
  creamColor?: string;
}) {
  return (
    <group position={pos} rotation={rot} scale={0.9}>
      {/* Top domed shell */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.22, 0.24, 0.1, 20]} />
        <meshStandardMaterial color={shellColor} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.13, 0]}>
        <sphereGeometry args={[0.22, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
        <meshStandardMaterial color={shellColor} roughness={0.35} />
      </mesh>

      {/* Ruffled foot (pied) */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.23, 0.025, 8, 20]} />
        <meshStandardMaterial color={shellColor} roughness={0.6} />
      </mesh>

      {/* Buttercream filling */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.21, 0.21, 0.06, 20]} />
        <meshStandardMaterial color={creamColor} roughness={0.4} />
      </mesh>

      {/* Bottom domed shell */}
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.24, 0.22, 0.1, 20]} />
        <meshStandardMaterial color={shellColor} roughness={0.35} />
      </mesh>
    </group>
  );
}

/* ── Embossed Chocolate & Gold Plaque ("Happy 23rd Birthday · Divija 👑") ── */
function CakePlaque({ plaqueTexture }: { plaqueTexture: THREE.CanvasTexture | null }) {
  if (!plaqueTexture) return null;
  return (
    <group position={[0, 0.88, 2.52]} rotation={[-0.08, 0, 0]}>
      {/* Plaque backplate */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[1.9, 0.72]} />
        <meshStandardMaterial
          map={plaqueTexture}
          roughness={0.3}
          metalness={0.35}
          polygonOffset
          polygonOffsetFactor={-1}
        />
      </mesh>
      {/* Plaque delicate gold rim frame */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[1.96, 0.78]} />
        <meshStandardMaterial color="#ffd166" roughness={0.2} metalness={0.9} />
      </mesh>
    </group>
  );
}

/* ── Sliced Wedge that pulls out onto a Golden Saucer ───────── */
function SlicedWedge({ sliced }: { sliced: boolean }) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const targetZ = sliced ? 0.95 : 0;
    const targetY = sliced ? -0.15 : 0;
    groupRef.current.position.z += (targetZ - groupRef.current.position.z) * Math.min(1, delta * 3.2);
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * Math.min(1, delta * 3.2);
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {sliced && (
        <group position={[0, 2.05, 1.45]}>
          {/* Top vanilla frosting */}
          <mesh position={[0, 0.55, 0]}>
            <cylinderGeometry args={[0.42, 0.48, 0.1, 3, 1, false, -Math.PI / 6, Math.PI / 3]} />
            <meshStandardMaterial color="#fff5ec" roughness={0.36} />
          </mesh>
          {/* Yellow sponge cake */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.45, 0.45, 1.0, 3, 1, false, -Math.PI / 6, Math.PI / 3]} />
            <meshStandardMaterial color="#fef08a" roughness={0.5} />
          </mesh>
          {/* Strawberry jam layer */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.452, 0.452, 0.12, 3, 1, false, -Math.PI / 6, Math.PI / 3]} />
            <meshStandardMaterial color="#e11d48" roughness={0.3} />
          </mesh>
          {/* Gold dessert saucer */}
          <mesh position={[0, -0.54, 0]}>
            <cylinderGeometry args={[0.62, 0.65, 0.05, 24]} />
            <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.9} />
          </mesh>
          {/* Strawberry crown on slice */}
          <mesh position={[0, 0.66, 0]}>
            <sphereGeometry args={[0.1, 10, 10]} />
            <meshStandardMaterial color="#dc2626" roughness={0.25} />
          </mesh>
        </group>
      )}
    </group>
  );
}

/* ── Ceremonial Golden Cake Knife ───────────────────────────── */
function GoldenKnife({ active }: { active: boolean }) {
  const knifeRef = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    if (!knifeRef.current || !active) return;
    const t = clock.getElapsedTime() * 3.5;
    knifeRef.current.position.y = 3.2 + Math.sin(t) * 0.35;
    knifeRef.current.rotation.z = Math.sin(t) * 0.1;
  });

  if (!active) return null;

  return (
    <group ref={knifeRef} position={[0.3, 3.2, 1.4]} rotation={[0.2, 0, 0.3]}>
      {/* Gold blade */}
      <mesh position={[0, -0.55, 0]}>
        <boxGeometry args={[0.05, 1.2, 0.28]} />
        <meshStandardMaterial color="#ffd700" roughness={0.15} metalness={0.96} />
      </mesh>
      {/* Rosewood handle */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.07, 0.06, 0.6, 16]} />
        <meshStandardMaterial color="#4a1525" roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ── Full Realistic Artisan Birthday Cake ───────────────────── */
function BirthdayCake({
  blown,
  sliced = false,
  cutting = false,
  showConfetti,
  onConfettiDone,
  shadowTexture,
  plaqueTexture,
}: {
  blown: boolean;
  sliced?: boolean;
  cutting?: boolean;
  showConfetti: boolean;
  onConfettiDone: () => void;
  shadowTexture: THREE.Texture;
  plaqueTexture: THREE.CanvasTexture | null;
}) {
  const candlePositions: [number, number, number][] = [
    [-0.75, 3.48, -0.75],
    [0.75, 3.48, -0.75],
    [-0.75, 3.48, 0.75],
    [0.75, 3.48, 0.75],
  ];

  // Natural varying drip lengths
  const tier1Drips = [0.45, 0.22, 0.65, 0.3, 0.8, 0.25, 0.55, 0.35, 0.7, 0.2, 0.48, 0.32, 0.75, 0.28, 0.6, 0.38];
  const tier2Drips = [0.4, 0.2, 0.58, 0.25, 0.5, 0.32, 0.62, 0.22, 0.45, 0.28, 0.52, 0.35];

  return (
    <group position={[0, -1.35, 0]}>

      {/* ── 1. Gala Banquet Smoked Obsidian Tabletop Disc ── */}
      <group position={[0, -0.62, 0]}>
        {/* Polished dark obsidian table disc */}
        <mesh position={[0, 0, 0]} receiveShadow>
          <cylinderGeometry args={[3.3, 3.4, 0.08, 48]} />
          <meshStandardMaterial
            color="#12060f"
            roughness={0.2}
            metalness={0.4}
          />
        </mesh>
        {/* Subtle gold beveled rim around table edge */}
        <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3.32, 0.025, 12, 48]} />
          <meshStandardMaterial color="#d4af37" roughness={0.25} metalness={0.9} />
        </mesh>
        {/* Soft, tight contact shadow strictly under the pedestal foot on the tabletop */}
        <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.0, 3.0]} />
          <meshBasicMaterial map={shadowTexture} transparent opacity={0.55} depthWrite={false} />
        </mesh>
        {/* Warm golden candlelight bounce onto the table */}
        <pointLight position={[0, 0.5, 0]} intensity={0.45} color="#fcd34d" distance={4} />
      </group>

      {/* ── 2. Heavy Fluted Fine-Bone Porcelain Pedestal Stand ── */}
      {/* Fluted Base Foot */}
      <mesh position={[0, -0.54, 0]}>
        <cylinderGeometry args={[1.35, 1.75, 0.12, 40]} />
        <meshStandardMaterial color="#fffef9" roughness={0.25} metalness={0.15} />
      </mesh>
      {/* Gold Trim Ring around Foot Base */}
      <mesh position={[0, -0.56, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.72, 0.03, 12, 40]} />
        <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.92} />
      </mesh>

      {/* Sculpted Fluted Pedestal Stem */}
      <mesh position={[0, -0.34, 0]}>
        <cylinderGeometry args={[0.55, 1.15, 0.26, 36]} />
        <meshStandardMaterial color="#f7f1e6" roughness={0.28} metalness={0.2} />
      </mesh>
      {/* Mid-stem Ornate Gold Collar Ring */}
      <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.58, 0.045, 14, 36]} />
        <meshStandardMaterial color="#d4af37" roughness={0.18} metalness={0.95} />
      </mesh>
      {/* Upper Flared Pedestal Capital */}
      <mesh position={[0, -0.06, 0]}>
        <cylinderGeometry args={[1.8, 0.55, 0.24, 36]} />
        <meshStandardMaterial color="#fcf8f0" roughness={0.26} metalness={0.18} />
      </mesh>
      {/* Secondary Gold Ring under Platter */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.82, 0.035, 12, 40]} />
        <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.92} />
      </mesh>

      {/* Pedestal Top Platter (Serving Deck) */}
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[3.2, 3.35, 0.16, 44]} />
        <meshStandardMaterial color="#fffef9" roughness={0.22} metalness={0.15} />
      </mesh>
      {/* Platter Gold Fluted Outer Rim */}
      <mesh position={[0, 0.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.24, 0.055, 16, 48]} />
        <meshStandardMaterial color="#d4af37" roughness={0.18} metalness={0.95} />
      </mesh>

      {/* ── 3. TIER 1 (Grand Base Tier - Vanilla Bean Buttercream) ── */}
      {/* Sponge Cake Body */}
      <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.5, 2.5, 1.3, 40]} />
        <meshStandardMaterial color="#fcf8f0" roughness={0.38} />
      </mesh>
      {/* Soft rounded bottom whipped edge */}
      <mesh position={[0, 0.24, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.08, 16, 48]} />
        <meshStandardMaterial color="#f7efe0" roughness={0.4} />
      </mesh>
      {/* Bottom pearl buttercream border */}
      {Array.from({ length: 28 }).map((_, i) => {
        const a = (i / 28) * Math.PI * 2;
        return (
          <mesh key={`p1-${i}`} position={[Math.cos(a) * 2.55, 0.25, Math.sin(a) * 2.55]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#fffcf5" roughness={0.35} />
          </mesh>
        );
      })}

      {/* Embossed Gold Plaque on Front: "Happy 23rd Birthday · Divija 👑" */}
      <CakePlaque plaqueTexture={plaqueTexture} />

      {/* Tier 1 Cascading Glossy Ruby-Rosé Drip Ganache */}
      <DripGanache radius={2.52} y={1.5} color="#9e1b38" drips={tier1Drips} />

      {/* ── 4. TIER 2 (Top Tier - Rosé Champagne Cream) ── */}
      {/* Sponge Cake Body */}
      <mesh position={[0, 2.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.7, 1.7, 1.1, 40]} />
        <meshStandardMaterial color="#fff5ec" roughness={0.36} />
      </mesh>
      {/* Soft rounded bottom whipped edge */}
      <mesh position={[0, 1.54, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.7, 0.07, 16, 48]} />
        <meshStandardMaterial color="#fbece2" roughness={0.4} />
      </mesh>
      {/* Middle step pearl border */}
      {Array.from({ length: 20 }).map((_, i) => {
        const a = (i / 20) * Math.PI * 2;
        return (
          <mesh key={`p2-${i}`} position={[Math.cos(a) * 1.75, 1.55, Math.sin(a) * 1.75]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#fffaf2" roughness={0.35} />
          </mesh>
        );
      })}

      {/* Tier 2 Cascading Glossy Ruby-Rosé Drip Ganache */}
      <DripGanache radius={1.72} y={2.6} color="#9e1b38" drips={tier2Drips} />

      {/* ── 5. French Macarons on the Tier Step ── */}
      <FrenchMacaron pos={[1.88, 1.62, 0.65]} rot={[0.15, 0.8, -0.1]} shellColor="#e28c9b" />
      <FrenchMacaron pos={[-1.78, 1.62, 0.85]} rot={[-0.1, -0.6, 0.2]} shellColor="#a8c99c" />
      <FrenchMacaron pos={[0.45, 1.62, -1.95]} rot={[0.2, 2.4, 0.1]} shellColor="#d9ad5c" />

      {/* ── 6. Piped Buttercream Rosettes with Gold Pearls (Top Rim) ── */}
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return (
          <PipedRosette
            key={`rosette-${i}`}
            pos={[Math.cos(a) * 1.52, 2.62, Math.sin(a) * 1.52]}
            scale={1.1}
          />
        );
      })}

      {/* ── 7. Fresh Glazed Ruby Strawberries on Top Deck ── */}
      <GlazedStrawberry pos={[0, 2.65, 0.45]} rot={[0.1, 0.2, 0.05]} scale={1.1} />
      <GlazedStrawberry pos={[-0.45, 2.65, -0.2]} rot={[-0.15, 1.5, 0.1]} scale={1.0} />
      <GlazedStrawberry pos={[0.42, 2.65, -0.22]} rot={[0.05, -1.8, -0.1]} scale={1.05} />
      <GlazedStrawberry pos={[0, 2.65, -0.6]} rot={[-0.1, 3.1, 0.08]} scale={0.95} />

      {/* ── 8. Slender Spiral Gold Luxury Candles ── */}
      {candlePositions.map((pos, i) => (
        <group key={`c-taper-${i}`} position={[pos[0], 2.65, pos[2]]}>
          {/* Taper body */}
          <mesh position={[0, 0.42, 0]}>
            <cylinderGeometry args={[0.055, 0.065, 0.85, 16]} />
            <meshStandardMaterial color="#fffbf2" roughness={0.3} metalness={0.2} />
          </mesh>
          {/* Spiral gold foil ribbing */}
          <mesh position={[0, 0.25, 0]} rotation={[-Math.PI / 2.3, 0, 0]}>
            <torusGeometry args={[0.068, 0.012, 8, 24]} />
            <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.95} />
          </mesh>
          <mesh position={[0, 0.55, 0]} rotation={[-Math.PI / 2.3, 0, 0]}>
            <torusGeometry args={[0.062, 0.012, 8, 24]} />
            <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.95} />
          </mesh>
          {/* Candle wick */}
          <mesh position={[0, 0.88, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.1, 6]} />
            <meshStandardMaterial color="#2d1515" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* ── 9. Candle Flames ── */}
      {candlePositions.map((pos, i) => (
        <Flame key={`flame-${i}`} pos={pos} phase={i * 1.3} blowing={blown} />
      ))}

      {/* ── 10. Smoke Wisps when Blown ── */}
      <SmokePuff active={blown} />

      {/* ── 11. Sliced Cake Wedge & Ceremonial Knife ── */}
      <SlicedWedge sliced={sliced} />
      <GoldenKnife active={cutting} />

      {/* ── 12. 3D Confetti Cannon ── */}
      <ConfettiBurst active={showConfetti} onDone={onConfettiDone} />
    </group>
  );
}

export interface CakeTransform {
  x: number;
  y: number;
  z: number;
  scale: number;
  rotationY: number;
}

/* ── Ground Plane Hit-Tester for AR Tap-to-Place ────────────── */
function GroundHitPlane({
  isARMode,
  onHit,
}: {
  isARMode: boolean;
  onHit?: (point: THREE.Vector3) => void;
}) {
  if (!isARMode || !onHit) return null;
  return (
    <mesh
      position={[0, -2.1, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      visible={false}
      onPointerDown={(e) => {
        // Prevent event bubbling if dragging
        e.stopPropagation();
        onHit(e.point);
      }}
    >
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

/* ── Full R3F Scene ─────────────────────────────────────────── */
function CakeR3FScene({
  blown,
  sliced = false,
  cutting = false,
  showConfetti,
  onConfettiDone,
  shadowTexture,
  plaqueTexture,
  autoRotate = false,
  isARMode = false,
  isMobile = false,
  cakeTransform,
  onPlaneHit,
}: {
  blown: boolean;
  sliced?: boolean;
  cutting?: boolean;
  showConfetti: boolean;
  onConfettiDone: () => void;
  shadowTexture: THREE.Texture;
  plaqueTexture: THREE.CanvasTexture | null;
  autoRotate?: boolean;
  isARMode?: boolean;
  isMobile?: boolean;
  cakeTransform?: CakeTransform;
  onPlaneHit?: (point: THREE.Vector3) => void;
}) {
  const currentTransform: CakeTransform = cakeTransform ?? {
    x: 0,
    y: isARMode ? -1.55 : -1.05,
    z: 0,
    scale: isARMode ? 0.88 : 0.94,
    rotationY: 0,
  };

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 10, 7]} intensity={1.65} color="#fff3e0" castShadow={false} />
      <directionalLight position={[-6, 6, -5]} intensity={0.55} color="#e5c158" />
      <pointLight position={[0, 5.5, 3]} intensity={1.2} color="#fff6e8" />

      {/* Tap-to-place ground hit plane in AR mode */}
      <GroundHitPlane isARMode={isARMode} onHit={onPlaneHit} />

      <Float speed={0} floatIntensity={0}>
        {/* Dynamic User-Controlled / Tabletop Anchor Group */}
        <group
          position={[currentTransform.x, currentTransform.y, currentTransform.z]}
          scale={currentTransform.scale}
          rotation={[0, currentTransform.rotationY, 0]}
        >
          <BirthdayCake
            blown={blown}
            sliced={sliced}
            cutting={cutting}
            showConfetti={showConfetti}
            onConfettiDone={onConfettiDone}
            shadowTexture={shadowTexture}
            plaqueTexture={plaqueTexture}
          />

          {/* AR Tabletop Surface Reticle (Ground-plane indicator when in AR Camera mode) */}
          {isARMode && (
            <group position={[0, -0.63, 0]}>
              {/* Outer glowing gold reticle ring */}
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[3.38, 3.48, 64]} />
                <meshBasicMaterial color="#ffd166" transparent opacity={0.65} side={THREE.DoubleSide} />
              </mesh>
              {/* Secondary delicate starlight accent ring */}
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[3.72, 3.76, 48]} />
                <meshBasicMaterial color="#d4af37" transparent opacity={0.35} side={THREE.DoubleSide} />
              </mesh>
              {/* 4 Cardinal Surface Markers */}
              {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, idx) => (
                <mesh
                  key={idx}
                  position={[Math.cos(angle) * 3.6, 0.01, Math.sin(angle) * 3.6]}
                  rotation={[-Math.PI / 2, 0, angle]}
                >
                  <planeGeometry args={[0.32, 0.05]} />
                  <meshBasicMaterial color="#ffd700" transparent opacity={0.7} side={THREE.DoubleSide} />
                </mesh>
              ))}
            </group>
          )}
        </group>
      </Float>

      {/* Orbit controls with camera focused on visual center (active only on desktop studio view) */}
      <OrbitControls
        enabled={!isARMode && !isMobile}
        enablePan={false}
        enableZoom={false}
        enableRotate={!isMobile}
        autoRotate={false}
        target={[0, isARMode ? -0.8 : 0.26, 0]}
        minPolarAngle={Math.PI / 4.2}
        maxPolarAngle={Math.PI / 2.08}
      />
    </>
  );
}

/* ── WebGL detection ───────────────────────────────────────── */
function canUseWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch { return false; }
}

/* ── Public export ─────────────────────────────────────────── */
export default function CakeScene({
  blown,
  sliced = false,
  cutting = false,
  confettiTrigger = 0,
  autoRotate = false,
  onToggleBlow,
  isARMode = false,
  cakeTransform,
  onPlaneHit,
}: {
  blown: boolean;
  sliced?: boolean;
  cutting?: boolean;
  confettiTrigger?: number;
  autoRotate?: boolean;
  onToggleBlow?: () => void;
  isARMode?: boolean;
  cakeTransform?: CakeTransform;
  onPlaneHit?: (point: THREE.Vector3) => void;
}) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(hover: none) and (pointer: coarse)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const shadowTexture = useMemo(() => {
    if (typeof document === "undefined") return null;
    return createContactShadowTexture();
  }, []);

  const plaqueTexture = useMemo(() => {
    if (typeof document === "undefined") return null;
    return createPlaqueTexture();
  }, []);

  useEffect(() => {
    setHasWebGL(canUseWebGL());
  }, []);

  // Direct Confetti Cannon trigger
  useEffect(() => {
    if (confettiTrigger === 0) return;
    setShowConfetti(true);
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.55 },
      colors: ["#d4af37", "#f3e5ab", "#80182a", "#c59b27", "#fef08a", "#ff4d6d"],
    });
  }, [confettiTrigger]);

  if (!hasWebGL || !shadowTexture) {
    return (
      <div className="webgl-fallback">
        <div style={{ textAlign: "center", padding: 20 }}>
          <div style={{ fontSize: "4rem", marginBottom: 12 }}>🎂</div>
          <p style={{ color: "#fcd34d", fontFamily: "Playfair Display, serif", fontSize: "1.2rem" }}>
            Divija&apos;s 23rd Birthday Cake<br />
            <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
              (WebGL not available — upgrade your browser for 3D!)
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <Canvas
      id="cake-three-canvas"
      className="cake-three-canvas"
      dpr={isMobile ? [1, 1.15] : [1, 1.5]}
      camera={{ position: [0, 1.35, 9.2], fov: 44 }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
      gl={{
        antialias: !isMobile,
        alpha: true,
        powerPreference: isMobile ? "default" : "high-performance",
        preserveDrawingBuffer: true,
      }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener(
          "webglcontextlost",
          (e) => {
            e.preventDefault();
            console.warn("WebGL context lost - handled cleanly without crash");
          },
          false
        );
      }}
      onClick={onToggleBlow}
    >
      <CakeR3FScene
        blown={blown}
        sliced={sliced}
        cutting={cutting}
        showConfetti={showConfetti}
        onConfettiDone={() => setShowConfetti(false)}
        shadowTexture={shadowTexture}
        plaqueTexture={plaqueTexture}
        autoRotate={autoRotate}
        isARMode={isARMode}
        isMobile={isMobile}
        cakeTransform={cakeTransform}
        onPlaneHit={onPlaneHit}
      />
    </Canvas>
  );
}
