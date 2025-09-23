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
  const dateString = today.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
  const dayString = today.toLocaleDateString('en-US', { weekday: 'short' });

  return (
    <div className="px-5">
      <header className="pt-10 pb-4 h-[100px] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Sun className="w-7 h-7 text-orange-400" strokeWidth={2} />
          <div>
            <h1 className="text-[28px] font-bold text-foreground">My Day</h1>
            <p className="text-[15px] text-muted-foreground">{`${dateString}, ${dayString}`}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
