
'use client';

import { useRef, useState } from 'react';

interface LongPressOptions {
  onLongPress: (e: React.PointerEvent) => void;
  onClick?: (e: React.PointerEvent) => void;
  ms?: number;
}

export function useLongPress({ onLongPress, onClick, ms = 300 }: LongPressOptions) {
  const [isPressing, setIsPressing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  const start = (e: React.PointerEvent) => {
    isLongPress.current = false;
    setIsPressing(true);
    timerRef.current = setTimeout(() => {
      onLongPress(e);
      isLongPress.current = true;
    }, ms);
  };

  const end = (e: React.PointerEvent) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (onClick && !isLongPress.current) {
      onClick(e);
    }
    setIsPressing(false);
  };
  
  const cancel = () => {
    if (timerRef.current) {
        clearTimeout(timerRef.current);
    }
    setIsPressing(false);
  }

  return {
    isPressing,
    handlers: {
      onPointerDown: start,
      onPointerUp: end,
      onPointerLeave: cancel,
    },
  };
}
