
"use client";

import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Share2 } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { blogPosts } = useAppContext();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const authorAvatar = PlaceHolderImages.find(img => img.id === post.author.avatarUrl);

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
             {authorAvatar && <AvatarImage src={authorAvatar.imageUrl} alt={post.author.name} />}
            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-[15px] font-medium">{post.author.name}</p>
            <p className="text-[13px] text-muted-foreground">{post.date}</p>
          </div>
        </div>
        
        <div 
            className="prose prose-lg max-w-none text-foreground/80 prose-p:text-[17px] prose-p:leading-relaxed prose-p:mb-4 prose-img:rounded-2xl prose-img:my-6"
            dangerouslySetInnerHTML={{ __html: post.content }}
         />

      </article>
    </div>
  );
}
