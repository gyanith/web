"use server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite/appwrite.server";
import { appwriteConfig } from "@/lib/appwrite/appwrite.config";
import { ExecutionMethod, Query } from "node-appwrite";
import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/logger";

/**
 * Verifies user entitlements using an Appwrite function.
 * @param userId - The ID of the user to verify.
 * @param toVerify - The category to verify (TICKET, ACCOMM, MERCH, EVENT).
 * @param eventId - Optional event ID for EVENT verification.
 */
export async function verifyUserEntitlements(
    userId: string,
    toVerify: "TICKET" | "ACCOMM" | "MERCH" | "EVENT",
    eventId?: string
) {
    try {
        const { getFunctions } = await createAdminClient();
        const functions = getFunctions();

        const functionId = "6980ab170030fae91559";

        const payload: any = {
            userId,
            toVerify,
        };

        if (toVerify === "EVENT" && eventId) {
            payload.eventId = eventId;
        }

        const execution = await functions.createExecution({
            functionId,
            body: JSON.stringify(payload),
            async: false,
            method: ExecutionMethod.POST,
            headers: { "Content-Type": "application/json" },
        });

        if (execution.status === "failed") {
            throw new Error(`Verification failed: ${execution.responseBody}`);
        }

        const result = JSON.parse(execution.responseBody);

        // Get current admin user for logging
        let adminName = "Unknown Admin";
        try {
            const { getAccount } = await createSessionClient();
            const admin = await getAccount().get();
            adminName = admin.name;
        } catch (e) {
            console.warn("Could not get admin account for logging:", e);
        }

        if (result.success && result.verified) {
            await logAction(
                "Verification Success",
                `Admin ${adminName} verified ${toVerify} for user ${userId}${eventId ? ` (Event: ${eventId})` : ""}`,
                userId,
                "INFO"
            );
        } else if (result.success && !result.verified) {
            await logAction(
                "Verification Denied",
                `Admin ${adminName} checked ${toVerify} for user ${userId} - NOT VERIFIED. Message: ${result.message}`,
                userId,
                "INFO"
            );
        }

        return result;
    } catch (error: any) {
        console.error("Error in verifyUserEntitlements:", error);
        return {
            success: false,
            verified: false,
            message: error.message || "Something went wrong during verification",
        };
    }
}

/**
 * Searches for a user by Phone Number or User ID in the profiles collection.
 * @param query - The search query (Phone or ID).
 */
export async function searchUser(query: string) {
    try {
        const { getTablesDB } = await createAdminClient();
        const db = getTablesDB();

        // Helper to enrich db user with auth data
        const enrichUser = async (dbUser: any) => {
            try {
                const { getUsers } = await createAdminClient();
                const authUser = await getUsers().get(dbUser.$id);
                return {
                    ...dbUser,
                    name: authUser.name || dbUser.name || "Unknown User",
                    email: authUser.email || dbUser.email
                };
            } catch (e) {
                console.warn("Could not enrich user with auth data:", e);
                return dbUser;
            }
        };

        // 1. Try finding by ID first
        try {
            if (query.length > 10) { // IDs are usually long
                const userById = await db.getRow(
                    appwriteConfig.databaseId,
                    appwriteConfig.usersCollectionId,
                    query
                );
                if (userById) {
                    const enriched = await enrichUser(userById);
                    return { success: true, user: enriched };
                }
            }
        } catch {
            // Not an ID or not found
        }

        // 2. Try finding by Phone
        try {
            const searchResult = await db.listRows(
                appwriteConfig.databaseId,
                appwriteConfig.usersCollectionId,
                [Query.equal("phone", query)]
            );

            if (searchResult.total > 0) {
                const enriched = await enrichUser(searchResult.rows[0]);
                return { success: true, user: enriched };
            }
        } catch (e) {
            console.warn("Invalid phone query, skipping...");
        }

        // 3. Try finding by email
        try {
            if (query.includes("@")) {
                const emailResult = await db.listRows(
                    appwriteConfig.databaseId,
                    appwriteConfig.usersCollectionId,
                    [Query.equal("email", query)]
                );

                if (emailResult.total > 0) {
                    const enriched = await enrichUser(emailResult.rows[0]);
                    return { success: true, user: enriched };
                }
            }
        } catch (e) {
            console.warn("Invalid email query, skipping...");
        }

        // 4. Try finding by Name (bonus)
        try {
            const nameResult = await db.listRows(
                appwriteConfig.databaseId,
                appwriteConfig.usersCollectionId,
                [Query.contains("name", query)]
            );
            if (nameResult.total > 0) {
                const enriched = await enrichUser(nameResult.rows[0]);
                return { success: true, user: enriched };
            }
        } catch (e) {
            // Partial name match failed
        }

        return { success: false, message: "No user found with that ID, Phone, or Email" };
    } catch (error: any) {
        console.error("Error searching user:", error);
        return { success: false, message: error.message || "Search failed" };
    }
}

