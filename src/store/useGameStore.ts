import { create } from "zustand";
import { GameState } from "../logic";
import { subscribeWithSelector } from "zustand/middleware";

interface GameStore {
  game: GameState;
  playerID: string;
}

export const useGameStore = create<GameStore>()(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscribeWithSelector((set, get) => ({
    game: {
      screen: "lobby",
      timer: 0,
      countdown: 0,
      gameStart: 0,
      gameOver: false,

      playerIds: [],
      readyPlayers: [],
      clicks: {},
      clicksPercentage: {},

      gameModeVotes: {
        "tug-a-tap": [],
        "tap-race": [],
        "react-tap": [],
      },
    },
    playerID: "",
  })),
);