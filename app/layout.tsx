import "./globals.css";
import { AuthGate } from "@fsd/app/auth-gate";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  );
}
