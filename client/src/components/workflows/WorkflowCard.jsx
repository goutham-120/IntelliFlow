import { Link } from "react-router-dom";

const getStageGroupLabel = (groupId, groupsById) => {
  const key = typeof groupId === "string" ? groupId : groupId?._id;
  const group = key ? groupsById[key] : null;
  return group?.name || "Unknown group";
};

export default function WorkflowCard({ workflow, groupsById = {}, showDetailsLink = false }) {
  return (
    <article className="space-y-3 p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-white">{workflow.name}</h3>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            workflow.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-700 text-slate-300"
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
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-300"
            >
              {stage.order}. {stage.name} ({getStageGroupLabel(stage.groupId, groupsById)})
            </span>
          ))}
      </div>

      {showDetailsLink && (
        <div>
          <Link
            to={`/workflows/${workflow._id}`}
            className="rounded-lg border border-cyan-400/50 px-3 py-1 text-xs font-medium text-cyan-300 hover:bg-cyan-500/10"
          >
            View / Edit
          </Link>
        </div>
      )}
    </article>
  );
}
