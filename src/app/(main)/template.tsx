
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
      ease: 'easeOut',
      duration: 5,
    },
  },
  exit: {
    opacity: 0,
    scale: 1.1,
    transition: {
      ease: 'easeIn',
      duration: 5,
    },
  },
};

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isModalPage = MODAL_PATHS.includes(pathname) || EDIT_TASK_REGEX.test(pathname);

  // Do not apply transition animations to modal-like pages
  if (isModalPage) {
    return <div>{children}</div>;
  }

  return (
    <div className="relative flex-grow flex flex-col">
      <AnimatePresence mode="popLayout" initial={false}>
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
