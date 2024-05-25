import Board from "../components/Board";
import tapImage from "../assets/tap.svg";
import stickmanImage from "../assets/stickman.svg";
import StylizedButton from "../components/StylizedButton";
import { useGameStore } from "../store/useGameStore";
import useSound from "use-sound";
import selectSound from "../assets/select.wav";
import { cn } from "../lib/utils";

const TugATapIntro = () => {
  const [playClick] = useSound(selectSound);
  const readyPlayers = useGameStore((state) => state.game.readyPlayers);
  const playerID = useGameStore((state) => state.playerID);

  return (
    <div className="relative flex h-full min-h-screen flex-col">
      <div className="drop-in relative mt-4 w-full space-y-2 px-4">
        <Board>TUG-A-TAP!</Board>
      </div>

      <div className="fade-in mt-4 px-4">
        <div className="mb-3 inline-block border-b-[3px] border-black text-2xl font-black">
          HOW TO PLAY:
        </div>

        <ul className="list-['-_'] px-4 text-base font-black">
          <li>
            Tap the{" "}
            <button
              onClick={() => {
                playClick();
              }}
              className="stylized-shadow inline-block rounded-full transition-all active:translate-y-1 active:scale-90 active:shadow-none"
            >
              <img
                className="inline-block size-8 rounded-full border-2 border-black p-1"
                src={tapImage}
              />
            </button>{" "}
            as fast as you can!
          </li>
          <li>
            Each tap moves
            <img className="inline-block size-8" src={stickmanImage} />
            to the right.
          </li>
          <li>
            Each opponent tap moves
            <img className="inline-block size-8" src={stickmanImage} />
            to the left.
          </li>
          <li>
            Keep
            <img className="inline-block size-8" src={stickmanImage} />
            to the right of the center line.
          </li>
          <li>
            If
            <img className="inline-block size-8" src={stickmanImage} />
            is not moving, tap faster!
          </li>
          <li>
            You have{" "}
            <span className="underline underline-offset-2">30 seconds</span> to
            tap.
          </li>
          <li>The player with the most taps wins!</li>
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
              className={cn(
                "px-8",
                readyPlayers.includes(playerID) && "opacity-50",
              )}
              onClick={() => {
                playClick();
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

export default TugATapIntro;
