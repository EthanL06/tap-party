import type { PlayerId, RuneClient } from "rune-games-sdk";
import { COUNTDOWN_TIME, GAME_TIME, LOBBY_TIME } from "./lib/constants";

export type Screen =
  | "lobby"
  | "tug-a-tap"
  | "tup-a-tap-intro"
  | "tap-race"
  | "react-tap";
export type GameMode = "tug-a-tap" | "tap-race" | "react-tap";

export interface GameState {
  // Game state properties
  screen: Screen;
  timer: number;
  countdown: number;
  gameStart: number;
  gameOver: boolean;

  // Player related properties
  playerIds: PlayerId[];
  readyPlayers: PlayerId[];
  clicks: Record<PlayerId, number>;
  clicksPercentage: Record<PlayerId, number>;

  // Game mode voting related properties
  gameModeVotes: Record<GameMode, PlayerId[]>;
}

type GameActions = {
  castVote: (gameMode: GameMode) => void;
  click: () => void;
  setPlayerReady: () => boolean;
  setScreen: (screen: Screen) => void;
};

declare global {
  const Rune: RuneClient<GameState, GameActions>;
}

const gameModeToScreen: Record<GameMode, Screen> = {
  "tug-a-tap": "tup-a-tap-intro",
  "tap-race": "tap-race",
  "react-tap": "react-tap",
};

const selectRandomGameMode = (gameModes: string[]): Screen => {
  const randomIndex = Math.floor(Math.random() * gameModes.length);
  const randomGameMode = gameModes[randomIndex];
  return gameModeToScreen[randomGameMode as GameMode];
};

const determineGameMode = (game: GameState) => {
  const gameModeVotes = Object.entries(game.gameModeVotes).map(
    ([gameMode, votes]) => ({
      gameMode,
      voteCount: votes.length,
    }),
  );

  gameModeVotes.sort((a, b) => b.voteCount - a.voteCount);

  const maxVotes = gameModeVotes[0].voteCount;
  const tiedGameModes = gameModeVotes.filter(
    ({ voteCount }) => voteCount === maxVotes,
  );

  game.timer = GAME_TIME * 1000;
  game.screen =
    tiedGameModes.length > 1
      ? selectRandomGameMode(tiedGameModes.map(({ gameMode }) => gameMode))
      : (gameModeToScreen[tiedGameModes[0].gameMode as GameMode] as Screen);
};

const tugATapUpdate = (game: GameState) => {
  const clickDifference =
    game.clicks[game.playerIds[0]] - game.clicks[game.playerIds[1]];
  const scalingFactor = 5; // Adjust this value as needed
  game.clicksPercentage[game.playerIds[0]] = Math.max(
    0,
    Math.min(50 + clickDifference * scalingFactor, 100),
  );
  game.clicksPercentage[game.playerIds[1]] = Math.max(
    0,
    100 - game.clicksPercentage[game.playerIds[0]],
  );
};

Rune.initLogic({
  minPlayers: 2,
  maxPlayers: 4,
  setup: (allPlayerIds) => ({
    screen: "lobby",
    timer: LOBBY_TIME * 1000,
    countdown: 0,
    gameStart: Rune.gameTime(),
    gameOver: false,

    playerIds: allPlayerIds,
    readyPlayers: [],
    clicks: allPlayerIds.reduce(
      (acc, playerId) => {
        acc[playerId] = 0;
        return acc;
      },
      {} as GameState["clicks"],
    ),
    clicksPercentage: allPlayerIds.reduce(
      (acc, playerId) => {
        acc[playerId] = 50;
        return acc;
      },
      {} as GameState["clicksPercentage"],
    ),

    gameModeVotes: {
      "tug-a-tap": [],
      "tap-race": [],
      "react-tap": [],
    },
  }),
  actions: {
    castVote: (gameMode, { playerId, game }) => {
      const gameModes = ["tug-a-tap", "tap-race", "react-tap"] as GameMode[];

      gameModes.forEach((mode) => {
        const previousVoteIndex = game.gameModeVotes[mode].indexOf(playerId);
        if (previousVoteIndex !== -1) {
          game.gameModeVotes[mode].splice(previousVoteIndex, 1);
        }
      });

      game.gameModeVotes[gameMode].push(playerId);
    },
    click: (_, { game, playerId }) => {
      game.clicks[playerId]++;
    },

    setPlayerReady: (_, { game, playerId }) => {
      if (game.readyPlayers.includes(playerId)) return;
      game.readyPlayers.push(playerId);

      if (game.readyPlayers.length === game.playerIds.length) {
        console.log("All players ready, starting game...");
        game.screen = "tug-a-tap";
        game.countdown = COUNTDOWN_TIME * 1000;
      }
    },

    setScreen: (screen, { game }) => {
      game.screen = screen;
    },
  },
  update: ({ game }) => {
    if (game.screen === "tup-a-tap-intro") return;

    if (game.countdown > 0) {
      game.countdown -= 100;
      return;
    }

    // IF the timer is up
    if (game.timer <= 0) {
      switch (game.screen) {
        case "lobby": {
          determineGameMode(game);
          break;
        }
        case "tug-a-tap":
          game.gameOver = true;
          Rune.gameOver({
            players: {
              [game.playerIds[0]]: game.clicks[game.playerIds[0]],
              [game.playerIds[1]]: game.clicks[game.playerIds[1]],
            },
            minimizePopUp: true,
          });
          break;
      }
    }

    game.timer -= 100;
    if (game.screen === "tug-a-tap") {
      tugATapUpdate(game);
    }
  },
  updatesPerSecond: 10,
  events: {
    playerJoined(playerId, { game }) {
      game.playerIds.push(playerId);
      game.clicks[playerId] = 0;
      game.clicksPercentage[playerId] = 0;
    },
    playerLeft(playerId, { game }) {
      const playerIndex = game.playerIds.indexOf(playerId);
      game.playerIds.splice(playerIndex, 1);
      delete game.clicks[playerId];
      delete game.clicksPercentage[playerId];

      // From the game mode votes, remove the player's vote
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(game.gameModeVotes).forEach(([_, votes]) => {
        const playerVoteIndex = votes.indexOf(playerId);
        if (playerVoteIndex !== -1) {
          votes.splice(playerVoteIndex, 1);
        }
      });
    },
  },
});
