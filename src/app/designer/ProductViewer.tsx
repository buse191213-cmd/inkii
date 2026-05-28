// @ts-nocheck
"use client";

import { useRef, useEffect, Suspense, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls, Environment, Center, useGLTF, ContactShadows, Decal,
} from "@react-three/drei";
import * as THREE from "three";

/**
 * Multi-Product 3D Viewer.
 * Vier Produkte: T-Shirt (GLB), Hoodie (T-Shirt + Hood), Cap & Tote Bag (primitive geometry).
 */

export type ProductKey = "tshirt" | "hoodie" | "cap" | "tote";

type Pos3D = [number, number, number];
const POSITIONS: Record<ProductKey, Record<string, Pos3D>> = {
  tshirt: {
    "brust-mitte": [0, 0.06, 0.18],
    "brust-links": [-0.09, 0.06, 0.17],
    "brust-rechts": [0.09, 0.06, 0.17],
    "bauch": [0, -0.1, 0.18],
  },
  hoodie: {
    "brust-mitte": [0, 0.0, 0.2],
    "brust-links": [-0.1, 0.0, 0.19],
    "brust-rechts": [0.1, 0.0, 0.19],
    "kapuze": [0, 0.4, -0.05],
  },
  cap: {
    "vorne": [0, 0.05, 0.28],
  },
  tote: {
    "mitte": [0, 0, 0.06],
    "oben": [0, 0.15, 0.06],
  },
};

export const PRODUCT_POSITION_KEYS: Record<ProductKey, string[]> = {
  tshirt: ["brust-links", "brust-mitte", "brust-rechts", "bauch"],
  hoodie: ["brust-links", "brust-mitte", "brust-rechts", "kapuze"],
  cap: ["vorne"],
  tote: ["mitte", "oben"],
};

function useLogoTexture(logoUrl: string | null) {
  const [logoTex, setLogoTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    if (!logoUrl) { setLogoTex(null); return; }
    const loader = new THREE.TextureLoader();
    loader.load(logoUrl, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      setLogoTex(tex);
    });
  }, [logoUrl]);
  return logoTex;
}

function fabricMat(color: string) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={0.95}
      metalness={0}
      envMapIntensity={0.2}
      side={THREE.DoubleSide}
    />
  );
}

/* ===================== T-SHIRT (GLB) ===================== */
function TShirtModel({ color, logoTex, logoScale, posKey }: any) {
  const { nodes } = useGLTF("/models/tshirt.glb") as any;
  const meshes = useMemo(() => {
    if (!nodes) return [];
    const list: THREE.Mesh[] = [];
    Object.values(nodes).forEach((n: any) => { if (n.isMesh && n.geometry) list.push(n); });
    return list;
  }, [nodes]);
  const pos = POSITIONS.tshirt[posKey] || POSITIONS.tshirt["brust-mitte"];
  return (
    <group scale={1.6}>
      {meshes.map((m, i) => (
        <mesh key={m.uuid + i} geometry={m.geometry} position={m.position} rotation={m.rotation}
          scale={m.scale} castShadow receiveShadow>
          {fabricMat(color)}
          {logoTex && i === 0 && (
            <Decal position={pos} rotation={[0, 0, 0]} scale={logoScale * 1.4}
              map={logoTex} polygonOffsetFactor={-10} />
          )}
        </mesh>
      ))}
    </group>
  );
}

