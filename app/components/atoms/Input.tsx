import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import Image from "next/image";

export type InputSkin = "outlined" | "filled";

type InputProps = {
  className?: string;
  style?: React.CSSProperties;
  skin?: InputSkin;
  error?: boolean;
  showPasswordToggle?: boolean;
} & InputHTMLAttributes<HTMLInputElement>;

export const Input = ({
  className = "",
  style,
  skin = "filled",
  error,
  showPasswordToggle = false,
  type,
  ...props
}: InputProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const backgroundClass =
    skin === "outlined" ? "bg-white" : "bg-[#F2F4F7]";

  const borderClass = error
    ? "border border-red-500"
    : skin === "outlined"
      ? "border border-[#CFD0D1] focus-within:border-2 focus-within:border-[#02C551]"
      : "border-none";

  const inputType =
    showPasswordToggle
      ? isVisible
        ? "text"
        : "password"
      : type;

  return (
    <div
      className={`relative flex items-center rounded-lg ${backgroundClass} ${borderClass} ${className}`}
      style={{
        fontFamily: '"Pretendard Variable", sans-serif',
        ...style,
      }}
    >
      <input
        type={inputType}
        className="w-full p-4 h-14 appearance-none bg-transparent text-[20px] font-normal not-italic leading-[100%] tracking-normal text-black placeholder:text-[#95979D] placeholder:opacity-100 focus:outline-none"
        {...props}
      />

      {showPasswordToggle && (
        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className="absolute right-4 flex items-center justify-center"
        >
          <Image
            src={isVisible ? "/openeye.svg" : "/closeeye.svg"}
            alt="비밀번호 보기"
            width={24}
            height={24}
          />
        </button>
      )}
    </div>
  );
};