import type { Status } from "@/types";

// ─── Layout ──────────────────────────────────────────────
export const layout = {
    page: "min-h-screen bg-background text-foreground",
    header: "border-b border-border",
    headerInner: "max-w-6xl mx-auto px-6 py-4",
    headerRow: "flex items-center justify-between",
    main: "max-w-6xl mx-auto px-6 py-10",
};

// ─── Header ──────────────────────────────────────────────
export const header = {
    logoWrapper: "flex items-center gap-2.5",
    logoIcon: "w-8 h-8 rounded-lg bg-secondary flex items-center justify-center overflow-hidden",
    logoText: "font-display text-lg font-medium tracking-tight text-foreground",
    actionsWrapper: "flex items-center gap-3",
    themeToggle: "p-2 rounded-lg hover:bg-secondary transition-colors",
    themeIcon: "w-4 h-4 text-muted-foreground",
    userMenuButton: "flex items-center gap-2 p-1 rounded-full hover:bg-secondary transition-colors",
    userAvatar: "w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-medium overflow-hidden",
    userMenuDropdown: "absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden",
    userMenuHeader: "px-4 py-3 border-b border-border",
    userMenuName: "text-sm font-medium text-foreground",
    userMenuEmail: "text-xs text-muted-foreground",
    menuItem: "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary/50 transition-colors",
    menuItemMuted: "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors",
    menuDivider: "border-t border-border py-1",
    menuIcon: "w-4 h-4 text-muted-foreground",
    signInButton: "flex items-center gap-2.5 px-4 h-9 rounded-lg bg-primary text-primary-foreground hover:opacity-90 text-sm font-medium transition-colors",
};

// ─── Modals ──────────────────────────────────────────────
export const modal = {
    overlay: "fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4",
    overlayDanger: "fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4",
    card: "w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden",
    cardSmall: "w-full max-w-sm bg-card border border-border rounded-xl shadow-2xl overflow-hidden",
    header: "flex items-center justify-between px-5 py-4 border-b border-border",
    title: "text-lg font-semibold text-foreground font-display",
    closeButton: "p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors",
    body: "p-5 space-y-6",
    sectionTitle: "text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3",
    sectionTitleDanger: "text-xs font-medium text-rose-500 uppercase tracking-wider mb-3",
    settingsRow: "flex items-center justify-between px-3 py-3 rounded-lg hover:bg-secondary/50 transition-colors",
    settingsButton: "w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-secondary/50 transition-colors text-left",
    accountCard: "flex items-center gap-3 px-3 py-3 rounded-lg bg-secondary/50",
    accountAvatar: "w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-sm font-medium overflow-hidden",
    deleteButton: "w-full flex items-center gap-3 px-3 py-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 transition-all text-left",
    deleteIcon: "w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4",
    toggle: (active: boolean) =>
        `w-10 h-6 rounded-full transition-colors relative ${active ? "bg-violet-500" : "bg-muted"}`,
};

// ─── Stats Cards ─────────────────────────────────────────
export const stats = {
    grid: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-8",
    card: "bg-card border border-border rounded-lg px-4 py-3 group cursor-default",
    cardHeader: "flex items-center justify-between mb-1",
    cardLabel: "text-xs text-muted-foreground",
    cardValue: "text-2xl font-semibold text-foreground font-display",
    cardIcon: (hoverColor: string) =>
        `w-3.5 h-3.5 text-muted-foreground group-hover:${hoverColor} transition-colors`,
};

// ─── Tabs ────────────────────────────────────────────────
export const tabs = {
    wrapper: "flex gap-6 mb-6 border-b border-border",
    tab: (active: boolean) =>
        `pb-3 text-sm font-medium transition-colors relative ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`,
    indicator: "absolute bottom-0 left-0 right-0 h-px bg-foreground",
};

