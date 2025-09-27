
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import * as React from 'react';

const MODAL_PATHS = [
    '/add-task', 
    '/journal/new', 
    '/add-list',
    '/settings/appearance',
    '/settings/profile'
];
const EDIT_TASK_REGEX = /^\/edit-task\/.+/;

const pageVariants = {
  initial: {
    opacity: 0,
    scale: 1.1,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'tween',
      ease: 'easeOut',
      duration: 0.35
    }
  },
  exit: {
    opacity: 0,
    scale: 1.1,
    transition: {
      type: 'tween',
      ease: 'easeIn',
      duration: 0.25
    }
  }
};

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isModalPage = MODAL_PATHS.includes(pathname) || EDIT_TASK_REGEX.test(pathname);

  if (isModalPage) {
    return <div>{children}</div>;
  }

  return (
    <div className="relative flex-grow flex flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute inset-0"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
