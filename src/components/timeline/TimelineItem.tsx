
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task, TaskList } from '@/lib/types';
import { TaskCard } from '@/components/tasks/TaskCard';
import { useLongPress } from '@/hooks/useLongPress';
import { parse, isPast, addMinutes } from 'date-fns';

interface TimelineItemProps {
  item: Task;
  isFirst: boolean;
  isLast: boolean;
  lists: TaskList[];
  updateTask: (taskId: string, updatedTask: Partial<Task>) => void;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ item, isFirst, isLast, lists, updateTask }) => {

  const longPressHandlers = useLongPress({
    onLongPress: (e) => {
      e.stopPropagation();
      updateTask(item.id, { isFixed: !item.isFixed });
    },
    onClick: (e) => {
      e.stopPropagation();
      updateTask(item.id, { isCompleted: !item.isCompleted });
    },
  });

  const containerClasses = cn('relative flex', {
    'opacity-60 saturate-50': item.isCompleted,
  });

  const startTime = item.startTime ? parse(item.startTime, 'HH:mm', new Date()) : null;
  const isTaskStartTimePast = startTime ? isPast(startTime) : false;
  const taskEndTime = startTime && item.duration ? addMinutes(startTime, item.duration) : null;
  const isDelayed = taskEndTime ? isPast(taskEndTime) : false;

  let circleOutlineColorClass = 'border-blue-500';
  let lineColorClass = 'bg-blue-300';

  if (item.isCompleted) {
    circleOutlineColorClass = 'border-gray-500';
    lineColorClass = 'bg-gray-300';
  } else if (isDelayed) {
    circleOutlineColorClass = 'border-red-500';
    lineColorClass = isTaskStartTimePast ? 'bg-gray-300' : 'bg-blue-300';
  } else if (isTaskStartTimePast) {
    circleOutlineColorClass = 'border-gray-500';
    lineColorClass = 'bg-gray-300';
  }

  const renderCircle = () => {
    const circleClasses = cn(
      'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer border-[3px]',
      circleOutlineColorClass,
      { 'bg-gray-500': item.isCompleted }
    );

    const contentVariants = {
        initial: { opacity: 0, scale: 0.5 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.5 },
    }

    return (
      <motion.div 
        className={circleClasses}
        {...longPressHandlers.handlers}
        whileTap={{ scale: 1.2 }} // Pop animation on tap/press
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
          <AnimatePresence mode="wait">
            {item.isCompleted && (
                <motion.div
                    key="check"
                    variants={contentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                >
                    <Check className="w-4 h-4 text-white" />
                </motion.div>
            )}

            {!item.isCompleted && item.isFixed && (
                 <motion.div
                    key="fixed-indicator"
                    variants={contentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                    className="w-3 h-3 rounded-full border-2 border-dashed border-gray-500"
                 />
            )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const renderLineSegment = (position: 'top' | 'bottom') => {
    const segmentClasses = cn('absolute w-1 -z-10', lineColorClass);
    if (position === 'top') {
        return <div className={segmentClasses} style={{ left: '26px', top: 0, height: '10px' }} />;
    }
    if (position === 'bottom') {
        return <div className={segmentClasses} style={{ left: '26px', top: '34px', bottom: 0 }} />;
    }
    return null;
  };

  return (
    <motion.div className={containerClasses} layout>
        <div className="w-24 flex-shrink-0 flex items-start justify-start relative">
            {!isFirst && renderLineSegment('top')}
            {!isLast && renderLineSegment('bottom')}

            <div className="absolute top-2.5 left-[15px]">
              {renderCircle()}
            </div>

            {item.startTime && 
                <span className="text-sm text-muted-foreground absolute top-3 left-[52px]">{item.startTime}</span>
            }
        </div>
      <div className="flex-grow pb-6 w-full">
          <TaskCard 
            task={item} 
            list={lists.find(l => l.id === item.listId)}
            onUpdate={updateTask}
            isFoldable={true}
          />
      </div>
    </motion.div>
  );
};
