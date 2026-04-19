import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

import {
  fetchUnreadInboxCount,
  INBOX_UPDATED_EVENT,
} from "../../services/notificationService";
import { useTheme } from "../../context/ThemeContext";

export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isLightTheme } = useTheme();
  const [openProfile, setOpenProfile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userInitials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const loadUnreadCount = useCallback(async () => {
    try {
      const data = await fetchUnreadInboxCount();
      setUnreadCount(Number(data?.unreadCount) || 0);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    const initId = window.setTimeout(() => {
      loadUnreadCount();
    }, 0);
    const intervalId = window.setInterval(loadUnreadCount, 30000);
    const handleInboxUpdated = () => loadUnreadCount();
    window.addEventListener(INBOX_UPDATED_EVENT, handleInboxUpdated);

    return () => {
      window.clearTimeout(initId);
      window.clearInterval(intervalId);
      window.removeEventListener(INBOX_UPDATED_EVENT, handleInboxUpdated);
    };
  }, [loadUnreadCount]);

  const pageTitleMap = {
    "/dashboard": "Dashboard",
    "/inbox": "Inbox",
    "/workflows": "Workflows",
    "/workflows/create": "Create Workflow",
    "/tasks": "Tasks",
    "/tasks/create": "Create Task",
    "/sla": "SLA Monitor",
    "/analytics": "Analytics",
    "/users": "User Management",
    "/groups": "Groups",
    "/teams": "Teams",
    "/audit": "Audit Logs",
    "/org-settings": "Org Settings",
  };

  const pageTitle =
    pageTitleMap[location.pathname] ||
    (location.pathname.startsWith("/workflows/") ? "Workflow Details" : null) ||
    (location.pathname.startsWith("/tasks/") ? "Task Details" : null) ||
    "Workspace";

  return (
    <header
      className={`sticky top-0 z-[100] px-4 pt-4 md:px-6 md:pt-5 xl:px-8 ${
        isLightTheme ? "text-slate-100" : "text-white"
      }`}
    >
      <div
        className={`flex items-center justify-between gap-4 rounded-[28px] border px-5 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-2xl md:px-6 ${
          isLightTheme
            ? "border-slate-700/70 bg-slate-950/72 shadow-[0_18px_50px_rgba(2,6,23,0.28)]"
            : "border-slate-800/80 bg-slate-950/75"
        }`}
      >
        <div className="flex min-w-0 items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition hover:border-emerald-400/50 hover:text-emerald-500 ${
              isLightTheme
                ? "border-slate-700 bg-slate-900/90 text-slate-200"
                : "border-slate-700 bg-slate-800/80 text-slate-200"
            }`}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-5 w-5">
              <path
                d="M4 6h12M4 10h12M4 14h12"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <div className="min-w-0">
            <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${isLightTheme ? "text-slate-400" : "text-slate-500"}`}>
              Command Center
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl font-bold">{pageTitle}</h2>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isLightTheme
                  ? "bg-teal-400/12 text-teal-200 ring-1 ring-teal-300/20"
                    : "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/20"
                }`}
              >
                Org {user?.orgCode || "--"}
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-[110] flex items-center gap-3">
          <Link
            to="/inbox"
            className={`relative flex h-11 w-11 items-center justify-center rounded-2xl border transition hover:border-cyan-400/50 hover:text-cyan-500 ${
              isLightTheme
                ? "border-slate-700 bg-slate-900/90 text-slate-200"
                : "border-slate-700 bg-slate-800/90 text-slate-200"
            }`}
            aria-label="Open inbox"
            title="Inbox"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
              <path
                d="M7 10a5 5 0 1 1 10 0v4l1.2 2.1a1 1 0 0 1-.86 1.5H6.66a1 1 0 0 1-.86-1.5L7 14.01V10Zm3.5 9h3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-slate-950">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => setOpenProfile((prev) => !prev)}
            className={`group flex items-center gap-3 rounded-2xl border px-3 py-2 transition hover:border-emerald-400/40 ${
              isLightTheme
                ? "border-slate-700 bg-slate-900/90 hover:bg-slate-900"
                : "border-slate-700 bg-slate-800/90 hover:bg-slate-800"
            }`}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f766e,#2dd4bf)] text-sm font-semibold text-white shadow-[0_8px_18px_rgba(15,118,110,0.24)]">
              {userInitials}
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className={`block max-w-36 truncate text-sm font-semibold ${isLightTheme ? "text-slate-100" : "text-slate-100"}`}>
                {user?.name}
              </span>
              <span className={`block max-w-36 truncate text-xs ${isLightTheme ? "text-slate-300" : "text-slate-400"}`}>
                {user?.role}
              </span>
            </span>
            <svg
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
              className={`h-4 w-4 text-slate-400 transition-transform ${
                openProfile ? "rotate-180" : ""
              }`}
            >
              <path
                d="m5 7 5 5 5-5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {openProfile && (
            <div
              className={`absolute right-0 top-full z-[120] mt-3 w-72 overflow-hidden rounded-[24px] border p-4 shadow-[0_24px_60px_rgba(15,23,42,0.18)] ${
                isLightTheme
                  ? "border-slate-700 bg-slate-950/95"
                  : "border-slate-700 bg-slate-900/95"
              }`}
            >
              <div className={`mb-4 flex items-center gap-3 border-b pb-4 ${isLightTheme ? "border-slate-800" : "border-slate-800"}`}>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f766e,#2dd4bf)] text-sm font-semibold text-white">
                  {userInitials}
                </span>
                <div className="min-w-0">
                  <p className={`truncate text-sm font-semibold ${isLightTheme ? "text-white" : "text-white"}`}>{user?.name}</p>
                  <p className={`truncate text-xs ${isLightTheme ? "text-slate-300" : "text-slate-400"}`}>{user?.email}</p>
                </div>
              </div>

              <div className="grid gap-3">
                <div
                  className={`rounded-2xl px-3 py-3 ${
                    isLightTheme ? "bg-slate-900/90" : "bg-slate-800/80"
                  }`}
                >
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${isLightTheme ? "text-slate-400" : "text-slate-500"}`}>
                    Account Role
                  </p>
                  <p className={`mt-1 text-sm font-semibold capitalize ${isLightTheme ? "text-emerald-300" : "text-emerald-300"}`}>
                    {user?.role}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full rounded-2xl bg-rose-500/12 px-3 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-500/18"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
