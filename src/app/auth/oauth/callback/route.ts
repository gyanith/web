// app/auth/oauth/callback/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkUserProfile } from "@/lib/actions/auth";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get("userId");
        const secret = searchParams.get("secret");

        if (!userId || !secret) {
            return NextResponse.redirect(
                new URL("/auth?error=invalid_callback", request.url)
            );
        }

        const cookieStore = await cookies();
        const isProduction = process.env.NODE_ENV === "production";

        // 1️⃣ SET SESSION COOKIE (correct)
        cookieStore.set({
            name: `a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`,
            value: secret,
            httpOnly: true,
            path: "/",
            secure: isProduction,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30,
        });

        // 2️⃣ STORE USER ID DIRECTLY (NO account.get())
        cookieStore.set("oauth_user_id", userId, {
            httpOnly: true,
            secure: isProduction,
            path: "/",
            maxAge: 60 * 10,
        });

        const oauthIsSignup = cookieStore.get("oauth_is_signup");

        // 3️⃣ IF SIGNUP → CHECK PROFILE
        if (oauthIsSignup) {
            const { exists } = await checkUserProfile(userId);

            if (!exists) {
                cookieStore.set("oauth_needs_profile", "true", {
                    httpOnly: true,
                    secure: isProduction,
                    path: "/",
                    maxAge: 60 * 10,
                });

                const redirectUrl = new URL("/auth", request.url);
                redirectUrl.searchParams.set("mode", "oauth_complete");

                return NextResponse.redirect(redirectUrl);
            }

            cookieStore.delete("oauth_is_signup");
        }

        // 4️⃣ NORMAL LOGIN
        return NextResponse.redirect(new URL("/", request.url));
    } catch (error) {
        console.error("OAuth Callback Error:", error);
        return NextResponse.redirect(
            new URL("/auth?error=callback_failed", request.url)
        );
    }
}
