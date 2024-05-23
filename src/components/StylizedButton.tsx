import React from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import useSound from "use-sound";
import selectSound from "../assets/select.wav";
import { cn } from "../lib/utils";

type Props = {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
};

const StylizedButton = ({
  onClick,
  className,
  disabled = false,
  children,
}: Props) => {
  const [play] = useSound(selectSound);

  return (
    <button
      onClick={() => {
        play();
        onClick();
      }}
      disabled={disabled}
      className={cn(
        "stylized-shadow relative rounded border-[4px] border-black p-3 transition-all ",
        !disabled &&
          "active:translate-y-3 active:scale-[0.95] active:shadow-none",
        className,
      )}
    >
      <div className="pt-2 text-center text-[2.6rem] font-black">
        {children}
      </div>
    </button>
  );
};

export default StylizedButton;
