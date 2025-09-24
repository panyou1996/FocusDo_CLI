
"use client";

import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Share2 } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import * as React from "react";
import type { BlogPost } from "@/lib/types";

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params ? (params.slug as string) : undefined;
  const { blogPosts } = useAppContext();
  const [post, setPost] = React.useState<BlogPost | undefined | null>(undefined); // undefined: loading, null: not found

  React.useEffect(() => {
    // Only proceed if blogPosts have been loaded from localStorage and slug is available from URL
    if (blogPosts.length > 0 && slug) {
        const foundPost = blogPosts.find((p) => p.slug === slug);
        setPost(foundPost || null); // Set to the found post, or null if not found
    }
  }, [blogPosts, slug]);

  // Handle loading state
  if (post === undefined) {
    return (
        <div className="flex justify-center items-center h-screen">
            <p>Loading...</p>
        </div>
    );
  }

  // Handle not found state
  if (post === null) {
    notFound();
  }

  // Author avatar can now be a full URL, no need to find in placeholders
  const authorAvatarUrl = post.author.avatarUrl;

  const coverImageUrl = post.coverImage; // This will be a Base64 string or null

  return (
    <div>
      <header className="px-5 pt-10 pb-4 flex justify-between items-center">
        <Link href="/blog">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </Link>
        <Button variant="ghost" size="icon">
          <Share2 className="w-6 h-6" />
        </Button>
      </header>
      <article className="px-5">
        <h1 className="text-[30px] font-bold leading-tight mt-6 mb-4">{post.title}</h1>
        <div className="flex items-center gap-3 mb-6">
          <Avatar className="w-10 h-10">
             <AvatarImage src={authorAvatarUrl} alt={post.author.name} />
            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-[15px] font-medium">{post.author.name}</p>
            <p className="text-[13px] text-muted-foreground">{post.date}</p>
          </div>
        </div>
        
        {coverImageUrl && (
            <div className="relative w-full h-[250px] rounded-2xl overflow-hidden my-6">
              <Image
                src={coverImageUrl}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
        )}

        <div 
            className="prose prose-lg max-w-none text-foreground/80 prose-p:text-[17px] prose-p:leading-relaxed prose-p:mb-4 prose-img:rounded-2xl prose-img:my-6"
            dangerouslySetInnerHTML={{ __html: post.content }}
         />

      </article>
    </div>
  );
}
