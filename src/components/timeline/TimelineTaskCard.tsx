
'use client';

import React from 'react';
import { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import { format, parseISO, isBefore, startOfToday, differenceInDays } from 'date-fns';

interface TimelineTaskCardProps {
  task: Task;
  isOverdue: boolean;
  updateTask: (taskId: string, updatedTask: Partial<Task>) => void;
}

export const TimelineTaskCard: React.FC<TimelineTaskCardProps> = ({ task, isOverdue, updateTask }) => {

  const toggleSubtask = (subtaskId: string) => {
    const newSubtasks = task.subtasks?.map(sub => 
      sub.id === subtaskId ? { ...sub, isCompleted: !sub.isCompleted } : sub
    );
    updateTask(task.id, { subtasks: newSubtasks });
  };

  const timeDisplay = task.dueDate ? format(parseISO(task.dueDate), 'HH:mm') : '--:--';
  let delayMessage = '';

  if (isOverdue) {
    const daysDelayed = differenceInDays(startOfToday(), parseISO(task.dueDate as string));
    if (daysDelayed > 0) {
      delayMessage = ` (delayed ${daysDelayed} day${daysDelayed > 1 ? 's' : ''})`;
    }
  }

  return (
    <div className="w-full rounded-lg custom-card-bg border border-border/50 p-3 pr-4 relative overflow-hidden">
      <div className="flex items-start">
        <Checkbox
          id={`task-${task.id}`}
          checked={task.isCompleted}
          onCheckedChange={() => updateTask(task.id, { isCompleted: !task.isCompleted })}
          className="w-5 h-5 mt-0.5 rounded-full data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-primary/50"
        />
        <div className="flex-grow ml-3 min-w-0">
          <div className="relative">
            <p className={cn('font-medium text-foreground truncate', task.isCompleted && 'text-muted-foreground')}>
              {task.title}
            </p>
            <motion.div
              className="absolute top-1/2 left-0 h-0.5 bg-muted-foreground"
              initial={{ width: 0 }}
              animate={{ width: task.isCompleted ? '100%' : 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            />
          </div>
          <p className={cn('text-sm', isOverdue && !task.isCompleted ? 'font-semibold text-destructive' : 'text-muted-foreground')}>
            {timeDisplay}
            {delayMessage && <span className="font-normal">{delayMessage}</span>}
          </p>
        </div>
      </div>

      {task.subtasks && task.subtasks.length > 0 && (
        <div className="pl-8 mt-2 space-y-2">
          {task.subtasks.map(subtask => (
            <div key={subtask.id} className="flex items-center gap-2">
              <Checkbox
                id={`subtask-${task.id}-${subtask.id}`}
                checked={subtask.isCompleted}
                onCheckedChange={() => toggleSubtask(subtask.id)}
                className="w-4 h-4 rounded-sm data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-primary/40"
              />
              <label
                htmlFor={`subtask-${task.id}-${subtask.id}`}
                className={cn('text-sm', subtask.isCompleted && 'line-through text-muted-foreground')}
              >
                {subtask.title}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
