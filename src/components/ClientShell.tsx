"use client";

import { LoaderProvider, useLoader } from "@/components/LoaderContext";

function PageGate({ children }: { children: React.ReactNode }) {
  const { ready } = useLoader();

  return (
    <div
      style={{
        opacity: ready ? 1 : 0,
        pointerEvents: ready ? "auto" : "none",
        transition: "opacity 0.25s ease-out",
      }}
    >
      {children}
    </div>
  );
}

export default function ClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LoaderProvider>
      <PageGate>{children}</PageGate>
    </LoaderProvider>
  );
}
