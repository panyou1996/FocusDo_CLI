import { BottomNavBar } from "@/components/layout/BottomNavBar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full max-w-lg mx-auto bg-background">
      <main className="pb-[84px]">
        {children}
      </main>
      <BottomNavBar />
    </div>
  );
}
