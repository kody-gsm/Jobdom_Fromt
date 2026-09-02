import { Input, type InputSkin } from "../atoms";

type InputFieldProps = {
    className?: string;
    style?: React.CSSProperties;
    title?: string;
    errormsg?: string;
    p?: string;
    onClick?: () => void;
    skin?: InputSkin;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const InputField = ({ className = "", style, title, errormsg, p, onClick, skin, ...props }: InputFieldProps) => {
  return (
    <div className="w-fit">
        {title && <p className="mb-2 font-medium text-lg">{title}</p>}
        <Input 
            className={className}
            style={style}
            skin={skin}
            error={Boolean(errormsg)}
            {...props}
        />
        <div className="text-right font-normal text-sm mt-1">
            {errormsg && <p className="text-red-500">{errormsg}</p>}
            <p className={onClick ? "cursor-pointer text-[#02C551]" : "text-[#02C551]"} onClick={onClick}>
                {p}
            </p>
        </div>
    </div>
  );
}
