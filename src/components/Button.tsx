import { useState } from "react";
import clickAudioSound from "../assets/click.mp3";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import useSound from "use-sound";
import { cn } from "../lib/utils";
import { useGameStore } from "../store/useGameStore";
import tap from "../assets/tap.svg";
const Button = ({ className }: { className?: string }) => {
  const gameOver = useGameStore((state) => state.game.gameOver);
  const [play] = useSound(clickAudioSound);
  const [divs, setDivs] = useState<number[]>([]);

  const handleClick = () => {
    Rune.actions.click();

    play();

    setDivs((prevDivs) => [...prevDivs, Date.now()]);
    setTimeout(() => setDivs((prevDivs) => prevDivs.slice(1)), 500);
  };

  return (
    <button
      disabled={gameOver}
      onClick={handleClick}
      className={cn(
        "stylized-shadow focus:stylized-shadow group relative flex size-44 items-center justify-center rounded-full border-4 border-black bg-[#ffcb39] p-2 transition-all ",
        !gameOver && "active:translate-y-1 active:scale-95 active:shadow-none",
        className,
      )}
    >
      {divs.map((div) => (
        <div
          key={div}
          className="scale-in-fade-out absolute min-h-20 min-w-20 rounded-full border-2 border-black p-2"
        ></div>
      ))}

      <img
        src={tap}
        alt="tap"
        className="relative size-24 translate-x-2 translate-y-2 -rotate-[3deg] fill-black stroke-black"
      />
      {/* <MousePointerClick className="scale-[4] fill-black stroke-black  " /> */}
    </button>
  );
};

export default Button;
