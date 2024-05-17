import type { PlayerId, RuneClient } from "rune-games-sdk";

export interface GameState {
  clicks: {
    [playerId: string]: number;
  };
  playerIds: PlayerId[];
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
  }),
  actions: {
    click: (_, { game, playerId }) => {
      game.clicks[playerId]++;
    },
  },
});
