import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import type { FormState } from '../lib/form';

function useFormSignal() {
  const form = useRef<FormState>('sheathed');
  const target = useRef(0);

  useMemo(() => {
    if (typeof document === 'undefined') return;
    form.current = (document.documentElement.dataset.form as FormState) || 'sheathed';
    target.current = form.current === 'unsheathed' ? 1 : 0;
  }, []);

  useFrame(() => {
    const next = (document.documentElement.dataset.form as FormState) || 'sheathed';
    if (next !== form.current) {
      form.current = next;
      target.current = next === 'unsheathed' ? 1 : 0;
    }
  });

  return target;
}

function Dust() {
  const points = useRef<THREE.Points>(null);
  const intensity = useFormSignal();
  const current = useRef(0);

  const { positions, speeds } = useMemo(() => {
    const count = 280;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.35) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
      speeds[i] = 0.08 + Math.random() * 0.22;
    }
    return { positions, speeds };
  }, []);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.035,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        color: new THREE.Color('#c4a574'),
        opacity: 0.12,
        toneMapped: false,
      }),
    [],
  );

  useFrame((_, delta) => {
    current.current = THREE.MathUtils.damp(current.current, intensity.current, 3.2, delta);
    const mesh = points.current;
    if (!mesh) return;
    const attr = mesh.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < speeds.length; i++) {
      attr.array[i * 3 + 1] += speeds[i] * delta * (0.15 + current.current * 1.55);
      if (attr.array[i * 3 + 1] > 2.6) attr.array[i * 3 + 1] = -2.6;
    }
    attr.needsUpdate = true;
    material.color.set(current.current > 0.45 ? '#2ec4b6' : '#c4a574');
    material.opacity = 0.08 + current.current * 0.42;
    material.size = 0.028 + current.current * 0.03;
  });

  return (
    <points ref={points} material={material}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
    </points>
  );
}

function Post() {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom intensity={0.55} luminanceThreshold={0.18} luminanceSmoothing={0.35} mipmapBlur />
      <ChromaticAberration offset={[0.0006, 0.0004]} />
    </EffectComposer>
  );
}

export default function AtmosphereCanvas() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
      camera={{ position: [0, 0, 4], fov: 45 }}
      style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
      frameloop="always"
    >
      <Dust />
      <Post />
    </Canvas>
  );
}
