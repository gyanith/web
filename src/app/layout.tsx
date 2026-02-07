import type { Metadata } from "next";
import { ledLight } from "@/fonts/fonts";
import "./globals.css";
import Noise from "@/my_components/Noise";

import { montserrat } from "@/fonts/fonts";

import { LoaderProvider } from "@/my_components/LoaderContext";
import { ToastProvider } from "@/my_components/Toast";
import Footer from "@/my_components/Footer";

export const metadata: Metadata = {
  title: "Gyanith 2026",
  description: "NIT Puducherry",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={ledLight.variable}>
      <body
        className={`${montserrat.className} bg-[#070a10]  antialiased flex flex-col items-center`}
      >
        <LoaderProvider>
          <ToastProvider>
            {/* Noise removed from RootLayout to prevent it showing in Admin */}
            {children}
            <Footer />
          </ToastProvider>
        </LoaderProvider>
      </body>
    </html>
  );
}
