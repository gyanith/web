import { createSessionClient, createAdminClient } from "@/lib/appwrite/appwrite.server";

export async function verifyAdminAccess() {
    try {
        const { getAccount } = await createSessionClient();
        const account = getAccount();

        // 1. Get current User ID (this needs a valid session)
        let user;
        try {
            user = await account.get();
        } catch (err: any) {
            // User is not authenticated (no session or invalid session)
            console.log("❌ No valid session for admin access check");
            return false;
        }

        const userId = user.$id;

        // 2. Use Admin Client to check teams (Bypass session scopes)
        const { getClient } = createAdminClient();
        const client = getClient();

        // Import Teams/Query dynamically
        const { Teams, Query } = await import("node-appwrite");
        const teams = new Teams(client);

        // 3. Find the critical teams by name
        const allowedTeamNames = ["coordinators", "superusers"];

        // List teams matching our allowed names
        // Note: If you have many teams, this might need pagination, but for now we assume < 25 teams
        const allTeams = await teams.list();

        const targetTeams = allTeams.teams.filter(t =>
            allowedTeamNames.includes(t.name.toLowerCase())
        );

        // 4. Check if user is in ANY of these teams
        for (const team of targetTeams) {
            try {
                // Check if user is in team using listMemberships with query
                const memberships = await teams.listMemberships({
                    teamId: team.$id,
                    queries: [
                        Query.equal("userId", userId)
                    ]
                });

                if (memberships.total > 0) {
                    console.log(`✅ Admin Access Granted: User ${userId} is in ${team.name}`);
                    return true;
                }
            } catch (err) {
                // Ignore errors, check next team
                console.error(`Error  checking team ${team.name}:`, err);
            }
        }

        console.log(`❌ Admin Access Denied for ${userId}`);
        return false;

    } catch (error) {
        console.error("Admin Access Check Failed:", error);
        return false;
    }
}
