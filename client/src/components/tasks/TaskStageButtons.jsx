export default function TaskStageButtons({
  task,
  canCompleteStage,
  completingStage,
  rejectingStage = false,
  onComplete,
  onReject,
  previousStage,
  nextStage,
  preferredUserId = "",
  nextStageMembers = [],
  onPreferredUserChange,
  stageDescription = "",
  onStageDescriptionChange,
}) {
  const isWorkflowTask = Boolean(task?.workflowId?._id || task?.workflowId);
  const isDone = task?.status === "done";
  const needsManualSelection = (nextStage?.assignmentType || "auto") === "manual";
  const canRejectStage = canCompleteStage && !isDone && Boolean(previousStage);
  const isBusy = completingStage || rejectingStage;

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
      {nextStage && (
        <p className="mb-3 text-xs text-slate-500">
          Next stage: {nextStage.name} -{" "}
          {needsManualSelection ? "manual assignee selection" : "automatic workload assignment"}
        </p>
      )}
      {previousStage && (
        <p className="mb-3 text-xs text-slate-500">
          Reject returns to: {previousStage.name}
        </p>
      )}
      {needsManualSelection && (
        <label className="mb-3 block space-y-1">
          <span className="text-xs uppercase tracking-wide text-slate-400">Next Assignee</span>
          <select
            value={preferredUserId}
            onChange={(event) => onPreferredUserChange?.(event.target.value)}
            disabled={isBusy || !canCompleteStage || isDone}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Auto assign if left empty</option>
            {nextStageMembers.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name} ({member.email})
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="mb-3 block space-y-1">
        <span className="text-xs uppercase tracking-wide text-slate-400">Stage Notes</span>
        <textarea
          value={stageDescription}
          onChange={(event) => onStageDescriptionChange?.(event.target.value)}
          rows={4}
          disabled={isBusy || !canCompleteStage || isDone}
          placeholder="Add completion notes or rejection feedback"
          className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </label>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onComplete}
          disabled={isBusy || !canCompleteStage || isDone}
          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDone ? "Task Completed" : completingStage ? "Completing..." : "Mark Stage Complete"}
        </button>
        <button
          type="button"
          onClick={onReject}
          disabled={isBusy || !canRejectStage}
          className="rounded-xl border border-rose-400/40 bg-rose-500/12 px-4 py-2 text-sm font-semibold text-rose-100 shadow-lg shadow-rose-500/10 hover:bg-rose-500/18 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {rejectingStage ? "Rejecting..." : "Mark Stage Rejected"}
        </button>
      </div>
      {!canCompleteStage && !isDone && (
        <p className="mt-2 text-xs text-slate-500">
          Only the user assigned to this current stage can complete or reject it.
        </p>
      )}
      {canCompleteStage && !previousStage && !isDone && (
        <p className="mt-2 text-xs text-slate-500">
          This is the first workflow stage, so it cannot be rejected backward.
        </p>
      )}
    </div>
  );
}
