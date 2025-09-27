import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task } from '@/lib/types';
import { TimelineTaskCard } from '@/components/timeline/TimelineTaskCard';

interface TimelineItemProps {
  item: Task;
  isFirst: boolean;
  isLast: boolean;
  isOverdue: boolean;
  updateTask: (taskId: string, updatedTask: Partial<Task>) => void;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ item, isFirst, isLast, isOverdue, updateTask }) => {

  const containerClasses = cn('relative flex items-start', {
    'opacity-60 saturate-50': item.isCompleted,
  });

  const renderCircle = () => {
    const circleClasses = cn('flex-shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center', {
      'border': !item.isCompleted,
      'bg-primary': item.isCompleted,
      'border-destructive animate-slow-glow': isOverdue,
    });

    const borderColor = item.isFixed && !item.isCompleted 
      ? `hsla(var(--primary), 0.7)` 
      : `hsl(var(--primary))`;

    return (
      <div className={circleClasses} style={{ borderColor: isOverdue ? undefined : borderColor }}>
        {item.isCompleted && <Check className="w-3 h-3 text-primary-foreground" />}
      </div>
    );
  };

  const renderBottomConnector = () => {
    if (isLast) return <div className="flex-grow w-px" />;

    // Always return a fixed-height connector
    return <div className="h-12 w-px bg-primary/50" />;
  };

  return (
    <motion.div className={containerClasses}>
      <div className="flex flex-col items-center self-stretch w-12 mr-4 z-10">
        <div className={cn('flex-grow w-px bg-primary/50', { 'opacity-0': isFirst })} />
        {renderCircle()}
        {renderBottomConnector()}
      </div>
      <div className="flex-grow min-h-[4rem] pt-1 pb-4">
        <TimelineTaskCard task={item} isOverdue={isOverdue} updateTask={updateTask} />
      </div>
    </motion.div>
  );
};