'use client';

import React, { useState, useEffect, useMemo } from 'react';

import { BrainCircuit, PlusCircle } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

import { Task } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// New Timeline Imports
import { TimelineItem } from '@/components/timeline/TimelineItem';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TimeGridBackground } from '@/components/timeline/TimeGridBackground';
import { TimeMarker } from '@/components/timeline/TimeMarker';



// --- Data Processing Function ---
const buildTimelineItems = (tasks: Task[]) => {
  // Sort tasks by their start time for a chronological order
  return [...tasks].sort((a, b) => {
    if (!a.startTime || !b.startTime) return 0; // Should not happen with tasksWithTime
    const [hoursA, minutesA] = a.startTime.split(':').map(Number);
    const [hoursB, minutesB] = b.startTime.split(':').map(Number);
    return hoursA * 60 + minutesA - (hoursB * 60 + minutesB);
  });
};


const TodayPage: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { tasks, lists, updateTask, deleteTask, ...taskActions } = useAppContext();
  
  

  const todayTasks = useMemo(() => tasks.filter(task => task.isMyDay), [tasks]);

  const [tasksWithoutTime, tasksWithTime] = useMemo(() => {
    const withoutTime: Task[] = [];
    const withTime: Task[] = [];
    todayTasks.forEach(task => {
      if (task.startTime) {
        withTime.push(task);
      } else {
        withoutTime.push(task);
      }
    });
    return [withoutTime, withTime];
  }, [todayTasks]);

  const timelineItems = useMemo(() => buildTimelineItems(tasksWithTime), [tasksWithTime]);


  return (
    <div className="flex flex-col h-full bg-background">
      <header className="sticky top-0 z-20 flex items-center justify-between p-4 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <h1 className="text-2xl font-bold">My Day</h1>
        <Button variant="ghost" size="sm" onClick={() => console.log('AI Plan clicked')}>
          <BrainCircuit className="w-5 h-5 mr-2" />
          AI Plan
        </Button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-8">
        {tasksWithoutTime.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-muted-foreground px-1">Not Scheduled</h2>
            {tasksWithoutTime.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                list={lists.find(l => l.id === task.listId)}
                onUpdate={updateTask}
                onToggleCompleted={(id) => updateTask(id, { isCompleted: !task.isCompleted })}
                {...taskActions}
              />
            ))}
          </div>
        )}

        {timelineItems.length > 0 && (
          <div className="relative">
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
                        lists={lists}
                        {...taskActions}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {todayTasks.length === 0 && (
          <div className="text-center text-muted-foreground mt-20">
            <p>No tasks for today.</p>
            <p>Add one to get started!</p>
          </div>
        )}

        <div className="pl-4">
            <button 
                onClick={() => router.push('/add-task')}
                className="flex items-center gap-4 text-muted-foreground hover:text-primary transition-colors"
            >
                <PlusCircle className="w-5 h-5" />
                <span className="text-base font-medium">Add Task</span>
            </button>
        </div>

      </main>


      {/* The FAB is removed in favor of the BottomNavBar as per the plan */}
    </div>
  );
};

export default TodayPage;