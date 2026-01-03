// app/api/events/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient, Query } from "@/lib/appwrite/appwrite.server"
import { getImageUrl } from '@/lib/helpers/imageStorage.helper';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ type: string }> }
) {


    const client = createAdminClient();
    const tablesDB = client.getTablesDB();

    try {
        const { type } = await params;
        const response = await tablesDB.listRows({
            databaseId: process.env.APPWRITE_DATABASE_ID!,
            tableId: process.env.APPWRITE_EVENTS_COLLECTION_ID!,
            queries: [
                Query.equal("type", type)
            ]
        });

        // Transform data to only return necessary fields
        const events = response.rows.map(row => ({
            eventId: row.$id,
            eventName: row.name,
            eventType: row.type,
            description: row.description,
            day: row.day,
            location: row.location,
            prizePool: row.prize_pool,
            imageUrl: getImageUrl(row.image_id),
        }));

        return NextResponse.json(events);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch events' },
            { status: 500 }
        );
    }
}