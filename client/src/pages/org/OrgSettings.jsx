import { useEffect, useState } from "react";

import Loader from "../../components/common/Loader";
import { useTheme } from "../../context/ThemeContext";
import { fetchGroups } from "../../services/groupService";
import { fetchInboxNotifications } from "../../services/notificationService";
import { fetchTasks } from "../../services/taskService";
import { fetchUsers } from "../../services/userService";
import { fetchWorkflows } from "../../services/workflowService";
import useAuth from "../../hooks/useAuth";

function SettingsCard({ title, children, accent = "emerald" }) {
  const accentClass =
    accent === "amber"
      ? "from-amber-500/10 to-transparent"
      : accent === "cyan"
      ? "from-cyan-500/10 to-transparent"
      : "from-emerald-500/10 to-transparent";

  return (
    <article className={`rounded-3xl border border-slate-800 bg-gradient-to-br ${accentClass} bg-slate-900/60 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.16)]`}>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </article>
  );
}

export default function OrgSettings() {
  const { user } = useAuth();
  const { isLightTheme } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [users, groups, workflows, tasks, notifications] = await Promise.all([
          fetchUsers().catch(() => []),
          fetchGroups(),
          fetchWorkflows(true),
          fetchTasks(),
          fetchInboxNotifications({ limit: 100 }),
        ]);

        setStats({
          users: Array.isArray(users) ? users.length : 0,
          groups: Array.isArray(groups) ? groups.length : 0,
          workflows: Array.isArray(workflows) ? workflows.length : 0,
          tasks: Array.isArray(tasks) ? tasks.length : 0,
          unreadNotifications: Array.isArray(notifications)
            ? notifications.filter((item) => !item.isRead).length
            : 0,
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load organization details");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.14),transparent_28%),linear-gradient(120deg,rgba(15,23,42,0.96),rgba(15,23,42,0.82),rgba(6,78,59,0.32))] p-6 shadow-[0_14px_50px_rgba(0,0,0,0.2)]">
        <p className="text-xs uppercase tracking-[0.22em] text-emerald-300/80">Organization</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Organization Settings</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Configure the workspace tone, understand your current setup, and make the
          system easier for new users to read at a glance.
        </p>
      </section>

      {loading ? <Loader label="Loading organization details..." /> : null}
      {error ? (
        <div className="rounded-2xl border border-rose-400/40 bg-rose-500/15 p-4 text-rose-200">
          {error}
        </div>
      ) : null}

      {!loading && !error && stats ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[
              ["Org Code", user?.orgCode || "-"],
              ["Users", stats.users],
              ["Teams", stats.groups],
              ["Workflows", stats.workflows],
              ["Tasks", stats.tasks],
            ].map(([label, value]) => (
              <article
                key={label}
                className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.14)]"
              >
                <p className="text-sm text-slate-400">{label}</p>
                <p className="mt-3 text-3xl font-bold text-white">{value}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <SettingsCard title="Workspace Appearance" accent="cyan">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-sm font-medium text-white">Current Mode</p>
                <p className="mt-2 text-sm text-slate-400">
                  {isLightTheme
                    ? "The workspace now stays on the default light theme across the app."
                    : "Night theme is active across the workspace shell."}
                </p>
              </div>
            </SettingsCard>

            <SettingsCard title="Current Admin View" accent="emerald">
              <div className="space-y-3 text-sm text-slate-300">
                <p>
                  Organization code:{" "}
                  <span className="font-semibold text-white">{user?.orgCode || "-"}</span>
                </p>
                <p>
                  Signed-in user:{" "}
                  <span className="font-semibold text-white">{user?.name || "-"}</span>
                </p>
                <p>
                  Access role:{" "}
                  <span className="font-semibold capitalize text-white">{user?.role || "-"}</span>
                </p>
                <p className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-xs text-slate-400">
                  This page is intentionally written for beginners: org code identifies the
                  workspace, teams own workflow stages, and tasks move through workflows.
                </p>
              </div>
            </SettingsCard>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <SettingsCard title="Operational Notes" accent="amber">
              <ul className="space-y-3 text-sm text-slate-300">
                <li>{stats.unreadNotifications} unread notifications are waiting in the inbox.</li>
                <li>{stats.groups} teams are available for workflow stage ownership.</li>
                <li>{stats.workflows} workflows are configured across the organization.</li>
                <li>{stats.tasks} tasks are currently stored and visible in operations.</li>
              </ul>
            </SettingsCard>

            <SettingsCard title="How The System Works" accent="cyan">
              <ul className="space-y-3 text-sm text-slate-300">
                <li>Teams represent responsibility units.</li>
                <li>Workflows define ordered stages and assign each stage to a team.</li>
                <li>Tasks either follow a workflow or exist as standalone work items.</li>
                <li>Inbox notifications help users notice assignments and status movement.</li>
              </ul>
            </SettingsCard>
          </section>
        </>
      ) : null}
    </div>
  );
}
