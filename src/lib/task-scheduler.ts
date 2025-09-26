
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

// --- TIME UTILS ---
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

// --- PERMUTATION UTILS ---
function getUniquePermutations<T>(array: T[], areEqual: (a: T, b: T) => boolean): T[][] {
    const result: T[][] = [];
    const counts = new Map<T, number>();
    const uniqueItems: T[] = [];

    for (const item of array) {
        let found = false;
        for (const uniqueItem of uniqueItems) {
            if (areEqual(item, uniqueItem)) {
                counts.set(uniqueItem, (counts.get(uniqueItem) || 0) + 1);
                found = true;
                break;
            }
        }
        if (!found) {
            uniqueItems.push(item);
            counts.set(item, 1);
        }
    }
    
    function permute(currentPerm: T[], remainingCounts: Map<T, number>) {
        if (currentPerm.length === array.length) {
            result.push([...currentPerm]);
            return;
        }

        for (const item of uniqueItems) {
            if (remainingCounts.get(item)! > 0) {
                currentPerm.push(item);
                remainingCounts.set(item, remainingCounts.get(item)! - 1);
                permute(currentPerm, remainingCounts);
                remainingCounts.set(item, remainingCounts.get(item)! + 1);
                currentPerm.pop();
            }
        }
    }

    permute([], counts);
    return result;
}

// --- SCHEDULING LOGIC ---
function findNextAvailableTime(searchStart: Date, duration: number, blockedSlots: BlockedSlot[]): Date {
    let currentTime = roundToNext5Minutes(searchStart);

    while (true) {
        const overlappingSlot = blockedSlots.find(slot => currentTime < slot.end && addMinutes(currentTime, duration) > slot.start);
        
        if (overlappingSlot) {
            currentTime = roundToNext5Minutes(overlappingSlot.end);
            continue;
        }
        return currentTime;
    }
}

