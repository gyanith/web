import { Client, Account } from 'appwrite';

// Initialize the Appwrite Client (Web SDK)
const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

// Export services for client-side usage
export const account = new Account(client);

// Export ID helper
export { ID } from 'appwrite';

// Default export
export default client;