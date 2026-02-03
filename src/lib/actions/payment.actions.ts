"use server";

import { createAdminClient, createSessionClient } from "../appwrite/appwrite.server";
import { appwriteConfig } from "../appwrite/appwrite.config";
import { ID, Query, ExecutionMethod } from "node-appwrite";
import { Cashfree, CFEnvironment } from "cashfree-pg"; // Import Cashfree
import { revalidatePath } from "next/cache";

// Initialize Cashfree
const cashfree = new Cashfree(
    process.env.NEXT_PUBLIC_PAYMENT_ENV === 'PRODUCTION' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX,
    process.env.CASHFREE_APP_ID || "",
    process.env.CASHFREE_SECRET_KEY || "",
    process.env.CASHFREE_API_VERSION // Optional
);

export type PaymentType = 'EVENT' | 'WORKSHOP' | 'MERCH' | 'ACCOM' | 'TICKET';

/**
 * Initiates a payment process.
 * 1. Creates the specific item record (Registration, MerchOrder, etc.)
 * 2. Creates a Cashfree Order
 * 3. Creates a Transaction record
 */
export async function initiatePayment(
    type: PaymentType,
    data: any,
    userId: string,
    amount: number
) {
    try {
        const { getFunctions } = await createSessionClient();
        const functions = getFunctions();
        const FUNCTION_ID = '697d1058001561c91266';

        // Prepare Payload
        let payload: any = { type: type };

        // Map EVENT to WORKSHOP for the function spec
        if (type === 'EVENT') {
            payload.type = 'WORKSHOP';
        }

        if (payload.type === 'WORKSHOP') {
            payload.event_id = data.eventId;
        } else if (payload.type === 'ACCOM') {
            payload.hostel = data.hostel;
            payload.day = data.day;
        } else if (payload.type === 'MERCH') {
            payload.quantity = data.quantity;
            payload.size = data.size;
        } else if (type === 'TICKET') {
            payload.tier = data.tier;
            payload.quantity = data.quantity || 1;
            payload.item_id = `ticket_${userId}`;
        }

        console.log(`[initiatePayment] Calling Appwrite Function for ${type}`, payload);

        const execution = await functions.createExecution({
            functionId: FUNCTION_ID,
            body: JSON.stringify(payload),
            async: false, // false = synchronous execution to wait for response
            xpath: '/',
            method: ExecutionMethod.POST,
            headers: { 'Content-Type': 'application/json' }
        });

        if (execution.status === 'completed') {
            const responseBody = JSON.parse(execution.responseBody);

            if (responseBody.success) {
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
                return { success: false, error: responseBody.error || "Payment initialization failed." };
            }
        } else {
            console.error("Function execution failed (status not completed):", execution);
            return { success: false, error: "System busy, please try again." };
        }

    } catch (error: any) {
        console.error("Error initiating payment via function:", error);
        return { success: false, error: error.message || "Failed to initiate payment" };
    }
}

