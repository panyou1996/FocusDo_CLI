'use client';

import * as React from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Subtask, Task, TaskList } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sun,
  Trash2,
  Clock,
  Calendar,
  Hourglass,
  ListTree,
  Plus,
  FileText,
  Pencil,
  Star,
  Pin,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, parseISO, addMinutes, parse, startOfToday, isBefore, differenceInDays } from 'date-fns';
import { Button } from "../ui/button";
import { useAppContext } from "@/context/AppContext";
import { getIcon } from "@/lib/icon-utils";
import { useLongPress } from "@/hooks/useLongPress";
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

interface TaskCardProps {
  task: Task;
  onUpdate: (taskId: string, updatedTask: Partial<Task>) => void;
  onToggleCompleted: (taskId: string) => void;
  list?: TaskList;
  view?: "compact" | "detail";
  status?: 'expired' | 'upcoming' | 'done' | 'leftover';
  onEdit?: (taskId: string) => void;
  onToggleImportant?: (taskId: string) => void;
  onToggleMyDay?: (taskId: string) => void;
  onToggleFixed?: (taskId: string) => void;
}

const getEndTime = (startTime: string, duration: number): string => {
    try {
        const startDate = parse(startTime, 'HH:mm', new Date());
        const endDate = addMinutes(startDate, duration);
        return format(endDate, 'HH:mm');
    } catch (error) {
        console.error("Error calculating end time:", error);
        return '';
    }
};

