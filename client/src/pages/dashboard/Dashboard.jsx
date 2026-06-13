import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Loader from "../../components/common/Loader";
import { useTheme } from "../../context/ThemeContext";
import useAuth from "../../hooks/useAuth";
import { fetchUserGroups } from "../../services/groupService";
import { fetchInboxNotifications } from "../../services/notificationService";
import { fetchTasks } from "../../services/taskService";
import { formatDateTime } from "../../utils/formatDate";

const ACTIVE_STATUSES = new Set(["pending", "in_progress", "blocked", "needs_changes"]);

const toId = (value) => String(value || "");

const toTitle = (value) =>
  String(value || "")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

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

export default function Dashboard() {
  const { user } = useAuth();
  const { isLightTheme } = useTheme();
  const userId = user?.id || user?._id || "";
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const [taskResult, inboxResult, groupsResult] = await Promise.allSettled([
          fetchTasks({ onlyMine: true }),
          fetchInboxNotifications({ limit: 6 }),
          fetchUserGroups(userId),
        ]);

        if (taskResult.status === "fulfilled") {
          setTasks(Array.isArray(taskResult.value) ? taskResult.value : []);
        } else {
          setTasks([]);
        }

        if (inboxResult.status === "fulfilled") {
          setNotifications(Array.isArray(inboxResult.value) ? inboxResult.value : []);
        } else {
          setNotifications([]);
        }

        if (groupsResult.status === "fulfilled") {
          setMemberships(Array.isArray(groupsResult.value) ? groupsResult.value : []);
        } else {
          setMemberships([]);
        }

        if (taskResult.status === "rejected" && inboxResult.status === "rejected") {
          const fallbackError = taskResult.reason || inboxResult.reason;
          setError(fallbackError?.response?.data?.message || "Unable to fetch live data right now");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [userId]);

  const myMetrics = useMemo(() => {
    const myUserId = toId(userId);
    const myTasks = tasks.filter((task) => toId(task.assignedTo?._id || task.assignedTo) === myUserId);
    const myActiveTasks = myTasks.filter((task) => ACTIVE_STATUSES.has(task.status));

    const myStageEntries = tasks.flatMap((task) =>
      (task.completedStages || [])
        .filter((entry) => toId(entry.completedBy?._id || entry.completedBy) === myUserId)
        .map((entry) => ({
          taskId: task._id,
          taskTitle: task.title,
          stageName: entry.stageName || "Unnamed Stage",
          completedAt: entry.completedAt,
        }))
    );

    const stageBreakdownMap = myStageEntries.reduce((acc, entry) => {
      const key = entry.stageName;
      acc.set(key, (acc.get(key) || 0) + 1);
      return acc;
    }, new Map());

    const stageBreakdown = Array.from(stageBreakdownMap.entries())
      .map(([stageName, count]) => ({ stageName, count }))
      .sort((a, b) => b.count - a.count || a.stageName.localeCompare(b.stageName));

    const contributedTaskIds = new Set(myStageEntries.map((entry) => toId(entry.taskId)));
    const unreadNotifications = notifications.filter((item) => !item.isRead).length;

    return {
      myTasks,
      myActiveTasks,
      myStageEntries,
      stageBreakdown,
      unreadNotifications,
      contributedTaskCount: contributedTaskIds.size,
      recentMyTasks: [...myTasks].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 6),
    };
  }, [notifications, tasks, userId]);

  const summaryCards = useMemo(
    () => [
      {
        title: "My Active Tasks",
        value: myMetrics.myActiveTasks.length,
        hint: "Tasks currently requiring your action",
        tone: "emerald",
      },
      {
        title: "Stage Completions",
        value: myMetrics.myStageEntries.length,
        hint: "Total stage handoffs completed by you",
        tone: "cyan",
      },
      {
        title: "Team Memberships",
        value: memberships.length,
        hint: "Teams where you currently contribute",
        tone: "amber",
      },
      {
        title: "Unread Alerts",
        value: myMetrics.unreadNotifications,
        hint: "Inbox items waiting for your review",
        tone: "rose",
      },
    ],
    [memberships.length, myMetrics]
  );

  if (loading) {
    return <Loader label="Loading your dashboard..." />;
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
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-[0.28em] ${isLightTheme ? "text-teal-200/90" : "text-emerald-300/80"}`}>
              Personal Workspace
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold text-white md:text-5xl">
              Welcome back, {user?.name || "Teammate"}.
            </h1>
            <p className={`mt-4 max-w-2xl text-sm leading-7 ${isLightTheme ? "text-slate-300" : "text-slate-400"}`}>
              This view is focused on your role, team memberships, stage contributions, and
              tasks you currently own.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-slate-700 bg-slate-950/65 px-3 py-1 text-xs uppercase tracking-wide text-slate-300">
              Role: {toTitle(user?.role)}
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-950/65 px-3 py-1 text-xs uppercase tracking-wide text-slate-300">
              Org: {user?.orgCode || "--"}
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-950/65 px-3 py-1 text-xs uppercase tracking-wide text-slate-300">
              Contributed Tasks: {myMetrics.contributedTaskCount}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <StatCard key={card.title} {...card} isLightTheme={isLightTheme} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div
          className={`rounded-[28px] border p-5 ${
            isLightTheme
              ? "border-slate-700/80 bg-slate-950/72 shadow-[0_18px_45px_rgba(2,6,23,0.24)] backdrop-blur-xl"
              : "border-slate-800 bg-[linear-gradient(180deg,rgba(15,23,42,0.95),rgba(2,6,23,0.85))] shadow-[0_10px_30px_rgba(0,0,0,0.16)]"
          }`}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">My Teams</h2>
            <Link to="/teams" className={`text-sm ${isLightTheme ? "text-teal-300" : "text-emerald-300"} hover:underline`}>
              Open Teams
            </Link>
          </div>
          {!memberships.length ? (
            <p className={`text-sm ${isLightTheme ? "text-slate-300" : "text-slate-400"}`}>
              You are not assigned to any teams yet.
            </p>
          ) : (
            <div className="space-y-3">
              {memberships.map((membership) => (
                <article
                  key={membership._id}
                  className={`rounded-2xl border px-4 py-3 ${
                    isLightTheme
                      ? "border-slate-700/80 bg-slate-900/72"
                      : "border-slate-800 bg-slate-950/70"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{membership.groupId?.name || "Unnamed Team"}</p>
                      <p className={`text-xs ${isLightTheme ? "text-slate-300" : "text-slate-400"}`}>
                        {membership.groupId?.code || "--"}
                      </p>
                    </div>
                    <span className="rounded-full border border-slate-700 bg-slate-950/75 px-2.5 py-1 text-xs capitalize text-slate-300">
                      {toTitle(membership.roleInGroup)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div
          className={`rounded-[28px] border p-5 ${
            isLightTheme
              ? "border-slate-700/80 bg-slate-950/72 shadow-[0_18px_45px_rgba(2,6,23,0.24)] backdrop-blur-xl"
              : "border-slate-800 bg-[linear-gradient(180deg,rgba(15,23,42,0.95),rgba(2,6,23,0.85))] shadow-[0_10px_30px_rgba(0,0,0,0.16)]"
          }`}
        >
          <h2 className="text-lg font-semibold text-white">Stage Contribution Breakdown</h2>
          {!myMetrics.stageBreakdown.length ? (
            <p className={`mt-4 text-sm ${isLightTheme ? "text-slate-300" : "text-slate-400"}`}>
              No completed stage contributions from your account yet.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {myMetrics.stageBreakdown.slice(0, 6).map((entry) => (
                <div
                  key={entry.stageName}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${
                    isLightTheme
                      ? "border-slate-700/80 bg-slate-900/72"
                      : "border-slate-800 bg-slate-950/70"
                  }`}
                >
                  <p className="text-sm text-white">{entry.stageName}</p>
                  <span className={`text-sm font-semibold ${isLightTheme ? "text-teal-300" : "text-emerald-300"}`}>
                    {entry.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section
        className={`rounded-[28px] border p-5 ${
          isLightTheme
            ? "border-slate-700/80 bg-slate-950/72 shadow-[0_18px_45px_rgba(2,6,23,0.24)] backdrop-blur-xl"
            : "border-slate-800 bg-[linear-gradient(180deg,rgba(15,23,42,0.95),rgba(2,6,23,0.85))] shadow-[0_10px_30px_rgba(0,0,0,0.16)]"
        }`}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">My Assigned Tasks</h2>
          <Link to="/tasks" className={`text-sm ${isLightTheme ? "text-teal-300" : "text-emerald-300"} hover:underline`}>
            Open Tasks
          </Link>
        </div>
        {!myMetrics.recentMyTasks.length ? (
          <p className={`text-sm ${isLightTheme ? "text-slate-300" : "text-slate-400"}`}>
            You do not have assigned tasks yet.
          </p>
        ) : (
          <div className="space-y-3">
            {myMetrics.recentMyTasks.map((task) => (
              <article
                key={task._id}
                className={`rounded-2xl border p-4 ${
                  isLightTheme
                    ? "border-slate-700/80 bg-slate-900/72"
                    : "border-slate-800 bg-slate-950/70"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-medium text-white">{task.title}</p>
                  <span className="rounded-full border border-slate-700 bg-slate-950/75 px-2.5 py-1 text-xs text-slate-300">
                    {toTitle(task.status)}
                  </span>
                </div>
                <p className={`mt-2 text-xs ${isLightTheme ? "text-slate-300" : "text-slate-400"}`}>
                  Stage: {task.stageName || "Unstaged"} | Updated: {formatDateTime(task.updatedAt)}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section
        className={`rounded-[28px] border p-5 ${
          isLightTheme
            ? "border-slate-700/80 bg-slate-950/72 shadow-[0_18px_45px_rgba(2,6,23,0.24)] backdrop-blur-xl"
            : "border-slate-800 bg-[linear-gradient(180deg,rgba(15,23,42,0.95),rgba(2,6,23,0.85))] shadow-[0_10px_30px_rgba(0,0,0,0.16)]"
        }`}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Recent Inbox Activity</h2>
          <Link to="/inbox" className={`text-sm ${isLightTheme ? "text-teal-300" : "text-emerald-300"} hover:underline`}>
            Open Inbox
          </Link>
        </div>
        {!notifications.length ? (
          <p className={`text-sm ${isLightTheme ? "text-slate-300" : "text-slate-400"}`}>
            No recent notifications found.
          </p>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <article
                key={notification._id}
                className={`rounded-2xl border p-4 ${
                  isLightTheme
                    ? "border-slate-700/80 bg-slate-900/72"
                    : "border-slate-800 bg-slate-950/70"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-white">{notification.message}</p>
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
      </section>
    </div>
  );
}