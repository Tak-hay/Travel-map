import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "旅行ログ・白地図塗りつぶし",
  description: "訪れた場所を白地図の塗りつぶしで記録する旅行ログアプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
