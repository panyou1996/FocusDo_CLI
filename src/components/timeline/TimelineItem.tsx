// src/components/timeline/TimelineItem.tsx
import React from 'react';
// import { Task } from '@/lib/types'; // Assuming type definition, will uncomment later
import { TaskCard } from '@/components/tasks/TaskCard';

// Define will be passed to the component's props type
interface TimelineItemProps {
  item: any; // Will be a task object or 'coffee'/'gap' marker
  isFirst: boolean;
  isLast: boolean;
  isOverdue: boolean;
  // ... other necessary props
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ item, isFirst, isLast, isOverdue }) => {
  const isTask = typeof item === 'object' && item !== null && 'id' in item;

  return (
    <div className="relative flex items-start">
      {/* Left side: Timeline visual elements (circle, connecting line) */}
      <div className="flex flex-col items-center self-stretch w-12 mr-4">
        {/* Top connecting line */}
        <div className={`flex-grow w-0.5 bg-slate-300 ${isFirst ? 'opacity-0' : ''}`} />
        
        {/* Circle (will vary based on state) */}
        <div className="flex-shrink-0 w-4 h-4 border-2 rounded-full border-primary" />

        {/* Bottom connecting line (will vary based on duration and state) */}
        <div className={`flex-grow w-0.5 bg-slate-300 ${isLast ? 'opacity-0' : ''}`} />
      </div>

      {/* Right side: Content area (TaskCard or other) */}
      <div className="flex-grow pt-1 pb-4">
        {isTask ? <TaskCard task={item} /> : (
          <div className="h-16"> {/* Placeholder for coffee/gap */}
            {/* Coffee/Gap visual elements will be rendered here */}
          </div>
        )}
      </div>
    </div>
  );
};
