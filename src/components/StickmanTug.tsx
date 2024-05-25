import { useEffect, useRef } from "react";
import stickmanHappy from "../assets/stickman-happy.svg";
import stickmanSad from "../assets/stickman-sad.svg";
import stickman from "../assets/stickman.svg";
import { cn } from "../lib/utils";
import { useGameStore } from "../store/useGameStore";

const StickmanTug = () => {
  const stickmanRef = useRef<HTMLImageElement>(null);
  const prevYourClicksRef = useRef(0);

  const gameOver = useGameStore((state) => state.game.gameOver);
  const yourClicks = useGameStore((state) => state.game.clicks[state.playerID]);

  const playerId = useGameStore((state) => state.playerID);
  const winner = useGameStore((state) => state.game.winner);

  const greatestOpponentClicks = useGameStore((state) =>
    Math.max(
      ...state.game.playerIds
        .filter((id) => id !== state.playerID)
        .map((id) => state.game.clicks[id]),
    ),
  );

  const clickDifference = yourClicks - greatestOpponentClicks;
  const scalingFactor = 5;
  const yourClicksPercentage = Math.max(
    0,
    Math.min(50 + clickDifference * scalingFactor, 100),
  );
  const opponentClicksPercentage = Math.max(0, 100 - yourClicksPercentage);

  const didPlayerWin = gameOver && winner != null && winner === playerId;

  useEffect(() => {
    if (yourClicks > prevYourClicksRef.current && yourClicksPercentage == 100) {
      if (stickmanRef.current?.classList.contains("right-left")) return;

      stickmanRef.current?.classList.add("right-left");

      setTimeout(() => {
        stickmanRef.current?.classList.remove("right-left");
      }, 400);
    }

    prevYourClicksRef.current = yourClicks;
  }, [yourClicks, yourClicksPercentage]);

  const determineImage = () => {
    if (gameOver) {
      if (didPlayerWin) return stickmanHappy;

      if (yourClicksPercentage === 50) return stickman;

      return stickmanSad;
    }

    return yourClicksPercentage > opponentClicksPercentage
      ? stickmanHappy
      : stickman;
  };

  return (
    <div
      className={cn(
        "relative mb-28 flex w-full rounded-full   border-black p-1 transition-all",
      )}
    >
      <HalfwayLine />

      <div
        style={{
          left: `calc(${Math.max(10, Math.min(yourClicksPercentage, 90))}%)`,
        }}
        className={cn(
          "absolute -top-10 size-16 -translate-x-1/2 transition-all",
        )}
      >
        <Shadow className="-bottom-1 left-1/2 z-50 -translate-x-1/2 " />

        <img
          ref={stickmanRef}
          src={determineImage()}
          alt="stickman"
          className={cn(
            "relative z-50 size-16 transition-all ",
            didPlayerWin && "animate-bounce",
            gameOver &&
              !didPlayerWin &&
              yourClicksPercentage != 50 &&
              "left-2 top-[1.15rem]",
          )}
        />
      </div>
    </div>
  );
};

const HalfwayLine = () => {
  return (
    <div className="absolute -top-1/2 left-1/2 h-8 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black "></div>
  );
};

export function Shadow({ className }: { className?: string }) {
  return (
    <div
      style={{
        clipPath: `ellipse(50% 50%)`,
      }}
      className={cn(
        "absolute  h-2.5 w-12  rounded-full bg-[rgb(221_173_50)]",
        className,
      )}
    ></div>
  );
}

export default StickmanTug;
