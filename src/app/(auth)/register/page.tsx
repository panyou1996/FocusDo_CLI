
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/icons/Logo";

export default function RegisterPage() {
  const router = useRouter();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd handle registration logic here.
    // For this demo, we'll simulate success and move to profile setup.
    router.push("/set-profile");
  };

  return (
    <Card className="w-full max-w-md custom-card rounded-2xl">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center mb-4">
          <Logo className="h-10 w-10" />
        </div>
        <CardTitle className="text-2xl font-bold">Create your Account</CardTitle>
        <CardDescription>Start managing your tasks with AI power.</CardDescription>
      </CardHeader>
      <form onSubmit={handleRegister}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="name@example.com" required className="h-auto p-3 rounded-2xl"/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required className="h-auto p-3 rounded-2xl"/>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full h-[50px] text-lg font-bold rounded-2xl custom-card button">Create Account</Button>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log In
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
