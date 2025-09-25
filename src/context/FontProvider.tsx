
'use client';

import * as React from 'react';
import { useAppContext } from './AppContext';
import { cn } from '@/lib/utils';

export function FontProvider({ children }: { children: React.ReactNode }) {
  const { fontStyle } = useAppContext();

  React.useEffect(() => {
    const body = document.body;
    body.classList.remove('font-sans', 'font-serif', 'font-mono');
    body.classList.add(`font-${fontStyle}`);
  }, [fontStyle]);

  return <>{children}</>;
}
