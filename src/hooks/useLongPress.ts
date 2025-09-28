'use client';

import { useRef, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface LongPressOptions {
  onLongPress: (e: React.PointerEvent) => void;
  onClick?: (e: React.PointerEvent) => void;
  ms?: number;
}

export function useLongPress({ onLongPress, onClick, ms = 300 }: LongPressOptions) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);
  const isPointerDown = useRef(false);
  const [isLongPressActive, setIsLongPressActive] = useState(false); // New state

  const start = useCallback((e: React.PointerEvent) => {
    isPointerDown.current = true;
    isLongPress.current = false;
    setIsLongPressActive(false); // Reset on new press
    
    // Check if the event target is interactive
    if ((e.target as HTMLElement).closest('[data-interactive]')) {
      return;
    }

    e.persist(); // Persist the event to use it in the timeout

    timerRef.current = setTimeout(() => {
      if (isPointerDown.current) { // Ensure pointer is still down
        isLongPress.current = true;
        setIsLongPressActive(true); // Set active when long press is detected
        if (Capacitor.isPluginAvailable('Haptics')) {
          Haptics.impact({ style: ImpactStyle.Medium });
        }
        onLongPress(e);
      }
    }, ms);
  }, [ms, onLongPress]);

  const end = useCallback((e: React.PointerEvent) => {
    isPointerDown.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (onClick && !isLongPress.current) {
        // Only fire click if it wasn't a long press
        onClick(e);
    }
    setIsLongPressActive(false); // Reset when pointer is up
    // Reset long press flag after a short delay to prevent race conditions with click
    setTimeout(() => { isLongPress.current = false; }, 50);
  }, [onClick]);
  
  const cancel = useCallback(() => {
    isPointerDown.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsLongPressActive(false); // Reset on cancel
  }, []);

  return {
    handlers: {
      onPointerDown: start,
      onPointerUp: end,
      onPointerLeave: cancel,
    },
    isLongPressActive, // Return the new state
  };
}