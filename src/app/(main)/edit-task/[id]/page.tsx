

'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, ListTree, Hourglass, Clock, Calendar, Star, Pin, Trash2, Sun } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/context/AppContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import type { Subtask, Task } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';


const AttributeRow = ({ icon: Icon, label, children }: { icon: React.ElementType, label: string, children: React.ReactNode }) => (
    <div className="flex items-center h-[44px] px-4">
        <Icon className="w-5 h-5 text-muted-foreground mr-3" strokeWidth={1.5} />
        <Label className="text-[1rem] flex-grow">{label}</Label>
        <div className="flex justify-end items-center min-w-[120px] text-[1rem]">
            {children}
        </div>
    </div>
);

export default function EditTaskPage() {
    const router = useRouter();
    const params = useParams();
    const { tasks, updateTask, deleteTask } = useAppContext();
    const [isMounted, setIsMounted] = React.useState(false);

    const taskId = params.id as string;
    const taskToEdit = tasks.find(t => t.id === taskId);

    const [title, setTitle] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [isImportant, setIsImportant] = React.useState(false);
    const [isFixed, setIsFixed] = React.useState(false);
    const [isMyDay, setIsMyDay] = React.useState(true);
    
    const [dueDate, setDueDate] = React.useState<Date>();
    const [startTime, setStartTime] = React.useState('');
    const [duration, setDuration] = React.useState(30);
    const [subtasks, setSubtasks] = React.useState<Subtask[]>([]);
    const [newSubtask, setNewSubtask] = React.useState('');
    const [isAddingSubtask, setIsAddingSubtask] = React.useState(false);
    const [editingSubtaskId, setEditingSubtaskId] = React.useState<string | null>(null);
    const [editingSubtaskText, setEditingSubtaskText] = React.useState('');

    React.useEffect(() => {
        if (taskToEdit) {
            setTitle(taskToEdit.title);
            setDescription(taskToEdit.description || '');
            setIsImportant(taskToEdit.isImportant);
            setIsFixed(taskToEdit.isFixed || false);
            setIsMyDay(taskToEdit.isMyDay === undefined ? true : taskToEdit.isMyDay);
            setDueDate(taskToEdit.dueDate ? parseISO(taskToEdit.dueDate) : undefined);
            setStartTime(taskToEdit.startTime || '');
            setDuration(taskToEdit.duration || 30);
            setSubtasks(taskToEdit.subtasks || []);
        } else {
            // Optional: handle case where task is not found
            // router.replace('/today'); 
        }
        
        // Delay to allow animation
        const timer = setTimeout(() => setIsMounted(true), 10);
        return () => clearTimeout(timer);
    }, [taskToEdit, router]);

    const handleClose = () => {
        setIsMounted(false);
        setTimeout(() => router.back(), 300); // Match transition duration
    };

    const handleSaveTask = () => {
        if (!title) {
            alert("Task title is required.");
            return;
        }
        
        const updatedTask: Partial<Omit<Task, 'createdAt'>> = { // `createdAt` should not be updated
            title,
            description,
            isImportant,
            isFixed,
            isMyDay,
            dueDate: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined,
            startTime: startTime || undefined,
            duration: duration,
            subtasks: subtasks,
        };

        updateTask(taskId, updatedTask);
        handleClose();
    };

    const handleDeleteTask = () => {
        deleteTask(taskId);
        router.push('/today');
    }

    const addSubtask = () => {
        if (newSubtask.trim()) {
            setSubtasks([...subtasks, { id: `sub-${Date.now()}`, title: newSubtask, isCompleted: false }]);
            setNewSubtask('');
            setIsAddingSubtask(false);
        }
    };

    const removeSubtask = (id: string) => {
        setSubtasks(subtasks.filter(sub => sub.id !== id));
    };

    const toggleSubtaskCompletion = (id: string) => {
        setSubtasks(subtasks.map(sub => sub.id === id ? { ...sub, isCompleted: !sub.isCompleted } : sub));
    };

    const startEditingSubtask = (subtask: Subtask) => {
        setEditingSubtaskId(subtask.id);
        setEditingSubtaskText(subtask.title);
    };

    const saveSubtaskEdit = (id: string) => {
        setSubtasks(subtasks.map(sub => sub.id === id ? { ...sub, title: editingSubtaskText } : sub));
        setEditingSubtaskId(null);
        setEditingSubtaskText('');
    };

    const handleSubtaskEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
        if (e.key === 'Enter') {
            saveSubtaskEdit(id);
        }
    };
    
    if (!taskToEdit) {
        return (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <p>Task not found.</p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end justify-center">
            <div className={cn(
                "bg-background flex flex-col w-full max-w-lg h-[95vh] rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out",
                isMounted ? 'translate-y-0' : 'translate-y-full'
            )}>
                <header className="px-5 h-[56px] flex justify-between items-center flex-shrink-0 border-b">
                    <Button variant="ghost" size="icon" aria-label="Delete" onClick={handleDeleteTask}>
                        <Trash2 className="w-6 h-6 text-destructive" />
                    </Button>
                    <h1 className="text-[1.1rem] font-bold">Edit Task</h1>
                    <Button variant="ghost" size="icon" aria-label="Close" onClick={handleClose}>
                        <X className="w-6 h-6" />
                    </Button>
                </header>

                <main className="flex-grow px-5 py-4 flex flex-col gap-4 overflow-y-auto">
                    <Card className="rounded-2xl shadow-soft border-none p-1 flex-shrink-0">
                        <Input
                            placeholder="What do you want to do?"
                            className="border-none text-[1.2rem] font-medium h-[60px] p-4 focus-visible:ring-0 focus-visible:ring-offset-0"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </Card>
                    
                    <Card className="rounded-2xl shadow-soft border-none p-1 flex flex-col flex-shrink-0">
                        <Textarea
                            placeholder="Add a description..."
                            className="border-none text-[1rem] min-h-[120px] p-4 focus-visible:ring-0 focus-visible:ring-offset-0 flex-grow"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Card>

                    <Card className="rounded-2xl shadow-soft border-none overflow-hidden flex-shrink-0">
                        <AttributeRow icon={ListTree} label="Subtasks">
                            <div className="flex items-center gap-2">
                                {subtasks.length > 0 && (
                                    <span className="text-sm text-muted-foreground">{subtasks.filter(s => s.isCompleted).length}/{subtasks.length}</span>
                                )}
                                <Button variant="ghost" size="sm" className="text-primary text-[1rem]" onClick={() => setIsAddingSubtask(true)}>
                                    Add
                                </Button>
                            </div>
                        </AttributeRow>
                        { (subtasks.length > 0 || isAddingSubtask) && (
                            <div className="px-4 py-2 space-y-2">
                                {subtasks.map(sub => (
                                    <div key={sub.id} className="flex items-center gap-2">
                                        <Checkbox 
                                            id={`subtask-${sub.id}`}
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
                                                className="h-9 flex-grow border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                                autoFocus
                                            />
                                        ) : (
                                            <label 
                                                htmlFor={`subtask-${sub.id}`} 
                                                className="flex-grow text-sm cursor-text"
                                                onClick={() => startEditingSubtask(sub)}
                                            >
                                                {sub.title}
                                            </label>
                                        )}
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeSubtask(sub.id)}>
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                                {isAddingSubtask && (
                                    <div className="flex gap-2">
                                        <Input value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} placeholder="Add a subtask..." className="h-9 border-none focus-visible:ring-0 focus-visible:ring-offset-0" />
                                        <Button size="sm" onClick={addSubtask}>Add</Button>
                                    </div>
                                )}
                            </div>
                        )}
                        <Separator/>
                        <AttributeRow icon={Hourglass} label="Duration">
                             <div className="flex items-center gap-1">
                                <Input 
                                    type="number" 
                                    value={duration}
                                    onChange={(e) => setDuration(Number(e.target.value))}
                                    className="w-20 h-8 text-right border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-[1rem]"
                                    min="0"
                                    step="5"
                                />
                                <span className="text-muted-foreground">min</span>
                            </div>
                        </AttributeRow>
                        <Separator/>
                        <AttributeRow icon={Clock} label="Start Time">
                           <Input 
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-auto h-8 border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-[1rem]"
                                pattern="[0-9]{2}:[0-9]{2}"
                            />
                        </AttributeRow>
                        <Separator/>
                        <AttributeRow icon={Calendar} label="Deadline">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-primary text-[1rem]">
                                        {dueDate ? format(dueDate, 'PPP') : 'Set Date'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <CalendarComponent
                                        mode="single"
                                        selected={dueDate}
                                        onSelect={setDueDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </AttributeRow>
                    </Card>

                    <Card className="rounded-2xl shadow-soft border-none overflow-hidden flex-shrink-0">
                        <AttributeRow icon={Sun} label="Add to My Day">
                            <Switch checked={isMyDay} onCheckedChange={setIsMyDay} />
                        </AttributeRIow>
                        <Separator/>
                        <AttributeRow icon={Star} label="Mark as Important">
                            <Switch checked={isImportant} onCheckedChange={setIsImportant} />
                        </AttributeRow>
                        <Separator/>
                        <AttributeRow icon={Pin} label="Fixed Schedule">
                            <Switch checked={isFixed} onCheckedChange={setIsFixed} />
                        </AttributeRow>
                    </Card>
                </main>

                <footer className="px-5 py-4 flex-shrink-0 border-t">
                    <Button className="w-full h-[50px] text-[1.1rem] font-bold rounded-md" onClick={handleSaveTask}>Save Changes</Button>
                </footer>
            </div>
        </div>
    );
}
