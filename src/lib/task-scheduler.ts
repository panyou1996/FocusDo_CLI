
'use client';

import type { Task } from './types';
import { 
  addMinutes, 
  format, 
  isBefore, 
  max, 
  parseISO, 
  startOfToday, 
  differenceInHours, 
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

// Helper function to generate all permutations of an array
function getPermutations<T>(array: T[]): T[][] {
    if (array.length === 0) return [[]];
    // Performance guard to prevent browser from freezing.
    if (array.length > 8) { 
        console.warn(`Permutation attempt on ${array.length} items is too slow. Returning a single array.`);
        return [array];
    }
    const firstEl = array[0];
    const rest = array.slice(1);

    const permsWithoutFirst = getPermutations(rest);
    const allPermutations: T[][] = [];

    permsWithoutFirst.forEach(perm => {
        for (let i = 0; i <= perm.length; i++) {
            const permWithFirst = [...perm.slice(0, i), firstEl, ...perm.slice(i)];
            allPermutations.push(permWithFirst);
        }
    });

    return allPermutations;
}

function roundToNext5Minutes(date: Date): Date {
    const minutes = date.getMinutes();
    const remainder = minutes % 5;
    
    if (remainder === 0 && date.getSeconds() === 0 && date.getMilliseconds() === 0) {
      return date;
    }
    
    const roundedMinutes = (Math.floor(minutes / 5) + 1) * 5;
    const newDate = new Date(date.getTime());
    newDate.setMinutes(roundedMinutes, 0, 0);
    return newDate;
}

function parseTimeString(timeStr: string, today: Date): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date(today);
    date.setHours(hours, minutes, 0, 0);
    return date;
}

function sortAndMergeSlots(slots: BlockedSlot[]): BlockedSlot[] {
    if (slots.length === 0) return [];
    
    const sortedSlots = [...slots].sort((a, b) => a.start.getTime() - b.start.getTime());

    const merged: BlockedSlot[] = [sortedSlots[0]];
    for (let i = 1; i < sortedSlots.length; i++) {
        const last = merged[merged.length - 1];
        const current = sortedSlots[i];
        if (current.start < last.end) {
            last.end = max([last.end, current.end]);
        } else {
            merged.push(current);
        }
    }
    return merged;
}

function findNextAvailableTime(searchStart: Date, blockedSlots: BlockedSlot[]): Date {
    let currentTime = roundToNext5Minutes(searchStart);

    while (true) {
        const overlappingSlot = blockedSlots.find(slot => currentTime >= slot.start && currentTime < slot.end);
        if (overlappingSlot) {
            currentTime = roundToNext5Minutes(overlappingSlot.end);
        } else {
            return currentTime;
        }
    }
}


function getEffectiveEndTime(startTime: Date, duration: number, blockedSlots: BlockedSlot[]): Date {
    let remainingDuration = duration;
    let currentTime = new Date(startTime);

    while (remainingDuration > 0) {
        // Find the next block that starts *after* the current time
        const nextBlock = blockedSlots.find(slot => slot.start > currentTime);
        
        const timeUntilNextBlock = nextBlock ? (nextBlock.start.getTime() - currentTime.getTime()) / (1000 * 60) : Infinity;

        if (timeUntilNextBlock >= remainingDuration) {
            // Enough space in this segment
            currentTime = addMinutes(currentTime, remainingDuration);
            remainingDuration = 0;
        } else {
            // Not enough space, jump over the block
            remainingDuration -= timeUntilNextBlock;
            currentTime = roundToNext5Minutes(nextBlock!.end);
        }
    }
    return currentTime;
}


