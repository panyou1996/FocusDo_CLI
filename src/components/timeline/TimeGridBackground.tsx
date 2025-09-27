// src/components/timeline/TimeGridBackground.tsx
'use client';

import React, { useState, useRef, useLayoutEffect } from 'react';

const PIXELS_PER_HOUR = 80; // Example value

export const TimeGridBackground: React.FC = () => {
  const [height, setHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const parentElement = containerRef.current?.parentElement;
    if (!parentElement) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        setHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(parentElement);

    return () => resizeObserver.disconnect();
  }, []);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div ref={containerRef} className="absolute top-0 left-0 w-full h-full -z-10" style={{ height: `${height}px` }}>
      {hours.map(hour => (
        <div
          key={hour}
          className="absolute w-full"
          style={{ top: `${hour * PIXELS_PER_HOUR}px` }}
        >
          <div className="flex items-center">
            <div className="w-12 text-xs text-right pr-2 text-muted-foreground">
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
            </div>
            <div className="flex-grow h-px border-t border-dashed border-slate-200 dark:border-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
};
