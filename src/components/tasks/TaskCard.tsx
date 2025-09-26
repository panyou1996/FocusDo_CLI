
"use client";

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
import { format, parseISO, addMinutes, parse } from 'date-fns';
import { Button } from "../ui/button";
import { useAppContext } from "@/context/AppContext";
import { getIcon } from "@/lib/icon-utils";
import { useLongPress } from "@/hooks/useLongPress";
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
  list: TaskList;
  view: "compact" | "detail";
  status: 'expired' | 'upcoming' | 'done';
  onEdit: (taskId: string) => void;
  onUpdate: (taskId: string, updatedTask: Partial<Task>) => void;
  onToggleImportant: (taskId: string) => void;
  onToggleMyDay: (taskId: string) => void;
  onToggleFixed: (taskId: string) => void;
  onToggleCompleted: (taskId: string) => void;
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
  
  const pinControls = useAnimation();
  const isInitialMount = React.useRef(true);


  const handleToggleExpand = (e: React.PointerEvent) => {
    // If the clicked element or its parent has a 'data-interactive' attribute, do nothing.
    if ((e.target as HTMLElement).closest('[data-interactive]')) {
      return;
    }
    if (view === "compact") {
      setIsExpanded(!isExpanded);
    }
  };
  
  const { isPressing, handlers } = useLongPress({
    onLongPress: (e) => {
        if (navigator.vibrate) navigator.vibrate(50);
        onToggleFixed(task.id);
    },
    onClick: handleToggleExpand,
  });

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

  React.useEffect(() => {
    setEditingTitle(task.title);
    setEditingDesc(task.description || "");
    setEditingStartTime(task.startTime || "");
    setEditingDueDate(task.dueDate ? parseISO(task.dueDate) : undefined);
    setEditingDuration(task.duration || 0);
    setEditingSubtasks(task.subtasks || []);
  }, [task]);

  React.useEffect(() => {
    // Skip animation on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (task.isFixed) {
        pinControls.start({
            scale: [1, 1.5, 1],
            rotate: [-45, -15, -45],
            transition: { type: 'spring', stiffness: 500, damping: 15 }
        });
    } else {
        pinControls.start({
            scale: [1, 1.2, 1],
            rotate: [-45, -60, -45],
            transition: { type: 'spring', stiffness: 500, damping: 15 }
        });
    }
  }, [task.isFixed, pinControls]);


  const ListIcon = list.icon as React.ElementType;
  const cardIsExpanded = isExpanded || view === 'detail';
  const endTime = task.startTime && task.duration ? getEndTime(task.startTime, task.duration) : null;


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
          <PopoverTrigger asChild>
            <Button data-interactive variant="ghost" size="icon" className="w-8 h-8">
              {iconElement}
            </Button>
          </PopoverTrigger>
          <PopoverContent data-interactive className="w-auto p-1" align="start">
            <div className="flex flex-col gap-1">
              {lists.map(listOption => {
                  const ListOptionIcon = getIcon(listOption.icon as string);
                  return (
                      <Button
                          key={listOption.id}
                          variant="ghost"
                          className={cn(
                              "w-full justify-start gap-2",
                              task.listId === listOption.id && 'bg-accent'
                          )}
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
      <div className="w-8 h-8 flex items-center justify-center">
        {iconElement}
      </div>
    );
  };
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
    exit: { 
        height: 0, 
        opacity: 0, 
        marginTop: 0,
        marginBottom: 0,
        paddingTop: 0,
        paddingBottom: 0,
        transition: { duration: 0.3, ease: 'easeOut' } 
    }
  };


  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}
      className="relative"
    >
        <motion.div
            animate={pinControls}
            initial={{ rotate: -45 }}
            className={cn(
            'absolute top-1 left-1 w-5 h-5 z-10 transition-colors',
            task.isFixed
                ? 'text-primary'
                : 'text-muted-foreground/30'
            )}
        >
            <Pin className="w-full h-full" fill={task.isFixed ? 'currentColor' : 'none'}/>
        </motion.div>
        
        <motion.div
            {...handlers}
            animate={{ scale: isPressing ? 0.98 : 1 }}
            transition={{ type: "spring", duration: 0.2 }}
            className={'w-full rounded-2xl custom-card cursor-pointer relative overflow-hidden'}
        >
        <motion.div 
            className="absolute left-0 top-0 bottom-0 bg-yellow-500 rounded-l-2xl"
            animate={{ width: task.isImportant ? 4 : 0 }}
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
        />
        <div className="flex items-center py-3 px-4">
          <div data-interactive>
            <Checkbox
              id={`task-${task.id}`}
              checked={task.isCompleted}
              onCheckedChange={() => onToggleCompleted(task.id)}
              className="w-5 h-5 rounded-full data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-primary/50"
            />
          </div>

          {ListIcon && renderListIcon()}

          <div className="flex-grow ml-1 min-w-0">
            {isEditingTitle ? (
              <Input
                data-interactive
                value={editingTitle}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                className="h-7 p-0 text-base font-medium border-none focus-visible:ring-0 bg-transparent"
                autoFocus
              />
            ) : (
              <div className="relative">
                <p
                    className={cn(
                    'text-base font-semibold text-foreground truncate',
                    task.isCompleted && 'text-muted-foreground'
                    )}
                >
                    <span
                    data-interactive={cardIsExpanded}
                    className={cn(cardIsExpanded && 'cursor-text')}
                    onClick={() => {
                        if (cardIsExpanded) {
                          setIsEditingTitle(true);
                        }
                    }}
                    >
                    {task.title}
                    </span>
                </p>
                <motion.div
                    className="absolute top-1/2 left-0 h-0.5 bg-muted-foreground"
                    initial={{ width: 0 }}
                    animate={{ width: task.isCompleted ? "100%" : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                />
              </div>
            )}

            {!isEditingTitle &&
              (task.startTime ? (
                <p
                  className={cn(
                    'text-sm h-[18px]',
                    status === 'expired' && !task.isCompleted && 'font-bold text-destructive',
                    status === 'upcoming' && !task.isCompleted && 'font-bold text-primary',
                    task.isCompleted && 'text-muted-foreground'
                  )}
                >
                  {endTime ? `${task.startTime} - ${endTime}` : task.startTime}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground h-[18px]">--:--</p>
              ))}
          </div>

          <div data-interactive className="flex items-center gap-2 ml-2">
            <button
              onClick={() => onEdit(task.id)}
            >
              <Pencil
                className={
                  'w-5 h-5 text-muted-foreground transition-colors hover:text-primary'
                }
                strokeWidth={1.5}
              />
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
        {cardIsExpanded && (
          <motion.div 
            key="content"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            className="px-4 pb-3 pl-12 overflow-hidden"
          >
            <motion.div
              data-interactive
              variants={itemVariants}
              className="flex items-center gap-2 -ml-2 mb-2"
            >
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'w-8 h-8',
                  task.isImportant
                    ? 'text-yellow-500'
                    : 'text-muted-foreground'
                )}
                onClick={() => onToggleImportant(task.id)}
              >
                <Star
                  className={cn('w-5 h-5', task.isImportant && 'fill-current')}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'w-8 h-8',
                  task.isMyDay ? 'text-blue-500' : 'text-muted-foreground'
                )}
                onClick={() => onToggleMyDay(task.id)}
              >
                <Sun className="w-5 h-5" />
              </Button>
            </motion.div>

            <div className="space-y-2">
                <motion.div variants={itemVariants}>
                  <DetailRow
                    icon={FileText}
                    label="Description"
                    value={task.description || 'Add a description...'}
                    onClick={() => {
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
                      />
                    }
                  />
                </motion.div>
                <motion.div variants={itemVariants} className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <ListTree
                      className="w-4 h-4 mr-2 self-center"
                      strokeWidth={1.5}
                    />
                    <span className="font-medium w-20 flex-shrink-0">
                      Subtasks:
                    </span>
                    <div data-interactive className="flex-grow flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto px-2 py-0 text-primary text-xs"
                        onClick={() => {
                          setIsAddingSubtask(true);
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" /> Add
                      </Button>
                    </div>
                  </div>
                  <div data-interactive className="pl-7 space-y-2">
                    {editingSubtasks.map(sub => (
                      <div
                        key={sub.id}
                        className="flex items-center gap-2"
                      >
                        <Checkbox
                          id={`subtask-${task.id}-${sub.id}`}
                          checked={sub.isCompleted}
                          onCheckedChange={() => toggleSubtaskCompletion(sub.id)}
                          className="w-5 h-5 rounded-full"
                        />
                        {editingSubtaskId === sub.id ? (
                          <Input
                            value={editingSubtaskText}
                            onChange={e => setEditingSubtaskText(e.target.value)}
                            onBlur={() => saveSubtaskEdit(sub.id)}
                            onKeyDown={e => handleSubtaskEditKeyDown(e, sub.id)}
                            className="h-7 flex-grow border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm bg-transparent"
                            autoFocus
                          />
                        ) : (
                          <label
                            htmlFor={`subtask-${task.id}-${sub.id}`}
                            className="flex-grow text-sm cursor-text data-[completed=true]:line-through data-[completed=true]:text-muted-foreground"
                            data-completed={sub.isCompleted}
                            onClick={() => {
                              startEditingSubtask(sub);
                            }}
                          >
                            {sub.title}
                          </label>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={e => removeSubtask(e, sub.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive/70" />
                        </Button>
                      </div>
                    ))}
                    {isAddingSubtask && (
                      <div
                        className="flex gap-2"
                      >
                        <Input
                          value={newSubtask}
                          onChange={e => setNewSubtask(e.target.value)}
                          placeholder="Add a subtask..."
                          className="h-7 border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm bg-transparent"
                          onKeyDown={e => e.key === 'Enter' && addSubtask(e as any)}
                          autoFocus
                        />
                        <Button
                          size="sm"
                          className="h-7"
                          onClick={addSubtask}
                        >
                          Add
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <DetailRow
                    icon={Clock}
                    label="Start"
                    value={task.startTime || 'Not set'}
                    onClick={() => {
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
                      />
                    }
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <DetailRow
                    icon={Calendar}
                    label="Due"
                    value={
                      task.dueDate ? format(parseISO(task.dueDate), 'PPP') : 'Not set'
                    }
                    onClick={() => {
                      setIsEditingDueDate(true);
                    }}
                    isEditing={isEditingDueDate}
                    InputComponent={
                      <Popover
                        open={isEditingDueDate}
                        onOpenChange={setIsEditingDueDate}
                      >
                        <PopoverTrigger asChild>
                          <button
                            className="text-sm text-primary"
                          >
                            {editingDueDate
                              ? format(editingDueDate, 'PPP')
                              : 'Set Date'}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0"
                          align="end"
                        >
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
                </motion.div>
                <motion.div variants={itemVariants}>
                  <DetailRow
                    icon={Hourglass}
                    label="Duration"
                    value={task.duration ? `${task.duration} min` : 'Not set'}
                    onClick={() => {
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
                        />
                        <span className="text-sm">min</span>
                      </div>
                    }
                  />
                </motion.div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
