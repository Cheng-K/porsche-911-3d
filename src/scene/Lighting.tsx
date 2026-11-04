export function Lighting() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        castShadow
        intensity={1.8}
        position={[5, 8, 4]}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-bias={-0.0002}
      />
    </>
  );
}
