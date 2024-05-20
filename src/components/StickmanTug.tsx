import React, { useEffect, useRef } from "react";
import stickmanHappy from "../assets/stickman-happy.svg";
import stickman from "../assets/stickman.svg";
import { cn } from "../lib/utils";

type Props = {
  yourClicks: number;
  yourClicksPercentage: number;
  opponentClicksPercentage: number;
};

const StickmanTug = ({
  yourClicks,
  yourClicksPercentage,
  opponentClicksPercentage,
}: Props) => {
  const prevYourClicksRef = useRef(0);

  useEffect(() => {
    if (yourClicks > prevYourClicksRef.current) {
      console.log("You clicked!");
    }

    prevYourClicksRef.current = yourClicks;
  }, [yourClicks]);

  return (
    <div
      className={cn(
        "relative mb-12 flex w-full rounded-full   border-black p-1 transition-all",
      )}
    >
      <div
        style={{
          left: `calc(${Math.max(10, Math.min(yourClicksPercentage, 90))}%)`,
        }}
        className={cn(
          "absolute -top-10 size-16 -translate-x-1/2 transition-all",
        )}
      >
        <img
          src={
            yourClicksPercentage > opponentClicksPercentage
              ? stickmanHappy
              : stickman
          }
          alt="stickman"
          className={cn(
            "relative z-10 size-16 transition-all ",
            yourClicksPercentage == 100 && "right-left",
          )}
        />

        <div
          style={{
            clipPath: `ellipse(50% 50%)`,
          }}
          className={cn(
            "absolute -bottom-1 left-1/2 z-0 h-2.5 w-12 -translate-x-1/2 rounded-full bg-[rgb(221_173_50)]",
          )}
        ></div>
      </div>

      <div className="absolute -top-1/2 left-1/2 h-8 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black "></div>
    </div>
  );
};

export default StickmanTug;
