"use server";
import { cookies } from "next/headers";
import { createAdminClient, createSessionClient } from "../appwrite/appwrite.server";


export async function getTicket() {
    try {
        const { getClient, getAccount } = await createSessionClient();
        const client = getClient();
        const account = getAccount();
        const cookieStore = await cookies();
        const cookieName = `a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
        const sessionCookie = cookieStore.get(cookieName);

        if (sessionCookie) {
            client.setSession(sessionCookie.value);
        }

        const user = await account.get();
        if (!user) return null;

        const { getTablesDB } = await createSessionClient();
        const tablesDB = getTablesDB();

        const userProfile = await tablesDB.getRow({
            databaseId: process.env.NEXT_PUBLIC_DATABASE_ID!,
            tableId: process.env.NEXT_PUBLIC_USER_COLLECTION_ID!,
            rowId: user.$id,
        });

        return userProfile;

    } catch (error) {
        console.error("Error fetching ticket:", error);
        return null;
    }
}
