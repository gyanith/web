import { ComingSoon } from "@/components/ui/coming-soon";

export default function AuthPage() {
  return (
    <ComingSoon
      title="Portal Offline"
      message="Authentication is disabled for this static archive."
      showBackButton={true}
    />
  );
}

/*
// Latent dynamic implementation:
import { redirect } from "next/navigation";

export function LatentAuthPage() {
  redirect("/auth/login");
}
*/
