"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Inbox, BookText, Settings, Plus } from "lucide-react";

const navItems = [
  { href: "/today", icon: Home, label: "Today" },
  { href: "/inbox", icon: Inbox, label: "Inbox" },
  { href: "/blog", icon: BookText, label: "Blog" },
  { href: "/settings", icon: Settings, label: "Setting" },
];

export function BottomNavBar() {
  const pathname = usePathname();

  const isAddTaskPage = pathname === '/add-task';

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-[74px] bg-transparent z-40">
      <div className="relative h-full w-full max-w-lg mx-auto">
        <div className={cn(
            "absolute bottom-0 left-0 right-0 h-[74px] bg-card/80 backdrop-blur-lg rounded-t-[24px] shadow-[0px_-4px_10px_rgba(0,0,0,0.05)] transition-transform duration-300",
            isAddTaskPage && "translate-y-full"
            )}>
          <nav className="flex items-center justify-around h-full pt-1 pb-[24px] px-5">
            {navItems.slice(0, 2).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link href={item.href} key={item.href} className="flex-1">
                  <div
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <item.icon strokeWidth={isActive ? 2 : 1.5} size={24} />
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </div>
                </Link>
              );
            })}
            <div className="flex-1" />
            {navItems.slice(2, 4).map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link href={item.href} key={item.href} className="flex-1">
                  <div
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <item.icon strokeWidth={isActive ? 2 : 1.5} size={24} />
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
        <Link
          href="/add-task"
          className={cn(
            "absolute left-1/2 -translate-x-1/2 top-[-18px] w-[60px] h-[60px] bg-primary rounded-full flex items-center justify-center shadow-fab z-50 transition-transform duration-300",
            isAddTaskPage && "scale-0"
            )}
          aria-label="Add Task"
        >
          <Plus className="text-white" size={30} strokeWidth={2.5} />
        </Link>
      </div>
    </footer>
  );
}
