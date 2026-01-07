// @/lib/actions/auth.ts

'use server';
import { createAdminClient, createSessionClient } from "@/lib/appwrite/appwrite.server"
import { ID, Query } from "node-appwrite";
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
        sameSite: isProduction ? "none" : "lax",
        expires: new Date(expire),
    });
}

export async function loginWithEmail(data: LoginData) {
    try {
        const { email, password } = data;

        // Use Session Client (not Admin!)
        const { getAccount } = await createSessionClient();
        const account = getAccount();

        // This creates a proper session with the server
        const session = await account.createEmailPasswordSession({ email, password });

        console.log("✅ Login successful:", session.userId);

        // Session is AUTOMATICALLY handled by Appwrite SDK
        // The cookie is already set by createSessionClient

        return { success: true };
    } catch (error: any) {
        console.error("Login Error:", error);

        // Handle specific error codes
        if (error.code === 401) {
            return { success: false, error: "Invalid email or password" };
        }

        return { success: false, error: error.message || "Login failed" };
    }
}

export async function signUpWithEmail(data: SignUpData) {
    let userId: string | null = null;

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

        // 1. Check if User Already Exists
        const { getUsers } = createAdminClient();
        const users = getUsers();

        const existingUsers = await users.list({
            queries: [Query.equal("email", email)]
        });

        if (existingUsers.total > 0) {
            return {
                success: false,
                error: "A user with this email already exists.",
            };
        }

        // 2. Create User Account (using Admin Client)
        userId = ID.unique();
        await users.createBcryptUser({
            userId,
            email,
            password,
            name,
        });

        console.log("✅ User account created:", userId);

        // 3. Create User Profile in Database
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

        console.log("✅ User profile created in database");

        // 4. Create Session for the User (using Admin Client)
        // This generates a session token that we can set as a cookie
        const sessionData = await users.createSession({ userId });

        console.log("✅ Session created:", sessionData.$id);

        // 5. Set the Session Cookie
        // The session secret is what authenticates the user
        await setSessionCookie(sessionData.secret, sessionData.expire);

        console.log("🍪 Session cookie set - user is now logged in");

        return { success: true };

    } catch (error: any) {
        console.error("Signup Error:", error);

        // If we created the user but something failed after, clean up
        if (userId && error.code !== 409) {
            try {
                const { getUsers } = createAdminClient();
                const users = getUsers();
                await users.delete({ userId });
                console.log("🧹 Cleaned up user account after error");
            } catch (cleanupError) {
                console.error("Failed to cleanup user:", cleanupError);
            }
        }

        // Handle specific error cases
        if (error.code === 409) {
            return {
                success: false,
                error: "A user with this email already exists.",
            };
        }

        if (error.code === 400) {
            return {
                success: false,
                error: "Invalid data provided. Please check your input.",
            };
        }

        return {
            success: false,
            error: error.message || "Signup failed. Please try again."
        };
    }
}


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