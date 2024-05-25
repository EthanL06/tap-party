import Banner from "../components/Banner";
import Board from "../components/Board";

import stickman from "../assets/stickman.svg";
import stickmanRun from "../assets/stickman-run.svg";
import stickmanSad from "../assets/stickman-sad.svg";
import stickmanHappy from "../assets/stickman-happy.svg";

import { cn } from "../lib/utils";
import StylizedButton from "../components/StylizedButton";
import { useEffect, useRef, useState } from "react";
import Timer from "../components/Timer";
import Event from "../components/Event";
import { useGameStore } from "../store/useGameStore";
import useSound from "use-sound";
import selectSound from "../assets/select.wav";
import { PlayerId } from "rune-games-sdk";
import { useAudioStore } from "../store/useAudioStore";

const TapRace = () => {
  const [play] = useSound(selectSound);
  const stopLobbyMusic = useAudioStore((state) => state.stopLobbyMusic);

  const playerIDs = useGameStore((state) => state.game.playerIds);
  const playerID = useGameStore((state) => state.playerID);
  const gameOver = useGameStore((state) => state.game.gameOver);

  useEffect(() => {
    stopLobbyMusic();
  }, [stopLobbyMusic]);

  const [side, setSide] = useState<"left" | "right">("left");

  const otherPlayers = playerIDs.filter((id) => id !== playerID);

  return (
    <div className="relative flex h-full min-h-screen flex-col items-center">
      <div className="relative mt-4 w-full space-y-2 px-4">
        <Timer />
        <Board>TAP RACE!</Board>

        <Banner />
      </div>

      <div className="mt-12 flex w-full grow flex-col justify-between gap-y-1  px-4">
        <StickmanTrack playerID={playerID} />

        {otherPlayers.map((id) => (
          <StickmanTrack key={id} playerID={id} />
        ))}

        {Array.from({ length: 4 - playerIDs.length }).map((_, i) => (
          <div key={i} className="h-10"></div>
        ))}
      </div>

      <div className="mb-20 flex w-full grow flex-col">
        <div className="grow"></div>
        <div className="grid w-full grow grid-cols-2 gap-x-1.5 px-8">
          <StylizedButton
            disabled={side !== "left" || gameOver}
            className={cn(
              "h-full max-h-52 w-full",
              (side === "right" || gameOver) && "opacity-50",
            )}
            onClick={() => {
              play();
              Rune.actions.raceTap();
              setSide("right");
            }}
          >
            L
          </StylizedButton>
          <StylizedButton
            disabled={side !== "right" || gameOver}
            className={cn(
              "h-full max-h-52 w-full",
              (side === "left" || gameOver) && "opacity-50",
            )}
            onClick={() => {
              play();
              Rune.actions.raceTap();
              setSide("left");
            }}
          >
            R
          </StylizedButton>
        </div>
      </div>

      <Event />
    </div>
  );
};

const StickmanTrack = ({ playerID }: { playerID: PlayerId }) => {
  const distance = useGameStore(
    (state) => state.game.playerDistances[playerID],
  );
  const winner = useGameStore((state) => state.game.winner);

  const containerRef = useRef<HTMLDivElement>(null);
  const [leftValue, setLeftValue] = useState("0px");

  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const newLeftValue = (containerWidth * distance) / 100 - 15 + "px";
      setLeftValue(newLeftValue);
    }
  }, [distance]);

  const determineStickman = () => {
    if (winner) {
      console.log("WIN:", winner);
      if (winner === playerID) {
        return stickmanHappy;
      } else {
        return stickmanSad;
      }
    }

    if (distance <= 0) {
      return stickman;
    }

    return stickmanRun;
  };

  return (
    <div
      className="relative mx-auto w-full max-w-[calc(100%-1rem)]"
      ref={containerRef}
    >
      <img
        style={{
          left: leftValue,
        }}
        src={determineStickman()}
        alt="stickman"
        className={cn(
          "relative z-0 size-10 transition-all",
          winner && winner !== playerID && "top-3",
          winner && winner === playerID && "animate-bounce",
        )}
      />

      <div className="h-[3px] w-full rounded-full bg-black"></div>
    </div>
  );
};

export default TapRace;
