// @/lib/actions/auth.ts

"use server";
import {
  createAdminClient,
  createSessionClient,
} from "@/lib/appwrite/appwrite.server";
import { account } from "@/lib/appwrite/appwrite.client";
import { ID, Query } from "node-appwrite";
import { cookies } from "next/headers";
import { Account, Client } from "appwrite";

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
// 🚨 FIX: Robust Cookie Setting
export async function setSessionCookie(secret: string, expire: string) {
  const cookieStore = await cookies();
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!.toLowerCase(); // Force lowercase

  // Determine if we are in production (HTTPS)
  const isProduction = process.env.NODE_ENV === "production";

  cookieStore.set({
    name: `a_session_${projectId}`,
    value: secret,
    httpOnly: true,
    path: "/",
    // 🚨 FIX: False on localhost (http), True on Production (https)
    secure: isProduction,
    sameSite: "lax", // 'lax' is safer for navigation redirects than 'strict'
    expires: new Date(expire),
  });
}

// --- Actions ---

export async function loginWithEmail(data: any) {
  try {
    const { email, password } = data;

    // Verify credentials with Client SDK
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

    const account = new Account(client);

    // Create session to verify password
    const verification = await account.createEmailPasswordSession({
      email,
      password,
    });

    // ✅ FIX: Authenticate the client with the session secret
    // But wait... verification.secret is empty! So we can't do this.
    // We need a different approach.

    // Actually, we can just delete by session ID using Admin SDK
    const { getUsers } = createAdminClient();
    const users = getUsers();

    // Delete the verification session using Admin SDK
    await users.deleteSession({
      userId: verification.userId,
      sessionId: verification.$id,
    });

    // Create a new session with Admin SDK that has the secret
    const session = await users.createSession({ userId: verification.userId });

    await setSessionCookie(session.secret, session.expire);

    console.log("✅ Login Action: Cookie set for", session.userId);

    return { success: true };
  } catch (error: any) {
    console.error("Login Action Error:", error.message);
    return { success: false, error: "Invalid email or password" };
  }
}

export async function signUpWithEmail(data: any) {
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

    // 1. Init Admin Client
    const { getUsers, getTablesDB } = createAdminClient();
    const users = getUsers();
    const tablesDB = getTablesDB();

    // 2. Check Existence
    const existingUsers = await users.list({
      queries: [Query.equal("email", email)],
    });

    if (existingUsers.total > 0) {
      return {
        success: false,
        error: "A user with this email already exists.",
      };
    }

    // 3. Create User (Admin allows plain password creation)
    userId = ID.unique();
    await users.create(
      userId,
      email,
      phone ? `+91${phone}` : undefined,
      password,
      name,
    );

    console.log("✅ Signup Action: User created", userId);

    // 4. Create Profile DB Entry
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

    // 5. Auto-Login (Create Session & Set Cookie)
    // Since we just created the user via Admin, we can trust this and create a session directly
    const session = await users.createSession({ userId });

    await setSessionCookie(session.secret, session.expire);

    console.log("✅ Signup Action: Auto-logged in");

    return { success: true };
  } catch (error: any) {
    console.error("Signup Action Error:", error);

    // Cleanup ghost user
    if (userId && error.code !== 409) {
      try {
        const { getUsers } = createAdminClient();
        await getUsers().delete({ userId });
      } catch (e) {
        /* ignore cleanup error */
      }
    }

    return { success: false, error: error.message || "Signup failed." };
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
        await account.deleteSession({ sessionId: "current" });
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
    console.error("Logout Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getLoggedInUser() {
  try {
    const cookieStore = await cookies();

    // 1. Construct the cookie name exactly as we set it (Lowercase!)
    const projectId =
      process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID?.toLowerCase();
    const cookieName = `a_session_${projectId}`;

    // 2. Read the cookie
    const sessionCookie = cookieStore.get(cookieName);

    if (!sessionCookie || !sessionCookie.value) {
      console.log("❌ getLoggedInUser: No session cookie found");
      return null;
    }

    // 3. Initialize Client manually with this session
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setSession(sessionCookie.value); // Authenticate!

    const account = new Account(client);

    // 4. Fetch User
    const user = await account.get();

    console.log("✅ getLoggedInUser: Success", user.$id);
    return user;
  } catch (error: any) {
    // 401 means "Unauthorized" (Cookie expired or invalid)
    // We swallow this error and return null so the UI just shows "Log In"
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
    const sessionCookie = cookieStore.get(
      `a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`,
    );

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

    console.log("OAuth user:", user.$id, user.email);

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

    console.log("Profile created for:", user.$id);

    // Clear cookies
    cookieStore.delete("oauth_is_signup");
    cookieStore.delete("oauth_needs_profile");

    return { success: true }; // Don't include redirect here
  } catch (error: any) {
    console.error("Complete OAuth Signup Error:", error);
    return {
      success: false,
      error: error.message || "Failed to complete profile",
    };
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

// 🚨 FIX: New Server Action for OAuth Callback
export async function handleOAuthCallback(
  userId: string | null,
  secret: string,
) {
  try {
    console.log("🔄 handleOAuthCallback triggered", {
      userId: userId || "null",
      secret: secret ? "***" : "missing",
    });

    if (!secret) {
      return { success: false, error: "Missing secret" };
    }

    // 1. Verify Session with Admin/Server Client
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setSession(secret);

    const account = new Account(client);

    // 2. Get User & Session Details
    const user = await account.get();
    const session = await account.getSession("current");

    console.log("✅ OAuth Validated for user:", user.$id);

    // 3. Set Application Session Cookie
    await setSessionCookie(session.secret, session.expire);

    // 4. Check Profile Status (for Signup flow)
    const cookieStore = await cookies();
    const oauthIsSignup = cookieStore.get("oauth_is_signup");
    let redirectPath = "/";

    if (oauthIsSignup?.value === "1") {
      const { exists } = await checkUserProfile(user.$id);

      if (!exists) {
        console.log("📝 Profile missing, flagging for completion...");

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

        redirectPath = "/auth?mode=oauth_complete";
      }
    }

    // Cleanup
    cookieStore.delete("oauth_is_signup");

    return { success: true, redirectPath };
  } catch (error: any) {
    console.error("❌ handleOAuthCallback Error:", error);
    return { success: false, error: error.message };
  }
}
