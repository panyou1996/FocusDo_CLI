
"use client";

import * as React from "react";
import { Inbox as InboxIcon, Filter, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { lists } from "@/lib/data";
import { TaskCard } from "@/components/tasks/TaskCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types";
import { useTasks } from "@/context/TaskContext";
import { format } from 'date-fns';


interface GroupedTasks {
  expired: Task[];
  upcoming: Task[];
  done: Task[];
}

const TaskGroup = ({ title, tasks, ...props }: { title: string, tasks: Task[], [key: string]: any }) => {
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


export default function InboxPage() {
  const { tasks, updateTask, deleteTask } = useTasks();
  const [selectedList, setSelectedList] = React.useState(lists[0].id);
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [groupedTasks, setGroupedTasks] = React.useState<GroupedTasks>({ expired: [], upcoming: [], done: [] });
  const [isClient, setIsClient] = React.useState(false);
  
  const tasksForSelectedDate = React.useMemo(() => {
    if (!date) return [];
    const formattedDate = format(date, 'yyyy-MM-dd');
    return tasks.filter(task => task.dueDate === formattedDate);
  }, [date, tasks]);

  const tasksPerDay = React.useMemo(() => {
    const counts: { [key: string]: number } = {};
    tasks.forEach(task => {
      if (task.dueDate) {
        counts[task.dueDate] = (counts[task.dueDate] || 0) + 1;
      }
    });
    return counts;
  }, [tasks]);


  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
  };

  const handleToggleImportant = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateTask(taskId, { ...task, isImportant: !task.isImportant });
    }
  };
  
  const handleToggleMyDay = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateTask(taskId, { ...task, isMyDay: !task.isMyDay });
    }
  };

  const handleToggleCompleted = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateTask(taskId, { ...task, isCompleted: !task.isCompleted });
    }
  };

  React.useEffect(() => {
    if(!isClient) return;

    const filteredTasks = tasks.filter(task => task.listId === selectedList);

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

    setGroupedTasks(groupAndSortTasks(filteredTasks));
  }, [tasks, selectedList, isClient]);
  

  const { expired, upcoming, done } = groupedTasks;

  const cardProps = {
    view: "compact" as const,
    onDelete: handleDeleteTask,
    onToggleImportant: handleToggleImportant,
    onToggleMyDay: handleToggleMyDay,
    onToggleCompleted: handleToggleCompleted,
  };


  return (
    <div className="">
      <header className="px-5 pt-10 pb-4 h-[100px] flex justify-between items-center">
        <div className="flex items-center gap-2">
          <InboxIcon className="w-7 h-7" strokeWidth={2} />
          <h1 className="text-[28px] font-bold text-foreground">Inbox</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Filter className="w-6 h-6" strokeWidth={1.5} />
          </Button>
        </div>
      </header>

      <Tabs defaultValue="lists" className="w-full">
        <div className="px-5">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lists">Lists</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="lists" className="mt-4">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 px-5 py-2">
              {lists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => setSelectedList(list.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    selectedList === list.id
                      ? "text-white"
                      : "text-foreground"
                  )}
                  style={{
                    backgroundColor: selectedList === list.id ? list.color : 'var(--secondary-bg, #E5E5EA)',
                  }}
                >
                  {list.name}
                </button>
              ))}
              <Button size="icon" variant="secondary" className="rounded-full w-9 h-9 flex-shrink-0">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <div className="space-y-6 px-5 mt-4">
            <TaskGroup title="Expired" tasks={expired} {...cardProps} />
            <TaskGroup title="Upcoming" tasks={upcoming} {...cardProps} />
            <TaskGroup title="Done" tasks={done} {...cardProps} />
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <div className="px-5">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border shadow-soft w-full"
                tasksPerDay={tasksPerDay}
                components={{
                  IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                  IconRight: () => <ChevronRight className="h-4 w-4" />,
                }}
              />
            </div>
            <div className="space-y-3 px-5 mt-4">
            <h2 className="font-bold text-lg">
              Tasks for {date ? format(date, 'PPP') : 'selected date'}
            </h2>
            {tasksForSelectedDate.length > 0 ? (
              tasksForSelectedDate.map((task) => {
                const list = lists.find((l) => l.id === task.listId);
                if (!list) return null;
                return <TaskCard key={task.id} task={task} list={list} {...cardProps} />;
              })
            ) : (
              <p className="text-muted-foreground text-center py-4">No tasks for this day.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
