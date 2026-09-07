import type { HTMLAttributes, ReactNode } from "react";

type ContentCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export const ContentCard = ({
  children,
  className = "",
  ...props
}: ContentCardProps) => (
  <div
    className={`rounded-2xl border border-[#E7EAEE] bg-white shadow-[0_8px_24px_rgba(25,32,38,0.04)] ${className}`}
    {...props}
  >
    {children}
  </div>
);
