
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAppContext } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

const SettingsGroupLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="px-1 text-[13px] font-regular text-muted-foreground uppercase mt-6 mb-2">{children}</p>
);

export default function ProfilePage() {
    const router = useRouter();
    const { currentUser, setCurrentUser } = useAppContext();

    const [name, setName] = React.useState(currentUser?.name || '');
    const [selectedAvatarUrl, setSelectedAvatarUrl] = React.useState(currentUser?.avatarUrl || '');
    const [isClient, setIsClient] = React.useState(false);
  
    React.useEffect(() => {
        setIsClient(true);
    }, []); 

    React.useEffect(() => {
      if (currentUser) {
        setName(currentUser.name);
        setSelectedAvatarUrl(currentUser.avatarUrl);
      }
    }, [currentUser]);


    const selectableAvatars = PlaceHolderImages.filter(img => img.id.startsWith('selectable_avatar_'));

    const handleSaveChanges = () => {
        if (!name || !selectedAvatarUrl) {
            alert('Please enter your name and select an avatar.');
            return;
        }
        setCurrentUser({ name, avatarUrl: selectedAvatarUrl });
        router.back();
    };

    if (!isClient) {
        return (
            <div className="px-5">
                <header className="pt-10 pb-4 h-[100px] flex justify-between items-center">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-8 w-32" />
                    <div className="w-10"></div>
                </header>
                <div className="flex flex-col items-center mb-8">
                    <Skeleton className="w-24 h-24 rounded-full mb-4" />
                    <Skeleton className="h-8 w-40" />
                </div>
                <SettingsGroupLabel>Edit Profile</SettingsGroupLabel>
                <Card className="rounded-xl overflow-hidden shadow-soft border-none p-4">
                  <CardContent className="p-0 space-y-6">
                      <div className="space-y-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <div className="grid grid-cols-6 gap-4">
                              {Array.from({ length: 6 }).map((_, i) => (
                                  <Skeleton key={i} className="h-16 w-16 rounded-full" />
                              ))}
                          </div>
                      </div>
                  </CardContent>
                </Card>
                 <div className="mt-8">
                     <Skeleton className="h-[50px] w-full rounded-md" />
                </div>
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
                <div className="w-10"></div>
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
                        <div className="grid grid-cols-6 gap-4">
                        {selectableAvatars.map((avatar) => (
                            <div
                            key={avatar.id}
                            className="relative cursor-pointer"
                            onClick={() => setSelectedAvatarUrl(avatar.imageUrl)}
                            >
                            <img
                                src={avatar.imageUrl}
                                alt={avatar.description}
                                width={100}
                                height={100}
                                className={cn(
                                "rounded-full aspect-square object-cover border-4 transition-all",
                                selectedAvatarUrl === avatar.imageUrl ? 'border-primary' : 'border-transparent'
                                )}
                            />
                            {selectedAvatarUrl === avatar.imageUrl && (
                                <div className="absolute top-0 right-0 bg-primary text-primary-foreground rounded-full p-1">
                                <CheckCircle className="w-4 h-4" />
                                </div>
                            )}
                            </div>
                        ))}
                        </div>
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
