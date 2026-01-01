
import { Client, Account, TablesDB, Users } from 'node-appwrite';



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
    };
};

// 2. Session Client
// Used for: Operations acting as the specific user (e.g., logging in, creating a session).
// Does NOT use the API Key.
export const createSessionClient = () => {
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

    return {
        getClient: () => client,
        getAccount: () => new Account(client),
        getTablesDB: () => new TablesDB(client),
    };
};
