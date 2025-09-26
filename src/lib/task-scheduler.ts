
import type { Task } from './types';
import { parse, setHours, setMinutes, setSeconds, isBefore, addMinutes, max, isWithinInterval, format } from 'date-fns';

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

/**
 * Parses a time string (e.g., "08:30") into a Date object for today.
 * @param timeStr The time string in HH:mm format.
 * @param date The base date to use (defaults to now).
 * @returns A Date object.
 */
function parseTimeString(timeStr: string, date: Date = new Date()): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return setSeconds(setMinutes(setHours(date, hours), minutes), 0);
}


/**
 * Automatically schedules a list of tasks based on a set of rules.
 * @param tasksToSchedule The tasks to be scheduled.
 * @param rules The scheduling rules.
 * @returns A new array of tasks with updated startTimes.
 */
export function autoScheduleTasks(tasksToSchedule: Task[], rules: ScheduleRule): Task[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 1. Filter out tasks that should not be scheduled
  const fixedTasks = tasksToSchedule.filter(t => t.isFixed && t.startTime);
  const schedulableTasks = tasksToSchedule.filter(t => !t.isCompleted && !(t.isFixed && t.startTime));

  // 2. Sort schedulable tasks by priority: Important > Not Important
  schedulableTasks.sort((a, b) => (b.isImportant ? 1 : 0) - (a.isImportant ? 1 : 0));

  // 3. Initialize available time slots
  let nextAvailableTime = max([now, parseTimeString(rules.workStart, today)]);
  const workEnd = parseTimeString(rules.workEnd, today);
  const lunchStart = parseTimeString(rules.lunchBreak.start, today);
  const lunchEnd = parseTimeString(rules.lunchBreak.end, today);
  const dinnerStart = parseTimeString(rules.dinnerBreak.start, today);
  const dinnerEnd = parseTimeString(rules.dinnerBreak.end, today);

  const updatedTasks = [...tasksToSchedule];

  // 4. Schedule each task
  for (const task of schedulableTasks) {
    const taskDuration = task.duration || rules.defaultDuration;
    let foundSlot = false;

    while (!foundSlot && isBefore(nextAvailableTime, workEnd)) {
      let potentialStartTime = nextAvailableTime;
      let potentialEndTime = addMinutes(potentialStartTime, taskDuration);
      
      // Check for conflicts with break times
      if (isWithinInterval(potentialStartTime, { start: lunchStart, end: lunchEnd }) || isWithinInterval(potentialEndTime, { start: lunchStart, end: lunchEnd })) {
        nextAvailableTime = lunchEnd;
        continue;
      }
      if (isWithinInterval(potentialStartTime, { start: dinnerStart, end: dinnerEnd }) || isWithinInterval(potentialEndTime, { start: dinnerStart, end: dinnerEnd })) {
        nextAvailableTime = dinnerEnd;
        continue;
      }
       // Check for conflicts with fixed tasks
      const hasConflictWithFixed = fixedTasks.some(fixedTask => {
          if (!fixedTask.startTime) return false;
          const fixedStart = parseTimeString(fixedTask.startTime, today);
          const fixedEnd = addMinutes(fixedStart, fixedTask.duration || rules.defaultDuration);
          return isWithinInterval(potentialStartTime, { start: fixedStart, end: fixedEnd }) || isWithinInterval(potentialEndTime, { start: fixedStart, end: fixedEnd });
      });

      if (hasConflictWithFixed) {
          nextAvailableTime = addMinutes(nextAvailableTime, rules.taskInterval);
          continue;
      }

      // Check if task fits before work ends
      if (isBefore(potentialEndTime, workEnd)) {
        // Found a slot! Update the task.
        const taskIndex = updatedTasks.findIndex(t => t.id === task.id);
        if (taskIndex !== -1) {
            updatedTasks[taskIndex] = {
                ...updatedTasks[taskIndex],
                startTime: format(potentialStartTime, 'HH:mm'),
            };
        }
        
        // Update next available time for the next task
        nextAvailableTime = addMinutes(potentialEndTime, rules.taskInterval);
        foundSlot = true;
      } else {
        // Slot not found, break loop for this task
        break;
      }
    }
  }

  return updatedTasks;
}

