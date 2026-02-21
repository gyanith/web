import { creatoDisplay } from "@/fonts/fonts";
import { verifyAdminAccess } from "@/lib/appwrite/admin-access";
import { redirect } from "next/navigation";
import { ToastProvider } from "@/components/ui/toast-provider";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gyanith Admin",
  description: "Admin Panel for Gyanith 2026",
};

// Renamed from RootLayout to MainLayout to avoid confusion
export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hasAccess = await verifyAdminAccess();

  if (!hasAccess) {
    redirect("/");
  }

  return (
    <div
      className={`${creatoDisplay.className} bg-[#070a10] dark antialiased flex flex-col min-h-screen w-full`}
    >
      <ToastProvider>{children}</ToastProvider>
    </div>
  );
}
