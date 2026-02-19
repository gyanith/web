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

/*
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TicketCheckoutPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-white">
          Coming Soon
        </h1>
        <p className="max-w-[600px] text-zinc-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto">
          Ticket purchasing will be available shortly. Stay tuned!
        </p>
      </div>
      <Link href="/">
        <Button variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </Link>
    </div>
  );
}
*/
