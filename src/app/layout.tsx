
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { AppProvider } from "@/context/AppContext";
import { ThemeProvider } from "@/context/ThemeProvider";
import { FontProvider } from "@/context/FontProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "TaskFlow",
  description: "Organize your life, unlock your flow.",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("antialiased", inter.variable)}>
        <AppProvider>
          <ThemeProvider>
            <FontProvider>
              {children}
              <Toaster />
            </FontProvider>
          </ThemeProvider>
        </AppProvider>
      </body>
    </html>
  );
}
