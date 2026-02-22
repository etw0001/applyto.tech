import { motion } from "framer-motion";
import { statusConfig, dotColors } from "@/constants/status";
import { footer } from "@/styles/home";
import type { Application, Status } from "@/types";

interface StatusFooterProps {
    applications: Application[];
    filteredCount: number;
    statusFilter: Status[];
    setStatusFilter: (value: Status[]) => void;
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
                    const isSelected = statusFilter.includes(status);
                    return (
                        <motion.button
                            key={status}
                            onClick={() => {
                                if (isSelected) {
                                    // Remove from filter
                                    setStatusFilter(statusFilter.filter(s => s !== status));
                                } else {
                                    // Add to filter in the correct order
                                    const statusOrder: Status[] = ["applied", "interviewing", "offered", "rejected"];
                                    const newFilter = [...statusFilter, status].sort((a, b) =>
                                        statusOrder.indexOf(a) - statusOrder.indexOf(b)
                                    );
                                    setStatusFilter(newFilter);
                                }
                            }}
                            className={footer.filterButton(isSelected, statusConfig[status].color)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            data-testid={`quick-filter-${status}`}
                        >
                            <span className={`w-2 h-2 rounded-full ${isSelected ? dotColors[status] : `${dotColors[status]}/30`}`} />
                            {statusConfig[status].label}
                        </motion.button>
                    );
                })}
            </div>

            <p className={footer.count}>
                {filteredCount} {filteredCount === 1 ? "application" : "applications"}
            </p>
        </motion.div>
    );
}
