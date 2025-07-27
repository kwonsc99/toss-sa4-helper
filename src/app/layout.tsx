import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "토스 SA4 고객 관리 헬퍼",
  description: "토스 SA4 고객 관리를 위한 웹 애플리케이션",
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
