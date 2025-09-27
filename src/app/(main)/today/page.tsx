
"use client";

import * as React from "react";
import { Plus, MoreHorizontal, Check, MoveRight, Trash, WandSparkles, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { TaskCard } from "@/components/tasks/TaskCard";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Task } from "@/lib/types";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getIcon } from "@/lib/icon-utils";
import Link from 'next/link';
import Image from "next/image";
import { isBefore, startOfToday, parseISO, differenceInDays } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { autoScheduleTasks } from '@/lib/task-scheduler';
import { useToast } from "@/hooks/use-toast";
import { useThemeStore } from '@/store/useThemeStore';
import { themes } from '@/lib/themes';
import { generateExquisiteLinearGradient } from '@/lib/color-utils';

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
        <p className="text-muted-foreground mt-1">You've completed all your tasks. Enjoy your day!</p>
    </motion.div>
);


'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BrainCircuit } from 'lucide-react';
import { useTaskStore } from '@/store/useTaskStore';
import { AddTaskSheet } from '@/components/tasks/AddTaskSheet';
import { SmartScheduleSheet } from '@/components/ai/SmartScheduleSheet';
import { Task } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// New Timeline Imports
import { TimelineItem } from '@/components/timeline/TimelineItem';
import { TimeGridBackground } from '@/components/timeline/TimeGridBackground';
import { TimeMarker } from '@/components/timeline/TimeMarker';

// Constants for timeline layout
const PIXELS_PER_HOUR = 80;
const PIXELS_PER_MINUTE = PIXELS_PER_HOUR / 60;

// --- Data Processing Function ---
const buildTimelineItems = (tasks: Task[]) => {
  const items: any[] = [];
  let lastTime = new Date();
  lastTime.setHours(8, 0, 0, 0); // Start of the day for gaps

  // Sort tasks by their due date/time
  const sortedTasks = [...tasks].sort((a, b) => {
    const timeA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
    const timeB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
    return timeA - timeB;
  });

  sortedTasks.forEach(task => {
    const taskTime = task.dueDate ? new Date(task.dueDate) : null;

    if (taskTime) {
      const diffMinutes = (taskTime.getTime() - lastTime.getTime()) / (1000 * 60);
      
      // Add a gap if there's significant time between tasks
      if (diffMinutes > 15) {
        items.push({
          id: `gap-${items.length}`,
          type: 'gap',
          duration: diffMinutes,
        });
      }
    }
    
    items.push(task);

    if (taskTime) {
      lastTime = new Date(taskTime.getTime() + (task.duration || 0) * 60 * 1000);
    }
  });

  return items;
};


const TodayPage: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { tasks, setTasks, fetchTasks } = useTaskStore();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSmartSheetOpen, setIsSmartSheetOpen] = useState(false);
  
  const { data: fetchedTasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (fetchedTasks) {
      setTasks(fetchedTasks);
    }
  }, [fetchedTasks, setTasks]);

  const todayTasks = useMemo(() => tasks.filter(task => {
    if (!task.dueDate) return false;
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    return today.toDateString() === dueDate.toDateString();
  }), [tasks]);

  const timelineItems = useMemo(() => buildTimelineItems(todayTasks), [todayTasks]);

  if (isLoading) {
    // A better loading state can be designed
    return <div className="flex items-center justify-center h-full">Loading tasks...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="sticky top-0 z-20 flex items-center justify-between p-4 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <h1 className="text-2xl font-bold">My Day</h1>
        <Button variant="ghost" size="sm" onClick={() => setIsSmartSheetOpen(true)}>
          <BrainCircuit className="w-5 h-5 mr-2" />
          AI Plan
        </Button>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="relative">
          <TimeGridBackground />
          <TimeMarker />
          
          <div className="relative z-10">
            <AnimatePresence>
              {timelineItems.map((item, index) => {
                const isTask = item.type !== 'gap';
                const isOverdue = isTask && item.dueDate && new Date(item.dueDate) < new Date() && !item.isCompleted;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                  >
                    <TimelineItem
                      item={item}
                      isFirst={index === 0}
                      isLast={index === timelineItems.length - 1}
                      isOverdue={isOverdue}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {timelineItems.length === 0 && (
          <div className="text-center text-muted-foreground mt-20">
            <p>No tasks for today.</p>
            <p>Click the + to add one!</p>
          </div>
        )}
      </main>

      <AddTaskSheet isOpen={isSheetOpen} onOpenChange={setIsSheetOpen} />
      <SmartScheduleSheet isOpen={isSmartSheetOpen} onOpenChange={setIsSmartSheetOpen} />

      {/* The FAB is removed in favor of the BottomNavBar as per the plan */}
    </div>
  );
};

    

    