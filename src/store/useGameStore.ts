import { create } from "zustand";
import { GameState, Persisted } from "../logic";
import { subscribeWithSelector } from "zustand/middleware";
import { GameStateWithPersisted } from "rune-games-sdk";

interface GameStore {
  game: GameStateWithPersisted<GameState, Persisted>;
  playerID: string;
}

export const useGameStore = create<GameStore>()(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscribeWithSelector((set, get) => ({
    game: {
      screen: "lobby",
      timer: 0,
      countdown: 0,
      gameStart: false,
      gameOver: false,
      winner: null,
      persisted: {},

      playerIds: [],
      readyPlayers: [],

      clicks: {},

      playerDistances: {},

      reactRoundsWins: [],
      reactedPlayers: [],
      reactionTimes: {},
      currentRound: 0,
      roundTimeStart: 0,
      canReactionTap: false,
      timeBeforeTap: 0,
      timeBetweenRounds: 0,
      hasRoundEnded: false,

      gameMode: null,
      gameModeVotes: {
        "tug-a-tap": [],
        "tap-race": [],
        "react-tap": [],
      },
    },
    playerID: "",
  })),
);
