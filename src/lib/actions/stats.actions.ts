import { appwriteConfig } from "../appwrite/appwrite.config";
import { createAdminClient } from "../appwrite/appwrite.server";
import { Query } from "node-appwrite";


export async function getTotalRevenue() {
    try {
        const { getTablesDB } = await createAdminClient();
        const tablesDB = getTablesDB();

        let totalRevenue = 0;
        let hasNextPage = true;
        let lastId = null;

        // Pagination loop to ensure we fetch ALL transactions
        while (hasNextPage) {
            const queries = [
                Query.equal("status", "SUCCESS"), // Updated to filter by SUCCESS
                Query.limit(100) // Max limit per request
            ];

            if (lastId) {
                queries.push(Query.cursorAfter(lastId));
            }

            const response = await tablesDB.listRows({
                databaseId: appwriteConfig.databaseId,
                tableId: appwriteConfig.transactionsCollectionId,
                queries
            });

            if (response.rows.length === 0) {
                hasNextPage = false;
                break;
            }

            // Sum amounts for the current page
            const pageSum = response.rows.reduce((sum: number, doc: any) => {
                // Ensure amount is treated as a number
                const amount = Number(doc.amount) || 0;
                return sum + amount;
            }, 0);

            totalRevenue += pageSum;

            // Prepare for next page
            lastId = response.rows[response.rows.length - 1].$id;

            // If we got fewer documents than limit, we are done
            if (response.rows.length < 100) {
                hasNextPage = false;
            }
        }

        return totalRevenue;
    } catch (error) {
        console.error("Error calculating total revenue:", error);
        return 0; // Return 0 on error so UI doesn't break
    }
}

export async function getTotalRegistrations() {
    try {
        const { getTablesDB } = await createAdminClient();
        const db = getTablesDB();

        // Fetch totals from all registration-related collections
        const fetchCount = async (collectionId: string) => {
            if (!collectionId) return 0;
            try {
                const res = await db.listRows(
                    appwriteConfig.databaseId,
                    collectionId,
                    [Query.limit(1)]
                );
                return res.total;
            } catch (e) {
                console.error(`Error fetching count for ${collectionId}:`, e);
                return 0;
            }
        };

        const counts = await Promise.all([
            fetchCount(appwriteConfig.registrationsCollectionId),
            fetchCount(appwriteConfig.conferenceCollectionId),
            fetchCount(appwriteConfig.accommodationCollectionId),
            fetchCount(appwriteConfig.merchCollectionId)
        ]);

        return counts.reduce((a: number, b: number) => a + b, 0);
    } catch (error) {
        console.error("Error fetching total registrations:", error);
        return 0;
    }
}

export async function getRegistrationGraphData() {
    try {
        const { getTablesDB } = await createAdminClient();
        const tablesDB = getTablesDB();

        let allRegistrations: { $createdAt: string }[] = [];
        let hasNextPage = true;
        let lastId = null;

        // Fetch all registrations to get dates
        // Note: Ideally we'd optimize this if thousands, but for now this is the only way without backend aggregations
        while (hasNextPage) {
            const queries = [
                Query.limit(100),
                // Query.select(["$createdAt"]) // Select only createdAt field if supported
            ];

            if (lastId) {
                queries.push(Query.cursorAfter(lastId));
            }

            const response = await tablesDB.listRows({
                databaseId: appwriteConfig.databaseId,
                tableId: appwriteConfig.registrationsCollectionId,
                queries
            });

            if (response.rows.length === 0) break;

            allRegistrations = [...allRegistrations, ...response.rows];
            lastId = response.rows[response.rows.length - 1].$id;

            if (response.rows.length < 100) hasNextPage = false;
        }

        if (allRegistrations.length === 0) return [];

        // Sort by date (oldest first)
        allRegistrations.sort((a, b) => new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime());

        const oldestDate = new Date(allRegistrations[0].$createdAt);
        const today = new Date();

        // Create map of DateString -> Count
        const dateCountMap = new Map<string, number>();

        // Initialize all days from oldest to today with 0
        const currentDate = new Date(oldestDate);
        currentDate.setHours(0, 0, 0, 0); // Reset time part

        while (currentDate <= today) {
            const dateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
            dateCountMap.set(dateStr, 0);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Fill buckets
        allRegistrations.forEach(reg => {
            const dateStr = new Date(reg.$createdAt).toISOString().split('T')[0];
            if (dateCountMap.has(dateStr)) {
                dateCountMap.set(dateStr, dateCountMap.get(dateStr)! + 1);
            }
        });

        // Convert map to array { date: "MMM DD", count: number }
        const graphData: { date: string, count: number }[] = [];

        // Helper for formatting date "MMM DD"
        const formatDate = (dateStr: string) => {
            const d = new Date(dateStr);
            return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
        };

        dateCountMap.forEach((count, dateStr) => {
            graphData.push({
                date: formatDate(dateStr),
                count: count
            });
        });

        // If graph data is too large, we might want to group by week etc? For now return daily.
        return graphData;

    } catch (error) {
        console.error("Error fetching graph data:", error);
        return [];
    }
}
