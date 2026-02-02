"use server";

import { createAdminClient, createSessionClient } from "../appwrite/appwrite.server";
import { appwriteConfig } from "../appwrite/appwrite.config";
import { ID, Query } from "node-appwrite";
import Razorpay from "razorpay";
import { Cashfree, CFEnvironment } from "cashfree-pg"; // Import Cashfree
import crypto from "crypto";
import { revalidatePath } from "next/cache";

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

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
 * 2. Creates a Razorpay/Cashfree Order
 * 3. Creates a Transaction record
 */
export async function initiatePayment(
    type: PaymentType,
    data: any,
    userId: string,
    amount: number
) {
    try {
        const { getTablesDB, getUsers } = await createAdminClient();
        const db = getTablesDB();
        const users = getUsers();

        console.log(`[initiatePayment] Starting ${type} payment for user ${userId}`);

        // Fetch user details for Cashfree (required)
        let user;
        try {
            user = await users.get(userId);
        } catch (e) {
            console.error("Failed to fetch user details for payment", e);
            user = { name: "User", email: "test@example.com", phone: "9999999999" };
        }

        const userPhone = user.phone || "9999999999";
        const userEmail = user.email || "test@example.com";

        // 1. Create the specific item record
        let itemId = "";

        switch (type) {
            case 'EVENT':
            case 'WORKSHOP':
                // Check if already registered
                const existingReg = await db.listRows(
                    appwriteConfig.databaseId,
                    appwriteConfig.registrationsCollectionId,
                    [
                        Query.equal("event_id", data.eventId),
                        Query.equal("user_id", userId)
                    ]
                );

                if (existingReg.total > 0) {
                    throw new Error("Already registered for this event.");
                }

                // Create Registration
                const regPrefix = type === 'WORKSHOP' ? 'workshop_' : 'registration_';
                const regId = regPrefix + ID.unique();

                const reg = await db.createRow(
                    appwriteConfig.databaseId,
                    appwriteConfig.registrationsCollectionId,
                    regId,
                    {
                        event_id: data.eventId,
                        user_id: userId,
                    }
                );
                itemId = reg.$id;
                break;

            case 'ACCOM':
                const accomId = 'accom_' + ID.unique();
                const accom = await db.createRow(
                    appwriteConfig.databaseId,
                    appwriteConfig.accommodationCollectionId,
                    accomId,
                    {
                        user_id: userId,
                        hostel: data.hostel,
                        day: data.day,
                    }
                );
                itemId = accom.$id;
                break;

            case 'MERCH':
                const merchId = 'merch_' + ID.unique();
                const merch = await db.createRow(
                    appwriteConfig.databaseId,
                    appwriteConfig.merchCollectionId,
                    merchId,
                    {
                        user_id: userId,
                        quantity: data.quantity,
                        size: data.size,
                    }
                );
                itemId = merch.$id;
                break;

            case 'TICKET':
                itemId = `ticket_${userId}`;
                break;
        }

        const gateway = process.env.NEXT_PUBLIC_PAYMENT_GATEWAY === "CASHFREE" ? "CASHFREE" : "RAZORPAY";
        let orderId = "";
        let paymentSessionId = "";
        let orderCurrency = "INR";

        if (gateway === "CASHFREE") {
            // Determine return URL
            let baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
            // Enforce HTTPS for Cashfree if not explicitly explicitly localhost (though user said prod is https)
            // Or simply replace http:// with https:// which handles both if the user is testing on a real server that might suffer from mixed content config or bad env var.
            if (process.env.NODE_ENV === "production" && baseUrl.startsWith("http://")) {
                baseUrl = baseUrl.replace("http://", "https://");
            }
            // Actually, simply replacing it is safer for Cashfree compliance
            if (baseUrl.startsWith("http://") && !baseUrl.includes("localhost")) {
                baseUrl = baseUrl.replace("http://", "https://");
            }

            let returnUrl = `${baseUrl}/api/payment/callback?order_id={order_id}`;
            if (data?.redirectUrl) {
                let redirectBase = data.redirectUrl;
                if (redirectBase.startsWith("http://") && !redirectBase.includes("localhost")) {
                    redirectBase = redirectBase.replace("http://", "https://");
                }
                const hasParams = redirectBase.includes("?");
                returnUrl = `${redirectBase}${hasParams ? "&" : "?"}order_id={order_id}`;
            }

            // Create Cashfree Order
            const request: any = {
                order_amount: amount,
                order_currency: "INR",
                customer_details: {
                    customer_id: userId,
                    customer_name: user.name || "User",
                    customer_email: userEmail,
                    customer_phone: userPhone,
                },
                order_meta: {
                    return_url: returnUrl,
                    notify_url: `${baseUrl}/api/payment/webhook`,
                },
                order_note: `Payment for ${type}`,
                order_tags: {
                    paymentType: type,
                    userId: userId,
                    itemId: itemId
                }
            };

            try {
                // Cashfree SDK V4: first arg is request
                const response = await cashfree.PGCreateOrder(request);
                orderId = response.data.order_id || "";
                paymentSessionId = response.data.payment_session_id || "";
            } catch (error: any) {
                console.error("Cashfree Order Creation Error:", error.response?.data || error);

                // Rollback: Delete the item created in Step 1
                await rollbackItem(db, type, itemId);

                throw new Error("Failed to create Cashfree order: " + (error.response?.data?.message || error.message));
            }
        } else {
            // Create Razorpay Order
            const orderOptions = {
                amount: amount * 100, // amount in smallest currency unit (paise)
                currency: "INR",
                receipt: `receipt_${Date.now()}_${userId.substring(0, 5)}`,
                notes: {
                    paymentType: type,
                    userId: userId,
                    itemId: itemId
                }
            };

            const order = await razorpay.orders.create(orderOptions);
            orderId = order.id;
            orderCurrency = orderOptions.currency;
        }

        // 3. Create Transaction Record
        let transaction;
        try {
            transaction = await db.createRow(
                appwriteConfig.databaseId,
                appwriteConfig.transactionsCollectionId,
                ID.unique(),
                {
                    user: userId,
                    amount: amount,
                    item_type: type,
                    item_id: itemId,
                    status: "PENDING",
                    razorpay_order_id: orderId, // Storing orderId here (reused column for now)
                    razorpay_payment_id: "WAITING",
                    mode: gateway === "CASHFREE" ? "CF" : "RZR",
                    description: `Payment for ${type}`
                }
            );
        } catch (txError) {
            console.error("Failed to create transaction record. Rolling back item creation.", txError);
            // Rollback: Delete the item created in Step 1
            if (itemId && !itemId.startsWith("ticket_")) {
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
                    await db.deleteRow(appwriteConfig.databaseId, collectionId, itemId);
                }
            }
            throw txError;
        }

        // 4. Update item with transaction_id
        try {
            if (transaction && (type === 'ACCOM' || type === 'MERCH')) {
                const collectionId = type === 'ACCOM' ? appwriteConfig.accommodationCollectionId : appwriteConfig.merchCollectionId;
                await db.updateRow(
                    appwriteConfig.databaseId,
                    collectionId,
                    itemId,
                    { transaction_id: transaction.$id }
                );
            }
        } catch (updateError) {
            console.error("Failed to link transaction ID.", updateError);
        }

        return {
            success: true,
            provider: gateway,
            orderId: orderId,
            paymentSessionId: paymentSessionId, // Only for Cashfree
            amount: amount,
            currency: orderCurrency,
            transactionId: transaction.$id
        };

    } catch (error: any) {
        console.error("Error initiating payment:", error);
        return { success: false, error: error.message || "Failed to initiate payment" };
    }
}

