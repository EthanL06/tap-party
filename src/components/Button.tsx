import { ButtonHTMLAttributes, useState } from "react";
import { cn } from "../lib/utils";
import tap from "../assets/tap.svg";
import { useAudioStore } from "../store/useAudioStore";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  showIcon?: boolean;
  className?: string;
}

const Button = ({ showIcon = true, className, ...props }: ButtonProps) => {
  const play = useAudioStore((state) => state.playClick);
  const [divs, setDivs] = useState<number[]>([]);

  const handleClick = () => {
    play();

    setDivs((prevDivs) => [...prevDivs, Date.now()]);
    setTimeout(() => setDivs((prevDivs) => prevDivs.slice(1)), 500);
  };

  return (
    <button
      {...props}
      disabled={props.disabled}
      onClick={(event) => {
        props.onClick?.(event);
        handleClick();
      }}
      className={cn(
        "stylized-shadow focus:stylized-shadow group relative flex size-44 items-center justify-center rounded-full border-4 border-black bg-[#ffcb39] p-2 transition-all ",
        !props.disabled &&
          "active:translate-y-1 active:scale-95 active:shadow-none",
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
        className={cn(
          !showIcon && "hidden",
          "relative size-24 translate-x-2 translate-y-2 -rotate-[3deg] fill-black stroke-black",
        )}
      />
    </button>
  );
};

export default Button;
