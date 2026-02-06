
import { NextRequest, NextResponse } from "next/server";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import { createAdminClient } from "@/lib/appwrite/appwrite.server";
import { appwriteConfig } from "@/lib/appwrite/appwrite.config";
import { ID, Query } from "node-appwrite";
import { logAction } from "@/lib/logger";

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
            const crypto = require('crypto');
            // Cashfree usually signs 'timestamp + rawBody' according to recent docs.
            // Ensure we use the exact same secret key as configured.
            const secret = process.env.CASHFREE_SECRET_KEY!;
            const payload = timestamp + rawBody;
            const generatedSignature = crypto.createHmac('sha256', secret)
                .update(payload)
                .digest('base64');

            if (generatedSignature !== signature) {
                // Debugging help: Log what we generated vs received
                console.error(`Signature Mismatch. \nReceived: ${signature}\nGenerated: ${generatedSignature}\nTimestamp: ${timestamp}`);
                await logAction("Webhook Failed", "Signature Mismatch", undefined, 'FAILED');
                throw new Error("Signature Mismatch");
            }
        } catch (err: any) {
            console.error("Webhook Signature Verification Failed", err);
            return NextResponse.json({
                message: "Invalid signature",
                error: err.message,
            }, { status: 403 });
        }

        const body = JSON.parse(rawBody);
        const type = body.type;
        const logs: string[] = [];

        let fulfillmentResult = { status: "skipped", message: "Not a success webhook" };

        if (type === "PAYMENT_SUCCESS_WEBHOOK") {
            const orderId = body.data.order.order_id;
            const paymentStatus = body.data.payment.payment_status;

            if (paymentStatus === "SUCCESS") {
                fulfillmentResult = await fulfillOrder(orderId, body.data.payment.cf_payment_id, logs);
            } else {
                fulfillmentResult = { status: "skipped", message: `Payment status is ${paymentStatus}` };
            }
        }

        return NextResponse.json({
            success: true,
            fulfillment: fulfillmentResult,
            logs: logs
        });
    } catch (error: any) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ message: error.message, stack: error.stack }, { status: 500 });
    }
}

