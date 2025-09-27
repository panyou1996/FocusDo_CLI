import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task, TaskList } from '@/lib/types';
import { TaskCard } from '@/components/tasks/TaskCard';
import { format, parseISO } from 'date-fns';

interface TimelineItemProps {
  item: Task;
  isFirst: boolean;
  isLast: boolean;
  isOverdue: boolean;
  lists: TaskList[];
  updateTask: (taskId: string, updatedTask: Partial<Task>) => void;
  [key: string]: any; // Accept all other taskActions
}

// Simplified display for collapsed view
const CollapsedTaskView = ({ task, onToggleCompleted, onClick }: { task: Task, onToggleCompleted: () => void, onClick: () => void }) => {
  const timeDisplay = React.useMemo(() => {
    if (!task.startTime) return null;
    return task.startTime;
  }, [task.startTime]);

  return (
    <div className="w-full relative py-2 cursor-pointer" onClick={onClick}>
      <div className="flex items-start">
        <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              id={`task-collapsed-${task.id}`}
              checked={task.isCompleted}
              onCheckedChange={onToggleCompleted}
              className="w-5 h-5 mt-0.5 rounded-full data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-primary/50"
            />
        </div>
        <div className="flex-grow ml-3 min-w-0">
          <p className={cn('font-medium text-foreground truncate', task.isCompleted && 'text-muted-foreground line-through')}>
            {task.title}
          </p>
          {timeDisplay && (
            <p className={cn('text-xs text-muted-foreground')}>
              {timeDisplay}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export const TimelineItem: React.FC<TimelineItemProps> = ({ item, isFirst, isLast, isOverdue, lists, updateTask, ...taskActions }) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
    return <div className="h-12 w-px bg-primary/50" />;
  };

  return (
    <motion.div className={containerClasses}>
      <div className="flex flex-col items-center self-stretch w-12 mr-4 z-10">
        <div className={cn('flex-grow w-px bg-primary/50', { 'opacity-0': isFirst })} />
        {renderCircle()}
        {renderBottomConnector()}
      </div>
      <div className="flex-grow min-h-[4rem] pt-1 pb-4 w-full">
        {isExpanded ? (
          <TaskCard 
            task={item} 
            list={lists.find(l => l.id === item.listId)}
            onUpdate={updateTask}
            onToggleCompleted={(id) => updateTask(id, { isCompleted: !item.isCompleted })}
            view="detail"
            {...taskActions} 
          />
        ) : (
          <CollapsedTaskView 
            task={item} 
            onClick={() => setIsExpanded(true)} 
            onToggleCompleted={() => updateTask(item.id, { isCompleted: !item.isCompleted })}
          />
        )}
      </div>
    </motion.div>
  );
};