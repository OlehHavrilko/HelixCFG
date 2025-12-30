import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Html, Text3D, Center, Box, Sphere } from '@react-three/drei';
import { useRef, useState, Suspense } from 'react';
import { Mesh, BoxGeometry, MeshStandardMaterial } from 'three';
import { useAppStore } from '../app/store';
import { Component } from '../domain/model/types';

interface ComponentModelProps {
  component: Component;
  position: [number, number, number];
  onClick?: (component: Component) => void;
  isSelected?: boolean;
}

function CPUModel({ component, position, onClick, isSelected }: ComponentModelProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const specs = component.specs as any;
  
  useFrame((state) => {
    if (meshRef.current && hovered) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 2;
    }
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onClick?.(component);
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[1.5, 0.3, 1.5]} />
      <meshStandardMaterial 
        color={isSelected ? '#3b82f6' : hovered ? '#60a5fa' : '#374151'} 
        metalness={0.8}
        roughness={0.2}
      />
      <Html position={[0, 0.3, 0]} center>
        <div className="text-white bg-black/80 px-2 py-1 rounded text-xs whitespace-nowrap">
          {component.brand} {component.model}
        </div>
      </Html>
    </mesh>
  );
}

function GPUModel({ component, position, onClick, isSelected }: ComponentModelProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const specs = component.specs as any;
  const length = (specs.lengthMm || 300) / 100; // Convert to scene units
  
  useFrame((state) => {
    if (meshRef.current && hovered) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onClick?.(component);
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[length, 0.8, 0.3]} />
      <meshStandardMaterial 
        color={isSelected ? '#10b981' : hovered ? '#34d399' : '#059669'} 
        metalness={0.9}
        roughness={0.1}
      />
      <Html position={[0, 0.5, 0]} center>
        <div className="text-white bg-black/80 px-2 py-1 rounded text-xs whitespace-nowrap">
          {component.brand} {component.model}
        </div>
      </Html>
    </mesh>
  );
}

function MotherboardModel({ component, position, onClick, isSelected }: ComponentModelProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const specs = component.specs as any;
  const formFactor = specs.formFactor || 'ATX';
  const width = formFactor === 'Micro-ATX' ? 2.5 : 3;
  
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onClick?.(component);
  };

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[width, 0.1, 2.5]} />
        <meshStandardMaterial 
          color={isSelected ? '#8b5cf6' : hovered ? '#a78bfa' : '#6d28d9'} 
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>
      
      // Add RAM slots
      {Array.from({ length: specs.ramSlots || 4 }, (_, i) => (
        <mesh key={i} position={[width/2 - 0.3 - i * 0.4, 0.06, 0]}>
          <boxGeometry args={[0.3, 0.02, 0.1]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
      ))}
      
      <Html position={[0, 0.2, 0]} center>
        <div className="text-white bg-black/80 px-2 py-1 rounded text-xs whitespace-nowrap">
          {component.brand} {component.model}
        </div>
      </Html>
    </group>
  );
}

function RAMModel({ component, position, onClick, isSelected }: ComponentModelProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onClick?.(component);
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[0.4, 0.15, 1.5]} />
      <meshStandardMaterial 
        color={isSelected ? '#f59e0b' : hovered ? '#fbbf24' : '#d97706'} 
        metalness={0.6}
        roughness={0.4}
      />
      <Html position={[0, 0.2, 0]} center>
        <div className="text-white bg-black/80 px-2 py-1 rounded text-xs whitespace-nowrap">
          {component.brand} {component.model}
        </div>
      </Html>
    </mesh>
  );
}

function CaseModel({ component, position, onClick, isSelected }: ComponentModelProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const specs = component.specs as any;
  
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onClick?.(component);
  };

  return (
    <group position={position}>
      // Main case body (transparent)
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[4, 3, 2]} />
        <meshStandardMaterial 
          color={isSelected ? '#64748b' : hovered ? '#94a3b8' : '#475569'} 
          transparent
          opacity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      // Case frame
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4.1, 3.1, 2.1]} />
        <meshStandardMaterial 
          color="#1f2937" 
          wireframe
          transparent
          opacity={0.5}
        />
      </mesh>
      
      <Html position={[0, 1.8, 0]} center>
        <div className="text-white bg-black/80 px-2 py-1 rounded text-xs whitespace-nowrap">
          {component.brand} {component.model}
        </div>
      </Html>
    </group>
  );
}

