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

