
'use client';

import type { Task } from './types';
import { 
  addMinutes, 
  format, 
  isBefore, 
  max, 
  parseISO, 
  startOfToday, 
  differenceInDays, 
  parse,
  endOfDay
} from 'date-fns';

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

interface BlockedSlot {
    start: Date;
    end: Date;
}

/**
 * Rounds a Date object's minutes up to the nearest 5-minute interval.
 */
function roundToNext5Minutes(date: Date): Date {
    const minutes = date.getMinutes();
    const remainder = minutes % 5;
    
    if (remainder === 0 && date.getSeconds() === 0 && date.getMilliseconds() === 0) {
      return date; // Already a clean multiple of 5
    }
    
    const roundedMinutes = (Math.floor(minutes / 5) + 1) * 5;
    const newDate = new Date(date.getTime());
    newDate.setMinutes(roundedMinutes, 0, 0); // Set minutes and reset seconds/ms
    return newDate;
}

/**
 * Parses a "HH:mm" string into a Date object for today.
 */
function parseTimeString(timeStr: string, today: Date): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date(today);
    date.setHours(hours, minutes, 0, 0);
    return date;
}

/**
 * Sorts and merges overlapping time slots to simplify checking.
 */
function sortAndMergeSlots(slots: BlockedSlot[]): BlockedSlot[] {
    if (slots.length === 0) return [];
    
    slots.sort((a, b) => a.start.getTime() - b.start.getTime());

    const merged: BlockedSlot[] = [slots[0]];
    for (let i = 1; i < slots.length; i++) {
        const last = merged[merged.length - 1];
        const current = slots[i];
        if (current.start < last.end) { // Use < to merge adjacent blocks correctly
            last.end = max([last.end, current.end]);
        } else {
            merged.push(current);
        }
    }
    return merged;
}

/**
 * Finds the next available continuous time slot for a given duration.
 */
function findNextAvailableSlot(
    searchStart: Date,
    duration: number,
    blockedSlots: BlockedSlot[],
    workEnd: Date
): Date | null {
    let currentTime = new Date(searchStart.getTime());

    while (isBefore(currentTime, workEnd)) {
        // 1. Check if the current time starts within a blocked slot. If so, jump to the end of it.
        const overlappingBlock = blockedSlots.find(
            (slot) => currentTime >= slot.start && currentTime < slot.end
        );

        if (overlappingBlock) {
            currentTime = new Date(overlappingBlock.end.getTime());
            continue; // Restart the loop with the new, later time
        }

        // 2. Find the next block that starts after our current time.
        const nextBlock = blockedSlots.find(
            (slot) => slot.start > currentTime
        );

        // 3. Calculate the available continuous time until the next block (or until work ends).
        const endOfAvailableSlot = nextBlock ? nextBlock.start : workEnd;
        const availableDuration = (endOfAvailableSlot.getTime() - currentTime.getTime()) / (1000 * 60);

        // 4. If there's enough time in this slot, we found our start time!
        const potentialEndTime = addMinutes(currentTime, duration);
        if (potentialEndTime > endOfAvailableSlot) {
            // Not enough space in this continuous block
             if (nextBlock) {
                currentTime = new Date(nextBlock.end.getTime());
                continue;
            } else {
                return null; // No more blocks and remaining time is not enough
            }
        }

        return currentTime;
    }

    return null; // Reached the end of the workday without finding a slot.
}

/**
 * Schedules tasks using a heuristic approach based on a calculated priority score.
 */
export function autoScheduleTasks(allTasks: Task[], rules: ScheduleRule = defaultScheduleRules): Task[] {
    const todayStart = startOfToday();
    const now = new Date();
    
    const mutableTasks: Task[] = JSON.parse(JSON.stringify(allTasks));

    mutableTasks.forEach(task => {
        if (task.isCompleted) return;
        
        const myDayDate = task.myDaySetDate ? parseISO(task.myDaySetDate) : parseISO(task.createdAt);
        const isLeftover = isBefore(myDayDate, todayStart);
        const isDueDatePassed = task.dueDate && isBefore(parseISO(task.dueDate), todayStart);

        if (isLeftover || isDueDatePassed) {
            task.isFixed = false;
            task.startTime = undefined;
        }
    });
    
    // Use rounded time for scheduling start
    const schedulingStartTime = roundToNext5Minutes(now);

    let blockedSlots: BlockedSlot[] = [];
    const workStart = max([schedulingStartTime, parseTimeString(rules.workStart, todayStart)]);
    const workEnd = parseTimeString(rules.workEnd, todayStart);
    
    blockedSlots.push({ start: startOfToday(), end: workStart });
    blockedSlots.push({ start: workEnd, end: endOfDay(todayStart) });

    blockedSlots.push({ start: parseTimeString(rules.lunchBreak.start, todayStart), end: parseTimeString(rules.lunchBreak.end, todayStart) });
    blockedSlots.push({ start: parseTimeString(rules.dinnerBreak.start, todayStart), end: parseTimeString(rules.dinnerBreak.end, todayStart) });

    mutableTasks.forEach(task => {
        if (task.isFixed && task.startTime && !task.isCompleted) {
            const fixedStart = parse(task.startTime, 'HH:mm', todayStart);
            if (fixedStart >= now) { // Only consider fixed tasks in the future
                const fixedEnd = addMinutes(fixedStart, task.duration || rules.defaultDuration);
                blockedSlots.push({ start: fixedStart, end: fixedEnd });
            }
        }
    });
    
    blockedSlots = sortAndMergeSlots(blockedSlots);

    const tasksToSchedule = mutableTasks.filter(
        task => task.isMyDay && !task.isCompleted && !task.isFixed && !task.startTime
    );

    tasksToSchedule.forEach(task => {
        let score = 0;
        if (task.isImportant) {
            score += 1000;
        }
        if (task.dueDate) {
            const daysRemaining = differenceInDays(parseISO(task.dueDate), todayStart);
            score += 500 / (daysRemaining + 1);
        }
        const daysSinceCreation = differenceInDays(todayStart, parseISO(task.createdAt));
        score += 10 / (daysSinceCreation + 1);
        
        (task as any).priorityScore = score;
    });

    tasksToSchedule.sort((a, b) => ((b as any).priorityScore) - ((a as any).priorityScore));

    let nextSearchTime = workStart;

    for (const task of tasksToSchedule) {
        const taskDuration = task.duration || rules.defaultDuration;
        const slotStart = findNextAvailableSlot(nextSearchTime, taskDuration, blockedSlots, workEnd);

        if (slotStart) {
            const originalTask = mutableTasks.find(t => t.id === task.id);
            if (originalTask) {
                originalTask.startTime = format(slotStart, 'HH:mm');

                const slotEnd = addMinutes(slotStart, taskDuration);
                blockedSlots.push({ start: slotStart, end: slotEnd });
                blockedSlots = sortAndMergeSlots(blockedSlots); 
                
                nextSearchTime = addMinutes(slotEnd, rules.taskInterval);
            }
        }
    }

    return mutableTasks;
}
