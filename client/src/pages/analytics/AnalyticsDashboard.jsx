import { useEffect, useState, useRef } from "react";
import Loader from "../../components/common/Loader";
import { fetchAnalyticsDashboard } from "../../services/analyticsService";
import { formatDurationHours } from "../../utils/formatDate";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatPercent = (v) => `${Number(v || 0).toFixed(1)}%`;

const STATUS_META = {
  pending:       { label: "Pending",       color: "#94a3b8" },
  in_progress:   { label: "In Progress",   color: "#38bdf8" },
  done:          { label: "Done",          color: "#34d399" },
  blocked:       { label: "Blocked",       color: "#fbbf24" },
  rejected:      { label: "Rejected",      color: "#f87171" },
  needs_changes: { label: "Needs Changes", color: "#a78bfa" },
};

const CHART_COLORS = [
  "#34d399","#38bdf8","#a78bfa","#fb923c",
  "#f472b6","#fbbf24","#60a5fa","#2dd4bf",
];

const statusLabel = (s) =>
  STATUS_META[s]?.label ||
  String(s || "Unknown").split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

const statusColor = (s) => STATUS_META[s]?.color || "#64748b";

// Short date label: "May 12" → "12" or keep as-is based on length
const shortDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const hoursToDisplayDays = (h) =>
  h === 0 ? "0" : h < 24 ? `${h.toFixed(1)}h` : `${(h / 24).toFixed(1)}d`;

// ─── KPI Stat Cards ───────────────────────────────────────────────────────────
const STAT_DEFS = [
  { key: "totalTasks",      label: "Total Tasks",      icon: "📋", bg: "bg-blue-500/20",    color: "text-blue-400"    },
  { key: "activeTasks",     label: "Active Tasks",     icon: "⚡", bg: "bg-cyan-500/20",    color: "text-cyan-400"    },
  { key: "activeWorkflows", label: "Active Workflows", icon: "🔄", bg: "bg-violet-500/20",  color: "text-violet-400"  },
  { key: "groups",          label: "Groups",           icon: "👥", bg: "bg-emerald-500/20", color: "text-emerald-400" },
  { key: "users",           label: "Users",            icon: "🙋", bg: "bg-orange-500/20",  color: "text-orange-400"  },
];

