import { useEffect, useState } from "react";
import { useGameStore } from "../store/useGameStore";

const Event = () => {
  const countdown = Math.round(
    useGameStore((state) => state.game.countdown) / 1000,
  );
  const messages = ["THREE", "TWO", "ONE", "TAP!", ""].reverse();
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    console.log(countdown);
    if (countdown === 1) {
      setIsFading(true);
    }
  }, [countdown, messages.length]);

  if (countdown <= 0) return null;

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
