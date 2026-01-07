// @lib/appwrite/appwrite.client.ts
import { Client, Account, ID } from "appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;

const client = new Client()
    .setEndpoint(endpoint) // ✅ absolute + same-origin
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const account = new Account(client);
export { ID };
export default client;
