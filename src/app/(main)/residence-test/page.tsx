import { createSessionClient } from "@/lib/appwrite/appwrite.server";
import { redirect } from "next/navigation";
import AccommodationClient from "./AccommodationClient";

export default async function ResidencePage() {
  const { getAccount } = await createSessionClient();
  const account = getAccount();

  const { getUserAccommodation } =
    await import("@/lib/actions/payment.actions");

  let user = null;
  let accommodation = null;

  try {
    user = await account.get();
    accommodation = await getUserAccommodation(user.$id);
  } catch (error) {
    console.error("User not authenticated", error);
    redirect("/auth/login");
  }

  return (
    <AccommodationClient
      userId={user.$id}
      initialAccommodation={accommodation}
    />
  );
}
