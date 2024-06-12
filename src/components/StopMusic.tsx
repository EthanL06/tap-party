import { useEffect } from "react";
import { useAudioStore } from "../store/useAudioStore";

function StopMusic() {
  const stopAllMusic = useAudioStore((state) => state.stopAllMusic);

  useEffect(() => {
    const handleUnload = () => {
      stopAllMusic();
    };

    window.addEventListener("beforeunload", handleUnload);

    // Cleanup function
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [stopAllMusic]);

  return null;
}

export default StopMusic;
