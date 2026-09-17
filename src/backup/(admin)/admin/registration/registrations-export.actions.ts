// "use server"; // latent for static export

import { createAdminClient } from "@/backup/lib/appwrite/appwrite.server";
import { appwriteConfig } from "@/backup/lib/appwrite/appwrite.config";
import { Query } from "node-appwrite";

export type RegistrationExportRow = {
    name: string;
    email: string;
    phone: string;
    college: string;
    registeredAt: string;
    checkedIn: boolean;
};

export async function getRegistrationExportData(
    eventId: string
): Promise<RegistrationExportRow[]> {
    console.log(`[reg-export] Starting export for event: ${eventId}`);

    const { getTablesDB, getUsers } = await createAdminClient();
    const db = getTablesDB();
    const usersApi = getUsers();

    // ── 1. Fetch all registrations for the event ──────────────────────────
    const regRows: any[] = [];
    let lastId: string | null = null;
    let page = 0;

    while (true) {
        page++;
        const queries: any[] = [
            Query.equal("event_id", eventId),
            Query.limit(100),
        ];
        if (lastId) queries.push(Query.cursorAfter(lastId));

        console.log(`[reg-export] Fetching registrations page ${page}...`);
        const res = await db.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.registrationsCollectionId,
            queries,
        });

        console.log(`[reg-export] Page ${page}: got ${res.rows.length} rows`);
        if (res.rows.length === 0) break;
        regRows.push(...res.rows);
        lastId = res.rows[res.rows.length - 1].$id;
        if (res.rows.length < 100) break;
    }

    console.log(`[reg-export] Total registration rows: ${regRows.length}`);

    if (regRows.length === 0) return [];

    // ── 2. Collect unique user IDs ────────────────────────────────────────
    const userIds = [
        ...new Set(regRows.map((r) => r.user_id).filter(Boolean) as string[]),
    ];
    console.log(`[reg-export] Unique user IDs: ${userIds.length}`);

    // ── 3. Fetch auth users (name) ────────────────────────────────────────
    const authMap: Record<string, { name: string; email: string; phone: string }> = {};
    await Promise.all(
        userIds.map(async (uid) => {
            try {
                const u = await usersApi.get(uid);
                authMap[uid] = {
                    name: u.name ?? "—",
                    email: u.email ?? "—",
                    phone: u.phone ?? "—",
                };
            } catch {
                authMap[uid] = { name: "—", email: "—", phone: "—" };
            }
        })
    );

    // ── 4. Fetch user profiles (college) in chunks of 25 ─────────────────
    const profileMap: Record<string, { college: string }> = {};
    const chunkSize = 25;
    for (let i = 0; i < userIds.length; i += chunkSize) {
        const chunk = userIds.slice(i, i + chunkSize);
        try {
            const res = await db.listRows({
                databaseId: appwriteConfig.databaseId,
                tableId: appwriteConfig.usersCollectionId,
                queries: [Query.equal("$id", chunk), Query.limit(chunkSize)],
            });
            for (const row of res.rows) {
                profileMap[row.$id] = {
                    college:
                        row.college_name ??
                        (row.is_nitpy ? "NIT Puducherry" : "—"),
                };
            }
        } catch (err) {
            console.error("[reg-export] Profile chunk failed:", err);
        }
    }

    // ── 5. Assemble final rows ────────────────────────────────────────────
    const result: RegistrationExportRow[] = regRows.map((row) => {
        const uid = row.user_id ?? "";
        const auth = authMap[uid] ?? { name: "—", email: "—", phone: "—" };
        const profile = profileMap[uid] ?? { college: "—" };

        const registeredAt = row.$createdAt
            ? new Date(row.$createdAt).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            })
            : "—";

        // No check-in field exists in the current schema; default to false
        const checkedIn: boolean = row.checked_in ?? row.check_in ?? false;

        return {
            name: auth.name,
            email: auth.email,
            phone: auth.phone,
            college: profile.college,
            registeredAt,
            checkedIn,
        };
    });

    console.log(`[reg-export] Done. Returning ${result.length} rows.`);
    return result;
}
