import Link from "next/link";
import { BookText, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BlogCard } from "@/components/blog/BlogCard";
import { blogPosts } from "@/lib/data";

export default function BlogPage() {
  return (
    <div className="px-5">
      <header className="pt-10 pb-4 h-[100px] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <BookText className="w-7 h-7" strokeWidth={2} />
          <h1 className="text-[28px] font-bold text-foreground">Blog</h1>
        </div>
      </header>
      
      <div className="flex gap-2 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          <Input placeholder="Search for a topic..." className="h-11 rounded-md pl-10 bg-secondary border-none text-base" />
        </div>
        <Link href="/blog/new">
          <Button size="icon" className="h-11 w-11 rounded-md">
            <Plus className="w-6 h-6" />
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {blogPosts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
