import { useEffect, useState } from 'react';

export default function useInput() {
    const [input, setInput] = useState({
        left: false,
        right: false,
        jump: false,
        slide: false,
    });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    setInput((prev) => ({ ...prev, left: true }));
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    setInput((prev) => ({ ...prev, right: true }));
                    break;
                case 'ArrowUp':
                case 'KeyW':
                    setInput((prev) => ({ ...prev, jump: true }));
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    setInput((prev) => ({ ...prev, slide: true }));
                    break;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            switch (e.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    setInput((prev) => ({ ...prev, left: false }));
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    setInput((prev) => ({ ...prev, right: false }));
                    break;
                case 'ArrowUp':
                case 'KeyW':
                    setInput((prev) => ({ ...prev, jump: false }));
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    setInput((prev) => ({ ...prev, slide: false }));
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    return input;
}
