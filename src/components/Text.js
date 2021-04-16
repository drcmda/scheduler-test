import * as THREE from "three";
import React, { useRef, useMemo, useLayoutEffect } from "react";
import { useLoader } from "@react-three/fiber";

const SEGMENTS = 80;

export default function Text({ children, vAlign = "center", hAlign = "center", size = 1, color = "#000000", ...props }) {
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
