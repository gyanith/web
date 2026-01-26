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


    } catch (error) {
        console.error("Error fetching ticket:", error);
        return null;
    }
}
