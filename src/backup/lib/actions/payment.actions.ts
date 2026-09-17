// "use server"; // latent for static export

import { createAdminClient, createSessionClient } from "../appwrite/appwrite.server";
import { appwriteConfig } from "../appwrite/appwrite.config";
import { ID, Query, ExecutionMethod } from "node-appwrite";
import { Cashfree, CFEnvironment } from "cashfree-pg"; // Import Cashfree
import { revalidatePath } from "next/cache";
import { logAction } from "@/backup/lib/logger";

// Initialize Cashfree
const cashfree = new Cashfree(
    process.env.NEXT_PUBLIC_PAYMENT_ENV === 'PRODUCTION' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX,
    process.env.CASHFREE_APP_ID || "",
    process.env.CASHFREE_SECRET_KEY || "",
    process.env.CASHFREE_API_VERSION // Optional
);

import { ICDTSES_EVENT_ID } from "@/backup/lib/constants";

// export const ICDTSES_EVENT_ID = "tech_6994b818002154469eb4"; // Moved to constants.ts

export type PaymentType = 'EVENT' | 'WORKSHOP' | 'MERCH' | 'ACCOMM' | 'TICKET' | 'CONFERENCE';

/**
 * Initiates a payment process.
 * 1. Creates the specific item record (Registration, MerchOrder, etc.)
 * 2. Creates a Cashfree Order
 * 3. Creates a Transaction record
 */
export async function initiatePayment(
    type: PaymentType,
    data: any,
    userId?: string, // Made optional for Guest checkout
) {
    try {
        // Use Admin Client to invoke function (works for Guest or User)
        // Previously used Session Client, but Admin is safer for server-side trigger ensuring execution

        // Always use Admin client for function execution to ensure sufficient privileges 
        // and consistent userId passing via payload.
        const admin = await createAdminClient();
        const functions = admin.getFunctions();
        const FUNCTION_ID = '697d1058001561c91266';

        // 🚨 PRE-CHECK: Slots for Accommodation
        if (type === 'ACCOMM') {
            const { getTablesDB } = await createAdminClient();
            const db = getTablesDB();
            const list = await db.listRows(
                appwriteConfig.databaseId,
                appwriteConfig.accommDetailsCollectionId,
                [Query.equal("hostel", data.hostel)]
            );

            if (list.total > 0) {
                const hostelData = list.rows[0];
                if (hostelData.slots <= 0) {
                    return { success: false, error: `No slots available for ${data.hostel}` };
                }
            } else {
                return { success: false, error: "Invalid hostel selected" };
            }

            if (!userId) return { success: false, error: "User Login required for Accommodation" };

            // Check if user has already booked accommodation
            const userBookings = await db.listRows(
                appwriteConfig.databaseId,
                appwriteConfig.accommodationCollectionId,
                [Query.equal("user_id", userId), Query.equal("status", "SUCCESS")]
            );

            if (userBookings.total > 0) {
                return { success: false, error: "User has already booked accommodation" };
            }
        }

        // Prepare Payload
        let payload: any = {
            type: type,
            return_url: data.redirectUrl, // Pass redirectUrl as return_url
            userId: userId // Explicitly pass userId for Admin Client calls
        };

        if (payload.type === 'WORKSHOP' || payload.type === 'EVENT') {
            payload.event_id = data.eventId;
        } else if (payload.type === 'CONFERENCE') {
            payload.event_id = data.eventId;
            if (data.eventId === ICDTSES_EVENT_ID) {
                payload.user_type = data.userType;
                payload.paper_id = data.paperId;
                payload.name = data.name;
                payload.email = data.email;
            }
        } else if (payload.type === 'ACCOMM') {
            payload.hostel = data.hostel;
            payload.day = data.day;
        } else if (payload.type === 'MERCH') {
            payload.quantity = data.quantity;
            payload.size = data.size;
        } else if (type === 'TICKET') {
            if (!userId) return { success: false, error: "User ID required for Tickets" };
            payload.tier = data.tier;
            payload.quantity = data.quantity || 1;
            // Encode tier in item_id: ticket_USERID_TIER
            payload.item_id = `ticket_${userId}_${data.tier}`;
            payload.description = `Gyanith Ticket - Tier ${data.tier}`;
        }

        console.log(`[initiatePayment] Calling Appwrite Function for ${type}`, JSON.stringify(payload, null, 2));

        const execution = await functions.createExecution({
            functionId: FUNCTION_ID,
            body: JSON.stringify(payload),
            async: false, // false = synchronous execution to wait for response
            xpath: '/',
            method: ExecutionMethod.POST,
            headers: { 'Content-Type': 'application/json' }
        });

        console.log(`[initiatePayment] Execution Status: ${execution.status}`);
        console.log(`[initiatePayment] Raw Response Body:`, execution.responseBody);

        if (execution.status === 'completed') {
            const responseBody = JSON.parse(execution.responseBody);

            if (responseBody.success) {
                if (userId) {
                    await logAction(
                        "Payment Initiated",
                        `Initiated ${type} payment for user ${userId}. OrderID: ${responseBody.orderId}`,
                        userId,
                        'INFO'
                    );
                }
                return {
                    success: true,
                    provider: "CASHFREE",
                    orderId: responseBody.orderId,
                    paymentSessionId: responseBody.paymentSessionId,
                    amount: responseBody.amount,
                    currency: "INR",
                    transactionId: responseBody.transactionId
                };
            } else {
                console.error("Function execution returned error:", responseBody);
                if (userId) {
                    await logAction(
                        "Payment Init Failed",
                        `Failed to initiate ${type} payment for user ${userId}: ${responseBody.error} | Payload: ${JSON.stringify(payload)}`,
                        userId,
                        'FAILED'
                    );
                }
                return { success: false, error: responseBody.error || "Payment initialization failed." };
            }
        } else {
            console.error("Function execution failed:", execution);
            return {
                success: false,
                error: `Payment service error (Status: ${execution.status}). Please check admin logs.`
            };
        }

    } catch (error: any) {
        console.error("Error initiating payment via function:", error);

        // Detailed Debug Logging for Server Side Issues
        if (process.env.NODE_ENV === 'production') {
            const hasApiKey = !!process.env.APPWRITE_API_KEY;
            const hasProjectId = !!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
            console.error(`[initiatePayment] Environment Check: API_KEY=${hasApiKey}, PROJECT_ID=${hasProjectId}`);

            if (!hasApiKey) {
                return { success: false, error: "Server Configuration Error: Missing API Key" };
            }
        }

        return { success: false, error: error.message || "Failed to initiate payment" };
    }
}

