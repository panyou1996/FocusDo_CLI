
"use client";

import * as React from "react";
import { Sun, LayoutGrid, List, SlidersHorizontal, Wand2 } from "lucide-react";
import { TaskCard } from "@/components/tasks/TaskCard";
import { lists } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Task } from "@/lib/types";
import { useTasks } from "@/context/TaskContext";
import { useRouter } from "next/navigation";

interface GroupedTasks {
  expired: Task[];
  upcoming: Task[];
  done: Task[];
}

const TaskGroup = ({ title, tasks, ...props }: { title: string; tasks: Task[]; [key: string]: any }) => {
  if (tasks.length === 0) return null;
  return (
    <div>
      <h2 className="text-lg font-semibold text-muted-foreground mb-2 px-1">{title}</h2>
      <div className="space-y-3">
        {tasks.map((task) => {
          const list = lists.find((l) => l.id === task.listId);
          if (!list) return null;
          return <TaskCard key={task.id} task={task} list={list} {...props} />;
        })}
      </div>
    </div>
  );
};

export default function TodayPage() {
  const [view, setView] = React.useState<"compact" | "detail">("compact");
  const { tasks, updateTask, deleteTask } = useTasks();
  const [groupedTasks, setGroupedTasks] = React.useState<GroupedTasks>({ expired: [], upcoming: [], done: [] });
  const [isClient, setIsClient] = React.useState(false);
  const router = useRouter();
  
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
  const dayString = today.toLocaleDateString('en-US', { weekday: 'short' }).replace('.', '');

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
  };

  const handleEditTask = (taskId: string) => {
    router.push(`/edit-task/${taskId}`);
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

  const handleToggleCompleted = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateTask(taskId, { isCompleted: !task.isCompleted });
    }
  };

  const handleUpdateTask = (taskId: string, updatedFields: Partial<Task>) => {
    updateTask(taskId, updatedFields);
  };


  React.useEffect(() => {
    if (!isClient) return;

    const myDayTasks = tasks.filter(task => task.isMyDay);
    
    const groupAndSortTasks = (tasksToSort: Task[]) => {
      const now = new Date();
      const done: Task[] = [];
      const expired: Task[] = [];
      const upcoming: Task[] = [];

      tasksToSort.forEach(task => {
        if (task.isCompleted) {
          done.push(task);
          return;
        }
        
        if (task.startTime) {
          const [hours, minutes] = task.startTime.split(':').map(Number);
          const taskEndTime = new Date(now);
          taskEndTime.setHours(hours, minutes + (task.duration || 0), 0, 0);

          if (taskEndTime < now) {
            expired.push(task);
          } else {
            upcoming.push(task);
          }
        } else {
          upcoming.push(task);
        }
      });

      const sortFn = (a: Task, b: Task) => {
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;
        return a.startTime.localeCompare(b.startTime);
      };

      return {
        expired: expired.sort(sortFn),
        upcoming: upcoming.sort(sortFn),
        done: done.sort(sortFn)
      };
    };
    
    setGroupedTasks(groupAndSortTasks(myDayTasks));
  }, [tasks, isClient]);
  
  const { expired, upcoming, done } = groupedTasks;

  const cardProps = {
    view,
    onDelete: handleDeleteTask,
    onEdit: handleEditTask,
    onUpdate: handleUpdateTask,
    onToggleImportant: handleToggleImportant,
    onToggleMyDay: handleToggleMyDay,
    onToggleCompleted: handleToggleCompleted
  };

  return (
    <div className="px-5">
      <header className="pt-10 pb-4 h-[100px] flex justify-between items-center relative">
        <div className="flex items-center gap-3">
          <Sun className="w-7 h-7 text-orange-400" strokeWidth={2} />
          <div>
            <h1 className="text-[28px] font-bold text-foreground">My Day</h1>
            <p className="text-sm text-muted-foreground">{`${dateString}, ${dayString}`}</p>
          </div>
        </div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-3">
          <div className="flex bg-secondary p-1 rounded-md">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8",
                view === "compact" && "bg-card shadow-sm"
              )}
              onClick={() => setView("compact")}
            >
              <LayoutGrid className="w-5 h-5" strokeWidth={1.5} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8",
                view === "detail" && "bg-card shadow-sm"
              )}
              onClick={() => setView("detail")}
            >
              <List className="w-5 h-5" strokeWidth={1.5} />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" className="h-8 w-8 bg-secondary">
            <SlidersHorizontal className="w-5 h-5" strokeWidth={1.5} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 bg-secondary">
            <Wand2 className="w-5 h-5 text-primary" strokeWidth={1.5} />
          </Button>
        </div>
      </header>

      <div className="space-y-6">
         <TaskGroup title="Expired" tasks={expired} {...cardProps} />
         <TaskGroup title="Upcoming" tasks={upcoming} {...cardProps} />
         <TaskGroup title="Done" tasks={done} {...cardProps} />
      </div>
    </div>
  );
}