export function TaskCard({ task, list, view, status, onEdit, onUpdate, onToggleImportant, onToggleMyDay, onToggleFixed, onToggleCompleted }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(view === "detail");
  const { lists } = useAppContext();
  
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [editingTitle, setEditingTitle] = React.useState(task.title);

  const [isEditingDesc, setIsEditingDesc] = React.useState(false);
  const [editingDesc, setEditingDesc] = React.useState(task.description || "");

  const [isEditingStartTime, setIsEditingStartTime] = React.useState(false);
  const [editingStartTime, setEditingStartTime] = React.useState(task.startTime || "");

  const [isEditingDueDate, setIsEditingDueDate] = React.useState(false);
  const [editingDueDate, setEditingDueDate] = React.useState<Date | undefined>(
    task.dueDate ? parseISO(task.dueDate) : undefined
  );

  const [isEditingDuration, setIsEditingDuration] = React.useState(false);
  const [editingDuration, setEditingDuration] = React.useState(task.duration || 0);

  const [editingSubtasks, setEditingSubtasks] = React.useState<Subtask[]>(task.subtasks || []);
  const [newSubtask, setNewSubtask] = React.useState('');
  const [isAddingSubtask, setIsAddingSubtask] = React.useState(false);
  const [editingSubtaskId, setEditingSubtaskId] = React.useState<string | null>(null);
  const [editingSubtaskText, setEditingSubtaskText] = React.useState('');
  
  const handleToggleExpand = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-interactive]')) {
      return;
    }
    if (view === "compact") {
      setIsExpanded(!isExpanded);
    }
  };
  
  const { handlers } = useLongPress({
    onLongPress: (e) => {
        if (onToggleFixed) {
            if (Capacitor.isPluginAvailable('Haptics')) {
                Haptics.impact({ style: ImpactStyle.Medium });
            }
            onToggleFixed(task.id);
        }
    },
    onClick: handleToggleExpand,
  });

  const handleTitleBlur = () => {
    onUpdate(task.id, { title: editingTitle });
    setIsEditingTitle(false);
  };
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleTitleBlur();
  };
  
  const handleDescBlur = () => {
    onUpdate(task.id, { description: editingDesc });
    setIsEditingDesc(false);
  };

  const handleStartTimeBlur = () => {
    onUpdate(task.id, { startTime: editingStartTime });
    setIsEditingStartTime(false);
  };

  const handleDueDateChange = (date: Date | undefined) => {
    onUpdate(task.id, { dueDate: date ? format(date, 'yyyy-MM-dd') : undefined });
    setIsEditingDueDate(false);
  };
  
  const handleDurationBlur = () => {
      onUpdate(task.id, { duration: editingDuration });
      setIsEditingDuration(false);
  };

  const updateSubtasks = (newSubtasks: Subtask[]) => {
      onUpdate(task.id, { subtasks: newSubtasks });
  };

  const toggleSubtaskCompletion = (id: string) => {
      const newSubtasks = (task.subtasks || []).map(sub => sub.id === id ? { ...sub, isCompleted: !sub.isCompleted } : sub);
      updateSubtasks(newSubtasks);
  };

  const DetailRow = ({ icon: Icon, label, value, onClick, isEditing, InputComponent }: any) => (
    <div className="flex items-center text-sm text-muted-foreground min-h-[24px]">
      <Icon className="w-4 h-4 mr-2 flex-shrink-0" strokeWidth={1.5} />
      <span className="font-medium w-20 flex-shrink-0">{label}:</span>
      {isEditing ? (
         <div data-interactive className="flex-grow">{InputComponent}</div>
      ) : (
        <span data-interactive onClick={onClick} className={cn("flex-grow", onClick && "cursor-text")}>{value}</span>
      )}
    </div>
  );

  React.useEffect(() => {
    setIsExpanded(view === "detail");
  }, [view]);

  const ListIcon = list?.icon as React.ElementType;
  const cardIsExpanded = isExpanded || view === 'detail';
  const endTime = task.startTime && task.duration ? getEndTime(task.startTime, task.duration) : null;
  const isOverdue = task.dueDate && isBefore(parseISO(task.dueDate), startOfToday()) && !task.isCompleted;
  
  let timeDisplay = endTime ? `${task.startTime} - ${endTime}` : task.startTime;
  let delayMessage = '';

  if (isOverdue) {
    const daysDelayed = differenceInDays(startOfToday(), parseISO(task.dueDate as string));
    if (daysDelayed > 0) {
      delayMessage = ` (delayed ${daysDelayed} day${daysDelayed > 1 ? 's' : ''})`;
    }
    if (!timeDisplay) {
      timeDisplay = `Expired on ${format(parseISO(task.dueDate as string), 'M/d')}`;
    }
  }

  const renderListIcon = () => {
    if (!list || !ListIcon) return null;
    // ... (rest of the function remains the same)
  };

  return (
    <div className={'w-full relative'} {...handlers}>
        <motion.div 
            className="absolute left-0 top-0 bottom-0 bg-yellow-500 rounded-l-2xl"
            animate={{ width: task.isImportant ? 4 : 0 }}
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
        />
        <div className="flex items-center py-2">
          <div data-interactive onClick={(e) => e.stopPropagation()}>
            <Checkbox
              id={`task-${task.id}`}
              checked={task.isCompleted}
              onCheckedChange={() => onToggleCompleted(task.id)}
              className="w-5 h-5 rounded-full data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-primary/50"
            />
          </div>

          {renderListIcon()}

          <div className="flex-grow ml-3 min-w-0">
            {isEditingTitle ? (
              <Input
                data-interactive
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                className="h-7 p-0 text-base font-medium border-none focus-visible:ring-0 bg-transparent"
                autoFocus
              />
            ) : (
              <div className="relative">
                <p
                    className={cn(
                    'text-base font-medium text-foreground truncate',
                    task.isCompleted && 'text-muted-foreground'
                    )}
                    onClick={() => setIsEditingTitle(true)}
                >
                    {task.title}
                </p>
                <motion.div
                    className="absolute top-1/2 left-0 h-0.5 bg-muted-foreground"
                    initial={{ width: 0 }}
                    animate={{ width: task.isCompleted ? "100%" : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                />
              </div>
            )}

            {!isEditingTitle && timeDisplay && (
                <p className={cn('text-xs text-muted-foreground')}>
                  {timeDisplay}
                  {delayMessage && <span className={cn(isOverdue && 'text-destructive font-semibold')}>{delayMessage}</span>}
                </p>
              )}
          </div>

          {onEdit && <div data-interactive className="flex items-center gap-2 ml-2">
            <button onClick={() => onEdit(task.id)}>
              <Pencil className={'w-5 h-5 text-muted-foreground transition-colors hover:text-primary'} strokeWidth={1.5} />
            </button>
          </div>}
        </div>

        <AnimatePresence initial={false}>
        {cardIsExpanded && (
          <motion.div 
            key="content"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="pl-8 pt-2 pb-2 space-y-3 overflow-hidden"
          >
            <DetailRow
              icon={FileText}
              label="Description"
              value={task.description || 'Add a description...'}
              onClick={() => setIsEditingDesc(true)}
              isEditing={isEditingDesc}
              InputComponent={
                <Textarea
                  value={editingDesc}
                  onChange={(e) => setEditingDesc(e.target.value)}
                  onBlur={handleDescBlur}
                  className="h-auto flex-grow border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm bg-transparent"
                  autoFocus
                />
              }
            />
            <DetailRow
              icon={Calendar}
              label="Due"
              value={task.dueDate ? format(parseISO(task.dueDate), 'PPP') : 'Not set'}
              onClick={() => setIsEditingDueDate(true)}
              isEditing={isEditingDueDate}
              InputComponent={
                <Popover open={isEditingDueDate} onOpenChange={setIsEditingDueDate}>
                  <PopoverTrigger asChild>
                    <button className="text-sm text-primary">
                      {editingDueDate ? format(editingDueDate, 'PPP') : 'Set Date'}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent mode="single" selected={editingDueDate} onSelect={handleDueDateChange} initialFocus />
                  </PopoverContent>
                </Popover>
              }
            />
            <DetailRow
              icon={Hourglass}
              label="Duration"
              value={task.duration ? `${task.duration} min` : 'Not set'}
              onClick={() => setIsEditingDuration(true)}
              isEditing={isEditingDuration}
              InputComponent={
                <div className="flex items-center gap-1">
                  <Input type="number" value={editingDuration} onChange={(e) => setEditingDuration(Number(e.target.value))} onBlur={handleDurationBlur} className="w-20 h-7 p-0 text-sm text-right border-none focus-visible:ring-0 bg-transparent" min="0" step="5" autoFocus />
                  <span className="text-sm">min</span>
                </div>
              }
            />
          </motion.div>
        )}
        </AnimatePresence>
    </div>
  );
}