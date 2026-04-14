import { Link } from "react-router-dom";

const getStageGroupLabel = (groupId, groupsById) => {
  const key = typeof groupId === "string" ? groupId : groupId?._id;
  const group = key ? groupsById[key] : null;
  return group?.name || "Unknown team";
};

export default function WorkflowCard({ workflow, groupsById = {}, showDetailsLink = false }) {
  return (
    <article className="space-y-4 p-5 transition hover:bg-[#fbfbfa]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{workflow.name}</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
            {(workflow.stages || []).length} stages configured
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            workflow.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
          }`}
        >
          {workflow.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {(workflow.stages || [])
          .sort((a, b) => a.order - b.order)
          .map((stage) => (
            <span
              key={`${workflow._id}-${stage.order}`}
              className="rounded-xl border border-[#e8e8e4] bg-[#fbfbfa] px-3 py-2 text-sm text-slate-700"
            >
              <span className="font-medium text-slate-900">{stage.order}. {stage.name}</span>
              <span className="ml-1 text-slate-400">
                • {getStageGroupLabel(stage.groupId, groupsById)}
              </span>
            </span>
          ))}
      </div>

      {showDetailsLink && (
        <div>
          <Link
            to={`/workflows/${workflow._id}`}
            className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700 hover:bg-cyan-100"
          >
            View / Edit
          </Link>
        </div>
      )}
    </article>
  );
}
