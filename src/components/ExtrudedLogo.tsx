import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function FlaskLogo() {
  const groupRef = useRef<THREE.Group>(null);

  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    // Flask body
    shape.moveTo(-0.3, -0.6);
    shape.lineTo(0.3, -0.6);
    shape.quadraticCurveTo(0.5, -0.6, 0.5, -0.4);
    shape.lineTo(0.35, 0.0);
    shape.lineTo(0.2, 0.3);
    shape.lineTo(0.2, 0.7);
    shape.lineTo(-0.2, 0.7);
    shape.lineTo(-0.2, 0.3);
    shape.lineTo(-0.35, 0.0);
    shape.quadraticCurveTo(-0.5, -0.4, -0.5, -0.4);
    shape.lineTo(-0.3, -0.6);

    const extrudeSettings = {
      depth: 0.3,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 3,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  const liquidGeom = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.25, -0.5);
    shape.lineTo(0.25, -0.5);
    shape.quadraticCurveTo(0.4, -0.5, 0.4, -0.35);
    shape.lineTo(0.28, -0.05);
    shape.lineTo(-0.28, -0.05);
    shape.lineTo(-0.4, -0.35);
    shape.quadraticCurveTo(-0.4, -0.5, -0.25, -0.5);

    return new THREE.ExtrudeGeometry(shape, { depth: 0.25, bevelEnabled: false });
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={groupRef} scale={[2.5, 2.5, 2.5]}>
        {/* Main flask body */}
        <mesh geometry={geometry}>
          <meshPhysicalMaterial
            color="#00f5d4"
            transparent
            opacity={0.15}
            metalness={0.9}
            roughness={0.1}
            transmission={0.5}
            thickness={0.5}
          />
        </mesh>
        {/* Liquid inside */}
        <mesh geometry={liquidGeom} position={[0, 0, 0.025]}>
          <meshPhysicalMaterial
            color="#fee440"
            transparent
            opacity={0.6}
            metalness={0.3}
            roughness={0.2}
            emissive="#fee440"
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* Wireframe overlay */}
        <mesh geometry={geometry}>
          <meshBasicMaterial
            color="#00f5d4"
            wireframe
            transparent
            opacity={0.3}
          />
        </mesh>
      </group>
    </Float>
  );
}

export default function ExtrudedLogo() {
  return (
    <div className="w-full h-[300px] relative">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#00f5d4" />
        <pointLight position={[-5, -5, 3]} intensity={0.5} color="#fee440" />
        <FlaskLogo />
      </Canvas>
    </div>
  );
}
