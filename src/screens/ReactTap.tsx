import { PlayerId } from "rune-games-sdk";
import { cn } from "../lib/utils";
import { useGameStore } from "../store/useGameStore";

import Banner from "../components/Banner";
import Board from "../components/Board";
import Button from "../components/Button";
import Event from "../components/Event";

import stickman from "../assets/stickman.svg";
import stickmanHappy from "../assets/stickman-happy.svg";
import stickmanSad from "../assets/stickman-sad.svg";
import { Shadow } from "../components/StickmanTug";

const ReactTap = () => {
  const canReactionTap = useGameStore((state) => state.game.canReactionTap);
  const reactedPlayers = useGameStore((state) => state.game.reactedPlayers);
  const roundWinners = useGameStore((state) => state.game.reactRoundsWins);
  const reactionTimes = Object.entries(
    useGameStore((state) => state.game.reactionTimes),
  );
  const hasRoundEnded = useGameStore((state) => state.game.hasRoundEnded);
  const playerID = useGameStore((state) => state.playerID);
  const gameOver = useGameStore((state) => state.game.gameOver);
  const winner = useGameStore((state) => state.game.winner);

  const determineStickman = () => {
    if (gameOver && winner != null) {
      if (winner === playerID) {
        return stickmanHappy;
      } else {
        return stickmanSad;
      }
    }
    if (!hasRoundEnded) {
      return stickman;
    }

    if (roundWinners[roundWinners.length - 1] === playerID) {
      return stickmanHappy;
    } else {
      return stickmanSad;
    }
  };

  const stickmanImage = determineStickman();

  return (
    <div className="relative flex h-full min-h-screen flex-col items-center justify-between">
      <div className="relative mt-4 w-full space-y-2 px-4">
        <Board>REACT TAP!</Board>

        <Banner />
      </div>

      <div className="mx-auto mt-6 flex w-full max-w-64 justify-around">
        {roundWinners.map((winnerID, i) => (
          <div
            key={i}
            className={cn(
              "outline-3 stylized-shadow size-4 rounded-full outline outline-black",
              winnerID === playerID ? "bg-emerald-500" : "bg-red-500",
            )}
          ></div>
        ))}

        {[...Array(9 - roundWinners.length)].map((_, i) => (
          <div
            key={i}
            className="outline-3 size-4 rounded-full outline outline-black"
          ></div>
        ))}
      </div>

      <ReactionTimes
        myPlayerID={playerID}
        reactedPlayers={reactedPlayers}
        reactionTimes={reactionTimes}
        hasRoundEnded={hasRoundEnded}
        roundWinners={roundWinners}
      />

      <div className="flex grow items-center justify-center">
        <Button
          className={cn(
            !reactedPlayers.includes(playerID) &&
              !hasRoundEnded &&
              !gameOver &&
              "scale-[1.3] active:scale-105",
          )}
          disabled={
            reactedPlayers.includes(playerID) || hasRoundEnded || gameOver
          }
          showIcon={canReactionTap}
          onClick={() => {
            Rune.actions.reactTap();
          }}
        />
      </div>

      <div className="relative mt-3">
        <Shadow className={cn("bottom-7 left-1/2 -translate-x-1/2")} />
        <img
          src={stickmanImage}
          alt="stickman"
          className={cn(
            "relative z-50 mx-auto mb-8 size-16",
            stickmanImage === stickmanHappy && "animate-bounce",
            stickmanImage === stickmanSad && "left-2 top-[1.2rem]",
          )}
        />
      </div>

      <Event />
    </div>
  );
};

const ReactionTimes = ({
  reactionTimes,
  reactedPlayers,
  hasRoundEnded,
  myPlayerID,
  roundWinners,
}: {
  reactionTimes: [string, number][];
  reactedPlayers: string[];
  hasRoundEnded: boolean;
  myPlayerID: string;
  roundWinners: string[];
}) => {
  const displayName = (id: PlayerId) => {
    const name = Rune.getPlayerInfo(id).displayName;

    if (name.length > 16) {
      return name.substring(0, 10) + "...";
    }

    return name;
  };

  const determineMessage = () => {
    if (reactedPlayers.length === 0) {
      return "No one reacted!";
    }

    // Find if any players have a reaction time of -1 and get their id
    const earlyPlayers = reactionTimes.find(([, time]) => time === -1)?.[0];
    if (earlyPlayers === myPlayerID) {
      return "You reacted too early!";
    } else if (earlyPlayers) {
      return `${displayName(earlyPlayers)} reacted too early!`;
    }

    const myReactionTime = reactionTimes.find(
      ([playerID]) => playerID === myPlayerID,
    )?.[1];

    if (!myReactionTime) {
      return null;
    }

    // If my reaction time is the fastest
    if (
      roundWinners[roundWinners.length - 1] === myPlayerID &&
      myReactionTime !== 0
    ) {
      return "You're the fastest!";
    } else {
      return "Not fast enough!";
    }
  };

  if (!hasRoundEnded) {
    return null;
  }

  if (
    reactionTimes.some(([, time]) => time === -1) ||
    (reactionTimes.every(([, time]) => time === 0) && hasRoundEnded)
  ) {
    return (
      <div className="mx-auto mt-6 w-full max-w-72 text-center text-3xl font-bold">
        {determineMessage() || "Round Over"}
      </div>
    );
  }

  const myReactionTime = reactionTimes.find(
    ([playerID]) => playerID === myPlayerID,
  )?.[1];

  return (
    <div className="mt-6 w-full ">
      <div className="mx-auto max-w-72 text-center text-3xl font-bold">
        {determineMessage() || "Round Over"}
      </div>

      <div className="max-w-84 mx-auto w-full text-center text-base font-bold">
        {myReactionTime !== 0 ? (
          <>
            You reacted in{" "}
            {reactionTimes.find(([playerID]) => playerID === myPlayerID)?.[1]}
            ms.
          </>
        ) : (
          "You didn't react!"
        )}
      </div>

      {reactionTimes
        .filter(([playerID]) => playerID !== myPlayerID)
        .map(([playerID, reactionTime]) => (
          <div
            key={playerID}
            className="max-w-84 mx-auto w-full text-center text-base font-bold"
          >
            {reactionTime !== 0 ? (
              <>
                {displayName(playerID)} reacted in {reactionTime}ms.
              </>
            ) : (
              `${displayName(playerID)} didn't react!`
            )}
          </div>
        ))}
    </div>
  );
};

export default ReactTap;
