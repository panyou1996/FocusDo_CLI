
'use client';

import * as React from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/types';
import { useAppContext } from '@/context/AppContext';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { getIcon } from '@/lib/icon-utils';

const TaskCardSkeleton = () => (
  <div className="w-full rounded-2xl custom-card py-3 px-4 flex items-center">
    <Skeleton className="w-5 h-5 rounded-full" />
    <Skeleton className="w-8 h-8 rounded-full ml-4" />
    <div className="flex-grow ml-1 min-w-0">
      <Skeleton className="h-5 w-3/4 rounded" />
      <Skeleton className="h-4 w-1/4 mt-1 rounded" />
    </div>
    <Skeleton className="w-5 h-5 rounded-md ml-2" />
  </div>
);

export default function CalendarPage() {
  const { tasks, updateTask, deleteTask, lists } = useAppContext();
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [isClient, setIsClient] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const processedTasks = React.useMemo(() => {
    if (!isClient) return [];
    // In a dedicated calendar page, you might want different filtering than inbox
    return tasks.filter(task => !task.isCompleted);
  }, [tasks, isClient]);

  const tasksForSelectedDate = React.useMemo(() => {
    if (!date || !isClient) return [];
    const formattedDate = format(date, 'yyyy-MM-dd');
    return processedTasks.filter(task => task.dueDate === formattedDate);
  }, [date, processedTasks, isClient]);

  const tasksPerDay = React.useMemo(() => {
    if (!isClient) return {};
    const counts: { [key: string]: { total: number; important: number } } = {};

    processedTasks.forEach(task => {
      if (task.dueDate) {
        if (!counts[task.dueDate]) {
          counts[task.dueDate] = { total: 0, important: 0 };
        }
        counts[task.dueDate].total++;
        if (task.isImportant) {
          counts[task.dueDate].important++;
        }
      }
    });
    return counts;
  }, [processedTasks, isClient]);

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
  };

  const handleEditTask = (taskId: string) => {
    router.push(`/edit-task/${taskId}`);
  };

  const handleUpdateTask = (taskId: string, updatedFields: Partial<Task>) => {
    updateTask(taskId, updatedFields);
  };

  const handleToggleImportant = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateTask(taskId, { isImportant: !task.isImportant });
    }
  };

  const handleToggleMyDay = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateTask(taskId, { isMyDay: !task.isMyDay });
    }
  };
  
  const handleToggleFixed = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateTask(taskId, { isFixed: !task.isFixed });
    }
  };

  const handleToggleCompleted = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateTask(taskId, { isCompleted: !task.isCompleted });
    }
  };

  const cardProps = {
    view: 'compact' as const,
    onDelete: handleDeleteTask,
    onEdit: handleEditTask,
    onUpdate: handleUpdateTask,
    onToggleImportant: handleToggleImportant,
    onToggleMyDay: handleToggleMyDay,
    onToggleFixed: handleToggleFixed,
    onToggleCompleted: handleToggleCompleted,
  };

  return (
    <div className='px-5'>
      <header className="pt-10 pb-4 h-[80px] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-7 h-7" strokeWidth={2} />
            <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
          </div>
      </header>

      <div className="mt-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-2xl custom-card w-full"
          tasksPerDay={isClient ? tasksPerDay : {}}
          components={{
            IconLeft: () => <ChevronLeft className="h-4 w-4" />,
            IconRight: () => <ChevronRight className="h-4 w-4" />,
          }}
          disabled={!isClient}
        />
      </div>
      <div className="space-y-3 mt-4">
        <h2 className="text-base font-semibold text-muted-foreground mt-4 px-1">
            Tasks for {date ? format(date, 'MMMM d') : '...'}
        </h2>
        {!isClient ? (
          <div className="space-y-3">
            <TaskCardSkeleton />
          </div>
        ) : tasksForSelectedDate.length > 0 ? (
          <AnimatePresence>
            {tasksForSelectedDate.map(task => {
              const list = lists.find(l => l.id === task.listId);
              if (!list) return null;
              const status = task.isCompleted ? 'done' : 'upcoming';

              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  list={list}
                  {...cardProps}
                  status={status}
                />
              );
            })}
          </AnimatePresence>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            No tasks for this day.
          </p>
        )}
      </div>
    </div>
  );
}
    