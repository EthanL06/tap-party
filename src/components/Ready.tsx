import { useState, useEffect } from "react";
import Button from "./Button";
import { useGameStore } from "../store/useGameStore";
import { cn } from "../lib/utils";

const Ready = () => {
  const readyPlayers = useGameStore((state) => state.game.readyPlayers);
  const totalPlayers = useGameStore((state) => state.game.playerIds.length);
  const playerID = useGameStore((state) => state.playerID);

  const [fade, setFade] = useState(false);
  const [render, setRender] = useState(true);

  useEffect(() => {
    if (readyPlayers.length === totalPlayers && totalPlayers > 1) {
      setFade(true);
      setTimeout(() => {
        setRender(false);
      }, 650);
    }
  }, [readyPlayers, totalPlayers]);

  if (!render) {
    return null;
  }

  return (
    <div
      className={`absolute z-[100] flex h-full w-full flex-col items-center justify-center bg-[#ffcb39]/85 ${fade ? "fade-away-no-delay" : ""}`}
    >
      <div className="mb-3 text-4xl font-bold">Click to Ready</div>

      <Button
        className={cn(
          readyPlayers.includes(playerID) &&
            "scale-95 opacity-50 transition-all",
        )}
        disabled={readyPlayers.includes(playerID)}
        onClick={() => {
          Rune.actions.setPlayerReady();
        }}
      />

      <div
        className="mt-4 
      flex w-full items-center justify-center gap-x-1"
      >
        {readyPlayers.map((playerId) => (
          <img
            key={playerId}
            src={Rune.getPlayerInfo(playerId).avatarUrl}
            alt="avatar"
            className="stylized-shadow size-8 rounded-full border-[3px] border-black"
          />
        ))}

        {Array.from({ length: totalPlayers - readyPlayers.length }).map(
          (_, index) => (
            <div key={index} className="size-8 " />
          ),
        )}
      </div>
    </div>
  );
};
export default Ready;
