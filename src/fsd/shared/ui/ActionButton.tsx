import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ActionButtonVariant = "primary" | "secondary" | "ghost";

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ActionButtonVariant;
};

const VARIANT_CLASS_NAME: Record<ActionButtonVariant, string> = {
  primary: "bg-[#02C551] text-white hover:bg-[#00B94C]",
  secondary: "border border-[#DDE2E7] bg-white text-[#202124] hover:bg-[#F7F8F9]",
  ghost: "bg-transparent text-[#5F6368] hover:bg-[#F3F4F6]",
};

export const ActionButton = ({
  children,
  className = "",
  type = "button",
  variant = "primary",
  ...props
}: ActionButtonProps) => (
  <button
    type={type}
    className={`inline-flex h-12 items-center justify-center rounded-xl px-5 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASS_NAME[variant]} ${className}`}
    {...props}
  >
    {children}
  </button>
);
