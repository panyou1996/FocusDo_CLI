
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';


export default function FilterPage() {
    const router = useRouter();

    const [filterStatus, setFilterStatus] = useLocalStorage<'all' | 'incomplete' | 'completed'>('inbox-filter-status', 'all');
    const [filterImportance, setFilterImportance] = useLocalStorage<'all' | 'important' | 'not-important'>('inbox-filter-importance', 'all');
    const [sortBy, setSortBy] = useLocalStorage<'default' | 'dueDate' | 'importance'>('inbox-sort-by', 'default');
    
    // Temporary states to avoid instant updates on the underlying page
    const [tempFilterStatus, setTempFilterStatus] = React.useState(filterStatus);
    const [tempFilterImportance, setTempFilterImportance] = React.useState(filterImportance);
    const [tempSortBy, setTempSortBy] = React.useState(sortBy);

    const handleDone = () => {
        setFilterStatus(tempFilterStatus);
        setFilterImportance(tempFilterImportance);
        setSortBy(tempSortBy);
        router.back();
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end justify-center">
            <div className="bg-background flex flex-col w-full max-w-lg h-[95vh] rounded-t-2xl shadow-2xl">
                <header className="px-5 h-[56px] flex justify-between items-center flex-shrink-0 border-b">
                    <div className="w-10"></div>
                    <h1 className="text-[17px] font-bold">Filter & Sort</h1>
                    <Button variant="ghost" size="icon" aria-label="Close" onClick={() => router.back()}>
                        <X className="w-6 h-6" />
                    </Button>
                </header>

                <main className="flex-grow px-5 py-4 flex flex-col gap-4 overflow-y-auto">
                    <Card className="rounded-2xl shadow-soft border-none p-4 flex-shrink-0">
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">FILTER BY</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="filter-status" className="text-base">Status</Label>
                                <Tabs value={tempFilterStatus} onValueChange={(value) => setTempFilterStatus(value as any)} className="w-auto">
                                    <TabsList className="grid grid-cols-3">
                                        <TabsTrigger value="all">All</TabsTrigger>
                                        <TabsTrigger value="incomplete">Incomplete</TabsTrigger>
                                        <TabsTrigger value="completed">Completed</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <Label htmlFor="show-important" className="text-base">Importance</Label>
                                <Tabs
                                    value={tempFilterImportance}
                                    onValueChange={(value) => setTempFilterImportance(value as any)}
                                    className="w-auto"
                                >
                                    <TabsList className="grid grid-cols-3">
                                        <TabsTrigger value="all">All</TabsTrigger>
                                        <TabsTrigger value="important">Important</TabsTrigger>
                                        <TabsTrigger value="not-important">Not Important</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                        </div>
                    </Card>

                    <Card className="rounded-2xl shadow-soft border-none p-4 flex-shrink-0">
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">SORT BY</h3>
                        <Tabs value={tempSortBy} onValueChange={(value) => setTempSortBy(value as any)}>
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="default">Default</TabsTrigger>
                                <TabsTrigger value="dueDate">Due Date</TabsTrigger>
                                <TabsTrigger value="importance">Importance</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </Card>
                </main>

                <footer className="px-5 py-4 flex-shrink-0 border-t">
                    <Button className="w-full h-[50px] text-[17px] font-bold rounded-md" onClick={handleDone}>Done</Button>
                </footer>
            </div>
        </div>
    );
}
