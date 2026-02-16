'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Stars } from '@react-three/drei';
import { Suspense } from 'react';
import Player from './Player';
import World from './World';


export default function Scene() {
    return (
        <div className="h-screen w-full bg-[#1e1e2e]">
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 5, 12]} fov={50} />
                {/* Fog for depth and to hide chunk pop-in */}
                <fog attach="fog" args={['#1e1e2e', 10, 40]} />

                {/* Lighting */}
                <ambientLight intensity={0.5} />
                <directionalLight
                    position={[10, 20, 10]}
                    intensity={1.5}
                    castShadow
                    shadow-mapSize={[1024, 1024]}
                />
                <pointLight position={[-10, 5, -10]} intensity={0.5} color="orange" />

                <Suspense fallback={null}>
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                    <World />
                    <Player />
                    <Environment preset="sunset" />
                </Suspense>

                {/* Camera Controls - locked for gameplay but subtle movement allowed? */}
                {/* Actually, for a runner, camera usually follows player strictly. 
            Here Player is static. Camera is static. World moves. 
            So OrbitControls should be disabled or restricted. */}
                {/* <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2.2} minPolarAngle={Math.PI / 3} /> */}
            </Canvas>
        </div>
    );
}
