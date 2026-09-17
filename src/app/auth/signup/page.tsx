import { ComingSoon } from "@/components/ui/coming-soon";

export default function SignupPage() {
  return (
    <ComingSoon
      title="Signup Offline"
      message="Account creation is disabled for this static archive."
      showBackButton={true}
    />
  );
}

/*
// Latent dynamic implementation:
import { Suspense } from "react";
import SignupClient from "./SignupClient";

export function LatentSignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SignupClient />
    </Suspense>
  );
}
*/
