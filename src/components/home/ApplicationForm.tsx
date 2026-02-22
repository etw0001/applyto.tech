import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Building2, Briefcase, Link2, Calendar as CalendarIcon, Clock, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { statusConfig } from "@/constants/status";
import { form } from "@/styles/home";
import type { Status } from "@/types";

interface ApplicationFormProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (data: { company: string; position: string; link: string; status: Status; dateApplied: string }) => Promise<void>;
}

function getTodayDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export default function ApplicationForm({ show, onClose, onSubmit }: ApplicationFormProps) {
    const [formData, setFormData] = useState({
        company: "",
        position: "",
        link: "",
        status: "applied" as Status,
        dateApplied: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    });
    const [dateInputValue, setDateInputValue] = useState(getTodayDateString());
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isCanceling, setIsCanceling] = useState(false);
    const formStatusDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!show) {
            setFormData({
                company: "",
                position: "",
                link: "",
                status: "applied" as Status,
                dateApplied: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
            });
            setDateInputValue(getTodayDateString());
            setStatusDropdownOpen(false);
        } else {
            setDateInputValue(getTodayDateString());
        }
    }, [show]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (statusDropdownOpen && formStatusDropdownRef.current && !formStatusDropdownRef.current.contains(event.target as Node)) {
                setStatusDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [statusDropdownOpen]);

    const handleSubmit = async () => {
        if (!formData.company || !formData.position) return;
        try {
            await onSubmit(formData);
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                onClose();
            }, 800);
        } catch (error) {
            console.error("Error adding application:", error);
        }
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={
                        isCanceling
                            ? { opacity: 0, height: 0, transition: { height: { duration: 0.15, ease: [0.4, 0, 1, 1] }, opacity: { duration: 0.1, ease: [0.4, 0, 1, 1] } } }
                            : { opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }
                    }
                    className="mb-6"
                    style={isCanceling ? { overflow: "hidden" } : { overflow: "visible" }}
                >
                    <motion.div
                        className={form.card}
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={
                            isCanceling
                                ? { opacity: 0, transition: { duration: 0.1 } }
                                : { y: 10, opacity: 0, transition: { delay: 0.05, duration: 0.2, ease: [0.4, 0, 0.2, 1] } }
                        }
                    >
                        {/* Success Animation */}
                        <AnimatePresence>
                            {showSuccess && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={form.successOverlay}>
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                                        className="relative"
                                    >
                                        <motion.div initial={{ scale: 0.8, opacity: 0.8 }} animate={{ scale: 2.5, opacity: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="absolute inset-0 rounded-full bg-emerald-500/30" />
                                        <motion.div initial={{ scale: 0.8, opacity: 0.6 }} animate={{ scale: 2, opacity: 0 }} transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }} className="absolute inset-0 rounded-full bg-emerald-500/20" />
                                        <motion.div className={form.successCircle} initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.4, times: [0, 0.6, 1] }}>
                                            <motion.svg viewBox="0 0 24 24" className="w-8 h-8 text-white" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.3, delay: 0.2 }}>
                                                <motion.path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.25 }} />
                                            </motion.svg>
                                        </motion.div>
                                    </motion.div>
                                    <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className={form.successText}>
                                        Application Added!
                                    </motion.p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className={form.header}>
                            <motion.div initial={{ rotate: 0 }} animate={{ rotate: 180 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}>
                                <Plus className="w-4 h-4 text-muted-foreground" />
                            </motion.div>
                            <span className={form.headerText}>New Application</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <motion.div className="space-y-1.5" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                                <label className={form.fieldLabel}><Building2 className="w-3 h-3" />Company</label>
                                <Input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="Stripe" className={form.fieldInput} data-testid="input-company" />
                            </motion.div>

                            <motion.div className="space-y-1.5" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                                <label className={form.fieldLabel}><Briefcase className="w-3 h-3" />Position</label>
                                <Input value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} placeholder="Frontend Engineer" className={form.fieldInput} data-testid="input-position" />
                            </motion.div>

                            <motion.div className="space-y-1.5" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                                <label className={form.fieldLabel}><Link2 className="w-3 h-3" />Link</label>
                                <Input value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} placeholder="https://..." className={form.fieldInput} data-testid="input-link" />
                            </motion.div>

                            <motion.div className="space-y-1.5 relative" style={{ minHeight: "auto", height: "auto" }} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
                                <label className={form.fieldLabel}><Clock className="w-3 h-3" />Status</label>
                                <div className="relative" style={{ minHeight: "36px" }} ref={formStatusDropdownRef}>
                                    <button onClick={() => setStatusDropdownOpen(!statusDropdownOpen)} className={form.statusButton} data-testid="select-status">
                                        <span className={statusConfig[formData.status].color}>{statusConfig[formData.status].label}</span>
                                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                                    </button>
                                    {statusDropdownOpen && (
                                        <motion.div initial={{ opacity: 0, y: 5, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.15, ease: "easeOut" }} className={form.statusDropdown}>
                                            {(Object.keys(statusConfig) as Status[]).map((status, index) => (
                                                <motion.button key={status} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }} onClick={() => { setFormData({ ...formData, status }); setStatusDropdownOpen(false); }} className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary/50 transition-colors text-sm ${statusConfig[status].color}`} data-testid={`option-status-${status}`}>
                                                    {statusConfig[status].label}
                                                </motion.button>
                                            ))}
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>

                            <motion.div className="space-y-1.5" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                                <label className={form.fieldLabel}><CalendarIcon className="w-3 h-3" />Date Applied</label>
                                <div className="relative">
                                    <Input
                                        type="date"
                                        value={dateInputValue}
                                        onChange={(e) => {
                                            setDateInputValue(e.target.value);
                                            setFormData({ ...formData, dateApplied: new Date(e.target.value).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) });
                                        }}
                                        className="bg-secondary/50 border-border text-sm h-9 focus:border-ring focus:ring-0 transition-all text-foreground pr-8"
                                        data-testid="input-date"
                                    />
                                </div>
                            </motion.div>
                        </div>

                        <motion.div className={form.footer} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setStatusDropdownOpen(false);
                                    setIsCanceling(true);
                                    onClose();
                                    setTimeout(() => setIsCanceling(false), 200);
                                }}
                                className={form.cancelButton}
                                data-testid="button-cancel"
                            >
                                Cancel
                            </Button>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button size="sm" onClick={handleSubmit} className={form.submitButton} data-testid="button-submit">
                                    Add
                                </Button>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
