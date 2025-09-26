
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, ListTree, Hourglass, Clock, Calendar, Star, Pin, Trash2, List, Sun } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/context/AppContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import type { Subtask } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { getIcon } from '@/lib/icon-utils';
import { AnimatePresence, motion } from 'framer-motion';

export default function AddTaskPage() {
    const router = useRouter();
    const { addTask, lists } = useAppContext();
    const [isVisible, setIsVisible] = React.useState(true);

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
    const [selectedListId, setSelectedListId] = React.useState(lists[0]?.id || 'personal');
    
    const AttributeRow = ({ icon: Icon, label, children }: { icon: React.ElementType, label: string, children: React.ReactNode }) => (
        <div className="flex items-center h-[44px] px-4">
            <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                <Label className="text-base">{label}</Label>
            </div>
            <div className="flex-grow flex justify-end items-center text-base">
                {children}
            </div>
        </div>
    );

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => router.back(), 300); // Match animation duration
    };

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
            isMyDay: isMyDay,
            myDaySetDate: isMyDay ? new Date().toISOString() : undefined,
            listId: selectedListId,
            createdAt: new Date().toISOString(),
        };

        addTask(newTask);
        handleClose();
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

    const selectedList = lists.find(l => l.id === selectedListId);
    const SelectedListIcon = selectedList ? getIcon(selectedList.icon as string) : List;

    const modalVariants = {
        hidden: { y: "100%", transition: { type: 'spring', stiffness: 400, damping: 30 } },
        visible: { y: "0%", transition: { type: 'spring', stiffness: 400, damping: 30 } },
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end justify-center">
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="bg-background flex flex-col w-full max-w-lg h-[95vh] rounded-t-2xl shadow-2xl"
                    >
                        <header className="px-5 h-[56px] flex justify-between items-center flex-shrink-0 border-b">
                            <div className="w-10"></div>
                            <h1 className="text-lg font-bold">Add New Task</h1>
                            <Button variant="ghost" size="icon" aria-label="Close" onClick={handleClose}>
                                <X className="w-6 h-6" />
                            </Button>
                        </header>

                        <main className="flex-grow px-5 py-4 flex flex-col gap-4 overflow-y-auto">
                            <Card className="rounded-2xl custom-card flex-shrink-0">
                                <Input
                                    placeholder="What do you want to do?"
                                    className="text-xl font-medium h-[50px] p-4"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </Card>
                            
                            <Card className="rounded-2xl custom-card flex flex-col">
                                <Textarea
                                    placeholder="Add a description..."
                                    className="text-base min-h-[120px] p-4 flex-grow"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </Card>

                            <Card className="rounded-2xl custom-card overflow-hidden flex-shrink-0">
                                <AttributeRow icon={List} label="List">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="ghost" size="sm" className="text-primary flex items-center gap-2 text-base">
                                                {selectedList && (
                                                    <SelectedListIcon className="w-4 h-4" style={{ color: selectedList.color }}/>
                                                )}
                                                {selectedList?.name || 'Select List'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-1" align="end">
                                            <div className="flex flex-col gap-1">
                                                {lists.map(listOption => {
                                                    const ListOptionIcon = getIcon(listOption.icon as string);
                                                    return (
                                                        <Button
                                                            key={listOption.id}
                                                            variant="ghost"
                                                            className={cn(
                                                                "w-full justify-start gap-2",
                                                                selectedListId === listOption.id && 'bg-accent'
                                                            )}
                                                            onClick={() => {
                                                                setSelectedListId(listOption.id);
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
                                </AttributeRow>
                                <Separator/>
                                <AttributeRow icon={ListTree} label="Subtasks">
                                    <div className="flex items-center gap-2">
                                        {subtasks.length > 0 && (
                                            <span className="text-sm text-muted-foreground">{subtasks.filter(s => s.isCompleted).length}/{subtasks.length}</span>
                                        )}
                                        <Button variant="ghost" size="sm" className="text-primary text-base" onClick={() => setIsAddingSubtask(true)}>
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
                                                <Input value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} placeholder="Add a subtask..." className="h-9" />
                                                <Button size="sm" onClick={addSubtask}>Add</Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <Separator/>
                                <AttributeRow icon={Hourglass} label="Duration">
                                    <div className="flex items-center w-28 justify-end">
                                        <Input 
                                            type="number" 
                                            value={duration}
                                            onChange={(e) => setDuration(Number(e.target.value))}
                                            className="w-20 text-right h-8 text-base"
                                            min="0"
                                            step="5"
                                        />
                                        <span className="text-muted-foreground mr-2">min</span>
                                    </div>
                                </AttributeRow>
                                <Separator/>
                                <AttributeRow icon={Clock} label="Start Time">
                                <div className='w-32'>
                                    <Input 
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="w-full h-8 text-base"
                                            pattern="[0-9]{2}:[0-9]{2}"
                                        />
                                </div>
                                </AttributeRow>
                                <Separator/>
                                <AttributeRow icon={Calendar} label="Deadline">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="ghost" size="sm" className="text-primary text-base">
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

                            <Card className="rounded-2xl custom-card overflow-hidden flex-shrink-0">
                                <AttributeRow icon={Sun} label="Add to My Day">
                                    <Switch checked={isMyDay} onCheckedChange={setIsMyDay} />
                                </AttributeRow>
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
                            <Button className="w-full h-[50px] text-lg font-bold rounded-md" onClick={handleSaveTask}>Save Task</Button>
                        </footer>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
