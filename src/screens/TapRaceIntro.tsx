import Board from "../components/Board";
import stickmanImage from "../assets/stickman.svg";
import StylizedButton from "../components/StylizedButton";
import { useGameStore } from "../store/useGameStore";
import clickSound from "../assets/select.wav";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import useSound from "use-sound";
import { cn } from "../lib/utils";
const TapRaceIntro = () => {
  const [play] = useSound(clickSound);
  const readyPlayers = useGameStore((state) => state.game.readyPlayers);
  const playerID = useGameStore((state) => state.playerID);

  return (
    <div className="relative flex h-full min-h-screen flex-col">
      <div className="drop-in relative mt-4 w-full space-y-2 px-4">
        <Board>TAP RACE!</Board>
      </div>

      <div className="fade-in mt-4 px-4">
        <div className="mb-3 inline-block border-b-[3px] border-black text-2xl font-black">
          HOW TO PLAY:
        </div>

        <ul className="list-['-_'] px-4 text-base font-black">
          <li>Race to get to the end of the track!</li>
          <li>
            Alternate tapping between{" "}
            <button
              onClick={() => {
                play();
              }}
              className="stylized-shadow inline-block rounded border-[3px] border-black px-1.5 transition-all active:translate-y-1 active:scale-90 active:shadow-none"
            >
              <div className={"pt-0.5 text-center text-[1.2rem] font-black"}>
                L
              </div>
            </button>{" "}
            and{" "}
            <button
              onClick={() => {
                play();
              }}
              className="stylized-shadow inline-block rounded border-[3px] border-black px-1.5 transition-all active:translate-y-1 active:scale-90 active:shadow-none"
            >
              <div className={"pt-0.5 text-center text-[1.2rem] font-black"}>
                R
              </div>
            </button>{" "}
            to move your
            <img className="inline-block size-8" src={stickmanImage} />
            forward.
          </li>
          <li>
            Your
            <img className="inline-block size-8" src={stickmanImage} />
            will always be on the top track.
          </li>

          <li>
            The race lasts for{" "}
            <span className="underline underline-offset-2">60 seconds</span>.{" "}
          </li>
          <li>The first player to reach the end of the track wins!</li>
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
                play();
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

export default TapRaceIntro;
