

"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookText, Plus, Search, Filter, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { JournalCard } from "@/components/journal/JournalCard";
import { useAppContext } from "@/context/AppContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import { getIcon } from "@/lib/icon-utils";

type SortByType = 'newest' | 'oldest' | 'readingTime';

interface FilterPopoverContentProps {
  sortBy: SortByType;
  setSortBy: (value: SortByType) => void;
}

const FilterPopoverContent: React.FC<FilterPopoverContentProps> = ({ sortBy, setSortBy }) => {
    return (
        <PopoverContent align="end" className="w-auto p-4">
             <div className="space-y-4">
                 <h3 className="text-sm font-medium text-muted-foreground">SORT BY</h3>
                 <Tabs value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="newest">Newest</TabsTrigger>
                        <TabsTrigger value="oldest">Oldest</TabsTrigger>
                        <TabsTrigger value="readingTime">Reading Time</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
        </PopoverContent>
    );
};

const JournalCardSkeleton = () => (
  <div className="w-full rounded-2xl custom-card overflow-hidden">
    <Skeleton className="h-[180px] w-full" />
    <div className="p-4">
      <Skeleton className="h-6 w-3/4 rounded-md mb-3" />
      <Skeleton className="h-4 w-full rounded-md mb-1" />
      <Skeleton className="h-4 w-5/6 rounded-md mb-3" />
      <Skeleton className="h-4 w-1/2 rounded-md" />
    </div>
  </div>
);


export default function JournalPage() {
  const { journalPosts, lists } = useAppContext();
  const [isClient, setIsClient] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const [selectedList, setSelectedList] = useLocalStorage('journal-selected-list', 'all');
  const [sortBy, setSortBy] = useLocalStorage<SortByType>('journal-sort-by', 'newest');

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredJournalPosts = React.useMemo(() => {
    if (!isClient) return [];
    
    let filtered = journalPosts;

    if (searchQuery) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedList !== 'all') {
      filtered = filtered.filter(post => post.listId === selectedList);
    }

    let sorted = [...filtered];
    if (sortBy === 'oldest') {
      sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === 'readingTime') {
      sorted.sort((a, b) => a.readingTime - b.readingTime);
    } else { // 'newest' is default
      sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return sorted;

  }, [journalPosts, searchQuery, selectedList, sortBy, isClient]);


  return (
    <div className="px-5">
      <header className="pt-10 pb-4 h-[80px] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <BookText className="w-7 h-7" strokeWidth={2} />
          <h1 className="text-3xl font-bold text-foreground">Journal</h1>
        </div>
         <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Filter className="w-6 h-6" strokeWidth={1.5} />
                </Button>
            </PopoverTrigger>
            <FilterPopoverContent
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          </Popover>
        </div>
      </header>
      
      <div className="flex gap-2 mb-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          <Input 
            placeholder="Search for a topic..." 
            className="h-11 rounded-[var(--radius)] pl-10 bg-secondary border-none text-base w-full" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 py-2 pl-5">
              <button
                onClick={() => setSelectedList('all')}
                className={cn(
                  'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors h-9',
                  selectedList === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground bg-secondary'
                )}
              >
                <List className="w-4 h-4" />
                <span>All</span>
              </button>
              {lists.map(list => {
                const ListIcon = getIcon(list.icon as string);
                const isSelected = selectedList === list.id;
                return (
                  <button
                    key={list.id}
                    onClick={() => setSelectedList(list.id)}
                    className={cn(
                      'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors h-9',
                      isSelected ? 'text-white' : 'text-foreground bg-secondary'
                    )}
                    style={{
                      backgroundColor: isSelected ? list.color : undefined,
                    }}
                  >
                    <ListIcon className="w-4 h-4" />
                    <span>{list.name}</span>
                  </button>
                );
              })}
            </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
         <Link href="/add-list" className="flex-shrink-0 pr-2">
              <Button variant="ghost" size="icon" className="rounded-full bg-secondary h-9 w-9">
                  <Plus className="w-5 h-5"/>
              </Button>
         </Link>
      </div>

      <div className="space-y-4 mt-4">
        {!isClient ? (
            <div className="space-y-4">
              <JournalCardSkeleton />
              <JournalCardSkeleton />
            </div>
        ) : filteredJournalPosts.length > 0 ? (
          filteredJournalPosts.map((post) => {
            const list = lists.find(l => l.id === post.listId);
            return <JournalCard key={post.id} post={post} list={list} />;
          })
        ) : (
          <p className="text-muted-foreground text-center py-10">No journal posts found.</p>
        )}
      </div>
    </div>
  );
}
