"use client";

import { useRouter } from "next/navigation";
import { useLoader } from "@/components/LoaderContext";

export const useNavigate = () => {
  const router = useRouter();
  const loader = useLoader();

  return (path: string) => {
    // 1️⃣ Lock screen immediately
    document.documentElement.classList.add("loader-active");

    // 2️⃣ Show loader immediately
    loader.start(`Loading ${path}`);

    // 3️⃣ Navigate
    router.push(path);
  };
};
