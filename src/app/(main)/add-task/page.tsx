
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, ListTree, Hourglass, Clock, Calendar, Star, Pin, Plus, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTasks } from '@/context/TaskContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { format } from 'date-fns';
import type { Subtask } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';

const AttributeRow = ({ icon: Icon, label, children }: { icon: React.ElementType, label: string, children: React.ReactNode }) => (
    <div className="flex items-center h-[50px] px-4">
        <Icon className="w-6 h-6 text-muted-foreground mr-4" strokeWidth={1.5} />
        <Label className="text-[17px] flex-grow">{label}</Label>
        {children}
    </div>
);

export default function AddTaskPage() {
    const router = useRouter();
    const { addTask } = useTasks();

    const [title, setTitle] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [isImportant, setIsImportant] = React.useState(false);
    const [isFixed, setIsFixed] = React.useState(false);
    
    const [dueDate, setDueDate] = React.useState<Date>();
    const [startTime, setStartTime] = React.useState('');
    const [duration, setDuration] = React.useState(30);
    const [subtasks, setSubtasks] = React.useState<Subtask[]>([]);
    const [newSubtask, setNewSubtask] = React.useState('');
    const [isAddingSubtask, setIsAddingSubtask] = React.useState(false);
    const [editingSubtaskId, setEditingSubtaskId] = React.useState<string | null>(null);
    const [editingSubtaskText, setEditingSubtaskText] = React.useState('');


    const [isDurationOpen, setIsDurationOpen] = React.useState(false);
    const [isStartTimeOpen, setIsStartTimeOpen] = React.useState(false);

    const handleSaveTask = () => {
        if (!title) {
            alert("Task title is required.");
            return;
        }
        
        const newTask = {
            id: Date.now().toString(),
            title,
            description,
            isImportant,
            isFixed,
            dueDate: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined,
            startTime: startTime || undefined,
            duration: duration,
            subtasks: subtasks,
            isCompleted: false,
            isMyDay: true,
            listId: 'personal',
        };

        addTask(newTask);
        router.back();
    };

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


    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end justify-center">
            <div className="bg-background flex flex-col w-full max-w-lg h-[95vh] rounded-t-2xl shadow-2xl">
                <header className="px-5 h-[56px] flex justify-between items-center flex-shrink-0 border-b">
                    <div className="w-10"></div>
                    <h1 className="text-[17px] font-bold">Add New Task</h1>
                    <Button variant="ghost" size="icon" aria-label="Close" onClick={() => router.back()}>
                        <X className="w-6 h-6" />
                    </Button>
                </header>

                <main className="flex-grow px-5 py-4 flex flex-col gap-4 overflow-y-auto">
                    <Card className="rounded-2xl shadow-soft border-none p-1">
                        <Input
                            placeholder="What do you want to do?"
                            className="border-none text-[18px] font-medium h-[60px] p-4 focus-visible:ring-0 focus-visible:ring-offset-0"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </Card>
                    
                    <Card className="rounded-2xl shadow-soft border-none p-1">
                        <Textarea
                            placeholder="Add a description..."
                            className="border-none text-[17px] min-h-[120px] p-4 focus-visible:ring-0 focus-visible:ring-offset-0"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Card>

                    <Card className="rounded-2xl shadow-soft border-none overflow-hidden">
                        <AttributeRow icon={ListTree} label="Subtasks">
                            <div className="flex items-center gap-2">
                                {subtasks.length > 0 && (
                                    <span className="text-sm text-muted-foreground">{subtasks.length} subtasks</span>
                                )}
                                <Button variant="ghost" size="sm" className="text-primary" onClick={() => setIsAddingSubtask(true)}>
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
                                                className="h-9 flex-grow"
                                                autoFocus
                                            />
                                        ) : (
                                            <label 
                                                htmlFor={`subtask-${sub.id}`} 
                                                className="flex-grow text-sm"
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
                                        <Input value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} placeholder="Add a subtask..." className="h-9" />
                                        <Button size="sm" onClick={addSubtask}>Add</Button>
                                    </div>
                                )}
                            </div>
                        )}
                        <Separator/>
                        <AttributeRow icon={Hourglass} label="Duration">
                            <Button variant="ghost" className="text-muted-foreground" onClick={() => setIsDurationOpen(true)}>
                                {duration} min
                            </Button>
                        </AttributeRow>
                        <Separator/>
                        <AttributeRow icon={Clock} label="Start Time">
                            <Button variant="ghost" className="text-muted-foreground" onClick={() => setIsStartTimeOpen(true)}>
                                {startTime || 'Set Time'}
                            </Button>
                        </AttributeRow>
                        <Separator/>
                        <AttributeRow icon={Calendar} label="Deadline">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" className="text-muted-foreground">
                                        {dueDate ? format(dueDate, 'PPP') : 'Set Date'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
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

                    <Card className="rounded-2xl shadow-soft border-none overflow-hidden">
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
                    <Button className="w-full h-[50px] text-[17px] font-bold rounded-md" onClick={handleSaveTask}>Save Task</Button>
                </footer>
            </div>

            {/* Duration Dialog */}
            <Dialog open={isDurationOpen} onOpenChange={setIsDurationOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Set Duration</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="text-center text-2xl font-bold mb-4">{duration} minutes</div>
                        <Slider
                            defaultValue={[duration]}
                            max={240}
                            step={5}
                            onValueChange={(value) => setDuration(value[0])}
                        />
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setIsDurationOpen(false)}>Set</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

             {/* Start Time Dialog */}
             <Dialog open={isStartTimeOpen} onOpenChange={setIsStartTimeOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Set Start Time</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setIsStartTimeOpen(false)}>Set</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
