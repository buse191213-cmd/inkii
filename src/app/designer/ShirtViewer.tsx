// @ts-nocheck
"use client";

import { useRef, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Center, useGLTF } from "@react-three/drei";
import * as THREE from "three";

/**
 * 3D T-Shirt Viewer.
 * Decal kullanmıyoruz — GLB scene hierarchy ile çakışıyor (crash).
 * Logo, Canvas'ın üstüne HTML overlay olarak DesignerClient'ta render edilir.
 */

function ShirtModel({ color, autoRotate }: { color: string; autoRotate: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/models/tshirt.glb") as any;

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
    }
  });

  useEffect(() => {
    if (!scene) return;
    scene.traverse((obj: any) => {
      if (obj.isMesh && obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m: any) => m.color?.set(color));
        } else {
          obj.material.color?.set(color);
        }
      }
    });
  }, [color, scene]);

  return (
    <group ref={groupRef as any} dispose={null}>
      <primitive object={scene} scale={1.6} />
    </group>
  );
}

export default function ShirtViewer({
  color,
  autoRotate,
}: {
  color: string;
  autoRotate: boolean;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 2.5], fov: 25 }}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <directionalLight position={[-5, 3, -3]} intensity={0.3} />
      <Suspense fallback={null}>
        <Center>
          <ShirtModel color={color} autoRotate={autoRotate} />
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
