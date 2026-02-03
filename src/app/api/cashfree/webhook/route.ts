
import { NextRequest, NextResponse } from "next/server";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import { createAdminClient } from "@/lib/appwrite/appwrite.server";
import { appwriteConfig } from "@/lib/appwrite/appwrite.config";
import { ID, Query } from "node-appwrite";

// Set Config for Verification
// @ts-ignore
Cashfree.XClientId = process.env.CASHFREE_APP_ID!;
// @ts-ignore
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY!;
// @ts-ignore
Cashfree.XEnvironment = process.env.NEXT_PUBLIC_PAYMENT_ENV === 'PRODUCTION' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;

export async function POST(req: NextRequest) {
    try {
        const signature = req.headers.get("x-webhook-signature");
        const timestamp = req.headers.get("x-webhook-timestamp");

        // IMPORTANT: Get raw body as text for signature verification
        const rawBody = await req.text();

        if (!signature || !timestamp) {
            return NextResponse.json({ message: "Missing headers" }, { status: 400 });
        }

        // Verify Signature
        try {
            // @ts-ignore
            (Cashfree as any).PGVerifyWebhookSignature(signature, rawBody, timestamp);
        } catch (err: any) {
            console.error("Webhook Signature Verification Failed", err);
            return NextResponse.json({
                message: "Invalid signature",
                error: err.message,
                stack: err.stack,
                // @ts-ignore
                methodExists: typeof (Cashfree as any).PGVerifyWebhookSignature === 'function'
            }, { status: 403 });
        }

        const body = JSON.parse(rawBody);
        const type = body.type;

        if (type === "PAYMENT_SUCCESS_WEBHOOK") {
            const orderId = body.data.order.order_id;
            const paymentStatus = body.data.payment.payment_status;

            if (paymentStatus === "SUCCESS") {
                await fulfillOrder(orderId, body.data.payment.cf_payment_id);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

async function fulfillOrder(orderId: string, paymentId: string) {
    const { getTablesDB } = await createAdminClient();
    const db = getTablesDB();

    console.log(`[Webhook] Processing fulfillment for Cashfree Order ID: ${orderId}`);

    // 1. Fetch Transaction using cashfree_order_id
    const list = await db.listRows(
        appwriteConfig.databaseId,
        appwriteConfig.transactionsCollectionId,
        [Query.equal("cashfree_order_id", orderId)]
    );

    if (list.total === 0) {
        console.error(`[Webhook] Transaction not found for orderId: ${orderId}`);
        return;
    }

    const transaction = list.rows[0];
    const transactionId = transaction.$id;

    console.log(`[Webhook] Found Transaction: ${transactionId} (Current Status: ${transaction.status})`);

    // 2. Update Transaction Status if not already SUCCESS
    if (transaction.status !== "SUCCESS") {
        await db.updateRow(
            appwriteConfig.databaseId,
            appwriteConfig.transactionsCollectionId,
            transactionId,
            {
                status: "SUCCESS",
                cashfree_payment_id: paymentId
            }
        );
        console.log(`[Webhook] Updated Transaction ${transactionId} to SUCCESS`);
    } else {
        console.log(`[Webhook] Transaction ${transactionId} already SUCCESS. Ensuring item fulfillment.`);
    }

    // 3. Fulfill Item Logic
    const itemType = transaction.item_type;
    const itemId = transaction.item_id;
    const userId = transaction.user; // User ID from transaction

    console.log(`[Webhook] Fulfilling order for ${itemType} - ${itemId}`);

    try {
        // --- TICKET ---
        if (itemType === 'TICKET') {
            const tierMatch = transaction.description.match(/Tier (\d+)/);
            if (tierMatch) {
                const tier = parseInt(tierMatch[1]);
                // Ticket ID usually contains user ID, e.g., 'ticket_userId'
                // Assuming logic matches payment.actions.ts
                const targetUserId = itemId.replace("ticket_", "");

                await db.updateRow(
                    appwriteConfig.databaseId,
                    appwriteConfig.usersCollectionId,
                    targetUserId,
                    { tier: tier }
                );
                console.log(`[Webhook] Updated Tier to ${tier} for user ${targetUserId}`);
            }
        }

        // --- MERCH ---
        else if (itemType === 'MERCH') {
            const merchOrder = await db.getRow(
                appwriteConfig.databaseId,
                appwriteConfig.merchCollectionId,
                itemId
            );

            if (merchOrder && merchOrder.status !== "SUCCESS") {
                await db.updateRow(
                    appwriteConfig.databaseId,
                    appwriteConfig.merchCollectionId,
                    itemId,
                    { status: "SUCCESS" }
                );
                console.log(`[Webhook] Merch order ${itemId} marked SUCCESS`);
            }
        }

        // --- ACCOM ---
        else if (itemType === 'ACCOMM' || itemType === 'ACCOM') {
            const accomOrder = await db.getRow(
                appwriteConfig.databaseId,
                appwriteConfig.accommodationCollectionId,
                itemId
            );

            if (accomOrder && accomOrder.status !== "SUCCESS") {
                await db.updateRow(
                    appwriteConfig.databaseId,
                    appwriteConfig.accommodationCollectionId,
                    itemId,
                    { status: "SUCCESS" }
                );
                console.log(`[Webhook] Accommodation order ${itemId} marked SUCCESS`);
            }
        }

        // --- WORKSHOP ---
        else if (itemType === 'WORKSHOP') {
            // Check if registration exists
            const existingReg = await db.listRows(
                appwriteConfig.databaseId,
                appwriteConfig.registrationsCollectionId,
                [
                    Query.equal('event_id', itemId),
                    Query.equal('user_id', userId)
                ]
            );

            if (existingReg.total === 0) {
                // Create Registration
                await db.createRow(
                    appwriteConfig.databaseId,
                    appwriteConfig.registrationsCollectionId,
                    ID.unique(),
                    {
                        event_id: itemId,
                        user_id: userId
                    }
                );
                console.log(`[Webhook] Created registration for Workshop ${itemId}`);
            } else {
                console.log(`[Webhook] Registration already exists for Workshop ${itemId}`);
            }

            // Award Tech Credit
            const userDoc = await db.getRow(
                appwriteConfig.databaseId,
                appwriteConfig.usersCollectionId,
                userId
            );

            if (userDoc) {
                const newCredits = (userDoc.credits || 0) + 1;
                await db.updateRow(
                    appwriteConfig.databaseId,
                    appwriteConfig.usersCollectionId,
                    userId,
                    {
                        credits: newCredits
                    }
                );
                console.log(`[Webhook] Awarded Tech Credit to user ${userId}. New Total: ${newCredits}`);
            }
        }

    } catch (fulfillErr: any) {
        console.error("[Webhook] Fulfillment Error Details:", fulfillErr);
    }
}
