import { MousePointerClick } from "lucide-react";

const Button = () => {
  return (
    <button
      onClick={() => {
        Rune.actions.click();
      }}
      className="group rounded-full border-2 border-black p-2 transition-all hover:bg-black active:scale-90"
    >
      <MousePointerClick className="fill-black group-hover:fill-white group-hover:stroke-white" />
    </button>
  );
};

export default Button;
