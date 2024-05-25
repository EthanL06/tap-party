import type { PlayerId, RuneClient } from "rune-games-sdk";
import {
  COUNTDOWN_TIME,
  TUG_A_TAP_GAME_TIME,
  LOBBY_TIME,
  TIME_BETWEEN_ROUNDS,
  TOTAL_REACT_TAP_ROUNDS,
  UPDATE_INTERVAL,
  TAP_RACE_GAME_TIME,
} from "./lib/constants";

export type Screen =
  | "lobby"
  | "tup-a-tap-intro"
  | "tug-a-tap"
  | "tap-race-intro"
  | "tap-race"
  | "react-tap-intro"
  | "react-tap";
export type GameMode = "tug-a-tap" | "tap-race" | "react-tap";

export interface GameState {
  // Game state properties
  screen: Screen;
  timer: number;
  countdown: number;
  gameStart: boolean;
  gameOver: boolean;
  winner: PlayerId | null;

  // Player related properties
  playerIds: PlayerId[];
  readyPlayers: PlayerId[];

  // Tug-a-tap related properties
  clicks: Record<PlayerId, number>;
  clicksPercentage: Record<PlayerId, number>;

  // Tap race related properties
  playerDistances: Record<PlayerId, number>;

  // React tap related properties
  reactionTimes: Record<PlayerId, number>;
  reactedPlayers: PlayerId[];
  reactRoundsWins: PlayerId[];
  currentRound: number;
  roundTimeStart: number;
  canReactionTap: boolean;
  timeBeforeTap: number;
  timeBetweenRounds: number;
  hasRoundEnded: boolean;

  // Game mode voting related properties
  gameMode: GameMode | null;
  gameModeVotes: Record<GameMode, PlayerId[]>;
}

type GameActions = {
  castVote: (gameMode: GameMode) => void;
  click: () => void;
  raceTap: () => void;
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
  "tap-race": "tap-race-intro",
  "react-tap": "react-tap-intro",
};

const selectRandomGameMode = (
  gameModes: string[],
): {
  gameMode: GameMode;
  screen: Screen;
} => {
  const randomIndex = Math.floor(Math.random() * gameModes.length);
  const randomGameMode = gameModes[randomIndex] as GameMode;

  return {
    gameMode: randomGameMode,
    screen: gameModeToScreenIntro[randomGameMode as GameMode],
  };
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

  if (tiedGameModes.length === 1) {
    game.gameMode = tiedGameModes[0].gameMode as GameMode;
    game.timer =
      tiedGameModes[0].gameMode === "tug-a-tap"
        ? TUG_A_TAP_GAME_TIME
        : TAP_RACE_GAME_TIME;
    game.screen = gameModeToScreenIntro[tiedGameModes[0].gameMode as GameMode];
    return;
  }

  const { gameMode: randomGameMode, screen } = selectRandomGameMode(
    tiedGameModes.map(({ gameMode }) => gameMode),
  );

  game.timer =
    randomGameMode === "tug-a-tap" ? TUG_A_TAP_GAME_TIME : TAP_RACE_GAME_TIME;
  game.screen = screen;
  game.gameMode = randomGameMode;
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
  if (game.gameOver) return;

  game.currentRound++;

  if (game.currentRound > TOTAL_REACT_TAP_ROUNDS) {
    const allPlayerIds = game.playerIds;
    const playerWins = allPlayerIds.reduce(
      (acc, playerId) => {
        acc[playerId] = game.reactRoundsWins.filter(
          (winnerId) => winnerId === playerId,
        ).length;
        return acc;
      },
      {} as Record<PlayerId, number>,
    );

    Rune.gameOver({
      players: playerWins,
      minimizePopUp: true,
    });

    game.winner = Object.entries(playerWins).reduce(
      (acc, [playerId, wins]) => {
        if (wins > acc.wins) {
          acc.playerId = playerId;
          acc.wins = wins;
        }
        return acc;
      },
      { playerId: "", wins: 0 },
    ).playerId;
    game.gameOver = true;
    game.hasRoundEnded = false;
    return;
  }
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

  console.log(`New round start! ${game.timeBeforeTap}ms before tap`);
};

