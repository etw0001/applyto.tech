import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ExternalLink, MapPin, Sparkles, Loader2, AlertTriangle, Briefcase, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getRecommended, INTERNSHIP_CATEGORIES, type RecommendedInternship, type InternshipCategory } from "@/utils/getRecommended";
import { recommended } from "@/styles/home";
import type { Application, Status } from "@/types";

interface RecommendedTabProps {
    applications: Application[];
    isSignedIn: boolean;
    onAddToTracker: (data: { company: string; position: string; link: string; status: Status; dateApplied: string }) => Promise<void>;
}

export default function RecommendedTab({ applications, isSignedIn, onAddToTracker }: RecommendedTabProps) {
    const [internships, setInternships] = useState<RecommendedInternship[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<InternshipCategory | "all">("all");
    const [displayCount, setDisplayCount] = useState(100);
    const [addingItems, setAddingItems] = useState<Set<string>>(new Set());
    const fetched = useRef(false);

    useEffect(() => {
        if (!fetched.current) {
            fetched.current = true;
            setLoading(true);
            setError(null);
            getRecommended()
                .then((data) => setInternships(data || []))
                .catch(() => setError("Failed to load recommended internships. Please try again."))
                .finally(() => setLoading(false));
        }
    }, []);

    // Build a set of "company|role" keys from user's existing applications for fast lookup
    const appliedKeys = new Set(
        applications.map((app) => `${app.company.toLowerCase().trim()}|${app.position.toLowerCase().trim()}`)
    );

    const isAlreadyAdded = (item: RecommendedInternship) =>
        appliedKeys.has(`${item.company.toLowerCase().trim()}|${item.role.toLowerCase().trim()}`);

    // Exclude tracked internships from the list entirely
    const untrackedInternships = internships.filter((item) => !isAlreadyAdded(item));

    const filtered = untrackedInternships
        .filter((item) => category === "all" || item.category === category)
        .filter(
            (item) =>
                search === "" ||
                item.company.toLowerCase().includes(search.toLowerCase()) ||
                item.role.toLowerCase().includes(search.toLowerCase()) ||
                item.location.toLowerCase().includes(search.toLowerCase())
        );

    useEffect(() => {
        setDisplayCount(100);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [search, category]);

    const handleScroll = useCallback(() => {
        // Check if user is near the bottom of the page
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // Load more when within 500px of bottom
        if (documentHeight - (scrollTop + windowHeight) < 500) {
            setDisplayCount((prev) => {
                const next = prev + 100;
                // Don't load more than the total filtered items
                return Math.min(next, filtered.length);
            });
        }
    }, [filtered.length]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const categoryCounts = untrackedInternships.reduce<Record<string, number>>((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
    }, {});

    const handleRetry = () => {
        fetched.current = false;
        setLoading(true);
        setError(null);
        getRecommended()
            .then((data) => {
                setInternships(data || []);
                fetched.current = true;
            })
            .catch(() => setError("Failed to load recommended internships. Please try again."))
            .finally(() => setLoading(false));
    };

    const handleAddToTracker = async (item: RecommendedInternship) => {
        const itemKey = `${item.company}|${item.role}`;
        setAddingItems((prev) => new Set(prev).add(itemKey));
        try {
            const today = new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
            });
            await onAddToTracker({
                company: item.company,
                position: item.role,
                link: item.link,
                status: "applied",
                dateApplied: today,
            });
        } catch (err) {
            console.error("Error adding to tracker:", err);
        } finally {
            setAddingItems((prev) => {
                const next = new Set(prev);
                next.delete(itemKey);
                return next;
            });
        }
    };

    return (
        <div>
            {/* Category filter pills */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <button
                    onClick={() => setCategory("all")}
                    className={`${recommended.pill(category === "all")} relative`}
                >
                    <span className="invisible">All (9999)</span>
                    <span className="absolute inset-0 flex items-center justify-center">All ({untrackedInternships.length})</span>
                </button>
                {INTERNSHIP_CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setCategory(category === cat ? "all" : cat)}
                        className={`${recommended.categoryPill(category === cat)} relative`}
                    >
                        <span className="invisible">{cat} (9999)</span>
                        <span className="absolute inset-0 flex items-center justify-center">{cat} ({categoryCounts[cat] || 0})</span>
                    </button>
                ))}
            </div>

            {/* Search bar */}
            <div className="flex items-center gap-2 mb-4">
                <div className={recommended.searchWrapper}>
                    <Search className={recommended.searchIcon} />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search internships..."
                        className={recommended.searchInput}
                    />
                    <AnimatePresence>
                        {search && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={() => setSearch("")}
                                className={recommended.clearButton}
                            >
                                <X className="w-3.5 h-3.5" />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
                <span className="text-xs text-muted-foreground ml-auto">
                    {loading ? "Loading..." : `${filtered.length} internships`}
                </span>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <Loader2 className="w-6 h-6 text-muted-foreground" />
                    </motion.div>
                    <p className="text-sm text-muted-foreground">Loading recommended internships...</p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <AlertTriangle className="w-6 h-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{error}</p>
                    <Button size="sm" variant="ghost" onClick={handleRetry} className="text-xs">
                        Retry
                    </Button>
                </div>
            ) : (
                <div className={recommended.tableContainer}>
                    <div className={recommended.tableHeader}>
                        <div className="col-span-3">Company</div>
                        <div className="col-span-3">Role</div>
                        <div className="col-span-2">Location</div>
                        <div className="col-span-1">Posted</div>
                        <div className="col-span-3 text-right">Actions</div>
                    </div>

                    <div>
                        {filtered.slice(0, displayCount).map((item, index) => {
                            const itemKey = `${item.company}|${item.role}`;
                            const isAdding = addingItems.has(itemKey);

                            return (
                                <div
                                    key={`${item.company}-${item.role}-${index}`}
                                    className={recommended.tableRow}
                                >
                                    <div className="col-span-3 flex items-center gap-3">
                                        <div className={recommended.companyAvatar}>{item.company.charAt(0)}</div>
                                        <span className="text-sm font-medium text-foreground truncate">{item.company}</span>
                                    </div>
                                    <div className="col-span-3">
                                        <span className="text-sm text-foreground/80 line-clamp-2">{item.role}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <MapPin className="w-3 h-3 shrink-0" />
                                            <span className="truncate">{item.location}</span>
                                        </span>
                                    </div>
                                    <div className="col-span-1">
                                        <span className="text-xs text-muted-foreground">{item.posted}</span>
                                    </div>
                                    <div className="col-span-3 flex justify-end gap-2">
                                        <motion.button
                                            onClick={() => handleAddToTracker(item)}
                                            disabled={isAdding}
                                            className={recommended.addButton}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {isAdding ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <Plus className="w-3 h-3" />
                                            )}
                                            {isAdding ? "Adding..." : "Track"}
                                        </motion.button>
                                        <a href={item.link} target="_blank" rel="noopener noreferrer" className={recommended.applyButton}>
                                            Apply
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filtered.length === 0 && !loading && (
                        <div className={recommended.emptyState}>
                            <Briefcase className="w-5 h-5 text-muted-foreground mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">
                                {search ? "No internships match your search" : "No internships found"}
                            </p>
                        </div>
                    )}
                </div>
            )}

            <div className="mt-4">
                <p className={recommended.source}>
                    Sourced from SimplifyJobs/Summer2026-Internships
                </p>
            </div>
        </div>
    );
}
