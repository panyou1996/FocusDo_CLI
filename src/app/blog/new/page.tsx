import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";

export default function BlogNewPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col w-full max-w-lg mx-auto">
      <header className="px-5 h-[56px] flex justify-between items-center flex-shrink-0">
        <Link href="/blog">
          <Button variant="link" className="text-blue-500 text-[17px] p-0">Cancel</Button>
        </Link>
        <h1 className="text-[17px] font-bold">New Blog</h1>
        <Button variant="link" className="text-blue-500 text-[17px] font-bold p-0">Save</Button>
      </header>

      <main className="flex-grow px-5 py-4 flex flex-col gap-6">
        <div className="w-full h-[180px] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground">
          <Upload className="w-8 h-8 mb-2" />
          <p>Upload Cover Image</p>
        </div>
        
        <Input 
          placeholder="Blog Title"
          className="border-none text-[30px] font-bold h-auto p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />

        <Textarea 
          placeholder="Start writing your story..."
          className="border-none text-[17px] leading-relaxed p-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex-grow resize-none"
        />
      </main>
    </div>
  );
}
