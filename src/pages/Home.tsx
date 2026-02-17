import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useApplications } from "@/hooks/use-applications";
import { supabase } from "@/lib/supabase";
import { getRecommended, INTERNSHIP_CATEGORIES, type RecommendedInternship, type InternshipCategory } from "@/utils/getRecommended";
import {
  Plus,
  Building2,
  Briefcase,
  Link2,
  Calendar as CalendarIcon,
  Sparkles,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Trash2,
  ChevronDown,
  Filter,
  ArrowUpDown,
  Search,
  X,
  TrendingUp,
  Settings,
  LogOut,
  User,
  Moon,
  Sun,
  Shield,
  Download,
  AlertTriangle,
  MapPin,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Status = "applied" | "interviewing" | "offered" | "rejected";

interface Application {
  id: string;
  company: string;
  position: string;
  link: string;
  status: Status;
  dateApplied: string;
}

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}

const statusConfig: Record<Status, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  applied: {
    label: "Applied",
    color: "text-zinc-400",
    bgColor: "bg-zinc-500/10",
    icon: Send,
  },
  interviewing: {
    label: "Interviewing",
    color: "text-sky-400",
    bgColor: "bg-sky-500/10",
    icon: Clock,
  },
  offered: {
    label: "Offered",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    icon: XCircle,
  },
};

const mockApplications: Application[] = [
  {
    id: "1",
    company: "Stripe",
    position: "Senior Frontend Engineer",
    link: "https://stripe.com/jobs",
    status: "interviewing",
    dateApplied: "Jan 05, 2026",
  },
  {
    id: "2",
    company: "Vercel",
    position: "Staff Software Engineer",
    link: "https://vercel.com/careers",
    status: "applied",
    dateApplied: "Jan 03, 2026",
  },
  {
    id: "3",
    company: "Linear",
    position: "Product Engineer",
    link: "https://linear.app/careers",
    status: "offered",
    dateApplied: "Dec 28, 2025",
  },
  {
    id: "4",
    company: "Figma",
    position: "Design Engineer",
    link: "https://figma.com/careers",
    status: "rejected",
    dateApplied: "Dec 20, 2025",
  },
  {
    id: "5",
    company: "Notion",
    position: "Full Stack Engineer",
    link: "https://notion.so/careers",
    status: "applied",
    dateApplied: "Jan 07, 2026",
  },
];

type SortOption = "date-newest" | "date-oldest" | "company-az" | "company-za" | "role-az" | "role-za";

