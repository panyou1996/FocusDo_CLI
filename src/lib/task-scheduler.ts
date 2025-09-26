
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
    
    // Create a deep copy to avoid modifying the original array of objects
    const localSlots = slots.map(s => ({ ...s }));
    
    localSlots.sort((a, b) => a.start.getTime() - b.start.getTime());

    const merged: BlockedSlot[] = [localSlots[0]];

    for (let i = 1; i < localSlots.length; i++) {
        const last = merged[merged.length - 1];
        const current = localSlots[i];
        // If the current slot overlaps with the last one in the merged list, merge them
        if (current.start <= last.end) {
            last.end = max([last.end, current.end]);
        } else {
            merged.push(current);
        }
    }
    return merged;
}

/**
 * A robust function to find the next available time slot.
 * It intelligently skips over blocked periods.
 */
function findNextAvailableSlot(
  searchStart: Date,
  requiredDuration: number,
  blockedSlots: BlockedSlot[],
  workEnd: Date
): Date | null {
  let currentTime = searchStart;

  while (currentTime < workEnd) {
    // 1. Find if the current time starts within a blocked slot.
    const overlappingBlock = blockedSlots.find(slot => 
        isWithinInterval(currentTime, { start: slot.start, end: new Date(slot.end.getTime() - 1) })
    );

    if (overlappingBlock) {
      // If it is, jump our search to the end of that block and restart the loop.
      currentTime = overlappingBlock.end;
      continue;
    }

    // 2. Find the next block after our current valid start time.
    let nextBlock: BlockedSlot | null = null;
    for(const slot of blockedSlots) {
        if(slot.start > currentTime) {
            nextBlock = slot;
            break;
        }
    }

    // 3. Calculate the available time in this continuous segment.
    const segmentEnd = nextBlock ? nextBlock.start : workEnd;
    const availableMinutes = differenceInMinutes(segmentEnd, currentTime);

    if (availableMinutes >= requiredDuration) {
      // 4. Success! This segment is long enough.
      return currentTime;
    }

    // 5. Failure. This segment is too short. Jump to the end of the next block and retry.
    if (nextBlock) {
        currentTime = nextBlock.end;
    } else {
        // No more blocks, and the remaining time to workEnd is not enough.
        return null;
    }
  }

  return null; // Search went past workEnd.
}

/**
 * Calculates the actual end time of a task, accounting for breaks.
 */
function calculateEndTime(startTime: Date, duration: number, blockedSlots: BlockedSlot[]): Date {
  let remainingDuration = duration;
  let currentTime = startTime;

  while (remainingDuration > 0) {
    const nextBlock = blockedSlots.find(slot => slot.start >= currentTime);
    
    const endOfSegment = nextBlock ? nextBlock.start : addMinutes(currentTime, remainingDuration);
    const segmentDuration = differenceInMinutes(endOfSegment, currentTime);

    if (segmentDuration >= remainingDuration) {
      currentTime = addMinutes(currentTime, remainingDuration);
      remainingDuration = 0;
    } else {
      remainingDuration -= segmentDuration;
      currentTime = nextBlock!.end;
    }
  }
  return currentTime;
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

  // Create a deep copy to avoid mutating the original array
  let mutableTasks: Task[] = JSON.parse(JSON.stringify(allTasks));

  // === 1. Pre-process tasks: Reset overdue tasks ===
  mutableTasks.forEach(task => {
      const isOverdueByDate = task.dueDate && isBefore(parseISO(task.dueDate), today);
      const isLeftoverFromMyDay = task.myDaySetDate && isBefore(parseISO(task.myDaySetDate), today);

      if (!task.isCompleted && (isOverdueByDate || isLeftoverFromMyDay)) {
          task.isFixed = false;
          task.startTime = undefined;
      }
  });
  
  // === 2. Build Blocked Slots ===
  const workStart = parseTimeString(rules.workStart, today);
  const workEnd = parseTimeString(rules.workEnd, today);
  
  let blockedSlots: BlockedSlot[] = [
      { start: startOfToday(), end: workStart }, // Time before work
      { start: workEnd, end: endOfDay(today) },   // Time after work
      { start: parseTimeString(rules.lunchBreak.start, today), end: parseTimeString(rules.lunchBreak.end, today) },
      { start: parseTimeString(rules.dinnerBreak.start, today), end: parseTimeString(rules.dinnerBreak.end, today) }
  ];

  mutableTasks.forEach(task => {
      if (task.isFixed && task.startTime && !task.isCompleted) {
          const fixedStart = parseTimeString(task.startTime, today);
          const fixedEnd = calculateEndTime(fixedStart, task.duration || rules.defaultDuration, sortAndMerge(blockedSlots));
          blockedSlots.push({ start: fixedStart, end: fixedEnd });
      }
  });

  let sortedBlockedSlots = sortAndMerge(blockedSlots);

  // === 3. Schedule Remaining Tasks ===
  const tasksToProcess = mutableTasks.filter(t => !t.isCompleted && !t.startTime);

  // 3.4 & 3.5 Sort by due date (earliest first), then importance
  tasksToProcess.sort((a, b) => {
    const aDate = a.dueDate ? parseISO(a.dueDate) : null;
    const bDate = b.dueDate ? parseISO(b.dueDate) : null;

    if (aDate && !bDate) return -1;
    if (!aDate && bDate) return 1;
    if (aDate && bDate) {
      if (isBefore(aDate, bDate)) return -1;
      if (isBefore(bDate, aDate)) return 1;
    }

    if (a.isImportant && !b.isImportant) return -1;
    if (!a.isImportant && b.isImportant) return 1;

    return 0;
  });

  let nextAvailableTime = max([now, workStart]);
  
  tasksToProcess.forEach(task => {
      const taskDuration = task.duration || rules.defaultDuration;
      
      const slotStart = findNextAvailableSlot(nextAvailableTime, taskDuration, sortedBlockedSlots, workEnd);

      if (slotStart) {
          const slotEnd = calculateEndTime(slotStart, taskDuration, sortedBlockedSlots);

          // 3.3 Ensure task does not exceed due date
          const taskDueDate = task.dueDate ? endOfDay(parseISO(task.dueDate)) : null;
          if (taskDueDate && isBefore(taskDueDate, slotEnd)) {
             // This task would be completed after its due date, so we don't schedule it.
             // In a more advanced version, we could try to fit it later, but for now, we skip.
             return;
          }

          // Schedule the task
          const taskInMutableArray = mutableTasks.find(t => t.id === task.id);
          if(taskInMutableArray) {
              taskInMutableArray.startTime = format(slotStart, 'HH:mm');
          }
          
          // Add the newly scheduled task to the blocked slots
          const newBlock = { start: slotStart, end: slotEnd };
          sortedBlockedSlots.push(newBlock);
      
          // Re-sort and merge is important after every addition
          sortedBlockedSlots = sortAndMerge(sortedBlockedSlots);
          
          // Update the start time for the next search
          nextAvailableTime = addMinutes(slotEnd, rules.taskInterval);
      }
  });

  return mutableTasks;
}
