import { Link } from "react-router-dom";

const getStageGroupLabel = (groupId, groupsById) => {
  const key = typeof groupId === "string" ? groupId : groupId?._id;
  const group = key ? groupsById[key] : null;
  return group?.name || "Unknown team";
};

export default function WorkflowCard({
  workflow,
  groupsById = {},
  showDetailsLink = false,
}) {
  return (
    <article className="space-y-4 p-5 transition hover:bg-slate-900/45">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{workflow.name}</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
            {(workflow.stages || []).length} stages configured
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            workflow.isActive
              ? "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/20"
              : "bg-slate-800 text-slate-300 ring-1 ring-slate-700"
          }`}
        >
          {workflow.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {(workflow.stages || [])
          .sort((a, b) => a.order - b.order)
          .map((stage) => {
            const isManual = (stage.assignmentType || "auto") === "manual";
            return (
            <div
              key={`${workflow._id}-${stage.order}`}
              className="rounded-lg border border-slate-700/80 bg-slate-900/70 p-3 text-sm text-slate-300"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-cyan-400/25 bg-cyan-500/10 text-xs font-bold text-cyan-200">
                  {stage.order}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{stage.name}</p>
                  <p className="mt-1 truncate text-xs text-slate-400">
                    {getStageGroupLabel(stage.groupId, groupsById)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded px-2 py-0.5 text-xs ${
                    isManual ? "bg-amber-500/12 text-amber-200" : "bg-emerald-500/12 text-emerald-200"
                  }`}
                >
                  {isManual ? "Manual" : "Auto"}
                </span>
              </div>
            </div>
          );
          })}
      </div>

      {showDetailsLink && (
        <div>
          <Link
            to={`/workflows/${workflow._id}`}
            className="rounded-xl border border-sky-400/20 bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-200 transition hover:bg-sky-500/16"
          >
            View / Edit
          </Link>
        </div>
      )}
    </article>
  );
}
