import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://gamcheon-artist-apply.rjbcom4263.chatgpt.site"),
  title: "감천 작가 지도 신청",
  description: "감천의 작가와 작품, 공방 정보를 연결하는 작가 참여 신청 페이지입니다.",
  openGraph: { title: "감천 작가 지도 신청", description: "감천의 작가를 관광객에게 연결합니다.", type: "website", images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "감천 작가 지도 신청", description: "감천의 작가를 관광객에게 연결합니다.", images: ["/og.png"] },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
