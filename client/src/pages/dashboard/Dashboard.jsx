import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import BarChart from "../../components/charts/BarChart";
import Loader from "../../components/common/Loader";
import { useTheme } from "../../context/ThemeContext";
import { fetchAnalyticsDashboard } from "../../services/analyticsService";
import { fetchInboxNotifications } from "../../services/notificationService";
import { formatDateTime } from "../../utils/formatDate";

function StatCard({ title, value, hint, tone = "emerald", isLightTheme }) {
  const toneClass = isLightTheme
    ? tone === "cyan"
      ? "text-sky-300"
      : tone === "amber"
      ? "text-amber-300"
      : tone === "rose"
      ? "text-fuchsia-300"
      : "text-teal-300"
    : tone === "cyan"
    ? "text-cyan-300"
    : tone === "amber"
    ? "text-amber-300"
    : tone === "rose"
    ? "text-rose-300"
    : "text-emerald-300";

  return (
    <article
      className={`rounded-[28px] border p-6 ${
        isLightTheme
          ? "border-slate-700/80 bg-slate-950/72 shadow-[0_18px_45px_rgba(2,6,23,0.24)] backdrop-blur-xl"
          : "border-slate-800 bg-slate-900/60"
      }`}
    >
      <p className={`text-sm font-medium ${isLightTheme ? "text-slate-300" : "text-slate-400"}`}>{title}</p>
      <p className={`mt-4 text-3xl font-extrabold ${toneClass}`}>{value}</p>
      <p className={`mt-2 text-xs ${isLightTheme ? "text-slate-400" : "text-slate-500"}`}>{hint}</p>
    </article>
  );
}

function QuickLink({ to, title, description, isLightTheme }) {
  return (
    <Link
      to={to}
      className={`rounded-3xl border p-4 transition ${
        isLightTheme
          ? "border-slate-700/70 bg-slate-900/78 hover:border-teal-300/25 hover:bg-slate-900"
          : "border-slate-800 bg-slate-900/60 hover:border-emerald-400/40 hover:bg-slate-900"
      }`}
    >
      <p className={`font-semibold ${isLightTheme ? "text-white" : "text-white"}`}>{title}</p>
      <p className={`mt-2 text-sm ${isLightTheme ? "text-slate-300" : "text-slate-400"}`}>{description}</p>
    </Link>
  );
}

