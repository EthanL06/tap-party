import { useState } from "react";
import { MousePointerClick } from "lucide-react";
import clickAudioSound from "../assets/click.mp3";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import useSound from "use-sound";
import { cn } from "../lib/utils";

const Button = ({
  disabled,
  className,
}: {
  disabled: boolean;
  className?: string;
}) => {
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
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        "stylized-shadow focus:stylized-shadow group relative flex size-44 items-center justify-center rounded-full border-4 border-black bg-[#ffcb39] p-2 transition-all ",
        !disabled && "active:translate-y-1 active:shadow-none",
        className,
      )}
    >
      {divs.map((div) => (
        <div
          key={div}
          className="scale-in-fade-out absolute min-h-20 min-w-20 rounded-full border-2 border-black p-2"
        ></div>
      ))}
      <MousePointerClick className="scale-[4] fill-black stroke-black  " />
    </button>
  );
};

export default Button;
