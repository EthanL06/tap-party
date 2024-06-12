import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { PlayFunction } from "../../generated-types/types";

interface AudioStore {
  playSelect: PlayFunction;
  stopSelect: () => void;
  playClick: PlayFunction;
  stopClick: () => void;
  playWin: PlayFunction;
  stopWin: () => void;
  playLose: PlayFunction;
  stopLose: () => void;
  playThree: PlayFunction;
  stopThree: () => void;
  playTwo: PlayFunction;
  stopTwo: () => void;
  playOne: PlayFunction;
  stopOne: () => void;
  playGo: PlayFunction;
  stopGo: () => void;

  playRace: PlayFunction;
  raceSound: Howl | null;
  stopRaceSound: () => void;

  playTugATap: PlayFunction;
  tugATapSound: Howl | null;
  stopTugATapSound: () => void;

  playReactTap: PlayFunction;
  reactTapSound: Howl | null;
  stopReactTapSound: () => void;

  stopLobbyMusic: () => void;

  stopAllMusic: () => void;
}

export const useAudioStore = create<AudioStore>()(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscribeWithSelector((set, get) => ({
    playSelect: () => {},
    stopSelect: () => {},
    playClick: () => {},
    stopClick: () => {},
    playWin: () => {},
    stopWin: () => {},
    playLose: () => {},
    stopLose: () => {},
    playThree: () => {},
    stopThree: () => {},
    playTwo: () => {},
    stopTwo: () => {},
    playOne: () => {},
    stopOne: () => {},
    playGo: () => {},
    stopGo: () => {},

    playRace: () => {},
    raceSound: null,
    stopRaceSound: () => {},

    playTugATap: () => {},
    tugATapSound: null,
    stopTugATapSound: () => {},

    playReactTap: () => {},
    reactTapSound: null,
    stopReactTapSound: () => {},

    stopLobbyMusic: () => {},

    stopAllMusic: () => {
      get().stopSelect();
      get().stopClick();
      get().stopThree();
      get().stopTwo();
      get().stopOne();
      get().stopGo();
      get().stopRaceSound();
      get().stopTugATapSound();
      get().stopReactTapSound();
      get().stopLobbyMusic();
    },
  })),
);
