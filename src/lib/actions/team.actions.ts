"use server";

import { createSessionClient, createAdminClient } from "@/lib/appwrite/appwrite.server";
import { appwriteConfig } from "@/lib/appwrite/appwrite.config";
import { ID, Query } from "node-appwrite";
import { revalidatePath } from "next/cache";
import { Team, TeamMember } from "@/types/db";

/**
 * Creates a new team for an event.
 * @param eventId - The ID of the event.
 * @param userId - The ID of the user creating the team.
 * @returns Success status and team ID or error.
 */
export async function createTeam(eventId: string, userId: string, teamName: string) {
    try {
        const { getTablesDB } = await createAdminClient();
        const tablesDB = getTablesDB();

        // 1. Check if user is already in a team for this event
        const existingMembership = await tablesDB.listRows(
            appwriteConfig.databaseId,
            appwriteConfig.teamMembersCollectionId,
            [Query.equal("event_id", eventId), Query.equal("user_id", userId)]
        );

        if (existingMembership.total > 0) {
            throw new Error("You are already in a team for this event.");
        }

        // 2. Create Team in event_teams
        const teamId = ID.unique();
        const team = await tablesDB.createRow(
            appwriteConfig.databaseId,
            appwriteConfig.eventTeamsCollectionId,
            teamId,
            {
                name: teamName,
                leader_id: userId,
                event_id: eventId,
            }
        );

        // 3. Add Leader to team_members
        await tablesDB.createRow(
            appwriteConfig.databaseId,
            appwriteConfig.teamMembersCollectionId,
            ID.unique(),
            {
                team_id: teamId,
                user_id: userId,
                event_id: eventId,
                role: "LEADER",
            }
        );

        revalidatePath(`/events/TECH/${eventId}/team`); // Update robustly? We might need dynamic path
        return { success: true, teamId: team.$id };
    } catch (error: any) {
        console.error("Failed to create team:", error);
        return { success: false, error: error.message || "Failed to create team" };
    }
}

/**
 * Joins an existing team.
 * @param teamId - The ID of the team to join.
 * @param userId - The ID of the user joining.
 * @param eventId - The ID of the event.
 * @returns Success status or error.
 */
export async function joinTeam(teamId: string, userId: string, eventId: string) {
    try {
        const { getTablesDB } = await createAdminClient();
        const tablesDB = getTablesDB();

        // 1. Check if team exists and belongs to this event
        let team;
        try {
            team = await tablesDB.getRow(
                appwriteConfig.databaseId,
                appwriteConfig.eventTeamsCollectionId,
                teamId
            );
        } catch (e) {
            throw new Error("Team not found. Please check the Team ID.");
        }

        if (team.event_id !== eventId) {
            throw new Error("This team does not belong to the current event.");
        }

        // 2. Check if user is already in a team for this event
        const existingMembership = await tablesDB.listRows(
            appwriteConfig.databaseId,
            appwriteConfig.teamMembersCollectionId,
            [Query.equal("event_id", eventId), Query.equal("user_id", userId)]
        );

        if (existingMembership.total > 0) {
            const membership = existingMembership.rows[0];
            if (membership.team_id === teamId) {
                throw new Error("You are already a member of this team.");
            }
            throw new Error("You are already in a team for this event. Leave your current team to join another.");
        }

        // 3. TODO: Check max team size? (Assuming logic handled elsewhere or unlimited for now)

        // 4. Add Member
        await tablesDB.createRow(
            appwriteConfig.databaseId,
            appwriteConfig.teamMembersCollectionId,
            ID.unique(),
            {
                team_id: teamId,
                user_id: userId,
                event_id: eventId,
                role: "MEMBER",
            }
        );

        return { success: true };
    } catch (error: any) {
        console.error("Failed to join team:", error);
        return { success: false, error: error.message || "Failed to join team" };
    }
}

/**
 * Leaves a team.
 * @param teamId - The ID of the team.
 * @param userId - The ID of the user leaving.
 * @returns Success status or error.
 */
