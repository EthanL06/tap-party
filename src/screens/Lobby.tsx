import Board from "../components/Board";
import StylizedButton from "../components/StylizedButton";
import Timer from "../components/Timer";
import { useGameStore } from "../store/useGameStore";
import useSound from "use-sound";
import lobbyMusic from "../assets/sfx/Lobby_music.mp3";
import { useEffect } from "react";
import { useAudioStore } from "../store/useAudioStore";
import Ready from "../components/Ready";
import { cn } from "../lib/utils";

const Lobby = () => {
  const [playLobbyMusic, { sound, stop: stopLobbyMusic }] = useSound(
    lobbyMusic,
    {
      volume: 0.5,
      loop: true,
    },
  );

  const play = useAudioStore((state) => state.playSelect);

  const gameModeVotes = useGameStore((state) => state.game.gameModeVotes);
  const readyPlayers = useGameStore((state) => state.game.readyPlayers.length);
  const totalPlayers = useGameStore((state) => state.game.playerIds.length);

  useEffect(() => {
    useAudioStore.setState({
      stopLobbyMusic,
    });
  }, [stopLobbyMusic]);

  useEffect(() => {
    if (readyPlayers === totalPlayers && totalPlayers > 0) {
      playLobbyMusic();
      if (sound) {
        sound.fade(0, 0.5, 3000);
      }
    }
  }, [playLobbyMusic, readyPlayers, totalPlayers, sound]);

  return (
    <div className="relative flex h-full min-h-screen flex-col items-center justify-around">
      {readyPlayers === totalPlayers && (
        <>
          <div className="relative mt-4 w-full space-y-2 px-4">
            <Timer />
            <div className="drop-in z-50">
              <Board>
                <div className="z-50 flex flex-col">
                  <span className="text-[3.4375rem]">TAP PARTY</span>
                  <span className="text-lg font-bold">
                    Vote for a game mode below.
                  </span>
                </div>
              </Board>
            </div>
          </div>

          <div className="flex grow flex-col justify-around">
            <div className="w-full">
              <div className="drop-in-2 animate-delay-600 relative opacity-0">
                <StylizedButton
                  onClick={() => {
                    play();
                    Rune.actions.incrementTap();
                    Rune.actions.castVote("tug-a-tap");
                  }}
                  className={cn("relative z-10")}
                >
                  <div className="mb-1">TUG-A-TAP</div>

                  <div className="absolute bottom-1 left-4 flex gap-x-1">
                    {gameModeVotes["tug-a-tap"].map((playerId) => {
                      const playerImg = Rune.getPlayerInfo(playerId).avatarUrl;

                      return (
                        <div
                          key={playerId}
                          className="z-50 overflow-clip rounded-full"
                        >
                          <img
                            src={playerImg}
                            alt="avatar"
                            className="size-6 rounded-full border-[3px] border-black"
                          />
                        </div>
                      );
                    })}
                  </div>
                </StylizedButton>
              </div>
            </div>

            <div className="w-full">
              <div className="drop-in-2 animate-delay-1100 opacity-0">
                <StylizedButton
                  onClick={() => {
                    play();
                    Rune.actions.castVote("tap-race");
                    Rune.actions.incrementTap();
                  }}
                  className="relative w-full"
                >
                  <div className="mb-1">TAP RACE</div>
                  <div className="absolute bottom-1 left-4 flex gap-x-1">
                    {gameModeVotes["tap-race"].map((playerId) => {
                      const playerImg = Rune.getPlayerInfo(playerId).avatarUrl;

                      return (
                        <div
                          key={playerId}
                          className="z-50 overflow-clip rounded-full"
                        >
                          <img
                            src={playerImg}
                            alt="avatar"
                            className="size-6 rounded-full border-[3px] border-black"
                          />
                        </div>
                      );
                    })}
                  </div>
                </StylizedButton>
              </div>
            </div>

            <div className="w-full">
              <div className="drop-in-2 animate-delay-1600 opacity-0">
                <StylizedButton
                  onClick={() => {
                    play();
                    Rune.actions.castVote("react-tap");
                    Rune.actions.incrementTap();
                  }}
                  className="relative w-full"
                >
                  <div className="mb-1">REACT TAP</div>
                  <div className="absolute bottom-1 left-4 flex gap-x-1">
                    {gameModeVotes["react-tap"].map((playerId) => {
                      const playerImg = Rune.getPlayerInfo(playerId).avatarUrl;

                      return (
                        <div
                          key={playerId}
                          className="z-50 overflow-clip rounded-full"
                        >
                          <img
                            src={playerImg}
                            alt="avatar"
                            className="size-6 rounded-full border-[3px] border-black"
                          />
                        </div>
                      );
                    })}
                  </div>
                </StylizedButton>
              </div>
            </div>
          </div>
        </>
      )}

      <Ready />
    </div>
  );
};

export default Lobby;
