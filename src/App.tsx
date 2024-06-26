import StopMusic from "./components/StopMusic";
import { useInitClient } from "./hooks/useInitClient";
import { Screen } from "./logic";
import Lobby from "./screens/Lobby";
import ReactTap from "./screens/ReactTap";
import ReactTapIntro from "./screens/ReactTapIntro";
import TapRace from "./screens/TapRace";
import TapRaceIntro from "./screens/TapRaceIntro";
import TugATap from "./screens/TugATap";
import TugATapIntro from "./screens/TugATapIntro";
import { useGameStore } from "./store/useGameStore";

const screens: Record<Screen, JSX.Element> = {
  lobby: <Lobby />,
  "tug-a-tap": <TugATap />,
  "tup-a-tap-intro": <TugATapIntro />,
  "tap-race": <TapRace />,
  "tap-race-intro": <TapRaceIntro />,
  "react-tap-intro": <ReactTapIntro />,
  "react-tap": <ReactTap />,
};

function App() {
  useInitClient();
  const screen = useGameStore((state) => state.game.screen);

  return (
    <>
      {screens[screen]}
      <StopMusic />
    </>
  );
}

export default App;
