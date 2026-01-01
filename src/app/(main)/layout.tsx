"use client";

// You usually only import globals.css in the TRUE Root Layout (src/app/layout.tsx).
// If it is already imported there, you can remove this line.
// import "../globals.css";

import Noise from "@/components/Noise";
import Navbar from "@/components/navbar/Navbar";
import { LoaderProvider } from "@/components/LoaderContext";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

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
      className={`${montserrat.variable} bg-[#070a10] antialiased flex flex-col items-center min-h-screen w-full`}
      style={{
        fontFamily: "Montserrat",
      }}
    >
      <LoaderProvider>
        <Noise
          patternSize={250}
          patternScaleX={1}
          patternScaleY={1}
          patternRefreshInterval={2}
          patternAlpha={15}
        />
        <Navbar />
        {children}
      </LoaderProvider>
    </div>
  );
}
