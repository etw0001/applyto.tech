import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Briefcase, Calendar as CalendarIcon, TrendingUp, Clock } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";
import { stats } from "@/styles/home";
import type { Application } from "@/types";

interface StatsCardsProps {
    applications: Application[];
    isSignedIn: boolean;
}

/**
 * Gets the start (Sunday) and end (Saturday) of the current week in local time
 */
function getCurrentWeekBounds(): { start: Date; end: Date } {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Calculate start of week (Sunday)
    const start = new Date(now);
    start.setDate(now.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);

    // Calculate end of week (Saturday)
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
}

/**
 * Gets a unique identifier for the current week (Sunday's date as YYYY-MM-DD)
 */
function getCurrentWeekId(): string {
    const { start } = getCurrentWeekBounds();
    return start.toISOString().split('T')[0];
}

/**
 * Checks if a date string (formatted as "Jan 15, 2024") falls within the current week
 */
function isDateInCurrentWeek(dateApplied: string): boolean {
    try {
        const date = new Date(dateApplied);
        if (isNaN(date.getTime())) {
            return false;
        }

        const { start, end } = getCurrentWeekBounds();
        return date >= start && date <= end;
    } catch {
        return false;
    }
}

/**
 * Gets the net count for the current week from localStorage
 * This tracks: (apps added this week) - (deletions this week)
 */
function getNetWeekCount(isSignedIn: boolean): number {
    try {
        const weekId = getCurrentWeekId();
        const key = isSignedIn ? `week_net_count_signedin_${weekId}` : `week_net_count_signedout_${weekId}`;
        const stored = localStorage.getItem(key);
        return stored ? parseInt(stored, 10) : 0;
    } catch {
        return 0;
    }
}

/**
 * Sets the net count for the current week in localStorage
 */
function setNetWeekCount(count: number, isSignedIn: boolean): void {
    try {
        const weekId = getCurrentWeekId();
        const key = isSignedIn ? `week_net_count_signedin_${weekId}` : `week_net_count_signedout_${weekId}`;
        localStorage.setItem(key, String(Math.max(0, count)));
    } catch {
        // Ignore localStorage errors
    }
}

/**
 * Increments the net count (when an app is added this week)
 */
function incrementNetWeekCount(isSignedIn: boolean): void {
    const current = getNetWeekCount(isSignedIn);
    setNetWeekCount(current + 1, isSignedIn);
}

/**
 * Decrements the net count (when any app is deleted)
 */
function decrementNetWeekCount(isSignedIn: boolean): void {
    const current = getNetWeekCount(isSignedIn);
    setNetWeekCount(current - 1, isSignedIn);
}

export default function StatsCards({ applications, isSignedIn }: StatsCardsProps) {
    const totalApps = applications.length;
    const interviewRate = totalApps > 0
        ? Math.round((applications.filter(a => a.status === "interviewing" || a.status === "offered").length / totalApps) * 100)
        : 0;
    const activeCount = applications.filter(a => a.status === "applied" || a.status === "interviewing").length;

    // Track current week and net count
    const [currentWeekId, setCurrentWeekId] = useState(getCurrentWeekId());
    const [netCount, setNetCount] = useState(getNetWeekCount(isSignedIn));

    // Count applications applied this week (Sunday to Saturday)
    const applicationsThisWeek = applications.filter(app => isDateInCurrentWeek(app.dateApplied));
    const currentWeekAppsCount = applicationsThisWeek.length;

    // Sync net count with actual apps from this week, but preserve deletions
    useEffect(() => {
        const weekId = getCurrentWeekId();
        const prefix = isSignedIn ? 'week_net_count_signedin_' : 'week_net_count_signedout_';

        if (weekId !== currentWeekId) {
            // Week changed, clean up old data and reset
            try {
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith(prefix) && !key.includes(weekId)) {
                        localStorage.removeItem(key);
                    }
                });
            } catch {
                // Ignore localStorage errors
            }
            setCurrentWeekId(weekId);
            // Start new week with count of apps from this week
            const initialCount = currentWeekAppsCount;
            setNetCount(initialCount);
            setNetWeekCount(initialCount, isSignedIn);
        } else {
            // Same week - sync from localStorage first
            const storedNetCount = getNetWeekCount(isSignedIn);
            setNetCount(storedNetCount);

            // If current count of apps from this week is higher than net count,
            // it means new apps were added this week (net count hasn't caught up yet)
            // Update net count to reflect new additions
            if (currentWeekAppsCount > storedNetCount) {
                const difference = currentWeekAppsCount - storedNetCount;
                const newNetCount = storedNetCount + difference;
                setNetCount(newNetCount);
                setNetWeekCount(newNetCount, isSignedIn);
            }
            // Note: We don't decrease netCount when currentWeekAppsCount decreases,
            // because that's handled by decrementWeekCount() when deletions happen
        }
    }, [currentWeekId, currentWeekAppsCount, isSignedIn, applications]);

    // Expose increment and decrement functions globally so they can be called from Home.tsx
    useEffect(() => {
        const incrementFn = () => {
            incrementNetWeekCount(isSignedIn);
            setNetCount(getNetWeekCount(isSignedIn));
        };
        const decrementFn = () => {
            decrementNetWeekCount(isSignedIn);
            setNetCount(getNetWeekCount(isSignedIn));
        };
        (window as any).incrementWeekCount = incrementFn;
        (window as any).decrementWeekCount = decrementFn;
        return () => {
            delete (window as any).incrementWeekCount;
            delete (window as any).decrementWeekCount;
        };
    }, [isSignedIn]);

    // Final count is the net count (cannot go below 0)
    const thisWeekCount = Math.max(0, netCount);

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
                    <AnimatedCounter value={thisWeekCount} />
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
