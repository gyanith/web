import { getLoggedInUser } from "@/lib/actions/auth.actions";
import { appwriteConfig } from "@/lib/appwrite/appwrite.config";
import { createAdminClient } from "@/lib/appwrite/appwrite.server";
import { ID, Query } from "node-appwrite";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ type: string; eventId: string }> }
) {
    try {
        const { type, eventId } = await params;
        const user = await getLoggedInUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { getTablesDB } = await createAdminClient();
        const tablesDB = getTablesDB();

        const body = await request.json().catch(() => ({}));
        const { paymentId } = body;

        // 2. Fetch Event
        const event = await tablesDB.getRow(
            appwriteConfig.databaseId,
            appwriteConfig.eventsCollectionId,
            eventId
        );

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // 3. Determine Cost and Credit Type
        const eventTypeRaw = (event.type || type || "").toLowerCase();
        const cost = 1;

        // 4. Fetch User Profile (to get credits) - ONLY IF NO PAYMENT ID
        let userProfile = null;
        let currentCredits = 0;
        let creditField = "";

        if (!paymentId) {
            userProfile = await tablesDB.getRow(
                appwriteConfig.databaseId,
                appwriteConfig.usersCollectionId,
                user.$id
            );

            if (!userProfile) {
                return NextResponse.json(
                    { error: "User profile not found. Please complete signup." },
                    { status: 404 }
                );
            }

            if (eventTypeRaw === "tech") {
                creditField = "tech_credits";
                currentCredits = userProfile.tech_credits || 0;
            } else {
                creditField = "fun_credits";
                currentCredits = userProfile.fun_credits || 0;
            }

            // 5. Check Balance
            if (currentCredits < cost) {
                return NextResponse.json(
                    { error: `You don't have enough credits to register for this event. Please upgrade your tier or purchase a ticket to continue.` },
                    { status: 403 }
                );
            }
        }

        // 5. Check if already registered
        const existingRegistration = await tablesDB.listRows(
            appwriteConfig.databaseId,
            appwriteConfig.registrationsCollectionId,
            [
                Query.equal("event_id", eventId),
                Query.equal("user_id", user.$id)
            ]
        );

        if (existingRegistration.total > 0) {
            return NextResponse.json({ message: "Already registered" }, { status: 200 });
        }

        // 6. Deduct Credits (ONLY IF NO PAYMENT ID)
        if (!paymentId && creditField) {
            await tablesDB.updateRow(
                appwriteConfig.databaseId,
                appwriteConfig.usersCollectionId,
                user.$id,
                {
                    [creditField]: currentCredits - cost
                }
            );
        }

        // 7. Create Registration
        await tablesDB.createRow(
            appwriteConfig.databaseId,
            appwriteConfig.registrationsCollectionId,
            ID.unique(),
            {
                event_id: eventId,
                user_id: user.$id,
            }
        );

        return NextResponse.json({
            success: true,
            message: "Registered successfully",
            remaining_credits: currentCredits - cost
        });

    } catch (error: any) {
        console.error("Registration failed:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ type: string; eventId: string }> }
) {
    try {
        const { type, eventId } = await params;
        const user = await getLoggedInUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { getTablesDB } = await createAdminClient();
        const tablesDB = getTablesDB();

        const REGISTRATIONS_COLLECTION_ID = "69713eb50019d26b632d";

        // 1. Check if registered
        const existingRegistration = await tablesDB.listRows(
            appwriteConfig.databaseId,
            REGISTRATIONS_COLLECTION_ID,
            [
                Query.equal("event_id", eventId),
                Query.equal("user_id", user.$id)
            ]
        );

        if (existingRegistration.total === 0) {
            return NextResponse.json({ message: "Not registered" }, { status: 404 });
        }

        const registrationId = existingRegistration.rows[0].$id;

        // 2. Fetch User Profile (to refund credits)
        const userProfile = await tablesDB.getRow(
            appwriteConfig.databaseId,
            appwriteConfig.usersCollectionId,
            user.$id
        );

        // 3. Determine Credit Type & Refund
        const event = await tablesDB.getRow(
            appwriteConfig.databaseId,
            appwriteConfig.eventsCollectionId,
            eventId
        );

        const eventTypeRaw = event.type?.toLowerCase() || type.toLowerCase();
        const refundAmount = 1;
        let creditField = "";
        let currentCredits = 0;

        if (["tech", "technical", "workshop", "hackathon", "paper_presentation"].some(t => eventTypeRaw.includes(t))) {
            creditField = "tech_credits";
            currentCredits = userProfile.tech_credits || 0;
        } else {
            creditField = "fun_credits";
            currentCredits = userProfile.fun_credits || 0;
        }

        // 4. Refund Credits
        await tablesDB.updateRow(
            appwriteConfig.databaseId,
            appwriteConfig.usersCollectionId,
            user.$id,
            {
                [creditField]: currentCredits + refundAmount
            }
        );

        // 5. Delete Registration
        await tablesDB.deleteRow(
            appwriteConfig.databaseId,
            REGISTRATIONS_COLLECTION_ID,
            registrationId
        );

        return NextResponse.json({
            success: true,
            message: "Unregistered successfully",
            remaining_credits: currentCredits + refundAmount
        });

    } catch (error: any) {
        console.error("Unregistration failed:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
