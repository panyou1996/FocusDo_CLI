
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

  const handleToggleExpand = () => {
    if (view === "compact") {
      setIsExpanded(!isExpanded);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleCompleted(task.id);
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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    onUpdate(task.id, { title: editingTitle });
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    }
  };
  
  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditingDesc(e.target.value);
  };

  const handleDescBlur = () => {
    onUpdate(task.id, { description: editingDesc });
    setIsEditingDesc(false);
  };


  const DetailRow = ({
    icon: Icon,
    label,
    value,
    onClick,
    isEditing,
    onEditChange,
    onEditBlur,
    editValue,
  }: {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
    onClick?: () => void;
    isEditing?: boolean;
    onEditChange?: (e: any) => void;
    onEditBlur?: () => void;
    editValue?: string;
  }) => (
    <div className="flex items-start text-sm text-gray-600">
      <Icon className="w-4 h-4 mr-2 mt-1" strokeWidth={1.5} />
      <span className="font-medium w-20">{label}:</span>
      {isEditing ? (
         <Textarea
          value={editValue}
          onChange={onEditChange}
          onBlur={onEditBlur}
          className="h-auto flex-grow border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm"
          autoFocus
        />
      ) : (
        <span onClick={onClick} className="flex-grow cursor-text">{value}</span>
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
    }
  }, [view]);

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
            isEditing={isEditingDesc && view === 'detail'}
            onEditChange={handleDescChange}
            onEditBlur={handleDescBlur}
            editValue={editingDesc}
          />
          <DetailRow icon={Clock} label="Start" value={task.startTime || 'Not set'} />
          <DetailRow icon={Calendar} label="Due" value={task.dueDate || 'Not set'} />
          <DetailRow icon={Hourglass} label="Duration" value={task.duration ? `${task.duration} min` : 'Not set'} />
          {task.subtasks && (
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
