import { Models } from "node-appwrite";

export interface Event extends Models.Document {
    name: string;
    date: string;
    description: string;
    image_id: string;
    type: string;
    location: string;
    fee: number;
    prize_pool: number;
    num_seats: number;
    is_solo: boolean;
    is_team_event: boolean;
    is_published: boolean;
    rulebook_link?: string;
    day: number;
    start_time?: string;
    end_time?: string;
}

export interface User extends Models.Document {
    phone: string;
    gender: string;
    email: string;
    is_nitpy: boolean;
    college_name?: string;
    tech_credits?: number;
    fun_credits?: number;
    tier?: number; // 1, 2, or 3 corresponding to TIERS
}

export interface EventCoordinator extends Models.Document {
    coordinator_id: string;
    event_id: string;
}

export interface Registration extends Models.Document {
    event_id: string;
    user_id: string;
}

export interface Team extends Models.Document {
    name: string;
    leader_id: string;
    event_id: string;
    orion_idea?: string;
}

export interface TeamMember extends Models.Document {
    team_id: string;
    user_id: string;
    event_id: string;
    role: "leader" | "member";
}

export type EventSummary = {
    id: string;
    name: string;
    date: string;
    type: string;
    fee: number;
    day: number; // Dashboard expects number for display
    status: "Published" | "Draft";
};
