import Banner from "../components/Banner";
import Board from "../components/Board";
import Button from "../components/Button";
import { useGameStore } from "../store/useGameStore";

const ReactTap = () => {
  const canReactionTap = useGameStore((state) => state.game.canReactionTap);

  return (
    <div className="relative flex h-full min-h-screen flex-col items-center justify-between">
      <div className="relative mt-4 w-full space-y-2 px-4">
        <Board>REACT TAP!</Board>

        <Banner />
      </div>

      <div className="mx-auto mt-6 flex w-full max-w-64 justify-around">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className="size-4 rounded-full outline outline-4 outline-black"
          ></div>
        ))}
      </div>

      <div className="flex grow items-center justify-center">
        <Button
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
