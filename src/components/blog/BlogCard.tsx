
import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { BookText } from "lucide-react";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const placeholderImage = PlaceHolderImages.find(img => img.id === post.coverImage);
  const imageUrl = post.coverImage && !placeholderImage ? post.coverImage : placeholderImage?.imageUrl;

  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="rounded-2xl shadow-soft border-none overflow-hidden">
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
          <h3 className="text-[18px] font-bold text-foreground mb-2 leading-tight">{post.title}</h3>
          <p className="text-[15px] text-muted-foreground line-clamp-3 mb-3">{post.excerpt}</p>
          <p className="text-[13px] text-muted-foreground">{post.date} &bull; {post.readingTime} min read</p>
        </CardContent>
      </Card>
    </Link>
  );
}
