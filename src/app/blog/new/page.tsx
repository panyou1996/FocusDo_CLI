
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload } from 'lucide-react';
import Image from 'next/image';
import { blogPosts } from '@/lib/data';

export default function BlogNewPage() {
  const router = useRouter();
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [coverImage, setCoverImage] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!title || !content) {
      alert('Title and content are required.');
      return;
    }

    const newPost = {
      id: String(Date.now()),
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      title,
      content: `<p>${content.replace(/\n/g, '</p><p>')}</p>`,
      excerpt: content.slice(0, 150) + '...',
      coverImage: coverImage || 'placeholder_blog_1', // Use a placeholder if no image is uploaded
      author: {
        name: 'Current User', // Replace with actual user data
        avatarUrl: 'placeholder_avatar_1',
      },
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      readingTime: Math.ceil(content.split(' ').length / 200),
    };

    // In a real app, this would be an API call. Here, we'll just push to the in-memory array.
    blogPosts.unshift(newPost);
    router.push('/blog');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col w-full max-w-lg mx-auto">
      <header className="px-5 h-[56px] flex justify-between items-center flex-shrink-0">
        <Link href="/blog">
          <Button variant="link" className="text-blue-500 text-[17px] p-0">Cancel</Button>
        </Link>
        <h1 className="text-[17px] font-bold">New Blog</h1>
        <Button variant="link" className="text-blue-500 text-[17px] font-bold p-0" onClick={handleSave}>Save</Button>
      </header>

      <main className="flex-grow px-5 py-4 flex flex-col gap-6">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <div 
          className="w-full h-[180px] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground cursor-pointer relative overflow-hidden"
          onClick={handleImageUploadClick}
        >
          {coverImage ? (
            <Image src={coverImage} alt="Cover preview" fill className="object-cover" />
          ) : (
            <>
              <Upload className="w-8 h-8 mb-2" />
              <p>Upload Cover Image</p>
            </>
          )}
        </div>
        
        <Input 
          placeholder="Blog Title"
          className="border-none text-[30px] font-bold h-auto p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Textarea 
          placeholder="Start writing your story..."
          className="border-none text-[17px] leading-relaxed p-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex-grow resize-none"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </main>
    </div>
  );
}
