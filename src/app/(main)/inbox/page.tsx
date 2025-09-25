
'use client';

import * as React from 'react';
import {
  Inbox as InboxIcon,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  List,
} from 'lucide-react';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/types';
import { useAppContext } from '@/context/AppContext';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { getIcon } from '@/lib/icon-utils';

interface GroupedTasks {
  expired: Task[];
  upcoming: Task[];
  done: Task[];
}

const TaskGroup = ({
  title,
  tasks,
  status,
  ...props
}: {
  title: string;
  tasks: Task[];
  status: 'expired' | 'upcoming' | 'done';
  [key: string]: any;
}) => {
  const { lists } = useAppContext();

  if (tasks.length === 0) return null;
  return (
    <div>
      <h2 className="text-base font-semibold text-muted-foreground mb-2 px-1">
        {title}
      </h2>
      <div className="space-y-3">
        {tasks.map(task => {
          const list = lists.find(l => l.id === task.listId);
          if (!list) return null;
          const ListIcon = getIcon(list.icon as string);
          return (
            <TaskCard
              key={task.id}
              task={task}
              list={{ ...list, icon: ListIcon }}
              status={status}
              {...props}
            />
          );
        })}
      </div>
    </div>
  );
};

type FilterStatus = 'all' | 'incomplete' | 'completed';
type FilterImportance = 'all' | 'important' | 'not-important';
type SortByType = 'default' | 'dueDate' | 'importance' | 'creationDate';

interface FilterPopoverContentProps {
  filterStatus: FilterStatus;
  setFilterStatus: (value: FilterStatus) => void;
  filterImportance: FilterImportance;
  setFilterImportance: (value: FilterImportance) => void;
  sortBy: SortByType;
  setSortBy: (value: SortByType) => void;
}


const FilterPopoverContent: React.FC<FilterPopoverContentProps> = ({
  filterStatus,
  setFilterStatus,
  filterImportance,
  setFilterImportance,
  sortBy,
  setSortBy,
}) => {
    return (
        <div className="p-4 space-y-4">
            <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">FILTER BY</h3>
                <Tabs value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)} className="w-full mb-2">
                    <TabsList className="grid grid-cols-3 w-full">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="incomplete">Incomplete</TabsTrigger>
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                    </TabsList>
                </Tabs>
                <Tabs value={filterImportance} onValueChange={(value) => setFilterImportance(value as any)} className="w-full">
                    <TabsList className="grid grid-cols-3 w-full">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="important">Important</TabsTrigger>
                        <TabsTrigger value="not-important">Not Important</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div>
                 <h3 className="text-sm font-medium text-muted-foreground mb-3">SORT BY</h3>
                 <Tabs value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="default">Start</TabsTrigger>
                        <TabsTrigger value="dueDate">Due Date</TabsTrigger>
                        <TabsTrigger value="importance">Important</TabsTrigger>
                        <TabsTrigger value="creationDate">Created</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
        </div>
    );
};


