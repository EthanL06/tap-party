import { createContext, useEffect, useState } from "react";
import { GameState } from "../logic";
import { PlayerId } from "rune-games-sdk";

interface GameContextType {
  state: GameState;
  playerID: PlayerId;
}

export const GameContext = createContext<GameContextType>({
  state: {
    clicks: {},
    playerIds: [],
  },
  playerID: "",
});

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [game, setGame] = useState<GameState>({
    clicks: {},
    playerIds: [],
  });

  const [playerID, setPlayerID] = useState<PlayerId>("");

  useEffect(() => {
    Rune.initClient({
      onChange: ({ game, yourPlayerId }) => {
        setGame(game);
        setPlayerID(yourPlayerId as PlayerId);
      },
    });
  });

  return (
    <GameContext.Provider
      value={{
        state: game,
        playerID,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
