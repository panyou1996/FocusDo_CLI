import { BottomNavBar } from "@/components/layout/BottomNavBar";
import { AppProvider } from "@/context/TaskContext";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProvider>
      <div className="min-h-screen w-full max-w-lg mx-auto bg-background">
        <main className="pb-[84px]">
          {children}
        </main>
        <BottomNavBar />
      </div>
    </AppProvider>
  );
}
