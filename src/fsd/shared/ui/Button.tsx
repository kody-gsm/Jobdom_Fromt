import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonSkin = "confirm" | "cancel";

type ButtonProps = {
  content?: ReactNode;
  skin?: ButtonSkin;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = ({
  className = "",
  style,
  content,
  skin = "confirm",
  ...props
}: ButtonProps) => {
  const skinClass =
    skin === "confirm"
      ? "bg-brand text-white"
      : "bg-[#F6F6F6] text-black";

  return (
    <button
      className={`p-4 h-14 appearance-none rounded-lg border-none ${skinClass} not-italic leading-[100%] tracking-normal focus:outline-none [leading-trim:none] ${className}`}
      style={style}
      {...props}
    >      {content}
    </button>
  );
};
