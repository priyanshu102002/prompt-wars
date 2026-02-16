import { useEffect, useState } from 'react';

// Hardcoded for demo purposes, normally fetched from Firestore/RTDB
const CONTEST_DURATION = 60 * 60 * 1000; // 1 hour
// Set start time to 5 minutes ago so it's active, or use current time logic
const MOCK_START_TIME = Date.now() - 5 * 60 * 1000;
const MOCK_END_TIME = MOCK_START_TIME + CONTEST_DURATION;

interface ContestState {
    isActive: boolean;
    timeRemaining: number;
    status: 'upcoming' | 'active' | 'ended';
}

export default function useContest() {
    const [contest, setContest] = useState<ContestState>({
        isActive: false,
        timeRemaining: 0,
        status: 'upcoming',
    });

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            let status: ContestState['status'] = 'upcoming';
            let isActive = false;
            let timeRemaining = 0;

            if (now < MOCK_START_TIME) {
                status = 'upcoming';
                timeRemaining = MOCK_START_TIME - now;
            } else if (now >= MOCK_START_TIME && now < MOCK_END_TIME) {
                status = 'active';
                isActive = true;
                timeRemaining = MOCK_END_TIME - now;
            } else {
                status = 'ended';
                timeRemaining = 0;
            }

            setContest({ status, isActive, timeRemaining });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return contest;
}