function StatCards({ summary }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {STAT_DEFS.map(({ key, label, icon, bg, color }) => (
        <div key={key} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className={`mb-3 inline-flex rounded-xl p-2.5 ${bg}`}>
            <span className={`text-xl ${color}`}>{icon}</span>
          </div>
          <p className="text-xs text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-white">{summary?.[key] ?? 0}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Canvas Line Chart ────────────────────────────────────────────────────────
function LineChart({ data, labels, color, yLabel = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.offsetWidth || 400;
    const H = canvas.offsetHeight || 200;
    canvas.width = W;
    canvas.height = H;

    const pad = { top: 20, right: 16, bottom: 32, left: 44 };
    const cW = W - pad.left - pad.right;
    const cH = H - pad.top - pad.bottom;
    const max = Math.max(...data) * 1.2 || 10;

    ctx.clearRect(0, 0, W, H);

    // Grid + Y labels
    [0, 0.25, 0.5, 0.75, 1].forEach((frac) => {
      const y = pad.top + cH * frac;
      ctx.strokeStyle = "rgba(148,163,184,0.1)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + cW, y); ctx.stroke();
      const val = max * (1 - frac);
      ctx.fillStyle = "rgba(148,163,184,0.55)";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(val < 1 ? val.toFixed(1) : Math.round(val), pad.left - 6, y + 3);
    });

    const pts = data.map((v, i) => ({
      x: data.length === 1 ? pad.left + cW / 2 : pad.left + (i / (data.length - 1)) * cW,
      y: pad.top + cH * (1 - v / max),
    }));

    // Gradient fill
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + cH);
    grad.addColorStop(0, color + "33");
    grad.addColorStop(1, color + "00");
    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, pad.top + cH);
    ctx.lineTo(pts[0].x, pad.top + cH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.stroke();

    // Dots
    pts.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // X labels — only show a subset if too many
    const step = Math.ceil(labels.length / 7);
    ctx.fillStyle = "rgba(148,163,184,0.6)";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    labels.forEach((l, i) => {
      if (i % step === 0 || i === labels.length - 1) {
        ctx.fillText(l, pts[i].x, H - 6);
      }
    });
  }, [data, labels, color]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />;
}

function ChartsRow({ tasksCreatedSeries, tasksCompletedSeries }) {
  const createdLabels  = tasksCreatedSeries.map((d) => shortDate(d.date));
  const createdData    = tasksCreatedSeries.map((d) => d.count);
  const completedLabels = tasksCompletedSeries.map((d) => shortDate(d.date));
  const cycleData      = tasksCompletedSeries.map((d) => d.avgCycleHours);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
        <h3 className="mb-1 text-sm font-semibold text-white">Tasks Created Over Time</h3>
        <p className="mb-3 text-xs text-slate-500">Daily count over the selected period</p>
        <div style={{ height: 200 }}>
          <LineChart data={createdData} labels={createdLabels} color="#34d399" />
        </div>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
        <h3 className="mb-1 text-sm font-semibold text-white">Avg. Cycle Time Over Time</h3>
        <p className="mb-3 text-xs text-slate-500">Average hours from task creation to stage completion</p>
        <div style={{ height: 200 }}>
          <LineChart data={cycleData} labels={completedLabels} color="#a78bfa" />
        </div>
      </div>
    </div>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
function DonutChart({ segments, total }) {
  const r = 50, cx = 70, cy = 70, sw = 18;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const slices = segments.map((s) => {
    const dash = (s.pct / 100) * circ;
    const cur = offset;
    offset += dash;
    return { ...s, dash, gap: circ - dash, offset: cur };
  });
  return (
    <svg width={cx * 2} height={cy * 2} viewBox={`0 0 ${cx * 2} ${cy * 2}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth={sw} />
      {slices.map((s) => (
        <circle key={s.label} cx={cx} cy={cy} r={r} fill="none"
          stroke={s.color} strokeWidth={sw}
          strokeDasharray={`${s.dash} ${s.gap}`}
          strokeDashoffset={-(s.offset - circ / 4)}
          strokeLinecap="butt"
        />
      ))}
      <text x={cx} y={cy - 4} textAnchor="middle" fill="white" fontSize={20} fontWeight="bold">{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#94a3b8" fontSize={10}>Total</text>
    </svg>
  );
}

function TasksByStatusCard({ taskStatusData }) {
  const total = taskStatusData.reduce((s, e) => s + e.value, 0);
  const segments = taskStatusData.map((e) => ({
    label: e.label,
    color: statusColor(e.label),
    pct: total > 0 ? (e.value / total) * 100 : 0,
    count: e.value,
  }));
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
      <h3 className="mb-4 text-sm font-semibold text-white">Tasks by Status</h3>
      {!segments.length ? (
        <p className="text-xs text-slate-500">No data yet.</p>
      ) : (
        <div className="flex items-center gap-4">
          <DonutChart segments={segments} total={total} />
          <div className="flex flex-col gap-2">
            {segments.map((s) => (
              <div key={s.label} className="flex items-center gap-2 text-xs">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
                <span className="text-slate-300">{statusLabel(s.label)}</span>
                <span className="ml-auto pl-3 font-semibold text-white">{s.count}</span>
                <span className="text-slate-500">({s.pct.toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TasksByWorkflowCard({ workflowMixData }) {
  const total = workflowMixData.reduce((s, e) => s + e.value, 0);
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
      <h3 className="mb-4 text-sm font-semibold text-white">Tasks by Workflow</h3>
      {!workflowMixData.length ? (
        <p className="text-xs text-slate-500">No data yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {workflowMixData.map((w, i) => {
            const pct = total > 0 ? (w.value / total) * 100 : 0;
            const color = CHART_COLORS[i % CHART_COLORS.length];
            return (
              <div key={w.label} className="grid grid-cols-[1fr_auto] items-center gap-3">
                <div>
                  <p className="mb-1 truncate text-xs text-slate-300">{w.label}</p>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
                <span className="text-xs font-semibold text-white">
                  {w.value} <span className="font-normal text-slate-500">({pct.toFixed(1)}%)</span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── NEW: Bottleneck Stages ───────────────────────────────────────────────────
const IMPACT_COLORS = {
  High:   "bg-rose-500/20 text-rose-300",
  Medium: "bg-amber-500/20 text-amber-300",
  Low:    "bg-emerald-500/20 text-emerald-300",
};

const waitImpact = (hours) => {
  const days = hours / 24;
  if (days >= 1.5) return "High";
  if (days >= 0.75) return "Medium";
  return "Low";
};

function BottleneckTable({ bottleneckStages }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Top Bottleneck Stages</h3>
        <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-widest text-slate-400">
          By Wait Time
        </span>
      </div>
      {!bottleneckStages?.length ? (
        <p className="text-xs text-slate-500">No bottleneck data yet — stages will appear once tasks start completing.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wide">
                <th className="pb-3 pr-4 font-medium">Stage</th>
                <th className="pb-3 pr-4 font-medium">Workflow</th>
                <th className="pb-3 pr-4 font-medium">Avg. Wait</th>
                <th className="pb-3 pr-4 font-medium">Tasks</th>
                <th className="pb-3 font-medium">Impact</th>
              </tr>
            </thead>
            <tbody>
              {bottleneckStages.map((row, i) => {
                const impact = waitImpact(row.avgWaitHours);
                return (
                  <tr key={`${row.stageName}-${i}`} className="border-t border-slate-800/60">
                    <td className="py-2.5 pr-4">
                      <span className="inline-flex items-center gap-1.5 text-slate-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                        {row.stageName}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-slate-400">{row.workflowName}</td>
                    <td className="py-2.5 pr-4 text-slate-300">
                      {hoursToDisplayDays(row.avgWaitHours)}
                    </td>
                    <td className="py-2.5 pr-4 text-slate-400">{row.taskCount}</td>
                    <td className="py-2.5">
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${IMPACT_COLORS[impact]}`}>
                        {impact}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Workflow Status Cards ────────────────────────────────────────────────────
function WorkflowStatusCards({ workflowStatusCards }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Workflow Task Status</h3>
          <p className="mt-1 text-xs text-slate-400">Tasks per workflow and their current status.</p>
        </div>
        <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-widest text-slate-400">
          By Workflow
        </span>
      </div>
      {!workflowStatusCards?.length ? (
        <p className="mt-4 text-xs text-slate-500">No workflow data yet.</p>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workflowStatusCards.map((workflow) => (
            <article key={String(workflow.workflowId)} className="rounded-2xl border border-slate-800 bg-slate-950/55 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-semibold text-white">{workflow.name}</h4>
                  <p className="mt-1 text-xs text-slate-400">
                    {workflow.totalTasks} {workflow.totalTasks === 1 ? "task" : "tasks"}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs ${
                  workflow.isActive
                    ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                    : "border-slate-600 bg-slate-800/70 text-slate-300"
                }`}>
                  {workflow.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-slate-800">
                {(workflow.statuses || []).filter((e) => e.count > 0).map((entry) => (
                  <span key={entry.status} className="inline-block h-full"
                    style={{
                      width: `${(entry.count / workflow.totalTasks) * 100}%`,
                      background: statusColor(entry.status),
                    }}
                  />
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {(workflow.statuses || []).filter((e) => e.count > 0).map((entry) => (
                  <div key={entry.status} className="flex items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/55 px-3 py-2">
                    <span className="flex items-center gap-1.5 min-w-0 truncate text-xs text-slate-400">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: statusColor(entry.status) }} />
                      {statusLabel(entry.status)}
                    </span>
                    <span className="text-sm font-semibold text-white">{entry.count}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Performance Table ────────────────────────────────────────────────────────
function PerformanceTable({ title, rows }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-widest text-slate-400">Ranked</span>
      </div>
      {!rows?.length ? (
        <p className="text-xs text-slate-500">No performance data yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="pb-3 pr-4 font-medium">Name</th>
                <th className="pb-3 pr-4 font-medium">Total</th>
                <th className="pb-3 pr-4 font-medium">Completed</th>
                <th className="pb-3 pr-4 font-medium">Active</th>
                <th className="pb-3 pr-4 font-medium">Blocked</th>
                <th className="pb-3 pr-4 font-medium">Completion Rate</th>
                <th className="pb-3 font-medium">Avg Stage Time</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.name} className="border-t border-slate-800/60 hover:bg-slate-800/30">
                  <td className="py-3 pr-4 font-medium text-white">{row.name}</td>
                  <td className="py-3 pr-4">{row.totalTasks}</td>
                  <td className="py-3 pr-4 text-emerald-400">{row.completedTasks}</td>
                  <td className="py-3 pr-4 text-cyan-400">{row.activeTasks}</td>
                  <td className="py-3 pr-4 text-amber-400">{row.blockedTasks}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-800">
                        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${row.completionRate}%` }} />
                      </div>
                      <span>{formatPercent(row.completionRate)}</span>
                    </div>
                  </td>
                  <td className="py-3">{formatDurationHours(row.avgCompletionHours)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        setData(await fetchAnalyticsDashboard());
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-5 p-1">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="mt-0.5 text-sm text-slate-400">
            Track performance, identify bottlenecks and gain actionable insights.
          </p>
        </div>
      </div>

      {loading && <Loader label="Loading analytics..." />}

      {error && (
        <div className="rounded-2xl border border-rose-400/40 bg-rose-500/15 p-4 text-sm text-rose-200">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-5">
          <StatCards summary={data.summary} />

          <ChartsRow
            tasksCreatedSeries={data.tasksCreatedSeries}
            tasksCompletedSeries={data.tasksCompletedSeries}
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <TasksByStatusCard taskStatusData={data.taskStatusData} />
            <TasksByWorkflowCard workflowMixData={data.workflowMixData} />
          </div>

          <BottleneckTable bottleneckStages={data.bottleneckStages} />

          <WorkflowStatusCards workflowStatusCards={data.workflowStatusCards} />

          <PerformanceTable title="Team Performance"     rows={data.teamPerformance} />
          <PerformanceTable title="Employee Performance" rows={data.employeePerformance} />
        </div>
      )}
    </div>
  );
}