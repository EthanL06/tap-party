import React from "react";

type Props = {
  children: React.ReactNode;
};

const Board = ({ children }: Props) => {
  return (
    <div className="stylized-shadow relative block rounded border-[4px] border-black bg-[#ffcb39] p-3">
      <div className="pt-2 text-center text-[2.6rem] font-black">
        {children}
      </div>

      <div className="absolute -top-[4.2rem] left-16 h-16 w-1 bg-black"></div>
      <div className="absolute -top-[4.2rem] right-16 h-16 w-1 bg-black"></div>
    </div>
  );
};

export default Board;
