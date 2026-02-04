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
    // 🚨 FIX: False on localhost (http). Forcing false now to support local 'npm run prod' testing.
    // In a real production deployment with HTTPS, you can set this back to 'isProduction' or true.
    secure: false,
    sameSite: "lax", // 'lax' is safer for navigation redirects than 'strict'
    expires: new Date(expire),
  });
}

// --- Actions ---

// 🚨 NEW: Check if user exists
export async function checkUserExists(email: string) {
  try {
    const { getUsers } = await createAdminClient();
    const users = getUsers();

    const result = await users.list({
      queries: [Query.equal("email", email)],
    });

    return { exists: result.total > 0 };
  } catch (error: any) {
    console.error("Check User Exists Error:", error);
    return { exists: false, error: error.message };
  }
}

export async function loginWithEmail({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    // 1. Verify credentials using Client SDK
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

    const account = new Account(client);

    // Create a temporary session to verify password
    const verification = await account.createEmailPasswordSession({
      email,
      password,
    });

    // 2. Use Admin SDK to create a session with secret
    const { getUsers } = await createAdminClient();
    const users = getUsers();

    // Delete the temporary verification session
    await users.deleteSession({
      userId: verification.userId,
      sessionId: verification.$id,
    });

    // Create a new session using Admin SDK (this returns the secret)
    const session = await users.createSession({ userId: verification.userId });

    // 3. Set the session cookie
    await setSessionCookie(session.secret, session.expire);

    console.log("✅ Login successful for user:", session.userId);

    return { success: true };
  } catch (error: any) {
    console.error("Login error:", error.message);
    return { success: false, error: "Invalid email or password" };
  }
}


// 🚨 NEW: Create Profile Action (for OTP Flow)
export async function createUserProfile(data: any) {
  try {
    const {
      userId,
      email,
      phone,
      gender,
      collegeName,
      isNITPY,
    } = data;

    const { getTablesDB } = await createAdminClient();
    const tablesDB = getTablesDB();

    console.log("📝 Creating profile for:", userId);

    // Create Profile DB Entry
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

    console.log("✅ Profile created successfully");
    return { success: true };
  } catch (error: any) {
    if (error.code === 409) {
      // Profile already exists, update it instead
      console.log("⚠️ Profile exists, updating instead:", data.userId);
      try {
        const { getTablesDB } = await createAdminClient();
        const tablesDB = getTablesDB();
        await tablesDB.updateRow({
          databaseId: process.env.NEXT_PUBLIC_DATABASE_ID!,
          tableId: process.env.NEXT_PUBLIC_USER_COLLECTION_ID!,
          rowId: data.userId,
          data: {
            email: data.email,
            phone: parseInt(data.phone),
            gender: data.gender,
            is_nitpy: data.isNITPY,
            college_name: data.collegeName,
          },
        });
        console.log("✅ Profile updated successfully");
        return { success: true };
      } catch (updateError: any) {
        console.error("Update Profile Error:", updateError);
        return { success: false, error: updateError.message || "Failed to update profile" };
      }
    }

    console.error("Create Profile Error:", error);
    return { success: false, error: error.message || "Failed to create profile" };
  }
}

export async function signUpWithEmail(data: any) {
  // Legacy / Fallback
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
    const { getUsers, getTablesDB } = await createAdminClient();
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
    const session = await users.createSession({ userId });
    await setSessionCookie(session.secret, session.expire);

    console.log("✅ Signup Action: Auto-logged in");

    return { success: true };
  } catch (error: any) {
    console.error("Signup Action Error:", error);

    // Cleanup ghost user
    if (userId && error.code !== 409) {
      try {
        const { getUsers } = await createAdminClient();
        await getUsers().delete({ userId });
      } catch (e) {
        /* ignore cleanup error */
      }
    }

    return { success: false, error: error.message || "Signup failed." };
  }
}

// 🚨 NEW: Complete Signup with OTP (Server Side)
export async function completeSignupWithOtp(
  userId: string,
  otp: string,
  data: SignUpData,
) {
  try {
    const { firstName, lastName, password, ...profileData } = data;

    // 1. Verify OTP and Create Session (using Client SDK pattern to verify OTP)
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

    const account = new Account(client);

    // This returns the session object which contains the secret
    console.log("🔐 Verifying OTP for", userId);
    const session = await account.createSession(userId, otp);

    // 2. Set the session cookie for Next.js Server
    await setSessionCookie(session.secret, session.expire);

    // 3. Update User Details (Password, Name) using Admin SDK
    const { getUsers } = await createAdminClient();
    const users = getUsers();

    await users.updatePassword(userId, password);
    await users.updateName(userId, `${firstName} ${lastName}`);

    // 4. Create User Profile
    const profileResult = await createUserProfile({
      userId,
      ...profileData,
    });

    if (!profileResult.success) {
      throw new Error(profileResult.error);
    }

    console.log("✅ Complete Signup Action: Success for", userId);
    return { success: true };
  } catch (error: any) {
    console.error("Complete Signup Error:", error);
    return {
      success: false,
      error: error.message || "Signup failed during completion.",
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

    const { getUsers } = await createAdminClient();
    const users = getUsers();

    const user = await users.get({ userId: oauthUserId });

    console.log("OAuth user:", user.$id, user.email);

    const { getTablesDB } = await createAdminClient();
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
    const { getTablesDB } = await createAdminClient();
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
