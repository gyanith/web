
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
            // Check both Main and Orion keys for signature match
            const mainSecret = process.env.CASHFREE_SECRET_KEY;
            const orionSecret = process.env.ORION_CASHFREE_SECRET_KEY;

            const payload = timestamp + rawBody;

            const verify = (secret: string) => {
                if (!secret) return false;
                return crypto.createHmac('sha256', secret)
                    .update(payload)
                    .digest('base64') === signature;
            };

            const isMainValid = mainSecret ? verify(mainSecret) : false;
            const isOrionValid = orionSecret ? verify(orionSecret) : false;

            if (!isMainValid && !isOrionValid) {
                // Debugging help: Log what we generated vs received
                console.error(`Signature Mismatch for both keys.\nReceived: ${signature}\nTimestamp: ${timestamp}`);
                await logAction("Webhook Failed", "Signature Mismatch (Main & Orion)", undefined, 'FAILED');
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
                fulfillmentResult = await fulfillOrder(orderId, body.data.payment.cf_payment_id, logs) || { status: "skipped", message: "Order not found" };
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
        const { processFulfillment } = await import("@/lib/fulfillment");
        const result = await processFulfillment(db, transaction, userId);
        if (result.success) {
            return { status: "success", message: result.message };
        } else {
            return { status: "warning", message: result.error };
        }
    } catch (error: any) {
        console.error(`[Webhook] Fulfillment Failed:`, error);
        return { status: "error", message: error.message };
    }
}
