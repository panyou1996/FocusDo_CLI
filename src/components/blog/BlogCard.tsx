
import Image from "next/image";
import Link from "next/link";
import type { BlogPost, TaskList } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { BookText, type Icon as LucideIcon } from "lucide-react";
import * as Icons from 'lucide-react';
import { cn } from "@/lib/utils";
import { getIcon } from "@/lib/icon-utils";

interface BlogCardProps {
  post: BlogPost;
  list?: TaskList;
}

export function BlogCard({ post, list }: BlogCardProps) {
  // Check if coverImage is a placeholder ID or a Base64 string
  const isBase64 = post.coverImage?.startsWith('data:');
  const placeholderImage = !isBase64 ? PlaceHolderImages.find(img => img.id === post.coverImage) : null;
  const imageUrl = isBase64 ? post.coverImage : placeholderImage?.imageUrl;

  const ListIcon = list ? getIcon(list.icon as string) : null;

  return (
    <Link href={`/blog/${post.slug}`} className="block">
      <Card className="rounded-2xl shadow-soft border-none overflow-hidden transition-all duration-300 ease-in-out">
        {imageUrl ? (
          <CardHeader className="p-0">
            <div className="relative w-full h-[180px]">
              <Image
                src={imageUrl}
                alt={post.title}
                fill
                className="object-cover"
                data-ai-hint={placeholderImage?.imageHint}
              />
            </div>
          </CardHeader>
        ) : (
          <CardHeader className="p-0">
            <div className="relative w-full h-[180px] bg-secondary flex items-center justify-center">
              <BookText className="w-10 h-10 text-muted-foreground" />
            </div>
          </CardHeader>
        )}
        <CardContent className="p-4">
          <h3 className="text-lg font-bold text-foreground mb-2 leading-tight">{post.title}</h3>
          <p className="text-base text-muted-foreground line-clamp-3 mb-3">{post.excerpt}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
             {list && ListIcon && (
                <ListIcon className="w-4 h-4" style={{color: list.color}} />
             )}
             {list && ListIcon && <span>&bull;</span>}
            <span>{post.date}</span>
            <span>&bull;</span>
            <span>{post.readingTime} min read</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
