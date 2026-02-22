import { motion, AnimatePresence } from "framer-motion";
import { X, Moon, Sun, Download, Shield, Trash2 } from "lucide-react";
import { modal } from "@/styles/home";
import type { UserProfile } from "@/types";

interface SettingsModalProps {
    show: boolean;
    onClose: () => void;
    user: UserProfile | null;
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
    onExport: () => void;
    onDeleteAccount: () => void;
}

export default function SettingsModal({
    show,
    onClose,
    user,
    darkMode,
    setDarkMode,
    onExport,
    onDeleteAccount,
}: SettingsModalProps) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={modal.overlay}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className={modal.card}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={modal.header}>
                            <h2 className={modal.title}>Settings</h2>
                            <button onClick={onClose} className={modal.closeButton} data-testid="button-close-settings">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className={modal.body}>
                            {/* Account */}
                            <div>
                                <h3 className={modal.sectionTitle}>Account</h3>
                                <div className="space-y-1">
                                    <div className={modal.accountCard}>
                                        <div className={modal.accountAvatar}>
                                            {user?.avatar?.startsWith("http") ? (
                                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                user?.avatar
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{user?.name}</p>
                                            <p className="text-xs text-muted-foreground">{user?.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Preferences */}
                            <div>
                                <h3 className={modal.sectionTitle}>Preferences</h3>
                                <div className="space-y-2">
                                    <div className={modal.settingsRow}>
                                        <div className="flex items-center gap-3">
                                            {darkMode ? <Moon className="w-4 h-4 text-muted-foreground" /> : <Sun className="w-4 h-4 text-muted-foreground" />}
                                            <div>
                                                <p className="text-sm text-foreground">Dark Mode</p>
                                                <p className="text-xs text-muted-foreground">Use dark theme</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setDarkMode(!darkMode)}
                                            className={modal.toggle(darkMode)}
                                            data-testid="toggle-dark-mode"
                                        >
                                            <motion.div
                                                className="w-4 h-4 rounded-full bg-white dark:bg-foreground absolute top-1"
                                                animate={{ left: darkMode ? 22 : 4 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Data & Privacy */}
                            <div>
                                <h3 className={modal.sectionTitle}>Data & Privacy</h3>
                                <div className="space-y-2">
                                    <button onClick={onExport} className={modal.settingsButton} data-testid="button-export-settings">
                                        <Download className="w-4 h-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-foreground">Export Data</p>
                                            <p className="text-xs text-muted-foreground">Download all your applications</p>
                                        </div>
                                    </button>
                                    <button className={modal.settingsButton}>
                                        <Shield className="w-4 h-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-foreground">Privacy Policy</p>
                                            <p className="text-xs text-muted-foreground">How we handle your data</p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div>
                                <h3 className={modal.sectionTitleDanger}>Danger Zone</h3>
                                <button onClick={onDeleteAccount} className={modal.deleteButton} data-testid="button-delete-account">
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                    <div>
                                        <p className="text-sm text-red-400">Delete Account</p>
                                        <p className="text-xs text-red-400/60">Permanently delete your account and data</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
