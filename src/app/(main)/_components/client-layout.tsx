"use client";

import { usePathname } from "next/navigation";
import NavbarComponent from "@/components/global/navbar";
import FooterComponent from "@/components/global/footer";
import GetinTouch from "@/components/global/get-in-touch";
import PopupModal from "@/components/global/PopupModal";
import ScrollToTopButton from "@/components/global/ScrollToTopButton"; 

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute =
    pathname.startsWith("/adminDashboard") || pathname === "/admin-login";

  return (
    <>
      {!isAdminRoute && (
        <div className="w-full min-h-[3rem] bg-black text-white flex items-center justify-center py-2">
          <p className="w-[90%] text-center text-wrap text-white text-sm lg:text-base leading-6 lg:leading-7 font-semibold">
            Enjoy Quantity Discounts Up to 30% Off on Stock & Custom Decals! |
            Save Big with Bulk Orders – Up to 50% Off!
          </p>
        </div>
      )}
      {!isAdminRoute && <NavbarComponent />}
      {!isAdminRoute && <PopupModal />}
      
      {children}

      {!isAdminRoute && <GetinTouch />}
      {!isAdminRoute && <FooterComponent />}
      {!isAdminRoute && <ScrollToTopButton />} 
    </>
  );
}
