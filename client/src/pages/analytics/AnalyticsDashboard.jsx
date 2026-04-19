import { useEffect, useState } from "react";

import BarChart from "../../components/charts/BarChart";
import LineChart from "../../components/charts/LineChart";
import PieChart from "../../components/charts/PieChart";
import Loader from "../../components/common/Loader";
import { fetchAnalyticsDashboard } from "../../services/analyticsService";
import { formatDateTime, formatDurationHours } from "../../utils/formatDate";

const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`;

function PerformanceTable({ title, rows = [] }) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-800/90 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.08),transparent_26%),linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.88))] p-5 shadow-[0_18px_45px_rgba(2,6,23,0.24)]">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-400">
          Ranked
        </span>
      </div>
      {!rows.length ? (
        <p className="mt-4 text-sm text-slate-400">No performance data available yet.</p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm text-slate-300">
            <thead className="bg-slate-800/70 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Total Contributions</th>
                <th className="px-4 py-3">Completed Stages</th>
                <th className="px-4 py-3">Current Active</th>
                <th className="px-4 py-3">Blocked</th>
                <th className="px-4 py-3">Completion Rate</th>
                <th className="px-4 py-3">Avg Stage Time</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.name} className="border-t border-slate-800 hover:bg-slate-800/35">
                  <td className="px-4 py-3 font-medium text-white">{row.name}</td>
                  <td className="px-4 py-3">{row.totalTasks}</td>
                  <td className="px-4 py-3 text-emerald-300">{row.completedTasks}</td>
                  <td className="px-4 py-3 text-cyan-300">{row.activeTasks}</td>
                  <td className="px-4 py-3 text-amber-300">{row.blockedTasks}</td>
                  <td className="px-4 py-3">{formatPercent(row.completionRate)}</td>
                  <td className="px-4 py-3">{formatDurationHours(row.avgCompletionHours)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await fetchAnalyticsDashboard();
        setData(result);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const summaryCards = data
    ? [
        ["Total Tasks", data.summary.totalTasks],
        ["Active Tasks", data.summary.activeTasks],
        ["Active Workflows", data.summary.activeWorkflows],
        ["Unread Alerts", data.summary.unreadNotifications],
      ]
    : [];

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-slate-800/90 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.12),transparent_26%),radial-gradient(circle_at_right,rgba(56,189,248,0.12),transparent_22%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(17,24,39,0.84))] p-6 shadow-[0_24px_60px_rgba(2,6,23,0.28)]">
        <p className="text-xs uppercase tracking-[0.22em] text-sky-200/80">Operations Signal</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Analytics Dashboard</h1>
        <p className="mt-2 text-sm text-slate-300">
          Live organizational analytics powered by backend aggregation across workflows,
          stages, teams, and employee ownership.
        </p>
      </section>

      {loading ? <Loader label="Loading analytics..." /> : null}
      {error ? (
        <div className="rounded-2xl border border-rose-400/40 bg-rose-500/15 p-4 text-rose-200">
          {error}
        </div>
      ) : null}

      {data ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map(([label, value]) => (
              <article
                key={label}
                className="rounded-[26px] border border-slate-800/90 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.08),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.95),rgba(2,6,23,0.85))] p-5 shadow-[0_14px_34px_rgba(2,6,23,0.22)]"
              >
                <p className="text-sm text-slate-400">{label}</p>
                <p className="mt-3 text-3xl font-bold text-white">{value}</p>
              </article>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <BarChart title="Task Status Mix" data={data.taskStatusData} />
            <PieChart title="Workflow Composition" data={data.workflowMixData} />
            <LineChart title="Stage Pressure" data={data.stageLoadData} />

            <section className="rounded-[28px] border border-slate-800/90 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.08),transparent_26%),linear-gradient(180deg,rgba(15,23,42,0.95),rgba(2,6,23,0.85))] p-5 shadow-[0_18px_45px_rgba(2,6,23,0.24)]">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-white">Recent Task Activity</h3>
                <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                  Latest
                </span>
              </div>
              <div className="mt-5 space-y-3">
                {data.latestTasks.map((task) => (
                  <article
                    key={task._id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 transition hover:border-sky-400/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{task.title}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          {task.stageName || "Unstaged"} - {task.status}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500">{formatDateTime(task.createdAt)}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <BarChart title="Team Contribution Load" data={data.teamLoadData} />
            <BarChart title="Employee Contribution Load" data={data.employeeLoadData} />
          </div>

          <div className="grid gap-6">
            <section className="rounded-[28px] border border-slate-800/90 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(17,24,39,0.8))] p-5 text-sm text-slate-300 shadow-[0_18px_45px_rgba(2,6,23,0.26)]">
              <p className="font-medium text-white">How these metrics are calculated</p>
              <p className="mt-2 text-slate-400">
                Team and employee analytics now count every completed workflow stage plus the
                task&apos;s current active owner, so multi-stage work is credited across all teams
                and people who actually worked on it.
              </p>
            </section>
            <PerformanceTable title="Team Performance" rows={data.teamPerformance} />
            <PerformanceTable title="Employee Performance" rows={data.employeePerformance} />
          </div>
        </>
      ) : null}
    </div>
  );
}
