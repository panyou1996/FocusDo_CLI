
"use client";

import * as React from "react";
import { SlidersHorizontal, Plus, MoreHorizontal, Check, MoveRight, Trash } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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
import { isBefore, startOfToday } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";


interface GroupedTasks {
  leftover: Task[];
  expired: Task[];
  upcoming: Task[];
  done: Task[];
}

const TaskGroup = ({ title, tasks, status, children, ...props }: { title: string; tasks: Task[]; status: 'expired' | 'upcoming' | 'done' | 'leftover', children?: React.ReactNode, [key: string]: any }) => {
  const { lists } = useAppContext();
  if (tasks.length === 0) return null;
  
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07
      }
    },
    exit: { 
        opacity: 0,
        height: 0,
        transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  return (
    <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        exit="exit"
    >
      <div className="flex justify-between items-center mb-2 px-1">
        <h2 className="text-base font-semibold text-muted-foreground">{title}</h2>
        {children}
      </div>
      <motion.div 
        className="space-y-3"
        variants={containerVariants}
      >
        <AnimatePresence>
          {tasks.map((task) => {
            const list = lists.find((l) => l.id === task.listId);
            if (!list) return null;
            const ListIcon = getIcon(list.icon as string);
            return <TaskCard key={task.id} task={task} list={{...list, icon: ListIcon }} status={status} {...props} />;
          })}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

const EmptyState = () => (
    <motion.div 
      className="text-center py-10"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.3 } }}
    >
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, transition: { delay: 0.3, type: 'spring', stiffness: 200, damping: 15 } }}
        >
            <Image 
                src="/images/illustration-today-complete.svg" 
                alt="All tasks complete" 
                width={224}
                height={224}
                className="object-contain mx-auto mb-4"
            />
        </motion.div>
        <h3 className="text-lg font-semibold">All Done for Today!</h3>
        <p className="text-muted-foreground mt-1">You&apos;ve completed all your tasks. Enjoy your day!</p>
        <Link href="/add-task" className='mt-4 inline-block'>
            <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add New Task
            </Button>
        </Link>
    </motion.div>
);


export default function TodayPage() {
  const [view, setView] = React.useState<"compact" | "detail">("compact");
  const { tasks, updateTask, deleteTask, currentUser } = useAppContext();
  const [groupedTasks, setGroupedTasks] = React.useState<GroupedTasks>({ leftover: [], expired: [], upcoming: [], done: [] });
  const [isClient, setIsClient] = React.useState(false);
  const router = useRouter();
  
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
  const dayString = today.toLocaleDateString('en-US', { weekday: 'short' }).replace('.', '');

  const [isLeftoverVisible, setIsLeftoverVisible] = React.useState(true);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleUpdateMultipleTasks = (tasksToUpdate: Task[], updates: Partial<Task>) => {
    setIsLeftoverVisible(false);
    
    setTimeout(() => {
        tasksToUpdate.forEach(task => {
            updateTask(task.id, updates);
        });
        // We might not need to set it back to true immediately, 
        // as the group will disappear if the `leftover` array becomes empty on next render.
        // But if we want it to reappear for a new set of leftover tasks, this is needed.
        // setIsLeftoverVisible(true);
    }, 300); // Corresponds to exit animation duration
  };

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
      updateTask(taskId, { isMyDay: !task.isMyDay, myDaySetDate: new Date().toISOString() });
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

    const groupAndSortTasks = (tasksToSort: Task[]) => {
        const now = new Date();
        const todayStart = startOfToday();
        const leftover: Task[] = [];
        const done: Task[] = [];
        const expired: Task[] = [];
        const upcoming: Task[] = [];

        tasksToSort.forEach(task => {
            if (task.isMyDay) {
                if (task.isCompleted) {
                    done.push(task);
                    return;
                }
                
                // Check if the task was for a day before today
                const myDayDate = task.myDaySetDate ? new Date(task.myDaySetDate) : new Date(task.createdAt);
                if (isBefore(myDayDate, todayStart)) {
                    leftover.push(task);
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
            }
        });
      
        const sortFn = (a: Task, b: Task) => {
          if (!a.startTime) return 1;
          if (!b.startTime) return -1;
          return a.startTime.localeCompare(b.startTime);
        };

        return {
            leftover: leftover.sort(sortFn),
            expired: expired.sort(sortFn),
            upcoming: upcoming.sort(sortFn),
            done: done.sort(sortFn)
        };
    };
    
    setGroupedTasks(groupAndSortTasks(tasks));
  }, [tasks, isClient]);
  
  const { leftover, expired, upcoming, done } = groupedTasks;

  // Reset visibility if `leftover` tasks reappear
  React.useEffect(() => {
    if (leftover.length > 0 && !isLeftoverVisible) {
        setIsLeftoverVisible(true);
    }
  }, [leftover, isLeftoverVisible]);

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

    if (leftover.length === 0 && expired.length === 0 && upcoming.length === 0) {
        return <EmptyState />;
    }

    return (
      <div className="space-y-4">
        <AnimatePresence>
            {isLeftoverVisible && leftover.length > 0 && (
                <TaskGroup title="Leftover" tasks={leftover} status="leftover" {...cardProps}>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4"/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-auto p-1">
                            <div className="flex flex-col gap-1">
                                <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => handleUpdateMultipleTasks(leftover, { isMyDay: true, myDaySetDate: new Date().toISOString() })}>
                                    <MoveRight className="w-4 h-4" /> Move all to Today
                                </Button>
                                <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => handleUpdateMultipleTasks(leftover, { isCompleted: true })}>
                                    <Check className="w-4 h-4" /> Complete all
                                </Button>
                                <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:text-destructive" onClick={() => handleUpdateMultipleTasks(leftover, { isMyDay: false })}>
                                    <Trash className="w-4 h-4" /> Remove all from My Day
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </TaskGroup>
            )}
        </AnimatePresence>
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
          <TabsList className="grid w-full grid-cols-2 h-11 rounded-[var(--radius)]">
            <TabsTrigger value="compact">Compact</TabsTrigger>
            <TabsTrigger value="detail">Detail</TabsTrigger>
          </TabsList>
        </Tabs>
        <Link href="/add-task" passHref>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Button size="icon" className="h-11 w-11 rounded-full flex-shrink-0">
              <Plus className="w-6 h-6" />
            </Button>
          </motion.div>
        </Link>
      </div>
      
      {renderContent()}
    </div>
  );
}
