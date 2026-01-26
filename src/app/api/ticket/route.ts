import { TIERS } from "@/data/tiers";
import { appwriteConfig } from "@/lib/appwrite/appwrite.config";
import { createSessionClient } from "@/lib/appwrite/appwrite.server";
import { NextRequest, NextResponse } from "next/server";
import { TablesDB } from "node-appwrite";


const updateCredits = async (userId: string, techCredits: number, funCredits: number, tablesDB: TablesDB) => {
    console.log(userId)

    try {
        const res = await tablesDB.updateRow({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.usersCollectionId,
            rowId: userId,
            data: {
                tech_credits: techCredits,
                fun_credits: funCredits,
            }
        });


        return { status: 200, message: "Credits updated successfully" };
    } catch (error) {
        console.error("Error updating credits:", error);
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


    const res = await updateCredits(userId, selectedTier.techCredits, selectedTier.funCredits, tablesDB);


    if (res.status === 200) {
        return NextResponse.json({ message: "Credits updated successfully" }, { status: 200 });
    } else {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

}


export async function GET(request: NextRequest) {
    return NextResponse.json({ message: "Hello World" }, { status: 200 });
}