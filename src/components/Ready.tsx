import { useState, useEffect } from "react";
import Button from "./Button";
import { useGameStore } from "../store/useGameStore";
import { cn } from "../lib/utils";
import StylizedButton from "./StylizedButton";
import useSound from "use-sound";
import selectSound from "../assets/select.wav";
import clickSound from "../assets/click.mp3";
import winSound from "../assets/sfx/game_win.mp3";
import loseSound from "../assets/sfx/game_lose.mp3";
import three from "../assets/sfx/3.wav";
import two from "../assets/sfx/2.wav";
import one from "../assets/sfx/1.wav";
import go from "../assets/sfx/go.wav";
import race from "../assets/sfx/race_music.mp3";
import tugATap from "../assets/sfx/tow_song.mp3";
import reactTap from "../assets/sfx/heartbeat.wav";

import { useAudioStore } from "../store/useAudioStore";

const Ready = () => {
  const readyPlayers = useGameStore((state) => state.game.readyPlayers);
  const totalPlayers = useGameStore((state) => state.game.playerIds.length);
  const playerID = useGameStore((state) => state.playerID);
  const persistedData = useGameStore((state) => state.game.persisted)[playerID];

  const [fade, setFade] = useState(false);
  const [render, setRender] = useState(true);
  const [showStats, setShowStats] = useState(false);

  const [play, { stop: stopSelect }] = useSound(selectSound);
  const [playClick, { stop: stopClick }] = useSound(clickSound);
  const [playWin, { stop: stopWin }] = useSound(winSound);
  const [playLose, { stop: stopLose }] = useSound(loseSound);

  const [playThree, { stop: stopThree }] = useSound(three);
  const [playTwo, { stop: stopTwo }] = useSound(two);
  const [playOne, { stop: stopOne }] = useSound(one);
  const [playGo, { stop: stopGo }] = useSound(go);

  const [playRace, { sound: raceSound, stop: stopRaceSound }] = useSound(race, {
    volume: 0.5,
    loop: true,
  });

  const [playTugATap, { sound: tugATapSound, stop: stopTugATapSound }] =
    useSound(tugATap, {
      volume: 0.5,
    });

  const [playReactTap, { sound: reactTapSound, stop: stopReactTapSound }] =
    useSound(reactTap, {
      loop: true,
    });

  useEffect(() => {
    useAudioStore.setState({
      playSelect: play,
      playClick: playClick,
      playWin: playWin,
      playLose: playLose,
      playThree: playThree,
      playTwo: playTwo,
      playOne: playOne,
      playGo: playGo,
      playRace: playRace,
      stopSelect: stopSelect,
      stopClick: stopClick,
      stopWin: stopWin,
      stopLose: stopLose,
      stopThree: stopThree,
      stopTwo: stopTwo,
      stopOne: stopOne,
      stopGo: stopGo,
      raceSound: raceSound,
      stopRaceSound: stopRaceSound,
      playTugATap: playTugATap,
      stopTugATapSound: stopTugATapSound,
      tugATapSound: tugATapSound,
      playReactTap: playReactTap,
      reactTapSound: reactTapSound,
      stopReactTapSound: stopReactTapSound,
    });
  }, [
    play,
    playClick,
    playGo,
    playLose,
    playOne,
    playRace,
    playReactTap,
    playThree,
    playTugATap,
    playTwo,
    playWin,
    raceSound,
    reactTapSound,
    stopClick,
    stopGo,
    stopLose,
    stopOne,
    stopRaceSound,
    stopReactTapSound,
    stopSelect,
    stopThree,
    stopTugATapSound,
    stopTwo,
    stopWin,
    tugATapSound,
  ]);

  useEffect(() => {
    if (readyPlayers.length === totalPlayers && totalPlayers >= 1) {
      setFade(true);
      setTimeout(() => {
        setRender(false);
      }, 650);
    }
  }, [readyPlayers, totalPlayers]);

  useEffect(() => {
    console.log(readyPlayers, totalPlayers);
    if (!render && readyPlayers.length < totalPlayers) {
      setRender(true);
      setFade(false);
    }
  }, [readyPlayers, render, totalPlayers]);

  if (!render) {
    return null;
  }

  return (
    <div
      className={`absolute z-[100] flex h-full w-full flex-col items-center justify-center bg-[#ffcb39]/85 ${fade ? "fade-away-no-delay" : ""}`}
    >
      <div className="mb-3 text-4xl font-bold">
        {playerID != undefined ? "Click to Ready" : "Spectating..."}
      </div>

      <Button
        className={cn(
          readyPlayers.includes(playerID) &&
            "scale-95 opacity-50 transition-all",
        )}
        disabled={readyPlayers.includes(playerID)}
        onClick={() => {
          Rune.actions.setPlayerReady();
          Rune.actions.incrementTap();
        }}
      />

      <div
        className="mt-2 
      flex w-full items-center justify-center gap-x-1"
      >
        {readyPlayers.map((playerId) => (
          <img
            key={playerId}
            src={Rune.getPlayerInfo(playerId).avatarUrl}
            alt="avatar"
            className="stylized-shadow size-8 rounded-full border-[3px] border-black"
          />
        ))}

        {Array.from({ length: totalPlayers - readyPlayers.length }).map(
          (_, index) => (
            <div key={index} className="size-8 " />
          ),
        )}
      </div>

      {totalPlayers === 1 ? (
        <>
          <div className="font-bold">You&apos;re all alone...</div>
          <StylizedButton
            className="w-full max-w-xs scale-75 active:scale-[0.70]"
            onClick={() => {
              play();
              Rune.actions.incrementTap();
              Rune.showInvitePlayers();
            }}
          >
            Invite Friends
          </StylizedButton>
        </>
      ) : (
        <div className="mt-1 font-bold">
          {readyPlayers.length}/{totalPlayers} players ready
        </div>
      )}

      <StylizedButton
        className="w-full max-w-xs scale-75 active:scale-[0.70]"
        onClick={() => {
          if (playerID === undefined) return;
          Rune.actions.incrementTap();
          play();
          setShowStats(!showStats);
        }}
      >
        {showStats ? "Hide Stats" : "View Stats"}
      </StylizedButton>

      {showStats && (
        <div className="mx-auto mt-2 flex w-full max-w-xs justify-around">
          <div className="flex flex-col items-center font-bold">
            <div>Taps</div>
            <div className="text-sm">{persistedData.taps.toLocaleString()}</div>
          </div>

          <div className="flex flex-col items-center font-bold">
            <div>Wins</div>
            <div className="text-sm">{persistedData.wins.toLocaleString()}</div>
          </div>

          <div className="flex flex-col items-center font-bold">
            <div>Games</div>
            <div className="text-sm">
              {persistedData.totalGames.toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Ready;