/**
 * Verifies a Razorpay payment.
 */
export async function verifyPayment(
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string
) {
    try {
        const { getTablesDB } = await createAdminClient();
        const db = getTablesDB();

        // 1. Verify Signature
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature !== expectedSign) {
            console.error("Invalid Razorpay Signature");
            await cancelPayment(razorpay_order_id);
            return { success: false, error: "Invalid signature" };
        }

        // 2. Update Transaction to SUCCESS
        const transaction = await updateTransactionStatus(razorpay_order_id, "SUCCESS", razorpay_payment_id);

        if (!transaction) {
            throw new Error("Transaction not found for this order ID");
        }

        // 3. Post-Payment Actions
        await handlePostPaymentActions(db, transaction);

        return { success: true };

    } catch (error: any) {
        console.error("Error verifying payment:", error);
        return { success: false, error: error.message || "Verification failed" };
    }
}

export async function verifyCashfreePayment(orderId: string) {
    try {
        const { getTablesDB } = await createAdminClient();
        const db = getTablesDB();

        const response = await cashfree.PGOrderFetchPayments(orderId);
        // Find a successful payment
        const payments = response.data;
        const successPayment = payments?.find((p: any) => p.payment_status === "SUCCESS");

        if (successPayment) {
            const transaction = await updateTransactionStatus(orderId, "SUCCESS", successPayment.cf_payment_id || "CF_SUCCESS");
            if (!transaction) throw new Error("Transaction not found");

            await handlePostPaymentActions(db, transaction);
            return { success: true, paymentId: successPayment.cf_payment_id };
        } else {
            console.log("No successful Cashfree payment found. Rolling back...");
            await cancelPayment(orderId);
            return { success: false, error: "Payment failed or cancelled." };
        }
    } catch (error: any) {
        console.error("Error verifying Cashfree payment:", error);
        return { success: false, error: error.message };
    }
}

// Helper for post-payment actions
async function handlePostPaymentActions(db: any, transaction: any) {
    switch (transaction.item_type) {
        case 'TICKET':
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
            break;
        case 'EVENT':
        case 'WORKSHOP':
        case 'ACCOM':
        case 'MERCH':
            break;
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
            [Query.equal("razorpay_order_id", orderId)]
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

        // Rollback: Delete the created item
        if (transaction.item_id && !transaction.item_id.startsWith("ticket_")) {
            let collectionId = "";
            switch (transaction.item_type) {
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
                    await db.deleteRow(
                        appwriteConfig.databaseId,
                        collectionId,
                        transaction.item_id
                    );
                    console.log(`[cancelPayment] Rolled back item ${transaction.item_id}`);
                } catch (delError) {
                    console.error(`[cancelPayment] Failed to rollback item ${transaction.item_id}:`, delError);
                }
            }
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
        [Query.equal("razorpay_order_id", orderId)]
    );

    if (list.total === 0) return null;

    const transaction = list.rows[0];

    return await db.updateRow(
        appwriteConfig.databaseId,
        appwriteConfig.transactionsCollectionId,
        transaction.$id,
        {
            status: status,
            razorpay_payment_id: paymentId
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
