import * as THREE from "three";
import React, { Suspense, useRef, useState, useEffect, useMemo, useLayoutEffect } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { useControls } from "leva";
import { Stats } from "@react-three/drei";
import Text from "./components/Text";

const ROW = 30;
const BLOCK_AMOUNT = 510;
const geom = new THREE.PlaneGeometry(1, 1);
const vec = new THREE.Color();
const chars = `!"§$%&/()=?*#<>-_.:,;+0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`;

async function test() {
  const font = await new Promise((res) => new THREE.FontLoader().load("/Inter UI_Bold.json", res));
  console.time("test");
  for (let i = 0; i < 510; i++) {
    new THREE.TextGeometry(chars[Math.floor(Math.random() * chars.length)], {
      font,
      size: 1,
      height: 0.5,
      curveSegments: 80,
      bevelEnabled: false,
    });
  }
  console.timeEnd("test");
}
test();

// Each block creates a text-geometry
function Block({ distribute, change, ...props }) {
  const mat = useRef();
  const [char, setChar] = useState();
  useEffect(() => {
    const setRandomChar = () => setChar(chars[Math.floor(Math.random() * chars.length)]);
    // It can either execute somewhat later, which distributes load a little
    if (distribute) setTimeout(setRandomChar, Math.random() * 1000);
    // Or execute right away, which effectively creates hundreds of textgeometries at once
    else setRandomChar();
  }, [change]);
  useFrame((state, delta) => mat.current?.color.lerp(vec.set("white"), 0.01));
  useLayoutEffect(() => void mat.current?.color.set("red"), [char]);
  return (
    <mesh {...props} geometry={geom}>
      <meshBasicMaterial ref={mat} />
      {char && <Text size={5}>{char}</Text>}
    </mesh>
  );
}

// This component creates hundreds of blocks
function Blocks({ distribute }) {
  const [changeBlocks, set] = useState(false);
  let { width } = useThree((state) => state.viewport);
  const size = width / ROW;
  const left = -width / 2 + size / 2;
  const top = (BLOCK_AMOUNT / ROW / 2) * size - size / 2;
  useEffect(() => {
    const handler = setInterval(() => set((state) => !state), 2000);
    return () => clearInterval(handler);
  });
  return new Array(BLOCK_AMOUNT).fill().map((_, i) => {
    const x = (i % ROW) * size;
    const y = Math.floor(i / ROW) * -size;
    return (
      <Block
        key={i}
        distribute={distribute}
        change={changeBlocks}
        scale={[size, size, size]}
        position={[left + x, top + y, 0]}
      />
    );
  });
}

function Dolly({ children }) {
  const ref = useRef();
  useFrame((state) => (ref.current.position.z = 5 + Math.sin(state.clock.getElapsedTime() * 5) * 5));
  return <group ref={ref}>{children}</group>;
}

export default function App() {
  const { concurrent, distributed } = useControls({
    concurrent: { value: true },
    distributed: { value: true },
  });
  return (
    <>
      <Canvas
        key={concurrent}
        mode={concurrent ? "concurrent" : "blocking"}
        camera={{ position: [0, 0, 100] }}
        style={{ background: "#272737" }}>
        <directionalLight position={[10, 10, 0]} intensity={10} />
        <Suspense fallback={null}>
          <Dolly>
            <Blocks distribute={distributed} />
          </Dolly>
        </Suspense>
      </Canvas>
      <Stats className='fps' />
    </>
  );
}
