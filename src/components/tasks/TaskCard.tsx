
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { Task, TaskList } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Star,
  Sun,
  Trash2,
  Pencil,
  Clock,
  Calendar,
  Hourglass,
  ListTree,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, parseISO } from 'date-fns';

interface TaskCardProps {
  task: Task;
  list: TaskList;
  view: "compact" | "detail";
  onDelete: (taskId: string) => void;
  onEdit: (taskId: string) => void;
  onUpdate: (taskId: string, updatedTask: Partial<Task>) => void;
  onToggleImportant: (taskId: string) => void;
  onToggleMyDay: (taskId: string) => void;
  onToggleCompleted: (taskId: string) => void;
}

export function TaskCard({ task, list, view, onDelete, onEdit, onUpdate, onToggleImportant, onToggleMyDay, onToggleCompleted }: TaskCardProps) {
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


  const handleToggleExpand = () => {
    if (view === "compact") {
      setIsExpanded(!isExpanded);
    }
  };
  
  const handleToggleImportantClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onToggleImportant(task.id);
  };
  
  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onDelete(task.id);
  };

  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onEdit(task.id);
  };

  const handleSunClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onToggleMyDay(task.id);
  };

  // --- Title ---
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTitle(e.target.value);
  };
  const handleTitleBlur = () => {
    onUpdate(task.id, { title: editingTitle });
    setIsEditingTitle(false);
  };
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleTitleBlur();
  };
  
  // --- Description ---
  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditingDesc(e.target.value);
  };
  const handleDescBlur = () => {
    onUpdate(task.id, { description: editingDesc });
    setIsEditingDesc(false);
  };

  // --- Start Time ---
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingStartTime(e.target.value);
  };
  const handleStartTimeBlur = () => {
    onUpdate(task.id, { startTime: editingStartTime });
    setIsEditingStartTime(false);
  };

  // --- Due Date ---
  const handleDueDateChange = (date: Date | undefined) => {
    setEditingDueDate(date);
    onUpdate(task.id, { dueDate: date ? format(date, 'yyyy-MM-dd') : undefined });
    setIsEditingDueDate(false);
  };
  
  // --- Duration ---
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditingDuration(Number(e.target.value));
  };
  const handleDurationBlur = () => {
      onUpdate(task.id, { duration: editingDuration });
      setIsEditingDuration(false);
  };


  const DetailRow = ({
    icon: Icon,
    label,
    value,
    onClick,
    isEditing,
    InputComponent,
  }: {
    icon: React.ElementType;
    label: string;
    value?: React.ReactNode;
    onClick?: () => void;
    isEditing?: boolean;
    InputComponent?: React.ReactNode;
  }) => (
    <div className="flex items-start text-sm text-muted-foreground min-h-[24px]">
      <Icon className="w-4 h-4 mr-2 mt-1 flex-shrink-0" strokeWidth={1.5} />
      <span className="font-medium w-20 flex-shrink-0">{label}:</span>
      {isEditing && view === 'detail' ? (
         InputComponent
      ) : (
        <span onClick={onClick} className={cn("flex-grow", onClick && "cursor-text")}>{value}</span>
      )}
    </div>
  );

  React.useEffect(() => {
    setIsExpanded(view === "detail");
  }, [view]);
  
  React.useEffect(() => {
    if (view !== 'detail') {
        setIsEditingTitle(false);
        setIsEditingDesc(false);
        setIsEditingStartTime(false);
        setIsEditingDueDate(false);
        setIsEditingDuration(false);
    }
  }, [view]);

  React.useEffect(() => {
    setEditingTitle(task.title);
    setEditingDesc(task.description || "");
    setEditingStartTime(task.startTime || "");
    setEditingDueDate(task.dueDate ? parseISO(task.dueDate) : undefined);
    setEditingDuration(task.duration || 0);
  }, [task]);


  const ListIcon = list.icon;

  return (
    <div
      className="bg-card rounded-2xl shadow-soft transition-all duration-300 ease-in-out"
      onClick={handleToggleExpand}
    >
      <div className="flex items-center p-4">
        <div
          className="w-1 h-full self-stretch rounded-l-sm mr-3"
          style={{ backgroundColor: list.color, minHeight: '40px' }}
        ></div>
        <Checkbox
          id={`task-${task.id}`}
          checked={task.isCompleted}
          onCheckedChange={() => onToggleCompleted(task.id)}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}
          className="w-6 h-6 rounded-full data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-primary/50"
        />
        
        {ListIcon && (
            <ListIcon 
                className="w-5 h-5 ml-3" 
                style={{ color: list.color }} 
                strokeWidth={1.5} 
            />
        )}

        <div className="flex-grow ml-3">
          { isEditingTitle && view === 'detail' ? (
              <Input
                value={editingTitle}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                className="h-7 p-0 text-[17px] font-medium border-none focus-visible:ring-0"
                autoFocus
              />
          ) : (
            <p
              className={cn(
                "text-[17px] font-medium text-foreground",
                task.isCompleted && "line-through text-muted-foreground",
                view === 'detail' && "cursor-text"
              )}
              onClick={() => view === 'detail' && setIsEditingTitle(true)}
            >
              {task.title}
            </p>
          )}

          {task.startTime && !isEditingTitle && (
            <p className="text-[13px] text-muted-foreground">{task.startTime}</p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-2">
          <button onClick={handleEditClick}>
            <Pencil className="w-5 h-5 text-muted-foreground hover:text-primary" strokeWidth={1.5} />
          </button>
          <button onClick={handleToggleImportantClick}>
            <Star
              className={cn(
                "w-5 h-5 text-muted-foreground transition-colors hover:text-yellow-500",
                task.isImportant && "fill-yellow-400 text-yellow-500"
              )}
              strokeWidth={1.5}
            />
          </button>
          <button onClick={handleSunClick}>
            <Sun 
              className={cn(
                "w-5 h-5 text-muted-foreground hover:text-orange-500 transition-colors",
                task.isMyDay && "fill-orange-400 text-orange-500"
              )} 
              strokeWidth={1.5} 
            />
          </button>
          <button onClick={handleDeleteClick}>
            <Trash2 className="w-5 h-5 text-muted-foreground hover:text-destructive" strokeWidth={1.5} />
          </button>
        </div>
      </div>
      {(isExpanded || view === 'detail') && (
        <div className="px-4 pb-4 pl-12 space-y-3 animate-accordion-down">
          <DetailRow 
            icon={ListTree}
            label="Description"
            value={task.description || "Add a description..."}
            onClick={() => view === 'detail' && setIsEditingDesc(true)}
            isEditing={isEditingDesc}
            InputComponent={
                <Textarea
                    value={editingDesc}
                    onChange={handleDescChange}
                    onBlur={handleDescBlur}
                    className="h-auto flex-grow border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm bg-transparent"
                    autoFocus
                />
            }
          />
          <DetailRow 
            icon={Clock} 
            label="Start" 
            value={task.startTime || 'Not set'}
            onClick={() => view === 'detail' && setIsEditingStartTime(true)}
            isEditing={isEditingStartTime}
            InputComponent={
                <Input
                    type="time"
                    value={editingStartTime}
                    onChange={handleStartTimeChange}
                    onBlur={handleStartTimeBlur}
                    className="h-7 p-0 text-sm border-none focus-visible:ring-0 bg-transparent"
                    autoFocus
                />
            }
          />
          <DetailRow 
            icon={Calendar} 
            label="Due" 
            value={task.dueDate ? format(parseISO(task.dueDate), 'PPP') : 'Not set'}
            onClick={() => view === 'detail' && setIsEditingDueDate(true)}
            isEditing={isEditingDueDate}
            InputComponent={
              <Popover open={isEditingDueDate} onOpenChange={setIsEditingDueDate}>
                <PopoverTrigger asChild>
                  <button className="text-sm text-primary">
                    {editingDueDate ? format(editingDueDate, 'PPP') : 'Set Date'}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <CalendarComponent
                        mode="single"
                        selected={editingDueDate}
                        onSelect={handleDueDateChange}
                        initialFocus
                    />
                </PopoverContent>
              </Popover>
            }
          />
          <DetailRow 
            icon={Hourglass} 
            label="Duration" 
            value={task.duration ? `${task.duration} min` : 'Not set'}
            onClick={() => view === 'detail' && setIsEditingDuration(true)}
            isEditing={isEditingDuration}
            InputComponent={
              <div className="flex items-center gap-1">
                <Input 
                    type="number" 
                    value={editingDuration}
                    onChange={handleDurationChange}
                    onBlur={handleDurationBlur}
                    className="w-20 h-7 p-0 text-sm text-right border-none focus-visible:ring-0 bg-transparent"
                    min="0"
                    step="5"
                    autoFocus
                />
                <span className="text-sm">min</span>
              </div>
            }
          />
          {task.subtasks && task.subtasks.length > 0 && (
            <DetailRow
              icon={ListTree}
              label="Subtasks"
              value={`${task.subtasks.filter((st) => st.isCompleted).length} of ${task.subtasks.length} completed`}
            />
          )}
        </div>
      )}
    </div>
  );
}
