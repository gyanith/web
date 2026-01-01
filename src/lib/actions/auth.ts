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

export async function getOAuthUrl(
    provider: "google" | "github",
    signUpData?: OAuthSignupData // Make this optional for login flow
) {
    try {
        const { getAccount } = createSessionClient();
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
}

export async function signOut() {
    try {
        const { getAccount, getClient } = createSessionClient();
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
        const { getAccount, getClient } = createSessionClient();
        const account = getAccount();
        const client = getClient();

        const cookieStore = await cookies();
        const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

        if (!projectId) {
            console.error("❌ getLoggedInUser: Project ID is undefined");
            return null;
        }

        const cookieName = `a_session_${projectId}`;
        const sessionCookie = cookieStore.get(cookieName);

        // Debug: Verify cookie was set
        /* const cookieStore2 = await cookies();
        const verifyCookie = cookieStore2.get(`a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`);
        console.log("🍪 Cookie after setting:", verifyCookie ? "EXISTS" : "MISSING", " Value: ", verifyCookie?.value); */

        // LOGGING FOR DEBUGGING
        if (!sessionCookie || !sessionCookie.value) {
            console.log("⚠️ getLoggedInUser: No session cookie found with name:", cookieName);
            return null;
        }

        client.setSession(sessionCookie.value);

        const user = await account.get();
        console.log("✅ getLoggedInUser: Success", user.$id); // Uncomment for verbose logs
        return user;

    } catch (error: any) {
        // If error is 401 (Unauthorized), it just means token expired/invalid
        if (error.code !== 401) {
            console.error("❌ getLoggedInUser Error:", error.message);
        }
        return null;
    }
}