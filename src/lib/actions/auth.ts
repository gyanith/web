// @/lib/actions/auth.ts

'use server';
import { createAdminClient, createSessionClient } from "@/lib/appwrite/appwrite.server"
import { ID, OAuthProvider, Query } from "node-appwrite";
import { cookies } from "next/headers";


// --- Types ---

interface LoginData {
    email: string;
    password: string;
}

interface SignUpData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    gender: string;
    collegeName: string;
    isNITPY: boolean;
}

interface OAuthSignupData {
    firstName?: string;
    lastName?: string;
    phone?: string;
    gender?: string;
    collegeName?: string;
    isNITPY?: boolean;
}

// --- Appwrite Clients ---

export async function setSessionCookie(secret: string, expire: string) {
    const cookieStore = await cookies();

    // CRITICAL: Next.js treats "localhost" as insecure (http).
    // If we set 'secure: true' on localhost, the browser blocks the cookie.
    const isProduction = process.env.NODE_ENV === "production";

    cookieStore.set({
        name: `a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`,
        value: secret,
        httpOnly: true,
        path: "/",
        // If production, use Secure/None. If localhost, use Not-Secure/Lax.
        secure: isProduction,
        sameSite: "lax",
        expires: new Date(expire),
    });
}

export async function loginWithEmail(data: LoginData) {
    try {
        const { email, password } = data;

        // Use Session Client for login
        const { getUsers } = createAdminClient();
        const users = getUsers();

        // First, find the user by email to get their userId
        const userList = await users.list({ queries: [Query.equal("email", email)] });

        if (userList.total === 0) {
            return { success: false, error: "Invalid email or password" };
        }

        const user = userList.users[0];

        const session = await users.createSession({ userId: user.$id });

        console.log("📦 Session object:", JSON.stringify(session, null, 2));
        console.log("🔑 Session secret:", session.secret);

        // Set the HTTP-only cookie
        await setSessionCookie(session.secret, session.expire);

        // Debug: Verify cookie was set
        const cookieStore2 = await cookies();
        const verifyCookie = cookieStore2.get(`a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`);
        console.log("🍪 Cookie after setting:", verifyCookie ? "EXISTS" : "MISSING", " Value: ", verifyCookie?.value);

        return { success: true };
    } catch (error: any) {
        console.error("Login Error:", error);
        return { success: false, error: error.message || "Login failed" };
    }
}

export async function signUpWithEmail(data: SignUpData) {
    try {
        const {
            email,
            password,
            firstName,
            lastName,
            phone,
            gender,
            collegeName,
            isNITPY,
        } = data;
        const name = `${firstName} ${lastName}`;

        // 0. Check if User Already Exists (Requires Admin Client)
        const { getUsers } = createAdminClient();
        const users = getUsers();

        const existingUsers = await users.list({ queries: [Query.equal("email", email)] });

        if (existingUsers.total > 0) {
            return {
                success: false,
                error: "A user with this email already exists.",
            };
        }
        // 1. Create User using Admin Client
        const userId = ID.unique();
        await users.createBcryptUser({
            userId,
            email,
            password,
            name,
        });

        console.log("✅ User created:", userId);

        // 2. Create Session using Admin API (this returns a proper secret)
        const session = await users.createSession({ userId });

        console.log("📦 Session object:", JSON.stringify(session, null, 2));
        console.log("🔑 Session secret:", session.secret);

        // 3. Set Cookie
        await setSessionCookie(session.secret, session.expire);

        // 4. Create Database Document
        const { getTablesDB } = createAdminClient();
        const tablesDB = getTablesDB();

        await tablesDB.createRow({
            databaseId: process.env.NEXT_PUBLIC_DATABASE_ID!,
            tableId: process.env.NEXT_PUBLIC_USER_COLLECTION_ID!,
            rowId: userId,
            data: {
                email,
                phone: parseInt(phone),
                gender,
                is_nitpy: isNITPY,
                college_name: collegeName,
            },
        });

        return { success: true };
    } catch (error: any) {
        console.error("Signup Error:", error);
        // Fallback: If the race condition hits and Appwrite throws 409
        if (error.code === 409) {
            return {
                success: false,
                error: "A user with this email already exists.",
            };
        }
        return { success: false, error: error.message || "Signup failed" };
    }

}

/* export async function getOAuthUrl(
    provider: "google" | "github",
    signUpData?: OAuthSignupData // Make this optional for login flow
) {
    try {
        const { getAccount } = await createSessionClient();
        const account = getAccount();

        // 1. If this is a signup, store the extra data in a temporary cookie
        // We will read this cookie in the /auth/success route
        if (signUpData) {
            const cookieStore = await cookies();
            cookieStore.set("oauth_signup_data", JSON.stringify(signUpData), {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                path: "/",
                maxAge: 60 * 5, // 5 minutes expiration
            });
        }

        // 2. Generate the OAuth URL
        // NOTICE: We point success to a Route Handler, not a Page
        const redirectUrl = await account.createOAuth2Token({
            provider: provider === "google" ? OAuthProvider.Google : OAuthProvider.Github,
        });

        return redirectUrl;
    } catch (error: any) {
        console.error("OAuth Error:", error);
        throw new Error("Failed to initiate OAuth");
    }
} */

