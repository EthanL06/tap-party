import { useAudioStore } from "../store/useAudioStore";
import { useGameStore } from "../store/useGameStore";

export function useInitClient() {
  const stopAllMusic = useAudioStore((state) => state.stopAllMusic);

  Rune.initClient({
    onChange: ({ game, yourPlayerId, event }) => {
      useGameStore.setState({ game, playerID: yourPlayerId });

      if (event?.name == "stateSync") {
        console.log("State Synced");
        console.log(game);
        stopAllMusic();
      }
    },
  });
}
