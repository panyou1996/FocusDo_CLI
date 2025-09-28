'use client';

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Task, TaskList } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Calendar, Hourglass, FileText, Pencil } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, parseISO, addMinutes, parse } from 'date-fns';
import { Button } from "../ui/button";
import { getIcon } from "@/lib/icon-utils";

interface TaskCardProps {
  task: Task;
  onUpdate: (taskId: string, updatedTask: Partial<Task>) => void;
  onToggleCompleted: (taskId: string) => void;
  list?: TaskList;
  view?: "compact" | "detail";
  hideCheckbox?: boolean;
}

export function TaskCard({ task, list, view, onUpdate, onToggleCompleted, hideCheckbox }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(view === "detail");
  
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

  const handleTitleBlur = () => {
    onUpdate(task.id, { title: editingTitle });
    setIsEditingTitle(false);
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

  const DetailRow = ({ icon: Icon, isEditing, InputComponent, children }: any) => (
    <div className="flex items-center text-sm text-muted-foreground min-h-[24px] gap-2">
      <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
      {isEditing ? 
        <div data-interactive className="flex-grow">{InputComponent}</div> :
        <div data-interactive className="flex-grow">{children}</div>
      }
    </div>
  );

  React.useEffect(() => {
    setIsExpanded(view === "detail");
  }, [view]);

  const ListIcon = list ? getIcon(list.icon) : Pencil;

  return (
    <div className={'w-full relative'}>
        <div className="flex py-2">
          {!hideCheckbox && <div data-interactive onClick={(e) => e.stopPropagation()}>
            <Checkbox
              id={`task-card-cb-${task.id}`}
              checked={task.isCompleted}
              onCheckedChange={() => onToggleCompleted(task.id)}
              className="w-5 h-5 rounded-md data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-primary/50"
            />
          </div>}

          {ListIcon && <div className="w-8 h-8 flex items-center justify-center">
            <ListIcon className="w-5 h-5" style={{ color: list?.color }} strokeWidth={1.5} />
          </div>}

          <div className="flex-grow ml-2 min-w-0">
            <p className={cn('text-base font-medium text-foreground truncate', task.isCompleted && 'text-muted-foreground line-through')}>
                {task.title}
            </p>
          </div>
        </div>

        <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div 
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1, transition: { duration: 0.3, ease: 'easeInOut' } }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.2, ease: 'easeInOut' } }}
            className="pl-12 pr-4 pb-2 space-y-3 overflow-hidden"
          >
            <DetailRow
              icon={FileText}
              isEditing={isEditingDesc}
              InputComponent={
                <Textarea value={editingDesc} onChange={(e) => setEditingDesc(e.target.value)} onBlur={handleDescBlur} className="h-auto flex-grow border-none focus-visible:ring-0 p-0 text-sm bg-transparent" autoFocus />
              }
            >
                <span onClick={() => setIsEditingDesc(true)} className="cursor-text">{task.description || 'Add a description...'}</span>
            </DetailRow>

            <div className="flex items-center gap-4">
                <DetailRow
                  icon={Clock}
                  isEditing={isEditingStartTime}
                  InputComponent={
                    <Input type="time" value={editingStartTime} onChange={(e) => setEditingStartTime(e.target.value)} onBlur={handleStartTimeBlur} className="h-7 p-0 text-sm border-none focus-visible:ring-0 bg-transparent" autoFocus />
                  }
                >
                    <span onClick={() => setIsEditingStartTime(true)}>{task.startTime || 'Set Start'}</span>
                </DetailRow>
                <DetailRow
                  icon={Hourglass}
                  isEditing={isEditingDuration}
                  InputComponent={
                    <div className="flex items-center gap-1">
                      <Input type="number" value={editingDuration} onChange={(e) => setEditingDuration(Number(e.target.value))} onBlur={handleDurationBlur} className="w-16 h-7 p-0 text-sm border-none focus-visible:ring-0 bg-transparent" min="0" step="5" autoFocus />
                      <span>min</span>
                    </div>
                  }
                >
                    <span onClick={() => setIsEditingDuration(true)}>{task.duration ? `${task.duration} min` : 'Set Duration'}</span>
                </DetailRow>
            </div>

            <DetailRow
              icon={Calendar}
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
            >
                <span onClick={() => setIsEditingDueDate(true)}>{task.dueDate ? format(parseISO(task.dueDate), 'PPP') : 'Set Due Date'}</span>
            </DetailRow>

          </motion.div>
        )}
        </AnimatePresence>
    </div>
  );
}