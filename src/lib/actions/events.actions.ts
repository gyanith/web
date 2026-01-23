"use server";

import { createSessionClient, createAdminClient } from "@/lib/appwrite/appwrite.server";
import { appwriteConfig } from "@/lib/appwrite/appwrite.config";
import { ID, Query } from "node-appwrite";
import { revalidatePath } from "next/cache";
import { Event, EventSummary } from "@/lib/types";

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
            is_published: formData.get("is_published") === "true",
        };

        // Extract coordinators (could be multiple entries)
        const coordinators = formData.getAll("coordinators") as string[];
        console.log("[createEvent] Coordinators received:", coordinators);

        const finalData = {
            ...data,
            coordinators: coordinators
        };

        // 3. Create Row using TablesDB and object notation
        const generateEventId = (type: string) => {
            const prefix = type.toLowerCase();
            const timestamp = Date.now().toString(36);
            const randomPart = Math.random().toString(36).substring(2, 6);
            return `${prefix}_${timestamp}${randomPart}`.substring(0, 30);
        }

        const type = (formData.get("type") as string) || "event";
        const eventId = generateEventId(type);

        // Remove coordinators from the data sent to the events collection
        const { coordinators: _, ...eventData } = finalData;

        const newEvent = await tablesDB.createRow({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.eventsCollectionId,
            rowId: eventId,
            data: eventData
        });

        // 4. Create Junction Table Entries for Coordinators
        if (coordinators.length > 0) {
            const generateJuctionId = () => {
                const timestamp = Date.now().toString(36);
                const randomPart = Math.random().toString(36).substring(2, 10);
                return `link_${timestamp}${randomPart}`.substring(0, 20);
            }

            await Promise.all(coordinators.map(async (userId) => {
                await tablesDB.createRow({
                    databaseId: appwriteConfig.databaseId,
                    tableId: appwriteConfig.eventsCoordinatorsCollectionId,
                    rowId: generateJuctionId(),
                    data: {
                        event_id: newEvent.$id,
                        coordinator_id: userId
                    }
                });
            }));
        }

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
        console.log("[updateEvent] Starting update for event:", eventId);
        const { getTablesDB } = await createSessionClient();
        const tablesDB = getTablesDB();

        // 1. Handle Image Upload (Optional)
        const file = formData.get("file") as File;
        let imageId = formData.get("image_id") as string;

        if (file && file.size > 0) {
            console.log("[updateEvent] Uploading new image...");
            imageId = await uploadImage(file);
            console.log("[updateEvent] New image uploaded:", imageId);
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
            is_published: formData.get("is_published") === "true",
        };

        const coordinators = formData.getAll("coordinators") as string[];
        console.log("[updateEvent] Coordinators received:", coordinators);

        const finalData: any = {
            ...data,
        };

        // Only update coordinators if user has selected some. 
        // If empty, we assume they didn't want to change them (or fetch failed), so we keep existing.
        if (coordinators.length > 0) {
            finalData.coordinators = coordinators;
        }

        console.log("[updateEvent] Final data to update:", finalData);

        // 3. Update Row
        // Remove coordinators from the data sent to the events collection
        const { coordinators: _, ...eventData } = finalData;

        await tablesDB.updateRow({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.eventsCollectionId,
            rowId: eventId,
            data: eventData
        });

        // 4. Update Coordinators (Junction Table)
        // Fetch existing links
        const existingLinks = await tablesDB.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.eventsCoordinatorsCollectionId,
            queries: [Query.equal("event_id", eventId)]
        });

        // Delete all existing links
        await Promise.all(existingLinks.rows.map(row =>
            tablesDB.deleteRow({
                databaseId: appwriteConfig.databaseId,
                tableId: appwriteConfig.eventsCoordinatorsCollectionId,
                rowId: row.$id
            })
        ));

        // Create new links
        if (coordinators.length > 0) {
            const generateId = () => {
                const timestamp = Date.now().toString(36);
                const randomPart = Math.random().toString(36).substring(2, 10);
                return `${timestamp}${randomPart}`.substring(0, 20);
            }
            await Promise.all(coordinators.map(async (userId) => {
                if (!userId || userId === 'null' || userId === 'undefined') {
                    console.warn("[updateEvent] Skipping invalid coordinator ID:", userId);
                    return;
                }

                await tablesDB.createRow({
                    databaseId: appwriteConfig.databaseId,
                    tableId: appwriteConfig.eventsCoordinatorsCollectionId,
                    rowId: generateId(),
                    data: {
                        event_id: eventId,
                        coordinator_id: userId
                    }
                });
            }));
        }

        console.log("[updateEvent] Event updated successfully in DB");

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
export async function getCoordinators(): Promise<{ id: string; name: string }[]> {
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

/**
 * Toggles the publish status of an event.
 * @param eventId - The ID of the event to toggle.
 * @param currentStatus - The current publish status.
 * @returns Success or error response.
 */
export async function togglePublishStatus(eventId: string, currentStatus: boolean) {
    try {
        const { getTablesDB } = await createSessionClient();
        const tablesDB = getTablesDB();

        // First, fetch the existing event data
        const { rows } = await tablesDB.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.eventsCollectionId,
            queries: [Query.equal("$id", eventId)]
        });

        if (rows.length === 0) {
            throw new Error("Event not found");
        }

        const existingEvent = rows[0];

        // Update with all existing data plus the new publish status
        const updateData = {
            name: existingEvent.name,
            date: existingEvent.date,
            description: existingEvent.description,
            type: existingEvent.type,
            location: existingEvent.location,
            fee: existingEvent.fee ?? 0,
            prize_pool: existingEvent.prize_pool ?? 0,
            num_seats: existingEvent.num_seats ?? 0,
            is_solo: existingEvent.is_solo ?? true,
            is_team_event: existingEvent.is_team_event ?? false,
            day: existingEvent.day ?? [1],
            g_form_link: existingEvent.g_form_link ?? "",
            image_id: existingEvent.image_id ?? "",
            is_published: !currentStatus
        };

        await tablesDB.updateRow({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.eventsCollectionId,
            rowId: eventId,
            data: updateData
        });

        // Revalidate cache
        revalidatePath(`/admin/events/${eventId}`);
        revalidatePath("/admin/events");
        revalidatePath("/admin");

        return { success: true, newStatus: !currentStatus };
    } catch (error) {
        console.error("Failed to toggle publish status:", error);
        return { success: false, error: "Failed to toggle publish status" };
    }
}

