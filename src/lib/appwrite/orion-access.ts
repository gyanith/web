import { createSessionClient, createAdminClient } from "@/lib/appwrite/appwrite.server";
import { Teams, Query } from "node-appwrite";

export async function verifyOrionAccess() {
    try {
        const { getAccount } = await createSessionClient();
        const account = getAccount();

        // 1. Get current User ID (this needs a valid session)
        let user;
        try {
            user = await account.get();
        } catch (err: any) {
            console.log("❌ No valid session for Orion access check");
            return false;
        }

        const userId = user.$id;

        // 2. Use Admin Client to check teams (Bypass session scopes)
        const { getClient } = await createAdminClient();
        const client = getClient();

        const teams = new Teams(client);

        // 3. Find the "orion" team
        const targetTeamName = "orion"; // Access controlled for "orion" team members
        const allTeams = await teams.list();
        const orionTeam = allTeams.teams.find(t => t.name.toLowerCase() === targetTeamName);

        if (!orionTeam) {
            console.log(`❌ Team '${targetTeamName}' not found.`);
            return false;
        }

        // 4. Check if user is in the team
        try {
            const memberships = await teams.listMemberships({
                teamId: orionTeam.$id,
                queries: [
                    Query.equal("userId", userId)
                ]
            });

            if (memberships.total > 0) {
                console.log(`✅ Orion Access Granted: User ${userId} is in ${orionTeam.name}`);
                return true;
            }
        } catch (err) {
            console.error(`Error checking membership in ${orionTeam.name}:`, err);
        }

        console.log(`❌ Orion Access Denied for ${userId}`);
        return false;

    } catch (error) {
        console.error("Orion Access Check Failed:", error);
        return false;
    }
}
