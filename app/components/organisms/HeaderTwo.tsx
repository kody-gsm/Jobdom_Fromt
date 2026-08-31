import Link from "next/link";
import { useRouter } from "next/navigation";

export const HeaderTwo = () => {
    const router = useRouter();

    return (
        <div className="w-full h-20 bg-white flex items-center justify-between px-10 py-9">
            <img src="/JobdamIcon.svg" alt="Jobdam Icon" width={64} />
            <div className="cursor-pointer flex gap-15 text-[#02C551] text-xl font-medium" onClick={() => router.push("/")}>
                <p>나가기</p>
            </div>
        </div>
    );
}