// ─── Recommended Tab ─────────────────────────────────────
export const recommended = {
    pill: (active: boolean) =>
        `px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${active ? "bg-black dark:bg-white text-white dark:text-black" : "bg-secondary text-muted-foreground hover:text-foreground"}`,
    categoryPill: (active: boolean) =>
        `px-3 py-1.5 rounded-full text-xs font-medium transition-colors text-center ${active ? "bg-black dark:bg-white text-white dark:text-black" : "bg-secondary text-muted-foreground hover:text-foreground"}`,
    searchWrapper: "relative flex-1 max-w-sm",
    searchIcon: "absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground",
    searchInput: "pl-9 pr-8 bg-transparent border border-border text-sm h-8 placeholder:text-muted-foreground hover:border-ring focus:bg-transparent focus:border-ring focus:ring-0 focus-visible:ring-0 rounded-lg transition-colors",
    clearButton: "absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-lg text-muted-foreground hover:text-foreground",
    tableContainer: "border border-border rounded-lg",
    tableHeader: "grid grid-cols-12 gap-4 px-5 py-3 bg-secondary/30 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider",
    tableRow: "grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-secondary/30 transition-colors group border-b border-border/50 last:border-b-0",
    companyAvatar: "w-8 h-8 rounded-md bg-secondary flex items-center justify-center text-muted-foreground text-sm font-medium shrink-0",
    applyButton: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md dark:bg-white dark:text-black dark:hover:bg-gray-100 bg-foreground text-background hover:opacity-90 text-xs font-medium transition-colors hover:scale-105 active:scale-95",
    addedButton: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-500 text-xs font-medium cursor-default",
    addButton: "inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-md dark:bg-gradient-to-r dark:from-violet-500 dark:to-indigo-500 dark:hover:from-violet-600 dark:hover:to-indigo-600 dark:text-white bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white text-xs font-medium transition-colors hover:scale-105 active:scale-95",
    source: "text-xs text-muted-foreground flex items-center gap-1",
    emptyState: "px-5 py-12 text-center",
};

// ─── Application Form ────────────────────────────────────
export const form = {
    card: "bg-card border border-border rounded-lg p-5 relative overflow-visible",
    header: "flex items-center gap-2 mb-5",
    headerText: "text-sm font-medium text-foreground",
    fieldLabel: "text-xs text-muted-foreground flex items-center gap-1.5",
    fieldInput: "bg-secondary/50 border border-border text-sm h-9 placeholder:text-muted-foreground hover:border-ring focus:border-ring focus:outline-none focus:ring-0 focus-visible:ring-0 transition-all",
    statusButton: "w-full flex items-center justify-between px-3 h-9 rounded-md bg-secondary/50 border border-border hover:border-ring focus:border-ring focus:outline-none focus:ring-0 focus-visible:ring-0 transition-colors text-sm",
    statusDropdown: "absolute bottom-full left-0 right-0 mb-1 bg-card border border-border rounded-md shadow-xl z-[200] py-1",
    footer: "flex justify-end gap-2 mt-5 pt-4 border-t border-border",
    cancelButton: "text-muted-foreground hover:text-foreground hover:bg-secondary/50 h-8",
    submitButton: "bg-zinc-100 hover:bg-white text-zinc-900 h-8 border-0",
    successOverlay: "absolute inset-0 bg-card/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4",
    successCircle: "w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30",
    successText: "text-sm font-medium text-emerald-500",
};

