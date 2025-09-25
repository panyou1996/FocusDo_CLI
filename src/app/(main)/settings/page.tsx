
'use client';

import Link from 'next/link';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Bell, User, Palette, Lock, Settings as SettingsIcon, Moon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';

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
  const { mode, setMode } = useAppContext();
  
  const handleModeChange = (isDark: boolean) => {
    setMode(isDark ? 'dark' : 'light');
  };

  return (
    <div className="">
      <header className="px-5 pt-10 pb-4 h-[80px] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-7 h-7" strokeWidth={2} />
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>
        <div className="w-10 h-10"></div>
      </header>

      <div className="px-5">
        <SettingsGroupLabel>Preferences</SettingsGroupLabel>
        <Card className="rounded-xl overflow-hidden custom-card">
           <div className="flex items-center h-[50px] px-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: "#8b5cf6" }}>
                <Moon className="w-5 h-5 text-white" />
              </div>
              <p className="text-base flex-grow">Dark Mode</p>
              <Switch 
                checked={mode === 'dark'}
                onCheckedChange={handleModeChange}
              />
            </div>
          <Separator />
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
