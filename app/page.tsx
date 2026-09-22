import type { Metadata } from "next";
import { HomePage } from "@fsd/pages/home";

export const metadata: Metadata = { title: "대시보드" };

export default function Page() {
  return <HomePage />;
}
