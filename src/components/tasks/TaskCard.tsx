
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { Subtask, Task, TaskList } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Star,
  Sun,
  Trash2,
  Clock,
  Calendar,
  Hourglass,
  ListTree,
  Plus,
  FileText,
  Pencil,
  type Icon as LucideIcon,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, parseISO } from 'date-fns';
import { Button } from "../ui/button";
import { useAppContext } from "@/context/AppContext";
import * as Icons from 'lucide-react';
import {
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  TrailingActions,
  LeadingActions,
} from 'react-swipeable-list';
import 'react-swipeable-list/dist/styles.css';


interface TaskCardProps {
  task: Task;
  list: TaskList;
  view: "compact" | "detail";
  status: 'expired' | 'upcoming' | 'done';
  onDelete: (taskId: string) => void;
  onEdit: (taskId: string) => void;
  onUpdate: (taskId: string, updatedTask: Partial<Task>) => void;
  onToggleImportant: (taskId: string) => void;
  onToggleMyDay: (taskId: string) => void;
  onToggleCompleted: (taskId: string) => void;
}

const getIcon = (iconName: string): LucideIcon => {
    const icon = (Icons as any)[iconName];
    if (icon) {
        return icon;
    }
    return Icons.HelpCircle; // Fallback icon
};


export function TaskCard({ task, list, view, status, onDelete, onEdit, onUpdate, onToggleImportant, onToggleMyDay, onToggleCompleted }: TaskCardProps) {
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


  const handleToggleExpand = () => {
    if (view === "compact") {
      setIsExpanded(!isExpanded);
    }
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

  // --- Subtasks ---
    const updateSubtasks = (newSubtasks: Subtask[]) => {
        setEditingSubtasks(newSubtasks);
        onUpdate(task.id, { subtasks: newSubtasks });
    };

    const addSubtask = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (newSubtask.trim()) {
            const newSubtasks = [...editingSubtasks, { id: `sub-${Date.now()}`, title: newSubtask, isCompleted: false }];
            updateSubtasks(newSubtasks);
            setNewSubtask('');
            setIsAddingSubtask(false);
        }
    };

    const removeSubtask = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newSubtasks = editingSubtasks.filter(sub => sub.id !== id);
        updateSubtasks(newSubtasks);
    };

    const toggleSubtaskCompletion = (id: string) => {
        const newSubtasks = editingSubtasks.map(sub => sub.id === id ? { ...sub, isCompleted: !sub.isCompleted } : sub);
        updateSubtasks(newSubtasks);
    };

    const startEditingSubtask = (subtask: Subtask) => {
        setEditingSubtaskId(subtask.id);
        setEditingSubtaskText(subtask.title);
    };

    const saveSubtaskEdit = (id: string) => {
        const newSubtasks = editingSubtasks.map(sub => sub.id === id ? { ...sub, title: editingSubtaskText } : sub);
        updateSubtasks(newSubtasks);
        setEditingSubtaskId(null);
        setEditingSubtaskText('');
    };

    const handleSubtaskEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
        if (e.key === 'Enter') {
            saveSubtaskEdit(id);
        }
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
    onClick?: (e: React.MouseEvent) => void;
    isEditing?: boolean;
    InputComponent?: React.ReactNode;
  }) => (
    <div className="flex items-start text-sm text-muted-foreground min-h-[24px]">
      <Icon className="w-4 h-4 mr-2 mt-1 flex-shrink-0" strokeWidth={1.5} />
      <span className="font-medium w-20 flex-shrink-0">{label}:</span>
      {isEditing ? (
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
    setEditingTitle(task.title);
    setEditingDesc(task.description || "");
    setEditingStartTime(task.startTime || "");
    setEditingDueDate(task.dueDate ? parseISO(task.dueDate) : undefined);
    setEditingDuration(task.duration || 0);
    setEditingSubtasks(task.subtasks || []);
  }, [task]);


  const ListIcon = list.icon as React.ElementType;

  const cardIsExpanded = isExpanded || view === 'detail';

  const renderListIcon = () => {
    const iconElement = (
      <ListIcon 
        className="w-5 h-5" 
        style={{ color: list.color }} 
        strokeWidth={1.5} 
      />
    );

    if (cardIsExpanded) {
      return (
        <Popover>
          <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="w-8 h-8 ml-2">
              {iconElement}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-1" align="start">
            <div className="flex flex-col gap-1">
              {lists.map(listOption => {
                  const ListOptionIcon = getIcon(listOption.icon as string);
                  return (
                      <Button
                          key={listOption.id}
                          variant="ghost"
                          className="w-full justify-start gap-2"
                          onClick={() => {
                              onUpdate(task.id, { listId: listOption.id });
                          }}
                      >
                          <ListOptionIcon className="w-4 h-4" style={{ color: listOption.color }}/>
                          {listOption.name}
                      </Button>
                  );
              })}
            </div>
          </PopoverContent>
        </Popover>
      );
    }

    return (
      <div className="w-8 h-8 ml-2 flex items-center justify-center">
        {iconElement}
      </div>
    );
  };
  
  const trailingActions = () => (
    <TrailingActions>
      <SwipeAction
        destructive={true}
        onClick={() => onDelete(task.id)}
      >
        <div className="flex items-center justify-center bg-destructive text-destructive-foreground h-full px-5">
            <Trash2 className="w-5 h-5" />
        </div>
      </SwipeAction>
    </TrailingActions>
  );

  const leadingActions = () => (
    <LeadingActions>
        <SwipeAction onClick={() => onToggleImportant(task.id)}>
             <div className="flex items-center justify-center bg-yellow-400 text-white h-full px-5">
                <Star className="w-5 h-5" />
            </div>
        </SwipeAction>
        <SwipeAction onClick={() => onToggleMyDay(task.id)}>
             <div className="flex items-center justify-center bg-orange-400 text-white h-full px-5">
                <Sun className="w-5 h-5" />
            </div>
        </SwipeAction>
         <SwipeAction onClick={() => onEdit(task.id)}>
             <div className="flex items-center justify-center bg-blue-500 text-white h-full px-5">
                <Pencil className="w-5 h-5" />
            </div>
        </SwipeAction>
    </LeadingActions>
  );


  return (
    <SwipeableList destructiveCallbackDelay={300}>
        <SwipeableListItem
            leadingActions={leadingActions()}
            trailingActions={trailingActions()}
            onSwipeEnd={(swipeDirection) => {
                if (swipeDirection === 'left') {
                   // To give time for destructive animation
                   setTimeout(() => onDelete(task.id), 300);
                }
            }}
        >
            <div
            className="bg-card w-full rounded-2xl shadow-soft transition-all duration-300 ease-in-out"
            onClick={handleToggleExpand}
            >
            <div className="flex items-center p-4">
                <Checkbox
                id={`task-${task.id}`}
                checked={task.isCompleted}
                onCheckedChange={() => onToggleCompleted(task.id)}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}
                className="w-5 h-5 rounded-full data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-primary/50"
                />
                
                {ListIcon && renderListIcon()}

                <div className="flex-grow ml-1 min-w-0">
                { isEditingTitle ? (
                    <Input
                        value={editingTitle}
                        onChange={handleTitleChange}
                        onBlur={handleTitleBlur}
                        onKeyDown={handleTitleKeyDown}
                        className="h-7 p-0 text-[17px] font-medium border-none focus-visible:ring-0"
                        autoFocus
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    />
                ) : (
                    <p
                    className={cn(
                        "text-[17px] font-medium text-foreground truncate",
                        task.isCompleted && "line-through text-muted-foreground",
                        cardIsExpanded && "cursor-text"
                    )}
                    onClick={(e) => {
                        if(cardIsExpanded) {
                        e.stopPropagation();
                        setIsEditingTitle(true)
                        }
                    }}
                    >
                    {task.title}
                    </p>
                )}

                {task.startTime && !isEditingTitle && (
                    <p className={cn(
                        "text-[13px]",
                        status === 'expired' && 'font-bold text-destructive',
                        status === 'upcoming' && 'font-bold text-primary',
                        status === 'done' && 'text-muted-foreground'
                    )}>
                        {task.startTime}
                    </p>
                )}
                </div>
                { cardIsExpanded &&
                <div className="flex items-center gap-2 ml-2">
                <button onClick={(e) => {e.stopPropagation(); onEdit(task.id)}}>
                    <Pencil className="w-5 h-5 text-muted-foreground hover:text-primary" strokeWidth={1.5} />
                </button>
                <button onClick={(e) => {e.stopPropagation(); onToggleImportant(task.id)}}>
                    <Star
                    className={cn(
                        "w-5 h-5 text-muted-foreground transition-colors hover:text-yellow-500",
                        task.isImportant && "fill-yellow-400 text-yellow-500"
                    )}
                    strokeWidth={1.5}
                    />
                </button>
                <button onClick={(e) => {e.stopPropagation(); onToggleMyDay(task.id)}}>
                    <Sun 
                    className={cn(
                        "w-5 h-5 text-muted-foreground hover:text-orange-500 transition-colors",
                        task.isMyDay && "fill-orange-400 text-orange-500"
                    )} 
                    strokeWidth={1.5} 
                    />
                </button>
                </div>
                }
            </div>
            {cardIsExpanded && (
                <div className="px-4 pb-4 pl-[4.25rem] space-y-3 animate-accordion-down">
                <DetailRow 
                    icon={FileText}
                    label="Description"
                    value={task.description || "Add a description..."}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsEditingDesc(true);
                    }}
                    isEditing={isEditingDesc}
                    InputComponent={
                        <Textarea
                            value={editingDesc}
                            onChange={handleDescChange}
                            onBlur={handleDescBlur}
                            className="h-auto flex-grow border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm bg-transparent"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                    }
                />
                <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <ListTree className="w-4 h-4 mr-2 mt-1 flex-shrink-0 self-start" strokeWidth={1.5} />
                        <span className="font-medium w-20 flex-shrink-0">Subtasks:</span>
                        <div className="flex-grow flex justify-end">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-auto px-2 py-0 text-primary text-xs" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsAddingSubtask(true);
                                }}
                            >
                                <Plus className="w-3 h-3 mr-1" /> Add
                            </Button>
                        </div>
                    </div>
                    <div className="pl-[3.2rem] space-y-2">
                        {editingSubtasks.map(sub => (
                            <div key={sub.id} className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                <Checkbox 
                                    id={`subtask-${task.id}-${sub.id}`}
                                    checked={sub.isCompleted} 
                                    onCheckedChange={() => toggleSubtaskCompletion(sub.id)}
                                    className="w-5 h-5 rounded-full"
                                />
                                {editingSubtaskId === sub.id ? (
                                    <Input
                                        value={editingSubtaskText}
                                        onChange={(e) => setEditingSubtaskText(e.target.value)}
                                        onBlur={() => saveSubtaskEdit(sub.id)}
                                        onKeyDown={(e) => handleSubtaskEditKeyDown(e, sub.id)}
                                        className="h-7 flex-grow border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                                        autoFocus
                                    />
                                ) : (
                                    <label 
                                        htmlFor={`subtask-${task.id}-${sub.id}`} 
                                        className="flex-grow text-sm cursor-text data-[completed=true]:line-through data-[completed=true]:text-muted-foreground"
                                        data-completed={sub.isCompleted}
                                        onClick={(e) => { e.stopPropagation(); startEditingSubtask(sub); }}
                                    >
                                        {sub.title}
                                    </label>
                                )}
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => removeSubtask(e, sub.id)}>
                                    <Trash2 className="w-4 h-4 text-destructive/70" />
                                </Button>
                            </div>
                        ))}
                        {isAddingSubtask && (
                            <div className="flex gap-2 pl-7" onClick={e => e.stopPropagation()}>
                                <Input 
                                    value={newSubtask} 
                                    onChange={(e) => setNewSubtask(e.target.value)} 
                                    placeholder="Add a subtask..." 
                                    className="h-7 border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm" 
                                    onKeyDown={(e) => e.key === 'Enter' && addSubtask(e as any)}
                                    autoFocus
                                />
                                <Button size="sm" className="h-7" onClick={addSubtask}>Add</Button>
                            </div>
                        )}
                    </div>
                </div>
                <DetailRow 
                    icon={Clock} 
                    label="Start" 
                    value={task.startTime || 'Not set'}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsEditingStartTime(true);
                    }}
                    isEditing={isEditingStartTime}
                    InputComponent={
                        <Input
                            type="time"
                            value={editingStartTime}
                            onChange={handleStartTimeChange}
                            onBlur={handleStartTimeBlur}
                            className="h-7 p-0 text-sm border-none focus-visible:ring-0 bg-transparent"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                    }
                />
                <DetailRow 
                    icon={Calendar} 
                    label="Due" 
                    value={task.dueDate ? format(parseISO(task.dueDate), 'PPP') : 'Not set'}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsEditingDueDate(true);
                    }}
                    isEditing={isEditingDueDate}
                    InputComponent={
                    <Popover open={isEditingDueDate} onOpenChange={setIsEditingDueDate}>
                        <PopoverTrigger asChild>
                        <button className="text-sm text-primary" onClick={(e) => {e.stopPropagation(); setIsEditingDueDate(true)}}>
                            {editingDueDate ? format(editingDueDate, 'PPP') : 'Set Date'}
                        </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end" onClick={(e) => e.stopPropagation()}>
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
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsEditingDuration(true);
                    }}
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
                            onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-sm">min</span>
                    </div>
                    }
                />
                </div>
            )}
            </div>
        </SwipeableListItem>
    </SwipeableList>
  );
}



    

    

    

    

    