/* ===================== HOODIE ===================== */
function HoodieModel({ color, logoTex, logoScale, posKey }: any) {
  const { nodes } = useGLTF("/models/tshirt.glb") as any;
  const meshes = useMemo(() => {
    if (!nodes) return [];
    const list: THREE.Mesh[] = [];
    Object.values(nodes).forEach((n: any) => { if (n.isMesh && n.geometry) list.push(n); });
    return list;
  }, [nodes]);
  const pos = POSITIONS.hoodie[posKey] || POSITIONS.hoodie["brust-mitte"];
  return (
    <group scale={1.7}>
      {/* Gövde: T-Shirt geometry (biraz daha geniş) */}
      {meshes.map((m, i) => (
        <mesh key={m.uuid + i} geometry={m.geometry} position={m.position} rotation={m.rotation}
          scale={m.scale} castShadow receiveShadow>
          {fabricMat(color)}
          {logoTex && i === 0 && posKey !== "kapuze" && (
            <Decal position={pos} rotation={[0, 0, 0]} scale={logoScale * 1.3}
              map={logoTex} polygonOffsetFactor={-10} />
          )}
        </mesh>
      ))}
      {/* Kapüşon: yarım sphere arkada üst */}
      <mesh position={[0, 0.4, -0.05]} castShadow>
        <sphereGeometry args={[0.22, 32, 16, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
        {fabricMat(color)}
        {logoTex && posKey === "kapuze" && (
          <Decal position={[0, 0.05, 0.18]} rotation={[0, 0, 0]} scale={logoScale * 0.8}
            map={logoTex} polygonOffsetFactor={-10} />
        )}
      </mesh>
      {/* Kanguru cebi: hafif kavisli plane (alt göğüs) */}
      <mesh position={[0, -0.15, 0.16]} rotation={[Math.PI * 0.05, 0, 0]} castShadow>
        <planeGeometry args={[0.42, 0.18]} />
        <meshStandardMaterial color={color} roughness={0.97} metalness={0} side={THREE.DoubleSide}
          transparent opacity={0.95} />
      </mesh>
    </group>
  );
}

/* ===================== CAP ===================== */
function CapModel({ color, logoTex, logoScale }: any) {
  return (
    <group scale={2.5} position={[0, -0.05, 0]}>
      {/* Crown - yarım küre */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <sphereGeometry args={[0.25, 48, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        {fabricMat(color)}
        {logoTex && (
          <Decal
            position={[0, 0.05, 0.245]}
            rotation={[0, 0, 0]}
            scale={logoScale * 0.6}
            map={logoTex}
            polygonOffsetFactor={-10}
          />
        )}
      </mesh>
      {/* Yatay bant - cylinder alt çevre */}
      <mesh position={[0, 0.045, 0]} castShadow>
        <cylinderGeometry args={[0.251, 0.251, 0.02, 48, 1, true]} />
        <meshStandardMaterial color={color} roughness={0.95} metalness={0} side={THREE.DoubleSide} />
      </mesh>
      {/* Visor - öne eğik düz plate */}
      <mesh position={[0, 0.04, 0.28]} rotation={[Math.PI / 6, 0, 0]} castShadow>
        <cylinderGeometry args={[0.27, 0.32, 0.015, 48, 1, false, Math.PI * 1.05, Math.PI * 0.9]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>
      {/* Düğme - üstte küçük noktaba */}
      <mesh position={[0, 0.295, 0]} castShadow>
        <sphereGeometry args={[0.012, 16, 8]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </mesh>
    </group>
  );
}

/* ===================== TOTE BAG ===================== */
function ToteBagModel({ color, logoTex, logoScale, posKey }: any) {
  const pos = POSITIONS.tote[posKey] || POSITIONS.tote["mitte"];
  return (
    <group scale={1.4} position={[0, -0.05, 0]}>
      {/* Gövde: hafif bombe box (rounded) */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.55, 0.6, 0.08]} />
        {fabricMat(color)}
        {logoTex && (
          <Decal position={pos} rotation={[0, 0, 0]} scale={logoScale * 1.5}
            map={logoTex} polygonOffsetFactor={-10} />
        )}
      </mesh>
      {/* Sol kulp */}
      <mesh position={[-0.15, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.12, 0.012, 12, 32, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.85} metalness={0} />
      </mesh>
      {/* Sağ kulp */}
      <mesh position={[0.15, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.12, 0.012, 12, 32, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.85} metalness={0} />
      </mesh>
    </group>
  );
}

/* ===================== Outer Wrapper ===================== */
function ProductBody({ product, color, logoUrl, logoScale, positionKey, autoRotate }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const logoTex = useLogoTexture(logoUrl);
  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) groupRef.current.rotation.y += delta * 0.4;
  });
  return (
    <group ref={groupRef as any} dispose={null}>
      {product === "tshirt" && <TShirtModel color={color} logoTex={logoTex} logoScale={logoScale} posKey={positionKey} />}
      {product === "hoodie" && <HoodieModel color={color} logoTex={logoTex} logoScale={logoScale} posKey={positionKey} />}
      {product === "cap" && <CapModel color={color} logoTex={logoTex} logoScale={logoScale} />}
      {product === "tote" && <ToteBagModel color={color} logoTex={logoTex} logoScale={logoScale} posKey={positionKey} />}
    </group>
  );
}

export default function ProductViewer({
  product, color, logoUrl, logoScale, positionKey, autoRotate,
}: {
  product: ProductKey;
  color: string;
  logoUrl: string | null;
  logoScale: number;
  positionKey: string;
  autoRotate: boolean;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 2.5], fov: 25 }}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      shadows
      style={{ width: "100%", height: "100%", background: "transparent" }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 3]} intensity={0.6} castShadow
        shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <directionalLight position={[-3, 2, -3]} intensity={0.2} />
      <directionalLight position={[0, 2, -5]} intensity={0.15} />
      <Suspense fallback={null}>
        <Center>
          <ProductBody product={product} color={color} logoUrl={logoUrl}
            logoScale={logoScale} positionKey={positionKey} autoRotate={autoRotate} />
        </Center>
        <Environment preset="apartment" environmentIntensity={0.2} />
        <ContactShadows position={[0, -0.55, 0]} opacity={0.35} scale={3} blur={2.4} far={1.5} />
      </Suspense>
      <OrbitControls
        enablePan={false}
        minDistance={1.5}
        maxDistance={4}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={(2 * Math.PI) / 3}
      />
    </Canvas>
  );
}

useGLTF.preload("/models/tshirt.glb");
