import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "취업 공고",
  openGraph: { images: [] },
  twitter: { images: [] },
};

export default function RecruitDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
