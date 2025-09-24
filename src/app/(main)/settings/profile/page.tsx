
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, RefreshCw, Wand2, Upload, Loader2, Shuffle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { generateAvatar } from '@/ai/flows/generate-avatar';
import { defaultAvatarGroup } from '@/lib/default-avatars';
import { Skeleton } from '@/components/ui/skeleton';


const avatarStyles = [
  'adventurer', 'big-ears', 'bottts', 'miniavs', 'open-peeps', 'pixel-art'
];

function generateRandomAvatars(count = 5) {
    try {
        const avatars = [];
        for (let i = 0; i < count; i++) {
            const style = avatarStyles[Math.floor(Math.random() * avatarStyles.length)];
            const seed = Math.random().toString(36).substring(7);
            avatars.push(`https://api.dicebear.com/8.x/${style}/svg?seed=${seed}`);
        }
        return avatars;
    } catch (error) {
        console.warn("Could not generate new avatars, using fallback. Error:", error);
        return defaultAvatarGroup;
    }
}


export default function ProfilePage() {
    const router = useRouter();
    const { currentUser, setCurrentUser } = useAppContext();

    const [name, setName] = React.useState('');
    const [selectedAvatarUrl, setSelectedAvatarUrl] = React.useState('');
    
    const [selectableAvatars, setSelectableAvatars] = React.useState<string[]>([]);
    const [aiPrompt, setAiPrompt] = React.useState('');
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [isUploading, setIsUploading] = React.useState(false);
    const [isClient, setIsClient] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState('random');

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    
    React.useEffect(() => {
        setIsClient(true);
        if (currentUser) {
            setName(currentUser.name);
            setSelectedAvatarUrl(currentUser.avatarUrl);
        }
    }, [currentUser]); 

    React.useEffect(() => {
        // Generate avatars only on the client-side
        if(isClient) {
            handleRandomizeAvatars();
        }
    }, [isClient]);

    const handleClose = () => {
        router.back();
    };

    const handleSaveChanges = () => {
        if (!name || !selectedAvatarUrl) {
            alert('Please enter your name and select an avatar.');
            return;
        }
        setCurrentUser({ name, avatarUrl: selectedAvatarUrl });
        handleClose();
    };

    const handleRandomizeAvatars = () => {
        setSelectableAvatars(generateRandomAvatars());
    };

    const handleGenerateAvatar = async () => {
        if (!aiPrompt) return;
        setIsGenerating(true);
        try {
            const result = await generateAvatar(aiPrompt);
            const svgDataUrl = `data:image/svg+xml;base64,${btoa(result.svgContent)}`;
            setSelectedAvatarUrl(svgDataUrl);
            setActiveTab('generate');
        } catch (error) {
            console.error("Error generating avatar:", error);
            alert("Could not generate avatar. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleImageUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsUploading(true);
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setSelectedAvatarUrl(result);
                setIsUploading(false);
                setActiveTab('upload');
            };
            reader.readAsDataURL(file);
        }
    };

    const renderLoadingState = () => (
      <div className="p-4 space-y-6">
        <div className="flex flex-col items-center">
          <Skeleton className="w-24 h-24 rounded-full mb-4" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
          <div className="pt-2 flex flex-col justify-center min-h-[90px]">
            <Skeleton className="h-14 w-full rounded-md" />
          </div>
        </div>
      </div>
    )

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end justify-center">
            <div className="bg-background flex flex-col w-full max-w-lg h-[95vh] rounded-t-2xl shadow-2xl">
                <header className="px-5 h-[56px] flex justify-between items-center flex-shrink-0 border-b">
                    <div className="w-10"></div>
                    <h1 className="text-[17px] font-bold">Profile</h1>
                    <Button variant="ghost" size="icon" aria-label="Close" onClick={handleClose}>
                        <X className="w-6 h-6" />
                    </Button>
                </header>

                <main className="flex-grow px-5 py-4 flex flex-col gap-4 overflow-y-auto">
                    {!isClient ? renderLoadingState() : (
                        <Card className="rounded-xl overflow-hidden shadow-soft border-none p-4">
                            <CardContent className="p-0 space-y-6">
                                <div className="flex flex-col items-center">
                                    <div className="relative w-24 h-24 mb-4">
                                        <Avatar className="w-24 h-24">
                                            <AvatarImage src={selectedAvatarUrl} alt={name} />
                                            <AvatarFallback>{name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        {isGenerating && (
                                            <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center rounded-full text-center p-2">
                                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                                <p className='text-xs mt-2 text-muted-foreground'>AI is generating...</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Your Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="e.g., Jane Doe"
                                        required
                                        className="h-auto p-3 rounded-md"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Choose an Avatar</Label>
                                    <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="random">
                                    <TabsList className='grid w-full grid-cols-3'>
                                        <TabsTrigger value="random"><Shuffle className='w-4 h-4 mr-2'/>Random</TabsTrigger>
                                        <TabsTrigger value="generate"><Wand2 className='w-4 h-4 mr-2'/>Generate</TabsTrigger>
                                        <TabsTrigger value="upload"><Upload className='w-4 h-4 mr-2'/>Upload</TabsTrigger>
                                    </TabsList>
                                    <div className='py-2 flex flex-col justify-center min-h-[90px]'>
                                        <TabsContent value="random" className="m-0 relative">
                                            <div className="flex items-center gap-2">
                                                <div className="grid grid-cols-5 gap-2 flex-grow">
                                                    {selectableAvatars.length > 0 ? selectableAvatars.map((avatarUrl, index) => (
                                                        <div
                                                        key={index}
                                                        className="relative cursor-pointer"
                                                        onClick={() => setSelectedAvatarUrl(avatarUrl)}
                                                        >
                                                        <img
                                                            src={avatarUrl}
                                                            alt="Selectable Avatar"
                                                            width={48}
                                                            height={48}
                                                            className={cn(
                                                                "rounded-full aspect-square object-cover border-4 transition-all bg-secondary mx-auto w-12 h-12",
                                                                selectedAvatarUrl === avatarUrl ? 'border-primary' : 'border-transparent'
                                                            )}
                                                        />
                                                        {selectedAvatarUrl === avatarUrl && (
                                                            <div className="absolute top-[-4px] right-0 bg-primary text-primary-foreground rounded-full p-0.5">
                                                                <CheckCircle className="w-3 h-3" />
                                                            </div>
                                                        )}
                                                        </div>
                                                    )) : defaultAvatarGroup.map((_, index) => (
                                                        <div key={index} className="relative cursor-pointer">
                                                          <div className="rounded-full aspect-square bg-secondary mx-auto w-12 h-12 animate-pulse" />
                                                        </div>
                                                    ))}
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={handleRandomizeAvatars} type="button">
                                                    <RefreshCw className="w-4 h-4"/>
                                                </Button>
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="generate" className='m-0'>
                                            <div className='flex gap-2 items-center'>
                                                <Input 
                                                    placeholder='e.g., a happy robot'
                                                    value={aiPrompt}
                                                    onChange={(e) => setAiPrompt(e.target.value)}
                                                    disabled={isGenerating}
                                                />
                                                <Button onClick={handleGenerateAvatar} disabled={isGenerating || !aiPrompt} type="button">
                                                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Go'}
                                                </Button>
                                            </div>
                                        </TabsContent>
                                    <TabsContent value="upload" className='m-0'>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                accept="image/*"
                                                className="hidden"
                                                disabled={isUploading}
                                            />
                                            <Button 
                                                variant="outline" 
                                                className="w-full h-12" 
                                                onClick={handleImageUploadClick}
                                                disabled={isUploading}
                                                type="button"
                                            >
                                                {isUploading ? (
                                                    <Loader2 className="w-5 h-5 animate-spin mr-2"/>
                                                ) : (
                                                    <Upload className="w-5 h-5 mr-2" />
                                                )}
                                                Upload Image
                                            </Button>
                                        </TabsContent>
                                    </div>
                                    </Tabs>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </main>
                
                <footer className="px-5 py-4 flex-shrink-0 border-t">
                    <Button className="w-full h-[50px] text-[17px] font-bold rounded-md" onClick={handleSaveChanges} disabled={!isClient}>
                        Save Changes
                    </Button>
                </footer>
            </div>
        </div>
    );
}
