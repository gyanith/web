"use server";

import { createSessionClient, createAdminClient } from "@/lib/appwrite/appwrite.server";
import { appwriteConfig } from "@/lib/appwrite/appwrite.config";
import { ID, Query, ExecutionMethod } from "node-appwrite";
import { revalidatePath } from "next/cache";
import { Event, EventSummary } from "@/types/db";

/**
 * Uploads a file to the configured events bucket.
 * @param file - The file to upload.
 * @returns The file ID of the uploaded image.
 */
async function uploadImage(file: File) {
    const { getStorage } = await createAdminClient();
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
 * @param formData - The form data containing event details and file.
 */
/* export async function createEvent(formData: FormData) {
    try {
        const { getTablesDB } = await createAdminClient();
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
        // Confirm is_published value from formData
        const isPublishedRaw = formData.get("is_published");
        console.log(`[createEvent] Raw is_published: ${isPublishedRaw}, Type: ${typeof isPublishedRaw}`);

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
            day: formData.getAll("day").map((d) => parseInt(d as string)),
            start_time: formData.get("start_time") as string,
            end_time: formData.get("end_time") as string,
            rulebook_link: formData.get("rulebook_link") as string,
            image_id: imageId,
            is_published: isPublishedRaw === "true",
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
    } catch (error: any) {
        console.error("Failed to create event:", error);
        return { success: false, error: error.message || "Failed to create event" };
    }
} */


export async function createEvent(formData: FormData) {
    try {

        // 1. Handle Image Upload
        const file = formData.get("file") as File;
        let imageId = "";

        if (file && file.size > 0) {
            imageId = await uploadImage(file);
        } else {
            throw new Error("Event Poster is required");
        }

        // 2. Prepare Data
        // Confirm is_published value from formData
        const isPublishedRaw = formData.get("is_published");
        console.log(`[createEvent] Raw is_published: ${isPublishedRaw}, Type: ${typeof isPublishedRaw}`);

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
            day: Number(formData.get("day")) || 1,
            start_time: formData.get("start_time") as string,
            end_time: formData.get("end_time") as string,
            rulebook_link: formData.get("rulebook_link") as string,
            image_id: imageId,
            is_published: isPublishedRaw === "true",
        };

        // Extract coordinators (could be multiple entries)
        const coordinators = formData.getAll("coordinators") as string[];
        console.log("[createEvent] Coordinators received:", coordinators);

        const finalData = {
            ...data,
            coordinators: coordinators
        };

        // 3. Create Event via Function
        // Using SDK instead of manual fetch for better security and error handling
        const { getFunctions } = await createAdminClient();
        const functions = getFunctions();

        const functionId = "6973be1c003764a10df8"; // Event Creation Function ID

        const execution = await functions.createExecution({
            functionId: functionId,
            body: JSON.stringify(finalData),
            async: false // async
        });

        console.log("Function execution response:", execution);

        if (execution.status === "failed") {
            throw new Error(`Function execution failed: ${execution.responseBody}`);
        }

        // 4. Revalidate cache
        revalidatePath("/admin/events");
        revalidatePath("/admin");

        return { success: true };
    } catch (error: any) {
        console.error("Failed to create event:", error);
        return { success: false, error: error.message || "Failed to create event" };
    }
}


/* export async function updateEvent(eventId: string, formData: FormData) {
    try {
        console.log("[updateEvent] Starting update for event:", eventId);
        const { getTablesDB } = await createAdminClient();
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
        // Confirm is_published value from formData
        const isPublishedRaw = formData.get("is_published");
        console.log(`[updateEvent] Raw is_published: ${isPublishedRaw}`);

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
            day: parseInt(formData.get("day") as string) || 1,
            start_time: formData.get("start_time") as string,
            end_time: formData.get("end_time") as string,
            rulebook_link: formData.get("rulebook_link") as string,
            image_id: imageId,
            is_published: isPublishedRaw === "true",
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
} */

