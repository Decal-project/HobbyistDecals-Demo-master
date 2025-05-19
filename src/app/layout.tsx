import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Client-only hooks and components
import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import NavbarComponent from "@/components/global/navbar";
import FooterComponent from "@/components/global/footer";
import GetinTouch from "@/components/global/get-in-touch";
import PopupModal from "@/components/global/PopupModal";
import ScrollToTopButton from "@/components/global/ScrollToTopButton";
import { ReactNode } from "react";

// Fonts
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

// This needs to be a Client Component because it uses usePathname and SessionProvider
function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute =
    pathname?.startsWith("/adminDashboard") || pathname === "/admin-login";

  return (
    <SessionProvider>
      {!isAdminRoute && (
        <div className="w-full min-h-[3rem] bg-black text-white flex items-center justify-center py-2">
          <p className="w-[90%] text-center text-wrap text-white text-sm lg:text-base leading-6 lg:leading-7 font-semibold">
            Enjoy Quantity Discounts Up to 30% Off on Stock & Custom Decals! | Save Big with Bulk Orders – Up to 50% Off!
          </p>
        </div>
      )}
      {!isAdminRoute && <NavbarComponent />}
      {!isAdminRoute && <PopupModal />}
      
      {children}
      
      {!isAdminRoute && <GetinTouch />}
      {!isAdminRoute && <FooterComponent />}
      {!isAdminRoute && <ScrollToTopButton />}
    </SessionProvider>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-fit w-full flex flex-col items-center justify-center antialiased">
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
