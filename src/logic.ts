import type { PlayerId, RuneClient } from "rune-games-sdk";
import {
  COUNTDOWN_TIME,
  GAME_TIME,
  LOBBY_TIME,
  UPDATES_PER_SECOND,
  UPDATE_INTERVAL,
} from "./lib/constants";

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
  reactionTimes: Record<PlayerId, number>;
  reactedPlayers: PlayerId[];
  reactRoundsWins: PlayerId[];
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

// LOBBY RELATED FUNCTIONS
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
// END OF LOBBY RELATED FUNCTIONS

// TUG-A-TAP RELATED FUNCTIONS
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
// END OF TUG-A-TAP RELATED FUNCTIONS

// REACT-TAP RELATED FUNCTIONS
const newReactTapRound = (game: GameState) => {
  game.currentRound++;
  game.roundTimeStart = Rune.gameTime();
  game.canReactionTap = false;
  game.timeBeforeTap = Math.floor(Math.random() * 5000) + 5000;
  game.reactedPlayers = [];
  game.reactionTimes = game.playerIds.reduce(
    (acc, playerId) => {
      acc[playerId] = 0;
      return acc;
    },
    {} as GameState["reactionTimes"],
  );

  console.log(`${game.timeBeforeTap}ms before tap`);
};

const reactTapUpdate = (game: GameState) => {
  // If the time before tap has passed, allow players to react
  if (Rune.gameTime() - game.roundTimeStart > game.timeBeforeTap) {
    game.canReactionTap = true;
  }

  // If after 5 seconds and not all players have reacted
  if (
    game.canReactionTap &&
    Rune.gameTime() - game.roundTimeStart > game.timeBeforeTap + 5000
  ) {
    game.canReactionTap = false;
    const reactionTimes = Object.values(game.reactionTimes);

    // If no players have reacted, start a new round
    if (reactionTimes.every((reactionTime) => reactionTime === 0)) {
      console.log("No players reacted, starting new round");
      game.reactRoundsWins.push("none");
      newReactTapRound(game);
      return;
    }

    const filteredReactionTimes = reactionTimes.filter(
      (reactionTime) => reactionTime > 0,
    );

    const fastestReactionTime = Math.min(...filteredReactionTimes);
    const fastestPlayerId = Object.entries(game.reactionTimes).find(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ([_, reactionTime]) => reactionTime === fastestReactionTime,
    )![0] as PlayerId;

    game.reactRoundsWins.push(fastestPlayerId);
    console.log(`Player ${fastestPlayerId} won the round`);
    newReactTapRound(game);
  }
};
// END OF REACT-TAP RELATED FUNCTIONS

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
    reactRoundsWins: [],
    reactedPlayers: [],
    reactionTimes: allPlayerIds.reduce(
      (acc, playerId) => {
        acc[playerId] = 0;
        return acc;
      },
      {} as GameState["reactionTimes"],
    ),
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

    reactTap: (_, { game, playerId, allPlayerIds }) => {
      const time = Rune.gameTime();
      // Check if the player reacted too early using Rune.gameTime()
      if (time - game.roundTimeStart < game.timeBeforeTap) {
        console.log("Player reacted too early");
        game.reactRoundsWins.push(
          allPlayerIds[0] === playerId ? allPlayerIds[1] : allPlayerIds[0],
        );
        newReactTapRound(game);
        return;
      }

      // Make the reaction time relative to timeBeforeTap
      const reactionTime = time - game.roundTimeStart - game.timeBeforeTap;
      console.log(`Player ${playerId} reacted in ${reactionTime}ms`);

      const reactionTimes = game.reactionTimes;
      reactionTimes[playerId] = reactionTime;
      game.reactionTimes = reactionTimes;

      game.reactedPlayers.push(playerId);

      if (game.reactedPlayers.length === game.playerIds.length) {
        game.canReactionTap = false;
        // Find the player with the fastest reaction time and then append their id to reactRoundsWins
        const fastestReactionTime = Math.min(
          ...Object.values(game.reactionTimes),
        );

        const fastestPlayerId = Object.entries(game.reactionTimes).find(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ([_, reactionTime]) => reactionTime === fastestReactionTime,
        )![0] as PlayerId;

        game.reactRoundsWins.push(fastestPlayerId);
        console.log(`Player ${fastestPlayerId} won the round`);
        newReactTapRound(game);
      }
    },

    setPlayerReady: (_, { game, playerId }) => {
      if (game.readyPlayers.includes(playerId)) return;
      game.readyPlayers.push(playerId);

      if (game.readyPlayers.length === game.playerIds.length) {
        console.log("All players ready, starting game...");

        game.screen = game.gameMode as Screen;

        switch (game.gameMode) {
          case "tug-a-tap": {
            game.timer = GAME_TIME * 1000;
            game.countdown = COUNTDOWN_TIME * 1000;
            break;
          }
          case "react-tap": {
            newReactTapRound(game);
            break;
          }
        }
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
      game.countdown -= UPDATE_INTERVAL;
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

    // Regular game updates
    switch (game.screen) {
      case "lobby": {
        game.timer -= UPDATE_INTERVAL;
        break;
      }

      case "tug-a-tap": {
        game.timer -= UPDATE_INTERVAL;
        tugATapUpdate(game);
        break;
      }

      case "react-tap": {
        reactTapUpdate(game);
      }
    }
  },
  updatesPerSecond: UPDATES_PER_SECOND,
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
