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

  // For modal pages that manage their own animation (like the slide-up overlays),
  // we don't want the default template animation to conflict.
  // By returning a simple div, we pass control to the page component itself.
  if (isModalPage) {
    return <div>{children}</div>;
  }

  // For all other standard pages, apply the default fade-in-up animation.
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
