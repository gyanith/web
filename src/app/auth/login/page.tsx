import { ComingSoon } from "@/components/ui/coming-soon";

export default function LoginPage() {
  return (
    <ComingSoon
      title="Login Offline"
      message="Authentication is disabled for this static archive."
      showBackButton={true}
    />
  );
}

/*
// Latent dynamic implementation:
import { Suspense } from "react";
import LoginClient from "./LoginClient";

export function LatentLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <LoginClient />
    </Suspense>
  );
}
*/
