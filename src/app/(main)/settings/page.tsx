
import Link from 'next/link';
import * as React from 'react';
import { ChevronRight, Bell, User, Palette, Lock, Settings as SettingsIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const SettingsGroupLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="px-5 text-sm font-regular text-muted-foreground uppercase mt-6 mb-2">{children}</p>
);

const SettingsItem = ({ icon: Icon, label, color, href }: { icon: React.ElementType, label: string, color: string, href: string }) => {
  return (
    <Link href={href}>
      <div className="flex items-center h-[50px] px-4 cursor-pointer">
        <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: color }}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <p className="text-base flex-grow">{label}</p>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </Link>
  );
};


export default function SettingsPage() {
  return (
    <div className='px-5'>
      <header className="pt-10 pb-4 h-[80px] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-7 h-7" strokeWidth={2} />
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        </div>
        <div className="w-10 h-10"></div>
      </header>

      <div>
        <SettingsGroupLabel>Preferences</SettingsGroupLabel>
        <Card className="rounded-xl overflow-hidden custom-card">
          <SettingsItem icon={Palette} label="Appearance" color="#3b82f6" href="/settings/appearance" />
        </Card>

        <SettingsGroupLabel>Account Settings</SettingsGroupLabel>
        <Card className="rounded-xl overflow-hidden custom-card">
          <SettingsItem icon={User} label="Profile" color="#10b981" href="/settings/profile" />
          <Separator />
          <SettingsItem icon={Lock} label="Password" color="#f97316" href="#" />
        </Card>
      </div>
    </div>
  );
}
