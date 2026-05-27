import type { InputHTMLAttributes } from "react";

export type InputSkin = "outlined" | "filled";

type InputProps = {
    className?: string;
    style?: React.CSSProperties;
    skin?: InputSkin;
    error?: boolean;
} & InputHTMLAttributes<HTMLInputElement>;

export const Input = ({ className = "", style, skin = "filled", error, ...props }: InputProps) => {
  const backgroundClass = skin === "outlined" ? "bg-white" : "bg-[#F2F4F7]";
  const borderClass = error
    ? "border border-red-500"
    : skin === "outlined"
      ? "border border-[#CFD0D1] focus:border-2 focus:border-[#02C551]"
      : "border-none";

  return (
    <input
      className={`p-4 h-14 appearance-none rounded-lg ${backgroundClass} ${borderClass} text-[20px] font-normal not-italic leading-[100%] tracking-normal text-black placeholder:text-[#95979D] placeholder:opacity-100 focus:outline-none [leading-trim:none] ${className}`}
      style={{
        fontFamily: '"Pretendard Variable", sans-serif',
        ...style,
      }}
      {...props}
    />
  );
}
