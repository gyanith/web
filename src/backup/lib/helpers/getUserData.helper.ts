// "use server"; // latent for static export

import { Query } from "node-appwrite";
import { appwriteConfig } from "../appwrite/appwrite.config";
import { createAdminClient } from "../appwrite/appwrite.server";
import { parseStringify } from "../utils";
import { User } from "../../../types/db";

// Function to get the logged-in user's details from the 'users' collection
// We need the userId (or email) because AdminClient doesn't have a session context.
export const getCurrentUserDetails = async (userId: string): Promise<User | null> => {
    const { getTablesDB } = await createAdminClient();
    const tablesDB = getTablesDB();

    try {
        // Attempt to fetch the user document directly using the userId as the document ID.
        // This assumes the user document ID in 'users' collection matches the Auth user ID.
        try {
            const userDoc = await tablesDB.getRow({
                databaseId: appwriteConfig.databaseId,
                tableId: appwriteConfig.usersCollectionId,
                rowId: userId
            });
            return parseStringify(userDoc);
        } catch (docError: any) {
            // If direct fetch fails with 404, it means user hasn't completed profile yet.
            // We return null and let the UI handle the "Complete Profile" flow.
            if (docError.code !== 404) {
                console.error(`Error fetching user document for ID ${userId}:`, docError);
            }
            return null;
        }
    } catch (error) {
        console.error("Error fetching user details:", error);
        return null;
    }
};


// Function to get events registered by the user
export const getUserRegisteredEvents = async (userId: string) => {
    const { getTablesDB } = await createAdminClient();
    const tablesDB = getTablesDB();

    try {
        const registrationsCollectionId = appwriteConfig.registrationsCollectionId;


        const registrations = await tablesDB.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: registrationsCollectionId,
            queries: [Query.equal("user_id", userId)]
        });

        if (registrations.rows.length === 0) {
            return [];
        }

        // 2. Extract event_ids
        const eventIds = registrations.rows.map((reg: any) => reg.event_id);

        // 3. Fetch details for each event
        const events = await Promise.all(eventIds.map(async (eventId: string) => {
            try {
                return await tablesDB.getRow({
                    databaseId: appwriteConfig.databaseId,
                    tableId: appwriteConfig.eventsCollectionId,
                    rowId: eventId
                });
            } catch (e) {
                console.error(`Failed to fetch event ${eventId}`, e);
                return null;
            }
        }));

        // Filter out nulls
        const validEvents = events.filter((e: any) => e !== null);

        // 4. Map to structure for UI
        return parseStringify(validEvents.map((doc: any) => ({
            id: doc.$id,
            type: doc.type,
            name: doc.name,
            date: doc.date, // Format date on client or here
            status: doc.is_published ? "Confirmed" : "Pending", // Mock status logic
            // Add other fields if needed
        })));

    } catch (error) {
        console.error("Error fetching registered events:", error);
        return [];
    }
}