export async function leaveTeam(teamId: string, userId: string) {
    try {
        const { getTablesDB } = await createAdminClient();
        const tablesDB = getTablesDB();

        // 1. Find membership row
        const memberships = await tablesDB.listRows(
            appwriteConfig.databaseId,
            appwriteConfig.teamMembersCollectionId,
            [Query.equal("team_id", teamId), Query.equal("user_id", userId)]
        );

        if (memberships.total === 0) {
            throw new Error("Membership not found.");
        }

        const membership = memberships.rows[0];

        // 2. Check if leader (cannot leave, must delete)
        if (membership.role === "leader") {
            throw new Error("Team leader cannot leave. You must delete the team.");
        }

        // 3. Delete membership
        await tablesDB.deleteRow(
            appwriteConfig.databaseId,
            appwriteConfig.teamMembersCollectionId,
            membership.$id
        );

        return { success: true };
    } catch (error: any) {
        console.error("Failed to leave team:", error);
        return { success: false, error: error.message || "Failed to leave team" };
    }
}

/**
 * Deletes a team and all its members.
 * @param teamId - The ID of the team.
 * @param userId - The user requesting delete (must be leader).
 * @returns Success status or error.
 */
export async function deleteTeam(teamId: string, userId: string) {
    try {
        const { getTablesDB } = await createAdminClient();
        const tablesDB = getTablesDB();

        // 1. Verify User is Leader
        const team = await tablesDB.getRow(
            appwriteConfig.databaseId,
            appwriteConfig.eventTeamsCollectionId,
            teamId
        );

        if (team.leader_id !== userId) {
            throw new Error("Only the team leader can delete the team.");
        }

        // 2. Delete all members
        const members = await tablesDB.listRows(
            appwriteConfig.databaseId,
            appwriteConfig.teamMembersCollectionId,
            [Query.equal("team_id", teamId)]
        );

        await Promise.all(members.rows.map(m =>
            tablesDB.deleteRow(
                appwriteConfig.databaseId,
                appwriteConfig.teamMembersCollectionId,
                m.$id
            )
        ));

        // 3. Delete Team
        await tablesDB.deleteRow(
            appwriteConfig.databaseId,
            appwriteConfig.eventTeamsCollectionId,
            teamId
        );

        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete team:", error);
        return { success: false, error: error.message || "Failed to delete team" };
    }
}

/**
 * Gets team details for a user in an event.
 * @param eventId 
 * @param userId 
 * @returns Team object with members or null if not in team.
 */
export async function getUserTeam(eventId: string, userId: string) {
    try {
        const { getTablesDB, getUsers } = await createAdminClient();
        const tablesDB = getTablesDB();
        const usersAPI = getUsers();

        // 1. Find if user is in any team for this event
        const membershipList = await tablesDB.listRows(
            appwriteConfig.databaseId,
            appwriteConfig.teamMembersCollectionId,
            [Query.equal("event_id", eventId), Query.equal("user_id", userId)]
        );

        if (membershipList.total === 0) {
            return null;
        }

        const myMembership = membershipList.rows[0];
        const teamId = myMembership.team_id;

        // 2. Get Team Details
        const team = await tablesDB.getRow(
            appwriteConfig.databaseId,
            appwriteConfig.eventTeamsCollectionId,
            teamId
        ) as unknown as Team;

        // 3. Get All Members
        const allMembers = await tablesDB.listRows(
            appwriteConfig.databaseId,
            appwriteConfig.teamMembersCollectionId,
            [Query.equal("team_id", teamId)]
        );

        // 4. Enrich members with Names
        const enrichedMembers = await Promise.all(allMembers.rows.map(async (m: any) => {
            try {
                // Try fetching user name
                const user = await usersAPI.get(m.user_id);
                return {
                    ...m,
                    name: user.name,
                    email: user.email
                };
            } catch (e) {
                return { ...m, name: "Unknown User", email: "" };
            }
        }));

        return {
            ...team,
            members: enrichedMembers
        };

    } catch (error) {
        console.error("Failed to get user team:", error);
        return null;
    }
}
