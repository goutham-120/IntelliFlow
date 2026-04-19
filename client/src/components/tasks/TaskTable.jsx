import { Link } from "react-router-dom";
import { TASK_STATUS_OPTIONS } from "../../utils/constants";

export default function TaskTable({
  tasks = [],
  loading = false,
  updatingTaskId = "",
  onQuickStatusUpdate,
}) {
  if (loading) {
    return <div className="p-6 text-slate-400">Loading tasks...</div>;
  }

  if (!tasks.length) {
    return <div className="p-6 text-slate-400">No tasks found.</div>;
  }

  return (
    <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
      {tasks.map((task) => (
        <div
          key={task._id}
          className="space-y-3 rounded-[24px] border border-slate-800/90 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.08),transparent_28%),linear-gradient(180deg,rgba(2,6,23,0.94),rgba(15,23,42,0.84))] p-4 shadow-[0_14px_32px_rgba(2,6,23,0.22)] transition hover:border-emerald-400/30"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-white">{task.title}</h3>
            <div className="flex items-center gap-2">
              <select
                value={task.status}
                onChange={(event) => onQuickStatusUpdate(task._id, event.target.value)}
                disabled={updatingTaskId === task._id}
                className="rounded-xl border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs uppercase text-slate-300 disabled:opacity-60"
              >
                {TASK_STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.value}
                  </option>
                ))}
              </select>
              <Link
                to={`/tasks/${task._id}`}
                className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-200 transition hover:bg-emerald-500/16"
              >
                View / Edit
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-300">
            <span className="rounded-xl border border-slate-700 bg-slate-900/70 px-2.5 py-1">
              Workflow: {task.workflowId?.name || "None"}
            </span>
            <span className="rounded-xl border border-slate-700 bg-slate-900/70 px-2.5 py-1">
              Stage: {task.stageName || "None"}
            </span>
            <span className="rounded-xl border border-slate-700 bg-slate-900/70 px-2.5 py-1">
              Team: {task.assignedGroupId?.name || "None"}
            </span>
            <span className="rounded-xl border border-slate-700 bg-slate-900/70 px-2.5 py-1">
              Assignee: {task.assignedTo?.name || "Unassigned"}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Open the task to edit workflow mode, assignments, stage progression, or deletion.
          </p>
        </div>
      ))}
    </div>
  );
}
