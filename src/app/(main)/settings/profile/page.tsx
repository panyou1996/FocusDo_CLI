
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, RefreshCw, Wand2, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { generateAvatar } from '@/ai/flows/generate-avatar';
import { ParticleLoader } from '@/components/common/ParticleLoader';

const SettingsGroupLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="px-1 text-[13px] font-regular text-muted-foreground uppercase mt-6 mb-2">{children}</p>
);

const avatarStyles = [
  'adventurer', 'big-ears', 'bottts', 'miniavs', 'open-peeps', 'pixel-art'
];

function generateRandomAvatars(count = 6) {
    const avatars = [];
    for (let i = 0; i < count; i++) {
        const style = avatarStyles[Math.floor(Math.random() * avatarStyles.length)];
        const seed = Math.random().toString(36).substring(7);
        avatars.push(`https://api.dicebear.com/8.x/${style}/svg?seed=${seed}`);
    }
    return avatars;
}


export default function ProfilePage() {
    const router = useRouter();
    const { currentUser, setCurrentUser } = useAppContext();

    const [name, setName] = React.useState('');
    const [selectedAvatarUrl, setSelectedAvatarUrl] = React.useState('');
    
    const [selectableAvatars, setSelectableAvatars] = React.useState<string[]>([]);
    const [aiPrompt, setAiPrompt] = React.useState('');
    const [generatedAvatar, setGeneratedAvatar] = React.useState<string | null>(null);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [isUploading, setIsUploading] = React.useState(false);
    const [isClient, setIsClient] = React.useState(false);

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    
    React.useEffect(() => {
        setIsClient(true);
        if (currentUser) {
            setName(currentUser.name);
            setSelectedAvatarUrl(currentUser.avatarUrl);
        }
        setSelectableAvatars(generateRandomAvatars());
    }, [currentUser]); 


    const handleSaveChanges = () => {
        if (!name || !selectedAvatarUrl) {
            alert('Please enter your name and select an avatar.');
            return;
        }
        setCurrentUser({ name, avatarUrl: selectedAvatarUrl });
        router.back();
    };

    const handleRandomizeAvatars = () => {
        setSelectableAvatars(generateRandomAvatars());
    };

    const handleGenerateAvatar = async () => {
        if (!aiPrompt) return;
        setIsGenerating(true);
        setGeneratedAvatar(null);
        try {
            const result = await generateAvatar(aiPrompt);
            const svgDataUrl = `data:image/svg+xml;base64,${btoa(result.svgContent)}`;
            setGeneratedAvatar(svgDataUrl);
            setSelectedAvatarUrl(svgDataUrl);
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
            };
            reader.readAsDataURL(file);
        }
    };

    if (!isClient) {
        return (
             <div className="px-5">
                <header className="pt-10 pb-4 h-[100px] flex justify-between items-center">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <h1 className="text-[28px] font-bold text-foreground">Profile</h1>
                    <div className="w-10"></div>
                </header>
            </div>
        );
    }


    return (
        <div className="px-5">
            <header className="pt-10 pb-4 h-[100px] flex justify-between items-center">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-[28px] font-bold text-foreground">Profile</h1>
                <Button variant="link" className="text-primary font-bold" onClick={handleSaveChanges}>Save</Button>
            </header>

            <div className="flex flex-col items-center mb-8">
                <Avatar className="w-24 h-24 mb-4">
                    <AvatarImage src={selectedAvatarUrl} alt={name} />
                    <AvatarFallback>{name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold">{name}</h2>
            </div>
            
            <SettingsGroupLabel>Edit Profile</SettingsGroupLabel>
            <Card className="rounded-xl overflow-hidden shadow-soft border-none p-4">
                <CardContent className="p-0 space-y-6">
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
                        <Tabs defaultValue="select">
                        <TabsList className='grid w-full grid-cols-3'>
                            <TabsTrigger value="select">Select</TabsTrigger>
                            <TabsTrigger value="generate"><Wand2 className='w-4 h-4 mr-2'/>Generate</TabsTrigger>
                            <TabsTrigger value="upload"><Upload className='w-4 h-4 mr-2'/>Upload</TabsTrigger>
                        </TabsList>
                        <TabsContent value="select" className="pt-4 h-[180px] relative">
                            <div className="grid grid-cols-3 gap-4">
                            {selectableAvatars.map((avatarUrl, index) => (
                                <div
                                key={index}
                                className="relative cursor-pointer"
                                onClick={() => setSelectedAvatarUrl(avatarUrl)}
                                >
                                <img
                                    src={avatarUrl}
                                    alt="Selectable Avatar"
                                    width={80}
                                    height={80}
                                    className={cn(
                                    "rounded-full aspect-square object-cover border-4 transition-all bg-secondary mx-auto",
                                    selectedAvatarUrl === avatarUrl ? 'border-primary' : 'border-transparent'
                                    )}
                                />
                                {selectedAvatarUrl === avatarUrl && (
                                    <div className="absolute top-0 right-2 bg-primary text-primary-foreground rounded-full p-1">
                                    <CheckCircle className="w-4 h-4" />
                                    </div>
                                )}
                                </div>
                            ))}
                            </div>
                            <Button variant="outline" size="icon" className="absolute top-4 right-0 h-9 w-9" onClick={handleRandomizeAvatars} type="button">
                                <RefreshCw className="w-4 h-4"/>
                            </Button>
                        </TabsContent>
                        <TabsContent value="generate" className="pt-4 h-[180px] flex flex-col">
                            <div className='w-full h-[120px] flex items-center justify-center bg-secondary rounded-lg overflow-hidden'>
                                {isGenerating && <ParticleLoader particleCount={500} />}
                                {!isGenerating && generatedAvatar && (
                                <div
                                    className="relative cursor-pointer"
                                    onClick={() => setSelectedAvatarUrl(generatedAvatar)}
                                    >
                                    <img
                                        src={generatedAvatar}
                                        alt="AI Generated Avatar"
                                        width={80}
                                        height={80}
                                        className={cn(
                                        "rounded-full aspect-square object-cover border-4 transition-all bg-white",
                                        selectedAvatarUrl === generatedAvatar ? 'border-primary' : 'border-transparent'
                                        )}
                                    />
                                    {selectedAvatarUrl === generatedAvatar && (
                                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground rounded-full p-1">
                                        <CheckCircle className="w-4 h-4" />
                                        </div>
                                    )}
                                    </div>
                                )}
                            </div>
                            <div className='flex gap-2 items-center h-[60px]'>
                                <Input 
                                    placeholder='e.g., a happy robot'
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                />
                                <Button onClick={handleGenerateAvatar} disabled={isGenerating || !aiPrompt} type="button">
                                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Go'}
                                </Button>
                            </div>
                        </TabsContent>
                        <TabsContent value="upload" className="pt-4 h-[180px] flex flex-col justify-center">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                                />
                             <div className="w-full h-[120px] flex gap-4 items-center justify-center">
                                <div 
                                    className="w-3/5 h-full border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground cursor-pointer bg-secondary/50"
                                    onClick={handleImageUploadClick}
                                >
                                    <Upload className="w-8 h-8 mb-2" />
                                    <p>Click to upload</p>
                                </div>
                                <div className="w-2/5 h-full flex flex-col items-center justify-center">
                                    <p className="text-sm text-muted-foreground mb-2">Preview</p>
                                    <Avatar className="w-20 h-20">
                                        {isUploading ? (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Loader2 className="w-6 h-6 animate-spin"/>
                                            </div>
                                        ) : (
                                            <>
                                                <AvatarImage src={selectedAvatarUrl.startsWith('data:image/') ? selectedAvatarUrl : undefined} alt="Uploaded preview" />
                                                <AvatarFallback>{name?.charAt(0) || 'U'}</AvatarFallback>
                                            </>
                                        )}
                                    </Avatar>
                                </div>
                            </div>
                        </TabsContent>
                        </Tabs>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-8">
                 <Button className="w-full h-[50px] text-[17px] font-bold rounded-md" onClick={handleSaveChanges}>
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
