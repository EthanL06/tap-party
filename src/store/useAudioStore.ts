import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface AudioStore {
  stopLobbyMusic: () => void;
}

export const useAudioStore = create<AudioStore>()(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscribeWithSelector((set, get) => ({
    stopLobbyMusic: () => {},
  })),
);
