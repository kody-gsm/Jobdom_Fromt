import type { ButtonHTMLAttributes } from "react";

export type OptionSkin = "day" | "period";

type BaseOptionProps = {
    className?: string;
    content: string;
    checked?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

type DayOptionProps = BaseOptionProps & {
    skin: "day";
    p: string;
};

type PeriodOptionProps = BaseOptionProps & {
    skin?: "period";
    p?: never;
};

type OptionProps = DayOptionProps | PeriodOptionProps;

export const Option = ({ className = "", content, skin = "period", p, checked, ...props }: OptionProps) => {
    const skinClass =
        skin === "day"
            ? checked ? "min-w-13 min-h-15 px-3 py-2 rounded-[10px] border-none bg-[#02C551] text-xl font-semibold text-white" : "min-w-13 min-h-15 px-3 py-2 rounded-[10px] border-none bg-[#F7F7F7] text-xl font-semibold"
            : checked ? "min-w-20 min-h-13 px-5 py-4 rounded-[6px] bg-[#02C551] text-white text-[16px] font-normal" : "min-w-20 min-h-13 px-5 py-4 rounded-[6px] border border-[#C5C5C5] bg-white text-[16px] font-normal";

    return (
        <button
            className={`flex appearance-none flex-col items-center justify-center text-center text-black ${skinClass} ${className}`}
            {...props}
        >
            <span>{content}</span>
            {skin === "day" && <span>{p}</span>}
        </button>
    );
}
