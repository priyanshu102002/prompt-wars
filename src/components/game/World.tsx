import { useFrame } from '@react-three/fiber';
import { useRef, useState, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import * as THREE from 'three';

const CHUNK_LENGTH = 20;
const VISIBLE_CHUNKS = 5;
const REMOVE_THRESHOLD = 10;
const LANE_WIDTH = 2; // Matches Player

interface ObstacleData {
    lane: number; // -1, 0, 1
    z: number; // local to chunk (0 to -20)
    type: 'block' | 'hurdle' | 'arch';
}

interface ChunkData {
    id: number;
    z: number;
    obstacles: ObstacleData[];
}

function Obstacle({ data, chunkZ, globalOffset }: { data: ObstacleData, chunkZ: number, globalOffset: number }) {
    // We compute global z for rendering? No, render relative to Chunk.
    // Chunk position is [0, 0, chunkZ].
    // Obstacle is at [lane * LANE_WIDTH, y, data.z].

    let color = 'red';
    let scale: [number, number, number] = [1, 1, 1];
    let y = 0.5;

    if (data.type === 'hurdle') {
        scale = [1, 0.5, 0.2];
        color = 'yellow';
        y = 0.25;
    } else if (data.type === 'arch') {
        scale = [1, 2, 0.2];
        y = 2; // High up
        color = 'green';
    } else {
        // block
        scale = [1, 2, 1];
        y = 1;
    }

    return (
        <mesh position={[data.lane * LANE_WIDTH, y, data.z]} castShadow receiveShadow>
            <boxGeometry args={scale} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}

function Chunk({ chunk, offset }: { chunk: ChunkData, offset: number }) {
    return (
        <group position={[0, 0, chunk.z]}>
            {/* Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[10, CHUNK_LENGTH]} />
                <meshStandardMaterial color="#444" />
            </mesh>

            {/* Walls */}
            <mesh position={[-5, 2.5, 0]}>
                <boxGeometry args={[1, 5, CHUNK_LENGTH]} />
                <meshStandardMaterial color="#666" />
            </mesh>
            <mesh position={[5, 2.5, 0]}>
                <boxGeometry args={[1, 5, CHUNK_LENGTH]} />
                <meshStandardMaterial color="#666" />
            </mesh>

            {chunk.obstacles.map((obs, i) => (
                <Obstacle key={i} data={obs} chunkZ={chunk.z} globalOffset={offset} />
            ))}
        </group>
    );
}

export default function World() {
    const { speed, isPlaying, incrementScore, endGame, lane: playerLane, status: playerStatus } = useGameStore();

    const generateObstacles = (chunkId: number): ObstacleData[] => {
        if (chunkId < 3) return []; // First few chunks empty

        const obstacles: ObstacleData[] = [];
        // 50% chance of obstacle per chunk? Or more patterns.
        if (Math.random() > 0.3) {
            const lane = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
            const typeRoll = Math.random();
            let type: ObstacleData['type'] = 'block';
            if (typeRoll > 0.7) type = 'hurdle';
            else if (typeRoll > 0.4) type = 'arch';

            obstacles.push({
                lane,
                z: -(Math.random() * (CHUNK_LENGTH - 5) + 2), // Random Z in chunk
                type
            });
        }
        return obstacles;
    };

    const [chunks, setChunks] = useState<ChunkData[]>(() => {
        return Array.from({ length: VISIBLE_CHUNKS }).map((_, i) => ({
            id: i,
            z: -i * CHUNK_LENGTH,
            obstacles: generateObstacles(i)
        }));
    });

    const groupRef = useRef<THREE.Group>(null);
    const offsetRef = useRef(0);

    useFrame((state, delta) => {
        if (!groupRef.current) return;
        if (!isPlaying) return;

        // Move World
        const distance = speed * delta;
        offsetRef.current += distance;
        groupRef.current.position.z = offsetRef.current;

        // Score based on distance
        incrementScore(distance);

        // Collision Detection
        // Player is at Z=0.
        // Obstacle world Z = chunk.z + offsetRef.current + obs.z
        chunks.forEach(chunk => {
            chunk.obstacles.forEach(obs => {
                const obsWorldZ = chunk.z + offsetRef.current + obs.z;

                // Check Z overlap (Player is approx 1 unit deep, at Z=0)
                if (obsWorldZ > -0.5 && obsWorldZ < 0.5) {
                    // Potential Hit
                    if (obs.lane === playerLane) {
                        // Logic based on type
                        let hit = false;

                        if (obs.type === 'block') {
                            hit = true;
                        } else if (obs.type === 'hurdle') {
                            // Must be jumping
                            if (playerStatus !== 'jumping') hit = true;
                        } else if (obs.type === 'arch') {
                            // Must be sliding? 
                            // Arch is high (y=2, scale y=2 -> range 1 to 3). Player height 1. 
                            // Actually if Arch is at y=2, bottom is at 1. Player is at 0.5, height 1 -> top at 1.
                            // So Player fits under? 
                            // If standard height is 1 (center 0.5), top is 1.
                            // If Arch center 2, size 2 -> bottom 1.
                            // So sliding not strictly required if Arch is high enough?
                            // Let's say Arch requires sliding (scale down to 0.5).
                            if (playerStatus !== 'sliding') hit = true;
                        }

                        if (hit) {
                            console.log("GAME OVER");
                            endGame();
                        }
                    }
                }
            });
        });

        // Chunk Management
        const firstChunk = chunks[0];
        const firstChunkZ = firstChunk.z + offsetRef.current;

        if (firstChunkZ > REMOVE_THRESHOLD + CHUNK_LENGTH / 2) {
            setChunks((prev) => {
                const nextId = prev[prev.length - 1].id + 1;
                const newChunk = {
                    id: nextId,
                    z: -(nextId) * CHUNK_LENGTH,
                    obstacles: generateObstacles(nextId)
                };
                return [...prev.slice(1), newChunk];
            });
        }
    });

    return (
        <group ref={groupRef}>
            {chunks.map((chunk) => (
                <Chunk key={chunk.id} chunk={chunk} offset={offsetRef.current} />
            ))}
        </group>
    );
}
