import { motion, AnimatePresence } from "framer-motion";
import { X, Shield } from "lucide-react";
import { modal } from "@/styles/home";

interface PrivacyPolicyModalProps {
    show: boolean;
    onClose: () => void;
}

export default function PrivacyPolicyModal({ show, onClose }: PrivacyPolicyModalProps) {
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
                        className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={modal.header}>
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-muted-foreground" />
                                <h2 className={modal.title}>Privacy Policy</h2>
                            </div>
                            <button onClick={onClose} className={modal.closeButton} data-testid="button-close-privacy">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-5 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-4 text-sm text-foreground">
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Data Collection</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        We only collect the data you explicitly provide: your job applications, company names, positions, application dates, and status updates. Your email and name are collected through Google authentication for account management purposes only.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Data Usage</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Your data is used solely to provide the application tracking service. We do not share, sell, or use your data for advertising, analytics, or any other purpose. Your information remains private and is only accessible to you.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Data Storage</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        All data is securely stored in our database with encryption. Each user's data is isolated and can only be accessed by the account owner. We use industry-standard security practices to protect your information.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Your Rights</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        You have full control over your data. You can export all your data at any time, modify or delete individual applications, or permanently delete your account and all associated data through the settings menu.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Third-Party Services</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        We use Supabase for authentication and database services. These services follow their own privacy policies and security standards. We do not share your data with any other third parties.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="px-5 py-4 border-t border-border bg-secondary/30">
                            <button
                                onClick={onClose}
                                className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm font-medium"
                                data-testid="button-close-privacy-footer"
                            >
                                Got it
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