async function fulfillOrder(orderId: string, paymentId: string, logs: string[]) {
    const { getTablesDB } = await createAdminClient();
    const db = getTablesDB();

    logs.push(`Processing fulfillment for Cashfree Order ID: ${orderId}`);
    console.log(`[Webhook] Processing fulfillment for Cashfree Order ID: ${orderId}`);

    // 1. Fetch Transaction using cashfree_order_id
    const list = await db.listRows(
        appwriteConfig.databaseId,
        appwriteConfig.transactionsCollectionId,
        [Query.equal("cashfree_order_id", orderId)]
    );

    if (list.total === 0) {
        logs.push(`Transaction not found for orderId: ${orderId}`);
        console.error(`[Webhook] Transaction not found for orderId: ${orderId}`);
        return { status: "failed", message: "Transaction not found in Appwrite" };
    }

    const transaction = list.rows[0];
    const transactionId = transaction.$id;

    logs.push(`Found Transaction: ${transactionId} (Current Status: ${transaction.status})`);
    console.log(`[Webhook] Found Transaction: ${transactionId} (Current Status: ${transaction.status})`);

    // 2. Update Transaction Status if not already SUCCESS
    if (transaction.status !== "SUCCESS") {
        await db.updateRow(
            appwriteConfig.databaseId,
            appwriteConfig.transactionsCollectionId,
            transactionId,
            {
                status: "SUCCESS",
            }
        );
        logs.push(`Updated Transaction ${transactionId} to SUCCESS`);
        console.log(`[Webhook] Updated Transaction ${transactionId} to SUCCESS`);
    } else {
        logs.push(`Transaction ${transactionId} already SUCCESS.`);
        console.log(`[Webhook] Transaction ${transactionId} already SUCCESS. Ensuring item fulfillment.`);
    }

    // 3. Fulfill Item Logic
    const itemType = transaction.item_type;
    const itemId = transaction.item_id;
    const userId = transaction.user; // User ID from transaction

    logs.push(`Fulfilling order for Item Type: ${itemType}, Item ID: ${itemId}, User ID: ${userId}`);
    console.log(`[Webhook] Fulfilling order for ${itemType} - ${itemId}`);

    try {
        // --- TICKET ---
        if (itemType === 'TICKET') {
            let tier = 0;

            // 1. Try parsing from item_id: ticket_USERID_TIER
            const lastUnderscoreIndex = itemId.lastIndexOf('_');
            if (lastUnderscoreIndex !== -1) {
                const suffix = itemId.substring(lastUnderscoreIndex + 1);
                if (!isNaN(parseInt(suffix))) {
                    tier = parseInt(suffix);
                }
            }

            // 2. Fallback: Parse from description
            if (tier === 0 && transaction.description) {
                const tierMatch = transaction.description.match(/Tier (\d+)/);
                if (tierMatch) {
                    tier = parseInt(tierMatch[1]);
                }
            }

            if (tier > 0) {
                // Credit Mapping (from tiers.ts)
                const creditsMap: Record<number, { tech: number, fun: number }> = {
                    1: { tech: 2, fun: 0 },
                    2: { tech: 5, fun: 2 },
                    3: { tech: 7, fun: 4 }
                };
                const credits = creditsMap[tier] || { tech: 0, fun: 0 };

                await db.updateRow(
                    appwriteConfig.databaseId,
                    appwriteConfig.usersCollectionId,
                    userId,
                    {
                        tier: tier,
                        tech_credits: credits.tech,
                        fun_credits: credits.fun
                    }
                );
                logs.push(`Updated Tier to ${tier}, TechCredits: ${credits.tech}, FunCredits: ${credits.fun} for user ${userId}`);
                console.log(`[Webhook] Fulfilled Ticket Tier ${tier} for ${userId}`);
                await logAction("Payment Fulfilled", `Ticket Tier ${tier} fulfilled for ${userId}`, userId, 'SUCCESS');
                return { status: "success", message: "Ticket fulfilled" };
            }

            logs.push("Ticket tier verification failed (could not parse tier)");
            return { status: "warning", message: "Ticket parse failed" };
        }

        // --- MERCH ---
        else if (itemType === 'MERCH') {
            logs.push(`Checking Merch Order ${itemId}`);
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
                logs.push(`Merch order ${itemId} marked SUCCESS`);
                console.log(`[Webhook] Merch order ${itemId} marked SUCCESS`);
                await logAction("Payment Fulfilled", `Merch Order ${itemId} fulfilled`, userId, 'SUCCESS');
                return { status: "success", message: "Merch fulfilled" };
            }
            logs.push("Merch order already success or not found");
            return { status: "ignored", message: "Merch already success" };
        }

        // --- ACCOM ---
        else if (itemType === 'ACCOMM') {
            logs.push(`Checking Accom Order ${itemId}`);
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
                logs.push(`Accommodation order ${itemId} marked SUCCESS`);
                console.log(`[Webhook] Accommodation order ${itemId} marked SUCCESS`);

                // ⬇️ Decrement Slots
                const hostel = accomOrder.hostel; // Assuming 'hostel' field exists
                const slotList = await db.listRows(
                    appwriteConfig.databaseId,
                    appwriteConfig.accommDetailsCollectionId,
                    [Query.equal("hostel", hostel)]
                );

                if (slotList.total > 0) {
                    const hostelDoc = slotList.rows[0];
                    const newSlots = Math.max(0, hostelDoc.slots - 1);
                    await db.updateRow(
                        appwriteConfig.databaseId,
                        appwriteConfig.accommDetailsCollectionId,
                        hostelDoc.$id,
                        { slots: newSlots }
                    );
                    logs.push(`Decremented slot for ${hostel}. New slots: ${newSlots}`);
                    console.log(`[Webhook] Decremented slot for ${hostel}. New slots: ${newSlots}`);
                }

                // Log only after success
                await logAction("Payment Fulfilled", `Accommodation Order ${itemId} fulfilled`, userId, 'SUCCESS');
                return { status: "success", message: "Accommodation fulfilled" };
            }
            logs.push("Accommodation order already success or not found");
            return { status: "ignored", message: "Accommodation already success" };
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
                logs.push(`Created registration for Workshop ${itemId}`);
                console.log(`[Webhook] Created registration for Workshop ${itemId}`);
            } else {
                logs.push(`Registration already exists for Workshop ${itemId}`);
                console.log(`[Webhook] Registration already exists for Workshop ${itemId}`);
            }

            // Award Tech Credit
            const userDoc = await db.getRow(
                appwriteConfig.databaseId,
                appwriteConfig.usersCollectionId,
                userId
            );

            if (userDoc) {
                const newCredits = (userDoc.tech_credits || 0) + 1;
                await db.updateRow(
                    appwriteConfig.databaseId,
                    appwriteConfig.usersCollectionId,
                    userId,
                    {
                        tech_credits: newCredits
                    }
                );
                logs.push(`Awarded Tech Credit to user ${userId}. New Total: ${newCredits}`);
                console.log(`[Webhook] Awarded Tech Credit to user ${userId}. New Total: ${newCredits}`);
            }

            await logAction("Payment Fulfilled", `Workshop ${itemId} fulfilled for ${userId}`, userId, 'SUCCESS');
            return { status: "success", message: "Workshop fulfilled" };
        }

        logs.push(`Unknown Item Type: ${itemType}`);
        return { status: "warning", message: `Unknown item type ${itemType}` };

    } catch (fulfillErr: any) {
        console.error("[Webhook] Fulfillment Error Details:", fulfillErr.message);
        logs.push(`Fulfillment Exception: ${fulfillErr.message}`);
        return { status: "error", message: fulfillErr.message };
    }
}
