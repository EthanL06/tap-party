import type { PlayerId, RuneClient } from "rune-games-sdk";

export interface GameState {
  clicks: {
    [playerId: string]: number;
  };
  clicksPercentage: {
    [playerId: string]: number;
  };
  playerIds: PlayerId[];
  gameStart: number;
  timer: number;
  gameOver?: boolean;
}

type GameActions = {
  click: () => void;
};

declare global {
  const Rune: RuneClient<GameState, GameActions>;
}

Rune.initLogic({
  minPlayers: 2,
  maxPlayers: 2,
  setup: (allPlayerIds) => ({
    clicks: allPlayerIds.reduce(
      (acc, playerId) => {
        acc[playerId] = 0;
        return acc;
      },
      {} as GameState["clicks"],
    ),
    playerIds: allPlayerIds,
    gameStart: Rune.gameTime(),
    timer: 30 * 1000,
    clicksPercentage: allPlayerIds.reduce(
      (acc, playerId) => {
        acc[playerId] = 0;
        return acc;
      },
      {} as GameState["clicksPercentage"],
    ),
    gameOver: false,
  }),
  actions: {
    click: (_, { game, playerId }) => {
      game.clicks[playerId]++;
    },
  },
  update: ({ game }) => {
    if (game.timer <= 0) {
      game.gameOver = true;
      return;
    }

    game.timer -= 100;

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
  },

  updatesPerSecond: 10,
});
