import { TIERS } from "@/data/tiers";
import { appwriteConfig } from "@/lib/appwrite/appwrite.config";
import { createSessionClient } from "@/lib/appwrite/appwrite.server";
import { NextRequest, NextResponse } from "next/server";
import { TablesDB } from "node-appwrite";


const updateCredits = async (userId: string, techCredits: number, funCredits: number, tier: number, tablesDB: TablesDB) => {
    console.log(userId)

    try {
        // Fetch current user details to calculate delta
        const userDoc = await tablesDB.getRow({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.usersCollectionId,
            rowId: userId
        });

        let finalTechCredits = techCredits;
        let finalFunCredits = funCredits;

        // If user already has a tier, calculate the difference (delta)
        // NewBalance = CurrentBalance + (NewTierLimit - OldTierLimit)
        if (userDoc.tier) {
            const oldTier = TIERS.find(t => t.tier === userDoc.tier);
            if (oldTier) {
                const techDiff = techCredits - oldTier.techCredits;
                const funDiff = funCredits - oldTier.funCredits;

                finalTechCredits = (userDoc.tech_credits || 0) + techDiff;
                finalFunCredits = (userDoc.fun_credits || 0) + funDiff;

                console.log(`[Upgrade] Delta Update: Tech ${userDoc.tech_credits} -> ${finalTechCredits} (Diff: ${techDiff})`);
            }
        }

        // Safety clamp
        if (finalTechCredits < 0) finalTechCredits = 0;
        if (finalFunCredits < 0) finalFunCredits = 0;

        const res = await tablesDB.updateRow({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.usersCollectionId,
            rowId: userId,
            data: {
                tech_credits: finalTechCredits,
                fun_credits: finalFunCredits,
                tier: tier,
            }
        });


        return { status: 200, message: "Credits and Tier updated successfully" };
    } catch (error) {
        console.error("Error updating credits and tier:", error);
        return { status: 500, error: "Internal Server Error" };
    }
};


export async function POST(request: NextRequest) {
    const body = await request.json();
    console.log(body)
    const { userId, tier } = body;

    if (!tier) {
        return NextResponse.json({ error: "Tier not provided" }, { status: 400 });
    }

    const selectedTier = TIERS.find((t) => t.tier === tier);
    console.log(selectedTier)
    if (!selectedTier) {
        return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    // function to update tech and funCredits for the user in appwrite
    // in prod, call this, only after the payment is verified

    const client = await createSessionClient()
    const tablesDB = client.getTablesDB();

    console.log("User ID:", userId);
    console.log("Selected Tier:", selectedTier);


    const res = await updateCredits(userId, selectedTier.techCredits, selectedTier.funCredits, selectedTier.tier, tablesDB);


    if (res.status === 200) {
        return NextResponse.json({ message: "Credits updated successfully" }, { status: 200 });
    } else {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

}


export async function GET(request: NextRequest) {
    return NextResponse.json({ message: "Hello World" }, { status: 200 });
}