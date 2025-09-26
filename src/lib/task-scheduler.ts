
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

function getPermutations<T>(array: T[]): T[][] {
    if (array.length === 0) return [[]];
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

function findNextAvailableTime(searchStart: Date, duration: number, blockedSlots: BlockedSlot[]): Date {
    let currentTime = roundToNext5Minutes(searchStart);

    while (true) {
        const overlappingSlot = blockedSlots.find(slot => currentTime < slot.end && currentTime >= slot.start);
        if (overlappingSlot) {
            currentTime = roundToNext5Minutes(overlappingSlot.end);
            continue;
        }

        const nextBlock = blockedSlots.find(slot => slot.start > currentTime);

        if (!nextBlock) {
             return currentTime;
        }
        
        const availableTime = (nextBlock.start.getTime() - currentTime.getTime()) / (1000 * 60);

        if (availableTime >= duration) {
            return currentTime;
        } else {
            currentTime = roundToNext5Minutes(nextBlock.end);
        }
    }
}

export function autoScheduleTasks(allTasks: Task[], rules: ScheduleRule = defaultScheduleRules): Task[] {
    const todayStart = startOfToday();
    const now = new Date();
    
    let mutableTasks: Task[] = JSON.parse(JSON.stringify(allTasks));

    // Step 1: Pre-process and categorize tasks
    const fixedTasks: Task[] = [];
    const tasksToSchedule: Task[] = [];

    mutableTasks.forEach(task => {
        if (task.isCompleted) return;
        if (!task.isMyDay) return;

        const isLeftover = (task.myDaySetDate && isBefore(parseISO(task.myDaySetDate), todayStart)) || (task.dueDate && isBefore(parseISO(task.dueDate), todayStart));
        
        if (task.isFixed && task.startTime && !isLeftover) {
            fixedTasks.push(task);
        } else {
            // Reset leftover tasks
            if (isLeftover) {
                task.isFixed = false;
                task.startTime = undefined;
            }
            tasksToSchedule.push(task);
        }
    });

    if (tasksToSchedule.length === 0) {
        return mutableTasks;
    }

    const workStart = parseTimeString(rules.workStart, todayStart);
    const workEnd = parseTimeString(rules.workEnd, todayStart);
    const schedulingStartTime = roundToNext5Minutes(max([now, workStart]));

    // Step 2: Build initial blocked slots from fixed tasks and rules
    let baseBlockedSlots: BlockedSlot[] = [
        { start: startOfToday(), end: schedulingStartTime }, 
        { start: workEnd, end: endOfDay(todayStart) },
        { start: parseTimeString(rules.lunchBreak.start, todayStart), end: parseTimeString(rules.lunchBreak.end, todayStart) },
        { start: parseTimeString(rules.dinnerBreak.start, todayStart), end: parseTimeString(rules.dinnerBreak.end, todayStart) }
    ];

    fixedTasks.forEach(task => {
        try {
            const fixedStart = parse(task.startTime!, 'HH:mm', todayStart);
            if (fixedStart < workEnd) { // Only consider fixed tasks within work hours as blockers
                const duration = task.duration || rules.defaultDuration;
                const fixedEnd = addMinutes(fixedStart, duration);
                baseBlockedSlots.push({ start: fixedStart, end: addMinutes(fixedEnd, rules.taskInterval) });
            }
        } catch (e) {
            console.error(`Error parsing fixed task time: ${task.startTime}`, e);
        }
    });

    const initialBlockedSlots = sortAndMergeSlots(baseBlockedSlots);
    
    // Step 3: Permutation and Cost Calculation
    const taskPermutations = getPermutations(tasksToSchedule);
    
    let bestSchedule: Task[] | null = null;
    let minCost = Infinity;

    for (const permutation of taskPermutations) {
        let currentBlockedSlots = [...initialBlockedSlots];
        let scheduledPermutation: Task[] = [];
        let cost = 0;
        let delayedItems = 0;
        let crossBreakItems = 0;

        for (const [index, task] of permutation.entries()) {
            const duration = task.duration || rules.defaultDuration;
            
            const startTime = findNextAvailableTime(schedulingStartTime, duration, currentBlockedSlots);
            const endTime = addMinutes(startTime, duration);

            const scheduledTask = { ...task, startTime: format(startTime, 'HH:mm') };
            scheduledPermutation.push(scheduledTask);

            currentBlockedSlots.push({ start: startTime, end: addMinutes(endTime, rules.taskInterval) });
            currentBlockedSlots = sortAndMergeSlots(currentBlockedSlots);

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
            const lastEndTime = addMinutes(lastTaskStartTime, lastTask.duration || rules.defaultDuration);
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
