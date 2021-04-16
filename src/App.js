import * as THREE from "three";
import React, { Suspense, useRef, useState, useEffect, useMemo, useLayoutEffect } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { useControls } from "leva";
import { Stats } from "@react-three/drei";

const ROW = 30;
const BLOCK_AMOUNT = 510;
const SEGMENTS = 80;
const geom = new THREE.PlaneGeometry(1, 1);
const vec = new THREE.Color();

const chars = `!"§$%&/()=?*#<>-_.:,;+0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`;

function Block({ distribute, change, ...props }) {
  const [char, setChar] = useState();

  useEffect(() => {
    const setRandomChar = () => setChar(chars[Math.floor(Math.random() * chars.length)]);
    if (distribute) setTimeout(setRandomChar, Math.random() * 1000);
    else setRandomChar();
  }, [change]);

  const mat = useRef();
  useFrame((state, delta) => mat.current?.color.lerp(vec.set("white"), 0.01));
  useLayoutEffect(() => void mat.current?.color.set("red"), [char]);

  return (
    <mesh {...props} geometry={geom}>
      <meshBasicMaterial ref={mat} />
      {char && <Text size={5}>{char}</Text>}
    </mesh>
  );
}

function Blocks({ distribute }) {
  const [changeBlocks, set] = useState(false);
  useEffect(() => {
    const handler = setInterval(() => set((state) => !state), 2000);
    return () => clearInterval(handler);
  });

  let { width } = useThree((state) => state.viewport);
  const size = width / ROW;
  const left = -width / 2 + size / 2;
  const top = (BLOCK_AMOUNT / ROW / 2) * size - size / 2;
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
  useFrame((state) => {
    ref.current.position.z = 5 + Math.sin(state.clock.getElapsedTime() * 5) * 5;
  });
  return <group ref={ref}>{children}</group>;
}

function Text({ children, vAlign = "center", hAlign = "center", size = 1, color = "#000000", ...props }) {
  const font = useLoader(THREE.FontLoader, "/Inter UI_Bold.json");
  const config = useMemo(() => ({ font, size: 1, height: 0.5, curveSegments: SEGMENTS, bevelEnabled: false }), [
    font,
    SEGMENTS,
  ]);
  const mesh = useRef();
  useLayoutEffect(() => {
    const size = new THREE.Vector3();
    mesh.current.geometry.computeBoundingBox();
    mesh.current.geometry.boundingBox.getSize(size);
    mesh.current.position.x = hAlign === "center" ? -size.x / 2 : hAlign === "right" ? 0 : -size.x;
    mesh.current.position.y = vAlign === "center" ? -size.y / 2 : vAlign === "top" ? 0 : -size.y;
  }, [children]);

  const geom = useMemo(() => new THREE.TextGeometry(children, config), [children, config]);

  return (
    <group {...props} scale={[0.1 * size, 0.1 * size, 0.1]}>
      <mesh ref={mesh} geometry={geom} rotation={[0, -0.5, 0]}>
        <meshStandardMaterial color='#303030' />
      </mesh>
    </group>
  );
}

export default function App() {
  const { concurrent, distributed } = useControls({
    concurrent: { value: true },
    distributed: { value: false },
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
