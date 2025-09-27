// src/components/timeline/TimeMarker.tsx
'use client';

import React, { useState, useEffect } from 'react';

const PIXELS_PER_HOUR = 80; // Same as in TimeGridBackground

export const TimeMarker: React.FC = () => {
  const [top, setTop] = useState(0);

  useEffect(() => {
    const updatePosition = () => {
      const now = new Date();
      const minutesFromStartOfDay = now.getHours() * 60 + now.getMinutes();
      setTop(minutesFromStartOfDay * (PIXELS_PER_HOUR / 60));
    };

    updatePosition();
    const intervalId = setInterval(updatePosition, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="absolute w-full" style={{ top: `${top}px`, zIndex: 1 }}>
      <div className="flex items-center">
        <div className="w-12">
          <div className="float-right mr-[-7px] h-3.5 w-3.5 rounded-full bg-red-500 border-2 border-background animate-pulse" />
        </div>
        <div className="flex-grow h-px bg-red-500" />
      </div>
    </div>
  );
};