// ─── Application Toolbar ─────────────────────────────────
export const toolbar = {
    wrapper: "flex flex-wrap items-center gap-2 mb-4",
    searchWrapper: "relative flex-1 min-w-[200px] max-w-xs",
    searchIcon: "absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground",
    searchInput: "pl-9 pr-8 bg-transparent border border-border text-sm h-8 placeholder:text-muted-foreground hover:border-ring focus:bg-transparent focus:border-ring focus:ring-0 focus-visible:ring-0 rounded-lg transition-colors",
    clearSearchButton: "absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-lg text-muted-foreground hover:text-foreground",
    filterButton: (active: boolean) =>
        `flex items-center gap-2 px-3 h-8 rounded-lg border text-sm transition-colors shadow-sm ${active ? "bg-secondary border-border text-foreground" : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-ring"}`,
    sortButton: "flex items-center gap-2 px-3 h-8 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-ring text-sm transition-colors shadow-sm",
    dropdown: "absolute top-full left-0 mt-1 bg-card border border-border rounded-md shadow-xl z-50 overflow-hidden py-1",
    dropdownItem: (active: boolean) =>
        `w-full flex items-center px-3 py-2 hover:bg-secondary/50 transition-colors text-sm ${active ? "text-foreground" : "text-muted-foreground"}`,
    clearAll: "text-xs text-muted-foreground hover:text-foreground transition-colors",
    addButton: "bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 dark:bg-gradient-to-r dark:from-violet-500 dark:to-indigo-500 dark:hover:from-violet-600 dark:hover:to-indigo-600 text-white border-0 gap-1.5 font-medium text-sm h-8 rounded-lg shadow-sm",
};

// ─── Application Table ───────────────────────────────────
export const table = {
    container: "border border-border rounded-lg",
    header: "grid grid-cols-12 gap-4 px-5 py-3 bg-secondary/30 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider",
    row: "grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-secondary/30 transition-colors group border-b border-border/50 last:border-b-0",
    companyAvatar: "w-8 h-8 rounded-md bg-secondary flex items-center justify-center text-muted-foreground text-sm font-medium",
    companyName: "text-sm font-medium text-foreground",
    position: "text-sm text-foreground/80",
    externalLink: "text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100",
    dateText: "col-span-2 text-sm text-muted-foreground pl-4",
    deleteButton: "p-1.5 rounded text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100",
    statusDropdown: "absolute top-full left-0 mt-1 bg-card border border-border rounded-md shadow-xl z-[100] overflow-hidden py-1 min-w-[120px]",
    emptyWrapper: "px-5 py-12 text-center",
    emptyIcon: "w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mx-auto mb-3",
    emptyText: "text-sm text-muted-foreground",
};

// ─── Status Badge ────────────────────────────────────────
export const statusBadge = {
    base: "group/status inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer backdrop-blur-sm transition-all duration-200 shadow-sm hover:shadow-md",
    variants: (status: Status, darkMode: boolean): string => {
        const colors: Record<Status, { dark: string; light: string }> = {
            applied: {
                dark: "bg-[#3b82f6]/15 text-[#3b82f6] shadow-[#3b82f6]/10",
                light: "bg-[#3b82f6]/10 text-[#3b82f6] shadow-[#3b82f6]/8",
            },
            interviewing: {
                dark: "bg-[#f59e0b]/15 text-[#f59e0b] shadow-[#f59e0b]/10",
                light: "bg-[#f59e0b]/10 text-[#f59e0b] shadow-[#f59e0b]/8",
            },
            offered: {
                dark: "bg-[#22c55e]/15 text-[#22c55e] shadow-[#22c55e]/10",
                light: "bg-[#22c55e]/10 text-[#22c55e] shadow-[#22c55e]/8",
            },
            rejected: {
                dark: "bg-rose-500/15 text-rose-500 shadow-rose-500/10",
                light: "bg-rose-500/10 text-rose-500 shadow-rose-500/8",
            },
        };
        return darkMode ? colors[status].dark : colors[status].light;
    },
};

// ─── Status Footer ───────────────────────────────────────
export const footer = {
    wrapper: "mt-6 flex items-center justify-between",
    filtersRow: "flex items-center gap-4",
    filterButton: (active: boolean, color: string) =>
        `flex items-center gap-2 text-xs transition-colors ${active ? color : "text-muted-foreground hover:text-foreground"}`,
    count: "text-[0.7rem] text-muted-foreground",
};
