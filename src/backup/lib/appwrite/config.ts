export const appwriteConfig = {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "678e78ca001bdc75e237", // Fallback or strict requirement
    eventsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_EVENTS_COLLECTION_ID || "678e78e20015579f168b",
    bucketId: process.env.NEXT_PUBLIC_APPWRITE_EVENTS_BUCKET_ID || "678e7ad40026e6328362",
};
