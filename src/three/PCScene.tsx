import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { useAppStore } from '../app/store';

function CaseBox() {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[5, 3, 2]} />
      <meshStandardMaterial color="gray" />
      <Html position={[0, 2, 0]} center>
        <div className="text-white bg-black p-1 rounded">Case</div>
      </Html>
    </mesh>
  );
}

function ComponentPlaceholder({ position, label }: { position: readonly [number, number, number]; label: string }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="blue" />
      <Html position={[0, 0.5, 0]} center>
        <div className="text-white bg-black p-1 rounded text-xs">{label}</div>
      </Html>
    </mesh>
  );
}

export function PCScene() {
  const { currentBuild } = useAppStore();

  const placeholders = [];
  if (currentBuild.cpu) placeholders.push({ pos: [-1, 1, 0] as const, label: 'CPU' });
  if (currentBuild.gpu) placeholders.push({ pos: [1, 1, 0] as const, label: 'GPU' });
  if (currentBuild.motherboard) placeholders.push({ pos: [0, 0, 0] as const, label: 'MB' });
  if (currentBuild.ram.length > 0) placeholders.push({ pos: [0, 0.5, 0] as const, label: 'RAM' });
  if (currentBuild.storage.length > 0) placeholders.push({ pos: [0, -1, 0] as const, label: 'Storage' });
  if (currentBuild.psu) placeholders.push({ pos: [0, -1.5, 0] as const, label: 'PSU' });

  return (
    <Canvas camera={{ position: [5, 5, 5] }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <CaseBox />
      {placeholders.map((p, i) => (
        <ComponentPlaceholder key={i} position={p.pos} label={p.label} />
      ))}
      <OrbitControls />
    </Canvas>
  );
}
