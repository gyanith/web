// app/auth/oauth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionClient } from "@/lib/appwrite/appwrite.server";
import { checkUserProfile, setSessionCookie } from "@/lib/actions/auth";
import { Client, Account } from "node-appwrite";

export async function GET(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get("userId");
        const secret = request.nextUrl.searchParams.get("secret");

        if (userId && secret) {
            // Verify session and get expiry
            const client = new Client()
                .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
                .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
                .setSession(secret);

            const account = new Account(client);
            const session = await account.getSession({
                sessionId: "current"
            })


            await setSessionCookie(session.secret, session.expire);
        }

        const cookieStore = await cookies();

        // Check for session cookie
        const sessionCookie = cookieStore.get(`a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`);

        if (!sessionCookie) {
            console.error("No session cookie found after OAuth");
            return NextResponse.redirect(
                new URL("/auth?error=no_session", request.url)
            );
        }

        // Get the authenticated user
        const { getAccount } = await createSessionClient();
        const account = getAccount();
        const user = await account.get();

        console.log("✅ OAuth user authenticated:", user.$id);

        // Check if this was a signup (check the cookie we set)
        const oauthIsSignup = cookieStore.get("oauth_is_signup");

        if (oauthIsSignup?.value === "1") {
            // Check if profile exists in database
            const { exists } = await checkUserProfile(user.$id);

            if (!exists) {
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

        // Cleanup
        cookieStore.delete("oauth_is_signup");
        cookieStore.delete("oauth_needs_profile");
        cookieStore.delete("oauth_user_id");

        return NextResponse.redirect(new URL("/", request.url));
    } catch (error: any) {
        console.error("OAuth Callback Error:", error);
        return NextResponse.redirect(
            new URL(`/auth?error=callback_failed`, request.url)
        );
    }
}