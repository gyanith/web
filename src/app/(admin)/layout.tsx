"use client";

import { montserrat } from "@/fonts/fonts";
// You usually only import globals.css in the TRUE Root Layout (src/app/layout.tsx).
// If it is already imported there, you can remove this line.
// import "../globals.css";


// Renamed from RootLayout to MainLayout to avoid confusion
export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 1. Replaced <html> and <body> with a <div>
    // 2. Added 'min-h-screen' and 'w-full' to ensure it fills the viewport like <body> did
    <div
      className={`${montserrat.className} bg-[#070a10] dark antialiased flex flex-col min-h-screen w-full`}
      
    >
      
        {children}
      
    </div>
  );
}
