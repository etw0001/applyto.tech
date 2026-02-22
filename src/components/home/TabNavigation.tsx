import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { tabs } from "@/styles/home";

interface TabNavigationProps {
    activeTab: "recommended" | "custom";
    setActiveTab: (tab: "recommended" | "custom") => void;
}

export default function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={tabs.wrapper}
        >
            {(["custom", "recommended"] as const).map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={tabs.tab(activeTab === tab)}
                    data-testid={`tab-${tab}`}
                >
                    <span className="flex items-center gap-1.5">
                        {tab === "recommended" && <Sparkles className="w-3.5 h-3.5" />}
                        {tab === "custom" ? "My Applications" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </span>
                    {activeTab === tab && (
                        <motion.div
                            layoutId="activeTab"
                            className={tabs.indicator}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    )}
                </button>
            ))}
        </motion.div>
    );
}
