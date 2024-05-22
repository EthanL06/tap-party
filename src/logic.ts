import type { PlayerId, RuneClient } from "rune-games-sdk";
import { COUNTDOWN_TIME, GAME_TIME, LOBBY_TIME } from "./lib/constants";

export type Screen =
  | "lobby"
  | "tug-a-tap"
  | "tup-a-tap-intro"
  | "tap-race"
  | "react-tap-intro"
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

  // Tug-a-tap related properties
  clicks: Record<PlayerId, number>;
  clicksPercentage: Record<PlayerId, number>;

  // React tap related properties
  roundWinners: PlayerId[];
  currentRound: number;
  roundTimeStart: number;
  canReactionTap: boolean;
  timeBeforeTap: number;

  // Game mode voting related properties
  gameMode: GameMode | null;
  gameModeVotes: Record<GameMode, PlayerId[]>;
}

type GameActions = {
  castVote: (gameMode: GameMode) => void;
  click: () => void;
  newReactTapRound: () => void;
  reactTap: () => void;
  setPlayerReady: () => boolean;
  setScreen: (screen: Screen) => void;
};

declare global {
  const Rune: RuneClient<GameState, GameActions>;
}

const gameModeToScreenIntro: Record<GameMode, Screen> = {
  "tug-a-tap": "tup-a-tap-intro",
  "tap-race": "tap-race",
  "react-tap": "react-tap-intro",
};

const selectRandomGameMode = (gameModes: string[]): Screen => {
  const randomIndex = Math.floor(Math.random() * gameModes.length);
  const randomGameMode = gameModes[randomIndex];
  return gameModeToScreenIntro[randomGameMode as GameMode];
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
      : (gameModeToScreenIntro[
          tiedGameModes[0].gameMode as GameMode
        ] as Screen);
  game.gameMode = tiedGameModes[0].gameMode as GameMode;
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

const newReactTapRound = (game: GameState) => {
  game.currentRound++;
  game.roundTimeStart = Rune.gameTime();
  game.canReactionTap = false;
  game.timeBeforeTap = Math.floor(Math.random() * 5000) + 5000;

  console.log(`${game.timeBeforeTap}ms before tap`);
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

    // Tug-a-tap related properties
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

    // React tap related properties
    roundWinners: [],
    currentRound: 0,
    roundTimeStart: 0,
    canReactionTap: false,
    timeBeforeTap: 0,

    gameMode: null,
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

    newReactTapRound: (_, { game }) => {
      newReactTapRound(game);
    },

    reactTap: (_, { game, playerId }) => {
      const time = Rune.gameTime();
      // Check if the player reacted too early using Rune.gameTime()
      if (time - game.roundTimeStart < game.timeBeforeTap) {
        console.log("Player reacted too early");
        return;
      }

      const reactionTime = time - game.roundTimeStart;
      console.log(`Player ${playerId} reacted in ${reactionTime}ms`);
      // game.roundWinners.push(playerId);

      // if (game.roundWinners.length === game.playerIds.length) {
      //   game.gameOver = true;
      //   Rune.gameOver({
      //     players: game.roundWinners.reduce(
      //       (acc, playerId) => {
      //         acc[playerId] = 1;
      //         return acc;
      //       },
      //       {} as Record<PlayerId, number>,
      //     ),
      //     minimizePopUp: true,
      //   });
      // }
    },

    setPlayerReady: (_, { game, playerId }) => {
      if (game.readyPlayers.includes(playerId)) return;
      game.readyPlayers.push(playerId);

      if (game.readyPlayers.length === game.playerIds.length) {
        console.log("All players ready, starting game...");

        game.screen = game.gameMode as Screen;
        game.countdown = COUNTDOWN_TIME * 1000;
      }
    },

    setScreen: (screen, { game }) => {
      game.screen = screen;
    },
  },
  update: ({ game }) => {
    if (game.screen === "tup-a-tap-intro" || game.screen === "react-tap-intro")
      return;

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

    switch (game.screen) {
      case "lobby": {
        game.timer -= 100;
        break;
      }

      case "tug-a-tap": {
        game.timer -= 100;
        tugATapUpdate(game);
        break;
      }

      case "react-tap": {
        if (Rune.gameTime() - game.roundTimeStart > game.timeBeforeTap) {
          game.canReactionTap = true;
        }
      }
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
