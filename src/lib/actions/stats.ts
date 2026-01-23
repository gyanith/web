import { appwriteConfig } from "../appwrite/appwrite.config";
import { createAdminClient } from "../appwrite/appwrite.server";
import { Query } from "node-appwrite";


export async function getTotalRevenue() {
    try {
        const { getTablesDB } = createAdminClient();
        const tablesDB = getTablesDB();

        let totalRevenue = 0;
        let hasNextPage = true;
        let lastId = null;

        // Pagination loop to ensure we fetch ALL transactions
        while (hasNextPage) {
            const queries = [
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
