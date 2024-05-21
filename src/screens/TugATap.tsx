import Board from "../components/Board.tsx";
import { useEffect } from "react";
import Button from "../components/Button.tsx";
import StickmanTug from "../components/StickmanTug.tsx";
import Timer from "../components/Timer.tsx";
import Banner from "../components/Banner.tsx";
import Event from "../components/Event.tsx";

function TugATap() {
  useEffect(() => {
    console.log("rerender");
  });

  return (
    <div className="relative flex h-full min-h-screen flex-col items-center justify-between">
      <div className="relative mt-4 w-full space-y-2 px-4">
        <Timer />
        <Board>TUG-A-TAP!</Board>

        <Banner />
      </div>

      <Button />

      <StickmanTug />

      <Event />
    </div>
  );
}

export default TugATap;
