import { appwriteConfig } from "../appwrite/appwrite.config";
import { createAdminClient } from "../appwrite/appwrite.server";
import { Query } from "node-appwrite";


export async function getTotalRevenue() {
    try {
        const { getTablesDB } = await createAdminClient();
        const tablesDB = getTablesDB();

        let totalRevenue = 0;
        const revenueByType: Record<string, number> = {
            WORKSHOP: 0,
            MERCH: 0,
            ACCOMM: 0,
            TICKET: 0,
            ORION: 0,
            EVENT: 0,
            CONFERENCE: 0
        };

        let hasNextPage = true;
        let lastId = null;

        while (hasNextPage) {
            const queries = [
                Query.equal("status", "SUCCESS"),
                Query.limit(100)
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

            response.rows.forEach((doc: any) => {
                const amount = Number(doc.amount) || 0;
                const type = doc.item_type || "UNKNOWN";

                totalRevenue += amount;
                if (type in revenueByType) {
                    revenueByType[type] += amount;
                } else {
                    revenueByType[type] = (revenueByType[type] || 0) + amount;
                }
            });

            lastId = response.rows[response.rows.length - 1].$id;

            if (response.rows.length < 100) {
                hasNextPage = false;
            }
        }

        return {
            total: totalRevenue,
            ...revenueByType
        };
    } catch (error) {
        console.error("Error calculating total revenue:", error);
        return { total: 0 };
    }
}

export async function getTotalRegistrations() {
    try {
        const { getTablesDB } = await createAdminClient();
        const tablesDB = getTablesDB();

        // Count by item_type from transactions table (status = SUCCESS only)
        const countByType: Record<string, number> = {
            WORKSHOP: 0,
            MERCH: 0,
            ACCOMM: 0,
            TICKET: 0,
            ORION: 0,
            EVENT: 0,
            FUN: 0,
            CONFERENCE: 0,
        };

        let hasNextPage = true;
        let lastId: string | null = null;

        while (hasNextPage) {
            const queries = [
                Query.equal("status", "SUCCESS"),
                Query.limit(100),
            ];
            if (lastId) queries.push(Query.cursorAfter(lastId));

            const response = await tablesDB.listRows({
                databaseId: appwriteConfig.databaseId,
                tableId: appwriteConfig.transactionsCollectionId,
                queries,
            });

            if (response.rows.length === 0) break;

            response.rows.forEach((doc: any) => {
                const type: string = doc.item_type || "UNKNOWN";
                if (type in countByType) {
                    countByType[type]++;
                }
            });

            lastId = response.rows[response.rows.length - 1].$id;
            if (response.rows.length < 100) hasNextPage = false;
        }

        // 'events' bucket = workshops + events + fun events (all create registrations)
        const events = countByType.WORKSHOP + countByType.EVENT + countByType.FUN;

        return {
            total: Object.values(countByType).reduce((a, b) => a + b, 0),
            events,
            workshop: countByType.WORKSHOP,
            event: countByType.EVENT + countByType.FUN,
            conference: countByType.CONFERENCE,
            accommodation: countByType.ACCOMM,
            merch: countByType.MERCH,
            ticket: countByType.TICKET,
            orion: countByType.ORION,
        };
    } catch (error) {
        console.error("Error fetching total registrations:", error);
        return {
            total: 0,
            events: 0,
            workshop: 0,
            event: 0,
            conference: 0,
            accommodation: 0,
            merch: 0,
            ticket: 0,
            orion: 0,
        };
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
