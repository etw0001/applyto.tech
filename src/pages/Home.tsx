import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useApplications } from "@/hooks/use-applications";
import { supabase } from "@/lib/supabase";
import { mockApplications } from "@/constants/status";
import { layout } from "@/styles/home";
import type { Status, SortOption, UserProfile } from "@/types";

// ─── Components ──────────────────────────────────────────
import Header from "@/components/home/Header";
import SettingsModal from "@/components/home/SettingsModal";
import DeleteConfirmModal from "@/components/home/DeleteConfirmModal";
import StatsCards from "@/components/home/StatsCards";
import TabNavigation from "@/components/home/TabNavigation";
import RecommendedTab from "@/components/home/RecommendedTab";
import ApplicationForm from "@/components/home/ApplicationForm";
import ApplicationToolbar from "@/components/home/ApplicationToolbar";
import ApplicationTable from "@/components/home/ApplicationTable";
import StatusFooter from "@/components/home/StatusFooter";

export default function Home() {
  // ─── Auth ────────────────────────────────────────────────
  const { user: authUser, loading: authLoading, signInWithGoogle, signOut: signOutUser } = useAuth();
  const isSignedIn = !!authUser;

  // ─── Applications ────────────────────────────────────────
  const {
    applications: supabaseApplications,
    loading: appsLoading,
    addApplication: addApplicationToDB,
    updateApplication: updateApplicationInDB,
    deleteApplication: deleteApplicationFromDB,
  } = useApplications(authUser?.id);

  const applications = (isSignedIn ? supabaseApplications : mockApplications) as import("@/types").Application[];

  // ─── UI State ────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"recommended" | "custom">("custom");
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("date-newest");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [openStatusDropdown, setOpenStatusDropdown] = useState<string | null>(null);

  // ─── Theme ───────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved ? saved === "dark" : false;
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    return isDark;
  });

  // ─── Refs ────────────────────────────────────────────────
  const userMenuRef = useRef<HTMLDivElement>(null);

  // ─── User Profile Sync ───────────────────────────────────
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (authUser) {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authUser.id)
            .single();

          if (error && error.code === "PGRST116") {
            const { data: newProfile, error: createError } = await supabase
              .from("profiles")
              .insert({
                id: authUser.id,
                name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User",
                email: authUser.email || "",
                avatar_url: authUser.user_metadata?.avatar_url || null,
                theme: "light",
              })
              .select()
              .single();

            if (createError) throw createError;

            if (newProfile) {
              setUser({
                name: newProfile.name || authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
                email: newProfile.email || authUser.email || "",
                avatar: newProfile.avatar_url || authUser.user_metadata?.avatar_url || (newProfile.name?.[0] || authUser.email?.[0] || "U").toUpperCase(),
              });
              return;
            }
          }

          if (error) throw error;

          if (data) {
            setUser({
              name: data.name || authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
              email: data.email || authUser.email || "",
              avatar: data.avatar_url || authUser.user_metadata?.avatar_url || (data.name?.[0] || authUser.email?.[0] || "U").toUpperCase(),
            });

            if (data.theme) {
              const isDark = data.theme === "dark";
              setDarkMode((prev) => (prev !== isDark ? isDark : prev));
              localStorage.setItem("theme", data.theme);
            } else {
              const currentTheme = darkMode ? "dark" : "light";
              supabase.from("profiles").update({ theme: currentTheme }).eq("id", authUser.id);
              localStorage.setItem("theme", currentTheme);
            }
          } else {
            setUser({
              name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
              email: authUser.email || "",
              avatar: authUser.user_metadata?.avatar_url || (authUser.email?.[0] || "U").toUpperCase(),
            });
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUser({
            name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
            email: authUser.email || "",
            avatar: authUser.user_metadata?.avatar_url || (authUser.email?.[0] || "U").toUpperCase(),
          });
        }
      } else {
        setUser(null);
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
          const shouldBeDark = savedTheme === "dark";
          setDarkMode((prev) => (prev !== shouldBeDark ? shouldBeDark : prev));
        }
      }
    };

    fetchUserProfile();
  }, [authUser]);

  // ─── Theme Persistence ───────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.add("no-transitions");
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.remove("no-transitions")));

    const timeoutId = setTimeout(() => {
      if (isSignedIn && authUser) {
        supabase.from("profiles").update({ theme: darkMode ? "dark" : "light" }).eq("id", authUser.id);
      }
      localStorage.setItem("theme", darkMode ? "dark" : "light");
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [darkMode, isSignedIn, authUser]);

  // ─── Click Outside for User Menu ─────────────────────────
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── Handlers ────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setUser(null);
      setShowUserMenu(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      if (isSignedIn && authUser) {
        const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        const session = refreshedSession || currentSession;

        if (!session?.access_token) {
          alert("You must be signed in to delete your account. Please sign out and sign back in.");
          return;
        }

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        const response = await fetch(`${supabaseUrl}/functions/v1/delete-user`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: supabaseAnonKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Failed to delete account (${response.status}): ${errorBody}`);
        }

        try { await signOutUser(); } catch { /* expected */ }
      }

      setUser(null);
      setShowDeleteConfirm(false);
      setShowSettings(false);
    } catch (error) {
      console.error("Error deleting account:", error);
      alert(`Failed to delete account: ${error instanceof Error ? error.message : "Unknown error"}`);
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

  const handleAddApplication = async (formData: { company: string; position: string; link: string; status: Status; dateApplied: string }) => {
    if (isSignedIn) {
      await addApplicationToDB(formData);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (isSignedIn) await deleteApplicationFromDB(id);
    } catch (error) {
      console.error("Error deleting application:", error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: Status) => {
    try {
      if (isSignedIn) await updateApplicationInDB(id, { status: newStatus });
      setOpenStatusDropdown(null);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // ─── Derived Data ────────────────────────────────────────
  const filteredAndSortedApplications = applications
    .filter((app) => statusFilter === "all" || app.status === statusFilter)
    .filter(
      (app) =>
        searchQuery === "" ||
        app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.position.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "date-newest": return new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime();
        case "date-oldest": return new Date(a.dateApplied).getTime() - new Date(b.dateApplied).getTime();
        case "company-az": return a.company.localeCompare(b.company);
        case "company-za": return b.company.localeCompare(a.company);
        case "role-az": return a.position.localeCompare(b.position);
        case "role-za": return b.position.localeCompare(a.position);
        default: return 0;
      }
    });

  // ─── Render ──────────────────────────────────────────────
  return (
    <div className={layout.page}>
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isSignedIn={isSignedIn}
        user={user}
        showUserMenu={showUserMenu}
        setShowUserMenu={setShowUserMenu}
        onSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
        onExport={handleExportData}
        onOpenSettings={() => { setShowSettings(true); setShowUserMenu(false); }}
        userMenuRef={userMenuRef}
      />

      <SettingsModal
        show={showSettings}
        onClose={() => setShowSettings(false)}
        user={user}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onExport={handleExportData}
        onDeleteAccount={() => setShowDeleteConfirm(true)}
      />

      <DeleteConfirmModal
        show={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
      />

      <main className={layout.main}>
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

            <StatsCards applications={applications} />

            <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

            {activeTab === "recommended" && <RecommendedTab />}

            {activeTab === "custom" && (
              <>
                <ApplicationForm
                  show={showForm}
                  onClose={() => setShowForm(false)}
                  onSubmit={handleAddApplication}
                />

                <ApplicationToolbar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  filterDropdownOpen={filterDropdownOpen}
                  setFilterDropdownOpen={setFilterDropdownOpen}
                  sortDropdownOpen={sortDropdownOpen}
                  setSortDropdownOpen={setSortDropdownOpen}
                  showForm={showForm}
                  setShowForm={setShowForm}
                />

                <ApplicationTable
                  applications={filteredAndSortedApplications}
                  darkMode={darkMode}
                  searchQuery={searchQuery}
                  statusFilter={statusFilter}
                  openStatusDropdown={openStatusDropdown}
                  setOpenStatusDropdown={setOpenStatusDropdown}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />

                <StatusFooter
                  applications={applications}
                  filteredCount={filteredAndSortedApplications.length}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                />
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
