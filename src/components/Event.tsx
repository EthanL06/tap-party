import { useEffect, useState } from "react";
import { useGameStore } from "../store/useGameStore";
import useSound from "use-sound";
import three from "../assets/sfx/3.wav";
import two from "../assets/sfx/2.wav";
import one from "../assets/sfx/1.wav";
import go from "../assets/sfx/go.wav";

const Event = () => {
  const [isFading, setIsFading] = useState(false);

  const gameStart = useGameStore((state) => state.game.gameStart);
  const countdown = Math.round(
    useGameStore((state) => state.game.countdown) / 1000,
  );

  const [playThree] = useSound(three);
  const [playTwo] = useSound(two);
  const [playOne] = useSound(one);
  const [playGo] = useSound(go);

  const messages = ["THREE", "TWO", "ONE", "GO!", ""].reverse();

  useEffect(() => {
    switch (countdown) {
      case 4:
        playThree();
        break;
      case 3:
        playTwo();
        break;
      case 2:
        playOne();
        break;
      case 1:
        playGo();
        setIsFading(true);
        break;
    }
  }, [countdown, playOne, playThree, playTwo, playGo]);

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
