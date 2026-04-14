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
    { name: "Org Settings", path: "/org-settings" },
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
    if (name === "Org Settings") {
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
          <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Zm8-3.5a8 8 0 0 0-.1-1l2.1-1.6-2-3.5-2.5 1a8 8 0 0 0-1.7-1l-.4-2.7H8.6l-.4 2.7a8 8 0 0 0-1.7 1l-2.5-1-2 3.5L4.1 11a8 8 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1c.5.4 1.1.7 1.7 1l.4 2.7h6.8l.4-2.7c.6-.3 1.2-.6 1.7-1l2.5 1 2-3.5-2.1-1.6c.1-.3.1-.7.1-1Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }

    return null;
  };

  return (
    <aside
      className={`${
        sidebarOpen ? "w-72" : "w-24"
      } shrink-0 h-screen sticky top-0 transition-[width] duration-300 ease-in-out border-r backdrop-blur-xl px-3 py-5 ${
        isLightTheme
          ? "bg-black border-slate-200/80"
          : "bg-slate-900/70 border-slate-800/80"
      }`}
    >
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/30 bg-blue-500/10 text-white">
          <span className="font-bold">IF</span>
        </div>
        <div
          className={`transition-all duration-200 ${
            sidebarOpen ? "max-w-[140px] opacity-100" : "max-w-0 opacity-0"
          } overflow-hidden whitespace-nowrap`}
        >
          <h1 className="text-lg font-semibold tracking-wide text-white">
            IntelliFlow
          </h1>
          <p className="text-xs text-white">Workflow System</p>
        </div>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={!sidebarOpen ? item.name : undefined}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
                isActive
                  ? "bg-white text-black ring-1 border-green-700 ring-green-600/10"
                 
                  : "text-white hover:bg-slate-100 hover:text-slate-900"
          
              }`
            }
          >
            <span className={`${isLightTheme ? "text-slate-400" : "text-slate-400"} group-hover:text-emerald-300`}>
              {getItemIcon(item.name)}
            </span>
            <span
              className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${
                sidebarOpen ? "max-w-[160px] opacity-100" : "max-w-0 opacity-0"
              }`}
            >
              {item.name}
            </span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
