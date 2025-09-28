
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import * as React from 'react';

const MODAL_PATHS = [
    '/today', 
    '/journal', 
    '/setting',
    '/inbox',
];
const EDIT_TASK_REGEX = /^\/edit-task\/.+/;

const pageVariants = {
  initial: {
    opacity: 0,
    scale: 1.01,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      ease: 'easeOut',
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    scale: 1.01,
    transition: {
      ease: 'easeIn',
      duration: 0.2,
    },
  },
};

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
  );}
