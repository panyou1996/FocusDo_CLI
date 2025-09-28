
import React, { useState } from 'react';
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
  [key: string]: any; // Accept all other taskActions
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ item, isFirst, isLast, isOverdue, lists, updateTask, ...taskActions }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const containerClasses = cn('relative flex items-start', {
    'opacity-60 saturate-50': item.isCompleted,
  });

  const renderCircle = () => {
    const circleClasses = cn('flex-shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center cursor-pointer', {
      'border': !item.isCompleted,
      'bg-primary': item.isCompleted,
      'border-destructive animate-slow-glow': isOverdue,
    });

    const borderColor = item.isFixed && !item.isCompleted 
      ? `hsla(var(--primary), 0.7)` 
      : `hsl(var(--primary))`;

    return (
      <div 
        className={circleClasses}
        style={{ borderColor: isOverdue ? undefined : borderColor }}
        onClick={(e) => {
          e.stopPropagation();
          updateTask(item.id, { isCompleted: !item.isCompleted });
        }}
      >
        {item.isCompleted && <Check className="w-3 h-3 text-primary-foreground" />}
      </div>
    );
  };

  const renderBottomConnector = () => {
    if (isLast) return <div className="flex-grow w-px" />;
    return <div className="flex-grow w-px bg-primary/30" />;
  };

  return (
    <motion.div className={containerClasses} layout>
      <div className="flex flex-col items-center self-stretch w-12 mr-4 z-10 pt-4">
        {renderCircle()}
        {renderBottomConnector()}
      </div>
      <div className="flex-grow pb-6 w-full" onClick={() => setIsExpanded(!isExpanded)}>
          <TaskCard 
            task={item} 
            list={lists.find(l => l.id === item.listId)}
            onUpdate={updateTask}
            onToggleCompleted={(id) => updateTask(id, { isCompleted: !item.isCompleted })}
            view={isExpanded ? "detail" : "compact"}
            hideCheckbox={true}
            {...taskActions} 
          />
      </div>
    </motion.div>
  );
};