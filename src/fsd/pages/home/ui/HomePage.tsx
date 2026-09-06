import { HomeServices } from "@fsd/widgets/home-services";
import { StudentHeader } from "@fsd/widgets/student-header";

export const HomePage = () => (
  <div
    className="min-h-dvh bg-[#F4F6F8] text-[#13233A]"
    style={{ fontFamily: '"Pretendard Variable", sans-serif' }}
  >
    <StudentHeader />
    <main className="mx-auto w-full max-w-[1280px] px-6 py-8 lg:px-10 lg:py-10">
      <HomeServices />
    </main>
  </div>
);
