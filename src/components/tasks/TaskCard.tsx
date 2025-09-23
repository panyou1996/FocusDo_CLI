"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { Task, TaskList } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Star,
  Sun,
  Trash2,
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
  onToggleImportant: (taskId: string) => void;
  onToggleMyDay: (taskId: string) => void;
  onToggleCompleted: (taskId: string) => void;
}

export function TaskCard({ task, list, view, onDelete, onToggleImportant, onToggleMyDay, onToggleCompleted }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(view === "detail");

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

  const handleSunClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onToggleMyDay(task.id);
  };

  const DetailRow = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
  }) => (
    <div className="flex items-center text-sm text-gray-600">
      <Icon className="w-4 h-4 mr-2" strokeWidth={1.5} />
      <span>{label}: {value}</span>
    </div>
  );

  React.useEffect(() => {
    setIsExpanded(view === "detail");
  }, [view]);

  return (
    <div
      className="bg-card rounded-2xl shadow-soft transition-all duration-300 ease-in-out"
      onClick={handleToggleExpand}
    >
      <div className="flex items-center p-4">
        <div
          className="w-1 h-full self-stretch rounded-l-sm mr-4"
          style={{ backgroundColor: list.color, minHeight: '40px' }}
        ></div>
        <Checkbox
          id={`task-${task.id}`}
          checked={task.isCompleted}
          onCheckedChange={() => onToggleCompleted(task.id)}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}
          className="w-6 h-6 rounded-full data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-primary/50"
        />
        <div className="flex-grow ml-3">
          <p
            className={cn(
              "text-[17px] font-medium text-foreground",
              task.isCompleted && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </p>
          {task.startTime && (
            <p className="text-[13px] text-muted-foreground">{task.startTime}</p>
          )}
        </div>
        <div className="flex items-center gap-3 ml-2">
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
        <div className="px-4 pb-4 pl-12 space-y-2 animate-accordion-down">
          {task.description && <p className="text-[14px] text-gray-700">{task.description}</p>}
          {task.startTime && <DetailRow icon={Clock} label="Start" value={task.startTime} />}
          {task.dueDate && <DetailRow icon={Calendar} label="Due" value={task.dueDate} />}
          {task.duration && <DetailRow icon={Hourglass} label="Duration" value={`${task.duration} min`} />}
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
