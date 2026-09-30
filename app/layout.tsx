import "./globals.css";
import type { Metadata } from "next";
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