export async function verifyCashfreePayment(orderId: string) {
    try {
        const { getTablesDB } = await createAdminClient();
        const db = getTablesDB();

        // 1. Fetch Transaction (regardless of status to allow reconciliation)
        const list = await db.listRows(
            appwriteConfig.databaseId,
            appwriteConfig.transactionsCollectionId,
            [Query.equal("cashfree_order_id", orderId)]
        );

        if (list.total === 0) {
            await logAction("Payment Verification Failed", `Transaction not found for OrderID: ${orderId}`, undefined, 'FAILED');
            return { success: false, error: "Transaction unsuccessful" };
        }
        const transaction = list.rows[0];

        // 2. If already SUCCESS, just return
        if (transaction.status === "SUCCESS") {
            return { success: true, transactionId: transaction.$id };
        }

        // 3. Reconciliation: Check Cashfree API if not SUCCESS in our DB
        console.log(`[verifyCashfreePayment] Reconciling order ${orderId}...`);
        try {
            const response = await cashfree.PGOrderFetchPayments(orderId);
            const payments = response.data; // Array of PaymentEntity

            const successPayment = payments.find((p: any) => p.payment_status === "SUCCESS");

            if (successPayment) {
                console.log(`[verifyCashfreePayment] Found successful payment in Cashfree for ${orderId}. Updating DB...`);

                // Update Transaction Status
                await db.updateRow(
                    appwriteConfig.databaseId,
                    appwriteConfig.transactionsCollectionId,
                    transaction.$id,
                    {
                        status: "SUCCESS",
                        cashfree_payment_id: successPayment.cf_payment_id
                    }
                );

                // Trigger Fulfillment
                const { processFulfillment } = await import("@/backup/lib/fulfillment");
                await processFulfillment(db, transaction, transaction.user);

                await logAction("Payment Reconciled", `Order ${orderId} verified and reconciled to SUCCESS`, transaction.user, 'SUCCESS');

                return { success: true, transactionId: transaction.$id };
            }
        } catch (cfError: any) {
            console.error("[verifyCashfreePayment] Reconciliation failed:", cfError.message);
        }

        return { success: false, error: "Transaction pending or failed" };

    } catch (error: any) {
        console.error("Error verifying Cashfree payment:", error);
        return { success: false, error: error.message };
    }
}

