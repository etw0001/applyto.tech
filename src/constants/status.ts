import { Send, Clock, CheckCircle2, XCircle } from "lucide-react";
import type { Status, Application, SortOption } from "@/types";

export const statusConfig: Record<Status, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
    applied: {
        label: "Applied",
        color: "text-indigo-500",
        bgColor: "bg-indigo-500/10",
        icon: Send,
    },
    interviewing: {
        label: "Interviewing",
        color: "text-[#FBBC04]",
        bgColor: "bg-[#FBBC04]/10",
        icon: Clock,
    },
    offered: {
        label: "Offered",
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
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
    applied: "bg-indigo-500",
    interviewing: "bg-[#FBBC04]",
    offered: "bg-emerald-500",
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

