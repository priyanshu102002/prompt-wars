'use client';

import { useEffect, useState } from 'react';
import { rtdb } from '@/lib/firebase/config';
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';
import useAuth from '@/hooks/useAuth';

interface PlayerScore {
    uid: string;
    name: string;
    currentScore: number;
    photo?: string;
}

export default function Leaderboard() {
    const [players, setPlayers] = useState<PlayerScore[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        const playersRef = query(ref(rtdb, 'contest/global/players'), orderByChild('currentScore'), limitToLast(10));

        const unsubscribe = onValue(playersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const sorted = Object.entries(data)
                    .map(([uid, val]: [string, any]) => ({ uid, ...val }))
                    .sort((a, b) => b.currentScore - a.currentScore);
                setPlayers(sorted);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="absolute top-20 right-4 bg-black/50 p-4 rounded-lg pointer-events-none w-64">
            <h3 className="text-white font-bold mb-2 border-b border-gray-600 pb-1">Live Leaderboard</h3>
            <div className="space-y-2">
                {players.map((p, index) => (
                    <div key={p.uid} className={`flex items-center justify-between text-sm ${user?.uid === p.uid ? 'text-yellow-400 font-bold' : 'text-gray-200'}`}>
                        <div className="flex items-center gap-2">
                            <span className="w-4">{index + 1}.</span>
                            <span className="truncate max-w-[100px]">{p.name || 'Anonymous'}</span>
                        </div>
                        <span>{Math.floor(p.currentScore)}</span>
                    </div>
                ))}
                {players.length === 0 && <div className="text-gray-400 text-xs">Waiting for runners...</div>}
            </div>
        </div>
    );
}