export async function verifyCashfreePayment(orderId: string) {
    try {
        const { getTablesDB } = await createAdminClient();
        const db = getTablesDB();

        // 1. Fetch Transaction first to verify existence and type
        const list = await db.listRows(
            appwriteConfig.databaseId,
            appwriteConfig.transactionsCollectionId,
            [Query.equal("cashfree_order_id", orderId)]
        );

        if (list.total === 0) {
            return { success: false, error: "Transaction not found" };
        }
        const transaction = list.rows[0];

        // 2. Call Verification Function (For ALL types: TICKET, MERCH, WORKSHOP, ACCOM)
        try {
            const { getFunctions } = await createSessionClient();
            const functions = getFunctions();
            const FUNCTION_ID = '697d932a000da2291474';

            console.log(`[verifyCashfreePayment] Calling verification function for ${transaction.item_type}`);

            const execution = await functions.createExecution({
                functionId: FUNCTION_ID,
                body: JSON.stringify({ transactionId: transaction.$id }),
                async: false,
                xpath: '/',
                method: ExecutionMethod.POST,
                headers: { 'Content-Type': 'application/json' }
            });

            if (execution.status === 'completed') {
                const responseBody = JSON.parse(execution.responseBody);

                if (responseBody.success) {
                    console.log("[verifyCashfreePayment] Verification successful via function");

                    // 3. Post-Payment Actions (Fulfilment & Credits)
                    await handlePostPaymentActions(db, transaction);

                    return {
                        success: true,
                        paymentId: "VERIFIED_BY_FUNCTION",
                        transactionId: responseBody.transactionId
                    };
                } else {
                    console.error("[verifyCashfreePayment] Verification function returned failure:", responseBody);
                    return { success: false, error: responseBody.message || responseBody.error || "Payment verification failed" };
                }
            } else {
                console.error("[verifyCashfreePayment] Verification function execution failed:", execution);
                return { success: false, error: "System busy. Verification status unknown." };
            }

        } catch (funcErr: any) {
            console.error("[verifyCashfreePayment] Function execution error:", funcErr);
            return { success: false, error: "Verification service unavailable: " + funcErr.message };
        }

    } catch (error: any) {
        console.error("Error verifying Cashfree payment:", error);
        return { success: false, error: error.message };
    }
}

// Helper for post-payment actions
// Helper for post-payment actions
async function handlePostPaymentActions(db: any, transaction: any) {
    if (transaction.item_type === 'TICKET') {
        const tierMatch = transaction.description.match(/Tier (\d+)/);
        if (tierMatch) {
            const tier = parseInt(tierMatch[1]);
            await db.updateRow(
                appwriteConfig.databaseId,
                appwriteConfig.usersCollectionId,
                transaction.item_id.replace("ticket_", ""),
                { tier: tier }
            );
        }
        return;
    }

    // Handle MERCH, ACCOM, WORKSHOP via Fulfilment Function
    try {
        const { getFunctions } = await createSessionClient();
        const functions = getFunctions();
        const FUNCTION_ID = '697dc3e900397f2a6036';

        console.log(`[handlePostPaymentActions] Calling fulfilment function for ${transaction.item_type}`);

        const execution = await functions.createExecution({
            functionId: FUNCTION_ID,
            body: JSON.stringify({ transactionId: transaction.$id }),
            async: false,
            xpath: '/',
            method: ExecutionMethod.POST,
            headers: { 'Content-Type': 'application/json' }
        });

        if (execution.status === 'completed') {
            const responseBody = JSON.parse(execution.responseBody);

            // Check success OR "already fulfilled" error (Status 409 from function typically returns success: false)
            const isSuccess = responseBody.success;
            const isAlreadyFulfilled = !isSuccess && (responseBody.error === "Order already fulfilled" || responseBody.message === "Order already fulfilled");

            if (isSuccess || isAlreadyFulfilled) {
                console.log(`[handlePostPaymentActions] Order fulfilled for ${transaction.item_type} (Already Fulfilled: ${isAlreadyFulfilled})`);

                // WORKSHOP SPECIFIC: Award Tech Credits
                if (transaction.item_type === 'WORKSHOP') {
                    try {
                        const userId = transaction.user;
                        const userDoc = await db.getDocument(
                            appwriteConfig.databaseId,
                            appwriteConfig.usersCollectionId,
                            userId
                        );

                        if (userDoc) {
                            await db.updateRow(
                                appwriteConfig.databaseId,
                                appwriteConfig.usersCollectionId,
                                userId,
                                {
                                    credits: (userDoc.credits || 0) + 1
                                }
                            );
                            console.log(`[handlePostPaymentActions] Awarded 1 credit to user ${userId} for workshop.`);
                        }
                    } catch (err) {
                        console.error("[handlePostPaymentActions] Failed to award credit:", err);
                    }
                }

            } else {
                console.error("[handlePostPaymentActions] Fulfilment failed:", responseBody.error);
            }
        } else {
            console.error("[handlePostPaymentActions] Fulfilment execution failed status:", execution.status);
        }

    } catch (error) {
        console.error("[handlePostPaymentActions] Error calling fulfilment function:", error);
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
        case 'ACCOM':
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
