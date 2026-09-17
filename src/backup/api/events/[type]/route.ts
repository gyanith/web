// app/api/events/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient, Query } from "@/backup/lib/appwrite/appwrite.server"
import { getImageUrl } from '@/backup/lib/helpers/imageStorage.helper';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ type: string }> }
) {


    const { getTablesDB } = await createAdminClient();
    const tablesDB = getTablesDB();

    try {
        const { type } = await params;
        const response = await tablesDB.listRows({
            databaseId: process.env.NEXT_PUBLIC_DATABASE_ID!,
            tableId: process.env.NEXT_PUBLIC_EVENTS_COLLECTION_ID!,
            queries: [
                Query.equal("type", type),
                Query.equal("is_published", true)
            ]
        });

        // Transform data to only return necessary fields
        const events = response.rows.map(row => ({
            eventId: row.$id,
            eventName: row.name,
            eventType: row.type,
            description: row.description,
            day: row.day || 1,
            start_time: row.start_time,
            end_time: row.end_time,
            location: row.location,
            prizePool: row.prize_pool,
            imageUrl: getImageUrl(process.env.NEXT_PUBLIC_APPWRITE_EVENTS_BUCKET_ID!, row.image_id),
            key: row.key,
        }));

        return NextResponse.json(events);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch events' },
            { status: 500 }
        );
    }
}