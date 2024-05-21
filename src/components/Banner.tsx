import bannerWinner from "../assets/banner.png";
import bannerLoser from "../assets/banner_loser.png";
import bannerTied from "../assets/banner_tied.png";
import { useGameStore } from "../store/useGameStore";
import { cn } from "../lib/utils";

const Banner = () => {
  const gameOver = useGameStore((state) => state.game.gameOver);
  const yourClicksPercentage = useGameStore(
    (state) => state.game.clicksPercentage[state.playerID],
  );

  const opponentClicksPercentage = 100 - yourClicksPercentage;

  if (!gameOver) return null;

  const determineFlag = () => {
    if (yourClicksPercentage === 50) return bannerTied;

    return yourClicksPercentage > opponentClicksPercentage
      ? bannerWinner
      : bannerLoser;
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
