export const appwriteConfig = {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
    databaseId: process.env.NEXT_PUBLIC_DATABASE_ID!,
    eventsCollectionId: process.env.NEXT_PUBLIC_EVENTS_COLLECTION_ID!,
    eventsBucketId: process.env.NEXT_PUBLIC_APPWRITE_EVENTS_BUCKET_ID!,
    coordinatorsTeamId: "6958c606001b9b1162cd",
    eventsCoordinatorsCollectionId: process.env.NEXT_PUBLIC_COORDINATORS_COLLECTION_ID!,
};
