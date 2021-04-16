import * as THREE from "three";
import ReactDOM from "react-dom";
import React, { Suspense, useRef, useState, useEffect, useMemo, useLayoutEffect } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { useControls } from "leva";
import { Stats } from "@react-three/drei";
import "./styles.css";

const SLOWDOWN = 1;
const ROW = 20;
const BLOCK_AMOUNT = 500;
const SEGMENTS = 80;
const geom = new THREE.PlaneGeometry(1, 1);
const vec = new THREE.Color();

const colors = ["#A2CCB6", "#FCEEB5", "#EE786E", "#e0feff", "lightpink", "lightblue"];
const chars = `!"§$%&/()=?*#<>-_.:,;+0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`;

function Block({ distribute, change, ...props }) {
  const [color, setColor] = useState(0);
  const [char, setChar] = useState(chars[Math.floor(Math.random() * chars.length)]);

  useEffect(() => {
    function set() {
      setChar(chars[Math.floor(Math.random() * chars.length)]);
      setColor(colors[Math.floor(Math.random() * colors.length)]);
    }
    if (distribute) setTimeout(set, Math.random() * 1000);
    else set();
  }, [change]);

  const mat = useRef();
  useFrame((state, delta) => mat.current.color.lerp(vec.set("white"), 0.01));
  useLayoutEffect(() => void mat.current.color.set("red"), [color]);

  return (
    <mesh {...props} geometry={geom}>
      <meshBasicMaterial ref={mat} />
      {color !== 0 && <Text size={5}>{char}</Text>}
    </mesh>
  );
}

function Blocks({ distribute }) {
  const [changeBlocks, set] = useState(false);
  useEffect(() => {
    const handler = setInterval(() => set((state) => !state), 2000);
    return () => clearInterval(handler);
  });

  const { viewport } = useThree();
  const width = viewport.width;
  const size = width / ROW;
  return new Array(BLOCK_AMOUNT).fill().map((_, i) => {
    const left = -viewport.width / 2 + size / 2;
    const top = viewport.height / 2 - size / 2;
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

function Dolly() {
  const { clock, camera } = useThree();
  useFrame(() => camera.updateProjectionMatrix(void (camera.zoom = 130 + Math.sin(clock.getElapsedTime() * 3) * 30)));
  return null;
}

function Text({ children, vAlign = "center", hAlign = "center", size = 1, color = "#000000", ...props }) {
  const font = useLoader(THREE.FontLoader, "/Inter UI_Bold.json");
  const config = useMemo(
    () => ({
      font,
      size: 1,
      height: 0.5,
      curveSegments: SEGMENTS,
      bevelEnabled: false,
    }),
    [font, SEGMENTS],
  );
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
      <mesh ref={mesh} geometry={geom} >
        <meshStandardMaterial color="#202020" depthTest={false}/>
      </mesh>
    </group>
  );
}

function App() {
  const { concurrent, distribute } = useControls({ concurrent: true, distribute: false });
  return (
    <>
      <Canvas
        key={concurrent}
        orthographic
        mode={concurrent ? "concurrent" : "blocking"}
        camera={{ position: [0, 0, 100], zoom: 100 }}
        style={{ background: "#272737" }}>
        <Suspense fallback={null}>
          <Blocks distribute={distribute} />
        </Suspense>
        <Dolly />
      </Canvas>
      <Stats className='fps' />
    </>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
