import { useEffect, useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { useAudioStore } from "../store/useAudioStore";

const Event = () => {
  const [isFading, setIsFading] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  const gameStart = useGameStore((state) => state.game.gameStart);
  const countdown = Math.round(
    useGameStore((state) => state.game.countdown) / 1000,
  );
  const gameOver = useGameStore((state) => state.game.gameOver);
  const gameMode = useGameStore((state) => state.game.gameMode);

  const playThree = useAudioStore((state) => state.playThree);
  const playTwo = useAudioStore((state) => state.playTwo);
  const playOne = useAudioStore((state) => state.playOne);
  const playGo = useAudioStore((state) => state.playGo);

  const playRace = useAudioStore((state) => state.playRace);
  const raceSound = useAudioStore((state) => state.raceSound);
  const stopRaceSound = useAudioStore((state) => state.stopRaceSound);

  const playTugATap = useAudioStore((state) => state.playTugATap);
  const tugATapSound = useAudioStore((state) => state.tugATapSound);

  const playReactTap = useAudioStore((state) => state.playReactTap);
  const reactTapSound = useAudioStore((state) => state.reactTapSound);
  const stopReactTapSound = useAudioStore((state) => state.stopReactTapSound);

  const [lastPlayed, setLastPlayed] = useState<
    "three" | "two" | "one" | "go" | "none"
  >("none");

  const messages = ["THREE", "TWO", "ONE", "GO!", ""].reverse();

  useEffect(() => {
    switch (countdown) {
      case 4:
        if (lastPlayed !== "three") {
          playThree();
          setLastPlayed("three");
        }
        break;
      case 3:
        if (lastPlayed !== "two") {
          playTwo();
          setLastPlayed("two");
        }
        break;
      case 2:
        if (lastPlayed !== "one") {
          playOne();
          setLastPlayed("one");
        }
        break;
      case 1:
        if (lastPlayed !== "go") {
          playGo();
          setLastPlayed("go");
          setIsFading(true);
        }
        break;
    }
  }, [countdown, playOne, playThree, playTwo, playGo, lastPlayed]);

  useEffect(() => {
    if (gameOver) {
      stopReactTapSound();
      stopRaceSound();
    }
  }, [gameOver, stopRaceSound, stopReactTapSound]);

  useEffect(() => {
    if (!isPlayingMusic && countdown <= 2) {
      switch (gameMode) {
        case "tug-a-tap": {
          if (tugATapSound) {
            playTugATap();
            tugATapSound.fade(0, 0.5, 3000);
          }
          break;
        }
        case "tap-race": {
          if (raceSound) {
            playRace();
            raceSound.fade(0, 0.5, 3000);
          }
          break;
        }

        case "react-tap": {
          if (reactTapSound) {
            playReactTap();
            reactTapSound.fade(0, 0.5, 3000);
          }
          break;
        }
      }

      setIsPlayingMusic(true);
    }
  }, [
    gameStart,
    gameMode,
    playRace,
    playTugATap,
    raceSound,
    tugATapSound,
    countdown,
    isPlayingMusic,
    reactTapSound,
    playReactTap,
  ]);

  if (countdown <= 0 || gameStart) return null;

  return (
    <div
      className={`absolute z-[100] flex h-full w-full items-center justify-center bg-[#ffcb39]/85 ${isFading ? "fade-away" : ""}`}
    >
      <span
        key={countdown}
        className="big-and-small text-center text-[7rem] font-black text-black"
      >
        {messages[countdown]}
      </span>
    </div>
  );
};

export default Event;
