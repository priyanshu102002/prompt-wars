import Scene from '@/components/game/Scene';
import HUD from '@/components/ui/HUD';
import ScoreSync from '@/components/game/ScoreSync';
import Leaderboard from '@/components/ui/Leaderboard';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between pointer-events-none sticky">
      <div className="pointer-events-auto w-full h-full relative">
        <Scene />
        <ScoreSync />
        <HUD />
        <Leaderboard />
      </div>
    </main>
  );
}
