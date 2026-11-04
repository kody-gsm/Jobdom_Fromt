import "./globals.css";
import type { Metadata } from "next";
import { preconnect } from "react-dom";
import { NotificationProvider, NotificationToastContainer } from "@fsd/features/notifications";
import { AuthGate } from "@fsd/app/auth-gate";

export const metadata: Metadata = {
  title: { default: "잡담 | 홈", template: "잡담 | %s" },
  icons: {
    icon: "/JobdamIcon.svg",
    shortcut: "/JobdamIcon.svg",
    apple: "/JobdamIcon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 글꼴 CSS와 파일이 있는 CDN 연결을 미리 열어 첫 화면 글꼴 대기 시간을 줄인다.
  preconnect("https://cdn.jsdelivr.net", { crossOrigin: "anonymous" });
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <NotificationProvider>
          <AuthGate>{children}</AuthGate>
          <NotificationToastContainer />
        </NotificationProvider>
      </body>
    </html>
  );
}
