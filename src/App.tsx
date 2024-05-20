import Board from "./components/Board.tsx";
import { useContext, useEffect } from "react";
import { GameContext } from "./context/GameContext.tsx";
import Button from "./components/Button.tsx";
import StickmanTug from "./components/StickmanTug.tsx";
import Timer from "./components/Timer.tsx";
import bannerWinner from "./assets/banner.png";
import bannerLoser from "./assets/banner_loser.png";
import { cn } from "./lib/utils.ts";
// import _debounce from "lodash.debounce";

function App() {
  const { state, playerID } = useContext(GameContext);

  if (!state || !state.clicksPercentage) {
    console.log("Loading game state...");
    // Rune only shows your game after an onChange() so no need for loading screen
    return;
  }

  const yourClicksPercentage = state.clicksPercentage[playerID] || 0;
  const opponentClicksPercentage = state.playerIds
    .filter((id) => id !== playerID)
    .reduce((total, id) => total + (state.clicksPercentage[id] || 0), 0);

  useEffect(() => {
    console.log("rerender");
  });

  return (
    <div className="relative flex h-full min-h-screen flex-col items-center justify-between bg-[#ffcb39]">
      <div className="relative mt-4 w-full space-y-2 px-4">
        <Timer />
        <Board>TUG-A-TAP!</Board>

        <img
          src={
            yourClicksPercentage > opponentClicksPercentage
              ? bannerWinner
              : bannerLoser
          }
          alt="banner"
          className={cn(
            state.gameOver && "hidden",
            "absolute left-1/2 top-[4.5rem] z-10 w-full max-w-xl -translate-x-1/2",
          )}
        />
      </div>

      <Button disabled={state.gameOver as boolean} />

      <StickmanTug
        yourClicks={state.clicks[playerID] || 0}
        yourClicksPercentage={yourClicksPercentage}
        opponentClicksPercentage={opponentClicksPercentage}
      />
    </div>
  );
}

export default App;
