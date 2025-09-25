
"use client";

import * as React from "react";
import { SlidersHorizontal, Plus } from "lucide-react";
import { TaskCard } from "@/components/tasks/TaskCard";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Task } from "@/lib/types";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getIcon } from "@/lib/icon-utils";
import Link from 'next/link';
import Image from "next/image";


interface GroupedTasks {
  expired: Task[];
  upcoming: Task[];
  done: Task[];
}

const TaskGroup = ({ title, tasks, status, ...props }: { title: string; tasks: Task[]; status: 'expired' | 'upcoming' | 'done', [key: string]: any }) => {
  const { lists } = useAppContext();
  if (tasks.length === 0) return null;
  return (
    <div>
      <h2 className="text-base font-semibold text-muted-foreground mb-2 px-1">{title}</h2>
      <div className="space-y-3">
        {tasks.map((task) => {
          const list = lists.find((l) => l.id === task.listId);
          if (!list) return null;
          const ListIcon = getIcon(list.icon as string);
          return <TaskCard key={task.id} task={task} list={{...list, icon: ListIcon }} status={status} {...props} />;
        })}
      </div>
    </div>
  );
};

const EmptyState = () => (
    <div className="text-center py-10">
        <div className="relative w-56 h-56 mx-auto mb-4">
            <Image 
                src="/images/illustration-today-complete.svg" 
                alt="All tasks complete" 
                width={224}
                height={224}
                className="object-contain"
            />
        </div>
        <h3 className="text-lg font-semibold">All Done for Today!</h3>
        <p className="text-muted-foreground mt-1">You've completed all your tasks. Enjoy your day!</p>
        <Link href="/add-task" className='mt-4 inline-block'>
            <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add New Task
            </Button>
        </Link>
    </div>
);


export default function TodayPage() {
  const [view, setView] = React.useState<"compact" | "detail">("compact");
  const { tasks, updateTask, deleteTask, currentUser } = useAppContext();
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
  
  const handleToggleFixed = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateTask(taskId, { isFixed: !task.isFixed });
    }
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
    onToggleFixed: handleToggleFixed,
    onToggleCompleted: handleToggleCompleted
  };
  
  const renderContent = () => {
    if (!isClient) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      );
    }

    if (tasks.filter(t => t.isMyDay).length === 0) {
        return <EmptyState />;
    }

    return (
      <div className="space-y-4">
         <TaskGroup title="Expired" tasks={expired} status="expired" {...cardProps} />
         <TaskGroup title="Upcoming" tasks={upcoming} status="upcoming" {...cardProps} />
         <TaskGroup title="Done" tasks={done} status="done" {...cardProps} />
      </div>
    );
  };


  return (
    <div className="px-5">
      <header className="pt-10 pb-4 h-[80px] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={currentUser?.avatarUrl} alt={currentUser?.name} />
            <AvatarFallback>{currentUser?.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Day</h1>
            <p className="text-sm text-muted-foreground">{`${dateString}, ${dayString}`}</p>
          </div>
        </div>
                
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon">
            <SlidersHorizontal className="w-6 h-6" strokeWidth={1.5} />
          </Button>
        </div>
      </header>

      <div className="flex gap-2 mb-4">
        <Tabs value={view} onValueChange={(value) => setView(value as "compact" | "detail")} className="flex-grow">
          <TabsList className="grid w-full grid-cols-2 h-11">
            <TabsTrigger value="compact">Compact</TabsTrigger>
            <TabsTrigger value="detail">Detail</TabsTrigger>
          </TabsList>
        </Tabs>
        <Link href="/add-task">
          <Button size="icon" className="h-11 w-11 rounded-md flex-shrink-0">
            <Plus className="w-6 h-6" />
          </Button>
        </Link>
      </div>
      
      {renderContent()}
    </div>
  );
}

    

    