function AnimatedCounter({ value, duration = 1 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{count}</span>;
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function Home() {
  // Helper function to get today's date in YYYY-MM-DD format (local timezone)
  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Supabase auth
  const { user: authUser, loading: authLoading, signInWithGoogle, signOut: signOutUser } = useAuth();
  const isSignedIn = !!authUser;

  // Supabase applications
  const {
    applications: supabaseApplications,
    loading: appsLoading,
    addApplication: addApplicationToDB,
    updateApplication: updateApplicationInDB,
    deleteApplication: deleteApplicationFromDB,
  } = useApplications(authUser?.id);

  // Use Supabase data if signed in, otherwise use mock data
  const applications = isSignedIn ? supabaseApplications : mockApplications;

  const [activeTab, setActiveTab] = useState<"recommended" | "custom">("custom");
  const [showForm, setShowForm] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("date-newest");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // Initialize theme immediately to prevent flashing
  const [darkMode, setDarkMode] = useState(() => {
    // Apply theme class immediately before React renders
    const saved = localStorage.getItem('theme');
    const isDark = saved ? saved === 'dark' : false;

    // Apply immediately to prevent flash
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    return isDark;
  });
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    link: "",
    status: "applied" as Status,
    dateApplied: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
  });
  const [dateInputValue, setDateInputValue] = useState(getTodayDateString());
  const [openStatusDropdown, setOpenStatusDropdown] = useState<string | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  // Recommended internships state
  const [recommendedInternships, setRecommendedInternships] = useState<RecommendedInternship[]>([]);
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const [recommendedError, setRecommendedError] = useState<string | null>(null);
  const [recommendedSearch, setRecommendedSearch] = useState("");
  const [recommendedCategory, setRecommendedCategory] = useState<InternshipCategory | "all">("all");
  const [recommendedDisplayCount, setRecommendedDisplayCount] = useState(100);
  const recommendedFetched = useRef(false);
  const recommendedScrollRef = useRef<HTMLDivElement>(null);

  // Fetch recommended internships when the tab is first activated
  useEffect(() => {
    if (activeTab === "recommended" && !recommendedFetched.current) {
      recommendedFetched.current = true;
      setRecommendedLoading(true);
      setRecommendedError(null);
      getRecommended()
        .then((data) => {
          setRecommendedInternships(data || []);
        })
        .catch(() => {
          setRecommendedError("Failed to load recommended internships. Please try again.");
        })
        .finally(() => {
          setRecommendedLoading(false);
        });
    }
    // Reset display count & scroll position when switching back to recommended
    if (activeTab === "recommended") {
      setRecommendedDisplayCount(100);
      if (recommendedScrollRef.current) {
        recommendedScrollRef.current.scrollTop = 0;
      }
    }
  }, [activeTab]);

  // Reset display count when search or category changes
  useEffect(() => {
    setRecommendedDisplayCount(100);
    if (recommendedScrollRef.current) {
      recommendedScrollRef.current.scrollTop = 0;
    }
  }, [recommendedSearch, recommendedCategory]);

  // Infinite scroll handler
  const handleRecommendedScroll = useCallback(() => {
    const el = recommendedScrollRef.current;
    if (!el) return;
    // Load more when within 200px of bottom
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 200) {
      setRecommendedDisplayCount(prev => prev + 100);
    }
  }, []);

  const filteredRecommended = recommendedInternships
    .filter((item) => recommendedCategory === "all" || item.category === recommendedCategory)
    .filter((item) =>
      recommendedSearch === "" ||
      item.company.toLowerCase().includes(recommendedSearch.toLowerCase()) ||
      item.role.toLowerCase().includes(recommendedSearch.toLowerCase()) ||
      item.location.toLowerCase().includes(recommendedSearch.toLowerCase())
    );

  // Category counts (computed from all internships, not filtered)
  const categoryCounts = recommendedInternships.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const formStatusDropdownRef = useRef<HTMLDivElement>(null);

  // Reset form and close status dropdown when form is closed
  const resetForm = () => {
    setFormData({
      company: "",
      position: "",
      link: "",
      status: "applied" as Status,
      dateApplied: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    });
    setDateInputValue(getTodayDateString());
    setStatusDropdownOpen(false);
  };

  useEffect(() => {
    if (!showForm) {
      resetForm();
    } else {
      // When form opens, set date to today
      setDateInputValue(getTodayDateString());
    }
  }, [showForm]);
  const statusDropdownRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (filterRef.current && !filterRef.current.contains(target)) {
        setFilterDropdownOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(target)) {
        setSortDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
      // Close status dropdown if clicking outside
      if (openStatusDropdown) {
        const statusRef = statusDropdownRefs.current.get(openStatusDropdown);
        if (statusRef && !statusRef.contains(target)) {
          setOpenStatusDropdown(null);
        }
      }
      // Close form status dropdown if clicking outside
      if (statusDropdownOpen && formStatusDropdownRef.current && !formStatusDropdownRef.current.contains(target)) {
        setStatusDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openStatusDropdown, statusDropdownOpen]);

  // Sync user profile from Supabase
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (authUser) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

          // If profile doesn't exist, create it
          if (error && error.code === 'PGRST116') {
            console.log('Profile not found, creating one...');
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: authUser.id,
                name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
                email: authUser.email || '',
                avatar_url: authUser.user_metadata?.avatar_url || null,
                theme: 'light',
              })
              .select()
              .single();

            if (createError) {
              console.error('Error creating profile:', createError);
              throw createError;
            }

            if (newProfile) {
              setUser({
                name: newProfile.name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
                email: newProfile.email || authUser.email || '',
                avatar: newProfile.avatar_url || authUser.user_metadata?.avatar_url || (newProfile.name?.[0] || authUser.email?.[0] || 'U').toUpperCase(),
              });
              return;
            }
          }

          if (error) throw error;

          if (data) {
            setUser({
              name: data.name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
              email: data.email || authUser.email || '',
              avatar: data.avatar_url || authUser.user_metadata?.avatar_url || (data.name?.[0] || authUser.email?.[0] || 'U').toUpperCase(),
            });

            // Load theme preference from database (only if it exists)
            if (data.theme) {
              const isDark = data.theme === 'dark';
              // Only update if different to avoid flashing
              setDarkMode(prev => prev !== isDark ? isDark : prev);
              // Also update localStorage to keep in sync
              localStorage.setItem('theme', data.theme);
            } else {
              // If no theme in DB yet, save current preference to DB
              const currentTheme = darkMode ? 'dark' : 'light';
              supabase
                .from('profiles')
                .update({ theme: currentTheme })
                .eq('id', authUser.id)
                .then(({ error }) => {
                  if (!error) {
                    localStorage.setItem('theme', currentTheme);
                  }
                });
            }
          } else {
            // Fallback to auth user metadata
            setUser({
              name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
              email: authUser.email || '',
              avatar: authUser.user_metadata?.avatar_url || (authUser.email?.[0] || 'U').toUpperCase(),
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Fallback to auth user metadata
          setUser({
            name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
            email: authUser.email || '',
            avatar: authUser.user_metadata?.avatar_url || (authUser.email?.[0] || 'U').toUpperCase(),
          });
        }
      } else {
        setUser(null);
        // When signed out, use localStorage (don't reset if already set)
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
          const shouldBeDark = savedTheme === 'dark';
          // Only update if different to avoid unnecessary re-renders
          setDarkMode(prev => prev !== shouldBeDark ? shouldBeDark : prev);
        }
        // Don't reset to default when signing out - keep current theme
      }
    };

    fetchUserProfile();
  }, [authUser]);

  useEffect(() => {
    // Skip if this is the initial render (theme already applied in useState)
    const isInitialMount = document.documentElement.classList.contains('dark') === darkMode;

    // Disable transitions during theme change to prevent flashing
    document.documentElement.classList.add('no-transitions');

    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Re-enable transitions after theme change
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.classList.remove('no-transitions');
      });
    });

    // Save theme preference to database if signed in, otherwise to localStorage
    // Use a small delay to debounce rapid changes
    const timeoutId = setTimeout(() => {
      if (isSignedIn && authUser) {
        supabase
          .from('profiles')
          .update({ theme: darkMode ? 'dark' : 'light' })
          .eq('id', authUser.id)
          .then(({ error }) => {
            if (error) {
              console.error('Error saving theme preference:', error);
            }
          });
      }
      // Always update localStorage
      localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [darkMode, isSignedIn, authUser]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setUser(null);
      setShowUserMenu(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      if (isSignedIn && authUser) {
        // Refresh session to get a fresh access token
        const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        const session = refreshedSession || currentSession;

        if (!session?.access_token) {
          alert('You must be signed in to delete your account. Please sign out and sign back in.');
          return;
        }

        // Call Edge Function to delete auth user + all data (tables cascade on delete)
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        const response = await fetch(`${supabaseUrl}/functions/v1/delete-user`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': supabaseAnonKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Failed to delete account (${response.status}): ${errorBody}`);
        }

        // Sign out locally (auth user is already deleted server-side)
        try { await signOutUser(); } catch { /* expected — user no longer exists */ }

        setUser(null);
        setShowDeleteConfirm(false);
        setShowSettings(false);
      } else {
        setUser(null);
        setShowDeleteConfirm(false);
        setShowSettings(false);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert(`Failed to delete account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleExportData = () => {
    const data = JSON.stringify(applications, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "applications.json";
    a.click();
  };

  const handleAddApplication = async () => {
    if (!formData.company || !formData.position) return;

    try {
      if (isSignedIn) {
        await addApplicationToDB(formData);
      } else {
        // Fallback for mock data when not signed in
        const newApp: Application = {
          id: Date.now().toString(),
          ...formData,
        };
        // Note: This won't persist when using Supabase, but allows testing UI
      }

      // Show success animation, then close form (form will reset via useEffect)
      setShowSuccessAnimation(true);
      setTimeout(() => {
        setShowSuccessAnimation(false);
        setShowForm(false);
      }, 800);
    } catch (error) {
      console.error('Error adding application:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (isSignedIn) {
        await deleteApplicationFromDB(id);
      } else {
        // Fallback for mock data when not signed in
        // Note: This won't persist when using Supabase, but allows testing UI
      }
    } catch (error) {
      console.error('Error deleting application:', error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: Status) => {
    try {
      if (isSignedIn) {
        await updateApplicationInDB(id, { status: newStatus });
      } else {
        // Fallback for mock data when not signed in
        // Note: This won't persist when using Supabase, but allows testing UI
      }
      setOpenStatusDropdown(null); // Close dropdown after selection
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredAndSortedApplications = applications
    .filter(app => statusFilter === "all" || app.status === statusFilter)
    .filter(app =>
      searchQuery === "" ||
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.position.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "date-newest":
          return new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime();
        case "date-oldest":
          return new Date(a.dateApplied).getTime() - new Date(b.dateApplied).getTime();
        case "company-az":
          return a.company.localeCompare(b.company);
        case "company-za":
          return b.company.localeCompare(a.company);
        case "role-az":
          return a.position.localeCompare(b.position);
        case "role-za":
          return b.position.localeCompare(a.position);
        default:
          return 0;
      }
    });

  const sortLabels: Record<SortOption, string> = {
    "date-newest": "Date (Newest)",
    "date-oldest": "Date (Oldest)",
    "company-az": "Company (A-Z)",
    "company-za": "Company (Z-A)",
    "role-az": "Role (A-Z)",
    "role-za": "Role (Z-A)",
  };

  const totalApps = applications.length;
  const interviewRate = totalApps > 0
    ? Math.round((applications.filter(a => a.status === "interviewing" || a.status === "offered").length / totalApps) * 100)
    : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.15, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2.5"
            >
              <motion.div
                className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center overflow-hidden"
                whileHover={{ scale: 1.05, rotate: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <img src="/rocket.png" alt="Rocket" className="w-full h-full object-contain" />
              </motion.div>
              <span className="font-display text-lg font-medium tracking-tight text-foreground">
                applyto.tech
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              {/* Dark Mode Toggle */}
              <motion.button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
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
                      <Sun className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Moon className="w-4 h-4 text-muted-foreground" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.button>

              {isSignedIn ? (
                <div className="relative" ref={userMenuRef}>
                  <motion.button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-secondary transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    data-testid="button-user-menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-medium overflow-hidden">
                      {user?.avatar?.startsWith('http') ? (
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
                        className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-border">
                          <p className="text-sm font-medium text-foreground">{user?.name}</p>
                          <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>

                        <div className="py-1">
                          <button
                            onClick={() => {
                              setShowSettings(true);
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary/50 transition-colors"
                            data-testid="button-settings"
                          >
                            <Settings className="w-4 h-4 text-muted-foreground" />
                            Settings
                          </button>
                          <button
                            onClick={handleExportData}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary/50 transition-colors"
                            data-testid="button-export"
                          >
                            <Download className="w-4 h-4 text-muted-foreground" />
                            Export Data
                          </button>
                        </div>

                        <div className="border-t border-border py-1">
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
                            data-testid="button-sign-out"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.button
                  onClick={handleGoogleSignIn}
                  className="flex items-center gap-2.5 px-4 h-9 rounded-lg bg-primary text-primary-foreground hover:opacity-90 text-sm font-medium transition-colors"
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

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground font-display">Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  data-testid="button-close-settings"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-6">
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Account</h3>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-secondary/50">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-sm font-medium overflow-hidden">
                        {user?.avatar?.startsWith('http') ? (
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

                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Preferences</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {darkMode ? <Moon className="w-4 h-4 text-muted-foreground" /> : <Sun className="w-4 h-4 text-muted-foreground" />}
                        <div>
                          <p className="text-sm text-foreground">Dark Mode</p>
                          <p className="text-xs text-muted-foreground">Use dark theme</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`w-10 h-6 rounded-full transition-colors relative ${darkMode ? "bg-violet-500" : "bg-muted"}`}
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

                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Data & Privacy</h3>
                  <div className="space-y-2">
                    <button
                      onClick={handleExportData}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                      data-testid="button-export-settings"
                    >
                      <Download className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-foreground">Export Data</p>
                        <p className="text-xs text-muted-foreground">Download all your applications</p>
                      </div>
                    </button>

                    <button
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                    >
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-foreground">Privacy Policy</p>
                        <p className="text-xs text-muted-foreground">How we handle your data</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-medium text-red-400/80 uppercase tracking-wider mb-3">Danger Zone</h3>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors text-left"
                    data-testid="button-delete-account"
                  >
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

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="w-full max-w-sm bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 text-center">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
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
                    onClick={() => setShowDeleteConfirm(false)}
                    data-testid="button-cancel-delete"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                    onClick={handleDeleteAccount}
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

      <main className="max-w-6xl mx-auto px-6 py-10">
        {(authLoading || appsLoading) && isSignedIn ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground mb-1">
                {isSignedIn ? `Welcome back, ${user?.name.split(" ")[0]}` : "Applications"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {isSignedIn ? "Track your job search progress" : "Sign in to save your applications"}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
            >
              <motion.div
                className="bg-card border border-border rounded-lg px-4 py-3 group cursor-default"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Total</span>
                  <Briefcase className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <div className="text-2xl font-semibold text-foreground font-display">
                  <AnimatedCounter value={totalApps} />
                </div>
              </motion.div>

              <motion.div
                className="bg-card border border-border rounded-lg px-4 py-3 group cursor-default"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">This Week</span>
                  <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <div className="text-2xl font-semibold text-foreground font-display">
                  <AnimatedCounter value={3} />
                </div>
              </motion.div>

              <motion.div
                className="bg-card border border-border rounded-lg px-4 py-3 group cursor-default"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Interview Rate</span>
                  <TrendingUp className="w-3.5 h-3.5 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                </div>
                <div className="text-2xl font-semibold text-foreground font-display">
                  <AnimatedCounter value={interviewRate} />%
                </div>
              </motion.div>

              <motion.div
                className="bg-card border border-border rounded-lg px-4 py-3 group cursor-default"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Active</span>
                  <Clock className="w-3.5 h-3.5 text-muted-foreground group-hover:text-sky-500 transition-colors" />
                </div>
                <div className="text-2xl font-semibold text-foreground font-display">
                  <AnimatedCounter value={applications.filter(a => a.status === "applied" || a.status === "interviewing").length} />
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex gap-6 mb-6 border-b border-border"
            >
              {["recommended", "custom"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as "recommended" | "custom")}
                  className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === tab
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                  data-testid={`tab-${tab}`}
                >
                  <span className="flex items-center gap-1.5">
                    {tab === "recommended" && <Sparkles className="w-3.5 h-3.5" />}
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </span>
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-px bg-foreground"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </motion.div>

            {activeTab === "recommended" && (
              <div>
                {/* Category filter pills */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <motion.button
                    onClick={() => setRecommendedCategory("all")}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      recommendedCategory === "all"
                        ? "bg-violet-500 text-white"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    All ({recommendedInternships.length})
                  </motion.button>
                  {INTERNSHIP_CATEGORIES.map((cat) => (
                    <motion.button
                      key={cat}
                      onClick={() => setRecommendedCategory(recommendedCategory === cat ? "all" : cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        recommendedCategory === cat
                          ? "bg-violet-500 text-white"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {cat} ({categoryCounts[cat] || 0})
                    </motion.button>
                  ))}
                </div>

                {/* Search bar for recommended */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      value={recommendedSearch}
                      onChange={(e) => setRecommendedSearch(e.target.value)}
                      placeholder="Search internships..."
                      className="pl-9 pr-8 bg-transparent border-border text-sm h-8 placeholder:text-muted-foreground focus:border-ring focus:ring-0"
                    />
                    <AnimatePresence>
                      {recommendedSearch && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          onClick={() => setRecommendedSearch("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-3.5 h-3.5" />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {recommendedLoading ? "Loading..." : `${filteredRecommended.length} internships`}
                  </span>
                </div>

                {recommendedLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-6 h-6 text-muted-foreground" />
                    </motion.div>
                    <p className="text-sm text-muted-foreground">Loading recommended internships...</p>
                  </div>
                ) : recommendedError ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <AlertTriangle className="w-6 h-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{recommendedError}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        recommendedFetched.current = false;
                        setActiveTab("custom");
                        setTimeout(() => setActiveTab("recommended"), 0);
                      }}
                      className="text-xs"
                    >
                      Retry
                    </Button>
                  </div>
                ) : (
                  <div className="border border-border rounded-lg">
                    <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-secondary/30 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <div className="col-span-3">Company</div>
                      <div className="col-span-4">Role</div>
                      <div className="col-span-2">Location</div>
                      <div className="col-span-1">Posted</div>
                      <div className="col-span-2 text-right">Apply</div>
                    </div>

                    <div className="max-h-[600px] overflow-y-auto" ref={recommendedScrollRef} onScroll={handleRecommendedScroll}>
                      {filteredRecommended.slice(0, recommendedDisplayCount).map((item, index) => (
                        <div
                          key={`${item.company}-${item.role}-${index}`}
                          className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-secondary/30 transition-colors group border-b border-border/50 last:border-b-0"
                        >
                          <div className="col-span-3 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center text-muted-foreground text-sm font-medium shrink-0">
                              {item.company.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-foreground truncate">
                              {item.company}
                            </span>
                          </div>

                          <div className="col-span-4">
                            <span className="text-sm text-foreground/80 line-clamp-2">
                              {item.role}
                            </span>
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
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-violet-500/10 text-violet-500 hover:bg-violet-500/20 text-xs font-medium transition-colors hover:scale-105 active:scale-95"
                            >
                              Apply
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>

                    {filteredRecommended.length === 0 && !recommendedLoading && (
                      <div className="px-5 py-12 text-center">
                        <Briefcase className="w-5 h-5 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">
                          {recommendedSearch ? "No internships match your search" : "No internships found"}
                        </p>
                      </div>
                    )}

                  </div>
                )}

                <div className="mt-4">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Sourced from SimplifyJobs/Summer2026-Internships
                  </p>
                </div>
              </div>
            )}

            {activeTab === "custom" && (
            <>
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={isCanceling
                    ? { opacity: 0, height: 0, transition: { height: { duration: 0.15, ease: [0.4, 0, 1, 1] }, opacity: { duration: 0.1, ease: [0.4, 0, 1, 1] } } }
                    : { opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }
                  }
                  className="mb-6"
                  style={isCanceling ? { overflow: "hidden" } : { overflow: "visible" }}
                >
                  <motion.div
                    className="bg-card border border-border rounded-lg p-5 relative overflow-visible"
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={isCanceling
                      ? { opacity: 0, transition: { duration: 0.1 } }
                      : { y: 10, opacity: 0, transition: { delay: 0.05, duration: 0.2, ease: [0.4, 0, 0.2, 1] } }
                    }
                  >
                    {/* Success Animation Overlay */}
                    <AnimatePresence>
                      {showSuccessAnimation && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-card/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4"
                        >
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 20,
                              delay: 0.1
                            }}
                            className="relative"
                          >
                            {/* Ripple effect */}
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0.8 }}
                              animate={{ scale: 2.5, opacity: 0 }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                              className="absolute inset-0 rounded-full bg-emerald-500/30"
                            />
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0.6 }}
                              animate={{ scale: 2, opacity: 0 }}
                              transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                              className="absolute inset-0 rounded-full bg-emerald-500/20"
                            />
                            {/* Checkmark circle */}
                            <motion.div
                              className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30"
                              initial={{ scale: 0 }}
                              animate={{ scale: [0, 1.2, 1] }}
                              transition={{ duration: 0.4, times: [0, 0.6, 1] }}
                            >
                              <motion.svg
                                viewBox="0 0 24 24"
                                className="w-8 h-8 text-white"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 0.3, delay: 0.2 }}
                              >
                                <motion.path
                                  d="M5 13l4 4L19 7"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={3}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ duration: 0.3, delay: 0.25 }}
                                />
                              </motion.svg>
                            </motion.div>
                          </motion.div>
                          <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                            className="text-sm font-medium text-emerald-500"
                          >
                            Application Added!
                          </motion.p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex items-center gap-2 mb-5">
                      <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 180 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      >
                        <Plus className="w-4 h-4 text-muted-foreground" />
                      </motion.div>
                      <span className="text-sm font-medium text-foreground">New Application</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <motion.div
                        className="space-y-1.5"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Building2 className="w-3 h-3" />
                          Company
                        </label>
                        <Input
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          placeholder="Stripe"
                          className="bg-secondary/50 border-border text-sm h-9 placeholder:text-muted-foreground focus:border-ring focus:ring-0 transition-all"
                          data-testid="input-company"
                        />
                      </motion.div>

                      <motion.div
                        className="space-y-1.5"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                      >
                        <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Briefcase className="w-3 h-3" />
                          Position
                        </label>
                        <Input
                          value={formData.position}
                          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                          placeholder="Frontend Engineer"
                          className="bg-secondary/50 border-border text-sm h-9 placeholder:text-muted-foreground focus:border-ring focus:ring-0 transition-all"
                          data-testid="input-position"
                        />
                      </motion.div>

                      <motion.div
                        className="space-y-1.5"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Link2 className="w-3 h-3" />
                          Link
                        </label>
                        <Input
                          value={formData.link}
                          onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                          placeholder="https://..."
                          className="bg-secondary/50 border-border text-sm h-9 placeholder:text-muted-foreground focus:border-ring focus:ring-0 transition-all"
                          data-testid="input-link"
                        />
                      </motion.div>

                      <motion.div
                        className="space-y-1.5 relative"
                        style={{ minHeight: 'auto', height: 'auto' }}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 }}
                      >
                        <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          Status
                        </label>
                        <div className="relative" style={{ minHeight: '36px' }} ref={formStatusDropdownRef}>
                          <button
                            onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                            className="w-full flex items-center justify-between px-3 h-9 rounded-md bg-secondary/50 border border-border hover:border-ring transition-colors text-sm"
                            data-testid="select-status"
                          >
                            <span className={statusConfig[formData.status].color}>
                              {statusConfig[formData.status].label}
                            </span>
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                          {statusDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 5, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.15, ease: "easeOut" }}
                              className="absolute bottom-full left-0 right-0 mb-1 bg-card border border-border rounded-md shadow-xl z-[200] py-1"
                            >
                              {(Object.keys(statusConfig) as Status[]).map((status, index) => (
                                <motion.button
                                  key={status}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.03 }}
                                  onClick={() => {
                                    setFormData({ ...formData, status });
                                    setStatusDropdownOpen(false);
                                  }}
                                  className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary/50 transition-colors text-sm ${statusConfig[status].color}`}
                                  data-testid={`option-status-${status}`}
                                >
                                  {statusConfig[status].label}
                                </motion.button>
                              ))}
                            </motion.div>
                          )}
                        </div>
                      </motion.div>

                      <motion.div
                        className="space-y-1.5"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <CalendarIcon className="w-3 h-3" />
                          Date Applied
                        </label>
                        <div className="relative">
                          <Input
                            type="date"
                            value={dateInputValue}
                            onChange={(e) => {
                              setDateInputValue(e.target.value);
                              setFormData({
                                ...formData,
                                dateApplied: new Date(e.target.value).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
                              });
                            }}
                            className="bg-secondary/50 border-border text-sm h-9 focus:border-ring focus:ring-0 transition-all text-foreground pr-8"
                            data-testid="input-date"
                          />
                        </div>
                      </motion.div>
                    </div>

                    <motion.div
                      className="flex justify-end gap-2 mt-5 pt-4 border-t border-border"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.35 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setStatusDropdownOpen(false);
                          setIsCanceling(true);
                          setShowForm(false);
                          setTimeout(() => {
                            setIsCanceling(false);
                          }, 200);
                        }}
                        className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 h-8"
                        data-testid="button-cancel"
                      >
                        Cancel
                      </Button>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          size="sm"
                          onClick={handleAddApplication}
                          className="bg-zinc-100 hover:bg-white text-zinc-900 h-8"
                          data-testid="button-submit"
                        >
                          Add
                        </Button>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex flex-wrap items-center gap-2 mb-4"
            >
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search applications..."
                  className="pl-9 pr-8 bg-transparent border-border text-sm h-8 placeholder:text-muted-foreground focus:border-ring focus:ring-0"
                  data-testid="input-search"
                />
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-muted-foreground hover:text-foreground"
                      data-testid="button-clear-search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative" ref={filterRef}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setFilterDropdownOpen(!filterDropdownOpen);
                    setSortDropdownOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 h-8 rounded-md border text-sm transition-colors ${statusFilter !== "all"
                    ? "bg-secondary border-border text-foreground"
                    : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-ring"
                    }`}
                  data-testid="button-filter-status"
                >
                  <Filter className="w-3.5 h-3.5" />
                  {statusFilter === "all" ? "All Status" : statusConfig[statusFilter].label}
                  <ChevronDown className="w-3 h-3" />
                </motion.button>
                <AnimatePresence>
                  {filterDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute top-full left-0 mt-1 bg-card border border-border rounded-md shadow-xl z-50 overflow-hidden py-1 min-w-[140px]"
                    >
                      <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => {
                          setStatusFilter("all");
                          setFilterDropdownOpen(false);
                        }}
                        className={`w-full flex items-center px-3 py-2 hover:bg-secondary/50 transition-colors text-sm ${statusFilter === "all" ? "text-foreground" : "text-muted-foreground"
                          }`}
                        data-testid="filter-all"
                      >
                        All Status
                      </motion.button>
                      {(Object.keys(statusConfig) as Status[]).map((status, index) => (
                        <motion.button
                          key={status}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (index + 1) * 0.03 }}
                          onClick={() => {
                            setStatusFilter(status);
                            setFilterDropdownOpen(false);
                          }}
                          className={`w-full flex items-center px-3 py-2 hover:bg-secondary/50 transition-colors text-sm ${statusFilter === status ? statusConfig[status].color : "text-muted-foreground"
                            }`}
                          data-testid={`filter-${status}`}
                        >
                          {statusConfig[status].label}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative" ref={sortRef}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSortDropdownOpen(!sortDropdownOpen);
                    setFilterDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 h-8 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-ring text-sm transition-colors"
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
                      className="absolute top-full left-0 mt-1 bg-card border border-border rounded-md shadow-xl z-50 overflow-hidden py-1 min-w-[160px]"
                    >
                      {(Object.keys(sortLabels) as SortOption[]).map((option, index) => (
                        <motion.button
                          key={option}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          onClick={() => {
                            setSortBy(option);
                            setSortDropdownOpen(false);
                          }}
                          className={`w-full flex items-center px-3 py-2 hover:bg-secondary/50 transition-colors text-sm ${sortBy === option ? "text-foreground" : "text-muted-foreground"
                            }`}
                          data-testid={`sort-${option}`}
                        >
                          {sortLabels[option]}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {(statusFilter !== "all" || searchQuery) && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => {
                      setStatusFilter("all");
                      setSearchQuery("");
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    data-testid="button-clear-filter"
                  >
                    Clear all
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Add Application Button - Purple */}
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
                    <Button
                      onClick={() => setShowForm(!showForm)}
                      size="sm"
                      className="bg-violet-500 hover:bg-violet-600 text-white border-0 gap-1.5 font-medium text-sm h-8"
                      data-testid="button-add-new"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Application
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="border border-border rounded-lg"
            >
              <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-secondary/30 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <div className="col-span-3">Company</div>
                <div className="col-span-4">Role</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 pl-4">Date Applied</div>
                <div className="col-span-1"></div>
              </div>

              <div>
                {filteredAndSortedApplications.map((app) => {
                  return (
                    <div
                      key={app.id}
                      className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-secondary/30 transition-colors group border-b border-border/50 last:border-b-0"
                      data-testid={`row-application-${app.id}`}
                    >
                      <div className="col-span-3 flex items-center gap-3">
                        <motion.div
                          className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center text-muted-foreground text-sm font-medium"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          {app.company.charAt(0)}
                        </motion.div>
                        <span className="text-sm font-medium text-foreground" data-testid={`text-company-${app.id}`}>
                          {app.company}
                        </span>
                      </div>

                      <div className="col-span-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-foreground/80" data-testid={`text-position-${app.id}`}>
                            {app.position}
                          </span>
                          {app.link && (
                            <motion.a
                              href={app.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                              whileHover={{ scale: 1.1 }}
                              data-testid={`link-job-${app.id}`}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </motion.a>
                          )}
                        </div>
                      </div>

                      <div className="col-span-2">
                        <div
                          className="relative"
                          ref={(el) => {
                            if (el) {
                              statusDropdownRefs.current.set(app.id, el);
                            } else {
                              statusDropdownRefs.current.delete(app.id);
                            }
                          }}
                        >
                          <motion.button
                            onClick={() => setOpenStatusDropdown(openStatusDropdown === app.id ? null : app.id)}
                            className={`group/status inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer backdrop-blur-sm transition-all duration-200 shadow-sm hover:shadow-md ${app.status === "applied"
                              ? darkMode
                                ? "bg-zinc-400/20 text-zinc-400 shadow-zinc-400/20"
                                : "bg-zinc-400/15 text-zinc-400 shadow-zinc-400/20"
                              : app.status === "interviewing"
                                ? darkMode
                                  ? "bg-sky-400/20 text-sky-400 shadow-sky-400/20"
                                  : "bg-sky-400/15 text-sky-400 shadow-sky-400/20"
                                : app.status === "offered"
                                  ? darkMode
                                    ? "bg-emerald-500/20 text-emerald-500 shadow-emerald-500/20"
                                    : "bg-emerald-500/15 text-emerald-500 shadow-emerald-500/20"
                                  : darkMode
                                    ? "bg-red-500/20 text-red-500 shadow-red-500/20"
                                    : "bg-red-500/15 text-red-500 shadow-red-500/20"
                              }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            data-testid={`badge-status-${app.id}`}
                          >
                            {(() => {
                              const StatusIcon = statusConfig[app.status].icon;
                              return <StatusIcon className="w-3 h-3 opacity-90 group-hover/status:opacity-100 transition-opacity" />;
                            })()}
                            {statusConfig[app.status].label}
                          </motion.button>
                          <AnimatePresence>
                            {openStatusDropdown === app.id && (
                              <motion.div
                                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className="absolute top-full left-0 mt-1 bg-card border border-border rounded-md shadow-xl z-[100] overflow-hidden py-1 min-w-[120px]"
                              >
                                {(Object.keys(statusConfig) as Status[]).map((status, index) => (
                                  <motion.button
                                    key={status}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    onClick={() => handleStatusChange(app.id, status)}
                                    className={`w-full flex items-center px-3 py-1.5 hover:bg-secondary/50 transition-colors text-xs ${app.status === status ? statusConfig[status].color : "text-muted-foreground"
                                      }`}
                                  >
                                    {statusConfig[status].label}
                                  </motion.button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      <div className="col-span-2 text-sm text-muted-foreground pl-4" data-testid={`text-date-${app.id}`}>
                        {app.dateApplied}
                      </div>

                      <div className="col-span-1 flex justify-end">
                        <motion.button
                          onClick={() => handleDelete(app.id)}
                          className="p-1.5 rounded text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          data-testid={`button-delete-${app.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredAndSortedApplications.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-5 py-12 text-center"
                >
                  <motion.div
                    className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mx-auto mb-3"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Briefcase className="w-5 h-5 text-muted-foreground" />
                  </motion.div>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery || statusFilter !== "all"
                      ? "No applications match your filters"
                      : "No applications yet"}
                  </p>
                </motion.div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                {(Object.keys(statusConfig) as Status[]).map((status) => {
                  const count = applications.filter(app => app.status === status).length;
                  const isSelected = statusFilter === status;
                  const dotColors: Record<Status, string> = {
                    applied: "bg-zinc-400",
                    interviewing: "bg-sky-400",
                    offered: "bg-emerald-500",
                    rejected: "bg-red-500",
                  };
                  return (
                    <motion.button
                      key={status}
                      onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}
                      className={`flex items-center gap-2 text-xs transition-colors ${isSelected ? statusConfig[status].color : "text-muted-foreground hover:text-foreground"
                        }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      data-testid={`quick-filter-${status}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isSelected ? dotColors[status] : statusConfig[status].bgColor}`} />
                      {statusConfig[status].label}
                      <span className="text-muted-foreground">({count})</span>
                    </motion.button>
                  );
                })}
              </div>

              <p className="text-xs text-muted-foreground">
                {filteredAndSortedApplications.length} of {applications.length} applications
              </p>
            </motion.div>
            </>
            )}
          </>
        )}
      </main>
    </div >
  );
}

