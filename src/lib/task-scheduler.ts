
import type { Task } from './types';
import { parse, setHours, setMinutes, setSeconds, isBefore, addMinutes, max, isWithinInterval, format, startOfToday, endOfDay, isValid, parseISO } from 'date-fns';

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
 * @param timeStr The time string in HH:mm format.
 * @param date The base date to use (defaults to today).
 * @returns A Date object.
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
    
    slots.sort((a, b) => a.start.getTime() - b.start.getTime());

    const merged: BlockedSlot[] = [slots[0]];

    for (let i = 1; i < slots.length; i++) {
        const last = merged[merged.length - 1];
        const current = slots[i];
        if (current.start <= last.end) {
            last.end = max([last.end, current.end]);
        } else {
            merged.push(current);
        }
    }
    return merged;
}

/**
 * Finds the next available time slot for a task.
 * @param searchStart The time to start searching from.
 * @param duration The required duration in minutes.
 * @param blockedSlots A sorted array of blocked time slots.
 * @returns The start time of the found slot, or null if no slot is found.
 */
function findNextAvailableSlot(searchStart: Date, duration: number, blockedSlots: BlockedSlot[]): Date | null {
    let currentTime = searchStart;

    while (true) {
        const overlappingBlock = blockedSlots.find(slot => 
            isWithinInterval(currentTime, { start: slot.start, end: slot.end }) || 
            (currentTime < slot.start && addMinutes(currentTime, duration) > slot.start)
        );

        if (overlappingBlock) {
            // If current time is blocked, jump to the end of the block and retry
            currentTime = addMinutes(overlappingBlock.end, 0); // Add 0 to create new Date object
            continue;
        }

        // If no overlap, we've found a valid start time.
        return currentTime;
    }
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
      const dueDate = task.dueDate ? parseISO(task.dueDate) : null;
      if (!task.isCompleted && dueDate && isBefore(dueDate, today)) {
          task.isFixed = false;
          task.startTime = undefined;
      }
  });
  
  // === 2. Build Blocked Slots ===
  const workStart = parseTimeString(rules.workStart, today);
  const workEnd = parseTimeString(rules.workEnd, today);
  
  let blockedSlots: BlockedSlot[] = [
      { start: startOfToday(), end: workStart }, // Time before work
      { start: workEnd, end: endOfDay(today) }, // Time after work
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

  // Sort by due date (earliest first), then importance
  tasksToSchedule.sort((a, b) => {
      const aDate = a.dueDate ? parseISO(a.dueDate) : null;
      const bDate = b.dueDate ? parseISO(b.dueDate) : null;

      if (aDate && bDate) {
          if (aDate < bDate) return -1;
          if (aDate > bDate) return 1;
      }
      if (aDate && !bDate) return -1; // Has due date vs no due date
      if (!aDate && bDate) return 1;

      if (a.isImportant && !b.isImportant) return -1;
      if (!a.isImportant && b.isImportant) return 1;

      return 0;
  });

  let nextAvailableTime = max([now, workStart]);
  
  tasksToSchedule.forEach(task => {
      const taskDuration = task.duration || rules.defaultDuration;
      const slot = findNextAvailableSlot(nextAvailableTime, taskDuration, sortedBlockedSlots);

      if (slot) {
          const potentialEndTime = addMinutes(slot, taskDuration);
          const taskDueDate = task.dueDate ? endOfDay(parseISO(task.dueDate)) : null;

          if (!taskDueDate || potentialEndTime < taskDueDate) {
              const taskInMutableArray = mutableTasks.find(t => t.id === task.id);
              if(taskInMutableArray) {
                  taskInMutableArray.startTime = format(slot, 'HH:mm');
              }
              
              const newBlock = { start: slot, end: potentialEndTime };
              sortedBlockedSlots.push(newBlock);
              sortedBlockedSlots = sortAndMerge(sortedBlockedSlots);
              
              nextAvailableTime = addMinutes(potentialEndTime, rules.taskInterval);
          }
      }
  });

  return mutableTasks;
}

    