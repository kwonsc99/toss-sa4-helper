import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "토스 SA4 고객 관리 헬퍼",
  description: "토스 SA4팀의 고객 후속 관리 도구",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-white">{children}</body>
    </html>
  );
}
