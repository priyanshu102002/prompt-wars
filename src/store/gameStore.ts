import { create } from 'zustand';

interface GameState {
    isPlaying: boolean;
    score: number;
    speed: number;
    // Player State
    lane: number; // -1, 0, 1
    status: 'running' | 'jumping' | 'sliding';

    startGame: () => void;
    endGame: () => void;
    incrementScore: (amount: number) => void;
    setLane: (lane: number) => void;
    setStatus: (status: 'running' | 'jumping' | 'sliding') => void;
}

export const useGameStore = create<GameState>((set) => ({
    isPlaying: false,
    score: 0,
    speed: 10,
    lane: 0,
    status: 'running',

    startGame: () => set({ isPlaying: true, score: 0, speed: 10, lane: 0, status: 'running' }),
    endGame: () => set({ isPlaying: false, speed: 0 }),
    incrementScore: (amount) => set((state) => ({ score: state.score + amount })),
    setLane: (lane) => set({ lane }),
    setStatus: (status) => set({ status }),
}));
