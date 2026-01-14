
import { Client, Account, TablesDB, Users, Storage } from 'node-appwrite';
import { cookies } from 'next/headers';


// 1. Admin Client
// Used for: Database writes (bypassing RLS), User management (checking if user exists), Admin tasks.
// Requires: APPWRITE_API_KEY
export const createAdminClient = () => {
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
        .setKey(process.env.APPWRITE_API_KEY!);

    return {
        getClient: () => client,
        getTablesDB: () => new TablesDB(client),
        getAccount: () => new Account(client),
        getUsers: () => new Users(client),
        getStorage: () => new Storage(client),
    };
};

// 2. Session Client
// Used for: Operations acting as the specific user (e.g., logging in, creating a session).
// Does NOT use the API Key.
export async function createSessionClient() {
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

    // Read the session cookie
    const cookieStore = await cookies();
    const session = cookieStore.get(`a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID?.toLowerCase()}`);

    // Set session if it exists
    if (session?.value) {
        client.setSession(session.value);
    }

    return {
        getClient: () => client,
        getAccount: () => new Account(client),
        getTablesDB: () => new TablesDB(client),
    };
}


export { Query } from "node-appwrite"


