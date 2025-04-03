import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavbarComponent from "@/components/global/navbar";
import FooterComponent from "@/components/global/footer";
import GetinTouch from "@/components/global/get-in-touch";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`min-h-fit w-full flex flex-col items-center justify-center  ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="w-full min-h-[3rem] bg-black text-white flex items-center justify-center py-2">
          <p className="w-[90%] text-center text-wrap text-white text-sm lg:text-base leading-6 lg:leading-7 font-semibold">
            Enjoy Quantity Discounts Up to 30% Off on Stock & Custom Decals! |
            Save Big with Bulk Orders – Up to 50% Off!
          </p>
        </div>
        <NavbarComponent />
        {children}
        <GetinTouch/>
        <FooterComponent />
      </body>
    </html>
  );
}
