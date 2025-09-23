import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, ListTree, Hourglass, Clock, Calendar, Star, Pin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const AttributeRow = ({ icon: Icon, label, children }: { icon: React.ElementType, label: string, children: React.ReactNode }) => (
    <div className="flex items-center h-[50px] px-4">
        <Icon className="w-6 h-6 text-muted-foreground mr-4" strokeWidth={1.5} />
        <Label className="text-[17px] flex-grow">{label}</Label>
        {children}
    </div>
);

export default function AddTaskPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col w-full max-w-lg mx-auto">
      <header className="px-5 h-[56px] flex justify-between items-center flex-shrink-0">
        <div className="w-10"></div>
        <h1 className="text-[17px] font-bold">Add New Task</h1>
        <Link href="/today">
          <Button variant="ghost" size="icon" aria-label="Close">
            <X className="w-6 h-6" />
          </Button>
        </Link>
      </header>

      <main className="flex-grow px-5 py-4 flex flex-col gap-4">
        <Card className="rounded-2xl shadow-soft border-none p-1">
          <Input 
            placeholder="What do you want to do?"
            className="border-none text-[18px] font-medium h-[60px] p-4 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </Card>
        
        <Card className="rounded-2xl shadow-soft border-none p-1">
          <Textarea 
            placeholder="Add a description..."
            className="border-none text-[17px] min-h-[120px] p-4 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </Card>

        <Card className="rounded-2xl shadow-soft border-none overflow-hidden">
            <AttributeRow icon={ListTree} label="Subtasks">
                <Button variant="ghost" size="sm" className="text-primary">Add</Button>
            </AttributeRow>
            <Separator/>
            <AttributeRow icon={Hourglass} label="Duration">
                <Button variant="ghost" className="text-muted-foreground">30 min</Button>
            </AttributeRow>
            <Separator/>
            <AttributeRow icon={Clock} label="Start Time">
                <Button variant="ghost" className="text-muted-foreground">Set Time</Button>
            </AttributeRow>
            <Separator/>
            <AttributeRow icon={Calendar} label="Deadline">
                <Button variant="ghost" className="text-muted-foreground">Set Date</Button>
            </AttributeRow>
        </Card>

        <Card className="rounded-2xl shadow-soft border-none overflow-hidden">
            <AttributeRow icon={Star} label="Mark as Important">
                <Switch />
            </AttributeRow>
            <Separator/>
            <AttributeRow icon={Pin} label="Fixed Schedule">
                <Switch />
            </AttributeRow>
        </Card>
      </main>

      <footer className="px-5 py-4 flex-shrink-0">
        <Button className="w-full h-[50px] text-[17px] font-bold rounded-md">Save Task</Button>
      </footer>
    </div>
  );
}
