import { NavLink, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const icons = {
  Dashboard: "M4 10.5 12 4l8 6.5V20h-5v-6H9v6H4v-9.5Z",
  Workflows: "M7 5h4v4H7V5Zm6 0h4v4h-4V5ZM7 15h4v4H7v-4Zm6 0h4v4h-4v-4ZM9 9v6m6-6v6M11 7h2m-2 10h2",
  Tasks: "M8 7h11M8 12h11M8 17h11M4 7h.01M4 12h.01M4 17h.01",
  Groups: "M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8-1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3.5 20a4.5 4.5 0 0 1 9 0M13.5 20a4 4 0 0 1 7 0",
  Users: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM4 19a5 5 0 0 1 10 0M15 19c0-2 1.5-3.5 3.5-3.5",
  Analytics: "M5 19V9m7 10V5m7 14v-7",
  "Audit Logs": "M6 4h9l3 3v13H6V4Zm8 0v4h4M9 12h6M9 16h6",
  Alerts: "M7 10a5 5 0 1 1 10 0v4l1.2 2H5.8L7 14v-4Zm3.5 9h3",
  Settings: "M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm0-5v2m0 13v2m8.5-8.5h-2m-13 0h-2m14.5-6.5-1.4 1.4M6.9 17.1l-1.4 1.4m13 0-1.4-1.4M6.9 6.9 5.5 5.5",
  Logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m6 14 5-5-5-5m5 5H9",
};

const menuItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Workflows", path: "/workflows" },
  { name: "Tasks", path: "/tasks" },
  { name: "Groups", path: "/teams" },
  { name: "Users", path: "/users", admin: true },
  { name: "Analytics", path: "/analytics", admin: true },
  { name: "Audit Logs", path: "/audit", admin: true },
  { name: "Alerts", path: "/inbox" },
];

function MenuIcon({ name }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d={icons[name]}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export default function Sidebar({ sidebarOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const visibleItems = menuItems.filter((item) => !item.admin || user?.role === "admin");
  const initial = user?.name?.[0]?.toUpperCase() || "U";

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm transition-opacity md:hidden ${
          sidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-slate-800/80 bg-[#06111d] py-6 transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo — fixed, never shrinks */}
        <div className="mb-6 flex shrink-0 items-center gap-3 px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-lg font-black text-white shadow-[0_12px_28px_rgba(16,185,129,0.25)]">
            I
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Intelli<span className="text-emerald-400">Flow</span>
          </h1>
        </div>

        {/* Scrollable nav area — takes remaining space, scrolls if needed */}
        <div className="min-h-0 flex-1 overflow-y-auto px-3">
          <p className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Main Menu
          </p>

          <nav className="space-y-1 pb-4">
            {visibleItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={() => {
                  const isActive =
                    location.pathname === item.path && item.name !== "Settings";
                  return `flex items-center gap-4 rounded-md px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-emerald-500/13 text-white shadow-[inset_3px_0_0_#10b981]"
                      : "text-slate-400 hover:bg-slate-900/70 hover:text-white"
                  }`;
                }}
              >
                <MenuIcon name={item.name} />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom section — fixed, always visible, never pushed off-screen */}
        <div className="shrink-0 space-y-3 border-t border-slate-800/80 px-3 pt-4">
          <div className="rounded-lg border border-slate-800 bg-slate-950/35 p-3">
            <p className="text-xs uppercase tracking-wider text-slate-500">Organization</p>
            <p className="mt-1.5 text-sm font-semibold text-emerald-400">
              {user?.orgCode || "IFLOW-004"}
            </p>
            <p className="mt-1 text-sm text-slate-300">TechNova Solutions</p>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/35 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
              <p className="text-xs capitalize text-slate-400">{user?.role}</p>
            </div>
            {typeof logout === "function" && (
              <button
                type="button"
                onClick={logout}
                title="Log out"
                className="shrink-0 rounded-md p-2 text-slate-400 transition hover:bg-slate-800 hover:text-rose-400"
              >
                <MenuIcon name="Logout" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}