import bannerWinner from "../assets/banner.png";
import bannerLoser from "../assets/banner_loser.png";
import bannerTied from "../assets/banner_tied.png";
import { useGameStore } from "../store/useGameStore";
import { cn } from "../lib/utils";

const Banner = () => {
  const screen = useGameStore((state) => state.game.screen);
  const gameOver = useGameStore((state) => state.game.gameOver);
  const yourClicksPercentage = useGameStore(
    (state) => state.game.clicksPercentage[state.playerID],
  );
  const reactRoundWins = useGameStore((state) => state.game.reactRoundsWins);
  const playerID = useGameStore((state) => state.playerID);

  if (!gameOver) return null;

  const determineFlag = () => {
    switch (screen) {
      case "tug-a-tap": {
        const opponentClicksPercentage = 100 - yourClicksPercentage;

        if (yourClicksPercentage === 50) return bannerTied;

        return yourClicksPercentage > opponentClicksPercentage
          ? bannerWinner
          : bannerLoser;
      }

      case "react-tap": {
        // Get wins of every player
        const wins: { [key: string]: number } = reactRoundWins.reduce(
          (acc, curr) => {
            acc[curr] = (acc[curr] || 0) + 1;
            return acc;
          },
          {} as { [key: string]: number },
        );

        // Sort wins in descending order
        const sortedWins = Object.entries(wins).sort((a, b) => b[1] - a[1]);

        // If the first player is the current player, return the winner banner
        if (sortedWins[0][0] === playerID) return bannerWinner;
        return bannerLoser;
      }
    }
  };

  return (
    <div className="banner-animation relative -top-[7rem]">
      <img
        src={determineFlag()}
        alt="banner"
        className={cn(
          "absolute left-1/2 top-[4.5rem] z-50 w-full max-w-xl -translate-x-1/2",
        )}
      />
    </div>
  );
};

export default Banner;
