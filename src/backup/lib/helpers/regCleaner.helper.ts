import { Client, Databases, Query } from 'node-appwrite';

/**
 * Appwrite Function to clean up duplicate registrations.
 * It keeps only the oldest registration for each (user_id, event_id) pair.
 */
export default async ({ req, res, log, error }: any) => {
    try {
        const client = new Client()
            .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT!)
            .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID!)
            .setKey(process.env.APPWRITE_API_KEY!);

        const databases = new Databases(client);

        // Debugging logs to verify env vars are present
        log(`Endpoint: ${process.env.APPWRITE_FUNCTION_API_ENDPOINT ? 'PRESENT' : 'MISSING'}`);
        log(`Project: ${process.env.APPWRITE_FUNCTION_PROJECT_ID ? 'PRESENT' : 'MISSING'}`);
        log(`API Key: ${process.env.APPWRITE_API_KEY ? 'PRESENT (len: ' + process.env.APPWRITE_API_KEY.length + ')' : 'MISSING'}`);

        const databaseId = process.env.DB_ID || "6952aa6e00042f5dfbde";
        const registrationsCollectionId = process.env.REGISTRATIONS_COLLECTION_ID || "69713eb50019d26b632d";

        // Check for dry run mode
        const isDryRun = req.bodyJson?.dryRun !== false; // Default to dry run for safety

        log(`Starting registration cleanup. Mode: ${isDryRun ? 'DRY RUN' : 'LIVE DELETE'}`);

        let allRegistrations: any[] = [];
        let offset = 0;
        const limit = 100;

        // 1. Fetch all registrations (handling pagination)
        log("Fetching registrations...");
        while (true) {
            const response = await databases.listDocuments(
                databaseId,
                registrationsCollectionId,
                [
                    Query.limit(limit),
                    Query.offset(offset)
                ]
            );

            allRegistrations = allRegistrations.concat(response.documents);
            log(`Fetched ${allRegistrations.length} / ${response.total} documents.`);

            if (allRegistrations.length >= response.total) break;
            offset += limit;
        }

        // 2. Group registrations by (user_id, event_id)
        const groups: Record<string, any[]> = {};

        for (const reg of allRegistrations) {
            const key = `${reg.user_id}_${reg.event_id}`;
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(reg);
        }

        const toDelete: string[] = [];
        const toKeep: string[] = [];

        // 3. Identify duplicates to delete
        for (const key in groups) {
            const group = groups[key];
            if (group.length > 1) {
                // Sort by $createdAt ascending to find the oldest
                group.sort((a, b) => new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime());

                const oldest = group[0];
                const others = group.slice(1);

                log(`Group [${key}]: Found ${group.length} entries. Keeping [${oldest.$id}].`);
                toKeep.push(oldest.$id);

                for (const dupe of others) {
                    log(`  -> Mark for deletion: [${dupe.$id}] created at ${dupe.$createdAt}`);
                    toDelete.push(dupe.$id);
                }
            }
        }

        log(`Summary: ${allRegistrations.length} total, ${Object.keys(groups).length} unique groups, ${toDelete.length} duplicates identified.`);

        // 4. Perform deletion
        let deletedCount = 0;
        let errorCount = 0;

        if (!isDryRun) {
            log("Executing deletions...");
            for (const docId of toDelete) {
                try {
                    await databases.deleteDocument(databaseId, registrationsCollectionId, docId);
                    log(`Deleted successfully: ${docId}`);
                    deletedCount++;
                } catch (err: any) {
                    error(`Failed to delete ${docId}: ${err.message}`);
                    errorCount++;
                }
            }
        } else {
            log("Dry run finished. No documents were actualy deleted.");
        }

        return res.json({
            success: true,
            mode: isDryRun ? 'dry-run' : 'live',
            totalFound: allRegistrations.length,
            uniqueGroups: Object.keys(groups).length,
            toDeleteCount: toDelete.length,
            deletedCount,
            errorCount,
            message: isDryRun ? "Dry run completed. Check logs for details." : "Cleanup completed."
        });

    } catch (err: any) {
        error(`Critical Error: ${err.message}`);
        return res.json({ success: false, message: err.message }, 500);
    }
};
