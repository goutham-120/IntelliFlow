import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Loader from "../../components/common/Loader";
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

const TONE_CLASSES = {
  emerald: "text-emerald-400",
  cyan: "text-cyan-400",
  amber: "text-amber-400",
  rose: "text-rose-400",
};

const cardClass = "rounded-2xl border border-slate-800 bg-slate-900/80 p-5";

// ─── Shared small components ──────────────────────────────────────────────────
function StatCard({ title, value, hint, tone = "emerald" }) {
  return (
    <article className={cardClass}>
      <p className="text-sm text-slate-400">{title}</p>
      <p className={`mt-3 text-3xl font-bold ${TONE_CLASSES[tone]}`}>{value}</p>
      <p className="mt-2 text-xs text-slate-500">{hint}</p>
    </article>
  );
}

function SectionCard({ title, linkTo, linkLabel, children }) {
  return (
    <section className={cardClass}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {linkTo && (
          <Link to={linkTo} className="text-sm text-emerald-400 hover:underline">
            {linkLabel}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ children }) {
  return <p className="text-sm text-slate-400">{children}</p>;
}

function Row({ children }) {
  return <article className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">{children}</article>;
}

function Pill({ children, tone = "default" }) {
  const toneClass =
    tone === "unread"
      ? "bg-emerald-500/20 text-emerald-300"
      : tone === "read"
        ? "bg-slate-800 text-slate-400"
        : "border border-slate-700 bg-slate-950/75 text-slate-300";
  return <span className={`rounded-full px-2.5 py-1 text-xs capitalize ${toneClass}`}>{children}</span>;
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
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

        setTasks(taskResult.status === "fulfilled" && Array.isArray(taskResult.value) ? taskResult.value : []);
        setNotifications(inboxResult.status === "fulfilled" && Array.isArray(inboxResult.value) ? inboxResult.value : []);
        setMemberships(groupsResult.status === "fulfilled" && Array.isArray(groupsResult.value) ? groupsResult.value : []);

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
          stageName: entry.stageName || "Unnamed Stage",
        }))
    );

    const stageBreakdownMap = myStageEntries.reduce((acc, entry) => {
      acc.set(entry.stageName, (acc.get(entry.stageName) || 0) + 1);
      return acc;
    }, new Map());

    const stageBreakdown = Array.from(stageBreakdownMap.entries())
      .map(([stageName, count]) => ({ stageName, count }))
      .sort((a, b) => b.count - a.count || a.stageName.localeCompare(b.stageName));

    const contributedTaskIds = new Set(myStageEntries.map((entry) => toId(entry.taskId)));
    const unreadNotifications = notifications.filter((item) => !item.isRead).length;

    return {
      myActiveTasks,
      myStageEntries,
      stageBreakdown,
      unreadNotifications,
      contributedTaskCount: contributedTaskIds.size,
      recentMyTasks: [...myTasks]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 6),
    };
  }, [notifications, tasks, userId]);

  const summaryCards = useMemo(
    () => [
      { title: "My Active Tasks", value: myMetrics.myActiveTasks.length, hint: "Tasks currently requiring your action", tone: "emerald" },
      { title: "Stage Completions", value: myMetrics.myStageEntries.length, hint: "Total stage handoffs completed by you", tone: "cyan" },
      { title: "Team Memberships", value: memberships.length, hint: "Teams where you currently contribute", tone: "amber" },
      { title: "Unread Alerts", value: myMetrics.unreadNotifications, hint: "Inbox items waiting for your review", tone: "rose" },
    ],
    [memberships.length, myMetrics]
  );

  if (loading) return <Loader label="Loading your dashboard..." />;

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-400/40 bg-rose-500/15 p-4 text-sm text-rose-200">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-400/80">
              Personal Workspace
            </p>
            <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">
              Welcome back, {user?.name || "Teammate"}.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              This view is focused on your role, team memberships, stage contributions, and
              tasks you currently own.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Pill>Role: {toTitle(user?.role)}</Pill>
            <Pill>Org: {user?.orgCode || "--"}</Pill>
            <Pill>Contributed Tasks: {myMetrics.contributedTaskCount}</Pill>
          </div>
        </div>
      </section>

      {/* Stat cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </section>

      {/* My Teams + Stage Contributions */}
      <section className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="My Teams" linkTo="/teams" linkLabel="Open Teams">
          {!memberships.length ? (
            <EmptyState>You are not assigned to any teams yet.</EmptyState>
          ) : (
            <div className="space-y-3">
              {memberships.map((membership) => (
                <Row key={membership._id}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{membership.groupId?.name || "Unnamed Team"}</p>
                      <p className="text-xs text-slate-400">{membership.groupId?.code || "--"}</p>
                    </div>
                    <Pill>{toTitle(membership.roleInGroup)}</Pill>
                  </div>
                </Row>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Stage Contribution Breakdown">
          {!myMetrics.stageBreakdown.length ? (
            <EmptyState>No completed stage contributions from your account yet.</EmptyState>
          ) : (
            <div className="space-y-3">
              {myMetrics.stageBreakdown.slice(0, 6).map((entry) => (
                <Row key={entry.stageName}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white">{entry.stageName}</p>
                    <span className="text-sm font-semibold text-emerald-400">{entry.count}</span>
                  </div>
                </Row>
              ))}
            </div>
          )}
        </SectionCard>
      </section>

      {/* My Tasks */}
      <SectionCard title="My Assigned Tasks" linkTo="/tasks" linkLabel="Open Tasks">
        {!myMetrics.recentMyTasks.length ? (
          <EmptyState>You do not have assigned tasks yet.</EmptyState>
        ) : (
          <div className="space-y-3">
            {myMetrics.recentMyTasks.map((task) => (
              <Row key={task._id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-medium text-white">{task.title}</p>
                  <Pill>{toTitle(task.status)}</Pill>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Stage: {task.stageName || "Unstaged"} | Updated: {formatDateTime(task.updatedAt)}
                </p>
              </Row>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Inbox */}
      <SectionCard title="Recent Inbox Activity" linkTo="/inbox" linkLabel="Open Inbox">
        {!notifications.length ? (
          <EmptyState>No recent notifications found.</EmptyState>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Row key={notification._id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-white">{notification.message}</p>
                    <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">
                      {notification.type}
                    </p>
                  </div>
                  <Pill tone={notification.isRead ? "read" : "unread"}>
                    {notification.isRead ? "Read" : "Unread"}
                  </Pill>
                </div>
                <p className="mt-3 text-xs text-slate-500">{formatDateTime(notification.createdAt)}</p>
              </Row>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}