function runHeuristicSchedule(tasksToSchedule: Task[], initialBlockedSlots: BlockedSlot[], rules: ScheduleRule): Task[] {
    const todayStart = startOfToday();
    const now = new Date();
    const schedulingStartTime = roundToNext5Minutes(max([now, parseTimeString(rules.workStart, todayStart)]));

    tasksToSchedule.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        if (a.isImportant) scoreA += 500;
        if (b.isImportant) scoreB += 500;

        if (a.dueDate) {
            const daysUntil = (parseISO(a.dueDate).getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24);
            scoreA += 1000 / (daysUntil + 1);
        }
        if (b.dueDate) {
            const daysUntil = (parseISO(b.dueDate).getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24);
            scoreB += 1000 / (daysUntil + 1);
        }
        
        const daysSinceA = (todayStart.getTime() - parseISO(a.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        scoreA += 10 / (daysSinceA + 1);
        const daysSinceB = (todayStart.getTime() - parseISO(b.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        scoreB += 10 / (daysSinceB + 1);

        return scoreB - scoreA;
    });

    let currentBlockedSlots = [...initialBlockedSlots];
    const scheduledTasks: Task[] = [];
    
    for (const task of tasksToSchedule) {
        const duration = task.duration || rules.defaultDuration;
        const startTime = findNextAvailableTime(schedulingStartTime, duration, currentBlockedSlots);
        const endTime = addMinutes(startTime, duration);

        const scheduledTask = { ...task, startTime: format(startTime, 'HH:mm') };
        scheduledTasks.push(scheduledTask);

        currentBlockedSlots.push({ start: startTime, end: addMinutes(endTime, rules.taskInterval) });
        currentBlockedSlots = sortAndMergeSlots(currentBlockedSlots);
    }
    
    return scheduledTasks;
}

export function autoScheduleTasks(allTasks: Task[], rules: ScheduleRule = defaultScheduleRules): Task[] {
    const todayStart = startOfToday();
    const now = new Date();

    const fixedTasks: Task[] = [];
    const tasksToSchedule: Task[] = [];

    allTasks.forEach(task => {
        if (task.isCompleted) return;
        
        const isSetForTodayOrFuture = task.isMyDay && (!task.myDaySetDate || !isBefore(parseISO(task.myDaySetDate), todayStart));

        if (task.isFixed && task.startTime && isSetForTodayOrFuture) {
            fixedTasks.push(task);
        } else if (task.isMyDay) {
            tasksToSchedule.push({...task, startTime: undefined, isFixed: false});
        }
    });

    if (tasksToSchedule.length === 0) {
        return allTasks;
    }

    const workStart = parseTimeString(rules.workStart, todayStart);
    const workEnd = parseTimeString(rules.workEnd, todayStart);
    const schedulingStartTime = roundToNext5Minutes(max([now, workStart]));

    let baseBlockedSlots: BlockedSlot[] = [
        { start: startOfToday(), end: schedulingStartTime },
        { start: workEnd, end: endOfDay(todayStart) },
        { start: parseTimeString(rules.lunchBreak.start, todayStart), end: parseTimeString(rules.lunchBreak.end, todayStart) },
        { start: parseTimeString(rules.dinnerBreak.start, todayStart), end: parseTimeString(rules.dinnerBreak.end, todayStart) }
    ];

    fixedTasks.forEach(task => {
        try {
            const fixedStart = parse(task.startTime!, 'HH:mm', todayStart);
            const duration = task.duration || rules.defaultDuration;
            const fixedEnd = addMinutes(fixedStart, duration);
            baseBlockedSlots.push({ start: fixedStart, end: addMinutes(fixedEnd, rules.taskInterval) });
        } catch (e) {
            console.error(`Error parsing fixed task time: ${task.startTime}`, e);
        }
    });

    const initialBlockedSlots = sortAndMergeSlots(baseBlockedSlots);

    // --- HYBRID STRATEGY ---
    if (tasksToSchedule.length > 8) {
        const scheduledFromHeuristic = runHeuristicSchedule(tasksToSchedule, initialBlockedSlots, rules);
        return allTasks.map(task => scheduledFromHeuristic.find(st => st.id === task.id) || task);
    }
    
    // --- FULL PERMUTATION FOR SMALLER SETS ---
    const areTasksEqual = (a: Task, b: Task): boolean => {
        const isDueTodayA = a.dueDate ? format(parseISO(a.dueDate), 'yyyy-MM-dd') === format(todayStart, 'yyyy-MM-dd') : false;
        const isDueTodayB = b.dueDate ? format(parseISO(b.dueDate), 'yyyy-MM-dd') === format(todayStart, 'yyyy-MM-dd') : false;

        return !isDueTodayA && !isDueTodayB &&
               a.isImportant === b.isImportant &&
               (a.duration || rules.defaultDuration) === (b.duration || rules.defaultDuration);
    };

    const taskPermutations = getUniquePermutations(tasksToSchedule, areTasksEqual);
    
    let bestSchedule: Task[] | null = null;
    let minCost = Infinity;

    for (const permutation of taskPermutations) {
        let currentBlockedSlots = [...initialBlockedSlots];
        let scheduledPermutation: Task[] = [];
        let cost = 0;
        let delayedItems = 0;
        let crossBreakItems = 0;
        let lastEndTime: Date | null = null;

        for (const [index, task] of permutation.entries()) {
            const duration = task.duration || rules.defaultDuration;
            const startTime = findNextAvailableTime(schedulingStartTime, duration, currentBlockedSlots);
            const endTime = addMinutes(startTime, duration);

            const scheduledTask = { ...task, startTime: format(startTime, 'HH:mm') };
            scheduledPermutation.push(scheduledTask);

            currentBlockedSlots.push({ start: startTime, end: addMinutes(endTime, rules.taskInterval) });
            // No need to sort inside the loop, can be optimized, but safer for now.
            currentBlockedSlots = sortAndMergeSlots(currentBlockedSlots); 
            
            lastEndTime = endTime;

            if (task.isImportant) {
                cost += index * 2;
            }
            if (task.dueDate && isBefore(parseISO(task.dueDate), endTime)) {
                delayedItems++;
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

        if (lastEndTime) {
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
        return allTasks;
    }
    
    return allTasks.map(task => bestSchedule!.find(st => st.id === task.id) || task);
}