// Helper for post-payment actions
// Helper for post-payment actions
async function handlePostPaymentActions(db: any, transaction: any) {
    try {
        const { processFulfillment } = await import("@/backup/lib/fulfillment");
        await processFulfillment(db, transaction, transaction.user);
    } catch (error) {
        console.error("[handlePostPaymentActions] Error:", error);
    }
}

export async function cancelPayment(orderId: string) {
    try {
        const { getTablesDB } = await createAdminClient();
        const db = getTablesDB();

        console.log(`[cancelPayment] Cancelling order ${orderId}`);

        const list = await db.listRows(
            appwriteConfig.databaseId,
            appwriteConfig.transactionsCollectionId,
            [Query.equal("cashfree_order_id", orderId)]
        );

        if (list.total === 0) {
            console.error("Transaction not found for cancellation");
            return { success: false, error: "Transaction not found" };
        }

        const transaction = list.rows[0];

        await db.updateRow(
            appwriteConfig.databaseId,
            appwriteConfig.transactionsCollectionId,
            transaction.$id,
            { status: "FAILED" }
        );

        // Rollback: Delete the created item (using helper)
        if (transaction.item_id) {
            await rollbackItem(db, transaction.item_type as PaymentType, transaction.item_id);
        }

        await logAction("Payment Cancelled", `Cancelled payment order ${orderId}`, transaction.user, 'INFO');

        return { success: true };

    } catch (error: any) {
        console.error("Error cancelling payment:", error);
        return { success: false, error: error.message };
    }
}

async function updateTransactionStatus(orderId: string, status: string, paymentId: string) {
    const { getTablesDB } = await createAdminClient();
    const db = getTablesDB();

    const list = await db.listRows(
        appwriteConfig.databaseId,
        appwriteConfig.transactionsCollectionId,
        [Query.equal("cashfree_order_id", orderId)]
    );

    if (list.total === 0) return null;

    const transaction = list.rows[0];

    return await db.updateRow(
        appwriteConfig.databaseId,
        appwriteConfig.transactionsCollectionId,
        transaction.$id,
        {
            status: status,
            cashfree_payment_id: paymentId
        }
    );
}

// Helper for rollback
async function rollbackItem(db: any, type: PaymentType, itemId: string) {
    if (!itemId || itemId.startsWith("ticket_")) return; // Tickets don't have a separate collection like others, or handled differently

    let collectionId = "";
    switch (type) {
        case 'EVENT':
        case 'WORKSHOP':
            collectionId = appwriteConfig.registrationsCollectionId;
            break;
        case 'ACCOMM':
            collectionId = appwriteConfig.accommodationCollectionId;
            break;
        case 'MERCH':
            collectionId = appwriteConfig.merchCollectionId;
            break;
    }

    if (collectionId) {
        try {
            await db.deleteRow(appwriteConfig.databaseId, collectionId, itemId);
            console.log(`[rollbackItem] Successfully deleted item ${itemId} after payment failure.`);
        } catch (delError) {
            console.error(`[rollbackItem] FAILED to delete item ${itemId}:`, delError);
        }
    }
}


export async function getUserAccommodation(userId: string) {
    try {
        const { getTablesDB } = await createAdminClient();
        const db = getTablesDB();

        const list = await db.listRows(
            appwriteConfig.databaseId,
            appwriteConfig.accommodationCollectionId,
            [Query.equal("user_id", userId), Query.equal("status", "SUCCESS")]
        );

        if (list.total > 0) {
            return list.rows[0];
        }
        return null;
    } catch (error) {
        console.error("Error fetching user accommodation:", error);
        return null;
    }
}

export async function checkEventPaymentStatus(userId: string, eventId: string) {
    try {
        const { getTablesDB } = await createAdminClient();
        const db = getTablesDB();

        const list = await db.listRows(
            appwriteConfig.databaseId,
            appwriteConfig.transactionsCollectionId,
            [
                Query.equal("user", userId),
                Query.equal("item_id", eventId),
                Query.equal("status", "SUCCESS")
            ]
        );

        return list.total > 0;
    } catch (error) {
        console.error("Error checking payment status:", error);
        return false;
    }
}
