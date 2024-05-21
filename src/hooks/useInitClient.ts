import { useGameStore } from "../store/useGameStore";

export function useInitClient() {
  Rune.initClient({
    onChange: ({ game, yourPlayerId }) => {
      useGameStore.setState({ game, playerID: yourPlayerId });
    },
  });
}
