
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Moon, Sun, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAppContext } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { themes } from '@/lib/themes';

const SettingsGroupLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="px-1 text-[13px] font-regular text-muted-foreground uppercase mt-6 mb-2">{children}</p>
);

export default function AppearancePage() {
  const router = useRouter();
  const { theme: currentTheme, setTheme, mode, setMode } = useAppContext();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleThemeChange = (themeName: string) => {
    setTheme(themeName);
  };
  
  const handleModeChange = (isDark: boolean) => {
    setMode(isDark ? 'dark' : 'light');
  };

  if (!isClient) {
    return null; // or a loading skeleton
  }

  return (
    <div className="px-5">
      <header className="pt-10 pb-4 h-[100px] flex justify-between items-center">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-[28px] font-bold text-foreground">Appearance</h1>
        <div className="w-10"></div>
      </header>
      
      <SettingsGroupLabel>Color Mode</SettingsGroupLabel>
      <Card className="rounded-xl overflow-hidden shadow-soft border-none p-4">
        <div className="flex items-center justify-between">
            <div className='flex items-center'>
                <Sun className="w-5 h-5 mr-3 text-muted-foreground" />
                <p className="text-[17px]">Light Mode</p>
            </div>
            <Switch
                checked={mode === 'dark'}
                onCheckedChange={handleModeChange}
                aria-label="Toggle dark mode"
            />
            <div className='flex items-center'>
                <Moon className="w-5 h-5 ml-3 text-muted-foreground" />
                <p className="text-[17px] ml-1">Dark Mode</p>
            </div>
        </div>
      </Card>
      
      <SettingsGroupLabel>Theme Color</SettingsGroupLabel>
      <Card className="rounded-xl overflow-hidden shadow-soft border-none p-4">
        <div className="grid grid-cols-5 gap-4">
          {themes.map((theme) => (
            <div key={theme.name} className="flex flex-col items-center gap-2" onClick={() => handleThemeChange(theme.name)}>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer"
                style={{ backgroundColor: `hsl(${theme.cssVars.light.primary})` }}
              >
                {currentTheme === theme.name && <Check className="w-6 h-6 text-primary-foreground" />}
              </div>
              <p className={cn("text-xs", currentTheme === theme.name ? "text-primary font-semibold" : "text-muted-foreground")}>{theme.name}</p>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}
