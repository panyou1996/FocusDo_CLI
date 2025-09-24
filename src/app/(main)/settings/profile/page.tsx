
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
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [isUploading, setIsUploading] = React.useState(false);
    const [isClient, setIsClient] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState('select');

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
        setActiveTab('generate');
        try {
            const result = await generateAvatar(aiPrompt);
            const svgDataUrl = `data:image/svg+xml;base64,${btoa(result.svgContent)}`;
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
            
            <SettingsGroupLabel>Edit Profile</SettingsGroupLabel>
            <Card className="rounded-xl overflow-hidden shadow-soft border-none p-4">
                <CardContent className="p-0 space-y-6">
                    <div className="flex flex-col items-center">
                        <Avatar className="w-24 h-24 mb-4">
                            <AvatarImage src={selectedAvatarUrl} alt={name} />
                            <AvatarFallback>{name?.charAt(0)}</AvatarFallback>
                        </Avatar>
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
                         <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="select">
                        <TabsList className='grid w-full grid-cols-3'>
                            <TabsTrigger value="select">Select</TabsTrigger>
                            <TabsTrigger value="generate"><Wand2 className='w-4 h-4 mr-2'/>Generate</TabsTrigger>
                            <TabsTrigger value="upload"><Upload className='w-4 h-4 mr-2'/>Upload</TabsTrigger>
                        </TabsList>
                        <div className='min-h-[220px] flex flex-col justify-center py-2'>
                            <TabsContent value="select" className="relative m-0">
                                <div className="grid grid-cols-3 gap-y-4 gap-x-2">
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
                                            "rounded-full aspect-square object-cover border-4 transition-all bg-secondary mx-auto w-[80px] h-[80px]",
                                            selectedAvatarUrl === avatarUrl ? 'border-primary' : 'border-transparent'
                                            )}
                                        />
                                        {selectedAvatarUrl === avatarUrl && (
                                            <div className="absolute top-[-4px] right-1 bg-primary text-primary-foreground rounded-full p-1">
                                            <CheckCircle className="w-4 h-4" />
                                            </div>
                                        )}
                                        </div>
                                    ))}
                                </div>
                                <Button variant="outline" size="icon" className="absolute top-0 right-0 h-9 w-9" onClick={handleRandomizeAvatars} type="button">
                                    <RefreshCw className="w-4 h-4"/>
                                </Button>
                            </TabsContent>
                            <TabsContent value="generate" className='m-0 space-y-4'>
                                <div className='h-[120px] bg-secondary rounded-lg flex items-center justify-center overflow-hidden'>
                                    {isGenerating ? (
                                    <ParticleLoader />
                                    ) : selectedAvatarUrl && activeTab === 'generate' ? (
                                    <Avatar className="w-24 h-24">
                                        <AvatarImage src={selectedAvatarUrl} />
                                        <AvatarFallback>?</AvatarFallback>
                                    </Avatar>
                                    ) : (
                                        <Wand2 className='w-10 h-10 text-muted-foreground'/>
                                    )}
                                </div>
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
                           <TabsContent value="upload" className='m-0 flex flex-col items-center justify-center'>
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

            <div className="mt-8">
                 <Button className="w-full h-[50px] text-[17px] font-bold rounded-md" onClick={handleSaveChanges}>
                    Save Changes
                </Button>
            </div>
        </div>
    );
}

    