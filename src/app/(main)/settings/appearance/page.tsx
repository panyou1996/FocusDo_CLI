
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Moon, Sun, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAppContext } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { themes } from '@/lib/themes';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SettingsGroupLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="px-1 text-sm font-normal text-muted-foreground uppercase mt-4 mb-2">{children}</p>
);

const sizeSteps = ['XS', 'S', 'M', 'L', 'XL'];

export default function AppearancePage() {
  const router = useRouter();
  const { theme: currentTheme, setTheme, mode, setMode, uiSize, setUiSize } = useAppContext();
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

  const handleSizeChange = (index: number) => {
    setUiSize(index);
  }

  if (!isClient) {
    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end justify-center">
            <div className="bg-background flex flex-col w-full max-w-lg h-[95vh] rounded-t-2xl shadow-2xl">
                 <header className="px-5 h-[56px] flex justify-between items-center flex-shrink-0 border-b">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <h1 className="text-base font-bold">Appearance</h1>
                    <div className="w-10"></div>
                </header>
            </div>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end justify-center">
      <div className="bg-background flex flex-col w-full max-w-lg h-[95vh] rounded-t-2xl shadow-2xl">
        <header className="px-5 h-[56px] flex justify-between items-center flex-shrink-0 border-b">
          <div className="w-10"></div>
          <h1 className="text-lg font-bold">Appearance</h1>
          <Button variant="ghost" size="icon" aria-label="Close" onClick={() => router.back()}>
            <X className="w-6 h-6" />
          </Button>
        </header>

        <main className="flex-grow px-5 py-4 flex flex-col gap-2 overflow-y-auto">
          <SettingsGroupLabel>Color Mode</SettingsGroupLabel>
          <Card className="rounded-xl shadow-soft border-none">
            <div className="flex items-center justify-between h-[50px] px-4">
                <div className='flex items-center'>
                    <Moon className="w-5 h-5 mr-3 text-muted-foreground" />
                    <p className="text-base">Dark Mode</p>
                </div>
                <Switch
                    checked={mode === 'dark'}
                    onCheckedChange={handleModeChange}
                    aria-label="Toggle dark mode"
                />
            </div>
          </Card>

          <SettingsGroupLabel>UI Size</SettingsGroupLabel>
          <Card className="rounded-xl overflow-hidden shadow-soft border-none">
            <Tabs value={String(uiSize)} onValueChange={(value) => handleSizeChange(Number(value))} className="p-2">
                <TabsList className="grid w-full grid-cols-5">
                    {sizeSteps.map((size, index) => (
                        <TabsTrigger key={size} value={String(index)}>{size}</TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
          </Card>
          
          <SettingsGroupLabel>Theme Color</SettingsGroupLabel>
          <Card className="rounded-xl overflow-hidden shadow-soft border-none p-4">
            <div className="grid grid-cols-6 gap-4">
              {themes.map((theme) => (
                <div key={theme.name} className="flex flex-col items-center gap-2" onClick={() => handleThemeChange(theme.name)}>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
                    style={{ backgroundColor: `hsl(${theme.cssVars.light.primary})` }}
                  >
                    {currentTheme === theme.name && <Check className="w-5 h-5 text-primary-foreground" />}
                  </div>
                  <p className={cn("text-xs", currentTheme === theme.name ? "text-primary font-semibold" : "text-muted-foreground")}>{theme.name}</p>
                </div>
              ))}
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
