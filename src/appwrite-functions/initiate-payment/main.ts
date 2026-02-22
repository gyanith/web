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

        const { type, event_id } = req.bodyJson; // Extract event_id early for check

        // ICDTSES Configuration
        const ICDTSES_EVENT_ID = "tech_6994b818002154469eb4";

        let userIdHeader = req.headers['x-appwrite-user-id'];
        let userId = Array.isArray(userIdHeader) ? userIdHeader[0] : userIdHeader;

        // Fallback to bodyJson.userId if header is missing (e.g. Admin execution)
        if (!userId) {
            userId = req.bodyJson.userId;
        }

        // Allow guest for ICDTSES
        if (!userId) {
            if (type === 'EVENT' && event_id === ICDTSES_EVENT_ID) {
                // Generate a guest ID (using a consistent prefix might help, but for now unique)
                // We'll use "guest_" + random string, but verify if ID constraints allow.
                // Cashfree customer_id allows alphanumeric, underscores.
                userId = `guest_${ID.unique()}`;
            } else {
                return res.json({ success: false, message: 'Unauthenticated' }, 401);
            }
        }
        let amount = 0;
        let itemId: string | null = null;
        let itemType = type; // Default to incoming type
        let baseUrl: string = "https://gyanith.org";
        let returnUrl: string = "";

        let customerName = `User_${userId}`;
        let customerEmail = "";
        let customerPhone = "9999999999";

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
        else if (type === 'EVENT') {
            // event_id already extracted above

            // --- ICDTSES SPECIAL HANDLING ---
            if (event_id === ICDTSES_EVENT_ID) {
                const { user_type, name, email, paper_id } = req.bodyJson;

                // Validate required fields
                if (!user_type || !name || !email || !paper_id) {
                    return res.json({ success: false, message: 'Missing fields: name, email, paper_id, user_type' }, 400);
                }

                // Set Customer Details from Form
                customerName = name;
                customerEmail = email;

                // Duplicate Check (Email + Paper ID + Paid=true)
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
                const confDoc = await databases.createDocument(
                    process.env.DB_ID!,
                    CONFERENCE_COLLECTION_ID,
                    ID.unique(),
                    {
                        name,
                        email,
                        paper_id,
                        user_type,
                        // user_id: userId, // Removed: Not in schema
                        paid: false,
                        payment_id: null // Will update with transaction ID
                    }
                );

                itemId = confDoc.$id;
                itemType = 'CONFERENCE'; // Override type for Transaction and Webhook
                returnUrl = `${baseUrl}/icdtses`;

            } else {
                // Standard Event
                returnUrl = `${baseUrl}/events/fun/${event_id}`;
                amount = await getEventFee(event_id, databases);
                itemId = event_id;
            }
        }

        /* ---------------- ACCOMM ---------------- */
        else if (type === 'ACCOMM') {
            returnUrl = `${baseUrl}/residence`;
            const { hostel, day } = req.bodyJson;

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

            const accommodationId = `accomm_${userId}`;

            const accommodation = await databases.createDocument(
                process.env.DB_ID!,
                process.env.ACCOMMODATION_COLLECTION_ID!,
                accommodationId,
                {
                    user_id: userId,
                    transaction_id: null,
                    day,
                    hostel,
                    status: 'PENDING',
                }
            );

            itemId = accommodation.$id;
            amount = (PRICES.accomm.price * day.length) + PRICES.accomm.caution;
        }


        /* ---------------- TICKET ---------------- */
        else if (type === 'TICKET') {
            returnUrl = `${baseUrl}/events`
            const { tier, item_id } = req.bodyJson as TicketBody;
            if (!item_id) return res.json({ success: false, message: 'item_id required' }, 400);
            if (!(tier in PRICES.tier)) return res.json({ success: false, message: 'Invalid tier' }, 400);

            itemId = item_id;
            amount = PRICES.tier[tier];
        }

        else {
            return res.json({ success: false, message: 'Invalid payment type' }, 400);
        }

        /* ---------------- TRANSACTION ENTRY ---------------- */
        const transaction = await databases.createDocument(
            process.env.DB_ID!,
            process.env.TRANSACTIONS_COLLECTION_ID!,
            ID.unique(),
            {
                mode: 'CF',
                amount,
                item_type: itemType, // Uses 'CONFERENCE' for ICDTSES
                user: userId && !userId.startsWith('guest_') ? userId : null, // Only set relationship if valid user
                item_id: itemId,
                status: 'CREATED',
            }
        );

        const transactionId = transaction.$id;

        // Link transaction to item
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
            user = await databases.getDocument(
                process.env.DB_ID!,
                process.env.USERS_COLLECTION_ID!,
                userId
            );
            if (user) {
                if (!customerEmail) customerEmail = user.email;
                if (user.phone) customerPhone = user.phone.toString();
            }
        } catch (e) {
            console.log("User fetch failed or user not found, proceeding with defaults/payload.");
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
        error(err.message);
        return res.json({ success: false, message: err.message }, 500);
    }
};
