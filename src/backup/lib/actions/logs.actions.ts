// "use server"; // latent for static export

import { createAdminClient } from "@/backup/lib/appwrite/appwrite.server";
import { appwriteConfig } from "@/backup/lib/appwrite/appwrite.config";
import { Query } from "node-appwrite";

export async function getLogs({ page = 1, limit = 20 }: { page?: number; limit?: number }) {
    try {
        const { getTablesDB } = await createAdminClient();
        const tablesDB = getTablesDB();

        const offset = (page - 1) * limit;

        const response = await tablesDB.listRows(
            appwriteConfig.databaseId,
            appwriteConfig.logsCollectionId,
            [
                Query.orderDesc("$createdAt"),
                Query.limit(limit),
                Query.offset(offset),
            ]
        );

        return {
            logs: response.rows,
            total: response.total,
        };
    } catch (error) {
        console.error("Failed to fetch logs:", error);
        return {
            logs: [],
            total: 0,
        };
    }
}
