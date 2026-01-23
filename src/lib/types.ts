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
    g_form_link?: string;
    day: number[];
}

export interface User extends Models.Document {
    phone: string;
    gender: string;
    email: string;
    is_nitpy: boolean;
    college_name?: string;
    tech_credits?: number;
    fun_credits?: number;
}

export interface EventCoordinator extends Models.Document {
    coordinator_id: string;
    event_id: string;
}

export interface Registration extends Models.Document {
    event_id: string;
    user_id: string;
}

export type EventSummary = {
    id: string;
    name: string;
    date: string;
    type: string;
    fee: number;
    day: string[]; // Dashboard expects string[] for display, so we will map numbers to strings in getRecentEvents
    status: "Published" | "Draft";
};
