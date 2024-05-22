import Board from "../components/Board";
import tapImage from "../assets/tap.svg";
import stickmanImage from "../assets/stickman.svg";
import StylizedButton from "../components/StylizedButton";
import { useGameStore } from "../store/useGameStore";

const ReactTapIntro = () => {
  const readyPlayers = useGameStore((state) => state.game.readyPlayers);
  const playerID = useGameStore((state) => state.playerID);

  return (
    <div className="relative flex h-full min-h-screen flex-col">
      <div className="drop-in relative mt-4 w-full space-y-2 px-4">
        <Board>REACT TAP!</Board>
      </div>

      <div className="mt-4 px-4">
        <div className="mb-3 inline-block border-b-[3px] border-black text-2xl font-black">
          HOW TO PLAY:
        </div>

        <ul className="list-['-_'] px-4 text-base font-black">
          <li>
            Tap the button when{" "}
            <img className="inline-block size-6" src={tapImage} /> appears!
          </li>
          <li>
            You <span className="underline">lose</span> the round if you tap{" "}
            <button className="stylized-shadow inline-block rounded-full transition-all active:translate-y-1 active:scale-90 active:shadow-none">
              <img
                className="inline-block size-8 rounded-full border-2 border-black p-1"
                src={tapImage}
              />
            </button>{" "}
            too early or don&apos;t tap at all.
          </li>
          <li>The player with the fastest reaction time wins the round!</li>

          <li>There are a total of 9 rounds.</li>

          <li>
            A won round is{" "}
            <div className="outline-3 ml-0.5 inline-block size-3 rounded-full bg-emerald-500 outline outline-black"></div>{" "}
            .
          </li>

          <li>
            A lost round is{" "}
            <div className="outline-3 ml-0.5 inline-block size-3 rounded-full bg-red-500 outline outline-black"></div>{" "}
            .
          </li>

          <li>
            5 seconds after{" "}
            <img className="inline-block size-6" src={tapImage} /> appears, the
            round automatically ends.
          </li>
        </ul>
      </div>

      <div className="flex w-full grow items-center justify-center">
        <div>
          <div className="mb-2 flex items-center gap-x-1">
            {readyPlayers.map((playerId) => (
              <img
                key={playerId}
                src={Rune.getPlayerInfo(playerId).avatarUrl}
                alt="avatar"
                className="stylized-shadow size-8 rounded-full border-[3px] border-black"
              />
            ))}

            <div className="size-8" />
          </div>
          <div className="drop-in-from-bottom  opacity-0">
            <StylizedButton
              className="px-8"
              onClick={() => {
                Rune.actions.setPlayerReady();
              }}
              disabled={readyPlayers.includes(playerID)}
            >
              READY
            </StylizedButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReactTapIntro;
