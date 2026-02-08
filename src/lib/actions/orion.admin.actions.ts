"use server";

import { createAdminClient } from "@/lib/appwrite/appwrite.server";
import { appwriteConfig } from "@/lib/appwrite/appwrite.config";
import { verifyOrionAccess } from "@/lib/appwrite/orion-access";
import { Query } from "node-appwrite";

const ORION_EVENT_ID = "69879895001e8584a54b";

export async function getOrionAdminData() {
    try {
        const hasAccess = await verifyOrionAccess();
        if (!hasAccess) {
            return { success: false, error: "Unauthorized" };
        }

        const { getTablesDB, getUsers } = await createAdminClient();
        const db = getTablesDB();
        const users = getUsers();

        // 1. Fetch all Orion Teams
        const teamsList = await db.listRows(
            appwriteConfig.databaseId,
            appwriteConfig.eventTeamsCollectionId,
            [Query.equal("event_id", ORION_EVENT_ID), Query.limit(100)] // Pagination needed for scale
        );

        // 2. Fetch all Transactions for payment status
        const transactions = await db.listRows(
            appwriteConfig.databaseId,
            appwriteConfig.transactionsCollectionId,
            [Query.equal("item_type", "ORION_TEAM")] // Assuming we used this type
        );

        // Map transaction status by item_id (team_id)
        const paymentMap: Record<string, string> = {};
        transactions.rows.forEach(t => {
            if (t.status === 'SUCCESS') paymentMap[t.item_id] = 'PAID';
            else if (t.status === 'FAILED') paymentMap[t.item_id] = 'FAILED';
            else paymentMap[t.item_id] = 'PENDING';
        });

        // 3. Enrich Teams with Leader Info & Payment Status
        const enrichedTeams = await Promise.all(teamsList.rows.map(async (team: any) => {
            let leaderName = "Unknown";
            let leaderEmail = "";
            let leaderPhone = "";

            try {
                const leader = await users.get(team.leader_id);
                leaderName = leader.name;
                leaderEmail = leader.email;
                leaderPhone = leader.phone;
            } catch (e) {
                console.error(`Failed to fetch leader ${team.leader_id}`);
            }

            // Fetch members
            const membersList = await db.listRows(
                appwriteConfig.databaseId,
                appwriteConfig.teamMembersCollectionId,
                [Query.equal("team_id", team.$id)]
            );

            const members = await Promise.all(membersList.rows.map(async (m) => {
                try {
                    const u = await users.get(m.user_id);
                    return { name: u.name, $id: u.$id };
                } catch (e) { return { name: "Unknown", $id: m.user_id }; }
            }));

            return {
                ...team,
                leaderName,
                leaderEmail,
                leaderPhone,
                members,
                paymentStatus: paymentMap[team.$id] || "UNINITIATED"
            };
        }));

        const paidCount = enrichedTeams.filter(t => t.paymentStatus === 'PAID').length;

        return {
            success: true,
            teams: enrichedTeams,
            stats: {
                totalTeams: enrichedTeams.length,
                paidTeams: paidCount,
                totalMembers: 0 // Calculate if needed
            }
        };

    } catch (error: any) {
        console.error("Failed to fetch admin data:", error);
        return { success: false, error: error.message };
    }
}
