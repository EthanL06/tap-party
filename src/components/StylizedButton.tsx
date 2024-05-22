import React from "react";
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
  return (
    <button
      onClick={onClick}
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
