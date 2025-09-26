
'use client';

import type { Task } from './types';
import { 
  parse, 
  setHours, 
  setMinutes, 
  setSeconds, 
  isBefore, 
  addMinutes, 
  max, 
  isWithinInterval, 
  format, 
  startOfToday, 
  endOfDay, 
  isValid, 
  parseISO,
  differenceInMinutes
} from 'date-fns';

/**
 * Defines the rules for the auto-scheduling algorithm.
 */
export interface ScheduleRule {
  workStart: string;      // "08:30"
  lunchBreak: { start: string; end: string }; // "11:30" - "13:00"
  dinnerBreak: { start: string; end: string }; // "17:30" - "18:00"
  workEnd: string;        // "21:00"
  defaultDuration: number; // 30 minutes for tasks without a duration
  taskInterval: number;   // 15 minutes between tasks
}

/**
 * Default scheduling rules.
 */
export const defaultScheduleRules: ScheduleRule = {
    workStart: "08:30",
    lunchBreak: { start: "11:30", end: "13:00" },
    dinnerBreak: { start: "17:30", end: "18:00" },
    workEnd: "21:00",
    defaultDuration: 30,
    taskInterval: 15,
};

type BlockedSlot = { start: Date; end: Date };

/**
 * Parses a time string (e.g., "08:30") into a Date object for a given base date.
 */
function parseTimeString(timeStr: string, date: Date): Date {
    if (!/^\d{2}:\d{2}$/.test(timeStr)) {
        console.error(`Invalid time string format: ${timeStr}`);
        return date;
    }
    const [hours, minutes] = timeStr.split(':').map(Number);
    return setSeconds(setMinutes(setHours(date, hours), minutes), 0);
}

/**
 * Sorts and merges overlapping time slots.
 * @param slots Array of time slots.
 * @returns A new array of merged and sorted time slots.
 */
function sortAndMerge(slots: BlockedSlot[]): BlockedSlot[] {
    if (slots.length === 0) return [];
    
    const localSlots = slots.map(s => ({ start: new Date(s.start), end: new Date(s.end) }));
    
    localSlots.sort((a, b) => a.start.getTime() - b.start.getTime());

    const merged: BlockedSlot[] = [localSlots[0]];

    for (let i = 1; i < localSlots.length; i++) {
        const last = merged[merged.length - 1];
        const current = localSlots[i];
        if (current.start < last.end) {
            last.end = max([last.end, current.end]);
        } else {
            merged.push(current);
        }
    }
    return merged;
}

/**
 * A robust function to find the next available time slot for a given duration.
 * This is a critical part of the new algorithm.
 */
function findNextAvailableSlot(
  searchStart: Date,
  requiredDuration: number,
  blockedSlots: BlockedSlot[],
  workEnd: Date
): Date | null {
  let currentTime = searchStart;

  while (isBefore(currentTime, workEnd)) {
    // 1. Check if currentTime is inside a blocked slot. If so, jump to the end of it.
    const overlappingBlock = blockedSlots.find(slot => 
        isWithinInterval(currentTime, { start: slot.start, end: new Date(slot.end.getTime() - 1) })
    );

    if (overlappingBlock) {
      currentTime = overlappingBlock.end;
      continue; // Restart the loop with the new, later currentTime
    }

    // 2. If currentTime is valid, find the next block *after* it.
    let nextBlock: BlockedSlot | undefined;
    for(const slot of blockedSlots) {
        if (isBefore(currentTime, slot.start)) {
            nextBlock = slot;
            break;
        }
    }
    
    // 3. Calculate the continuous free time until the next block (or until work ends).
    const endOfFreeSegment = nextBlock ? nextBlock.start : workEnd;
    const availableMinutes = differenceInMinutes(endOfFreeSegment, currentTime);

    // 4. Check if this segment is long enough.
    if (availableMinutes >= requiredDuration) {
      return currentTime; // Success! We found a valid slot.
    }

    // 5. If not long enough, this is a dead-end "fragment". Jump past the next block and try again.
    if (nextBlock) {
        currentTime = nextBlock.end;
    } else {
        // No more blocks and the last segment wasn't big enough.
        return null; // No suitable slot found for the rest of the day.
    }
  }

  return null; // Loop finished, means we're past workEnd.
}


