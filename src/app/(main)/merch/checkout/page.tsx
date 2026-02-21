import { Suspense } from "react";

export const dynamic = "force-dynamic";
import CheckoutPage from "./CheckoutPage";
import { createSessionClient } from "@/lib/appwrite/appwrite.server";
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

export default page;
