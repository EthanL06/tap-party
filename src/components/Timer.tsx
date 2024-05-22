import { ClockIcon } from "lucide-react";
import { useGameStore } from "../store/useGameStore";

const Timer = () => {
  const timer = useGameStore((state) => state.game.timer);
  const countdown = timer / 1000;

  return (
    <div className="z-0 flex w-full items-center gap-x-0.5">
      <ClockIcon
        strokeWidth={2.5}
        fill="black"
        stroke="#ffcb39"
        className="relative size-6 -translate-y-0.5"
      />
      <span className="text-lg font-bold">
        {countdown <= 0
          ? "0.0"
          : countdown < 10
            ? countdown.toFixed(1)
            : countdown.toFixed(0)}
      </span>
    </div>
  );
};

export default Timer;
