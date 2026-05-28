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

  // Kapüşon: LatheGeometry ile gerçek kapüşon profili (arkaya yatık oval)
  const hoodGeo = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    const segs = 16;
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const angle = t * Math.PI * 0.95;
      const r = 0.2 * Math.sin(angle) + 0.001;
      const y = 0.24 * Math.cos(angle);
      pts.push(new THREE.Vector2(Math.max(r, 0.001), y));
    }
    return new THREE.LatheGeometry(pts, 40);
  }, []);

  // Drawstring (ip): iki ince tüp
  const stringGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.04, 0.08, 0.16),
      new THREE.Vector3(-0.045, -0.05, 0.17),
      new THREE.Vector3(-0.05, -0.14, 0.16),
    ]);
    return new THREE.TubeGeometry(curve, 20, 0.006, 6, false);
  }, []);

  return (
    <group scale={1.7}>
      {/* Gövde: T-Shirt geometry */}
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
      {/* Kapüşon: yatık oval, boyna oturur */}
      <mesh geometry={hoodGeo} position={[0, 0.28, -0.04]} rotation={[-0.35, 0, 0]} castShadow>
        {fabricMat(color)}
        {logoTex && posKey === "kapuze" && (
          <Decal position={[0, 0.08, 0.16]} rotation={[0, 0, 0]} scale={logoScale * 0.7}
            map={logoTex} polygonOffsetFactor={-10} />
        )}
      </mesh>
      {/* Kanguru cebi: alt göğüste hafif kavisli, belirgin dikiş */}
      <mesh position={[0, -0.14, 0.165]} rotation={[Math.PI * 0.04, 0, 0]} castShadow>
        <boxGeometry args={[0.4, 0.16, 0.025]} />
        <meshStandardMaterial color={color} roughness={0.97} metalness={0} side={THREE.DoubleSide} />
      </mesh>
      {/* Drawstring ipler */}
      <mesh geometry={stringGeo} castShadow>
        <meshStandardMaterial color="#ffffff" roughness={0.7} />
      </mesh>
      <mesh geometry={stringGeo} scale={[-1, 1, 1]} castShadow>
        <meshStandardMaterial color="#ffffff" roughness={0.7} />
      </mesh>
    </group>
  );
}

/* ===================== CAP ===================== */
function CapModel({ color, logoTex, logoScale }: any) {
  // Crown: LatheGeometry ile gerçek beyzbol şapkası profili (6-panel kavis)
  const crownGeo = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    const segs = 20;
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      // Hafif basık kubbe — gerçek cap silüeti
      const angle = t * Math.PI * 0.5;
      const r = 0.26 * Math.sin(angle) * (1 - 0.12 * Math.sin(angle)) + 0.001;
      const y = 0.2 * Math.cos(angle);
      pts.push(new THREE.Vector2(Math.max(r, 0.001), y));
    }
    return new THREE.LatheGeometry(pts, 48);
  }, []);

  // Visor: ExtrudeGeometry ile kavisli yarım-ay siperlik
  const visorGeo = useMemo(() => {
    const shape = new THREE.Shape();
    const rOuter = 0.34, rInner = 0.24;
    shape.absarc(0, 0, rOuter, Math.PI * 1.18, Math.PI * 1.82, false);
    shape.absarc(0, -0.02, rInner, Math.PI * 1.82, Math.PI * 1.18, true);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.012, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2,
    });
    geo.center();
    return geo;
  }, []);

  return (
    <group scale={2.4} position={[0, -0.08, 0]}>
      {/* Crown */}
      <mesh geometry={crownGeo} position={[0, 0.02, 0]} castShadow>
        {fabricMat(color)}
        {logoTex && (
          <Decal position={[0, 0.08, 0.25]} rotation={[0, 0, 0]} scale={logoScale * 0.5}
            map={logoTex} polygonOffsetFactor={-10} />
        )}
      </mesh>
      {/* Visor (siperlik) — öne ve hafif aşağı eğik */}
      <mesh geometry={visorGeo} position={[0, 0.0, 0.22]} rotation={[Math.PI * 0.52, 0, 0]} castShadow>
        <meshStandardMaterial color={color} roughness={0.65} metalness={0.02} side={THREE.DoubleSide} />
      </mesh>
      {/* Üst düğme */}
      <mesh position={[0, 0.205, 0]} castShadow>
        <sphereGeometry args={[0.013, 16, 12]} />
        {fabricMat(color)}
      </mesh>
    </group>
  );
}

/* ===================== TOTE BAG ===================== */
function ToteBagModel({ color, logoTex, logoScale, posKey }: any) {
  const pos = POSITIONS.tote[posKey] || POSITIONS.tote["mitte"];

  // Gövde: yuvarlatılmış köşeli kumaş çanta (ExtrudeGeometry)
  const bodyGeo = useMemo(() => {
    const shape = new THREE.Shape();
    const w = 0.26, h = 0.3, r = 0.025;
    shape.moveTo(-w + r, -h);
    shape.lineTo(w - r, -h);
    shape.quadraticCurveTo(w, -h, w, -h + r);
    shape.lineTo(w, h - r);
    shape.quadraticCurveTo(w, h, w - r, h);
    shape.lineTo(-w + r, h);
    shape.quadraticCurveTo(-w, h, -w, h - r);
    shape.lineTo(-w, -h + r);
    shape.quadraticCurveTo(-w, -h, -w + r, -h);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.05, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 3,
    });
    geo.center();
    return geo;
  }, []);

  // Kulplar: TubeGeometry ile doğal eğrisel sap
  const handleGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.13, 0.28, 0.0),
      new THREE.Vector3(-0.12, 0.46, -0.01),
      new THREE.Vector3(0.12, 0.46, -0.01),
      new THREE.Vector3(0.13, 0.28, 0.0),
    ]);
    return new THREE.TubeGeometry(curve, 40, 0.011, 10, false);
  }, []);

  return (
    <group scale={1.5} position={[0, -0.05, 0]}>
      {/* Gövde */}
      <mesh geometry={bodyGeo} castShadow receiveShadow>
        {fabricMat(color)}
        {logoTex && (
          <Decal position={pos} rotation={[0, 0, 0]} scale={logoScale * 1.4}
            map={logoTex} polygonOffsetFactor={-10} />
        )}
      </mesh>
      {/* Üst kenar dikişi (koyu band) */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.52, 0.02, 0.07]} />
        <meshStandardMaterial color={color} roughness={0.8} metalness={0} />
      </mesh>
      {/* Kulplar */}
      <mesh geometry={handleGeo} castShadow>
        <meshStandardMaterial color={color} roughness={0.8} metalness={0} side={THREE.DoubleSide} />
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
