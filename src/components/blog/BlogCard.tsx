import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const coverImage = PlaceHolderImages.find(img => img.id === post.coverImage);

  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="rounded-2xl shadow-soft border-none overflow-hidden">
        {coverImage && (
          <CardHeader className="p-0">
            <div className="relative w-full h-[180px]">
              <Image
                src={coverImage.imageUrl}
                alt={post.title}
                fill
                className="object-cover"
                data-ai-hint={coverImage.imageHint}
              />
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
