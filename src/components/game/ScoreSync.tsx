'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import useAuth from '@/hooks/useAuth';
import { rtdb, db } from '@/lib/firebase/config';
import { ref, update } from 'firebase/database';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function ScoreSync() {
    const { score, isPlaying } = useGameStore();
    const { user } = useAuth();
    const lastUpdateRef = useRef(0);

    // Sync frequently while playing
    useEffect(() => {
        if (!user || !isPlaying) return;

        const now = Date.now();
        // Throttle to every 2 seconds
        if (now - lastUpdateRef.current > 2000) {
            update(ref(rtdb, `contest/global/players/${user.uid}`), {
                name: user.displayName,
                photo: user.photoURL,
                currentScore: Math.floor(score),
                lastActive: now,
            }).catch(console.error);
            lastUpdateRef.current = now;
        }
    }, [score, isPlaying, user]);

    // Final score on Game Over
    useEffect(() => {
        if (!user) return;
        if (!isPlaying && score > 0) {
            // RTDB Update
            update(ref(rtdb, `contest/global/players/${user.uid}`), {
                name: user.displayName,
                photo: user.photoURL,
                currentScore: Math.floor(score),
                lastActive: Date.now(),
            }).catch(console.error);

            // Firestore History
            const historyRef = doc(db, `users/${user.uid}/history/${Date.now()}`);
            setDoc(historyRef, {
                score: Math.floor(score),
                timestamp: serverTimestamp(),
                contestId: 'global', // dynamic if needed
            }).catch(console.error);
        }
    }, [isPlaying, score, user]);

    return null;
}
