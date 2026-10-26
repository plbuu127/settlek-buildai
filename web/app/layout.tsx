import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "./state";
export const metadata:Metadata={title:"SettleK — 다음 한 걸음",description:"한국에 사는 외국인을 위한 개인 맞춤 정착 계획. Your next step for life in Korea.",manifest:"/manifest.webmanifest",appleWebApp:{capable:true,title:"SettleK",statusBarStyle:"default"},icons:{icon:"/favicon.svg",apple:"/icon-192.png"}};
export const viewport={width:"device-width",initialScale:1,themeColor:"#173f36"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body><AppProvider>{children}</AppProvider></body></html>}
