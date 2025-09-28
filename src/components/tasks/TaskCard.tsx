'use client';

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Task, TaskList, Subtask } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, Calendar, Hourglass, Pencil } from "lucide-react";
import { format, parseISO, differenceInDays, isToday, isPast } from 'date-fns';
import { getIcon } from "@/lib/icon-utils";

interface TaskCardProps {
  task: Task;
  onUpdate: (taskId: string, updatedTask: Partial<Task>) => void;
  list?: TaskList;
}

const formatDueDate = (dueDate: string) => {
    const date = parseISO(dueDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize now to the start of the day
    const daysDiff = differenceInDays(date, now);

    if (isPast(date) && !isToday(date)) {
        const pastDays = Math.abs(daysDiff);
        return <span className="text-destructive">{pastDays} {pastDays === 1 ? 'day ago' : 'days ago'}</span>;
    }
    if (daysDiff === 0) return 'Today';
    if (daysDiff > 0 && daysDiff <= 7) {
        return `in ${daysDiff} ${daysDiff === 1 ? 'day' : 'days'}`;
    }
    return format(date, 'M/d');
};

export function TaskCard({ task, list, onUpdate }: TaskCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/edit-task/${task.id}`);
  };

  const handleSubtaskToggle = (e: React.MouseEvent, subtaskId: string) => {
    e.stopPropagation();
    const updatedSubtasks = task.subtasks?.map(st => 
        st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
    );
    onUpdate(task.id, { subtasks: updatedSubtasks });
  };

  const DetailRow = ({ icon: Icon, children }: { icon?: React.ElementType, children: React.ReactNode }) => (
    <div className="flex items-center text-sm text-muted-foreground min-h-[20px] gap-2">
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />}
      <div className="flex-grow">{children}</div>
    </div>
  );

  const ListIcon = list ? getIcon(list.icon) : Pencil;

  return (
    <div className={'w-full relative cursor-pointer'} onClick={handleCardClick}>
      <div className="flex items-start py-1">
        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
          {ListIcon && <ListIcon className="w-6 h-6" style={{ color: list?.color }} strokeWidth={1.5} />}
        </div>

        <div className="flex-grow ml-2 min-w-0 pt-1.5">
          <p className={cn('text-base font-medium text-foreground truncate', task.isCompleted && 'text-muted-foreground line-through')}>
              {task.title}
          </p>
          <p className="text-sm text-muted-foreground truncate min-h-[20px]">{task.description}</p>

          <div className="flex items-center gap-4 mt-1">
              {task.duration && task.duration > 0 && (
                  <DetailRow icon={Hourglass}>
                      <span>{`${task.duration} min`}</span>
                  </DetailRow>
              )}
              {task.dueDate && (
                  <DetailRow icon={Calendar}>
                      <span>{formatDueDate(task.dueDate)}</span>
                  </DetailRow>
              )}
          </div>

          {task.subtasks && task.subtasks.length > 0 && (
              <div className="space-y-1 mt-2">
                  {task.subtasks.map(subtask => (
                      <div key={subtask.id} className="flex items-center gap-2 cursor-default" data-interactive onClick={(e) => handleSubtaskToggle(e, subtask.id)}>
                          <Checkbox 
                              id={`subtask-cb-${subtask.id}`}
                              checked={subtask.isCompleted}
                              className="w-4 h-4 rounded-sm data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-primary/50"
                          />
                          <label htmlFor={`subtask-cb-${subtask.id}`} className={cn("text-sm", subtask.isCompleted && "line-through text-muted-foreground")}>
                              {subtask.title}
                          </label>
                      </div>
                  ))}
              </div>
          )}
        </div>
      </div>
    </div>
  );
}
