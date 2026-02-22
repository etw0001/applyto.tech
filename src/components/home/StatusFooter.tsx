import { motion } from "framer-motion";
import { statusConfig, dotColors } from "@/constants/status";
import { footer } from "@/styles/home";
import type { Application, Status } from "@/types";

interface StatusFooterProps {
    applications: Application[];
    filteredCount: number;
    statusFilter: Status | "all";
    setStatusFilter: (value: Status | "all") => void;
}

export default function StatusFooter({ applications, filteredCount, statusFilter, setStatusFilter }: StatusFooterProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={footer.wrapper}
        >
            <div className={footer.filtersRow}>
                {(Object.keys(statusConfig) as Status[]).map((status) => {
                    const count = applications.filter((app) => app.status === status).length;
                    const isSelected = statusFilter === status;
                    return (
                        <motion.button
                            key={status}
                            onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}
                            className={footer.filterButton(isSelected, statusConfig[status].color)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            data-testid={`quick-filter-${status}`}
                        >
                            <span className={`w-2 h-2 rounded-full ${isSelected ? dotColors[status] : statusConfig[status].bgColor}`} />
                            {statusConfig[status].label}
                            <span className="text-muted-foreground">({count})</span>
                        </motion.button>
                    );
                })}
            </div>

            <p className={footer.count}>
                {filteredCount} of {applications.length} applications
            </p>
        </motion.div>
    );
}