/**
 * Automatically schedules a list of tasks based on a set of rules.
 * @param allTasks The tasks to be scheduled.
 * @param rules The scheduling rules.
 * @returns A new array of tasks with updated startTimes.
 */
export function autoScheduleTasks(allTasks: Task[], rules: ScheduleRule): Task[] {
  const today = startOfToday();
  const now = new Date();

  let mutableTasks: Task[] = JSON.parse(JSON.stringify(allTasks));

  // === 1. Pre-process tasks: Reset overdue/leftover tasks ===
  mutableTasks.forEach(task => {
      if (task.isCompleted) return;

      const isLeftoverFromMyDay = task.isMyDay && task.myDaySetDate && isBefore(parseISO(task.myDaySetDate), today);
      const isOverdueByDate = task.dueDate && isBefore(parseISO(task.dueDate), today);
      
      if (isLeftoverFromMyDay || isOverdueByDate) {
          task.isFixed = false;
          task.startTime = undefined;
      }
  });
  
  // === 2. Build Blocked Slots ===
  const workStart = parseTimeString(rules.workStart, today);
  const workEnd = parseTimeString(rules.workEnd, today);
  
  let blockedSlots: BlockedSlot[] = [
      { start: startOfToday(), end: workStart }, 
      { start: workEnd, end: endOfDay(today) },
      { start: parseTimeString(rules.lunchBreak.start, today), end: parseTimeString(rules.lunchBreak.end, today) },
      { start: parseTimeString(rules.dinnerBreak.start, today), end: parseTimeString(rules.dinnerBreak.end, today) }
  ];

  mutableTasks.forEach(task => {
      if (task.isFixed && task.startTime && !task.isCompleted) {
          const fixedStart = parseTimeString(task.startTime, today);
          const fixedEnd = addMinutes(fixedStart, task.duration || rules.defaultDuration);
          blockedSlots.push({ start: fixedStart, end: fixedEnd });
      }
  });

  let sortedBlockedSlots = sortAndMerge(blockedSlots);

  // === 3. Schedule Remaining Tasks ===
  const tasksToSchedule = mutableTasks.filter(t => !t.isCompleted && !t.startTime);

  // 3.1 Calculate priority score for each task
  const tasksWithScores = tasksToSchedule.map(task => {
      let score = 0;
      if (task.dueDate) {
          const daysUntilDue = Math.max(0, differenceInMinutes(parseISO(task.dueDate), today) / (60 * 24));
          score += 1000 / (daysUntilDue + 1);
      }
      if (task.isImportant) {
          score += 500;
      }
      const daysSinceCreation = Math.max(0, differenceInMinutes(today, parseISO(task.createdAt)) / (60 * 24));
      score += 10 / (daysSinceCreation + 1);

      return { ...task, priorityScore: score };
  });

  // 3.2 Sort by priority score (descending)
  tasksWithScores.sort((a, b) => b.priorityScore - a.priorityScore);

  // CRITICAL FIX: Ensure we never schedule tasks in the past.
  let nextAvailableTime = max([now, workStart]);
  
  tasksWithScores.forEach(taskWithScore => {
      const taskDuration = taskWithScore.duration || rules.defaultDuration;
      
      const slotStart = findNextAvailableSlot(nextAvailableTime, taskDuration, sortedBlockedSlots, workEnd);

      if (slotStart) {
          const slotEnd = addMinutes(slotStart, taskDuration);
          
          const taskDueDate = taskWithScore.dueDate ? endOfDay(parseISO(taskWithScore.dueDate)) : null;
          if (taskDueDate && isBefore(taskDueDate, slotEnd)) {
             return; 
          }

          const taskInMutableArray = mutableTasks.find(t => t.id === taskWithScore.id);
          if(taskInMutableArray) {
              taskInMutableArray.startTime = format(slotStart, 'HH:mm');
          }
          
          const newBlock = { start: slotStart, end: addMinutes(slotEnd, rules.taskInterval) }; // Add interval to the block
          sortedBlockedSlots.push(newBlock);
          sortedBlockedSlots = sortAndMerge(sortedBlockedSlots);
          
          nextAvailableTime = newBlock.end;
      }
  });

  return mutableTasks;
}
