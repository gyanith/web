// hooks/useNavigate.ts
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useLoader } from "@/my_components/LoaderContext";
import { useCallback } from "react";

export const useNavigate = () => {
  const router = useRouter();
  const loader = useLoader();
  const pathname = usePathname();

  return useCallback(
    (path: string) => {
      // Skip if already on this page
      if (pathname === path) {
        console.log("Already on", path, "- skipping navigation");
        return;
      }

      // Extract page name for loader text
      const pageName = path.split("/").filter(Boolean).pop() || "page";
      loader.start(`Loading ${pageName}...`);

      // Navigate
      router.push(path);
    },
    [router, loader, pathname]
  );
};
