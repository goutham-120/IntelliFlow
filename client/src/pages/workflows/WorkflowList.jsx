import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { fetchGroups } from "../../services/groupService";
import { fetchWorkflows } from "../../services/workflowService";

// ─── Design tokens ────────────────────────────────────────────────────────────
const cardClass =
  "rounded-lg border border-slate-800 bg-[#0b1724] shadow-[0_18px_44px_rgba(0,0,0,0.18)]";
const accents = ["emerald", "blue", "violet", "amber", "teal", "rose"];
const statTone = {
  amber:   "bg-amber-500/20 text-amber-300 ring-amber-400/20",
  blue:    "bg-blue-500/20 text-blue-300 ring-blue-400/20",
  emerald: "bg-emerald-500/20 text-emerald-300 ring-emerald-400/20",
  rose:    "bg-rose-500/20 text-rose-300 ring-rose-400/20",
  teal:    "bg-teal-500/20 text-teal-300 ring-teal-400/20",
  violet:  "bg-violet-500/20 text-violet-300 ring-violet-400/20",
};
const tileTone = {
  amber:   "bg-amber-500",
  blue:    "bg-blue-500",
  emerald: "bg-emerald-500",
  rose:    "bg-rose-500",
  teal:    "bg-teal-500",
  violet:  "bg-violet-500",
};

const PAGE_SIZE = 6;