// Appwrite function
export async function updateEvent(eventId: string, formData: FormData) {
    try {
        console.log("[updateEvent] Starting update for event via function:", eventId);
        const { getFunctions } = await createAdminClient();
        const functions = getFunctions();

        // 1. Handle Image Upload (Optional)
        const file = formData.get("file") as File;
        let imageId = formData.get("image_id") as string;

        if (file && file.size > 0) {
            console.log("[updateEvent] Uploading new image...");
            imageId = await uploadImage(file);
            console.log("[updateEvent] New image uploaded:", imageId);
        }

        // 2. Prepare Data
        const isPublishedRaw = formData.get("is_published");

        const data: any = {
            name: formData.get("name") as string,
            date: formData.get("date") as string,
            description: formData.get("description") as string,
            // type is immutable, do not include
            location: formData.get("location") as string,
            fee: Number(formData.get("fee")),
            prize_pool: Number(formData.get("prize_pool")),
            num_seats: Number(formData.get("num_seats")),
            is_solo: formData.get("is_solo") === "true",
            is_team_event: formData.get("is_team_event") === "true",
            day: Number(formData.get("day")) || 1,
            start_time: formData.get("start_time") as string,
            end_time: formData.get("end_time") as string,
            rulebook_link: formData.get("rulebook_link") as string,
            image_id: imageId,
            is_published: isPublishedRaw === "true",
        };

        const coordinators = formData.getAll("coordinators") as string[];
        if (coordinators.length > 0) {
            data.coordinators = coordinators;
        }

        // Filter out undefined properties
        Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

        console.log("[updateEvent] Sending payload to function:", data);

        // 3. Call Function
        const functionId = "6973ce95000836f2b0be";

        const execution = await functions.createExecution({
            functionId: functionId,
            body: JSON.stringify(data),
            async: false,
            xpath: `/?event_id=${eventId}`,
            method: ExecutionMethod.POST
        });

        if (execution.status === "failed") {
            console.error("Function execution failed:", execution.responseBody);
            throw new Error(`Function execution failed: ${execution.responseBody}`);
        }

        // Parse response to ensure logical success
        let responseBody;
        try {
            responseBody = JSON.parse(execution.responseBody);
        } catch (e) {
            console.warn("Could not parse function response:", execution.responseBody);
        }

        if (responseBody && !responseBody.success) {
            throw new Error(responseBody.message || "Update failed");
        }

        console.log("[updateEvent] Update successful via function.");

        // 4. Revalidate cache
        revalidatePath(`/admin/events/${eventId}`);
        revalidatePath("/admin/events");
        revalidatePath("/admin");

        return { success: true };
    } catch (error: any) {
        console.error("Failed to update event:", error);
        return { success: false, error: error.message || "Failed to update event" };
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

        console.log("Fetching coordinators for Team ID:", appwriteConfig.coordinatorsTeamId);

        if (!appwriteConfig.coordinatorsTeamId) {
            console.warn("COORDINATORS_TEAM_ID is not defined in environment variables.");
            return [];
        }

        const result = await teams.listMemberships(
            appwriteConfig.coordinatorsTeamId,
            [Query.limit(100)]
        );


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
/* export async function togglePublishStatus(eventId: string, currentStatus: boolean) {
    try {
        const { getTablesDB } = await createAdminClient();
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
            day: existingEvent.day ?? 1,
            start_time: existingEvent.start_time ?? "",
            end_time: existingEvent.end_time ?? "",
            rulebook_link: existingEvent.rulebook_link ?? (existingEvent.g_form_link ?? ""),
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
} */


// Appwrite function
export async function togglePublishStatus(eventId: string, currentStatus: boolean) {
    try {
        console.log(`[togglePublishStatus] Toggling status for event ${eventId}, currently: ${currentStatus}`);
        const { getFunctions } = await createAdminClient();
        const functions = getFunctions();

        const functionId = "6973d86f00039b3c7545"; // Toggle Publish Status Function ID

        const execution = await functions.createExecution({
            functionId: functionId,
            body: JSON.stringify({ eventId }),
            async: false,
            method: ExecutionMethod.POST
        });

        if (execution.status === "failed") {
            console.error("Function execution failed:", execution.responseBody);
            throw new Error(`Function execution failed: ${execution.responseBody}`);
        }

        // Parse response to ensure logical success
        let responseBody;
        try {
            responseBody = JSON.parse(execution.responseBody);
        } catch (e) {
            console.warn("Could not parse function response:", execution.responseBody);
        }

        if (responseBody && !responseBody.success) {
            throw new Error(responseBody.message || "Toggle failed");
        }

        const newStatus = responseBody.newStatus;
        console.log("[togglePublishStatus] Status toggled successfully via function. New status:", newStatus);

        // Revalidate cache
        revalidatePath(`/admin/events/${eventId}`);
        revalidatePath("/admin/events");
        revalidatePath("/admin");

        return { success: true, newStatus: newStatus };
    } catch (error: any) {
        console.error("Failed to toggle publish status:", error);
        return { success: false, error: error.message || "Failed to toggle publish status" };
    }
}

/*
 * Deletes an event from the database.
 * @param eventId - The ID of the event to delete.
 * @returns Success or error response.
 */
/* export async function deleteEvent(eventId: string) {
    try {
        const { getTablesDB } = await createAdminClient();
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
} */

// Appwrite function
export async function deleteEvent(eventId: string) {
    try {
        console.log("[deleteEvent] Starting deletion for event:", eventId);
        const { getFunctions } = await createAdminClient();
        const functions = getFunctions();

        const functionId = "6973d2f90006f203a9a1"; // Delete Event Function ID

        const execution = await functions.createExecution({
            functionId: functionId,
            async: false,
            xpath: `/?event_id=${eventId}`,
            method: ExecutionMethod.GET
        });

        if (execution.status === "failed") {
            console.error("Function execution failed:", execution.responseBody);
            throw new Error(`Function execution failed: ${execution.responseBody}`);
        }

        // Parse response to ensure logical success
        let responseBody;
        try {
            responseBody = JSON.parse(execution.responseBody);
        } catch (e) {
            console.warn("Could not parse function response:", execution.responseBody);
        }

        if (responseBody && !responseBody.success) {
            throw new Error(responseBody.message || "Deletion failed");
        }

        console.log("[deleteEvent] Event deleted successfully via function.");

        // Revalidate cache
        revalidatePath("/admin/events");
        revalidatePath("/admin");

        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete event:", error);
        return { success: false, error: error.message || "Failed to delete event" };
    }
}

/**
 * Fetches the top 5 most recent events.
 */
export async function getRecentEvents(): Promise<EventSummary[]> {
    try {
        const { getTablesDB } = await createAdminClient();
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
            day: doc.day || 1,
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
        const { getTablesDB, getUsers } = await createAdminClient();
        const db = getTablesDB();
        const users = getUsers();

        // 1. Fetch event
        const event = (await db.getRow(
            appwriteConfig.databaseId,
            appwriteConfig.eventsCollectionId,
            eventId,
        )) as unknown as Event;

        // 2. Get coordinator IDs from Junction Table
        const junctionRows = await db.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.eventsCoordinatorsCollectionId,
            queries: [Query.equal("event_id", eventId)]
        });

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
    } catch (error: any) {
        if (error.code !== 404) {
            console.error("Failed to fetch event:", error);
        }
        return null;
    }
}


