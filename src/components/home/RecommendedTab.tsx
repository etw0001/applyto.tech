import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ExternalLink, MapPin, Sparkles, Loader2, AlertTriangle, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getRecommended, INTERNSHIP_CATEGORIES, type RecommendedInternship, type InternshipCategory } from "@/utils/getRecommended";
import { recommended } from "@/styles/home";

export default function RecommendedTab() {
    const [internships, setInternships] = useState<RecommendedInternship[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<InternshipCategory | "all">("all");
    const [displayCount, setDisplayCount] = useState(100);
    const fetched = useRef(false);
    const scrollRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        setDisplayCount(100);
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, [search, category]);

    const handleScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        if (el.scrollHeight - el.scrollTop - el.clientHeight < 200) {
            setDisplayCount((prev) => prev + 100);
        }
    }, []);

    const filtered = internships
        .filter((item) => category === "all" || item.category === category)
        .filter(
            (item) =>
                search === "" ||
                item.company.toLowerCase().includes(search.toLowerCase()) ||
                item.role.toLowerCase().includes(search.toLowerCase()) ||
                item.location.toLowerCase().includes(search.toLowerCase())
        );

    const categoryCounts = internships.reduce<Record<string, number>>((acc, item) => {
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

    return (
        <div>
            {/* Category filter pills */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <motion.button
                    onClick={() => setCategory("all")}
                    className={recommended.pill(category === "all")}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                >
                    All ({internships.length})
                </motion.button>
                {INTERNSHIP_CATEGORIES.map((cat) => (
                    <motion.button
                        key={cat}
                        onClick={() => setCategory(category === cat ? "all" : cat)}
                        className={recommended.pill(category === cat)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        {cat} ({categoryCounts[cat] || 0})
                    </motion.button>
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
                        <div className="col-span-4">Role</div>
                        <div className="col-span-2">Location</div>
                        <div className="col-span-1">Posted</div>
                        <div className="col-span-2 text-right">Apply</div>
                    </div>

                    <div className="max-h-[600px] overflow-y-auto" ref={scrollRef} onScroll={handleScroll}>
                        {filtered.slice(0, displayCount).map((item, index) => (
                            <div key={`${item.company}-${item.role}-${index}`} className={recommended.tableRow}>
                                <div className="col-span-3 flex items-center gap-3">
                                    <div className={recommended.companyAvatar}>{item.company.charAt(0)}</div>
                                    <span className="text-sm font-medium text-foreground truncate">{item.company}</span>
                                </div>
                                <div className="col-span-4">
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
                                <div className="col-span-2 flex justify-end">
                                    <a href={item.link} target="_blank" rel="noopener noreferrer" className={recommended.applyButton}>
                                        Apply
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        ))}
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
                    <Sparkles className="w-3 h-3" />
                    Sourced from SimplifyJobs/Summer2026-Internships
                </p>
            </div>
        </div>
    );
}
