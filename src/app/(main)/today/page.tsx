'use client';

import React, { useMemo, useState } from 'react';
import { BrainCircuit, PlusCircle } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Task } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [tasksWithoutTime, tasksWithTime] = useMemo(() => {
    const withoutTime: Task[] = [];
    const withTime: Task[] = [];
    todayTasks.forEach(task => {
      task.startTime ? withTime.push(task) : withoutTime.push(task);
    });
    return [withoutTime, withTime];
  }, [todayTasks]);

  const timelineItems = useMemo(() => buildTimelineItems(tasksWithTime), [tasksWithTime]);

  const paginate = (newDirection: number) => {
    const newPage = page + newDirection;
    if (newPage >= 0 && newPage < 2) {
      setPage([newPage, newDirection]);
    }
  };

  const activeTab = page === 0 ? 'timeline' : 'not-scheduled';

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? '100%' : '-100%', opacity: 0 }),
  };

  const views = {
    timeline: (
        <div className="relative pb-20">
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
        <div className="space-y-4 pb-20">
            {tasksWithoutTime.length > 0 ? (
                tasksWithoutTime.map(task => (
                    <div key={task.id} className="flex items-start">
                        <div 
                            className="w-14 flex-shrink-0 flex justify-center pt-2.5"
                            onPointerDown={(e) => e.stopPropagation()} // Prevent drag conflict
                        >
                            <Checkbox
                                id={`task-cb-${task.id}`}
                                checked={task.isCompleted}
                                onCheckedChange={() => updateTask(task.id, { isCompleted: !task.isCompleted })}
                                className="w-6 h-6 rounded-md data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-primary/50"
                            />
                        </div>
                        <div 
                            className="flex-grow"
                            onPointerDown={(e) => e.stopPropagation()} // Prevent drag conflict
                        >
                            <TaskCard task={task} list={lists.find(l => l.id === task.listId)} onUpdate={updateTask} />
                        </div>
                    </div>
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
      <header className="sticky top-0 z-30 flex flex-col items-center p-4 bg-background/80 backdrop-blur-sm border-b border-border/50 flex-shrink-0">
        <div className="flex items-center justify-between w-full">
            <h1 className="text-2xl font-bold">My Day</h1>
            <Button variant="ghost" size="sm" onClick={() => console.log('AI Plan clicked')}>
                <BrainCircuit className="w-5 h-5 mr-2" />
                AI Plan
            </Button>
        </div>
        {todayTasks.length > 0 && (
             <Tabs 
                value={activeTab} 
                onValueChange={(value) => {
                    const newPage = value === 'timeline' ? 0 : 1;
                    const newDirection = newPage > page ? 1 : -1;
                    setPage([newPage, newDirection]);
                }}
                className="w-full mt-4"
            >
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="not-scheduled">Not Scheduled</TabsTrigger>
                </TabsList>
            </Tabs>
        )}
      </header>

      <main className="flex-1 relative">
        {todayTasks.length > 0 ? (
            <>
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
                        className="h-full w-full absolute top-0 left-0 p-4 overflow-y-auto"
                    >
                        {activeTab === 'timeline' ? views.timeline : views['not-scheduled']}
                    </motion.div>
                </AnimatePresence>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
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
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <p className="mb-4">No tasks for today. Add one to get started!</p>
                <button onClick={() => router.push('/add-task')} className="flex items-center gap-4 text-primary">
                    <PlusCircle className="w-5 h-5" />
                    <span className="text-base font-medium">Add Task</span>
                </button>
            </div>
        )}
      </main>
    </div>
  );
};

export default TodayPage;
