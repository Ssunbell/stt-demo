import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Real-time STT | 실시간 음성-텍스트 변환",
  description: "Google Cloud Speech-to-Text를 활용한 실시간 음성 인식 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
