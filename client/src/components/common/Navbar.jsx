import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

import {
  fetchUnreadInboxCount,
  INBOX_UPDATED_EVENT,
} from "../../services/notificationService";

export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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

  return (
    <header className="sticky top-0 z-[100] flex items-center justify-between gap-4 border-b border-slate-800 bg-slate-900/80 px-6 py-4 backdrop-blur-xl md:px-8">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 text-slate-200 transition hover:border-emerald-400/50 hover:text-emerald-300"
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

      <div className="truncate text-sm text-slate-400">
        Org: <span className="text-white">{user?.orgCode}</span>
      </div>

      <div className="relative z-[110] flex items-center gap-3">
        <Link
          to="/inbox"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/90 text-slate-200 transition hover:border-cyan-400/50 hover:text-cyan-300"
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
          className="group flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2 transition hover:border-emerald-400/40 hover:bg-slate-800"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/15 text-sm font-semibold text-emerald-300">
            {userInitials}
          </span>
          <span className="hidden max-w-32 truncate text-sm text-slate-200 sm:block">
            {user?.name}
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
          <div className="absolute right-0 top-full z-[120] mt-3 w-64 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/95 p-4 shadow-2xl">
            <div className="mb-3 flex items-center gap-3 border-b border-slate-800 pb-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/15 text-sm font-semibold text-emerald-300">
                {userInitials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{user?.name}</p>
                <p className="truncate text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>

            <p className="mb-3 text-xs uppercase tracking-wide text-slate-500">
              Account Role
            </p>
            <p className="mb-4 text-sm capitalize text-emerald-400">{user?.role}</p>

            <button
              onClick={handleLogout}
              className="w-full rounded-lg bg-red-500/20 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/30"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