export async function signOut() {
    try {
        const { getAccount, getClient } = await createSessionClient();
        const account = getAccount();
        const client = getClient();

        // FIX: Read the cookie and authenticate the client
        const cookieStore = await cookies();
        const cookieName = `a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
        const sessionCookie = cookieStore.get(cookieName);

        if (sessionCookie) {
            // Manually set the session on the SDK so it knows who is making the request
            client.setSession(sessionCookie.value);

            try {
                await account.deleteSession({ sessionId: 'current' });
            } catch (error) {
                // Ignore error if session is already invalid
            }

            // FIX: Overwrite the cookie with an immediate expiration date (Epoch 0)
            // This forces the browser to remove the cookie entry completely.
            cookieStore.set({
                name: cookieName,
                value: "",
                httpOnly: true,
                path: "/",
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 0,
                expires: new Date(0),
            });

        }

        return { success: true };
    } catch (error: any) {
        console.error('Logout Error:', error);
        return { success: false, error: error.message };
    }
}

export async function getLoggedInUser() {
    try {
        const { getAccount } = await createSessionClient(); // Add await here
        const account = getAccount();

        const user = await account.get();
        console.log("✅ getLoggedInUser: Success", user.$id);
        return user;

    } catch (error: any) {
        if (error.code !== 401) {
            console.error("❌ getLoggedInUser Error:", error.message);
        }
        return null;
    }
}

export async function getOAuthUrl(
    provider: "google" | "github",
    isSignup: boolean = false
) {
    try {
        const { getAccount } = await createSessionClient();
        const account = getAccount();

        const cookieStore = await cookies();

        if (isSignup) {
            cookieStore.set("oauth_is_signup", "true", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                path: "/",
                maxAge: 60 * 10,
            });
        }

        const redirectUrl = await account.createOAuth2Token({
            provider: provider === "google" ? OAuthProvider.Google : OAuthProvider.Github,
            success: `${process.env.NEXT_PUBLIC_APP_URL}/auth/oauth/callback`,
            failure: `${process.env.NEXT_PUBLIC_APP_URL}/auth?error=oauth_failed`,
        }); // <-- This should be the closing brace, not a comma with {

        return redirectUrl;
    } catch (error: any) {
        console.error("OAuth Error:", error);
        throw new Error("Failed to initiate OAuth");
    }
}

// Complete OAuth signup
export async function completeOAuthSignup(data: {
    phone: string;
    gender: string;
    collegeName: string;
    isNITPY: boolean;
}) {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get(`a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`);

        if (!sessionCookie) {
            return { success: false, error: "No active session" };
        }


        const oauthUserId = cookieStore.get("oauth_user_id")?.value;

        if (!oauthUserId) {
            return { success: false, error: "OAuth user not found" };
        }

        const { getUsers } = createAdminClient();
        const users = getUsers();

        const user = await users.get({ userId: oauthUserId });

        console.log('OAuth user:', user.$id, user.email);

        const { getTablesDB } = createAdminClient();
        const tablesDB = getTablesDB();

        await tablesDB.createRow({
            databaseId: process.env.NEXT_PUBLIC_DATABASE_ID!,
            tableId: process.env.NEXT_PUBLIC_USER_COLLECTION_ID!,
            rowId: user.$id,
            data: {
                email: user.email,
                phone: parseInt(data.phone),
                gender: data.gender,
                is_nitpy: data.isNITPY,
                college_name: data.collegeName,
            },
        });

        console.log('Profile created for:', user.$id);

        // Clear cookies
        cookieStore.delete("oauth_is_signup");
        cookieStore.delete("oauth_needs_profile");

        return { success: true }; // Don't include redirect here
    } catch (error: any) {
        console.error("Complete OAuth Signup Error:", error);
        return { success: false, error: error.message || "Failed to complete profile" };
    }
}

// Check if user profile exists
export async function checkUserProfile(userId: string) {
    try {
        const { getTablesDB } = createAdminClient();
        const tablesDB = getTablesDB();

        const profile = await tablesDB.getRow({
            databaseId: process.env.NEXT_PUBLIC_DATABASE_ID!,
            tableId: process.env.NEXT_PUBLIC_USER_COLLECTION_ID!,
            rowId: userId,
        });

        return { exists: true, profile };
    } catch (error: any) {
        if (error.code === 404) {
            return { exists: false };
        }
        throw error;
    }
}