import { ClockIcon } from "lucide-react";
import { useContext } from "react";
import { GameContext } from "../context/GameContext";

const Timer = () => {
  const { state } = useContext(GameContext);
  const countdown = state.timer / 1000;

  return (
    <div className="flex w-full items-center gap-x-1">
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
