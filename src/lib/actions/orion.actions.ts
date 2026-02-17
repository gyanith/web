"use server";

import { createAdminClient } from "../appwrite/appwrite.server";
import { appwriteConfig } from "../appwrite/appwrite.config";
import { ID, Query } from "node-appwrite";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import { logAction } from "@/lib/logger";

// Initialize Cashfree for Orion
const orionCashfree = new Cashfree(
    process.env.NEXT_PUBLIC_PAYMENT_ENV === 'PRODUCTION' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX,
    process.env.ORION_CASHFREE_APP_ID || "",
    process.env.ORION_CASHFREE_SECRET_KEY || "",
    process.env.CASHFREE_API_VERSION
);

export async function initiateOrionPayment(
    data: { teamId: string; amount: number; mobile: string; email: string; name: string; redirectUrl: string },
    userId: string
) {
    try {
        const orderId = `orion_${data.teamId}_${ID.unique().substring(0, 8)}`; // Unique Order ID
        const customerId = userId;

        const request = {
            order_amount: data.amount,
            order_currency: "INR",
            order_id: orderId,
            customer_details: {
                customer_id: customerId,
                customer_phone: data.mobile,
                customer_name: data.name,
                customer_email: data.email,
            },
            order_meta: {
                return_url: data.redirectUrl,
                notify_url: "https://gyanith.org/api/cashfree/webhook" // Placeholder, maybe redundant if we verify manually
            },
            order_note: `Orion Registration for Team ${data.teamId}`
        };

        console.log("[initiateOrionPayment] Creating Order:", request);

        const response = await orionCashfree.PGCreateOrder(request);
        const orderData = response.data;

        // Create Transaction Record (Pending)
        const { getTablesDB } = await createAdminClient();
        const db = getTablesDB();

        await db.createRow(
            appwriteConfig.databaseId,
            appwriteConfig.transactionsCollectionId,
            ID.unique(),
            {
                user: userId,
                amount: data.amount,
                // type: "ORION", // Removed as per screenshot
                status: "PENDING",
                mode: "CF",
                cashfree_order_id: orderId,
                // payment_session_id: orderData.payment_session_id, // Removed as per screenshot
                item_id: data.teamId,
                item_type: "ORION",
                description: `Orion Reg - Team ${data.teamId}`
            }
        );

        return {
            success: true,
            paymentSessionId: orderData.payment_session_id,
            orderId: orderId,
        };

    } catch (error: any) {
        console.error("Failed to initiate Orion payment:", error.response?.data || error.message);
        return { success: false, error: error.message || "Payment initiation failed" };
    }
}

export async function verifyOrionPayment(orderId: string) {
    try {
        const response = await orionCashfree.PGFetchOrder(orderId);
        const orderData = response.data;

        if (orderData.order_status === "PAID") {
            const { getTablesDB } = await createAdminClient();
            const db = getTablesDB();

            // Update Transaction
            const transactions = await db.listRows(
                appwriteConfig.databaseId,
                appwriteConfig.transactionsCollectionId,
                [Query.equal("cashfree_order_id", orderId)]
            );

            if (transactions.total > 0) {
                const transaction = transactions.rows[0];
                if (transaction.status !== "SUCCESS") {
                    await db.updateRow(
                        appwriteConfig.databaseId,
                        appwriteConfig.transactionsCollectionId,
                        transaction.$id,
                        { status: "SUCCESS" }
                    );
                }
            }

            return { success: true };
        } else {
            return { success: false, status: orderData.order_status };
        }

    } catch (error: any) {
        console.error("Failed to verify Orion payment:", error);
        return { success: false, error: error.message };
    }
}

export async function saveOrionIdea(teamId: string, idea: string, abstract: string) {
    try {
        const { getTablesDB } = await createAdminClient();
        const db = getTablesDB();

        await db.updateRow(
            appwriteConfig.databaseId,
            appwriteConfig.eventTeamsCollectionId,
            teamId,
            {
                orion_idea: idea,
                // Assuming we might store abstract in misc_data or a new column if exists, 
                // for now sticking to the user request 'orion_idea' column.
                // If abstract is needed, we could append it or use another field.
                // Let's assume 'orion_idea' stores the combined text or just the idea for now.
            }
        );

        return { success: true };
    } catch (error: any) {
        console.error("Failed to save idea:", error);
        return { success: false, error: error.message };
    }
}
