import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import type { FormState } from '../lib/form';

const LIVE = 280;
const GHOSTS = 5;
const STRIDE = 1 + GHOSTS;
const COLS = 14;
const ROWS = LIVE / COLS;
const X_MIN = -3.8;
const X_MAX = 3.8;
const Y_MIN = -2.6;
const Y_MAX = 2.6;
const CELL_W = (X_MAX - X_MIN) / COLS;
const CELL_H = (Y_MAX - Y_MIN) / ROWS;

function fieldX(col: number, jitter = Math.random()) {
  return X_MIN + (col + 0.5) * CELL_W + (jitter - 0.5) * CELL_W * 0.82;
}

function fieldY(row: number, jitter = Math.random()) {
  return Y_MIN + (row + 0.5) * CELL_H + (jitter - 0.5) * CELL_H * 0.82;
}

const vertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  uniform float uPixelRatio;
  varying float vAlpha;

  void main() {
    vAlpha = aAlpha;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio * (220.0 / max(-mvPosition.z, 0.12));
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float d = dot(uv, uv);
    if (d > 1.0) discard;
    float soft = smoothstep(1.0, 0.16, d);
    gl_FragColor = vec4(uColor, vAlpha * soft);
  }
`;

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

  const { geometry, speeds } = useMemo(() => {
    const total = LIVE * STRIDE;
    const positions = new Float32Array(total * 3);
    const sizes = new Float32Array(total);
    const alphas = new Float32Array(total);
    const speeds = new Float32Array(LIVE);

    for (let i = 0; i < LIVE; i++) {
      const x = fieldX(i % COLS);
      const y = fieldY(Math.floor(i / COLS));
      const z = (Math.random() - 0.5) * 2;
      speeds[i] = 0.12 + Math.random() * 0.14;
      for (let s = 0; s < STRIDE; s++) {
        const idx = i * STRIDE + s;
        positions[idx * 3] = x;
        positions[idx * 3 + 1] = y;
        positions[idx * 3 + 2] = z;
        sizes[idx] = 0.035;
        alphas[idx] = s === 0 ? 0.12 : 0;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
    return { geometry, speeds };
  }, []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color('#c9a06c') },
          uPixelRatio: { value: 1 },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((state, delta) => {
    current.current = THREE.MathUtils.damp(current.current, intensity.current, 3.2, delta);
    const amount = current.current;
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    const sizeAttr = geometry.attributes.aSize as THREE.BufferAttribute;
    const alphaAttr = geometry.attributes.aAlpha as THREE.BufferAttribute;
    const posArr = pos.array as Float32Array;
    const sizeArr = sizeAttr.array as Float32Array;
    const alphaArr = alphaAttr.array as Float32Array;

    const coreSize = 0.028 + amount * 0.03;
    const coreAlpha = 0.08 + amount * 0.42;
    const gap = 0.07 + amount * 0.09;
    const trail = amount * amount;

    material.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    material.uniforms.uColor.value.set(amount > 0.45 ? '#f7fbff' : '#c9a06c');

    for (let i = 0; i < LIVE; i++) {
      const core = i * STRIDE;
      let x = posArr[core * 3];
      let y = posArr[core * 3 + 1] + speeds[i] * delta * (0.15 + amount * 1.55);
      if (y > Y_MAX) {
        y = Y_MIN;
        x = fieldX(i % COLS);
        posArr[core * 3] = x;
      }
      posArr[core * 3 + 1] = y;
      sizeArr[core] = coreSize;
      alphaArr[core] = coreAlpha;

      const z = posArr[core * 3 + 2];
      for (let g = 1; g <= GHOSTS; g++) {
        const idx = core + g;
        const gy = y - g * gap;
        posArr[idx * 3] = x;
        posArr[idx * 3 + 1] = gy;
        posArr[idx * 3 + 2] = z;
        const onScreen = gy > -2.65 ? 1 : 0;
        const fade = 1 - g / (GHOSTS + 1);
        sizeArr[idx] = coreSize * (1 - g * 0.11);
        alphaArr[idx] = coreAlpha * trail * fade * 0.42 * onScreen;
      }
    }

    pos.needsUpdate = true;
    sizeAttr.needsUpdate = true;
    alphaAttr.needsUpdate = true;
  });

  return <points ref={points} geometry={geometry} material={material} frustumCulled={false} />;
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
