import bannerWinner from "../assets/banner.png";
import bannerLoser from "../assets/banner_loser.png";
import bannerTied from "../assets/banner_tied.png";
import { useGameStore } from "../store/useGameStore";
import { cn } from "../lib/utils";

import { useEffect, useState } from "react";
import { useAudioStore } from "../store/useAudioStore";

const Banner = () => {
  const screen = useGameStore((state) => state.game.screen);
  const gameOver = useGameStore((state) => state.game.gameOver);

  const playerIDs = useGameStore((state) => state.game.playerIds);
  const playerID = useGameStore((state) => state.playerID);
  const winner = useGameStore((state) => state.game.winner);

  const allClicks = useGameStore((state) => state.game.clicks);

  const playWin = useAudioStore((state) => state.playWin);
  const playLose = useAudioStore((state) => state.playLose);

  const [isPlaying, setIsPlaying] = useState(false);
  useEffect(() => {
    if (isPlaying) {
      setTimeout(() => {
        Rune.showGameOverPopUp();
      }, 3000);
    }
  }, [isPlaying]);

  if (!gameOver || playerID == undefined) return null;

  const determineFlag = () => {
    switch (screen) {
      case "tug-a-tap": {
        if (winner === playerID) {
          if (!isPlaying) {
            playWin();
            setIsPlaying(true);
          }
          return bannerWinner;
        }

        if (
          Object.values(allClicks).every(
            (clicks) => clicks === allClicks[playerIDs[0]],
          )
        ) {
          if (!isPlaying) {
            playLose();
            setIsPlaying(true);
          }
          return bannerTied;
        }

        if (!isPlaying) {
          playLose();
          setIsPlaying(true);
        }
        return bannerLoser;
      }
      case "react-tap":
      case "tap-race": {
        if (winner === null) {
          if (!isPlaying) {
            playLose();
            setIsPlaying(true);
          }
          return bannerTied;
        }

        if (winner === playerID) {
          if (!isPlaying) {
            playWin();
            setIsPlaying(true);
          }
          return bannerWinner;
        }

        if (!isPlaying) {
          playLose();
          setIsPlaying(true);
        }
        return bannerLoser;
      }
    }
  };

  return (
    <div className="banner-animation relative -top-[8rem]">
      <img
        src={determineFlag()}
        alt="banner"
        className={cn(
          "absolute left-1/2 top-[4.5rem] z-50 w-full max-w-xl -translate-x-1/2",
        )}
      />
    </div>
  );
};

export default Banner;
