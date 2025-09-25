
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Check, type Icon as LucideIcon, Briefcase, User, Book, ShoppingBasket, Heart, Gift, Plane, Home, Coffee, Code, Film, Music, Car, Pizza, Dumbbell, School, Building, TreePine, PenTool, Paintbrush, Wallet, Lightbulb, Globe, Cloud, TrendingUp, Target, Sprout, Star, Flag, Award, Camera, Gamepad2, Wrench, Package } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import type { TaskList } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';

const availableColors = [
  'rgb(0, 122, 255)', 'rgb(255, 149, 0)', 'rgb(52, 199, 89)', 'rgb(255, 45, 85)',
  'rgb(88, 86, 214)', 'rgb(175, 82, 222)', 'rgb(255, 59, 48)', 'rgb(10, 132, 255)'
];

const availableIcons: {name: string, icon: LucideIcon}[] = [
  { name: 'Briefcase', icon: Briefcase },
  { name: 'User', icon: User },
  { name: 'Book', icon: Book },
  { name: 'ShoppingBasket', icon: ShoppingBasket },
  { name: 'Heart', icon: Heart },
  { name: 'Gift', icon: Gift },
  { name: 'Plane', icon: Plane },
  { name: 'Home', icon: Home },
  { name: 'Coffee', icon: Coffee },
  { name: 'Code', icon: Code },
  { name: 'Film', icon: Film },
  { name: 'Music', icon: Music },
  { name: 'Car', icon: Car },
  { name: 'Pizza', icon: Pizza },
  { name: 'Dumbbell', icon: Dumbbell },
  { name: 'School', icon: School },
  { name: 'Building', icon: Building },
  { name: 'TreePine', icon: TreePine },
  { name: 'PenTool', icon: PenTool },
  { name: 'Paintbrush', icon: Paintbrush },
  { name: 'Wallet', icon: Wallet },
  { name: 'Lightbulb', icon: Lightbulb },
  { name: 'Globe', icon: Globe },
  { name: 'Cloud', icon: Cloud },
  { name: 'TrendingUp', icon: TrendingUp },
  { name: 'Target', icon: Target },
  { name: 'Sprout', icon: Sprout },
  { name: 'Star', icon: Star },
  { name: 'Flag', icon: Flag },
  { name: 'Award', icon: Award },
  { name: 'Camera', icon: Camera },
  { name: 'Gamepad2', icon: Gamepad2 },
];


export default function AddListPage() {
    const router = useRouter();
    const { addList } = useAppContext();
    const [isVisible, setIsVisible] = React.useState(true);

    const [name, setName] = React.useState('');
    const [selectedColor, setSelectedColor] = React.useState(availableColors[0]);
    const [selectedIcon, setSelectedIcon] = React.useState(availableIcons[0]);
    
    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => router.back(), 300); // Match animation duration
    };

    const handleSaveList = () => {
        if (!name) {
            alert("List name is required.");
            return;
        }

        const newList: TaskList = {
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name,
            color: selectedColor,
            icon: selectedIcon.name, // Store icon name as string
        };

        addList(newList);
        handleClose();
    };
    
    const modalVariants = {
        hidden: { y: "100%", transition: { type: 'tween', ease: 'easeOut', duration: 0.3 } },
        visible: { y: "0%", transition: { type: 'tween', ease: 'easeIn', duration: 0.3 } },
    };

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
                            <h1 className="text-[17px] font-bold">Add New List</h1>
                            <Button variant="ghost" size="icon" aria-label="Close" onClick={handleClose}>
                                <X className="w-6 h-6" />
                            </Button>
                        </header>

                        <main className="flex-grow px-5 py-4 flex flex-col gap-4 overflow-y-auto">
                            <Card className="rounded-2xl custom-card p-4 flex-shrink-0">
                                <Label htmlFor="list-name">List Name</Label>
                                <Input
                                    id="list-name"
                                    placeholder="e.g., Groceries"
                                    className="border-none text-[18px] font-medium h-[50px] p-0 mt-1 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </Card>
                            
                            <Card className="rounded-2xl custom-card p-4 flex-shrink-0">
                                <Label>Color</Label>
                                <div className="grid grid-cols-8 gap-2 mt-2">
                                    {availableColors.map(color => (
                                        <button 
                                            key={color} 
                                            className="w-full aspect-square rounded-full flex items-center justify-center"
                                            style={{ backgroundColor: color }}
                                            onClick={() => setSelectedColor(color)}
                                        >
                                            {selectedColor === color && <Check className="w-5 h-5 text-white" />}
                                        </button>
                                    ))}
                                </div>
                            </Card>
                            
                            <Card className="rounded-2xl custom-card p-4 flex-shrink-0">
                                <Label>Icon</Label>
                                <div className="grid grid-cols-8 gap-2 mt-2">
                                    {availableIcons.map(iconItem => {
                                        const IconComponent = iconItem.icon;
                                        const isSelected = selectedIcon.name === iconItem.name;
                                        return (
                                            <button 
                                                key={iconItem.name} 
                                                className={cn(
                                                    "w-full aspect-square rounded-lg flex items-center justify-center bg-secondary",
                                                    isSelected && "bg-primary text-primary-foreground"
                                                )}
                                                onClick={() => setSelectedIcon(iconItem)}
                                            >
                                                <IconComponent className="w-6 h-6" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </Card>
                        </main>

                        <footer className="px-5 py-4 flex-shrink-0 border-t">
                            <Button className="w-full h-[50px] text-[17px] font-bold rounded-md" onClick={handleSaveList}>Save List</Button>
                        </footer>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
