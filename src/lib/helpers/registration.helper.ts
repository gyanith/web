import { createHash } from "crypto";

/**
 * Generates a deterministic registration ID based on user and event.
 * This prevents duplicate registrations for the same user-event pair.
 * @param userId - The ID of the user.
 * @param eventId - The ID of the event.
 * @returns A 32-character hex string.
 */
export function getRegistrationId(userId: string, eventId: string): string {
    if (!userId || !eventId) {
        throw new Error("userId and eventId are required to generate a registration ID.");
    }
    return createHash("md5").update(`${userId}_${eventId}`).digest("hex");
}
