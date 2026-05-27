// @ts-nocheck
"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Environment, Center, useGLTF, Decal, useTexture } from "@react-three/drei";
import * as THREE from "three";

/**
 * 3D T-Shirt Viewer (R3F + drei).
 * - Drag to rotate, scroll to zoom
 * - Color changes via material.color
 * - Logo applied as Decal on the chest
 */

type Props = {
  modelUrl: string;
  color: string;
  logoUrl: string | null;
  logoScale: number;
  autoRotate: boolean;
};

function ShirtModel({ color, logoUrl, logoScale, autoRotate }: {
  color: string;
  logoUrl: string | null;
  logoScale: number;
  autoRotate: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { scene, nodes, materials } = useGLTF("/models/tshirt.glb") as any;
  const logoTex = logoUrl ? useTexture(logoUrl) : null;

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
    }
  });

  // Renk değişimini tüm mesh'lere uygula
  useEffect(() => {
    if (!scene) return;
    scene.traverse((obj: any) => {
      if (obj.isMesh && obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m: any) => {
            if (m.color) m.color.set(color);
          });
        } else if (obj.material.color) {
          obj.material.color.set(color);
        }
      }
    });
  }, [color, scene]);

  // İlk mesh'i bulup decal hedefi yap
  let targetMesh: THREE.Mesh | null = null;
  if (scene) {
    scene.traverse((obj: any) => {
      if (!targetMesh && obj.isMesh) targetMesh = obj;
    });
  }

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <group ref={groupRef as any} dispose={null}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <primitive object={scene} scale={1.6} />
      {logoTex && targetMesh && (
        <Decal
          position={[0, 0.04, 0.15]}
          rotation={[0, 0, 0]}
          scale={logoScale}
          map={logoTex}
        />
      )}
    </group>
  );
}

export default function ShirtViewer({ color, logoUrl, logoScale, autoRotate }: Props) {
  return (
    <Canvas
      camera={{ position: [0, 0, 2.5], fov: 25 }}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      shadows
      style={{ width: "100%", height: "100%", background: "transparent" }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
      <directionalLight position={[-5, 3, -3]} intensity={0.3} />
      <Suspense fallback={null}>
        <Center>
          <ShirtModel color={color} logoUrl={logoUrl} logoScale={logoScale} autoRotate={autoRotate} />
        </Center>
        <Environment preset="studio" />
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
