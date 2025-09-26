
import { BottomNavBar } from "@/components/layout/BottomNavBar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div className="min-h-screen w-full max-w-[512px] mx-auto bg-background flex flex-col pt-[env(safe-area-inset-top)]">
        <main className="flex-grow flex flex-col pb-[calc(86px+env(safe-area-inset-bottom))]">
          {children}
        </main>
        <BottomNavBar />
      </div>
  );
}