export default function Dashboard() {
  const { isLightTheme } = useTheme();
  const [analytics, setAnalytics] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");
      try {
        const [analyticsData, inboxData] = await Promise.all([
          fetchAnalyticsDashboard(),
          fetchInboxNotifications({ limit: 6 }),
        ]);

        setAnalytics(analyticsData);
        setNotifications(Array.isArray(inboxData) ? inboxData : []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const summaryCards = useMemo(() => {
    if (!analytics) return [];

    const breachedTasks = analytics.teamPerformance.reduce(
      (sum, team) => sum + Number(team.blockedTasks || 0),
      0
    );
    const avgCompletion =
      analytics.employeePerformance.length > 0
        ? (
            analytics.employeePerformance.reduce(
              (sum, employee) => sum + Number(employee.avgCompletionHours || 0),
              0
            ) / analytics.employeePerformance.length
          ).toFixed(1)
        : "0.0";

    return [
      {
        title: "Active Tasks",
        value: analytics.summary.activeTasks,
        hint: "Currently in pending, in-progress, or blocked states",
        tone: "emerald",
      },
      {
        title: "Unread Alerts",
        value: analytics.summary.unreadNotifications,
        hint: "Inbox items that still need attention",
        tone: "cyan",
      },
      {
        title: "Blocked Work",
        value: breachedTasks,
        hint: "Tasks contributing to delivery friction",
        tone: "amber",
      },
      {
        title: "Avg Completion",
        value: `${avgCompletion}h`,
        hint: "Average completed-task turnaround across employees",
        tone: "rose",
      },
    ];
  }, [analytics]);

  if (loading) {
    return <Loader label="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div
        className={`rounded-2xl border p-4 ${
          isLightTheme
            ? "border-rose-200 bg-rose-50 text-rose-700"
            : "border-rose-400/40 bg-rose-500/15 text-rose-200"
        }`}
      >
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section
        className={`overflow-hidden rounded-[34px] border p-7 ${
          isLightTheme
            ? "border-slate-700/80 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.16),transparent_28%),radial-gradient(circle_at_right,rgba(56,189,248,0.12),transparent_24%),linear-gradient(135deg,rgba(15,23,42,0.95),rgba(17,24,39,0.82))] shadow-[0_24px_60px_rgba(2,6,23,0.28)] backdrop-blur-2xl"
            : "border-slate-800 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.16),transparent_30%),linear-gradient(120deg,rgba(15,23,42,0.96),rgba(15,23,42,0.82),rgba(8,47,73,0.45))] shadow-[0_14px_50px_rgba(0,0,0,0.22)]"
        }`}
      >
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-[0.28em] ${isLightTheme ? "text-teal-200/90" : "text-emerald-300/80"}`}>
              Operations Overview
            </p>
            <h1
              className={`mt-3 font-display text-4xl font-bold md:text-5xl ${
                isLightTheme ? "text-white" : "text-white"
              }`}
            >
              Professional visibility for every moving part.
            </h1>
            <p className={`mt-4 max-w-2xl text-sm leading-7 ${isLightTheme ? "text-slate-300" : "text-slate-400"}`}>
              Track workload, inbox pressure, and delivery momentum from a single surface built
              for quick decisions and cleaner daily operations.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div
              className={`rounded-3xl border px-4 py-4 ${
                isLightTheme
                  ? "border-slate-700/80 bg-slate-950/54"
                  : "border-slate-700/80 bg-slate-900/70"
              }`}
            >
              <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${isLightTheme ? "text-slate-400" : "text-slate-500"}`}>
                Live Status
              </p>
              <p className={`mt-2 text-sm font-semibold ${isLightTheme ? "text-white" : "text-white"}`}>
                Monitoring team throughput and alerts
              </p>
            </div>
            <div
              className={`rounded-3xl border px-4 py-4 ${
                isLightTheme
                  ? "border-slate-700/80 bg-slate-950/54"
                  : "border-slate-700/80 bg-slate-900/70"
              }`}
            >
              <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${isLightTheme ? "text-slate-400" : "text-slate-500"}`}>
                Focus
              </p>
              <p className={`mt-2 text-sm font-semibold ${isLightTheme ? "text-white" : "text-white"}`}>
                Prioritize blockers before they become delays
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <StatCard key={card.title} {...card} isLightTheme={isLightTheme} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <BarChart title="Task Status Snapshot" data={analytics?.taskStatusData || []} />
        <BarChart title="Team Workload Snapshot" data={analytics?.teamLoadData || []} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div
          className={`rounded-[28px] border p-5 ${
            isLightTheme
              ? "border-slate-700/80 bg-slate-950/72 shadow-[0_18px_45px_rgba(2,6,23,0.24)] backdrop-blur-xl"
              : "border-slate-800 bg-[linear-gradient(180deg,rgba(15,23,42,0.95),rgba(2,6,23,0.85))] shadow-[0_10px_30px_rgba(0,0,0,0.16)]"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className={`text-lg font-semibold ${isLightTheme ? "text-white" : "text-white"}`}>
              Recent Inbox Activity
            </h2>
            <Link
              to="/inbox"
              className={`text-sm ${isLightTheme ? "text-teal-300" : "text-emerald-300"} hover:underline`}
            >
              Open Inbox
            </Link>
          </div>

          {!notifications.length ? (
            <p className={`mt-4 text-sm ${isLightTheme ? "text-slate-300" : "text-slate-400"}`}>
              No recent notifications found.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {notifications.map((notification) => (
                <article
                  key={notification._id}
                  className={`rounded-3xl border p-4 transition ${
                    isLightTheme
                      ? "border-slate-700/80 bg-slate-900/72 hover:border-teal-300/25"
                      : "border-slate-800 bg-slate-950/70 hover:border-emerald-400/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`text-sm ${isLightTheme ? "text-white" : "text-white"}`}>
                        {notification.message}
                      </p>
                      <p className={`mt-2 text-xs uppercase tracking-wide ${isLightTheme ? "text-slate-400" : "text-slate-500"}`}>
                        {notification.type}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] ${
                        notification.isRead
                          ? isLightTheme
                            ? "bg-slate-800 text-slate-300"
                            : "bg-slate-800 text-slate-400"
                          : isLightTheme
                          ? "bg-teal-400/16 text-teal-200"
                          : "bg-emerald-500/20 text-emerald-200"
                      }`}
                    >
                      {notification.isRead ? "Read" : "Unread"}
                    </span>
                  </div>
                  <p className={`mt-3 text-xs ${isLightTheme ? "text-slate-400" : "text-slate-500"}`}>
                    {formatDateTime(notification.createdAt)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div
            className={`rounded-[28px] border p-5 ${
              isLightTheme
                ? "border-slate-700/80 bg-slate-950/72 shadow-[0_18px_45px_rgba(2,6,23,0.24)] backdrop-blur-xl"
                : "border-slate-800 bg-[linear-gradient(180deg,rgba(15,23,42,0.95),rgba(2,6,23,0.85))] shadow-[0_10px_30px_rgba(0,0,0,0.16)]"
            }`}
          >
            <h2 className={`text-lg font-semibold ${isLightTheme ? "text-white" : "text-white"}`}>
              Quick Access
            </h2>
            <div className="mt-4 grid gap-3">
              <QuickLink
                to="/analytics"
                title="Deep Analytics"
                description="Open team and employee performance analytics."
                isLightTheme={isLightTheme}
              />
              <QuickLink
                to="/tasks"
                title="Task Operations"
                description="Review current tasks, ownership, and stages."
                isLightTheme={isLightTheme}
              />
              <QuickLink
                to="/workflows"
                title="Workflow Monitor"
                description="Check stage design and workflow distribution."
                isLightTheme={isLightTheme}
              />
            </div>
          </div>

          <div
            className={`rounded-[28px] border p-5 ${
              isLightTheme
                ? "border-slate-700/80 bg-slate-950/72 shadow-[0_18px_45px_rgba(2,6,23,0.24)] backdrop-blur-xl"
                : "border-slate-800 bg-[linear-gradient(180deg,rgba(15,23,42,0.95),rgba(2,6,23,0.85))] shadow-[0_10px_30px_rgba(0,0,0,0.16)]"
            }`}
          >
            <h2 className={`text-lg font-semibold ${isLightTheme ? "text-white" : "text-white"}`}>
              Team Leaders
            </h2>
            <div className="mt-4 space-y-3">
              {(analytics?.teamPerformance || []).slice(0, 4).map((team) => (
                <div
                  key={team.name}
                  className={`flex items-center justify-between rounded-3xl border px-4 py-3 ${
                    isLightTheme
                      ? "border-slate-700/80 bg-slate-900/72"
                      : "border-slate-800 bg-slate-950/70"
                  }`}
                >
                  <div>
                    <p className={`font-medium ${isLightTheme ? "text-white" : "text-white"}`}>
                      {team.name}
                    </p>
                    <p className={`text-xs ${isLightTheme ? "text-slate-300" : "text-slate-400"}`}>
                      {team.completedTasks}/{team.totalTasks} completed
                    </p>
                  </div>
                  <p className={`text-sm font-semibold ${isLightTheme ? "text-teal-300" : "text-emerald-300"}`}>
                    {team.completionRate.toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
