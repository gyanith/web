"use server";

import { createSessionClient, createAdminClient } from "@/lib/appwrite/appwrite.server";
import { appwriteConfig } from "@/lib/appwrite/appwrite.config";
import { ID } from "node-appwrite";
import { revalidatePath } from "next/cache";

/**
 * Uploads a file to the configured events bucket.
 * @param file - The file to upload.
 * @returns The file ID of the uploaded image.
 */
async function uploadImage(file: File) {
    const { getStorage } = await createSessionClient();
    const storage = getStorage();

    const uploadedFile = await storage.createFile({
        bucketId: appwriteConfig.eventsBucketId,
        fileId: ID.unique(),
        file
    });

    return uploadedFile.$id;
}

/**
 * Creates a new event in the database.
 * Uses TablesDB and object notation as requested.
 * @param formData - The form data containing event details and file.
 */
export async function createEvent(formData: FormData) {
    try {
        const { getTablesDB } = await createSessionClient();
        const tablesDB = getTablesDB();

        // 1. Handle Image Upload
        const file = formData.get("file") as File;
        let imageId = "";

        if (file && file.size > 0) {
            imageId = await uploadImage(file);
        } else {
            throw new Error("Event Poster is required");
        }

        // 2. Prepare Data
        const data = {
            name: formData.get("name") as string,
            date: formData.get("date") as string,
            description: formData.get("description") as string,
            type: formData.get("type") as string,
            location: formData.get("location") as string,
            fee: Number(formData.get("fee")),
            prize_pool: Number(formData.get("prize_pool")),
            num_seats: Number(formData.get("num_seats")),
            is_solo: formData.get("is_solo") === "true",
            is_team_event: formData.get("is_team_event") === "true",
            day: [parseInt(formData.get("day") as string)],
            g_form_link: formData.get("g_form_link") as string,
            image_id: imageId,
            is_published: true, // Default to published
            // Handle coordinators - assuming it's sent as JSON string or multi-value? 
            // For FormData, usually same keys. Let's assume JSON for complex array if needed or just comma separated.
            // Based on EventFormDialog logic, we might need to adjust how we pass this. 
            // For now, let's parse it if it's a string, or expect separate logic.
            // We'll extract carefully below.
        };

        // Extract coordinators (could be multiple entries)
        const coordinators = formData.getAll("coordinators") as string[];
        console.log("[createEvent] Coordinators received:", coordinators);
        // If passed as a single JSON string
        // const coordinatorsRaw = formData.get("coordinators"); 
        // const coordinators = coordinatorsRaw ? JSON.parse(coordinatorsRaw as string) : [];

        const finalData = {
            ...data,
            coordinators: coordinators
        };

        // 3. Create Row using TablesDB and object notation
        await tablesDB.createRow({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.eventsCollectionId,
            rowId: ID.unique(),
            data: finalData
        });

        // 4. Revalidate cache
        revalidatePath("/admin/events");
        revalidatePath("/admin");

        return { success: true };
    } catch (error) {
        console.error("Failed to create event:", error);
        return { success: false, error: "Failed to create event" };
    }
}

export async function updateEvent(eventId: string, formData: FormData) {
    try {
        const { getTablesDB } = await createSessionClient();
        const tablesDB = getTablesDB();

        // 1. Handle Image Upload (Optional)
        const file = formData.get("file") as File;
        let imageId = formData.get("image_id") as string;

        if (file && file.size > 0) {
            imageId = await uploadImage(file);
        }

        // 2. Prepare Data
        const data = {
            name: formData.get("name") as string,
            date: formData.get("date") as string,
            description: formData.get("description") as string,
            type: formData.get("type") as string,
            location: formData.get("location") as string,
            fee: Number(formData.get("fee")),
            prize_pool: Number(formData.get("prize_pool")),
            num_seats: Number(formData.get("num_seats")),
            is_solo: formData.get("is_solo") === "true",
            is_team_event: formData.get("is_team_event") === "true",
            day: [parseInt(formData.get("day") as string)],
            g_form_link: formData.get("g_form_link") as string,
            image_id: imageId,
            // is_published: true, // Keep existing status or update? Assuming strictly update details.
        };

        const coordinators = formData.getAll("coordinators") as string[];
        console.log("[updateEvent] Coordinators received:", coordinators);

        const finalData = {
            ...data,
            coordinators: coordinators
        };

        // 3. Update Row
        await tablesDB.updateRow({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.eventsCollectionId,
            rowId: eventId,
            data: finalData
        });

        // 4. Revalidate cache
        revalidatePath(`/admin/events/${eventId}`);
        revalidatePath("/admin/events");
        revalidatePath("/admin");

        return { success: true };
    } catch (error) {
        console.error("Failed to update event:", error);
        return { success: false, error: "Failed to update event" };
    }
}

/**
 * Fetches all coordinators from the Appwrite Team.
 * @returns Array of coordinators with id (userId) and name.
 */
export async function getCoordinators() {
    try {
        const { getTeams } = await createAdminClient();
        const teams = getTeams();

        const result = await teams.listMemberships({
            teamId: appwriteConfig.coordinatorsTeamId!
        });

        console.log("Fetching coordinators for Team ID:", appwriteConfig.coordinatorsTeamId);
        console.log("Coordinators result:", result);

        return result.memberships.map((member: any) => ({
            id: member.userId,
            name: member.userName,
        }));
    } catch (error) {
        console.error("Failed to fetch coordinators:", error);
        return [];
    }
}
