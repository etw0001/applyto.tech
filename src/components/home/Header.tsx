import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Settings, Download, LogOut } from "lucide-react";
import GoogleIcon from "./GoogleIcon";
import { header, layout } from "@/styles/home";
import type { UserProfile } from "@/types";

interface HeaderProps {
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
    isSignedIn: boolean;
    user: UserProfile | null;
    showUserMenu: boolean;
    setShowUserMenu: (value: boolean) => void;
    onSignIn: () => void;
    onSignOut: () => void;
    onExport: () => void;
    onOpenSettings: () => void;
    userMenuRef: React.RefObject<HTMLDivElement | null>;
}

export default function Header({
    darkMode,
    setDarkMode,
    isSignedIn,
    user,
    showUserMenu,
    setShowUserMenu,
    onSignIn,
    onSignOut,
    onExport,
    onOpenSettings,
    userMenuRef,
}: HeaderProps) {
    return (
        <header className={layout.header}>
            <div className={layout.headerInner}>
                <div className={layout.headerRow}>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={header.logoWrapper}
                    >
                        <span className="font-display font-bold text-2xl tracking-tight text-foreground">
                            applyto<span className="text-indigo-500">.tech</span>
                        </span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={header.actionsWrapper}
                    >
                        <motion.button
                            onClick={() => setDarkMode(!darkMode)}
                            className={header.themeToggle}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            data-testid="button-toggle-theme"
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div
                                    key={darkMode ? "dark" : "light"}
                                    initial={{ y: -10, opacity: 0, rotate: -90 }}
                                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                                    exit={{ y: 10, opacity: 0, rotate: 90 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    {darkMode ? (
                                        <Sun className={header.themeIcon} />
                                    ) : (
                                        <Moon className={header.themeIcon} />
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </motion.button>

                        {isSignedIn ? (
                            <div className="relative" ref={userMenuRef}>
                                <motion.button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className={header.userMenuButton}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    data-testid="button-user-menu"
                                >
                                    <div className={header.userAvatar}>
                                        {user?.avatar?.startsWith("http") ? (
                                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            user?.avatar
                                        )}
                                    </div>
                                </motion.button>

                                <AnimatePresence>
                                    {showUserMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            className={header.userMenuDropdown}
                                        >
                                            <div className={header.userMenuHeader}>
                                                <p className={header.userMenuName}>{user?.name}</p>
                                                <p className={header.userMenuEmail}>{user?.email}</p>
                                            </div>

                                            <div className="py-1">
                                                <button onClick={onOpenSettings} className={header.menuItem} data-testid="button-settings">
                                                    <Settings className={header.menuIcon} />
                                                    Settings
                                                </button>
                                                <button onClick={onExport} className={header.menuItem} data-testid="button-export">
                                                    <Download className={header.menuIcon} />
                                                    Export Data
                                                </button>
                                            </div>

                                            <div className={header.menuDivider}>
                                                <button onClick={onSignOut} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-500 dark:text-rose-500 hover:bg-secondary/50 hover:text-rose-400 dark:hover:text-rose-400 transition-colors" data-testid="button-sign-out">
                                                    <LogOut className="w-4 h-4 text-rose-500 dark:text-rose-500" />
                                                    Sign out
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <motion.button
                                onClick={onSignIn}
                                className={header.signInButton}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                data-testid="button-google-sign-in"
                            >
                                <GoogleIcon />
                                Sign in with Google
                            </motion.button>
                        )}
                    </motion.div>
                </div>
            </div>
        </header>
    );
}