// ─── Main page ────────────────────────────────────────────────────────────────
export default function WorkflowList() {
  const location  = useLocation();
  const navigate  = useNavigate();

  const [workflows,       setWorkflows]       = useState([]);
  const [groups,          setGroups]          = useState([]);
  const [selectedId,      setSelectedId]      = useState("");
  const [query,           setQuery]           = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [page,            setPage]            = useState(1);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState("");
  const [success,         setSuccess]         = useState("");

  const user    = useMemo(() => JSON.parse(localStorage.getItem("user") || "{}"), []);
  const isAdmin = user?.role === "admin";

  const groupsById = useMemo(
    () => Object.fromEntries(groups.map((g) => [g._id, g])),
    [groups]
  );

  // ── derived stats from real data ──────────────────────────────────────────
  const stats = useMemo(() => {
    const active      = workflows.filter((w) => w.isActive);
    const inactive    = workflows.filter((w) => !w.isActive);
    const totalStages = workflows.reduce((s, w) => s + (w.stages?.length || 0), 0);
    const totalTasks  = workflows.reduce((s, w) => s + (w.totalTasks  || 0), 0);

    // Weighted average cycle days across workflows that have completed tasks
    const workflowsWithCycle = workflows.filter((w) => w.avgCycleDays > 0);
    const avgCycle =
      workflowsWithCycle.length > 0
        ? (
            workflowsWithCycle.reduce((s, w) => s + w.avgCycleDays, 0) /
            workflowsWithCycle.length
          ).toFixed(1)
        : null;

    return [
      { label: "Total Workflows",    value: workflows.length,  color: "emerald" },
      { label: "Active Workflows",   value: active.length,     color: "blue"    },
      { label: "Inactive Workflows", value: inactive.length,   color: "violet"  },
      { label: "Total Stages",       value: totalStages,       color: "amber"   },
      {
        label: "Avg. Cycle Time",
        value: avgCycle ? `${avgCycle}d` : totalTasks === 0 ? "No tasks yet" : "—",
        color: "teal",
      },
    ];
  }, [workflows]);

  // ── filtered + paginated list ─────────────────────────────────────────────
  const filteredWorkflows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return workflows.filter((w) => {
      const visible = includeInactive || w.isActive;
      const text    = `${w.name} ${w.description || ""}`.toLowerCase();
      return visible && (!term || text.includes(term));
    });
  }, [includeInactive, query, workflows]);

  const totalPages     = Math.max(1, Math.ceil(filteredWorkflows.length / PAGE_SIZE));
  const pagedWorkflows = filteredWorkflows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const selectedWorkflow =
    filteredWorkflows.find((w) => w._id === selectedId) ||
    filteredWorkflows[0] ||
    null;

  // ── data loading ──────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [workflowsData, groupsData] = await Promise.all([
        fetchWorkflows(true),   // always fetch all; we filter client-side
        fetchGroups(),
      ]);
      const next = Array.isArray(workflowsData) ? workflowsData : [];
      setWorkflows(next);
      setGroups(Array.isArray(groupsData) ? groupsData : []);
      setSelectedId((cur) => cur || next[0]?._id || "");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load workflows");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // reset to page 1 whenever filter/search changes
  useEffect(() => { setPage(1); }, [query, includeInactive]);

  useEffect(() => {
    const message = location.state?.message;
    if (message) {
      setSuccess(message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  return (
    <div className="space-y-4 text-slate-200">
      {/* Header */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Workflows</h1>
          <p className="mt-2 text-sm text-slate-400">
            Create, manage and monitor your organizational workflows
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex h-11 min-w-[250px] items-center gap-3 rounded-lg border border-slate-800 bg-[#081421] px-4 text-sm text-slate-400">
            <span className="text-xs uppercase tracking-wider">Search</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search workflows..."
              className="w-full bg-transparent outline-none placeholder:text-slate-500"
            />
          </label>
          <button
            type="button"
            onClick={() => setIncludeInactive((v) => !v)}
            className={`h-11 rounded-lg border px-4 text-sm font-semibold transition ${
              includeInactive
                ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                : "border-slate-800 bg-[#081421] text-slate-300"
            }`}
          >
            {includeInactive ? "Showing All" : "Active Only"}
          </button>
          {isAdmin && (
            <Link
              to="/workflows/create"
              className="flex h-11 items-center rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(16,185,129,0.22)] transition hover:bg-emerald-500"
            >
              + Create Workflow
            </Link>
          )}
        </div>
      </header>

      {/* Alerts */}
      {(error || success) && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            error
              ? "border-rose-400/30 bg-rose-500/12 text-rose-200"
              : "border-emerald-400/30 bg-emerald-500/12 text-emerald-200"
          }`}
        >
          {error || success}
        </div>
      )}

      {/* Stat cards — all real numbers */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map(({ label, value, color }) => (
          <StatCard key={label} color={color} label={label} value={value} />
        ))}
      </section>

      {/* Main split layout */}
      <section className="grid gap-4 2xl:grid-cols-[420px_minmax(0,1fr)]">
        <WorkflowPicker
          groupsById={groupsById}
          loading={loading}
          onSelect={(id) => { setSelectedId(id); }}
          page={page}
          pageSize={PAGE_SIZE}
          selectedId={selectedWorkflow?._id}
          totalPages={totalPages}
          totalCount={filteredWorkflows.length}
          workflows={pagedWorkflows}
          onPageChange={setPage}
        />
        <WorkflowOverview
          groupsById={groupsById}
          isAdmin={isAdmin}
          workflow={selectedWorkflow}
        />
      </section>
    </div>
  );
}

// ─── Stat card (no fake delta) ────────────────────────────────────────────────
function StatCard({ color, label, value }) {
  return (
    <article className={`${cardClass} flex items-center gap-4 p-5`}>
      <div className={`flex h-14 w-14 items-center justify-center rounded-full ring-1 ${statTone[color]}`}>
        <span className={`h-7 w-7 rounded-full ${tileTone[color]}`} />
      </div>
      <div>
        <p className="text-sm text-slate-400">{label}</p>
        <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      </div>
    </article>
  );
}

// ─── Workflow picker with real pagination ─────────────────────────────────────
function WorkflowPicker({
  groupsById, loading, onSelect, page, pageSize,
  selectedId, totalPages, totalCount, workflows, onPageChange,
}) {
  return (
    <aside className={`${cardClass} overflow-hidden`}>
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <h2 className="font-semibold text-white">All Workflows</h2>
        <span className="text-xs uppercase tracking-wider text-slate-500">
          {totalCount} total
        </span>
      </div>

      {loading ? (
        <p className="p-5 text-sm text-slate-400">Loading workflows...</p>
      ) : !workflows.length ? (
        <p className="p-5 text-sm text-slate-400">No workflows found.</p>
      ) : (
        <div className="divide-y divide-slate-800">
          {workflows.map((workflow, index) => (
            <button
              key={workflow._id}
              onClick={() => onSelect(workflow._id)}
              className={`grid w-full grid-cols-1 items-center gap-3 px-5 py-4 text-left transition sm:grid-cols-[auto_1fr_auto] ${
                selectedId === workflow._id
                  ? "bg-emerald-500/10 ring-1 ring-inset ring-emerald-400/60"
                  : "hover:bg-slate-900/65"
              }`}
            >
              <IconTile index={(page - 1) * pageSize + index} className="hidden sm:!grid" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-white">{workflow.name}</p>
                  <StatusBadge active={workflow.isActive} />
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                  {workflow.description || firstGroupName(workflow, groupsById)}
                </p>
              </div>
              {/* Real task counts from the backend */}
              <div className="grid grid-cols-2 gap-4 text-center text-xs text-slate-400 sm:contents">
                <Metric value={workflow.stages?.length || 0} label="Stages" />
                <Metric value={workflow.totalTasks ?? 0}     label="Tasks"  />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Real pagination */}
      <div className="flex items-center justify-between border-t border-slate-800 px-5 py-4 text-xs text-slate-400">
        <span>
          Showing {Math.min((page - 1) * pageSize + 1, totalCount)}–
          {Math.min(page * pageSize, totalCount)} of {totalCount}
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded px-2 py-1 hover:bg-slate-800 disabled:opacity-30"
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`rounded px-2 py-1 ${
                p === page ? "text-emerald-400" : "hover:bg-slate-800"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            className="rounded px-2 py-1 hover:bg-slate-800 disabled:opacity-30"
          >
            ›
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─── Workflow overview (real data everywhere) ─────────────────────────────────
function WorkflowOverview({ groupsById, isAdmin, workflow }) {
  const stages = [...(workflow?.stages || [])].sort((a, b) => a.order - b.order);

  if (!workflow) {
    return (
      <section className={`${cardClass} flex min-h-[460px] items-center justify-center p-8 text-slate-400`}>
        Select a workflow to view its structure.
      </section>
    );
  }

  return (
    <section className={`${cardClass} overflow-hidden`}>
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-800 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <IconTile index={0} />
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white">{workflow.name}</h2>
              <StatusBadge active={workflow.isActive} />
            </div>
            <p className="mt-1 text-sm text-slate-400">
              {workflow.description || "End-to-end workflow for organizational execution"}
            </p>
          </div>
        </div>
        {isAdmin && (
          <Link
            to={`/workflows/${workflow._id}`}
            className="rounded-lg border border-slate-700 bg-[#081421] px-4 py-2 text-sm font-semibold text-white transition hover:border-emerald-400/40"
          >
            Edit Workflow
          </Link>
        )}
      </div>

      {/* Summary + Health */}
      <div className="grid grid-cols-1 gap-4 p-5 xl:grid-cols-2">
        <SummaryCard stages={stages} workflow={workflow} />
        <HealthCard workflow={workflow} />
      </div>

      {/* Stage cards */}
      <div className="mx-5 mb-5 rounded-lg border border-slate-800 bg-[#081421] p-5">
        <h3 className="mb-5 font-semibold text-white">Workflow Stages</h3>
        {!stages.length ? (
          <p className="text-sm text-slate-400">No stages defined yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            {stages.map((stage, index) => (
              <StageCard
                key={`${stage.name}-${stage.order}`}
                group={groupName(stage.groupId, groupsById)}
                index={index}
                stage={stage}
              />
            ))}
            <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 text-center text-sm text-slate-400">
              <span className="mb-3 text-xs uppercase tracking-wider">Complete</span>
              Workflow Complete
            </div>
          </div>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-400">
          <span>Total Stages: {stages.length}</span>
          <span className="hidden sm:inline">|</span>
          <span>Total Tasks: {workflow.totalTasks ?? 0}</span>
          <span className="hidden sm:inline">|</span>
          <span>Active Tasks: {workflow.activeTasks ?? 0}</span>
          {workflow.avgCycleDays > 0 && (
            <>
              <span className="hidden sm:inline">|</span>
              <span>Avg. Cycle: {workflow.avgCycleDays}d</span>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Summary card (real dates + creator) ─────────────────────────────────────
function SummaryCard({ stages, workflow }) {
  const created = workflow.createdAt
    ? new Date(workflow.createdAt).toLocaleDateString()
    : "—";
  const updated = workflow.updatedAt
    ? new Date(workflow.updatedAt).toLocaleDateString()
    : "—";
  // createdBy is populated by the backend as { name: "..." }
  const createdBy = workflow.createdBy?.name || "—";

  return (
    <div className="rounded-lg border border-slate-800 bg-[#081421] p-5">
      <h3 className="mb-4 font-semibold text-white">Workflow Summary</h3>
      <InfoRow label="Workflow ID"  value={`WF-${String(workflow._id).slice(-6).toUpperCase()}`} />
      <InfoRow label="Created By"  value={createdBy} />
      <InfoRow label="Created On"  value={created} />
      <InfoRow label="Last Updated" value={updated} />
      <InfoRow
        label="Description"
        value={
          workflow.description ||
          `${stages.length}-stage workflow with ${workflow.totalTasks ?? 0} tasks.`
        }
      />
    </div>
  );
}

// ─── Health card (real task counts) ──────────────────────────────────────────
function HealthCard({ workflow }) {
  const total      = workflow.totalTasks     || 0;
  const active     = workflow.activeTasks    || 0;
  const completed  = workflow.completedTasks || 0;
  // derive what we can; "pending review" / "overdue" aren't in the enriched data
  // so we show what we actually know and skip the rest
  const items = [
    { label: "Completed",   value: completed, color: "bg-emerald-500" },
    { label: "Active",      value: active,    color: "bg-blue-500"    },
    { label: "Not Started", value: Math.max(0, total - active - completed), color: "bg-violet-500" },
  ];

  // Proportional conic gradient from real data
  const completedPct = total > 0 ? (completed / total) * 100 : 0;
  const activePct    = total > 0 ? (active    / total) * 100 : 0;
  const conicStop1   = completedPct.toFixed(1);
  const conicStop2   = (completedPct + activePct).toFixed(1);
  const gradient =
    total > 0
      ? `conic-gradient(#10b981 0 ${conicStop1}%, #2563eb ${conicStop1}% ${conicStop2}%, #7c3aed ${conicStop2}% 100%)`
      : "conic-gradient(#1e293b 0 100%)";

  return (
    <div className="rounded-lg border border-slate-800 bg-[#081421] p-5">
      <h3 className="mb-4 font-semibold text-white">Workflow Health</h3>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div
          className="grid h-40 w-40 shrink-0 place-items-center rounded-full"
          style={{ background: gradient }}
        >
          <div className="grid h-24 w-24 place-items-center rounded-full bg-[#081421] text-center">
            <span className="text-2xl font-bold text-white">{total}</span>
            <span className="-mt-5 block text-xs text-slate-400">Total Tasks</span>
          </div>
        </div>
        <div className="grid flex-1 gap-3">
          {items.map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between gap-4 text-sm">
              <span className="flex items-center gap-3 text-slate-300">
                <span className={`h-3 w-3 rounded-full ${color}`} />
                {label}
              </span>
              <span className="text-slate-300">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Stage card (no fake avg times) ──────────────────────────────────────────
function StageCard({ group, index, stage }) {
  return (
    <article className="relative min-h-48 rounded-lg border border-slate-700 bg-[#0b1724] p-4 text-center">
      <span className="absolute -top-4 left-1/2 grid h-8 w-8 -translate-x-1/2 place-items-center rounded-full bg-emerald-500 text-sm font-bold text-white">
        {index + 1}
      </span>
      <IconTile index={index} center />
      <h4 className="mt-3 font-semibold text-white">{stage.name}</h4>
      <InfoRow label="Group"      value={group}                                       compact />
      <InfoRow label="Assignment" value={stage.assignmentType === "manual" ? "Manual" : "Auto"} compact />
      <span className="mt-3 inline-flex rounded-full bg-blue-500/12 px-3 py-1 text-xs text-blue-300">
        {stage.assignmentType === "manual" ? "Manual Review" : "Auto Assign"}
      </span>
    </article>
  );
}

// ─── Shared small components ──────────────────────────────────────────────────
function InfoRow({ compact = false, label, value }) {
  return (
    <div className={`grid grid-cols-[120px_1fr] gap-3 ${compact ? "mt-3 text-xs" : "mb-3 text-sm"}`}>
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-300">{value}</span>
    </div>
  );
}

function IconTile({ center = false, index, className = "" }) {
  const color = accents[index % accents.length];
  return (
    <span className={`${center ? "mx-auto mt-2" : ""} grid h-11 w-11 place-items-center rounded ${tileTone[color]} text-lg font-bold text-white ${className}`}>
      &lt;/&gt;
    </span>
  );
}

function Metric({ label, value }) {
  return (
    <span>
      <strong className="block text-sm text-white">{value}</strong>
      {label}
    </span>
  );
}

function StatusBadge({ active }) {
  return (
    <span className={`rounded px-2 py-0.5 text-xs ${active ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-700 text-slate-300"}`}>
      {active ? "Active" : "Draft"}
    </span>
  );
}

function groupName(groupId, groupsById) {
  const key = typeof groupId === "string" ? groupId : groupId?._id;
  return groupsById[key]?.name || "—";
}

function firstGroupName(workflow, groupsById) {
  return groupName(workflow.stages?.[0]?.groupId, groupsById);
}