import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./(main)/_components/providers";
import ClientLayout from "./(main)/_components/client-layout";
import ChatbotIcon from "./(main)/_components/chatbotIcon";
import ScrollToTopLink from "@/components/global/ScrollToTopLink"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hobbyist Decals",
  description: "Customize, Print, and Showcase Your Model Decals",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-fit w-full flex flex-col items-center justify-center antialiased">
        <Providers>
          <ScrollToTopLink /> {/* 👈 Scroll to top on route change */}
          <ClientLayout>{children}</ClientLayout>
          <ChatbotIcon />
        </Providers>
      </body>
    </html>
  );
}
