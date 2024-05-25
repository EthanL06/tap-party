import Board from "../components/Board.tsx";
import Button from "../components/Button.tsx";
import StickmanTug from "../components/StickmanTug.tsx";
import Timer from "../components/Timer.tsx";
import Banner from "../components/Banner.tsx";
import Event from "../components/Event.tsx";
import { useGameStore } from "../store/useGameStore.ts";
import { useEffect } from "react";
import { useAudioStore } from "../store/useAudioStore.ts";
import { cn } from "../lib/utils.ts";

function TugATap() {
  const gameOver = useGameStore((state) => state.game.gameOver);
  const stopLobbyMusic = useAudioStore((state) => state.stopLobbyMusic);

  useEffect(() => {
    stopLobbyMusic();
  }, [stopLobbyMusic]);

  return (
    <div className="relative flex h-full min-h-screen flex-col items-center justify-between">
      <div className="relative mt-4 w-full space-y-2 px-4">
        <Timer />
        <Board>TUG-A-TAP!</Board>

        <Banner />
      </div>

      <Button
        onClick={() => {
          Rune.actions.click();
        }}
        className={cn(gameOver && "opacity-50")}
        disabled={gameOver}
      />

      <StickmanTug />

      <Event />
    </div>
  );
}

export default TugATap;
