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
  let userProfile = null;

  try {
    user = await account.get();
    accommodation = await getUserAccommodation(user.$id);

    // Fetch user profile for gender
    const { checkUserProfile } = await import("@/lib/actions/auth.actions");
    const profileResult = await checkUserProfile(user.$id);
    if (profileResult.exists) {
      userProfile = profileResult.profile;
    }
  } catch (error) {
    console.error("User not authenticated", error);
    redirect("/auth/login");
  }

  return (
    <AccommodationClient
      userId={user.$id}
      initialAccommodation={accommodation}
      gender={userProfile?.gender || "male"} // Default to male if not found, or handle error
    />
  );
}
