import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, Sky } from '@react-three/drei';
import * as THREE from 'three';

interface Block {
  x: number;
  y: number;
  z: number;
  color: string;
  type: string;
}

interface Game3DProps {
  blocks: Block[];
  selectedBlock: number;
  blockTypes: Array<{ name: string; color: string; icon: string }>;
  onAddBlock: (x: number, y: number, z: number) => void;
  onRemoveBlock: (x: number, y: number, z: number) => void;
}

function CheeseBlock({ position, color, onClick }: { position: [number, number, number]; color: string; onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.lerp(
        new THREE.Vector3(hovered ? 1.05 : 1, hovered ? 1.05 : 1, hovered ? 1.05 : 1),
        0.1
      );
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color={color} 
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
}

function Player() {
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const [moveState, setMoveState] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          setMoveState(s => ({ ...s, forward: true }));
          break;
        case 'KeyS':
        case 'ArrowDown':
          setMoveState(s => ({ ...s, backward: true }));
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setMoveState(s => ({ ...s, left: true }));
          break;
        case 'KeyD':
        case 'ArrowRight':
          setMoveState(s => ({ ...s, right: true }));
          break;
        case 'Space':
          setMoveState(s => ({ ...s, jump: true }));
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          setMoveState(s => ({ ...s, forward: false }));
          break;
        case 'KeyS':
        case 'ArrowDown':
          setMoveState(s => ({ ...s, backward: false }));
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setMoveState(s => ({ ...s, left: false }));
          break;
        case 'KeyD':
        case 'ArrowRight':
          setMoveState(s => ({ ...s, right: false }));
          break;
        case 'Space':
          setMoveState(s => ({ ...s, jump: false }));
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(() => {
    const speed = 0.1;
    
    direction.current.set(0, 0, 0);

    if (moveState.forward) direction.current.z -= 1;
    if (moveState.backward) direction.current.z += 1;
    if (moveState.left) direction.current.x -= 1;
    if (moveState.right) direction.current.x += 1;

    direction.current.normalize();

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0));

    const movement = new THREE.Vector3();
    movement.addScaledVector(forward, -direction.current.z * speed);
    movement.addScaledVector(right, direction.current.x * speed);

    camera.position.add(movement);

    if (camera.position.y < 2) {
      camera.position.y = 2;
    }
  });

  return null;
}

export default function Game3D({ blocks, selectedBlock, blockTypes, onAddBlock, onRemoveBlock }: Game3DProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [0, 2, 5], fov: 75 }}
        onPointerDown={(e) => {
          if (e.button === 0) {
            e.stopPropagation();
          }
        }}
      >
        <Sky sunPosition={[100, 20, 100]} />
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        <fog attach="fog" args={['#fef3c7', 10, 50]} />

        {blocks.map((block, index) => (
          <CheeseBlock
            key={index}
            position={[block.x, block.y, block.z]}
            color={block.color}
            onClick={() => onRemoveBlock(block.x, block.y, block.z)}
          />
        ))}

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#fde047" />
        </mesh>

        <PointerLockControls />
        <Player />
      </Canvas>
    </div>
  );
}