function PSUModel({ component, position, onClick, isSelected }: ComponentModelProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const specs = component.specs as any;
  
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onClick?.(component);
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[1.5, 0.8, 0.3]} />
      <meshStandardMaterial 
        color={isSelected ? '#ef4444' : hovered ? '#f87171' : '#dc2626'} 
        metalness={0.7}
        roughness={0.3}
      />
      <Html position={[0, 0.5, 0]} center>
        <div className="text-white bg-black/80 px-2 py-1 rounded text-xs whitespace-nowrap">
          {component.brand} {component.model} ({specs.wattage}W)
        </div>
      </Html>
    </mesh>
  );
}

function CoolerModel({ component, position, onClick, isSelected }: ComponentModelProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onClick?.(component);
  };

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <cylinderGeometry args={[0.6, 0.6, 0.2, 32]} />
        <meshStandardMaterial 
          color={isSelected ? '#06b6d4' : hovered ? '#22d3ee' : '#0891b2'} 
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      // Fan blades
      <mesh position={[0, 0.11, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.02, 8]} />
        <meshStandardMaterial color="#1f2937" transparent opacity={0.7} />
      </mesh>
      
      <Html position={[0, 0.3, 0]} center>
        <div className="text-white bg-black/80 px-2 py-1 rounded text-xs whitespace-nowrap">
          {component.brand} {component.model}
        </div>
      </Html>
    </group>
  );
}

function StorageModel({ component, position, onClick, isSelected }: ComponentModelProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const specs = component.specs as any;
  const isSSD = specs.storageType === 'SSD';
  
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onClick?.(component);
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[isSSD ? 0.8 : 1.2, 0.1, isSSD ? 0.6 : 0.8]} />
      <meshStandardMaterial 
        color={isSelected ? '#84cc16' : hovered ? '#a3e635' : '#65a30d'} 
        metalness={isSSD ? 0.9 : 0.5}
        roughness={isSSD ? 0.1 : 0.5}
      />
      <Html position={[0, 0.2, 0]} center>
        <div className="text-white bg-black/80 px-2 py-1 rounded text-xs whitespace-nowrap">
          {component.brand} {component.model} ({specs.capacityGB}GB)
        </div>
      </Html>
    </mesh>
  );
}

function ComponentModel({ component, position, onClick, isSelected }: ComponentModelProps) {
  switch (component.type) {
    case 'CPU':
      return <CPUModel component={component} position={position} onClick={onClick} isSelected={isSelected} />;
    case 'GPU':
      return <GPUModel component={component} position={position} onClick={onClick} isSelected={isSelected} />;
    case 'Motherboard':
      return <MotherboardModel component={component} position={position} onClick={onClick} isSelected={isSelected} />;
    case 'RAM':
      return <RAMModel component={component} position={position} onClick={onClick} isSelected={isSelected} />;
    case 'Case':
      return <CaseModel component={component} position={position} onClick={onClick} isSelected={isSelected} />;
    case 'PSU':
      return <PSUModel component={component} position={position} onClick={onClick} isSelected={isSelected} />;
    case 'Cooler':
      return <CoolerModel component={component} position={position} onClick={onClick} isSelected={isSelected} />;
    case 'Storage':
      return <StorageModel component={component} position={position} onClick={onClick} isSelected={isSelected} />;
    default:
      return null;
  }
}

