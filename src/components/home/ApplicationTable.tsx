import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Trash2, Briefcase } from "lucide-react";
import { statusConfig } from "@/constants/status";
import { statusBadge, table } from "@/styles/home";
import type { Application, Status } from "@/types";

interface ApplicationTableProps {
    applications: Application[];
    darkMode: boolean;
    searchQuery: string;
    statusFilter: Status | "all";
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
    openStatusDropdown,
    setOpenStatusDropdown,
    onStatusChange,
    onDelete,
}: ApplicationTableProps) {
    const statusDropdownRefs = useRef<Map<string, HTMLDivElement>>(new Map());

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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={table.container}
        >
            <div className={table.header}>
                <div className="col-span-3">Company</div>
                <div className="col-span-4">Role</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 pl-4">Date Applied</div>
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
                        {searchQuery || statusFilter !== "all" ? "No applications match your filters" : "No applications yet"}
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
}
