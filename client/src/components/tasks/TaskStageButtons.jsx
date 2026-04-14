export default function TaskStageButtons({ task, canCompleteStage, completingStage, onComplete }) {
  const isWorkflowTask = Boolean(task?.workflowId?._id || task?.workflowId);
  const isDone = task?.status === "done";

  if (!isWorkflowTask) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-400">
        Stage actions are available only for workflow-driven tasks.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-[linear-gradient(180deg,rgba(15,23,42,0.95),rgba(2,6,23,0.84))] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.14)]">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-300">
        Stage Action
      </h3>
      <p className="mb-3 text-sm text-slate-400">
        Current stage: <span className="text-slate-200">{task.stageName || "Unknown"}</span>
      </p>
      <button
        type="button"
        onClick={onComplete}
        disabled={completingStage || !canCompleteStage || isDone}
        className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isDone ? "Task Completed" : completingStage ? "Completing..." : "Mark Stage Complete"}
      </button>
      {!canCompleteStage && !isDone && (
        <p className="mt-2 text-xs text-slate-500">
          Only the user assigned to this current stage can complete it.
        </p>
      )}
    </div>
  );
}
