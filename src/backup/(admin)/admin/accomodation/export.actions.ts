// "use server"; // latent for static export

import { createAdminClient } from "@/backup/lib/appwrite/appwrite.server";
import { appwriteConfig } from "@/backup/lib/appwrite/appwrite.config";
import { Query } from "node-appwrite";

export type AccommodationExportRow = {
    name: string;
    email: string;
    phone: string;
    college: string;
    hostel: string;
    days: string;
    num_days: number;
};

export async function getAccommodationExportData(): Promise<AccommodationExportRow[]> {
    console.log("[export] Starting accommodation export...");

    const { getTablesDB, getUsers } = await createAdminClient();
    const db = getTablesDB();
    const usersApi = getUsers();

    console.log("[export] Admin client ready. Scanning accommodation collection:", appwriteConfig.accommodationCollectionId);

    // ── 1. Scan ALL accommodation rows ──────────────────────────────────────
    const accommRows: any[] = [];
    let lastId: string | null = null;
    let page = 0;

    while (true) {
        page++;
        const queries: any[] = [
            Query.equal("status", "SUCCESS"),
            Query.limit(100),
        ];
        if (lastId) queries.push(Query.cursorAfter(lastId));

        console.log(`[export] Fetching accommodation page ${page}...`);
        const res = await db.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.accommodationCollectionId,
            queries,
        });

        console.log(`[export] Page ${page}: got ${res.rows.length} rows`);
        if (res.rows.length === 0) break;
        accommRows.push(...res.rows);
        lastId = res.rows[res.rows.length - 1].$id;
        if (res.rows.length < 100) break;
    }

    console.log(`[export] Total accommodation rows fetched: ${accommRows.length}`);

    if (accommRows.length === 0) {
        console.log("[export] No rows found — returning empty.");
        return [];
    }

    // Log a sample row to understand the shape
    console.log("[export] Sample row keys:", Object.keys(accommRows[0]));
    console.log("[export] Sample row:", JSON.stringify(accommRows[0], null, 2));

    // ── 2. Deduplicate by (user_id, hostel) — keep row with most days ──────
    // The accommodation collection often has duplicate entries per user from
    // multiple payment attempts / webhook re-fires for the same booking.
    const dedupeMap = new Map<string, any>();
    for (const row of accommRows) {
        const uid = row.user_id ?? row.userId ?? "";
        const hostel = String(row.hostel ?? "").toUpperCase();
        const key = `${uid}::${hostel}`;
        const daysCount = Array.isArray(row.day) ? row.day.length : (row.day != null ? 1 : 0);

        if (!dedupeMap.has(key)) {
            dedupeMap.set(key, row);
        } else {
            const existing = dedupeMap.get(key)!;
            const existingDays = Array.isArray(existing.day) ? existing.day.length : (existing.day != null ? 1 : 0);
            // Keep whichever row has more days; on tie, keep the newer one
            if (daysCount > existingDays || (daysCount === existingDays && row.$createdAt > existing.$createdAt)) {
                dedupeMap.set(key, row);
            }
        }
    }
    const dedupedRows = [...dedupeMap.values()];
    console.log(`[export] After dedup: ${dedupedRows.length} unique (user, hostel) combinations (removed ${accommRows.length - dedupedRows.length} duplicates)`);

    // ── 3. Collect unique user_ids ──────────────────────────────────────────
    const userIds = [
        ...new Set(
            dedupedRows.map((r) => r.user_id ?? r.userId).filter(Boolean) as string[]
        ),
    ];
    console.log(`[export] Unique user IDs to resolve: ${userIds.length}`);

    // ── 3. Fetch auth users in parallel (name from Appwrite Auth) ──────────
    console.log("[export] Fetching auth users (name)...");
    const authMap: Record<string, { name: string; email: string }> = {};
    await Promise.all(
        userIds.map(async (uid) => {
            try {
                const u = await usersApi.get(uid);
                authMap[uid] = { name: u.name ?? "—", email: u.email ?? "—" };
            } catch (err) {
                console.warn(`[export] Auth user not found for uid=${uid}:`, err);
                authMap[uid] = { name: "—", email: "—" };
            }
        })
    );
    console.log(`[export] Auth lookup done. Got ${Object.keys(authMap).length} entries.`);

    // ── 4. Fetch user profiles (phone, college) in chunks ──────────────────
    console.log("[export] Fetching user profiles (phone, college)...");
    const profileMap: Record<string, { phone: string; college: string }> = {};
    const chunkSize = 25;
    for (let i = 0; i < userIds.length; i += chunkSize) {
        const chunk = userIds.slice(i, i + chunkSize);
        console.log(`[export] Profile chunk ${Math.floor(i / chunkSize) + 1}: fetching ${chunk.length} users`);
        try {
            const res = await db.listRows({
                databaseId: appwriteConfig.databaseId,
                tableId: appwriteConfig.usersCollectionId,
                queries: [Query.equal("$id", chunk), Query.limit(chunkSize)],
            });
            console.log(`[export] Profile chunk returned ${res.rows.length} rows`);
            for (const row of res.rows) {
                profileMap[row.$id] = {
                    phone: row.phone ?? "—",
                    college: row.college_name ?? (row.is_nitpy ? "NIT Puducherry" : "—"),
                };
            }
        } catch (err) {
            console.error("[export] Profile chunk failed:", err);
        }
    }
    console.log(`[export] Profile lookup done. Got ${Object.keys(profileMap).length} entries.`);

    // ── 5. Assemble final rows ──────────────────────────────────────────────
    console.log("[export] Assembling final export rows...");
    const result = dedupedRows.map((row) => {
        const uid = row.user_id ?? row.userId ?? "";
        const auth = authMap[uid] ?? { name: "—", email: "—" };
        const profile = profileMap[uid] ?? { phone: "—", college: "—" };

        const daysArr: number[] = Array.isArray(row.day)
            ? row.day
            : row.day != null ? [Number(row.day)] : [];

        return {
            name: auth.name,
            email: auth.email,
            phone: profile.phone,
            college: profile.college,
            hostel: String(row.hostel ?? "—").toUpperCase(),
            days: daysArr.length ? daysArr.join(", ") : "—",
            num_days: daysArr.length,
        };
    });

    console.log(`[export] Done. Returning ${result.length} rows.`);
    return result;
}
