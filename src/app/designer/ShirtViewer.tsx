// @ts-nocheck
"use client";

import { useRef, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Center, useGLTF, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

/**
 * 3D T-Shirt Viewer.
 * - Matter Stoff-Look: roughness hoch, metalness 0, env-Reflection gedämpft
 * - DoubleSide: damit Innenseite des Mesh nicht schwarz erscheint
 * - Schatten unter dem Shirt für realistischeren Look
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
        const applyMaterial = (m: any) => {
          // Renk
          m.color?.set(color);
          // Stoff görünümü — mat, parlak değil
          if ("roughness" in m) m.roughness = 0.92;
          if ("metalness" in m) m.metalness = 0;
          // Çevre yansıması azalt — daha sade görünüm
          if ("envMapIntensity" in m) m.envMapIntensity = 0.35;
          // Her iki tarafı render et — sırt artık siyah değil
          m.side = THREE.DoubleSide;
          m.needsUpdate = true;
        };
        if (Array.isArray(obj.material)) obj.material.forEach(applyMaterial);
        else applyMaterial(obj.material);
        // Gölge alma/verme
        obj.castShadow = true;
        obj.receiveShadow = true;
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
      shadows
      style={{ width: "100%", height: "100%", background: "transparent" }}
      dpr={[1, 2]}
    >
      {/* Yumuşak ambient + 1 directional, parlaklığı azalt */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 3]} intensity={0.7} castShadow
        shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <directionalLight position={[-3, 2, -3]} intensity={0.15} />

      <Suspense fallback={null}>
        <Center>
          <ShirtModel color={color} autoRotate={autoRotate} />
        </Center>
        {/* Çok hafif env reflection — sadece light info, parlama yok */}
        <Environment preset="apartment" environmentIntensity={0.25} />
        {/* Zemin gölgesi */}
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
