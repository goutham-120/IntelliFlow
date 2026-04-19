import { NavLink } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useTheme } from "../../context/ThemeContext";

export default function Sidebar({ sidebarOpen }) {
  const { user } = useAuth();
  const { isLightTheme } = useTheme();

  // Common items (visible to all logged users)
  const commonItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Inbox", path: "/inbox" },
    { name: "Workflows", path: "/workflows" },
    { name: "Tasks", path: "/tasks" },
    { name: "SLA Monitor", path: "/sla" },
    { name: "Analytics", path: "/analytics" },
  ];

  // User + Admin items
  const userItems = [{ name: "Teams", path: "/teams" }];

  // Admin-only items
  const adminItems = [
    { name: "User Management", path: "/users" },
    { name: "Audit Logs", path: "/audit" },
  ];

  // Final menu based on role
  const menuItems =
    user?.role === "admin"
      ? [...commonItems, ...userItems, ...adminItems]
      : user?.role === "user"
      ? [...commonItems, ...userItems]
      : commonItems;

  const getItemIcon = (name) => {
    const iconClass = "h-5 w-5 shrink-0";

    if (name === "Dashboard") {
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
          <path d="M4 4h7v7H4V4Zm9 0h7v4h-7V4Zm0 6h7v10h-7V10Zm-9 3h7v7H4v-7Z" className="fill-current" />
        </svg>
      );
    }
    if (name === "Workflows") {
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
          <path d="M7 5a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm10 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm-10 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm10 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM9 7h6m-8 2v6m8-6v6m-6 2h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    }
    if (name === "Inbox") {
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
          <path
            d="M4 6h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Zm0 0 8 6 8-6M9 20h6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
    if (name === "Tasks") {
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
          <path d="M8 7h10M8 12h10M8 17h10M4 7h.01M4 12h.01M4 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    }
    if (name === "SLA Monitor") {
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <path d="m12 8 3 4h-3l-3 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    if (name === "Analytics") {
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
          <path d="M5 19V9m7 10V5m7 14v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    }
    if (name === "User Management") {
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
          <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM4 19a5 5 0 0 1 10 0M15 19c0-2 1.5-3.5 3.5-3.5 1 0 1.9.3 2.5.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    }
    if (name === "Teams") {
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
          <path d="M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm8 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM4 20a4 4 0 1 1 8 0M12 20a4 4 0 1 1 8 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    }
    if (name === "Audit Logs") {
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
          <path d="M6 4h9l3 3v13H6V4Zm8 0v4h4M9 11h6M9 15h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    return null;
  };

  return (
    <aside
      className={`${
        sidebarOpen ? "w-72" : "w-24"
      } sticky top-0 z-20 h-screen shrink-0 px-3 py-4 transition-[width] duration-300 ease-in-out md:px-4 md:py-5`}
    >
      <div
        className={`flex h-full flex-col rounded-[30px] border py-5 ${
          isLightTheme
            ? "border-slate-700/70 bg-slate-950/72 shadow-[0_18px_40px_rgba(2,6,23,0.28)] backdrop-blur-2xl"
            : "border-slate-800/80 bg-slate-950/75 backdrop-blur-2xl"
        }`}
      >
        <div
          className={`mb-8 flex items-center ${
            sidebarOpen ? "gap-3 px-4" : "justify-center px-0"
          }`}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f766e,#14b8a6_48%,#67e8f9)] text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(20,184,166,0.22)]">
            FN
          </div>
          <div
            className={`transition-all duration-200 ${
              sidebarOpen ? "max-w-[140px] opacity-100" : "max-w-0 opacity-0"
            } overflow-hidden whitespace-nowrap`}
          >
            <h1 className={`font-display text-lg font-bold tracking-tight ${isLightTheme ? "text-white" : "text-white"}`}>
              FlowNova
            </h1>
            <p className={`text-xs ${isLightTheme ? "text-slate-400" : "text-slate-400"}`}>
              Operations workspace
            </p>
          </div>
        </div>

        {sidebarOpen && (
          <div className={`mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.24em] ${isLightTheme ? "text-slate-500" : "text-slate-500"}`}>
            Workspace
          </div>
        )}

        <nav className={`space-y-1.5 ${sidebarOpen ? "px-3" : "px-2"}`}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={!sidebarOpen ? item.name : undefined}
              className={({ isActive }) =>
                `group flex items-center rounded-2xl py-3 transition-all duration-200 ${
                  sidebarOpen ? "gap-3 px-3 justify-start" : "justify-center px-0"
                } ${
                  isActive
                  ? isLightTheme
                      ? "bg-[linear-gradient(135deg,rgba(20,184,166,0.22),rgba(56,189,248,0.14))] text-white ring-1 ring-teal-300/25 shadow-[0_12px_24px_rgba(8,15,31,0.24)]"
                      : "bg-emerald-500/15 text-white ring-1 ring-emerald-400/25"
                    : isLightTheme
                    ? "text-slate-300 hover:bg-white/6 hover:text-white"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`
              }
            >
              <span
                className={`shrink-0 text-current transition-colors ${
                  sidebarOpen ? "" : "rounded-2xl border border-transparent p-2 group-hover:border-white/10"
                }`}
              >
                {getItemIcon(item.name)}
              </span>
              <span
                className={`overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-200 ${
                  sidebarOpen ? "max-w-[160px] opacity-100" : "max-w-0 opacity-0"
                }`}
              >
                {item.name}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
