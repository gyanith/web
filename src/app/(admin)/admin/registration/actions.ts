"use server";

import { createAdminClient } from "@/lib/appwrite/appwrite.server";
import { appwriteConfig } from "@/lib/appwrite/appwrite.config";
import { ID, Query } from "node-appwrite";
import { logAction } from "@/lib/logger";

interface AdminRegistrationData {
    userId?: string;
    email: string;
    name?: string;
    phone?: string;
    type: "MERCH" | "WORKSHOP" | "ACCOMM" | "TICKET";
    // Merch
    quantity?: number;
    size?: string;
    // Workshop
    event_id?: string;
    // Accomm
    hostel?: string;
    day?: number[];
    // Ticket
    tier?: 1 | 2 | 3;
    item_id?: string;
    // New Profile Fields
    gender?: string;
    is_nitpy?: boolean;
    college_name?: string;
}

export async function processAdminRegistration(data: AdminRegistrationData) {
    let userId = data.userId;
    try {
        const { getUsers, getFunctions, getTablesDB } = await createAdminClient();
        const users = getUsers();
        const functions = getFunctions();
        const tablesDB = getTablesDB();

        // 1. Check or Create User
        if (!userId) {
            if (!data.email) {
                return { success: false, error: "Email is required for new users" };
            }

            // Check if user exists by email
            const existingUsers = await users.list({
                queries: [Query.equal("email", data.email)],
            });

            if (existingUsers.total > 0) {
                userId = existingUsers.users[0].$id;
            } else {
                // Create new user
                const password = "Pass123" + Math.random().toString(36).slice(-4);
                userId = ID.unique();
                const name = data.name || data.email.split("@")[0];

                try {
                    await users.create(
                        userId,
                        data.email,
                        data.phone ? `+91${data.phone}` : undefined,
                        password,
                        name
                    );

                    // Create Profile for the new user
                    await tablesDB.createRow({
                        databaseId: appwriteConfig.databaseId,
                        tableId: appwriteConfig.usersCollectionId,
                        rowId: userId,
                        data: {
                            email: data.email,
                            phone: parseInt(data.phone?.replace("+91", "") || "0") || 0,
                            gender: data.gender || "other",
                            is_nitpy: data.is_nitpy || false,
                            college_name: data.college_name || "Unknown",
                        },
                    });

                    await logAction("User Created", `Created user ${data.email} via admin console`, userId, 'SUCCESS');

                } catch (createUserError: any) {
                    console.error("Failed to create user/profile:", createUserError);
                    await logAction("User Creation Failed", `Failed to create user ${data.email}: ${createUserError.message}`, undefined, 'FAILED');
                    return { success: false, error: "Failed to create new user" };
                }
            }
        }

        if (!userId) {
            return { success: false, error: "Failed to resolve User ID" };
        }

        // 2. Call Appwrite Function for Payment/Registration
        // Function expects: { userId, type, ...props }
        const payload = {
            userId,
            type: data.type,
            quantity: data.quantity,
            size: data.size,
            event_id: data.event_id,
            hostel: data.hostel,
            day: data.day,
            tier: data.tier,
            item_id: data.type === "TICKET" ? `ticket_${userId}` : data.item_id,
        };

        const functionId = "69849bf60039fa30b3c0"; // ID from user prompt
        const execution = await functions.createExecution(
            functionId,
            JSON.stringify(payload)
        );

        if (execution.status === "completed") {
            try {
                // Parse the output if it's JSON
                const responseBody = JSON.parse(execution.responseBody);
                if (responseBody.success) {
                    await logAction(
                        "Admin Registration",
                        `Processed ${data.type} registration for user ${userId}. TxID: ${responseBody.transactionId}`,
                        userId,
                        'SUCCESS'
                    );
                    return { success: true, data: responseBody };
                } else {
                    await logAction(
                        "Admin Registration Failed",
                        `Failed ${data.type} registration for user ${userId}: ${responseBody.message}`,
                        userId,
                        'FAILED'
                    );
                    return { success: false, error: responseBody.message || "Function returned failure" };
                }
            } catch (e) {
                console.log("Raw execution body:", execution.responseBody);
                await logAction("Admin Registration Error", "Failed to parse function response", userId, 'FAILED');
                return { success: true, data: { message: "Execution completed but response check failed" } };
            }
        } else {
            await logAction("Admin Registration Failed", `Function execution status: ${execution.status}`, userId, 'FAILED');
            return { success: false, error: `Function execution status: ${execution.status}` };
        }

    } catch (error: any) {
        console.error("Process Admin Registration Error:", error);
        await logAction("Admin Registration Exception", error.message, userId, 'FAILED');
        return { success: false, error: error.message };
    }
}

export async function getEvents() {
    try {
        const { getTablesDB } = await createAdminClient();
        const tablesDB = getTablesDB();

        const response = await tablesDB.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.eventsCollectionId,
            queries: [
                Query.limit(100),
                Query.select(["$id", "name", "type", "fee"])
            ],
        });

        return response.rows.map((row: any) => ({
            id: row.$id,
            name: row.name,
            type: row.type,
            fee: row.fee,
        }));
    } catch (error) {
        console.error("Failed to fetch events:", error);
        return [];
    }
}

export async function getUserByEmail(email: string) {
    try {
        const { getUsers } = await createAdminClient();
        const users = getUsers();
        const result = await users.list({
            queries: [Query.equal("email", email)]
        });
        if (result.total > 0) {
            return { found: true, user: result.users[0] };
        }
        return { found: false };
    } catch (e) {
        return { found: false };
    }
}
