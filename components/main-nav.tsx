"use client";

import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import Link from "next/link";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  
  const routes = [
    {
      href: `/`,
      label: 'Overview',
      active: pathname === `/`
    },
    {
      href: `/users`,
      label: 'Users',
      active: pathname === `/users`
    },
    {
      href: `/medias`,
      label: 'Medias',
      active: pathname === `/medias`
    }
  ];
  
  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      
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