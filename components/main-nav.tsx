"use client";

import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from 'next/image';
import LogoDark from "@/public/logo_dark.svg";
import LogoLight from "@/public/logo_light.svg";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const [isMounted, setIsMounted] = useState(false);

  const pathname = usePathname();
  const { theme } = useTheme();

  useEffect(() => {
    setIsMounted(true)
  }, []);

  if (!isMounted) return null;
  
  const routes = [
    {
      href: `/`,
      label: 'Overview',
      active: pathname === `/`
    },
    {
      href: `/participants`,
      label: 'Participants',
      active: pathname === `/participants`
    },
    {
      href: `/medias`,
      label: 'Medias',
      active: pathname === `/medias`
    }
  ];
  
  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      <Link
        href={'/'}
      >
        <Image 
          height="20"
          alt="Logo"
          src={theme === 'light' ? LogoDark : LogoLight}
        />
      </Link>

      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={
            cn("text-sm font-medium transition-colors hover:text-primary", 
            route.active ? "font-bold dark:text-white" : "text-muted-foreground"
          )}
        >
          {route.label}
        </Link>
      ))}
        
    </nav>
  )
}