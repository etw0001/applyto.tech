import { motion } from "framer-motion";
import { Briefcase, Calendar as CalendarIcon, TrendingUp, Clock } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";
import { stats } from "@/styles/home";
import type { Application } from "@/types";

interface StatsCardsProps {
    applications: Application[];
}

export default function StatsCards({ applications }: StatsCardsProps) {
    const totalApps = applications.length;
    const interviewRate = totalApps > 0
        ? Math.round((applications.filter(a => a.status === "interviewing" || a.status === "offered").length / totalApps) * 100)
        : 0;
    const activeCount = applications.filter(a => a.status === "applied" || a.status === "interviewing").length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={stats.grid}
        >
            <motion.div className={stats.card} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                <div className={stats.cardHeader}>
                    <span className={stats.cardLabel}>Total</span>
                    <Briefcase className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <div className={stats.cardValue}>
                    <AnimatedCounter value={totalApps} />
                </div>
            </motion.div>

            <motion.div className={stats.card} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                <div className={stats.cardHeader}>
                    <span className={stats.cardLabel}>This Week</span>
                    <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <div className={stats.cardValue}>
                    <AnimatedCounter value={3} />
                </div>
            </motion.div>

            <motion.div className={stats.card} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                <div className={stats.cardHeader}>
                    <span className={stats.cardLabel}>Interview Rate</span>
                    <TrendingUp className="w-3.5 h-3.5 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                </div>
                <div className={stats.cardValue}>
                    <AnimatedCounter value={interviewRate} />%
                </div>
            </motion.div>

            <motion.div className={stats.card} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                <div className={stats.cardHeader}>
                    <span className={stats.cardLabel}>Active</span>
                    <Clock className="w-3.5 h-3.5 text-muted-foreground group-hover:text-sky-500 transition-colors" />
                </div>
                <div className={stats.cardValue}>
                    <AnimatedCounter value={activeCount} />
                </div>
            </motion.div>
        </motion.div>
    );
}
