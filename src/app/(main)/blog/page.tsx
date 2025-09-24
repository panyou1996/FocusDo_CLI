
"use client";

import * as React from "react";
import Link from "next/link";
import { BookText, Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BlogCard } from "@/components/blog/BlogCard";
import { useAppContext } from "@/context/AppContext";
import { Skeleton } from "@/components/ui/skeleton";


export default function BlogPage() {
  const { blogPosts } = useAppContext();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);


  return (
    <div className="px-5">
      <header className="pt-10 pb-4 h-[100px] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <BookText className="w-7 h-7" strokeWidth={2} />
          <h1 className="text-[28px] font-bold text-foreground">Blog</h1>
        </div>
         <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Filter className="w-6 h-6" strokeWidth={1.5} />
          </Button>
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
        {!isClient ? (
            <>
              <Skeleton className="h-[320px] w-full rounded-2xl" />
              <Skeleton className="h-[320px] w-full rounded-2xl" />
            </>
        ) : blogPosts.length > 0 ? (
          blogPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))
        ) : (
          <p className="text-muted-foreground text-center py-10">No blog posts yet. Create one!</p>
        )}
      </div>
    </div>
  );
}
