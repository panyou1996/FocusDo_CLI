'use client';

import { motion } from 'framer-motion';
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

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isModalPage = MODAL_PATHS.includes(pathname) || EDIT_TASK_REGEX.test(pathname);

  if (isModalPage) {
    // For modal pages, we don't want the default template animation.
    // The page itself will handle its entry/exit animation.
    return <div>{children}</div>;
  }

  return (
    <motion.div
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'tween', ease: 'easeOut', duration: 0.35 }}
    >
      {children}
    </motion.div>
  );
}