export default function InboxPage() {
  const { tasks, updateTask, deleteTask, lists } = useAppContext();
  const [selectedList, setSelectedList] = useLocalStorage('inbox-selected-list', 'all');
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [groupedTasks, setGroupedTasks] = React.useState<GroupedTasks>({
    expired: [],
    upcoming: [],
    done: [],
  });
  const [isClient, setIsClient] = React.useState(false);
  const router = useRouter();

  // Filter and Sort States from localStorage
  const [filterStatus, setFilterStatus] = useLocalStorage<FilterStatus>('inbox-filter-status', 'all');
  const [filterImportance, setFilterImportance] = useLocalStorage<FilterImportance>('inbox-filter-importance', 'all');
  const [sortBy, setSortBy] = useLocalStorage<SortByType>('inbox-sort-by', 'default');
  const [activeTab, setActiveTab] = useLocalStorage("inbox-active-tab", "lists");

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const processedTasks = React.useMemo(() => {
    if (!isClient) return [];

    let filtered = tasks;

    // 1. Filter by List
    if (selectedList !== 'all') {
      filtered = filtered.filter(task => task.listId === selectedList);
    }

    // 2. Filter by Status
    if (filterStatus === 'incomplete') {
      filtered = filtered.filter(task => !task.isCompleted);
    } else if (filterStatus === 'completed') {
      filtered = filtered.filter(task => task.isCompleted);
    }

    // 3. Filter by Importance
    if (filterImportance === 'important') {
      filtered = filtered.filter(task => task.isImportant);
    } else if (filterImportance === 'not-important') {
      filtered = filtered.filter(task => !task.isImportant);
    }

    // 4. Sort
    let sorted = [...filtered]; // Create a new array for sorting
    if (sortBy === 'dueDate') {
      sorted.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    } else if (sortBy === 'importance') {
      sorted.sort((a, b) => (b.isImportant ? 1 : 0) - (a.isImportant ? 1 : 0));
    } else if (sortBy === 'creationDate') {
       sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'default') { // 'By Time' or 'Start Time'
        const now = new Date();
        const withStartTime = sorted.filter(t => t.startTime);
        const withoutStartTime = sorted.filter(t => !t.startTime);

        withStartTime.sort((a, b) => {
            if (!a.startTime) return 1;
            if (!b.startTime) return -1;
            const timeA = new Date(now.toDateString() + ' ' + a.startTime).getTime();
            const timeB = new Date(now.toDateString() + ' ' + b.startTime).getTime();
            return timeA - timeB;
        });

        sorted = [...withStartTime, ...withoutStartTime];
    }

    return sorted;
  }, [tasks, selectedList, filterStatus, filterImportance, sortBy, isClient]);

  const tasksForSelectedDate = React.useMemo(() => {
    if (!date || !isClient) return [];
    const formattedDate = format(date, 'yyyy-MM-dd');
    return processedTasks.filter(task => task.dueDate === formattedDate);
  }, [date, processedTasks, isClient]);

  const tasksPerDay = React.useMemo(() => {
    if (!isClient) return {};
    const counts: { [key: string]: number } = {};
    
    processedTasks.forEach(task => {
      if (task.dueDate) {
        counts[task.dueDate] = (counts[task.dueDate] || 0) + 1;
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

  React.useEffect(() => {
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
      return { expired, upcoming, done };
    };

    setGroupedTasks(groupAndSortTasks(processedTasks));
  }, [processedTasks]);

  const { expired, upcoming, done } = groupedTasks;

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

  const renderListContent = () => {
    if (!isClient) {
      return (
        <div className="space-y-4 mt-4">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      );
    }

    if (processedTasks.length === 0) {
      return (
        <p className="text-muted-foreground text-center py-10">
          No tasks match your filters.
        </p>
      );
    }

    if (sortBy !== 'default') {
      let title = "Tasks";
      if(filterStatus === 'completed') title = "Completed Tasks";
      if(filterStatus === 'incomplete') title = "Incomplete Tasks";
      if(filterImportance === 'important') title = "Important Tasks";

      return (
        <div className="space-y-3 mt-4">
          <TaskGroup
            title={title}
            tasks={processedTasks}
            status="upcoming" // Use 'upcoming' for neutral styling
            {...cardProps}
          />
        </div>
      );
    }
    
    return (
      <div className="space-y-4 mt-4">
        <TaskGroup
          title="Expired"
          tasks={expired}
          status="expired"
          {...cardProps}
        />
        <TaskGroup
          title="Upcoming"
          tasks={upcoming}
          status="upcoming"
          {...cardProps}
        />
        <TaskGroup title="Done" tasks={done} status="done" {...cardProps} />
      </div>
    );
  };

  const renderCalendarContent = () => (
    <div className="mt-4">
      <div className="">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md custom-card w-full"
          tasksPerDay={isClient ? tasksPerDay : {}}
          components={{
            IconLeft: () => <ChevronLeft className="h-4 w-4" />,
            IconRight: () => <ChevronRight className="h-4 w-4" />,
          }}
          disabled={!isClient}
        />
      </div>
      <div className="space-y-3 mt-4">
        {!isClient ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        ) : tasksForSelectedDate.length > 0 ? (
          tasksForSelectedDate.map(task => {
            const list = lists.find(l => l.id === task.listId);
            if (!list) return null;
            const ListIcon = getIcon(list.icon as string);

            const status = task.isCompleted ? 'done' : 'upcoming';

            return (
              <TaskCard
                key={task.id}
                task={task}
                list={{ ...list, icon: ListIcon }}
                {...cardProps}
                status={status}
              />
            );
          })
        ) : (
          <p className="text-muted-foreground text-center py-4">
            No tasks for this day.
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className='px-5'>
      <header className="pt-10 pb-4 h-[80px] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <InboxIcon className="w-7 h-7" strokeWidth={2} />
            <h1 className="text-3xl font-bold text-foreground">Inbox</h1>
          </div>
          <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Filter className="w-6 h-6" strokeWidth={1.5} />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[calc(100vw-40px)] max-w-lg p-0">
                  <FilterPopoverContent
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                    filterImportance={filterImportance}
                    setFilterImportance={setFilterImportance}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                  />
              </PopoverContent>
          </Popover>
      </header>
      
      <div className="flex gap-2 mb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-grow">
            <TabsList className="grid w-full grid-cols-2 h-11">
                <TabsTrigger value="lists">Lists</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </TabsList>
        </Tabs>
        <Link href="/add-task">
            <Button size="icon" className="h-11 w-11 rounded-md flex-shrink-0">
                <Plus className="w-6 h-6" />
            </Button>
        </Link>
      </div>
      
      <TabsContent value="lists">
        <ScrollArea className="w-full whitespace-nowrap -mx-5">
            <div className="flex gap-2 py-2 px-5">
                <button
                    onClick={() => setSelectedList('all')}
                    className={cn(
                    'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors h-9',
                    selectedList === 'all'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground bg-secondary'
                    )}
                >
                    <List className="w-4 h-4" />
                    <span>All</span>
                </button>
                {lists.map(list => {
                    const ListIcon = getIcon(list.icon as string);
                    const isSelected = selectedList === list.id;
                    return (
                    <button
                        key={list.id}
                        onClick={() => setSelectedList(list.id)}
                        className={cn(
                        'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors h-9',
                        isSelected ? 'text-white' : 'text-foreground bg-secondary'
                        )}
                        style={{
                        backgroundColor: isSelected ? list.color : undefined,
                        }}
                    >
                        <ListIcon className="w-4 h-4" />
                        <span>{list.name}</span>
                    </button>
                    );
                })}
                <Link href="/add-list">
                    <Button
                    size="icon"
                    variant="secondary"
                    className="rounded-full w-9 h-9 flex-shrink-0"
                    >
                    <Plus className="w-5 h-5" />
                    </Button>
                </Link>
                </div>
                <ScrollBar orientation="horizontal" />
        </ScrollArea>
        {renderListContent()}
      </TabsContent>

      <TabsContent value="calendar">{renderCalendarContent()}</TabsContent>

    </div>
  );
}

    