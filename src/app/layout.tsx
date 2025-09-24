import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { AppProvider } from "@/context/AppContext";
import { ThemeProvider } from "@/context/ThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "TaskFlow",
  description: "Organize your life, unlock your flow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-body antialiased", inter.variable)}>
        <AppProvider>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </AppProvider>
      </body>
    </html>
  );
}
