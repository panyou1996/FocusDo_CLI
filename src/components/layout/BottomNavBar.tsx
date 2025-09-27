
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Inbox, BookText, Settings, Plus, Pencil, X, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from 'react';
import { useThemeStore } from '@/store/useThemeStore';
import { themes } from '@/lib/themes';
import { generateAuroraStyle } from '@/lib/color-utils';

const navItems = [
  { href: "/today", icon: Home, label: "Today" },
  { href: "/inbox", icon: Inbox, label: "Inbox" },
  { href: "/calendar", icon: Calendar, label: "Calendar" },
  { href: "/journal", icon: BookText, label: "Journal" },
  { href: "/settings", icon: Settings, label: "Setting" },
];

const subMenuItems = [
    { href: "/add-task", icon: Pencil, label: "Add Task" },
    { href: "/journal/new", icon: BookText, label: "Add Journal" },
];

export function BottomNavBar() {
  const pathname = usePathname();
  const { colorTheme, mode } = useThemeStore();
  const [dynamicStyle, setDynamicStyle] = React.useState({});
  const [activeItemStyle, setActiveItemStyle] = React.useState({});
  const [isFabOpen, setIsFabOpen] = React.useState(false);

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
  
  const fabContainerVariants = {
    initial: { scale: 0 },
    animate: { scale: 1, transition: { type: "spring", stiffness: 400, damping: 20 } },
    exit: { scale: 0 },
  };
  
  const fabVariants = {
    closed: { rotate: 0 },
    open: { rotate: 45 },
  };

  const subMenuVariants = {
    closed: { y: 20, opacity: 0, scale: 0.5 },
    open: { y: 0, opacity: 1, scale: 1 },
  };
  
  const subMenuContainerVariants = {
    closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
    open: { transition: { staggerChildren: 0.1, staggerDirection: 1 } },
  };

  return (
    <>
      <footer className="sticky bottom-0 h-[calc(86px+env(safe-area-inset-bottom))] bg-transparent z-40">
        <div className="relative h-full w-full max-w-lg mx-auto">
            <motion.div
              className="custom-card absolute bottom-[env(safe-area-inset-bottom)] left-0 right-0 mx-4 mb-4 h-[70px] rounded-[20px] shadow-glass bg-background/80 backdrop-blur-sm border border-border/50"
            >
            <nav className="flex items-center justify-around h-full pt-1 pb-2 px-2">
              {navItems.map((item, index) => {
                const isActive = pathname.startsWith(item.href);
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
          <div className="absolute bottom-[calc(90px+env(safe-area-inset-bottom))] right-5 z-50">
            <motion.div 
                className="flex flex-col items-end gap-3"
                variants={subMenuContainerVariants}
                initial="closed"
                animate={isFabOpen ? "open" : "closed"}
            >
                <AnimatePresence>
                {isFabOpen && subMenuItems.map((item) => (
                    <motion.div key={item.href} variants={subMenuVariants}>
                        <Link href={item.href} className="flex items-center justify-end gap-3">
                            <div className="custom-card rounded-md shadow-md px-3 py-2 text-sm font-medium bg-card text-card-foreground">
                                {item.label}
                            </div>
                            <div className="w-12 h-12 rounded-full flex items-center justify-center custom-card shadow-lg" style={dynamicStyle}>
                            <item.icon className="w-6 h-6 text-primary-foreground" />
                            </div>
                        </Link>
                    </motion.div>
                ))}
                </AnimatePresence>
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    className="w-16 h-16 rounded-full flex items-center justify-center text-primary-foreground custom-card shadow-lg"
                    aria-label="Add"
                    style={dynamicStyle}
                    onClick={() => setIsFabOpen(!isFabOpen)}
                >
                    <motion.div variants={fabVariants}>
                        <Plus size={30} strokeWidth={2.5} />
                    </motion.div>
                </motion.div>
            </motion.div>
          </div>
        </div>
      </footer>
    </>
  );
}

    