/**
 * Deletes an event from the database.
 * @param eventId - The ID of the event to delete.
 * @returns Success or error response.
 */
export async function deleteEvent(eventId: string) {
    try {
        const { getTablesDB } = await createSessionClient();
        const tablesDB = getTablesDB();

        // 1. Delete Coordinator Association (Junction Table)
        const existingLinks = await tablesDB.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.eventsCoordinatorsCollectionId,
            queries: [Query.equal("event_id", eventId)]
        });

        await Promise.all(existingLinks.rows.map(row =>
            tablesDB.deleteRow({
                databaseId: appwriteConfig.databaseId,
                tableId: appwriteConfig.eventsCoordinatorsCollectionId,
                rowId: row.$id
            })
        ));

        // 2. Delete Event
        await tablesDB.deleteRow({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.eventsCollectionId,
            rowId: eventId
        });

        // Revalidate cache
        revalidatePath("/admin/events");
        revalidatePath("/admin");

        return { success: true };
    } catch (error) {
        console.error("Failed to delete event:", error);
        return { success: false, error: "Failed to delete event" };
    }
}

/**
 * Fetches the top 5 most recent events.
 */
export async function getRecentEvents(): Promise<EventSummary[]> {
    try {
        const { getTablesDB } = await createSessionClient();
        const tablesDB = getTablesDB();

        const response = await tablesDB.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.eventsCollectionId,
            queries: [Query.orderDesc("$updatedAt"), Query.limit(5)],
        });

        return response.rows.map((doc: any) => ({
            id: doc.$id,
            name: doc.name,
            date: new Date(doc.date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
            }),
            type: doc.type,
            fee: doc.fee,
            day: Array.isArray(doc.day) ? doc.day.map(String) : [String(doc.day)],
            status: (doc.is_published ? "Published" : "Draft") as "Published" | "Draft",
        }));
    } catch (err) {
        console.error("Failed to fetch events:", err);
        return [];
    }
}

/**
 * Fetches a single event by ID.
 * @param eventId - The ID of the event to fetch.
 */
export async function getEvent(eventId: string): Promise<(Event & { coordinators: any[] }) | null> {
    try {
        const { getTablesDB, getUsers } = createAdminClient();
        const db = getTablesDB();
        const users = getUsers();

        // 1. Fetch event
        const event = (await db.getRow(
            appwriteConfig.databaseId,
            appwriteConfig.eventsCollectionId,
            eventId,
        )) as unknown as Event;

        // 2. Get coordinator IDs from Junction Table
        const junctionRows = await db.listRows(
            appwriteConfig.databaseId,
            appwriteConfig.eventsCoordinatorsCollectionId,
            [Query.equal("event_id", eventId)]
        );

        const coordinatorIds = junctionRows.rows
            .map((row: any) => row.coordinator_id)
            .filter((id: any) => id); // Filter out null/undefined IDs

        // 3. Fetch user profiles
        const coordinatorProfiles = await Promise.all(
            coordinatorIds.map((id: string) => users.get(id).catch(() => null)) // Handle fetch errors gracefully
        );

        return {
            ...event,
            coordinators: coordinatorProfiles.filter(p => p !== null), // Filter out failed fetches
        };
    } catch (error) {
        console.error("Failed to fetch event:", error);
        return null;
    }
}
