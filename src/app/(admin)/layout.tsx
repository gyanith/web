import { creatoDisplay } from "@/fonts/fonts";
import { verifyAdminAccess } from "@/lib/appwrite/admin-access";
import { redirect } from "next/navigation";
import { ToastProvider } from "@/components/ui/toast-provider";

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
    // 1. Replaced <html> and <body> with a <div>
    // 2. Added 'min-h-screen' and 'w-full' to ensure it fills the viewport like <body> did
    <div
      className={`${creatoDisplay.className} bg-[#070a10] dark antialiased flex flex-col min-h-screen w-full`}
    >
      <ToastProvider>{children}</ToastProvider>
    </div>
  );
}
