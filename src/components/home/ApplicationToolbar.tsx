import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Filter, ArrowUpDown, ChevronDown, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { statusConfig, sortLabels } from "@/constants/status";
import { toolbar } from "@/styles/home";
import type { Status, SortOption } from "@/types";

interface ApplicationToolbarProps {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    statusFilter: Status[];
    setStatusFilter: (value: Status[]) => void;
    sortBy: SortOption;
    setSortBy: (value: SortOption) => void;
    filterDropdownOpen: boolean;
    setFilterDropdownOpen: (value: boolean) => void;
    sortDropdownOpen: boolean;
    setSortDropdownOpen: (value: boolean) => void;
    showForm: boolean;
    setShowForm: (value: boolean) => void;
}

export default function ApplicationToolbar({
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    filterDropdownOpen,
    setFilterDropdownOpen,
    sortDropdownOpen,
    setSortDropdownOpen,
    showForm,
    setShowForm,
}: ApplicationToolbarProps) {
    const filterRef = useRef<HTMLDivElement>(null);
    const sortRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (filterRef.current && !filterRef.current.contains(target)) setFilterDropdownOpen(false);
            if (sortRef.current && !sortRef.current.contains(target)) setSortDropdownOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setFilterDropdownOpen, setSortDropdownOpen]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className={toolbar.wrapper}
        >
            {/* Search */}
            <div className={toolbar.searchWrapper}>
                <Search className={toolbar.searchIcon} />
                <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search applications..."
                    className={toolbar.searchInput}
                    data-testid="input-search"
                />
                <AnimatePresence>
                    {searchQuery && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={() => setSearchQuery("")}
                            className={toolbar.clearSearchButton}
                            data-testid="button-clear-search"
                        >
                            <X className="w-3.5 h-3.5" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* Filter */}
            <div className="relative" ref={filterRef}>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setFilterDropdownOpen(!filterDropdownOpen); setSortDropdownOpen(false); }}
                    className={toolbar.filterButton(statusFilter.length < 4)}
                    data-testid="button-filter-status"
                >
                    <Filter className="w-3.5 h-3.5" />
                    {statusFilter.length === 4
                        ? "All"
                        : statusFilter.length === 1
                            ? statusConfig[statusFilter[0]].label
                            : `${statusFilter.length} selected`}
                    <ChevronDown className="w-3 h-3" />
                </motion.button>
                <AnimatePresence>
                    {filterDropdownOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -5, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -5, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className={`${toolbar.dropdown} min-w-[140px]`}
                        >
                            <motion.button
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={() => {
                                    const allStatuses: Status[] = ["applied", "interviewing", "offered", "rejected"];
                                    setStatusFilter(allStatuses);
                                    setFilterDropdownOpen(false);
                                }}
                                className={toolbar.dropdownItem(statusFilter.length === 4)}
                                data-testid="filter-all"
                            >
                                All
                            </motion.button>
                            {(Object.keys(statusConfig) as Status[]).map((status, index) => {
                                const isSelected = statusFilter.includes(status);
                                return (
                                    <motion.button
                                        key={status}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: (index + 1) * 0.03 }}
                                        onClick={() => {
                                            if (isSelected) {
                                                setStatusFilter(statusFilter.filter(s => s !== status));
                                            } else {
                                                // Add status in the correct order
                                                const statusOrder: Status[] = ["applied", "interviewing", "offered", "rejected"];
                                                const newFilter = [...statusFilter, status].sort((a, b) =>
                                                    statusOrder.indexOf(a) - statusOrder.indexOf(b)
                                                );
                                                setStatusFilter(newFilter);
                                            }
                                        }}
                                        className={`w-full flex items-center px-3 py-2 hover:bg-secondary/50 transition-colors text-sm ${isSelected ? statusConfig[status].color : "text-muted-foreground"}`}
                                        data-testid={`filter-${status}`}
                                    >
                                        {statusConfig[status].label}
                                    </motion.button>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Sort */}
            <div className="relative" ref={sortRef}>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setSortDropdownOpen(!sortDropdownOpen); setFilterDropdownOpen(false); }}
                    className={toolbar.sortButton}
                    data-testid="button-sort"
                >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    {sortLabels[sortBy]}
                    <ChevronDown className="w-3 h-3" />
                </motion.button>
                <AnimatePresence>
                    {sortDropdownOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -5, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -5, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className={`${toolbar.dropdown} min-w-[160px]`}
                        >
                            {(Object.keys(sortLabels) as SortOption[]).map((option, index) => (
                                <motion.button
                                    key={option}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    onClick={() => { setSortBy(option); setSortDropdownOpen(false); }}
                                    className={toolbar.dropdownItem(sortBy === option)}
                                    data-testid={`sort-${option}`}
                                >
                                    {sortLabels[option]}
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Reset */}
            <AnimatePresence>
                {(statusFilter.length < 4 || searchQuery || sortBy !== "date-newest") && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={() => {
                            setStatusFilter(["applied", "interviewing", "offered", "rejected"]);
                            setSearchQuery("");
                            setSortBy("date-newest");
                        }}
                        className={toolbar.clearAll}
                        data-testid="button-reset"
                    >
                        Reset
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Add Button */}
            <AnimatePresence mode="wait">
                {!showForm && (
                    <motion.div
                        key="add-button"
                        className="ml-auto"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button onClick={() => setShowForm(true)} size="sm" className={toolbar.addButton} data-testid="button-add-new">
                            <Plus className="w-3.5 h-3.5" />
                            Track Application
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
