"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export default function ScrollToTopLink({ href, children, className }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === href) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={className}
    >
      {children}
    </Link>
  );
}
