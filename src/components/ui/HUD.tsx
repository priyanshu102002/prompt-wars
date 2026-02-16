'use client';

import { useGameStore } from '@/store/gameStore';
import LoginButton from '@/components/auth/LoginButton';
import useContest from '@/hooks/useContest';

export default function HUD() {
    const { score, isPlaying, startGame } = useGameStore();
    const { status, timeRemaining, isActive } = useContest();

    const formatTime = (ms: number) => {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor((ms / (1000 * 60 * 60)));
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    if (isPlaying) {
        return (
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-4">
                <div className="flex justify-between items-start pointer-events-auto">
                    <div className="text-white font-bold text-2xl drop-shadow-md pointer-events-none">
                        Score: {Math.floor(score)}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <LoginButton />
                        <div className="text-yellow-400 font-mono font-bold bg-black/50 px-2 rounded pointer-events-none">
                            {formatTime(timeRemaining)}
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 px-2 py-1 rounded">
                    Controls: Arrow Keys / WASD
                </div>
            </div>
        );
    }

    return (
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-black/70 z-10 pointer-events-auto">
            <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                <LoginButton />
                <div className="text-white text-sm">
                    Status: <span className={`font-bold uppercase ${isActive ? 'text-green-400' : 'text-red-400'}`}>{status}</span>
                </div>
                {isActive && <div className="text-yellow-400 font-mono font-bold">{formatTime(timeRemaining)}</div>}
            </div>

            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-600 mb-8">
                {score > 0 ? "GAME OVER" : "TEMPLE RUN"}
            </h1>

            {score > 0 && (
                <div className="text-white text-2xl mb-8">
                    Final Score: <span className="text-yellow-400 font-bold">{Math.floor(score)}</span>
                </div>
            )}

            {isActive ? (
                <button
                    onClick={startGame}
                    className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg"
                >
                    {score > 0 ? "PLAY AGAIN" : "START RUN"}
                </button>
            ) : (
                <div className="px-8 py-4 bg-gray-600 text-gray-300 font-bold rounded-lg text-xl">
                    {status === 'upcoming' ? "CONTEST STARTING SOON" : "CONTEST ENDED"}
                </div>
            )}

            <div className="mt-8 text-slate-400 text-sm max-w-md text-center">
                <p>Avoid obstacles by switching lanes (Left/Right).</p>
                <p>Jump (Up) over yellow hurdles.</p>
                <p>Slide (Down) under green arches.</p>
            </div>
        </div>
    );
}
