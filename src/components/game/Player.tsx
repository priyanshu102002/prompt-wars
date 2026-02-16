import { useFrame } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import { Mesh } from 'three';
import useInput from '@/hooks/useInput';
import { useGameStore } from '@/store/gameStore';

const LANE_WIDTH = 2;
const JUMP_HEIGHT = 2;
const JUMP_DURATION = 0.5;
const SLIDE_DURATION = 0.8;

export default function Player() {
    const meshRef = useRef<Mesh>(null);
    const { left, right, jump, slide } = useInput();

    // Store
    const { lane, status, setLane, setStatus, isPlaying } = useGameStore();

    // Local refs for animation timing
    const jumpStartTime = useRef(0);
    const slideStartTime = useRef(0);

    // Smooth transition state
    const currentX = useRef(0);

    // Input Handling
    useEffect(() => {
        if (!isPlaying) return;
        if (left && lane > -1) setLane(lane - 1);
    }, [left, isPlaying]);

    useEffect(() => {
        if (!isPlaying) return;
        if (right && lane < 1) setLane(lane + 1);
    }, [right, isPlaying]);

    useEffect(() => {
        if (!isPlaying) return;
        if (jump && status === 'running') {
            setStatus('jumping');
            jumpStartTime.current = Date.now();
        }
    }, [jump, isPlaying, status]);

    useEffect(() => {
        if (!isPlaying) return;
        if (slide && status === 'running') {
            setStatus('sliding');
            slideStartTime.current = Date.now();
            setTimeout(() => {
                // Only reset if still sliding (might have jumped? no, jump blocked)
                if (useGameStore.getState().status === 'sliding') {
                    setStatus('running');
                }
            }, SLIDE_DURATION * 1000);
        }
    }, [slide, isPlaying, status]);

    // Animation Loop
    useFrame((state, delta) => {
        if (!meshRef.current) return;

        // Smooth Lateral Movement
        const targetX = lane * LANE_WIDTH;
        currentX.current += (targetX - currentX.current) * 15 * delta;
        meshRef.current.position.x = currentX.current;

        // Jump Physics
        if (status === 'jumping') {
            const elapsed = (Date.now() - jumpStartTime.current) / 1000;
            if (elapsed < JUMP_DURATION) {
                const progress = elapsed / JUMP_DURATION;
                meshRef.current.position.y = Math.sin(progress * Math.PI) * JUMP_HEIGHT + 0.5;
            } else {
                setStatus('running'); // Auto land
                meshRef.current.position.y = 0.5;
            }
        }
        // Slide Logic
        else if (status === 'sliding') {
            meshRef.current.scale.y = 0.5;
            meshRef.current.position.y = 0.25;
        }
        // Running
        else {
            meshRef.current.scale.y = 1;
            meshRef.current.position.y = 0.5;
        }
    });

    return (
        <mesh ref={meshRef} position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={status === 'sliding' ? "red" : "dodgerblue"} />
        </mesh>
    );
}
