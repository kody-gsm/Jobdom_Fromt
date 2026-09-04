"use client";

import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { TextField } from "./TextField.tsx";
import type { TextFieldProps } from "./TextField.tsx";

type PasswordFieldProps = Omit<TextFieldProps, "type" | "endElement">;

export const PasswordField = (props: PasswordFieldProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const label = isVisible ? "비밀번호 숨기기" : "비밀번호 보기";

  return (
    <TextField
      {...props}
      type={isVisible ? "text" : "password"}
      endElement={
        <button
          type="button"
          aria-label={label}
          onClick={() => setIsVisible((current) => !current)}
          className="flex h-8 w-8 items-center justify-center text-[#737A82] transition-colors hover:text-[#02C551]"
        >
          {isVisible ? <FiEyeOff aria-hidden size={19} /> : <FiEye aria-hidden size={19} />}
        </button>
      }
    />
  );
};
