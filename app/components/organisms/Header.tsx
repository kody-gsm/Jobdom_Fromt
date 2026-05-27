export const Header = () => {
    return (
        <div className="w-full h-25 bg-white flex items-center justify-between px-10 py-9">
            <img src="/JobdamIcon.svg" alt="Jobdam Icon" width={64} />
            <div className="flex gap-15 text-[#02C551] text-xl font-medium">
                <p>나가기</p>
                <p>프로필</p>
            </div>
        </div>
    );
}