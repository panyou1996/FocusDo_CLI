import { BottomNavBar } from "@/components/layout/BottomNavBar";
import { TaskProvider } from "@/context/TaskContext";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TaskProvider>
      <div className="min-h-screen w-full max-w-lg mx-auto bg-background">
        <main className="pb-[84px]">
          {children}
        </main>
        <BottomNavBar />
      </div>
    </TaskProvider>
  );
}
