import { Client, Databases, ID, Query } from 'node-appwrite';

// helper function - get fee from events table
async function getEventFee(event_id: string, databases: Databases) {
    const event = await databases.getDocument(
        process.env.DB_ID!,
        process.env.EVENTS_COLLECTION_ID!,
        event_id
    );
    if (!event) {
        throw new Error('Event not found!');
    }
    return event.fee;
}

type Tier = "1" | "2" | "3";

interface TicketBody {
    tier: Tier;
    item_id: string;
}

const PRICES = {
    merch: {
        price: 350
    },
    accomm: {
        price: 150,
        caution: 150
    },
    tier: {
        "1": 100,
        "2": 150,
        "3": 200
    },
    conference: {
        attendee: 100,
        student: 200,
        faculty: 400
    }
};

export default async ({ req, res, log, error }: any) => {
    try {
        const client = new Client()
            .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT!)
            .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID!)
            .setKey(process.env.APPWRITE_API_KEY!);

        const databases = new Databases(client);

        if (!req.bodyJson) {
            throw new Error('Request body missing');
        }

        const { type } = req.bodyJson; // Extract event_id early for check

        // ICDTSES Configuration
        const ICDTSES_EVENT_ID = "tech_6994b818002154469eb4";

        let userIdHeader = req.headers['x-appwrite-user-id'];
        let userId = Array.isArray(userIdHeader)
            ? userIdHeader[0]
            : userIdHeader;

        // Log the raw body and headers for debugging
        log(`[DEBUG] Headers: ${JSON.stringify(req.headers)}`);
        log(`[DEBUG] Body: ${JSON.stringify(req.bodyJson)}`);

        // Fallback to bodyJson.userId if header is missing
        if (!userId && req.bodyJson && req.bodyJson.userId) {
            userId = req.bodyJson.userId;
            log(`[DEBUG] Using userId from payload: ${userId}`);
        }

        if (!userId) {
            log(`[ERROR] userId is missing after all attempts.`);
        }

        // Allow guest for CONFERENCE (ICDTSES)
        if (!userId) {
            if (type === 'CONFERENCE') {
                userId = `guest_${ID.unique().substring(0, 8)}`;
                log(`[DEBUG] Created guest userId: ${userId}`);
            } else {
                error(`[ERROR] Unauthenticated access attempt for type: ${type}`);
                return res.json({ success: false, message: 'Unauthenticated - userId is missing' }, 401);
            }
        }

        let amount = 0;
        let itemId: string | null = null;
        let itemType = type; // Default to incoming type
        let baseUrl: string = "https://gyanith.org";
        let returnUrl: string = "";

        // Standardize itemType: Map EVENT to FUN for consistent internal handling
        if (type === 'EVENT') itemType = 'FUN';

        let customerName = `User_${userId}`;
        let customerEmail = "";
        let customerPhone = "9999000000";

        // Using Env var or fallback for Conference Collection
        const CONFERENCE_COLLECTION_ID = process.env.CONFERENCE_COLLECTION_ID || "69958e9000007bbf324d";

        /* ---------------- MERCH ---------------- */
        if (type === 'MERCH') {
            returnUrl = `${baseUrl}/merch`;
            const { quantity, size } = req.bodyJson;
            if (typeof quantity !== 'number' || quantity <= 0) {
                return res.json({ success: false, message: 'Invalid quantity' }, 400);
            }

            const price = PRICES.merch.price;
            amount = quantity * price;

            log(`[DEBUG] Creating Merch Record for ${userId}`);
            const merchOrder = await databases.createDocument(
                process.env.DB_ID!,
                process.env.MERCH_ORDERS_COLLECTION_ID!,
                ID.unique(),
                {
                    quantity,
                    size,
                    user_id: userId,
                    transaction_id: null,
                    status: 'PENDING',
                }
            );

            itemId = merchOrder.$id;
        }

        /* ---------------- WORKSHOP ---------------- */
        else if (type === 'WORKSHOP') {
            const { event_id } = req.bodyJson;
            returnUrl = `${baseUrl}/events/workshop/${event_id}`;
            amount = await getEventFee(event_id, databases);
            itemId = event_id;
        }

        /* ---------------- EVENT ---------------- */
        else if (type === 'CONFERENCE') {
            const { event_id } = req.bodyJson;

            const { user_type, name, email, paper_id } = req.bodyJson;

            // Validate required fields
            if (!user_type || !name || !email || !paper_id) {
                return res.json({ success: false, message: 'Missing fields: name, email, paper_id, user_type' }, 400);
            }

            // Set Customer Details from Form
            customerName = name;
            customerEmail = email;

            // Duplicate Check (Email + Paper ID + Paid=true)
            log(`[DEBUG] Checking duplicate for CONFERENCE ${email}`);
            const existing = await databases.listDocuments(
                process.env.DB_ID!,
                CONFERENCE_COLLECTION_ID,
                [
                    Query.equal('email', email),
                    Query.equal('paper_id', paper_id),
                    Query.equal('paid', true)
                ]
            );

            if (existing.total > 0) {
                return res.json({ success: false, message: "Registration already exists for this Paper ID and Email." }, 409);
            }

            // Calculate Amount
            if (user_type === 'STUDENT') amount = PRICES.conference.student;
            else if (user_type === 'FACULTY') amount = PRICES.conference.faculty;
            else if (user_type === 'ATTENDEE') amount = PRICES.conference.attendee; // Added ATTENDEE as per user
            else return res.json({ success: false, message: 'Invalid user type' }, 400);

            // Create Conference Document
            log(`[DEBUG] Creating Conference Document`);
            const confDoc = await databases.createDocument(
                process.env.DB_ID!,
                CONFERENCE_COLLECTION_ID,
                ID.unique(),
                {
                    name,
                    email,
                    paper_id,
                    user_type,
                    paid: false,
                    payment_id: null // Will update with transaction ID
                }
            );

            itemId = confDoc.$id;
            returnUrl = `${baseUrl}/icdtses`;
        }

        /*------------------ FUN / EVENT -----------------*/
        else if (type === "FUN" || type === "EVENT") {
            const { event_id } = req.bodyJson;
            returnUrl = `${baseUrl}/events/fun/${event_id}`;
            amount = await getEventFee(event_id, databases);
            itemId = event_id;
        }

        /* ---------------- ACCOMM ---------------- */
        else if (type === 'ACCOMM') {
            returnUrl = `${baseUrl}/residence`;
            let { hostel, day } = req.bodyJson;

            log(`[DEBUG] Checking existing accommodation for ${userId}`);
            const existingAccomm = await databases.listDocuments(
                process.env.DB_ID!,
                process.env.ACCOMMODATION_COLLECTION_ID!,
                [
                    Query.equal('user_id', userId),
                    Query.equal('status', 'SUCCESS')
                ]
            );

            if (existingAccomm.total > 0) {
                return res.json({ success: false, message: "User has already booked accommodation" }, 409);
            }

            // Ensure day is a single string if that's what the schema expects, 
            // but log what we received. 
            const finalDayValue = Array.isArray(day) ? String(day[0]) : String(day);
            log(`[DEBUG] Creating Accomodation Record for ${userId} day: ${finalDayValue}`);

            const accommodation = await databases.createDocument(
                process.env.DB_ID!,
                process.env.ACCOMMODATION_COLLECTION_ID!,
                ID.unique(),
                {
                    user_id: userId,
                    transaction_id: null,
                    day: finalDayValue,
                    hostel,
                    status: 'PENDING',
                }
            );

            itemId = accommodation.$id;
            amount = (PRICES.accomm.price * (Array.isArray(day) ? day.length : 1)) + PRICES.accomm.caution;
        }


        /* ---------------- TICKET ---------------- */
        else if (type === 'TICKET') {
            returnUrl = `${baseUrl}/events`
            const { tier, item_id } = req.bodyJson as TicketBody;
            if (!item_id) return res.json({ success: false, message: 'item_id required' }, 400);
            if (!(tier in PRICES.tier)) return res.json({ success: false, message: 'Invalid tier' }, 400);

            //CHECK IF TIER ALREADY EXISTS - UPGRADE TIER CASE
            log(`[DEBUG] Fetching user for TICKET tier check ${userId}`);
            let existingTier: string | null = null;
            try {
                const user = await databases.getDocument(
                    process.env.DB_ID!,
                    process.env.USERS_COLLECTION_ID!,
                    userId
                );
                existingTier = user.tier ? String(user.tier) : null;
            } catch (e) {
                log(`[DEBUG] User document not found for ${userId}, assuming first-time purchase.`);
            }

            if (!existingTier) { //FIRST TIME BUY TICKET
                amount = PRICES.tier[tier];
            }
            else {//UPGRADE CASE
                const oldTier = existingTier as Tier;
                if (!(oldTier in PRICES.tier)) {
                    return res.json({ success: false, message: 'Invalid existing tier' }, 400);
                }
                amount = PRICES.tier[tier] - PRICES.tier[oldTier];
            }

            itemId = item_id;
        }

        else {
            return res.json({ success: false, message: 'Invalid payment type' }, 400);
        }

        /* ---------------- TRANSACTION ENTRY ---------------- */
        const finalUserId = userId && !userId.startsWith('guest_') ? String(userId) : null;
        const finalItemId = itemId ? String(itemId) : null;

        log(`[DEBUG] Final Transaction Payload: ${JSON.stringify({
            mode: 'CF',
            amount,
            item_type: itemType,
            user: finalUserId,
            item_id: finalItemId,
            status: 'CREATED'
        })}`);

        const transaction = await databases.createDocument(
            process.env.DB_ID!,
            process.env.TRANSACTIONS_COLLECTION_ID!,
            ID.unique(),
            {
                mode: 'CF',
                amount,
                item_type: itemType,
                user: finalUserId,
                item_id: finalItemId,
                status: 'CREATED',
            }
        );

        const transactionId = transaction.$id;

        // Link transaction to item
        log(`[DEBUG] Linking Transaction ${transactionId} to Item ${itemId}`);
        if (itemType === 'MERCH') {
            await databases.updateDocument(process.env.DB_ID!, process.env.MERCH_ORDERS_COLLECTION_ID!, itemId!, { transaction_id: transactionId });
        } else if (itemType === 'ACCOMM') {
            await databases.updateDocument(process.env.DB_ID!, process.env.ACCOMMODATION_COLLECTION_ID!, itemId!, { transaction_id: transactionId });
        } else if (itemType === 'CONFERENCE') {
            // Link to conference doc
            await databases.updateDocument(process.env.DB_ID!, CONFERENCE_COLLECTION_ID, itemId!, { payment_id: transactionId });
        }

        /* ---------------- CASHFREE ORDER ---------------- */
        let user: any = null;
        try {
            log(`[DEBUG] Fetching user data for Cashfree payload ${userId}`);
            user = await databases.getDocument(
                process.env.DB_ID!,
                process.env.USERS_COLLECTION_ID!,
                userId
            );
            if (user) {
                customerEmail = user.email;
                customerPhone = user.phone ? user.phone.toString() : "9999000000";
            }
        } catch (e) {
            log("[DEBUG] User fetch failed or user not found, proceeding with defaults/payload.");
        }

        const orderPayload = {
            order_id: transactionId,
            order_amount: amount,
            order_currency: 'INR',
            customer_details: {
                customer_id: userId,
                customer_name: customerName,
                customer_email: customerEmail || `user_${userId}@gyanith.org`, // Fallback
                customer_phone: customerPhone
            },
            order_meta: {
                return_url: returnUrl,
                notify_url: "https://gyanith.org/api/cashfree/webhook"
            },
            order_note: `Payment for ${itemType}`,
            order_tags: {
                paymentType: itemType,
                userId: userId,
                itemId: itemId
            }
        };

        log(`[DEBUG] Creating Cashfree Order: ${transactionId}`);
        const cfResponse = await fetch(
            `${process.env.CASHFREE_API_BASE}/orders`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-client-id': process.env.CASHFREE_APP_ID!,
                    'x-client-secret': process.env.CASHFREE_SECRET_KEY!,
                    'x-api-version': '2023-08-01',
                },
                body: JSON.stringify(orderPayload),
            }
        );

        const cfData = await cfResponse.json();

        if (!cfResponse.ok) {
            throw new Error(cfData.message || 'Cashfree order creation failed');
        }

        /* ---------------- UPDATE TRANSACTION ---------------- */
        log(`[DEBUG] Updating Transaction to PENDING: ${transactionId}`);
        await databases.updateDocument(
            process.env.DB_ID!,
            process.env.TRANSACTIONS_COLLECTION_ID!,
            transactionId,
            {
                status: 'PENDING',
                cashfree_order_id: cfData.order_id,
            }
        );

        /* ---------------- RESPONSE ---------------- */
        return res.json({
            success: true,
            paymentSessionId: cfData.payment_session_id,
            orderId: cfData.order_id,
            transactionId,
            amount,
        });

    } catch (err: any) {
        error(`[FATAL ERROR] ${err.message}`);
        return res.json({ success: false, message: `System Error: ${err.message}` }, 500);
    }
};
