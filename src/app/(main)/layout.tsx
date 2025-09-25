
import { BottomNavBar } from "@/components/layout/BottomNavBar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div className="min-h-screen w-full max-w-[512px] mx-auto bg-background flex flex-col">
        <main className="flex-grow pb-4">
          {children}
        </main>
        <BottomNavBar />
      </div>
  );
}
