import Banner from "../components/Banner";
import Board from "../components/Board";
import Button from "../components/Button";
import { cn } from "../lib/utils";
import { useGameStore } from "../store/useGameStore";

const ReactTap = () => {
  const canReactionTap = useGameStore((state) => state.game.canReactionTap);
  const reactedPlayers = useGameStore((state) => state.game.reactedPlayers);
  const roundWinners = useGameStore((state) => state.game.reactRoundsWins);
  const playerID = useGameStore((state) => state.playerID);

  return (
    <div className="relative flex h-full min-h-screen flex-col items-center justify-between">
      <div className="relative mt-4 w-full space-y-2 px-4">
        <Board>REACT TAP!</Board>

        <Banner />
      </div>

      <div className="mx-auto mt-6 flex w-full max-w-64 justify-around">
        {roundWinners.map((winnerID, i) => (
          <div
            key={i}
            className={cn(
              "outline-3 stylized-shadow size-4 rounded-full outline outline-black",
              winnerID === playerID ? "bg-emerald-500" : "bg-red-500",
            )}
          ></div>
        ))}

        {[...Array(9 - roundWinners.length)].map((_, i) => (
          <div
            key={i}
            className="outline-3 size-4 rounded-full outline outline-black"
          ></div>
        ))}
      </div>

      <div className="flex grow items-center justify-center">
        <Button
          disabled={reactedPlayers.includes(playerID)}
          showIcon={canReactionTap}
          onClick={() => {
            Rune.actions.reactTap();
          }}
        />
      </div>
    </div>
  );
};

export default ReactTap;
