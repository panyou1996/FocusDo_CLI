
import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task, TaskList } from '@/lib/types';
import { TaskCard } from '@/components/tasks/TaskCard';

interface TimelineItemProps {
  item: Task;
  isFirst: boolean;
  isLast: boolean;
  isOverdue: boolean;
  lists: TaskList[];
  updateTask: (taskId: string, updatedTask: Partial<Task>) => void;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ item, isFirst, isLast, isOverdue, lists, updateTask }) => {

  const containerClasses = cn('relative flex', {
    'opacity-60 saturate-50': item.isCompleted,
  });

  const renderCircle = () => {
    const circleClasses = cn(
      'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer',
      {
        'border-2': !item.isCompleted,
        'bg-primary': item.isCompleted,
        'border-destructive animate-slow-glow': isOverdue && !item.isCompleted,
        'border-primary': !isOverdue && !item.isCompleted,
      }
    );

    return (
      <div 
        className={circleClasses}
        onClick={(e) => {
          e.stopPropagation();
          updateTask(item.id, { isCompleted: !item.isCompleted });
        }}
      >
        {item.isCompleted && <Check className="w-4 h-4 text-primary-foreground" />}
      </div>
    );
  };

  const renderLine = () => {
      const lineClasses = cn("absolute w-0.5 h-full left-[27px] -z-10", {
        'bg-primary/30': !isOverdue,
        'bg-destructive/30': isOverdue
    });
    return <div className={lineClasses} />
  }

  return (
    <motion.div className={containerClasses} layout>
        <div className="w-24 flex-shrink-0 flex items-start justify-start relative">
            {renderLine()}
            <div className="absolute top-2.5 left-[16px]">
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
          />
      </div>
    </motion.div>
  );
};