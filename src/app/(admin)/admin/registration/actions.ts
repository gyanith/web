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

// @ts-ignore
import { initiatePayment } from "@/lib/actions/payment.actions";

export async function processAdminRegistration(data: AdminRegistrationData & { password?: string }) {
    let userId = data.userId;
    try {
        const { getUsers, getTablesDB } = await createAdminClient();
        const users = getUsers();
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
                const password = data.password || ("Pass123" + Math.random().toString(36).slice(-4));
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

        // 2. Use initiatePayment from payment.actions.ts
        const paymentData = {
            ...data,
            redirectUrl: "", // No redirect needed for admin modal flow, handled by JS SDK
            eventId: data.event_id, // Map for workshop
            merchId: "admin_merch", // Fallback
        };

        const paymentResult = await initiatePayment(data.type, paymentData, userId);

        if (paymentResult.success) {
            await logAction(
                "Admin Registration Initiated",
                `Initiated ${data.type} payment for user ${userId}. OrderID: ${paymentResult.orderId}`,
                userId,
                'SUCCESS'
            );
            return { success: true, data: paymentResult };
        } else {
            await logAction(
                "Admin Registration Failed",
                `Failed to initiate payment: ${paymentResult.error}`,
                userId,
                'FAILED'
            );
            return { success: false, error: paymentResult.error };
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
