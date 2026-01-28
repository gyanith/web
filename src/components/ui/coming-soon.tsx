"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface ComingSoonProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
}

export function ComingSoon({
  title = "Coming Soon",
  message = "This feature will be available shortly. Stay tuned!",
  showBackButton = true,
}: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-white">
          {title}
        </h1>
        <p className="max-w-[600px] text-zinc-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto">
          {message}
        </p>
      </div>
      {showBackButton && (
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      )}
    </div>
  );
}