/**
 * Fetches all event/workshop registrations for a given user, with event names.
 */
export async function getUserRegistrations(userId: string) {
    try {
        const { getTablesDB } = await createAdminClient();
        const db = getTablesDB();

        // 1. Get all registrations for the user
        const regResult = await db.listRows(
            appwriteConfig.databaseId,
            appwriteConfig.registrationsCollectionId,
            [Query.equal("user_id", userId), Query.limit(100)]
        );

        if (regResult.total === 0) return [];

        // 2. Fetch event names in parallel
        const rows = await Promise.all(
            regResult.rows.map(async (reg: any) => {
                let eventName = reg.event_id ?? "Unknown Event";
                let eventType = "EVENT";
                try {
                    const event = await db.getRow(
                        appwriteConfig.databaseId,
                        appwriteConfig.eventsCollectionId,
                        reg.event_id
                    );
                    eventName = event?.name ?? eventName;
                    eventType = event?.type ?? "EVENT";
                } catch { /* proceed with ID as name */ }
                return { id: reg.$id, eventName, eventType, registeredAt: reg.$createdAt };
            })
        );

        return rows;
    } catch (error: any) {
        console.error("getUserRegistrations error:", error);
        return [];
    }
}

/**
 * Checks if a user qualifies for a gate pass:
 * - Has a paid TICKET (transactions: item_type=TICKET, status=SUCCESS), OR
 * - Has at least one workshop registration
 */
export async function checkGatePass(userId: string): Promise<{
    granted: boolean;
    reason: string;
    hasTicket: boolean;
    hasWorkshop: boolean;
}> {
    try {
        const { getTablesDB } = await createAdminClient();
        const db = getTablesDB();

        // 1. Check for paid ticket
        const ticketResult = await db.listRows(
            appwriteConfig.databaseId,
            appwriteConfig.transactionsCollectionId,
            [
                Query.equal("user", userId),
                Query.equal("item_type", "TICKET"),
                Query.equal("status", "SUCCESS"),
                Query.limit(1),
            ]
        );
        const hasTicket = ticketResult.total > 0;

        // 2. Check for any workshop registration
        const workshopResult = await db.listRows(
            appwriteConfig.databaseId,
            appwriteConfig.registrationsCollectionId,
            [Query.equal("user_id", userId), Query.limit(1)]
        );
        const hasWorkshop = workshopResult.total > 0;

        const granted = hasTicket || hasWorkshop;
        const reason = granted
            ? hasTicket && hasWorkshop
                ? "Ticket + Workshop registration found"
                : hasTicket
                    ? "Paid ticket found"
                    : "Workshop registration found"
            : "No ticket or workshop registration found";

        return { granted, reason, hasTicket, hasWorkshop };
    } catch (error: any) {
        console.error("checkGatePass error:", error);
        return { granted: false, reason: "Verification error", hasTicket: false, hasWorkshop: false };
    }
}
