export type Status = "applied" | "interviewing" | "offered" | "rejected";

export interface Application {
    id: string;
    company: string;
    position: string;
    link: string | null;
    status: Status;
    dateApplied: string;
}

export interface UserProfile {
    name: string;
    email: string;
    avatar: string;
}

export type SortOption = "date-newest" | "date-oldest" | "company-az" | "company-za" | "role-az" | "role-za";
