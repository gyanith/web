import type { Metadata } from "next";
import { ledLight } from "@/fonts/fonts";
import "./globals.css";
import Noise from "@/components/Noise";

import { montserrat } from "@/fonts/fonts";

import { LoaderProvider } from "@/components/LoaderContext";

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
          <Noise
            patternSize={250}
            patternScaleX={1}
            patternScaleY={1}
            patternRefreshInterval={2}
            patternAlpha={15}
          />
          {children}
        </LoaderProvider>
      </body>
    </html>
  );
}
