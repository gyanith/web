import { ID } from "node-appwrite";
import { appwriteConfig } from "./appwrite/appwrite.config";
import { createAdminClient } from "./appwrite/appwrite.server";

export type LogType = 'SUCCESS' | 'PENDING' | 'FAILED' | 'INFO';

export async function logAction(
    action: string,
    description: string,
    userId?: string,
    type: LogType = 'INFO'
) {
    try {
        const { getTablesDB } = await createAdminClient();
        const tablesDB = getTablesDB();

        await tablesDB.createRow(
            appwriteConfig.databaseId,
            appwriteConfig.logsCollectionId,
            ID.unique(),
            {
                action,
                description,
                user_id: userId || null,
                type,
                timestamp: new Date().toISOString()
            }
        );
    } catch (error) {
        // Silent fail for logs to avoid breaking main flow
        console.error("Failed to write log:", error);
    }
}
