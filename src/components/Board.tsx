import React from "react";

type Props = {
  children: React.ReactNode;
};

const Board = ({ children }: Props) => {
  return (
    <div className="stylized-shadow rounded border-[4px] border-black p-3">
      <div className="pt-2 text-center text-[2.6rem] font-black">
        {children}
      </div>
    </div>
  );
};

export default Board;
