// app/auth/oauth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkUserProfile, setSessionCookie } from "@/lib/actions/auth";
import { Client, Account } from "node-appwrite";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    console.log("🔍 Callback Request URL:", request.nextUrl.toString());

    // Extract parameters from URL
    const userId = request.nextUrl.searchParams.get("userId");
    const secret = request.nextUrl.searchParams.get("secret");

    console.log("🔍 OAuth params - userId:", userId, "secret:", secret ? "present" : "missing");

    let user;

    // CRITICAL FIX: Always prioritize the secret from URL parameters
    if (userId && secret) {
      console.log("✅ OAuth credentials found in URL");

      try {
        // Create client with the session secret from OAuth redirect
        const client = new Client()
          .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
          .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
          .setSession(secret);

        const account = new Account(client);

        // Verify the session and get user
        user = await account.get();
        console.log("✅ OAuth user authenticated:", user.$id);

        // Get full session details to set proper expiry
        const session = await account.getSession('current');

        console.log("✅ Setting session cookie...");
        await setSessionCookie(session.secret, session.expire);

      } catch (err) {
        console.error("❌ Error authenticating with OAuth secret:", err);
        return NextResponse.redirect(
          new URL("/auth?error=session_creation_failed", request.url)
        );
      }
    } else {
      // No OAuth parameters - this shouldn't happen in normal flow
      console.error("❌ Missing OAuth parameters (userId or secret)");
      return NextResponse.redirect(
        new URL("/auth?error=invalid_oauth_response", request.url)
      );
    }

    // Check if this was a signup (check the cookie we set before OAuth)
    const oauthIsSignup = cookieStore.get("oauth_is_signup");

    if (oauthIsSignup?.value === "1") {
      console.log("🔍 OAuth signup flow detected");

      // Check if profile exists in database
      const { exists } = await checkUserProfile(user.$id);

      if (!exists) {
        console.log("📝 Profile doesn't exist, redirecting to completion...");

        // User needs to complete profile
        cookieStore.set("oauth_needs_profile", "true", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 600,
        });

        cookieStore.set("oauth_user_id", user.$id, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 600,
        });

        const redirectUrl = new URL(request.nextUrl.origin + "/auth");
        redirectUrl.searchParams.set("mode", "oauth_complete");
        return NextResponse.redirect(redirectUrl);
      }
    }

    // Cleanup temporary cookies
    console.log("🧹 Cleaning up OAuth cookies...");
    cookieStore.delete("oauth_is_signup");
    cookieStore.delete("oauth_needs_profile");
    cookieStore.delete("oauth_user_id");

    console.log("✅ OAuth flow complete, redirecting to home");
    return NextResponse.redirect(new URL("/", request.url));

  } catch (error: any) {
    console.error("❌ OAuth Callback Error:", error);
    return NextResponse.redirect(
      new URL(`/auth?error=callback_failed&message=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}