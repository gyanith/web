// app/auth/page.tsx
import { cookies } from "next/headers";
import { getLoggedInUser } from "@/lib/actions/auth.actions";
import AuthClient from "./AuthClient";

export default async function AuthPage() {
  const cookieStore = await cookies();
  const needsProfile = cookieStore.get("oauth_needs_profile");
  const user = needsProfile ? await getLoggedInUser() : null;

  return (
    <AuthClient
      oauthCompleteMode={!!needsProfile}
      userName={user?.name}
      userEmail={user?.email}
    />
  );
}
