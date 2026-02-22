import { Send, Clock, CheckCircle2, XCircle } from "lucide-react";
import type { Status, Application, SortOption } from "@/types";

export const statusConfig: Record<Status, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
    applied: {
        label: "Applied",
        color: "text-[#3b82f6]",
        bgColor: "bg-[#3b82f6]/10",
        icon: Send,
    },
    interviewing: {
        label: "Interviewing",
        color: "text-[#f59e0b]",
        bgColor: "bg-[#f59e0b]/10",
        icon: Clock,
    },
    offered: {
        label: "Offered",
        color: "text-[#22c55e]",
        bgColor: "bg-[#22c55e]/10",
        icon: CheckCircle2,
    },
    rejected: {
        label: "Rejected",
        color: "text-rose-500",
        bgColor: "bg-rose-500/10",
        icon: XCircle,
    },
};

export const dotColors: Record<Status, string> = {
    applied: "bg-[#3b82f6]",
    interviewing: "bg-[#f59e0b]",
    offered: "bg-[#22c55e]",
    rejected: "bg-rose-500",
};

export const sortLabels: Record<SortOption, string> = {
    "date-newest": "Date (Newest)",
    "date-oldest": "Date (Oldest)",
    "company-az": "Company (A-Z)",
    "company-za": "Company (Z-A)",
    "role-az": "Role (A-Z)",
    "role-za": "Role (Z-A)",
};

export const mockApplications: Application[] = [
    {
        id: "1",
        company: "Stripe",
        position: "Senior Frontend Engineer",
        link: "https://stripe.com/jobs",
        status: "interviewing",
        dateApplied: "Jan 05, 2026",
    },
    {
        id: "2",
        company: "Vercel",
        position: "Staff Software Engineer",
        link: "https://vercel.com/careers",
        status: "applied",
        dateApplied: "Jan 03, 2026",
    },
    {
        id: "3",
        company: "Linear",
        position: "Product Engineer",
        link: "https://linear.app/careers",
        status: "offered",
        dateApplied: "Dec 28, 2025",
    },
    {
        id: "4",
        company: "Figma",
        position: "Design Engineer",
        link: "https://figma.com/careers",
        status: "rejected",
        dateApplied: "Dec 20, 2025",
    },
    {
        id: "5",
        company: "Notion",
        position: "Full Stack Engineer",
        link: "https://notion.so/careers",
        status: "applied",
        dateApplied: "Jan 07, 2026",
    },
];
