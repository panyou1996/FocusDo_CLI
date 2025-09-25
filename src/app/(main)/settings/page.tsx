
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

const SettingsItem = ({ icon: Icon, label, color, action, href, onClick, checked, onCheckedChange }: { icon: React.ElementType, label: string, color: string, action: 'switch' | 'navigate', href?: string, onClick?: () => void, checked?: boolean, onCheckedChange?: (checked: boolean) => void }) => {
  const content = (
    <div className="flex items-center h-[50px] px-4">
      <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: color }}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-base flex-grow">{label}</p>
      {action === 'switch' && <Switch checked={checked} onCheckedChange={onCheckedChange} />}
      {action === 'navigate' && <ChevronRight className="w-5 h-5 text-muted-foreground" />}
    </div>
  );

  if (action === 'navigate' && href) {
    return <Link href={href}>{content}</Link>;
  }
  
  if (onClick) {
      return <div onClick={onClick} className="cursor-pointer">{content}</div>;
  }

  return content;
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
        <Card className="rounded-xl overflow-hidden shadow-soft border-none">
          <SettingsItem 
            icon={Moon} 
            label="Dark Mode" 
            color="#8b5cf6"
            action="switch" 
            checked={mode === 'dark'}
            onCheckedChange={handleModeChange}
          />
          <Separator />
          <SettingsItem icon={Palette} label="Appearance" color="#3b82f6" action="navigate" href="/settings/appearance" />
        </Card>

        <SettingsGroupLabel>Account Settings</SettingsGroupLabel>
        <Card className="rounded-xl overflow-hidden shadow-soft border-none">
          <SettingsItem icon={User} label="Profile" color="#10b981" action="navigate" href="/settings/profile" />
          <Separator />
          <SettingsItem icon={Lock} label="Password" color="#f97316" action="navigate" />
        </Card>
      </div>
    </div>
  );
}
