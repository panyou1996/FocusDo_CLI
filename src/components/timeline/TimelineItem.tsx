import React from 'react';
import { motion } from 'framer-motion';
import { Check, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task } from '@/lib/types';
import { TimelineTaskCard } from '@/components/timeline/TimelineTaskCard';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const PIXELS_PER_MINUTE = 80 / 60;

interface TimelineItemProps {
  item: Task | { type: 'gap' | 'coffee'; duration?: number; id: string };
  isFirst: boolean;
  isLast: boolean;
  isOverdue: boolean;
  updateTask: (taskId: string, updatedTask: Partial<Task>) => void;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ item, isFirst, isLast, isOverdue, updateTask }) => {
  const isTask = 'title' in item;
  const { type } = 'type' in item ? item : { type: null };

  const containerClasses = cn('relative flex items-start', {
    'opacity-60 saturate-50': isTask && item.isCompleted,
  });

  const renderCircle = () => {
    if (!isTask) {
      if (type === 'coffee') {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center my-2">
                  <Coffee className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Coffee Time</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
      return <div className="flex-shrink-0 w-4 h-4" />; // Empty div for gaps
    }

    const circleClasses = cn('flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center', {
      'border-2': !item.isCompleted,
      
      'border-dashed': item.isFixed && !item.isCompleted,
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
    if (isLast) return <div className="flex-grow w-0.5" />;

    if (isTask && item.duration && item.duration > 0) {
      return (
        <div
          className="w-1 rounded-full bg-primary/50"
          style={{ height: `${Math.max(4, item.duration * PIXELS_PER_MINUTE)}px` }}
        />
      );
    }

    if (type === 'coffee') {
      return <div className="w-px border-l border-dashed border-slate-400 dark:border-slate-600" style={{ height: '3rem' }} />;
    }
    
    if (type === 'gap') {
        return <div className="w-px border-l border-dashed flex-grow" style={{ borderColor: 'hsla(var(--primary), 0.4)' }} />;
    }

    return <div className="flex-grow w-0.5 bg-slate-300 dark:bg-slate-700" />;
  };

  const renderContent = () => {
    if (isTask) {
      return <TimelineTaskCard task={item} isOverdue={isOverdue} updateTask={updateTask} />;
    }
    if (type === 'coffee') {
      return <div style={{ height: '4rem' }} />;
    }
    if (type === 'gap' && item.duration) {
      return <div style={{ height: `${item.duration * PIXELS_PER_MINUTE}px` }} />;
    }
    return null;
  };

  return (
    <motion.div className={containerClasses}>
      <div className="flex flex-col items-center self-stretch w-12 mr-4 z-10">
        <div className={cn('flex-grow w-0.5 bg-slate-300 dark:bg-slate-700', { 'opacity-0': isFirst })} />
        {renderCircle()}
        {renderBottomConnector()}
      </div>
      <div className="flex-grow min-h-[4rem] pt-1 pb-4">
        {renderContent()}
      </div>
    </motion.div>
  );
};
