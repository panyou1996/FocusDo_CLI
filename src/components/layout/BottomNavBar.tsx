
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Inbox, BookText, Settings, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from 'react';
import { useThemeStore } from '@/store/useThemeStore';
import { themes } from '@/lib/themes';
import { generateAuroraStyle } from '@/lib/color-utils';

const navItems = [
  { href: "/today", icon: Home, label: "Today" },
  { href: "/inbox", icon: Inbox, label: "Inbox" },
  { href: "/journal", icon: BookText, label: "Journal" },
  { href: "/settings", icon: Settings, label: "Setting" },
];

const modalPaths = ['/add-task', '/journal/new', '/add-list', '/settings/appearance', '/settings/profile'];
const editTaskRegex = /^\/edit-task\/.+/;

export function BottomNavBar() {
  const pathname = usePathname();
  const [isModalPage, setIsModalPage] = React.useState(false);
  const { colorTheme, mode } = useThemeStore();
  const [dynamicStyle, setDynamicStyle] = React.useState({});
  const [activeItemStyle, setActiveItemStyle] = React.useState({});

  React.useEffect(() => {
    const theme = themes.find(t => t.name === colorTheme);
    if (theme) {
      const baseColor = mode === 'dark' ? theme.cssVars.dark.primary : theme.cssVars.light.primary;
      setDynamicStyle(generateAuroraStyle(baseColor));
      setActiveItemStyle({
        color: `hsl(${baseColor})`,
      })
    }
  }, [colorTheme, mode]);


  React.useEffect(() => {
    const isCurrentlyModal = modalPaths.includes(pathname) || editTaskRegex.test(pathname);
    if (isCurrentlyModal !== isModalPage) {
      setIsModalPage(isCurrentlyModal);
    }
  }, [pathname, isModalPage]);

  const navBarVariants = {
    visible: { y: 0, transition: { type: 'spring', stiffness: 500, damping: 30 } },
    hidden: { y: '120%', transition: { type: 'spring', stiffness: 500, damping: 30 } },
  };

  const fabVariants = {
    visible: { scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 500, damping: 20 } },
    hidden: { scale: 0, rotate: 45, transition: { type: 'spring', stiffness: 500, damping: 20 } },
  };

  return (
    <footer className="sticky bottom-0 h-[calc(86px+env(safe-area-inset-bottom))] bg-transparent z-40">
      <div className="relative h-full w-full max-w-lg mx-auto">
        <AnimatePresence>
          {!isModalPage && (
             <motion.div
                variants={navBarVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="custom-card absolute bottom-[env(safe-area-inset-bottom)] left-0 right-0 mx-4 mb-4 h-[70px] rounded-[20px] shadow-glass"
              >
              <nav className="flex items-center justify-around h-full pt-1 pb-2 px-2">
                {navItems.map((item, index) => {
                  const isActive = pathname.startsWith(item.href);
                  
                  if (index === 2) {
                    return (
                      <React.Fragment key="fab-placeholder">
                        <div className="flex-auto basis-1/5" />
                        <Link href={item.href} key={item.href} className="flex-auto basis-1/5 relative flex flex-col items-center justify-center gap-1">
                            <div
                              className={cn(
                                "flex flex-col items-center justify-center gap-1 transition-colors",
                                isActive ? "" : "text-muted-foreground"
                              )}
                              style={isActive ? activeItemStyle : {}}
                            >
                              <item.icon strokeWidth={isActive ? 2 : 1.5} size={24} />
                              <span className="text-[10px] font-medium">{item.label}</span>
                            </div>
                            {isActive && (
                                <motion.div
                                    layoutId="active-nav-indicator"
                                    className="absolute top-0 w-10 h-8 bg-primary/10 rounded-full"
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                />
                            )}
                        </Link>
                      </React.Fragment>
                    );
                  }

                  return (
                    <Link href={item.href} key={item.href} className="flex-auto basis-1/5 relative flex flex-col items-center justify-center gap-1">
                      <div
                        className={cn(
                          "flex flex-col items-center justify-center gap-1 transition-colors z-10",
                          isActive ? "" : "text-muted-foreground"
                        )}
                        style={isActive ? activeItemStyle : {}}
                      >
                        <item.icon strokeWidth={isActive ? 2 : 1.5} size={24} />
                        <span className="text-[10px] font-medium">{item.label}</span>
                      </div>
                      {isActive && (
                          <motion.div
                              layoutId="active-nav-indicator"
                              className="absolute top-0 w-10 h-8 bg-primary/10 rounded-full z-0"
                              transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[60px] h-[60px]">
           <AnimatePresence>
              {!isModalPage && (
                <Link href="/add-task" passHref>
                    <motion.div
                        variants={fabVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        whileHover={{ scale: 1.1, rotate: 15 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-full h-full rounded-full flex items-center justify-center text-primary-foreground z-50"
                        aria-label="Add Task"
                        style={dynamicStyle}
                    >
                        <Plus size={30} strokeWidth={2.5} />
                    </motion.div>
                </Link>
              )}
           </AnimatePresence>
        </div>
      </div>
    </footer>
  );
}
