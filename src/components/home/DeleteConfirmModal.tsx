import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { modal } from "@/styles/home";

interface DeleteConfirmModalProps {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function DeleteConfirmModal({ show, onClose, onConfirm }: DeleteConfirmModalProps) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={modal.overlayDanger}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className={modal.cardSmall}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-5 text-center">
                            <div className={modal.deleteIcon}>
                                <AlertTriangle className="w-6 h-6 text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">Delete Account?</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                This action cannot be undone. All your applications and data will be permanently deleted.
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    variant="ghost"
                                    className="flex-1 text-zinc-400 hover:text-zinc-200"
                                    onClick={onClose}
                                    data-testid="button-cancel-delete"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                                    onClick={onConfirm}
                                    data-testid="button-confirm-delete"
                                >
                                    Delete Account
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
