export default function TaskTimeline({ workflow, task }) {
  const stages = [...(workflow?.stages || [])].sort((a, b) => a.order - b.order);
  const currentStageName = String(task?.stageName || "").toLowerCase();
  const completedStages = new Set(
    (task?.completedStages || []).map((entry) => String(entry.stageName || "").toLowerCase())
  );

  if (!stages.length) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-400">
        No workflow stages available.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
        Stage Timeline
      </h3>
      <div className="space-y-2">
        {stages.map((stage) => {
          const stageKey = stage.name.toLowerCase();
          const isCurrent = stageKey === currentStageName;
          const isCompleted = completedStages.has(stageKey);
          return (
            <div
              key={`${stage.order}-${stage.name}`}
              className={`rounded-xl border px-3 py-2 text-sm ${
                isCompleted
                  ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-300"
                  : isCurrent
                  ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-300"
                  : "border-slate-700 bg-slate-950 text-slate-300"
              }`}
            >
              <span className="font-medium">{stage.order}. </span>
              <span>{stage.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
