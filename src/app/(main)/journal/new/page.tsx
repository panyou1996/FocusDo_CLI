
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, X, List } from 'lucide-react';
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { getIcon } from '@/lib/icon-utils';
import { AnimatePresence, motion } from 'framer-motion';

export default function JournalNewPage() {
  const router = useRouter();
  const { addJournalPost, currentUser, lists } = useAppContext();
  const [isVisible, setIsVisible] = React.useState(true);
  
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [coverImage, setCoverImage] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [selectedListId, setSelectedListId] = React.useState(lists[0]?.id || 'personal');

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => router.back(), 300); // Match animation duration
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
        setCoverImage(reader.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!title || !content) {
      alert('Title and content are required.');
      return;
    }
    
    if (!currentUser) {
      alert('You must be logged in to create a post.');
      router.push('/login');
      return;
    }
    
    const formattedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });

    const newPost = {
      id: String(Date.now()),
      slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
      title,
      content: `<p>${content.replace(/\n/g, '</p><p>')}</p>`,
      excerpt: content.slice(0, 150) + '...',
      coverImage: coverImage, 
      author: currentUser,
      date: formattedDate,
      readingTime: Math.ceil(content.split(' ').length / 200),
      listId: selectedListId,
    };

    addJournalPost(newPost);
    handleClose();
  };

  const selectedList = lists.find(l => l.id === selectedListId);
  const SelectedListIcon = selectedList ? getIcon(selectedList.icon as string) : List;
  
  const modalVariants = {
      hidden: { y: "100%", transition: { type: 'spring', stiffness: 400, damping: 30 } },
      visible: { y: "0%", transition: { type: 'spring', stiffness: 400, damping: 30 } },
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
                <h1 className="text-[17px] font-bold">New Journal Post</h1>
                <Button variant="ghost" size="icon" aria-label="Close" onClick={handleClose}>
                  <X className="w-6 h-6" />
                </Button>
              </header>

              <main className="flex-grow px-5 py-4 flex flex-col gap-4 overflow-y-auto">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <div 
                  className="w-full h-[180px] flex-shrink-0 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground cursor-pointer relative overflow-hidden bg-secondary/50"
                  onClick={handleImageUploadClick}
                >
                  {coverImage ? (
                    <Image src={coverImage} alt="Cover preview" fill className="object-cover" />
                  ) : isUploading ? (
                    <>
                      <Loader2 className="w-8 h-8 mb-2 animate-spin" />
                      <p>Processing...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-2" />
                      <p>Upload Cover Image</p>
                    </>
                  )}
                </div>
                
                <Card className="rounded-2xl custom-card p-1 flex items-center gap-2">
                  <Popover>
                      <PopoverTrigger asChild>
                          <Button variant="ghost" className="flex items-center gap-2 h-auto py-2 px-3 text-primary">
                              {selectedList && (
                                  <SelectedListIcon className="w-5 h-5" style={{ color: selectedList.color }}/>
                              )}
                              <span className="text-sm font-medium">{selectedList?.name || 'Select List'}</span>
                          </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-1" align="start">
                          <div className="flex flex-col gap-1">
                              {lists.map(listOption => {
                                  const ListOptionIcon = getIcon(listOption.icon as string);
                                  return (
                                      <Button
                                          key={listOption.id}
                                          variant="ghost"
                                          className={cn(
                                              "w-full justify-start gap-2",
                                              selectedListId === listOption.id && 'bg-accent'
                                          )}
                                          onClick={() => setSelectedListId(listOption.id)}
                                      >
                                          <ListOptionIcon className="w-4 h-4" style={{ color: listOption.color }}/>
                                          {listOption.name}
                                      </Button>
                                  );
                              })}
                          </div>
                      </PopoverContent>
                  </Popover>

                  <Input 
                    placeholder="Journal Title"
                    className="border-none text-[18px] font-medium h-[60px] p-0 flex-grow focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </Card>

                <Card className="rounded-2xl custom-card p-1 flex-grow flex flex-col">
                  <Textarea 
                    placeholder="Start writing your story..."
                    className="border-none text-[17px] min-h-[120px] p-4 focus-visible:ring-0 focus-visible:ring-offset-0 flex-grow bg-transparent"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </Card>

              </main>
              
              <footer className="px-5 py-4 flex-shrink-0 border-t">
                <Button className="w-full h-[50px] text-[17px] font-bold rounded-2xl custom-card" onClick={handleSave} disabled={isUploading}>Save Post</Button>
              </footer>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
