import { Client, Account, Databases, TablesDB } from 'appwrite';

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!) // Your Appwrite endpoint
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!); // Your project ID

export const account = new Account(client);
export const databases = new Databases(client);
export const tablesDB = new TablesDB(client);
export { ID } from 'appwrite';
export default client;
