
"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Share2, Trash2 } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import * as React from "react";
import type { JournalPost } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Skeleton } from "@/components/ui/skeleton";

export default function JournalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params ? (params.slug as string) : undefined;
  const { journalPosts, deleteJournalPost, currentUser } = useAppContext();
  const [post, setPost] = React.useState<JournalPost | undefined | null>(undefined); // undefined: loading, null: not found
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    // Only proceed if client-side, journalPosts are available and slug is available from URL
    if (isClient && slug) {
        const foundPost = journalPosts.find((p) => p.slug === slug);
        setPost(foundPost || null); // Set to the found post, or null if not found
    }
  }, [journalPosts, slug, isClient]);

  const handleDelete = () => {
    if (post) {
      deleteJournalPost(post.id);
      router.push("/journal");
    }
  };

  // Handle loading state
  if (!isClient || post === undefined) {
    return (
        <div className="px-5">
            <header className="px-5 pt-10 pb-4 flex justify-between items-center -mx-5">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                </div>
            </header>
            <div className="mt-6 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              <Skeleton className="h-[250px] w-full rounded-2xl" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-5/6" />
            </div>
        </div>
    );
  }

  // Handle not found state
  if (post === null) {
    notFound();
  }
  
  const postAuthor = post.author || currentUser;
  const authorAvatarUrl = postAuthor.avatarUrl;

  const isBase64 = post.coverImage?.startsWith('data:');
  const placeholderImage = !isBase64 ? PlaceHolderImages.find(img => img.id === post.coverImage) : null;
  const coverImageUrl = isBase64 ? post.coverImage : placeholderImage?.imageUrl;

  return (
    <div>
      <header className="px-5 pt-10 pb-4 flex justify-between items-center">
        <Link href="/journal">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
           <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="w-6 h-6 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this journal post.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          <Button variant="ghost" size="icon">
            <Share2 className="w-6 h-6" />
          </Button>
        </div>
      </header>
      <article className="px-5">
        <h1 className="text-2xl font-bold leading-tight mt-6 mb-4">{post.title}</h1>
        <div className="flex items-center gap-3 mb-6">
          <Avatar className="w-10 h-10">
             <AvatarImage src={authorAvatarUrl} alt={postAuthor.name} />
            <AvatarFallback>{postAuthor.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{postAuthor.name}</p>
            <p className="text-sm text-muted-foreground">{post.date}</p>
          </div>
        </div>
        
        {coverImageUrl && (
            <div className="relative w-full h-[250px] rounded-2xl overflow-hidden my-6">
              <Image
                src={coverImageUrl}
                alt={post.title}
                fill
                className="object-cover"
                data-ai-hint={placeholderImage?.imageHint}
              />
            </div>
        )}

        <div 
            className="prose max-w-none text-foreground/80 prose-p:text-base prose-p:leading-relaxed prose-p:mb-4 prose-img:rounded-2xl prose-img:my-6"
            dangerouslySetInnerHTML={{ __html: post.content }}
         />

      </article>
    </div>
  );
}