export function autoScheduleTasks(allTasks: Task[], rules: ScheduleRule = defaultScheduleRules): Task[] {
    const todayStart = startOfToday();
    const now = new Date();
    
    let mutableTasks: Task[] = JSON.parse(JSON.stringify(allTasks));

    // Step 1: Pre-process tasks. Reset any task that is overdue.
    mutableTasks.forEach(task => {
        if (!task.isCompleted) {
            const myDaySetDate = task.myDaySetDate ? parseISO(task.myDaySetDate) : parseISO(task.createdAt);
            const isLeftover = isBefore(myDaySetDate, todayStart);
            const isDueDatePassed = task.dueDate && isBefore(parseISO(task.dueDate), todayStart);

            if (isLeftover || isDueDatePassed) {
                task.isFixed = false;
                task.startTime = undefined;
            }
        }
    });
    
    const workStart = parseTimeString(rules.workStart, todayStart);
    const workEnd = parseTimeString(rules.workEnd, todayStart);
    const schedulingStartTime = roundToNext5Minutes(max([now, workStart]));

    // Step 2: Build initial blocked slots
    let baseBlockedSlots: BlockedSlot[] = [
        { start: startOfToday(), end: schedulingStartTime }, // Block time from start of day until now
        { start: workEnd, end: endOfDay(todayStart) }, // Block time after work
        { start: parseTimeString(rules.lunchBreak.start, todayStart), end: parseTimeString(rules.lunchBreak.end, todayStart) },
        { start: parseTimeString(rules.dinnerBreak.start, todayStart), end: parseTimeString(rules.dinnerBreak.end, todayStart) }
    ];
    
    // **KEY FIX**: Correctly add all fixed tasks to the blocked slots.
    const fixedTasks = mutableTasks.filter(t => t.isFixed && !t.isCompleted && t.startTime);
    fixedTasks.forEach(task => {
        try {
            // Parse the time relative to today
            const fixedStart = parse(task.startTime!, 'HH:mm', todayStart);
            const duration = task.duration || rules.defaultDuration;
            const fixedEnd = addMinutes(fixedStart, duration);
            baseBlockedSlots.push({ start: fixedStart, end: fixedEnd });
        } catch (e) {
            console.error(`Error parsing fixed task time: ${task.startTime}`, e);
        }
    });

    const initialBlockedSlots = sortAndMergeSlots(baseBlockedSlots);

    const tasksToSchedule = mutableTasks.filter(
        task => task.isMyDay && !task.isCompleted && !task.isFixed
    );
    
    if (tasksToSchedule.length === 0) {
        return mutableTasks;
    }

    // Step 3: Permutation and Cost Calculation
    const taskPermutations = getPermutations(tasksToSchedule);
    
    let bestSchedule: Task[] | null = null;
    let minCost = Infinity;

    for (const permutation of taskPermutations) {
        let currentBlockedSlots = [...initialBlockedSlots]; // Use a copy for each permutation
        let scheduledPermutation: Task[] = [];
        let cost = 0;
        let delayedItems = 0;
        let crossBreakItems = 0;

        for (const [index, task] of permutation.entries()) {
            const duration = task.duration || rules.defaultDuration;
            
            const startTime = findNextAvailableTime(schedulingStartTime, currentBlockedSlots);
            
            const endTime = getEffectiveEndTime(startTime, duration, currentBlockedSlots);

            const scheduledTask = {
                ...task,
                startTime: format(startTime, 'HH:mm')
            };
            scheduledPermutation.push(scheduledTask);

            // **KEY FIX**: Add the current task's time to the blocked slots for this permutation
            currentBlockedSlots.push({ start: startTime, end: addMinutes(endTime, rules.taskInterval) });
            currentBlockedSlots = sortAndMergeSlots(currentBlockedSlots);

            // --- Calculate Cost ---
            if (task.dueDate && isBefore(parseISO(task.dueDate), endTime)) {
                delayedItems++;
            }
            if (task.isImportant) {
                cost += index * 2;
            }

            const lunchBreak = { start: parseTimeString(rules.lunchBreak.start, todayStart), end: parseTimeString(rules.lunchBreak.end, todayStart) };
            if (isBefore(startTime, lunchBreak.start) && isBefore(lunchBreak.end, endTime)) {
                crossBreakItems++;
            }
            const dinnerBreak = { start: parseTimeString(rules.dinnerBreak.start, todayStart), end: parseTimeString(rules.dinnerBreak.end, todayStart) };
             if (isBefore(startTime, dinnerBreak.start) && isBefore(dinnerBreak.end, endTime)) {
                crossBreakItems++;
            }
        }
        
        cost += delayedItems * 5;
        cost += crossBreakItems * 1;
        
        const lastTask = scheduledPermutation.length > 0 ? scheduledPermutation[scheduledPermutation.length - 1] : null;
        if (lastTask) {
            const lastTaskStartTime = parse(lastTask.startTime!, 'HH:mm', todayStart);
            const lastEndTime = getEffectiveEndTime(lastTaskStartTime, lastTask.duration || rules.defaultDuration, initialBlockedSlots);
            const EOD_Time = parseTimeString('17:30', todayStart);
            if (isBefore(EOD_Time, lastEndTime)) {
                cost += differenceInHours(lastEndTime, EOD_Time) * 2;
            }
        }

        if (cost < minCost) {
            minCost = cost;
            bestSchedule = scheduledPermutation;
        }
    }

    if (!bestSchedule) {
        return mutableTasks;
    }
    
    // Step 4: Apply the best schedule
    const finalTasks = mutableTasks.map(task => {
        const scheduledVersion = bestSchedule!.find(st => st.id === task.id);
        return scheduledVersion || task;
    });

    return finalTasks;
}
