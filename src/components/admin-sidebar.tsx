"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Home,
  CheckCircle,
  FileText,
  LogOut,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth";

const sidebarLinks = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Events",
    href: "/admin/event",
    icon: Calendar,
  },
  {
    title: "Registrations",
    href: "/admin/registration",
    icon: Users,
  },
  {
    title: "Accomodation",
    href: "/admin/accomodation",
    icon: Home,
  },
  {
    title: "Verify Payments",
    href: "/admin/verify",
    icon: CheckCircle,
  },
  {
    title: "Logs",
    href: "/admin/logs",
    icon: FileText,
  },
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex h-screen flex-col gap-2 sticky top-0">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/admin" className="flex items-center gap-2 font-semibold" onClick={onNavigate}>
          <span className="text-xl text-white font-bold tracking-tight">Gyanith Admin</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                  isActive
                    ? "bg-muted text-primary"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.title}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <Button variant="outline" className="w-full justify-start gap-2 text-white"
        onClick={async() => {
          await signOut();
          router.push("/");
        }}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
