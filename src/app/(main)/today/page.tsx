"use client";

import * as React from "react";
import { Sun, LayoutGrid, List, SlidersHorizontal, Wand2 } from "lucide-react";
import { TaskCard } from "@/components/tasks/TaskCard";
import { tasks, lists } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function TodayPage() {
  const [view, setView] = React.useState<"compact" | "detail">("compact");
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const dayString = today.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="px-5">
      <header className="pt-10 pb-6 h-[120px]">
        <div className="flex justify-between items-start">
          <div>
            <Sun className="w-6 h-6 mb-1 text-orange-400" strokeWidth={1.5} />
            <h1 className="text-[34px] font-bold text-foreground">My Day</h1>
            <p className="text-[15px] text-muted-foreground">{`${dateString}, ${dayString}`}</p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex bg-secondary p-1 rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8",
                  view === "compact" && "bg-card shadow-sm"
                )}
                onClick={() => setView("compact")}
              >
                <LayoutGrid className="w-5 h-5" strokeWidth={1.5} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8",
                  view === "detail" && "bg-card shadow-sm"
                )}
                onClick={() => setView("detail")}
              >
                <List className="w-5 h-5" strokeWidth={1.5} />
              </Button>
            </div>
             <Button variant="ghost" size="icon" className="h-8 w-8 bg-secondary">
              <SlidersHorizontal className="w-5 h-5" strokeWidth={1.5} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 bg-secondary">
              <Wand2 className="w-5 h-5 text-primary" strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      </header>

      <div className="space-y-3">
        {tasks.map((task) => {
          const list = lists.find((l) => l.id === task.listId);
          if (!list) return null;
          return <TaskCard key={task.id} task={task} list={list} view={view} />;
        })}
      </div>
    </div>
  );
}