// Get Registration Count
export async function getEventRegistrationCount(eventId: string) {
    try {
        const { getTablesDB } = await createAdminClient();
        const tablesDB = getTablesDB();

        // Use listRows with Query.equal to count. 
        // Optimization: limit to 1 row if we only need count? Appwrite list returns 'total'.
        // Yes, listRows returns { total, rows }. We can set limit to 1 to save bandwidth.
        const registrations = await tablesDB.listRows(
            appwriteConfig.databaseId,
            appwriteConfig.registrationsCollectionId,
            [Query.equal("event_id", eventId)]
        );

        return registrations.total;
    } catch (error) {
        console.error("Error fetching registration count:", error);
        return 0;
    }
}

/**
 * Fetches all registrations for a specific event, including user details.
 * @param eventId - The ID of the event.
 * @returns Array of registrations with user details.
 */
export async function getEventRegistrations(eventId: string) {
    try {
        const { getTablesDB, getUsers } = await createAdminClient();
        const db = getTablesDB();
        const usersAPI = getUsers();

        // 1. Fetch Registrations
        // Consider pagination later if list grows too large (limit defaults to 25 usually, set higher)
        const registrationList = await db.listRows(
            appwriteConfig.databaseId,
            appwriteConfig.registrationsCollectionId,
            [Query.equal("event_id", eventId), Query.limit(1000)]
        );

        if (registrationList.total === 0) {
            return [];
        }

        // 2. Fetch User Details for each registration
        // Fetch from both Auth Users API (for name, email) and custom users collection (for additional fields)
        const registrationsWithUsers = await Promise.all(
            registrationList.rows.map(async (reg: any) => {
                try {
                    // Fetch from Auth Users API for name and email
                    const authUser = await usersAPI.get(reg.user_id);

                    // Try to fetch additional fields from custom users collection
                    let userProfile: any = {};
                    try {
                        userProfile = await db.getRow(
                            appwriteConfig.databaseId,
                            appwriteConfig.usersCollectionId,
                            reg.user_id
                        );
                    } catch (err) {
                        console.warn(`Custom user profile not found for ${reg.user_id}, using Auth data only`);
                    }

                    return {
                        ...reg,
                        user: {
                            name: authUser.name || "Unknown User",
                            email: authUser.email || userProfile.email || "N/A",
                            phone: userProfile.phone || "",
                            college: userProfile.college_name || "N/A",
                            gender: userProfile.gender || ""
                        }
                    };
                } catch (err) {
                    // If Auth user fetch fails, try custom collection as fallback
                    console.warn(`Auth user not found for ${reg.user_id}, trying custom collection`);
                    try {
                        const userProfile = await db.getRow(
                            appwriteConfig.databaseId,
                            appwriteConfig.usersCollectionId,
                            reg.user_id
                        );
                        return {
                            ...reg,
                            user: {
                                name: userProfile.name || "Unknown User",
                                email: userProfile.email || "N/A",
                                phone: userProfile.phone || "",
                                college: userProfile.college_name || "N/A",
                                gender: userProfile.gender || ""
                            }
                        };
                    } catch (fallbackErr) {
                        console.error(`Failed to fetch user data for ${reg.user_id}`);
                        return {
                            ...reg,
                            user: { name: "Unknown User", email: "N/A", phone: "", college: "N/A", gender: "" }
                        };
                    }
                }
            })
        );

        return registrationsWithUsers;
    } catch (error) {
        console.error("Failed to fetch event registrations:", error);
        return [];
    }
}
