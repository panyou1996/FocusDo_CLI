import { ChevronRight, Bell, User, Palette, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

const SettingsGroupLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="px-5 text-[13px] font-regular text-muted-foreground uppercase mt-6 mb-2">{children}</p>
);

const SettingsItem = ({ icon: Icon, label, color, action }: { icon: React.ElementType, label: string, color: string, action: 'switch' | 'navigate' }) => (
  <div className="flex items-center h-[50px] px-4">
    <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: color }}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <p className="text-[17px] flex-grow">{label}</p>
    {action === 'switch' && <Switch />}
    {action === 'navigate' && <ChevronRight className="w-5 h-5 text-muted-foreground" />}
  </div>
);

export default function SettingsPage() {
  return (
    <div className="">
      <header className="px-5 pt-10 pb-4 h-[100px] flex justify-between items-center">
        <h1 className="text-[28px] font-bold text-foreground">Settings</h1>
      </header>

      <div className="px-5">
        <SettingsGroupLabel>Preferences</SettingsGroupLabel>
        <Card className="rounded-xl overflow-hidden shadow-soft border-none">
          <SettingsItem icon={Bell} label="Notifications" color="#ef4444" action="switch" />
          <Separator />
          <SettingsItem icon={Palette} label="Appearance" color="#3b82f6" action="navigate" />
        </Card>

        <SettingsGroupLabel>Account Settings</SettingsGroupLabel>
        <Card className="rounded-xl overflow-hidden shadow-soft border-none">
          <SettingsItem icon={User} label="Profile" color="#8b5cf6" action="navigate" />
          <Separator />
          <SettingsItem icon={Lock} label="Password" color="#f97316" action="navigate" />
        </Card>
      </div>
    </div>
  );
}
