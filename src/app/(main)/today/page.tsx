'use client';

import React, { useMemo, useState } from 'react';
import { BrainCircuit, PlusCircle, Sun, Clock, ListTodo, History } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Task } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { TimelineItem } from '@/components/timeline/TimelineItem';
import { TaskCard } from '@/components/tasks/TaskCard';


// --- Helper Functions & Constants ---
const buildTimelineItems = (tasks: Task[]) => {
  return [...tasks].sort((a, b) => {
    if (!a.startTime || !b.startTime) return 0;
    const [hoursA, minutesA] = a.startTime.split(':').map(Number);
    const [hoursB, minutesB] = b.startTime.split(':').map(Number);
    return hoursA * 60 + minutesA - (hoursB * 60 + minutesB);
  });
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => Math.abs(offset) * velocity;

// --- Main Component ---
const TodayPage: React.FC = () => {
  const router = useRouter();
  const { tasks, lists, updateTask } = useAppContext();

  const [[page, direction], setPage] = useState([0, 0]);

  const todayTasks = useMemo(() => tasks.filter(task => task.isMyDay), [tasks]);
  const [yesterdayTasks, tasksWithoutTime, tasksWithTime] = useMemo(() => {
    const yesterday: Task[] = [];
    const withoutTime: Task[] = [];
    const withTime: Task[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    todayTasks.forEach(task => {
      const taskDate = task.dueDate ? new Date(task.dueDate) : null;
      if (taskDate && taskDate < today && !task.isCompleted) {
        yesterday.push(task);
      } else if (task.startTime) {
        withTime.push(task);
      } else {
        withoutTime.push(task);
      }
    });
    return [yesterday, withoutTime, withTime];
  }, [todayTasks]);

  const timelineItems = useMemo(() => buildTimelineItems(tasksWithTime), [tasksWithTime]);

  const paginate = (newDirection: number) => {
    const newPage = page + newDirection;
    if (newPage >= 0 && newPage < 3) {
      setPage([newPage, newDirection]);
    }
  };

  const TABS = [
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'not-scheduled', label: 'Not Scheduled', icon: ListTodo },
    { id: 'yesterday', label: 'Yesterday', icon: History },
  ];

  const activeTab = TABS[page].id;

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? '100%' : '-100%', opacity: 0 }),
  };

  const views = {
    yesterday: (
      <div className="space-y-3 pb-20 pt-4 px-5">
        {yesterdayTasks.length > 0 ? (
          yesterdayTasks.map(task => (
            <TaskCard key={task.id} task={task} list={lists.find(l => l.id === task.listId)} onUpdate={updateTask} />
          ))
        ) : (
          <div className="text-center text-muted-foreground mt-20">
            <p>No overdue tasks from yesterday.</p>
          </div>
        )}
      </div>
    ),
    timeline: (
        <div className="relative pb-20 pt-4 px-5">
            {timelineItems.length > 0 ? (
                timelineItems.map((item, index) => (
                    <TimelineItem
                        key={item.id}
                        item={item}
                        isFirst={index === 0}
                        isLast={index === timelineItems.length - 1}
                        updateTask={updateTask}
                        lists={lists}
                    />
                ))
            ) : (
                <div className="text-center text-muted-foreground mt-20">
                    <p>No scheduled tasks for today.</p>
                </div>
            )}
        </div>
    ),
    'not-scheduled': (
        <div className="space-y-3 pb-20 pt-4 px-5">
            {tasksWithoutTime.length > 0 ? (
                tasksWithoutTime.map(task => (
                     <TaskCard key={task.id} task={task} list={lists.find(l => l.id === task.listId)} onUpdate={updateTask} />
                ))
            ) : (
                <div className="text-center text-muted-foreground mt-20">
                    <p>No unscheduled tasks for today.</p>
                </div>
            )}
        </div>
    ),
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <header className="pt-10 pb-4 h-[80px] flex justify-between items-center px-5">
          <div className="flex items-center gap-2">
            <Sun className="w-7 h-7" strokeWidth={2} />
            <h1 className="text-3xl font-bold">My Day</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => console.log('AI Plan clicked')}>
              <BrainCircuit className="w-5 h-5 mr-2" />
              AI Plan
          </Button>
      </header>

      <div className="flex-1 flex flex-col">
        {todayTasks.length > 0 ? (
          <>
            <div className="w-full mb-4 px-5">
                <div className="relative flex w-full p-1 bg-secondary rounded-full">
                    <motion.div
                        layoutId="active-pill"
                        className="absolute top-1 bottom-1 w-1/3"
                        style={{ left: `${(100 / 3) * page}%` }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    >
                        <div className="w-full h-full bg-background rounded-full shadow-md" />
                    </motion.div>
                    {TABS.map((tab, index) => (
                        <button
                        key={tab.id}
                        onClick={() => {
                            const newPage = index;
                            const newDirection = newPage > page ? 1 : -1;
                            setPage([newPage, newDirection]);
                        }}
                        className={cn(
                            'relative z-10 w-1/3 flex items-center justify-center gap-2 h-10 rounded-full text-sm transition-colors',
                            activeTab === tab.id
                                ? 'text-primary font-semibold'
                                : 'text-muted-foreground'
                        )}
                        >
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>
            <main className="flex-1 relative">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={page}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 }}}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={(e, { offset, velocity }) => {
                            const swipe = swipePower(offset.x, velocity.x);
                            if (swipe < -swipeConfidenceThreshold) paginate(1);
                            else if (swipe > swipeConfidenceThreshold) paginate(-1);
                        }}
                        className="h-full w-full absolute top-0 left-0 overflow-y-auto"
                    >
                        {views[activeTab as keyof typeof views]}
                    </motion.div>
                </AnimatePresence>
            </main>
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-5">
                <button 
                    onClick={() => router.push('/add-task')}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors bg-background/80 backdrop-blur-sm rounded-full p-3 border shadow-md"
                >
                    <PlusCircle className="w-5 h-5" />
                    <span className="text-sm font-medium pr-2">Add Task</span>
                </button>
            </div>
          </>
        ) : (
            <div className="px-5 flex-1 flex flex-col items-center justify-center text-center text-muted-foreground">
                <p className="mb-4">No tasks for today. Add one to get started!</p>
                <button onClick={() => router.push('/add-task')} className="flex items-center gap-4 text-primary">
                    <PlusCircle className="w-5 h-5" />
                    <span className="text-base font-medium">Add Task</span>
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default TodayPage;
