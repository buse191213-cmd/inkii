// @ts-nocheck
"use client";

import { useRef, useEffect, Suspense, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls, Environment, Center, useGLTF, ContactShadows, Decal, useTexture,
} from "@react-three/drei";
import * as THREE from "three";

/**
 * 3D T-Shirt Viewer mit echtem 3D-Decal.
 *
 * Strategie:
 *  - Statt <primitive object={scene}> rendern wir die Meshes selbst.
 *  - Auf jedem Mesh wendet sich ein eigenes <meshStandardMaterial> mit
 *    Stoff-Look (roughness 0.95) + DoubleSide an.
 *  - <Decal> liegt INNERHALB des Mesh und folgt der Geometrie — Logo
 *    klebt auf dem Shirt und dreht sich mit.
 */

type Pos3D = [number, number, number];
const POSITIONS: Record<string, Pos3D> = {
  "brust-mitte": [0, 0.06, 0.18],
  "brust-links": [-0.09, 0.06, 0.17],
  "brust-rechts": [0.09, 0.06, 0.17],
  "bauch": [0, -0.1, 0.18],
};

function ShirtModel({
  color,
  logoUrl,
  logoScale,
  positionKey,
  autoRotate,
}: {
  color: string;
  logoUrl: string | null;
  logoScale: number;
  positionKey: string;
  autoRotate: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { nodes } = useGLTF("/models/tshirt.glb") as any;

  // Logo texture'i sadece logoUrl varsa yükle
  // useTexture, suspense ile çalışır. Conditional yapmak için useState + useEffect
  const [logoTex, setLogoTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    if (!logoUrl) {
      setLogoTex(null);
      return;
    }
    const loader = new THREE.TextureLoader();
    loader.load(
      logoUrl,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        setLogoTex(tex);
      },
      undefined,
      () => setLogoTex(null)
    );
  }, [logoUrl]);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
    }
  });

  // Scene içindeki tüm mesh'leri topla
  const meshes = useMemo(() => {
    if (!nodes) return [];
    const list: THREE.Mesh[] = [];
    Object.values(nodes).forEach((n: any) => {
      if (n.isMesh && n.geometry) list.push(n);
    });
    return list;
  }, [nodes]);

  const pos: Pos3D = POSITIONS[positionKey] || POSITIONS["brust-mitte"];

  return (
    <group ref={groupRef as any} dispose={null} scale={1.6}>
      {meshes.map((m, i) => (
        <mesh
          key={m.uuid + i}
          geometry={m.geometry}
          position={m.position}
          rotation={m.rotation}
          scale={m.scale}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={color}
            roughness={0.95}
            metalness={0}
            envMapIntensity={0.2}
            side={THREE.DoubleSide}
          />
          {/* Logo Decal: sadece ana mesh'e koy (ilk mesh = gövde) */}
          {logoTex && i === 0 && (
            <Decal
              position={pos}
              rotation={[0, 0, 0]}
              scale={logoScale * 1.4}
              map={logoTex}
              polygonOffsetFactor={-10}
            />
          )}
        </mesh>
      ))}
    </group>
  );
}

export default function ShirtViewer({
  color,
  logoUrl,
  logoScale,
  positionKey,
  autoRotate,
}: {
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
      {/* Yumuşak, kumaşa uygun ışıklandırma */}
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[3, 5, 3]}
        intensity={0.6}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-3, 2, -3]} intensity={0.2} />
      <directionalLight position={[0, 2, -5]} intensity={0.15} />

      <Suspense fallback={null}>
        <Center>
          <ShirtModel
            color={color}
            logoUrl={logoUrl}
            logoScale={logoScale}
            positionKey={positionKey}
            autoRotate={autoRotate}
          />
        </Center>
        <Environment preset="apartment" environmentIntensity={0.2} />
        <ContactShadows
          position={[0, -0.55, 0]}
          opacity={0.35}
          scale={3}
          blur={2.4}
          far={1.5}
        />
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