const reactTapUpdate = (game: GameState) => {
  // If the time before tap has passed, allow players to react
  if (
    !game.canReactionTap &&
    Rune.gameTime() - game.roundTimeStart > game.timeBeforeTap
  ) {
    console.log("Players can now react.");
    game.canReactionTap = true;
    return;
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
      game.reactRoundsWins.push("_");
      game.hasRoundEnded = true;
      game.timeBetweenRounds = TIME_BETWEEN_ROUNDS;
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

    // FIX HERE!!!
    game.hasRoundEnded = true;
    game.timeBetweenRounds = TIME_BETWEEN_ROUNDS;
  }
};
// END OF REACT-TAP RELATED FUNCTIONS

Rune.initLogic({
  minPlayers: 2,
  maxPlayers: 4,
  setup: (allPlayerIds) => ({
    screen: "lobby",
    timer: LOBBY_TIME,
    countdown: 0,
    gameStart: false,
    gameOver: false,
    winner: null,

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

    // Tap race related properties
    playerDistances: allPlayerIds.reduce(
      (acc, playerId) => {
        acc[playerId] = 0;
        return acc;
      },
      {} as GameState["playerDistances"],
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
    timeBetweenRounds: 0,
    hasRoundEnded: false,

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

      // Get the number of players that have voted
      const totalVotes = gameModes.reduce(
        (acc, mode) => acc + game.gameModeVotes[mode].length,
        0,
      );

      if (totalVotes === game.playerIds.length) {
        // Get number of votes for each game mode
        const votes = gameModes.map((mode) => game.gameModeVotes[mode].length);

        // If there is game mode with all votes, set the game mode
        const maxVotes = Math.max(...votes);

        if (maxVotes === game.playerIds.length) {
          determineGameMode(game);
        }
      }
    },

    click: (_, { game, playerId }) => {
      game.clicks[playerId]++;
    },

    raceTap: (_, { game, playerId }) => {
      if (game.gameOver) return;

      console.log(`Player ${playerId} tapped!`);

      const playerDistances = game.playerDistances;
      const distance = playerDistances[playerId] + 1;
      playerDistances[playerId] = Math.min(distance, 95);
      game.playerDistances = playerDistances;

      if (distance >= 95) {
        game.winner = playerId;

        game.gameOver = true;
        Rune.gameOver({
          players: game.playerDistances,
          minimizePopUp: true,
        });
      }
    },

    reactTap: (_, { game, playerId, allPlayerIds }) => {
      if (
        game.gameOver ||
        game.hasRoundEnded ||
        game.reactedPlayers.includes(playerId)
      )
        return;
      const time = Rune.gameTime();
      // Check if the player reacted too early using Rune.gameTime()
      if (time - game.roundTimeStart < game.timeBeforeTap) {
        // FIX HERE!!! SO IT WORKS FOR JUST NOT 2 PLAYERS
        console.log("Player reacted too early");
        game.reactedPlayers.push(playerId);
        game.reactionTimes[playerId] = -1;

        game.reactRoundsWins.push(
          allPlayerIds.filter(
            (playerId) => game.reactionTimes[playerId] !== -1,
          )[0],
        );

        game.hasRoundEnded = true;
        game.timeBetweenRounds = TIME_BETWEEN_ROUNDS;
        return;
      }

      // Make the reaction time relative to timeBeforeTap
      const reactionTime = time - game.roundTimeStart - game.timeBeforeTap;
      console.log(`Player ${playerId} reacted in ${reactionTime}ms`);

      const reactionTimes = game.reactionTimes;
      reactionTimes[playerId] = reactionTime;
      game.reactionTimes = reactionTimes;

      game.reactedPlayers.push(playerId);

      // If all players have reacted, find the fastest reaction time
      if (game.reactedPlayers.length === game.playerIds.length) {
        game.canReactionTap = false;
        // Find the player with the fastest reaction time and then append their id to reactRoundsWins
        const fastestReactionTime = Math.min(
          ...Object.values(game.reactionTimes),
        );

        // Find all players with the fastest reaction time
        const fastestPlayers = Object.entries(game.reactionTimes)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          .filter(([_, reactionTime]) => reactionTime === fastestReactionTime)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          .map(([playerId, _]) => playerId);

        // Randomly select one of the fastest players
        const fastestPlayerId = fastestPlayers[
          Math.floor(Math.random() * fastestPlayers.length)
        ] as PlayerId;

        game.reactRoundsWins.push(fastestPlayerId);
        console.log(`Player ${fastestPlayerId} won the round`);

        game.hasRoundEnded = true;
        game.timeBetweenRounds = TIME_BETWEEN_ROUNDS;
      }
    },

    setPlayerReady: (_, { game, playerId }) => {
      if (game.readyPlayers.includes(playerId)) return;
      game.readyPlayers.push(playerId);

      if (game.readyPlayers.length === game.playerIds.length) {
        console.log("All players ready, starting game...");

        game.screen = game.gameMode as Screen;

        game.countdown = COUNTDOWN_TIME;
        switch (game.gameMode) {
          case "tug-a-tap": {
            game.timer = TUG_A_TAP_GAME_TIME;
            break;
          }
          case "tap-race": {
            game.timer = TAP_RACE_GAME_TIME;
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
    if (
      game.screen === "tup-a-tap-intro" ||
      game.screen === "tap-race-intro" ||
      game.screen === "react-tap-intro" ||
      game.gameOver
    )
      return;

    if (game.countdown > 0) {
      game.countdown -= UPDATE_INTERVAL;
      return;
    }

    // When countdown is over...
    if (!game.gameStart && game.screen !== "lobby") {
      game.gameStart = true;

      switch (game.gameMode) {
        case "react-tap": {
          newReactTapRound(game);
          return;
        }
      }
    }

    // IF the timer is up (for lobby and tug-a-tap)
    if (game.timer <= 0) {
      switch (game.screen) {
        case "lobby": {
          determineGameMode(game);
          break;
        }
        case "tug-a-tap": {
          game.gameOver = true;
          Rune.gameOver({
            players: {
              [game.playerIds[0]]: game.clicks[game.playerIds[0]],
              [game.playerIds[1]]: game.clicks[game.playerIds[1]],
            },
            minimizePopUp: true,
          });

          game.winner =
            game.clicks[game.playerIds[0]] > game.clicks[game.playerIds[1]]
              ? game.playerIds[0]
              : game.playerIds[1];
          break;
        }

        case "tap-race": {
          game.gameOver = true;
          // Find player with the highest distance
          const playerDistances = game.playerDistances;
          const maxDistance = Math.max(...Object.values(playerDistances));
          const winner = Object.entries(playerDistances).find(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ([_, distance]) => distance === maxDistance,
          )![0] as PlayerId;

          const losers = game.playerIds
            .filter((playerId) => playerId !== winner)
            .reduce(
              (acc, playerId) => {
                acc[playerId] = "LOST";
                return acc;
              },
              {} as Record<PlayerId, "LOST">,
            );

          game.winner = winner;

          Rune.gameOver({
            players: {
              [winner]: "WON",
              ...losers,
            },
            minimizePopUp: true,
          });
          break;
        }
      }
    }

    if (game.gameMode === "react-tap" && game.hasRoundEnded) {
      if (game.timeBetweenRounds > 0) {
        game.timeBetweenRounds -= UPDATE_INTERVAL;
        return;
      } else {
        console.log("Starting new round...");
        game.timeBetweenRounds = 0;
        game.hasRoundEnded = false;
        newReactTapRound(game);
        return;
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

      case "tap-race": {
        game.timer -= UPDATE_INTERVAL;
        break;
      }

      case "react-tap": {
        reactTapUpdate(game);
        break;
      }
    }
  },
  updatesPerSecond: 10,
  events: {
    playerJoined(playerId, { game }) {
      game.playerIds.push(playerId);
      game.clicks[playerId] = 0;
      game.clicksPercentage[playerId] = 0;
      game.playerDistances[playerId] = 0;
      game.reactionTimes[playerId] = 0;
    },
    playerLeft(playerId, { game }) {
      const playerIndex = game.playerIds.indexOf(playerId);
      game.playerIds.splice(playerIndex, 1);
      delete game.clicks[playerId];
      delete game.clicksPercentage[playerId];
      delete game.playerDistances[playerId];
      delete game.reactionTimes[playerId];

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
