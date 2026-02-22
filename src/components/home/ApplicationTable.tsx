import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Trash2, Briefcase, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
import { statusConfig, dotColors } from "@/constants/status";
import { statusBadge, table, recommended } from "@/styles/home";
import type { Application, Status, SortOption } from "@/types";

interface ApplicationTableProps {
    applications: Application[];
    darkMode: boolean;
    searchQuery: string;
    statusFilter: Status[];
    sortBy: SortOption;
    setSortBy: (value: SortOption) => void;
    setStatusFilter: (value: Status[]) => void;
    openStatusDropdown: string | null;
    setOpenStatusDropdown: (id: string | null) => void;
    onStatusChange: (id: string, status: Status) => void;
    onDelete: (id: string) => void;
}

export default function ApplicationTable({
    applications,
    darkMode,
    searchQuery,
    statusFilter,
    sortBy,
    setSortBy,
    setStatusFilter,
    openStatusDropdown,
    setOpenStatusDropdown,
    onStatusChange,
    onDelete,
}: ApplicationTableProps) {
    const statusDropdownRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const dateSortStateRef = useRef<"default" | "oldest" | "newest-explicit">("default");

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openStatusDropdown) {
                const statusRef = statusDropdownRefs.current.get(openStatusDropdown);
                if (statusRef && !statusRef.contains(event.target as Node)) {
                    setOpenStatusDropdown(null);
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openStatusDropdown, setOpenStatusDropdown]);

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={table.container}
            >
                <div className={table.header}>
                    <div className="col-span-3 flex items-center gap-2">
                        <span>Company</span>
                        <div className="flex items-center gap-0.5">
                            <button
                                onClick={() => {
                                    if (sortBy === "company-az") {
                                        setSortBy("company-za");
                                    } else if (sortBy === "company-za") {
                                        dateSortStateRef.current = "default";
                                        setSortBy("date-newest"); // Reset to default
                                    } else {
                                        dateSortStateRef.current = "default";
                                        setSortBy("company-az");
                                    }
                                }}
                                className="p-0.5 rounded hover:bg-secondary/50 transition-colors"
                                title={sortBy === "company-az" ? "A-Z" : sortBy === "company-za" ? "Z-A" : "Sort"}
                            >
                                {sortBy === "company-az" ? (
                                    <ChevronUp className="w-3 h-3 text-foreground" />
                                ) : sortBy === "company-za" ? (
                                    <ChevronDown className="w-3 h-3 text-foreground" />
                                ) : (
                                    <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="col-span-4 flex items-center gap-2">
                        <span>Role</span>
                        <div className="flex items-center gap-0.5">
                            <button
                                onClick={() => {
                                    if (sortBy === "role-az") {
                                        setSortBy("role-za");
                                    } else if (sortBy === "role-za") {
                                        dateSortStateRef.current = "default";
                                        setSortBy("date-newest"); // Reset to default
                                    } else {
                                        dateSortStateRef.current = "default";
                                        setSortBy("role-az");
                                    }
                                }}
                                className="p-0.5 rounded hover:bg-secondary/50 transition-colors"
                                title={sortBy === "role-az" ? "A-Z" : sortBy === "role-za" ? "Z-A" : "Sort"}
                            >
                                {sortBy === "role-az" ? (
                                    <ChevronUp className="w-3 h-3 text-foreground" />
                                ) : sortBy === "role-za" ? (
                                    <ChevronDown className="w-3 h-3 text-foreground" />
                                ) : (
                                    <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                        <span>Status</span>
                        <div className="flex items-center gap-1">
                            {(Object.keys(statusConfig) as Status[]).map((status) => {
                                const isSelected = statusFilter.includes(status);
                                return (
                                    <button
                                        key={status}
                                        onClick={() => {
                                            if (isSelected) {
                                                setStatusFilter(statusFilter.filter(s => s !== status));
                                            } else {
                                                const statusOrder: Status[] = ["applied", "interviewing", "offered", "rejected"];
                                                const newFilter = [...statusFilter, status].sort((a, b) =>
                                                    statusOrder.indexOf(a) - statusOrder.indexOf(b)
                                                );
                                                setStatusFilter(newFilter);
                                            }
                                        }}
                                        className={`w-1.5 h-1.5 rounded-full transition-all ${isSelected ? dotColors[status] : statusConfig[status].bgColor} hover:scale-125`}
                                        title={statusConfig[status].label}
                                    />
                                );
                            })}
                        </div>
                    </div>
                    <div className="col-span-2 pl-4 flex items-center gap-2">
                        <span>Date Applied</span>
                        <div className="flex items-center gap-0.5">
                            <button
                                onClick={() => {
                                    const isCompanyOrRoleSort = sortBy === "company-az" || sortBy === "company-za" ||
                                        sortBy === "role-az" || sortBy === "role-za";

                                    if (sortBy === "date-oldest") {
                                        // From date-oldest, go to date-newest (explicit - will show down arrow)
                                        setSortBy("date-newest");
                                    } else if (sortBy === "date-newest") {
                                        // From date-newest
                                        if (isCompanyOrRoleSort) {
                                            // We're on a company/role sort, so date-newest click means go to date-oldest
                                            setSortBy("date-oldest");
                                        } else {
                                            // We're on date-newest (could be default or explicit)
                                            // If we got here by clicking, it means we want to cycle: default -> date-oldest -> date-newest -> default
                                            // Since we're already on date-newest, check if we should go to date-oldest or stay default
                                            // We'll use a trick: temporarily set to date-oldest, then check in render
                                            // Actually, simpler: if clicking date-newest from default, go to date-oldest
                                            // If clicking date-newest from explicit (after date-oldest), we need to detect that
                                            // For now, let's just cycle: default -> date-oldest -> date-newest (explicit) -> default
                                            // We can't distinguish, so let's assume: if on date-newest and not company/role, clicking goes to date-oldest
                                            setSortBy("date-oldest");
                                        }
                                    } else {
                                        // From other sort (company/role), go to date-oldest
                                        setSortBy("date-oldest");
                                    }
                                }}
                                className="p-0.5 rounded hover:bg-secondary/50 transition-colors"
                                title={sortBy === "date-newest" ? "Newest" : sortBy === "date-oldest" ? "Oldest" : "Sort"}
                            >
                                {(() => {
                                    if (sortBy === "date-oldest") {
                                        return <ChevronUp className="w-3 h-3 text-foreground" />;
                                    } else if (sortBy === "date-newest") {
                                        // Check if it's default state or explicit
                                        if (dateSortStateRef.current === "newest-explicit") {
                                            // Explicit date-newest - show down arrow
                                            return <ChevronDown className="w-3 h-3 text-foreground" />;
                                        } else {
                                            // Default state - show down arrow
                                            return <ChevronDown className="w-3 h-3 text-muted-foreground" />;
                                        }
                                    } else {
                                        // Other sorts (company/role) - show down arrow for date (default state)
                                        dateSortStateRef.current = "default";
                                        return <ChevronDown className="w-3 h-3 text-muted-foreground" />;
                                    }
                                })()}
                            </button>
                        </div>
                    </div>
                    <div className="col-span-1"></div>
                </div>

                <div>
                    {applications.map((app) => (
                        <div key={app.id} className={table.row} data-testid={`row-application-${app.id}`}>
                            {/* Company */}
                            <div className="col-span-3 flex items-center gap-3">
                                <motion.div
                                    className={table.companyAvatar}
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                >
                                    {app.company.charAt(0)}
                                </motion.div>
                                <span className={table.companyName} data-testid={`text-company-${app.id}`}>
                                    {app.company}
                                </span>
                            </div>

                            {/* Position */}
                            <div className="col-span-4">
                                <div className="flex items-center gap-2">
                                    <span className={table.position} data-testid={`text-position-${app.id}`}>
                                        {app.position}
                                    </span>
                                    {app.link && (
                                        <motion.a
                                            href={app.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={table.externalLink}
                                            whileHover={{ scale: 1.1 }}
                                            data-testid={`link-job-${app.id}`}
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </motion.a>
                                    )}
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="col-span-2">
                                <div
                                    className="relative"
                                    ref={(el) => {
                                        if (el) statusDropdownRefs.current.set(app.id, el);
                                        else statusDropdownRefs.current.delete(app.id);
                                    }}
                                >
                                    <motion.button
                                        onClick={() => setOpenStatusDropdown(openStatusDropdown === app.id ? null : app.id)}
                                        className={`${statusBadge.base} ${statusBadge.variants(app.status, darkMode)}`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.98 }}
                                        data-testid={`badge-status-${app.id}`}
                                    >
                                        {(() => {
                                            const StatusIcon = statusConfig[app.status].icon;
                                            return <StatusIcon className="w-3 h-3 opacity-90 group-hover/status:opacity-100 transition-opacity" />;
                                        })()}
                                        {statusConfig[app.status].label}
                                    </motion.button>
                                    <AnimatePresence>
                                        {openStatusDropdown === app.id && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                className={table.statusDropdown}
                                            >
                                                {(Object.keys(statusConfig) as Status[]).map((status, index) => (
                                                    <motion.button
                                                        key={status}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.03 }}
                                                        onClick={() => onStatusChange(app.id, status)}
                                                        className={`w-full flex items-center px-3 py-1.5 hover:bg-secondary/50 transition-colors text-xs ${app.status === status ? statusConfig[status].color : "text-muted-foreground"}`}
                                                    >
                                                        {statusConfig[status].label}
                                                    </motion.button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Date */}
                            <div className={table.dateText} data-testid={`text-date-${app.id}`}>
                                {app.dateApplied}
                            </div>

                            {/* Delete */}
                            <div className="col-span-1 flex justify-end">
                                <motion.button
                                    onClick={() => onDelete(app.id)}
                                    className={table.deleteButton}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    data-testid={`button-delete-${app.id}`}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </motion.button>
                            </div>
                        </div>
                    ))}
                </div>

                {applications.length === 0 && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={table.emptyWrapper}>
                        <motion.div
                            className={table.emptyIcon}
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                            <Briefcase className="w-5 h-5 text-muted-foreground" />
                        </motion.div>
                        <p className={table.emptyText}>
                            {searchQuery || statusFilter.length < 4 ? "No applications match your filters" : "No applications yet"}
                        </p>
                    </motion.div>
                )}
            </motion.div>

            <div className="mt-4 flex justify-end">
                <p className={recommended.source}>
                    {applications.length} {applications.length === 1 ? "application" : "applications"}
                </p>
            </div>
        </>
    );
}
