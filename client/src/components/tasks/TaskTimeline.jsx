export default function TaskTimeline({ workflow, task }) {
  const timestampFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const stages = [...(workflow?.stages || [])].sort((a, b) => a.order - b.order);
  const currentStageName = String(task?.stageName || "").toLowerCase();
  const completedStageMap = new Map(
    (task?.completedStages || []).map((entry) => [
      String(entry.stageName || "").toLowerCase(),
      entry,
    ])
  );

  if (!stages.length) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-400">
        No workflow stages available.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-[linear-gradient(180deg,rgba(15,23,42,0.95),rgba(2,6,23,0.84))] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.14)]">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
        Stage Timeline
      </h3>
      <p className="mb-3 text-xs text-slate-500">
        Completed stages are green, the current stage is blue, and upcoming stages stay muted.
      </p>
      <div className="space-y-2">
        {stages.map((stage) => {
          const stageKey = stage.name.toLowerCase();
          const isCurrent = stageKey === currentStageName;
          const completedEntry = completedStageMap.get(stageKey);
          const isCompleted = Boolean(completedEntry);
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
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="font-medium">{stage.order}. </span>
                  <span>{stage.name}</span>
                </div>
                {completedEntry?.completedAt && (
                  <span className="shrink-0 text-right text-[11px] leading-5 text-slate-300/80">
                    {timestampFormatter.format(new Date(completedEntry.completedAt))}
                  </span>
                )}
              </div>
              {completedEntry?.description && (
                <p className="mt-2 text-xs leading-5 text-slate-200/85">
                  {completedEntry.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
