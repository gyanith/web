import { Suspense } from "react";
import { createSessionClient } from "@/lib/appwrite/appwrite.server";
import CheckoutClient from "./CheckoutClient";
import { redirect } from "next/navigation";

async function TicketCheckoutContent() {
  let user = null;
  try {
    const client = await createSessionClient();
    const account = client.getAccount();
    user = await account.get();
    console.log("Server User ID:", user.$id);
  } catch (error) {
    console.error("No session found or error fetching user:", error);
    // Redirecting might be too aggressive if we want to allow guests,
    // but the checkout needs a user ID.
    // For now, let's redirect to login.
    redirect("/auth?mode=login&redirect=/ticket/checkout");
  }

  return <CheckoutClient user={user} />;
}

export default function TicketCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen min-w-screen bg-black text-white flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <TicketCheckoutContent />
    </Suspense>
  );
}
