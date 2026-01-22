"use client";

import { ReactNode, useState } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  // TODO: check coordinator role via Appwrite logic if needed globally here or in middleware
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="grid min-h-screen min-w-screen md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block">
        <AdminSidebar />
      </div>

      {/* Mobile/Main Content */}
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden sticky top-0 z-30 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden border-zinc-700 bg-transparent hover:bg-zinc-800 hover:text-white"
                suppressHydrationWarning
              >
                <Menu className="h-5 w-5 text-white" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="flex flex-col p-0 w-[240px] dark bg-zinc-950 text-white border-zinc-800"
            >
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
                <SheetDescription>
                  Main navigation menu for the admin portal.
                </SheetDescription>
              </SheetHeader>
              <AdminSidebar onNavigate={() => setIsMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <h1 className="font-semibold text-lg text-white">Admin Portal</h1>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
