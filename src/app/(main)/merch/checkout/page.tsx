import { ComingSoon } from "@/components/ui/coming-soon";

export default function MerchCheckoutPage() {
  return (
    <ComingSoon
      title="Store Offline"
      message="Merchandise checkout is currently closed."
      showBackButton={true}
    />
  );
}

/*
// Latent dynamic implementation:
import { Suspense } from "react";
// export const dynamic = "force-dynamic";
import CheckoutPage from "./CheckoutPage";
import { createSessionClient } from "@/backup/lib/appwrite/appwrite.server";
import { redirect } from "next/navigation";

const page = async () => {
  const { getAccount } = await createSessionClient();
  const account = getAccount();
  const user = await account.get();

  if (!user) {
    redirect("/auth?redirect=/merch/checkout");
  }

  return (
    <Suspense>
      <CheckoutPage user={user} />
    </Suspense>
  );
};
*/
