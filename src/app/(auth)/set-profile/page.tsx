
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAppContext } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';

export default function SetProfilePage() {
  const router = useRouter();
  const { setCurrentUser } = useAppContext();
  const [name, setName] = React.useState('');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = React.useState('');

  const selectableAvatars = PlaceHolderImages.filter(img => img.id.startsWith('selectable_avatar_'));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !selectedAvatarUrl) {
      alert('Please enter your name and select an avatar.');
      return;
    }
    setCurrentUser({ name, avatarUrl: selectedAvatarUrl });
    router.push('/today');
  };

  return (
    <Card className="w-full max-w-md shadow-soft border-none rounded-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-[22px] font-bold">Set Up Your Profile</CardTitle>
        <CardDescription className="text-[15px]">Choose your name and avatar.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSaveProfile}>
        <CardContent className="space-y-6">
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
            <div className="grid grid-cols-3 gap-4">
              {selectableAvatars.map((avatar) => (
                <div
                  key={avatar.id}
                  className="relative cursor-pointer"
                  onClick={() => setSelectedAvatarUrl(avatar.imageUrl)}
                >
                  <Image
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
        <CardFooter className="flex flex-col gap-4 mt-4">
          <Button type="submit" className="w-full h-[50px] text-[17px] font-bold rounded-md">
            Save and Continue
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
