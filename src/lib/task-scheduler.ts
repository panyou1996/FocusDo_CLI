
'use client';

import type { Task } from './types';
import { 
  addMinutes, 
  format, 
  isBefore, 
  max, 
  parseISO 
} from 'date-fns';

/**
 * Defines the rules for the auto-scheduling algorithm.
 * NOTE: These are not used by the current simple algorithm but are kept for future use.
 */
export interface ScheduleRule {
  workStart: string;
  lunchBreak: { start: string; end: string };
  dinnerBreak: { start: string; end: string };
  workEnd: string;
  defaultDuration: number;
  taskInterval: number;
}

export const defaultScheduleRules: ScheduleRule = {
    workStart: "08:30",
    lunchBreak: { start: "11:30", end: "13:00" },
    dinnerBreak: { start: "17:30", end: "18:00" },
    workEnd: "21:00",
    defaultDuration: 30,
    taskInterval: 15,
};

/**
 * A simplified scheduling algorithm for debugging.
 * It takes all uncompleted 'My Day' tasks, sorts them by creation time,
 * and assigns new start times at 15-minute intervals beginning from now.
 *
 * @param allTasks The tasks to be scheduled.
 * @param _rules The scheduling rules (currently ignored).
 * @returns A new array of tasks with updated startTimes.
 */
export function autoScheduleTasks(allTasks: Task[], _rules: ScheduleRule): Task[] {
  const now = new Date();
  
  // Create a deep copy to avoid modifying the original state directly
  let mutableTasks: Task[] = JSON.parse(JSON.stringify(allTasks));

  // 1. Filter for uncompleted tasks that are in "My Day"
  const tasksToSchedule = mutableTasks.filter(task => task.isMyDay && !task.isCompleted);

  // 2. Sort these tasks by their creation date (oldest first)
  tasksToSchedule.sort((a, b) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  // 3. Assign new start times sequentially
  let nextAvailableTime = now;
  
  for (const task of tasksToSchedule) {
    // Find the corresponding task in the main mutable array to update it
    const taskToUpdate = mutableTasks.find(t => t.id === task.id);
    if (taskToUpdate) {
      taskToUpdate.startTime = format(nextAvailableTime, 'HH:mm');
    }
    
    // Increment the time for the next task
    nextAvailableTime = addMinutes(nextAvailableTime, 15);
  }

  return mutableTasks;
}
