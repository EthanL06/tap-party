import type {
  GameStateWithPersisted,
  PlayerId,
  RuneClient,
} from "rune-games-sdk";
import {
  COUNTDOWN_TIME,
  TUG_A_TAP_GAME_TIME,
  LOBBY_TIME,
  TIME_BETWEEN_ROUNDS,
  TOTAL_REACT_TAP_ROUNDS,
  UPDATE_INTERVAL,
  TAP_RACE_GAME_TIME,
  STEP_DISTANCE,
  MAX_DISTANCE,
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
  clearReadyPlayers: () => void;
  click: () => void;
  incrementTap: () => void;
  raceTap: () => void;
  reactTap: () => void;
  setPlayerReady: () => boolean;
};

export type Persisted = {
  taps: number;
  wins: number;
  totalGames: number;
};

declare global {
  const Rune: RuneClient<GameState, GameActions, Persisted>;
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

// REACT-TAP RELATED FUNCTIONS
const newReactTapRound = (
  game: GameStateWithPersisted<GameState, Persisted>,
) => {
  if (game.gameOver) return;

  game.currentRound++;

  if (game.currentRound > TOTAL_REACT_TAP_ROUNDS) {
    if (game.playerIds.length === 1) {
      game.winner = game.playerIds[0];
      game.gameOver = true;
      Rune.gameOver({
        players: {
          [game.playerIds[0]]: "WON",
        },
        delayPopUp: true,
      });
      game.persisted[game.playerIds[0]].wins++;
      return;
    }

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
      delayPopUp: true,
    });

    // If everyone has the same number of wins, it's a tie
    if (
      Object.values(playerWins).every(
        (wins) => wins === playerWins[game.playerIds[0]],
      )
    ) {
      game.winner = null;
      return;
    }

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

    game.persisted[game.winner].wins++;

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

    game.hasRoundEnded = true;
    game.timeBetweenRounds = TIME_BETWEEN_ROUNDS;
  }
};
// END OF REACT-TAP RELATED FUNCTIONS

