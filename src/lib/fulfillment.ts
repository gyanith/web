import { appwriteConfig } from "./appwrite/appwrite.config";
import { ID, Query } from "node-appwrite";
import { logAction } from "./logger";
import { getRegistrationId } from "./helpers/registration.helper";

export async function processFulfillment(db: any, transaction: any, userId: string) {
    const itemType = transaction.item_type;
    const itemId = transaction.item_id;

    console.log(`[Fulfillment] Processing ${itemType} - ${itemId} for user ${userId}`);

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
                const userDoc = await db.getRow(
                    appwriteConfig.databaseId,
                    appwriteConfig.usersCollectionId,
                    userId
                );

                if (userDoc) {
                    const oldTier = userDoc.tier || 0;
                    const newTier = tier;

                    // Upgrade Credits logic
                    const availTechCredits = userDoc.tech_credits || 0;
                    const availFunCredits = userDoc.fun_credits || 0;

                    let oldTotalTechCredits = 0;
                    let oldTotalFunCredits = 0;
                    if (oldTier === 1) { oldTotalTechCredits = 2; oldTotalFunCredits = 0; }
                    else if (oldTier === 2) { oldTotalTechCredits = 5; oldTotalFunCredits = 2; }
                    else if (oldTier === 3) { oldTotalTechCredits = 7; oldTotalFunCredits = 4; }

                    let newTotalTechCredits = 0;
                    let newTotalFunCredits = 0;
                    if (newTier === 1) { newTotalTechCredits = 2; newTotalFunCredits = 0; }
                    else if (newTier === 2) { newTotalTechCredits = 5; newTotalFunCredits = 2; }
                    else if (newTier === 3) { newTotalTechCredits = 7; newTotalFunCredits = 4; }

                    const usedTechCredits = Math.max(0, oldTotalTechCredits - availTechCredits);
                    const usedFunCredits = Math.max(0, oldTotalFunCredits - availFunCredits);

                    const newTechCredits = Math.max(0, newTotalTechCredits - usedTechCredits);
                    const newFunCredits = Math.max(0, newTotalFunCredits - usedFunCredits);

                    await db.updateRow(
                        appwriteConfig.databaseId,
                        appwriteConfig.usersCollectionId,
                        userId,
                        {
                            tier: newTier,
                            tech_credits: newTechCredits,
                            fun_credits: newFunCredits
                        }
                    );
                    await logAction("Payment Fulfilled", `Ticket Tier ${tier} fulfilled for ${userId}`, userId, 'SUCCESS');
                    return { success: true, message: "Ticket fulfilled" };
                }
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
                await logAction("Payment Fulfilled", `Merch Order ${itemId} fulfilled`, userId, 'SUCCESS');
                return { success: true, message: "Merch fulfilled" };
            }
            return { success: true, message: "Merch already success" };
        }

        // --- ACCOM ---
        else if (itemType === 'ACCOMM') {
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

                const hostel = accomOrder.hostel;
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
                }
                await logAction("Payment Fulfilled", `Accommodation Order ${itemId} fulfilled`, userId, 'SUCCESS');
                return { success: true, message: "Accommodation fulfilled" };
            }
            return { success: true, message: "Accommodation already success" };
        }

        // --- WORKSHOP & EVENT ---
        else if (itemType === 'WORKSHOP' || itemType === 'EVENT') {
            const deterministicId = getRegistrationId(userId, itemId);

            try {
                await db.createRow(
                    appwriteConfig.databaseId,
                    appwriteConfig.registrationsCollectionId,
                    deterministicId,
                    {
                        event_id: itemId,
                        user_id: userId
                    }
                );
                console.log(`[Fulfillment] Created registration with ID: ${deterministicId}`);
            } catch (createError: any) {
                // If document already exists (409), then it's already fulfilled
                if (createError.code === 409) {
                    console.log(`[Fulfillment] Registration already exists for ID: ${deterministicId}`);
                } else {
                    throw createError;
                }
            }

            if (itemType === 'WORKSHOP') {
                try {
                    const eventDoc = await db.getRow(
                        appwriteConfig.databaseId,
                        appwriteConfig.eventsCollectionId,
                        itemId
                    );

                    const isTechOrWorkshop = eventDoc &&
                        (eventDoc.type.toLowerCase() === 'tech' ||
                            eventDoc.type.toLowerCase().includes('workshop'));

                    if (isTechOrWorkshop) {
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
                                { tech_credits: newCredits }
                            );
                        }
                    }
                } catch (err) {
                    console.error("Error awarding workshop credit:", err);
                }
            }

            await logAction("Payment Fulfilled", `${itemType} ${itemId} fulfilled for ${userId}`, userId, 'SUCCESS');
            return { success: true, message: `${itemType} fulfilled` };
        }

        // --- ORION ---
        else if (itemType === 'ORION') {
            await logAction("Payment Fulfilled", `Orion Registration fulfilled for Team ${itemId}`, userId, 'SUCCESS');
            return { success: true, message: "Orion fulfilled" };
        }

        // --- CONFERENCE ---
        else if (itemType === 'CONFERENCE') {
            const confReg = await db.getRow(
                appwriteConfig.databaseId,
                appwriteConfig.conferenceCollectionId,
                itemId
            );

            if (confReg && confReg.paid !== true) {
                await db.updateRow(
                    appwriteConfig.databaseId,
                    appwriteConfig.conferenceCollectionId,
                    itemId,
                    { paid: true }
                );
                await logAction("Payment Fulfilled", `Conference Registration ${itemId} fulfilled`, userId, 'SUCCESS');
                return { success: true, message: "Conference fulfilled" };
            }
            return { success: true, message: "Conference already paid" };
        }

        return { success: false, error: `Unknown Item Type: ${itemType}` };

    } catch (error: any) {
        console.error(`[Fulfillment] Error:`, error);
        return { success: false, error: error.message };
    }
}
