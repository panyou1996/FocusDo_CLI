
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppContext } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { themes } from '@/lib/themes';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { AnimatePresence, motion } from 'framer-motion';

const SettingsGroupLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="px-1 text-sm font-normal text-muted-foreground uppercase mt-4 mb-2">{children}</p>
);

const sizeSteps = ['XS', 'S', 'M', 'L', 'XL'];

export default function AppearancePage() {
  const router = useRouter();
  const { 
    theme: currentTheme, 
    setTheme, 
    uiSize, 
    setUiSize,
    cardStyle,
    setCardStyle,
  } = useAppContext();
  const [isClient, setIsClient] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleThemeChange = (themeName: string) => {
    setTheme(themeName);
  };
  
  const handleSizeChange = (index: number) => {
    setUiSize(index);
  }
  
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => router.back(), 300); // Match animation duration
  };
  
  const modalVariants = {
    hidden: { y: "100%", transition: { type: 'spring', stiffness: 400, damping: 30 } },
    visible: { y: "0%", transition: { type: 'spring', stiffness: 400, damping: 30 } },
  };

  if (!isClient) {
    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end justify-center">
            <div className="bg-background flex flex-col w-full max-w-lg h-[95vh] rounded-t-2xl shadow-2xl">
                 <header className="px-5 h-[56px] flex justify-between items-center flex-shrink-0 border-b">
                    <h1 className="text-lg font-bold">Appearance</h1>
                    <Button variant="ghost" size="icon" aria-label="Close" onClick={() => router.back()}>
                        <X className="w-6 h-6" />
                    </Button>
                </header>
            </div>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end justify-center">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="bg-background flex flex-col w-full max-w-lg h-[95vh] rounded-t-2xl shadow-2xl"
          >
            <header className="px-5 h-[56px] flex justify-between items-center flex-shrink-0 border-b">
              <div className="w-10"></div>
              <h1 className="text-lg font-bold">Appearance</h1>
              <Button variant="ghost" size="icon" aria-label="Close" onClick={handleClose}>
                <X className="w-6 h-6" />
              </Button>
            </header>

            <main className="flex-grow px-5 py-4 flex flex-col gap-2 overflow-y-auto">
              
              <SettingsGroupLabel>UI Size</SettingsGroupLabel>
              <Card className="rounded-xl custom-card">
                <Tabs value={String(uiSize)} onValueChange={(value) => handleSizeChange(Number(value))} className="p-2">
                    <TabsList className="grid w-full grid-cols-5">
                        {sizeSteps.map((size, index) => (
                            <TabsTrigger key={size} value={String(index)}>{size}</TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
              </Card>
              
              <SettingsGroupLabel>Card Style</SettingsGroupLabel>
              <Card className="rounded-xl custom-card">
                <Tabs value={cardStyle} onValueChange={(value) => setCardStyle(value as any)} className="p-2">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="default">Default</TabsTrigger>
                        <TabsTrigger value="flat">Flat</TabsTrigger>
                        <TabsTrigger value="bordered">Bordered</TabsTrigger>
                    </TabsList>
                </Tabs>
              </Card>

              <SettingsGroupLabel>Theme Color</SettingsGroupLabel>
              <Card className="rounded-xl custom-card p-4">
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

    