Rune.initLogic({
  minPlayers: 1,
  maxPlayers: 4,
  persistPlayerData: true,
  setup: (allPlayerIds, { game }) => {
    for (const playerId of allPlayerIds) {
      game.persisted[playerId] = {
        taps: game.persisted[playerId]?.taps || 0,
        wins: game.persisted[playerId]?.wins || 0,
        totalGames: game.persisted[playerId]?.totalGames || 0,
      };
    }

    return {
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
    };
  },
  actions: {
    castVote: (gameMode, { playerId, game }) => {
      if (playerId === undefined) return;

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
          game.readyPlayers = [];
          determineGameMode(game);
        }
      }
    },

    clearReadyPlayers: (_, { game, playerId }) => {
      if (playerId === undefined) return;

      game.readyPlayers = [];
    },

    click: (_, { game, playerId }) => {
      if (playerId === undefined) return;

      game.clicks[playerId]++;
      game.persisted[playerId].taps++;
    },

    incrementTap: (_, { game, playerId }) => {
      if (playerId === undefined) return;

      game.persisted[playerId].taps++;
    },

    raceTap: (_, { game, playerId }) => {
      if (game.gameOver || playerId === undefined) return;

      console.log(`Player ${playerId} tapped!`);

      game.persisted[playerId].taps++;

      const playerDistances = game.playerDistances;
      const distance = playerDistances[playerId] + STEP_DISTANCE;
      playerDistances[playerId] = Math.min(distance, MAX_DISTANCE);
      game.playerDistances = playerDistances;

      if (distance >= MAX_DISTANCE) {
        game.winner = playerId;

        game.gameOver = true;
        const allPlayerIds = game.playerIds
          .filter((playerId) => playerId !== game.winner)
          .reduce(
            (acc, playerId) => {
              acc[playerId] = "LOST";
              return acc;
            },
            {} as Record<PlayerId, "LOST">,
          );

        Rune.gameOver({
          players: {
            [playerId]: "WON",
            ...allPlayerIds,
          },

          delayPopUp: true,
        });

        game.persisted[playerId].wins++;
      }
    },

    reactTap: (_, { game, playerId, allPlayerIds }) => {
      if (
        game.gameOver ||
        game.hasRoundEnded ||
        game.reactedPlayers.includes(playerId) ||
        playerId === undefined
      )
        return;
      const time = Rune.gameTime();
      // Check if the player reacted too early using Rune.gameTime()
      if (time - game.roundTimeStart < game.timeBeforeTap) {
        game.reactedPlayers.push(playerId);
        game.reactionTimes[playerId] = -1;

        // If all but one player has reacted early, end the round
        if (
          game.reactedPlayers.length === game.playerIds.length - 1 ||
          (game.reactedPlayers.length == 1 && game.playerIds.length === 1)
        ) {
          game.reactRoundsWins.push(
            allPlayerIds.filter(
              (playerId) => game.reactionTimes[playerId] !== -1,
            )[0],
          );

          game.hasRoundEnded = true;
          game.timeBetweenRounds = TIME_BETWEEN_ROUNDS;
        }
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

        const filteredReactionTimes = Object.values(game.reactionTimes).filter(
          (reactionTime) => reactionTime > 0,
        );
        // Find the player with the fastest reaction time and then append their id to reactRoundsWins
        const fastestReactionTime = Math.min(
          ...Object.values(filteredReactionTimes),
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

    setPlayerReady: (_, { game, playerId, allPlayerIds }) => {
      if (game.readyPlayers.includes(playerId) || playerId === undefined)
        return;
      game.readyPlayers.push(playerId);

      if (game.readyPlayers.length === game.playerIds.length) {
        if (game.screen === "lobby") return;
        console.log("All players ready, starting game...");

        game.screen = game.gameMode as Screen;
        game.countdown = COUNTDOWN_TIME;

        allPlayerIds.forEach((playerId) => {
          game.persisted[playerId].totalGames++;
        });

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
  },
  update: ({ game }) => {
    if (
      (game.screen === "lobby" &&
        game.readyPlayers.length < game.playerIds.length) ||
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
          game.readyPlayers = [];
          determineGameMode(game);
          break;
        }
        case "tug-a-tap": {
          game.gameOver = true;

          if (game.playerIds.length === 1) {
            game.winner = game.playerIds[0];
            Rune.gameOver({
              players: {
                [game.playerIds[0]]: "WON",
              },
              delayPopUp: true,
            });

            game.persisted[game.playerIds[0]].wins++;
            return;
          }

          // Check if all players have the same number of clicks
          if (
            Object.values(game.clicks).every(
              (clicks) => clicks === game.clicks[game.playerIds[0]],
            )
          ) {
            game.winner = null;
            Rune.gameOver({
              players: game.playerIds.reduce(
                (acc, playerId) => {
                  acc[playerId] = "TIE";
                  return acc;
                },
                {} as Record<PlayerId, "TIE">,
              ),
              delayPopUp: true,
            });
            return;
          }

          const players = game.playerIds.reduce(
            (acc, playerId) => {
              acc[playerId] = game.clicks[playerId];
              return acc;
            },
            {} as Record<PlayerId, number>,
          );

          Rune.gameOver({
            players,
            delayPopUp: true,
          });

          game.winner = Object.entries(players).reduce(
            (acc, [playerId, clicks]) => {
              if (clicks > acc.clicks) {
                acc.playerId = playerId;
                acc.clicks = clicks;
              }
              return acc;
            },
            { playerId: "", clicks: 0 },
          ).playerId;

          game.persisted[game.winner].wins++;
          break;
        }

        case "tap-race": {
          game.gameOver = true;

          if (game.playerIds.length === 1) {
            game.winner = game.playerIds[0];
            Rune.gameOver({
              players: {
                [game.playerIds[0]]: "WON",
              },
              delayPopUp: true,
            });

            game.persisted[game.playerIds[0]].wins++;
            return;
          }

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

          game.persisted[winner].wins++;

          Rune.gameOver({
            players: {
              [winner]: "WON",
              ...losers,
            },
            delayPopUp: true,
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
  updatesPerSecond: 30,
  events: {
    playerJoined(playerId, { game }) {
      game.playerIds.push(playerId);
      game.clicks[playerId] = 0;
      game.playerDistances[playerId] = 0;
      game.reactionTimes[playerId] = 0;

      if (game.screen === "lobby") {
        game.readyPlayers.push(playerId);
      }
    },
    playerLeft(playerId, { game }) {
      const playerIndex = game.playerIds.indexOf(playerId);
      game.playerIds.splice(playerIndex, 1);
      delete game.clicks[playerId];
      delete game.playerDistances[playerId];
      delete game.reactionTimes[playerId];

      game.readyPlayers = game.readyPlayers.filter((id) => id !== playerId);

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
