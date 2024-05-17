import { useContext } from "react";
import { GameContext } from "./context/GameContext.tsx";
import Button from "./components/Button.tsx";

function App() {
  const { state, playerID } = useContext(GameContext);

  const yourClicks = state.clicks[playerID] || 0;
  const opponentClicks = state.playerIds
    .filter((id) => id !== playerID)
    .reduce((total, id) => total + (state.clicks[id] || 0), 0);

  const totalClicks = yourClicks + opponentClicks;
  const yourClicksPercentage = totalClicks
    ? (yourClicks / totalClicks) * 100
    : 0;
  const opponentClicksPercentage = totalClicks
    ? (opponentClicks / totalClicks) * 100
    : 0;

  if (!state) {
    console.log("Loading game state...");
    // Rune only shows your game after an onChange() so no need for loading screen
    return;
  }

  return (
    <div className="flex h-full min-h-screen flex-col items-center justify-center">
      <div
        className="w-72 rounded-full border-2 border-black p-1"
        style={{
          background: `linear-gradient(to right, red ${yourClicksPercentage}%, blue ${yourClicksPercentage}%, blue ${yourClicksPercentage + opponentClicksPercentage}%)`,
        }}
      ></div>
      <div>
        Opponent Clicks:{" "}
        <strong>
          {state.playerIds
            .filter((id) => id !== playerID)
            .reduce((total, id) => total + (state.clicks[id] || 0), 0)}
        </strong>
      </div>
      <div>
        Your Clicks: <strong>{yourClicks}</strong>
      </div>
      <Button />
    </div>
  );
}

export default App;
