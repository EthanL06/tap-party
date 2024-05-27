import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { PlayFunction } from "../../generated-types/types";

interface AudioStore {
  playSelect: PlayFunction;
  playClick: PlayFunction;
  playWin: PlayFunction;
  playLose: PlayFunction;
  playThree: PlayFunction;
  playTwo: PlayFunction;
  playOne: PlayFunction;
  playGo: PlayFunction;

  playRace: PlayFunction;
  raceSound: Howl | null;
  stopRaceSound: () => void;

  playTugATap: PlayFunction;
  tugATapSound: Howl | null;

  playReactTap: PlayFunction;
  reactTapSound: Howl | null;
  stopReactTapSound: () => void;

  stopLobbyMusic: () => void;
}

export const useAudioStore = create<AudioStore>()(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscribeWithSelector((set, get) => ({
    playSelect: () => {},
    playClick: () => {},
    playWin: () => {},
    playLose: () => {},
    playThree: () => {},
    playTwo: () => {},
    playOne: () => {},
    playGo: () => {},

    playRace: () => {},
    raceSound: null,
    stopRaceSound: () => {},

    playTugATap: () => {},
    tugATapSound: null,

    playReactTap: () => {},
    reactTapSound: null,
    stopReactTapSound: () => {},

    stopLobbyMusic: () => {},
  })),
);
