"use client";

import Image from "next/image";
import { useState } from "react";
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
          className="flex h-11 w-11 translate-x-2 items-center justify-center"
        >
          <Image
            src={isVisible ? "/openeye.svg" : "/closeeye.svg"}
            alt=""
            width={24}
            height={24}
            aria-hidden="true"
          />
        </button>
      }
    />
  );
};
