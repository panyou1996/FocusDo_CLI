
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { CheckCircle, RefreshCw, Upload, Wand2, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateAvatar } from '@/ai/flows/generate-avatar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const avatarStyles = [
  'adventurer', 'big-ears', 'bottts', 'miniavs', 'open-peeps', 'pixel-art'
];

function generateRandomAvatars(count = 3) {
    const avatars = [];
    for (let i = 0; i < count; i++) {
        const style = avatarStyles[Math.floor(Math.random() * avatarStyles.length)];
        const seed = Math.random().toString(36).substring(7);
        avatars.push(`https://api.dicebear.com/8.x/${style}/svg?seed=${seed}`);
    }
    return avatars;
}


export default function SetProfilePage() {
  const router = useRouter();
  const { setCurrentUser } = useAppContext();
  const [name, setName] = React.useState('');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = React.useState('');
  
  const [selectableAvatars, setSelectableAvatars] = React.useState<string[]>([]);
  const [aiPrompt, setAiPrompt] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setSelectableAvatars(generateRandomAvatars());
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !selectedAvatarUrl) {
      alert('Please enter your name and select an avatar.');
      return;
    }
    setCurrentUser({ name, avatarUrl: selectedAvatarUrl });
    router.push('/today');
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

  return (
    <Card className="w-full max-w-md shadow-soft border-none rounded-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-[22px] font-bold">Set Up Your Profile</CardTitle>
        <CardDescription className="text-[15px]">Choose your name and avatar.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSaveProfile}>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <Avatar className="w-24 h-24">
                <AvatarImage src={selectedAvatarUrl} alt={name} />
                <AvatarFallback>{name?.charAt(0) || '?'}</AvatarFallback>
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
            <Tabs defaultValue="select">
              <TabsList className='grid w-full grid-cols-3'>
                <TabsTrigger value="select">Select</TabsTrigger>
                <TabsTrigger value="generate"><Wand2 className='w-4 h-4 mr-2'/>Generate</TabsTrigger>
                <TabsTrigger value="upload"><Upload className='w-4 h-4 mr-2'/>Upload</TabsTrigger>
              </TabsList>
              <TabsContent value="select" className="relative pt-4">
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
              <TabsContent value="generate" className="pt-4">
                 <div className='flex gap-2 items-center'>
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
              <TabsContent value="upload" className="pt-4">
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
            </Tabs>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 mt-4">
          <Button type="submit" className="w-full h-[50px] text-[17px] font-bold rounded-md">
            Save and Continue
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
