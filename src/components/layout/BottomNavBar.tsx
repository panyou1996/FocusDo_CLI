
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Inbox, BookText, Settings, Plus } from "lucide-react";
import { motion } from "framer-motion";
import * as React from 'react';

const navItems = [
  { href: "/today", icon: Home, label: "Today" },
  { href: "/inbox", icon: Inbox, label: "Inbox" },
  { href: "/journal", icon: BookText, label: "Journal" },
  { href: "/settings", icon: Settings, label: "Setting" },
];

export function BottomNavBar() {
  const pathname = usePathname();
  const [isModalPage, setIsModalPage] = React.useState(false);

  const modalPaths = ['/add-task', '/journal/new', '/add-list', '/settings/appearance', '/settings/profile'];
  const editTaskRegex = /^\/edit-task\/.+/;

  React.useEffect(() => {
    const isCurrentlyModal = modalPaths.includes(pathname) || editTaskRegex.test(pathname);
    if (isCurrentlyModal !== isModalPage) {
      setIsModalPage(isCurrentlyModal);
    }
  }, [pathname, isModalPage, editTaskRegex]);

  const navBarVariants = {
    visible: { y: 0, transition: { type: 'spring', stiffness: 500, damping: 30 } },
    hidden: { y: '120%', transition: { type: 'spring', stiffness: 500, damping: 30 } },
  };

  const fabVariants = {
    visible: { scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 500, damping: 20 } },
    hidden: { scale: 0, rotate: 45, transition: { type: 'spring', stiffness: 500, damping: 20 } },
  };

  return (
    <footer className="sticky bottom-0 h-[86px] bg-transparent z-40">
      <div className="relative h-full w-full max-w-lg mx-auto">
        <motion.div
            variants={navBarVariants}
            initial="visible"
            animate={isModalPage ? "hidden" : "visible"}
            className="relative mx-4 mb-4 h-[70px] bg-card/60 backdrop-blur-xl rounded-[24px] shadow-lg"
          >
          <nav className="flex items-center justify-around h-full pt-1 pb-2 px-5">
            {navItems.slice(0, 2).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link href={item.href} key={item.href} className="flex-auto">
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
            <div className="flex-auto" />
            {navItems.slice(2, 4).map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link href={item.href} key={item.href} className="flex-auto">
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
        </motion.div>
        
        <motion.div
            variants={fabVariants}
            initial="visible"
            animate={isModalPage ? "hidden" : "visible"}
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            className="absolute left-1/2 -translate-x-1/2 top-[-14px] w-[60px] h-[60px] bg-primary rounded-full flex items-center justify-center shadow-fab z-50"
            aria-label="Add Task"
        >
            <Link href="/add-task">
                <Plus className="text-white" size={30} strokeWidth={2.5} />
            </Link>
        </motion.div>
      </div>
    </footer>
  );
}