function Scene() {
  const { currentBuild, components, selectComponent } = useAppStore();
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  const handleComponentClick = (component: Component) => {
    setSelectedComponent(component.id);
    // In a real app, this could open a detail panel or highlight in the component list
  };

  const getComponentPosition = (type: string, index: number = 0): [number, number, number] => {
    switch (type) {
      case 'Case':
        return [0, 0, 0];
      case 'Motherboard':
        return [0, 0.5, 0];
      case 'CPU':
        return [0, 1, 0];
      case 'Cooler':
        return [0, 1.3, 0];
      case 'GPU':
        return [1.2, 0.5, 0];
      case 'RAM':
        return [-0.5 + index * 0.4, 0.7, 0];
      case 'Storage':
        return [0, -0.5, -0.5 + index * 0.3];
      case 'PSU':
        return [0, -1, 0.8];
      default:
        return [0, 0, 0];
    }
  };

  const buildComponents: Array<{ component: Component; position: [number, number, number] }> = [];

  // Add case first (container)
  if (currentBuild.case) {
    const caseComponent = components.find(c => c.id === currentBuild.case);
    if (caseComponent) {
      buildComponents.push({ component: caseComponent, position: getComponentPosition('Case') });
    }
  }

  // Add motherboard
  if (currentBuild.motherboard) {
    const motherboard = components.find(c => c.id === currentBuild.motherboard);
    if (motherboard) {
      buildComponents.push({ component: motherboard, position: getComponentPosition('Motherboard') });
    }
  }

  // Add CPU
  if (currentBuild.cpu) {
    const cpu = components.find(c => c.id === currentBuild.cpu);
    if (cpu) {
      buildComponents.push({ component: cpu, position: getComponentPosition('CPU') });
    }
  }

  // Add Cooler
  if (currentBuild.cooler) {
    const cooler = components.find(c => c.id === currentBuild.cooler);
    if (cooler) {
      buildComponents.push({ component: cooler, position: getComponentPosition('Cooler') });
    }
  }

  // Add GPU
  if (currentBuild.gpu) {
    const gpu = components.find(c => c.id === currentBuild.gpu);
    if (gpu) {
      buildComponents.push({ component: gpu, position: getComponentPosition('GPU') });
    }
  }

  // Add RAM sticks
  currentBuild.ram.forEach((ramId, index) => {
    const ram = components.find(c => c.id === ramId);
    if (ram) {
      buildComponents.push({ component: ram, position: getComponentPosition('RAM', index) });
    }
  });

  // Add Storage drives
  currentBuild.storage.forEach((storageId, index) => {
    const storage = components.find(c => c.id === storageId);
    if (storage) {
      buildComponents.push({ component: storage, position: getComponentPosition('Storage', index) });
    }
  });

  // Add PSU
  if (currentBuild.psu) {
    const psu = components.find(c => c.id === currentBuild.psu);
    if (psu) {
      buildComponents.push({ component: psu, position: getComponentPosition('PSU') });
    }
  }

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#60a5fa" />
      <pointLight position={[5, -5, 5]} intensity={0.5} color="#f87171" />
      
      <gridHelper args={[10, 10]} position={[0, -2, 0]} />
      
      {buildComponents.map(({ component, position }) => (
        <ComponentModel
          key={component.id}
          component={component}
          position={position}
          onClick={handleComponentClick}
          isSelected={selectedComponent === component.id}
        />
      ))}
      
      {/* Build info overlay */}
      <Html position={[0, 3, 0]} center>
        <div className="bg-black/80 text-white p-4 rounded-lg backdrop-blur-sm">
          <h3 className="font-bold text-lg mb-2">PC Build Preview</h3>
          <div className="text-sm space-y-1">
            <div>Components: {buildComponents.length}</div>
            <div>Total Power: ~{buildComponents.reduce((acc, { component }) => {
              const specs = component.specs as any;
              return acc + (specs.tdpW || 0);
            }, 0)}W</div>
          </div>
        </div>
      </Html>
    </>
  );
}

export function PCScene() {
  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas
        camera={{ position: [6, 4, 6], fov: 50 }}
        shadows
        className="bg-gradient-to-b from-gray-900 to-gray-800"
      >
        <Suspense fallback={null}>
          <Scene />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={15}
            maxPolarAngle={Math.PI / 2.2}
          />
        </Suspense>
      </Canvas>
      
      <div className="absolute bottom-4 left-4 bg-black/60 text-white p-3 rounded-lg text-xs backdrop-blur-sm">
        <div className="font-semibold mb-1">Controls:</div>
        <div>• Left click + drag: Rotate</div>
        <div>• Right click + drag: Pan</div>
        <div>• Scroll: Zoom</div>
        <div>• Click components: Highlight</div>
      </div>
    </div>
  );
}
