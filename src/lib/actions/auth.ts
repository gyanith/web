'use server';

import { cookies } from 'next/headers';


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

// --- Appwrite Clients ---

// 1. Admin Client: Used for Database writes (bypassing permissions) and Admin tasks
const createAdminClient = () => {
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
        .setKey(process.env.APPWRITE_API_KEY!); // Ensure this exists in your .env.local

    return {
        getDatabases: () => new Databases(client),
        getAccount: () => new Account(client),
        getUsers: () => new Users(client),
    };
};

// 2. Session Client: Used for creating sessions (login)
const createSessionClient = () => {
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

    return {
        getAccount: () => new Account(client),
    };
};

// --- Cookie Helper (The Fix for Localhost) ---

async function setSessionCookie(secret: string, expire: string) {
    const cookieStore = await cookies();

    // CRITICAL: Next.js treats "localhost" as insecure (http).
    // If we set 'secure: true' on localhost, the browser blocks the cookie.
    const isProduction = process.env.NODE_ENV === 'production';

    cookieStore.set({
        name: `a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`,
        value: secret,
        httpOnly: true,
        path: '/',
        // If production, use Secure/None. If localhost, use Not-Secure/Lax.
        secure: isProduction,
        sameSite: 'lax',
        expires: new Date(expire),
        // domain: isProduction ? '.yourdomain.com' : undefined, // Optional: share across subdomains
    });
}

// --- Server Actions ---

export async function loginWithEmail(data: LoginData) {
    try {
        const { email, password } = data;
        const { getAccount } = createSessionClient();
        const account = getAccount();

        // 1. Create Session via Appwrite
        const session = await account.createEmailPasswordSession(email, password);

        // 2. Set the HTTP-only cookie manually
        await setSessionCookie(session.secret, session.expire);

        return { success: true };
    } catch (error: any) {
        console.error('Login Error:', error);
        return { success: false, error: error.message || 'Login failed' };
    }
}

export async function signUpWithEmail(data: SignUpData) {
    try {
        const { email, password, firstName, lastName, phone, gender, collegeName, isNITPY } = data;
        const name = `${firstName} ${lastName}`;

        // 0. Check if User Already Exists (Requires Admin Client)
        const { getUsers } = createAdminClient();
        const users = getUsers();

        const existingUsers = await users.list([
            Query.equal('email', email)
        ]);

        if (existingUsers.total > 0) {
            return { success: false, error: 'A user with this email already exists.' };
        }

        // 1. Create User (Using Session Client so it mimics a public registration)
        // Note: If you want to bypass IP rate limits, you could use the AdminClient here instead.
        const { getAccount } = createSessionClient();
        const account = getAccount();

        const userId = ID.unique();
        await account.create(userId, email, password, name);

        // 2. Create Session (Login immediately after signup)
        const session = await account.createEmailPasswordSession(email, password);

        // 3. Set Cookie
        await setSessionCookie(session.secret, session.expire);

        // 4. Create Database Document
        // Use Admin Client here to ensure we have permission to write to the collection
        const { getDatabases } = createAdminClient();
        const databases = getDatabases();

        await databases.createDocument(
            process.env.NEXT_PUBLIC_DATABASE_ID!,
            process.env.NEXT_PUBLIC_USER_COLLECTION_ID!,
            userId, // Use same ID as Auth User for easy lookup later
            {
                email,
                phone: parseInt(phone), // Ensure schema in Appwrite matches 'integer'
                gender,
                is_nitpy: isNITPY,
                college_name: collegeName,
            }
        );

        return { success: true };
    } catch (error: any) {
        console.error('Signup Error:', error);
        // Fallback: If the race condition hits and Appwrite throws 409
        if (error.code === 409) {
            return { success: false, error: 'A user with this email already exists.' };
        }
        return { success: false, error: error.message || 'Signup failed' };
    }
}

export async function getOAuthUrl(provider: 'google' | 'github') {
    try {
        const { getAccount } = createSessionClient();
        const account = getAccount();

        // This returns a URL string. 
        // The frontend should redirect window.location.href to this URL.
        const redirectUrl = await account.createOAuth2Token(
            provider === 'google' ? OAuthProvider.Google : OAuthProvider.Github,
            `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback?status=success`, // Callback URL on success
            `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback?status=failure`  // Callback URL on failure
        );

        return redirectUrl;
    } catch (error: any) {
        console.error('OAuth Error:', error);
        throw new Error('Failed to initiate OAuth');
    }
}