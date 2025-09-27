'use client';

import React, { useState, useEffect, useMemo } from 'react';

import { BrainCircuit } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
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
  const { tasks, updateTask } = useAppContext();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSmartSheetOpen, setIsSmartSheetOpen] = useState(false);
  

  const todayTasks = useMemo(() => tasks.filter(task => {
    if (!task.dueDate) return false;
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    return today.toDateString() === dueDate.toDateString();
  }), [tasks]);

  const timelineItems = useMemo(() => buildTimelineItems(todayTasks), [todayTasks]);


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
                      updateTask={updateTask}
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

export default TodayPage;