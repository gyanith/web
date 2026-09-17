"use client";

import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/backup/lib/utils";

export function RefreshButton() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    // Reset spinning state after a short delay or when refresh completes (approximate)
    // Since we can't strictly know when server refresh finishes without useTransition,
    // a timeout gives good enough visual feedback.
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground hover:text-primary"
      onClick={handleRefresh}
      disabled={isRefreshing}
      title="Refresh list"
    >
      <RefreshCcw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
      <span className="sr-only">Refresh events</span>
    </Button>
  );
}
