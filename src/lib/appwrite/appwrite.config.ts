export const appwriteConfig = {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
    databaseId: process.env.NEXT_PUBLIC_DATABASE_ID!,
    usersCollectionId: process.env.NEXT_PUBLIC_USER_COLLECTION_ID!,
    eventsCollectionId: process.env.NEXT_PUBLIC_EVENTS_COLLECTION_ID!,
    eventsBucketId: process.env.NEXT_PUBLIC_APPWRITE_EVENTS_BUCKET_ID!,
    coordinatorsTeamId: process.env.NEXT_PUBLIC_COORDINATORS_TEAM_ID,
    eventsCoordinatorsCollectionId: process.env.NEXT_PUBLIC_COORDINATORS_COLLECTION_ID!,
    transactionsCollectionId: process.env.NEXT_PUBLIC_TRANSACTIONS_COLLECTION_ID!,
};
