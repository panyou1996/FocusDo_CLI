"use client";

import * as React from "react";
import { Inbox as InboxIcon, Filter, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { tasks, lists } from "@/lib/data";
import { TaskCard } from "@/components/tasks/TaskCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export default function InboxPage() {
  const [selectedList, setSelectedList] = React.useState(lists[0].id);
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
  const filteredTasks = tasks.filter(task => task.listId === selectedList);

  return (
    <div className="">
      <header className="px-5 pt-10 pb-4 h-[100px] flex justify-between items-center">
        <div className="flex items-center gap-2">
          <InboxIcon className="w-7 h-7" strokeWidth={2} />
          <h1 className="text-[34px] font-bold text-foreground">Inbox</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Filter className="w-6 h-6" strokeWidth={1.5} />
          </Button>
        </div>
      </header>

      <Tabs defaultValue="lists" className="w-full">
        <div className="px-5">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lists">Lists</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="lists" className="mt-4">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 px-5 py-2">
              {lists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => setSelectedList(list.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    selectedList === list.id
                      ? "text-white"
                      : "text-foreground"
                  )}
                  style={{
                    backgroundColor: selectedList === list.id ? list.color : 'var(--secondary-bg, #E5E5EA)',
                  }}
                >
                  {list.name}
                </button>
              ))}
              <Button size="icon" variant="secondary" className="rounded-full w-9 h-9 flex-shrink-0">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <div className="space-y-3 px-5 mt-4">
            {filteredTasks.map((task) => {
              const list = lists.find((l) => l.id === task.listId);
              if (!list) return null;
              return <TaskCard key={task.id} task={task} list={list} view="compact" />;
            })}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-4 px-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
              components={{
                IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                IconRight: () => <ChevronRight className="h-4 w-4" />,
              }}
            />
          <div className="space-y-3 px-3 mt-4">
            <h2 className="font-bold text-lg">Tasks for {date?.toLocaleDateString() ?? 'selected date'}</h2>
            {tasks.slice(0, 2).map((task) => {
              const list = lists.find((l) => l.id === task.listId);
              if (!list) return null;
              return <TaskCard key={task.id} task={task} list={list} view="compact" />;
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
