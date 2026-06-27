import { Link } from "react-router-dom";
import { TASK_STATUS_OPTIONS } from "../../utils/constants";

export default function TaskTable({ tasks=[], loading=false, updatingTaskId="", onQuickStatusUpdate, canEditTasks=false }) {
  if (loading) return <div className="p-6 text-sm text-slate-400">Loading tasks...</div>;
  if (!tasks.length) return <div className="p-6 text-sm text-slate-400">No tasks found.</div>;

  return (
    <div className="grid gap-3 p-3 sm:gap-4 sm:p-4 md:grid-cols-2 xl:grid-cols-3">
      {tasks.map((task) => (
        <div
          key={task._id}
          className="space-y-3 rounded-[20px] border border-slate-800/90 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.08),transparent_28%),linear-gradient(180deg,rgba(2,6,23,0.94),rgba(15,23,42,0.84))] p-3 shadow-[0_14px_32px_rgba(2,6,23,0.22)] transition hover:border-emerald-400/30 sm:rounded-[24px] sm:p-4"
        >
          {/* Title + actions row */}
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-white sm:text-base">{task.title}</h3>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {canEditTasks ? (
                <select
                  value={task.status}
                  onChange={(e) => onQuickStatusUpdate(task._id, e.target.value)}
                  disabled={updatingTaskId === task._id}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs uppercase text-slate-300 disabled:opacity-60 sm:rounded-xl sm:px-2.5 sm:py-1.5"
                >
                  {TASK_STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.value}</option>
                  ))}
                </select>
              ) : (
                <span className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs uppercase text-slate-300 sm:rounded-xl sm:px-2.5 sm:py-1.5">
                  {task.status}
                </span>
              )}
              <Link
                to={`/tasks/${task._id}`}
                className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-200 transition hover:bg-emerald-500/16 sm:rounded-xl sm:px-3 sm:py-1.5"
              >
                {canEditTasks ? "Edit" : "View"}
              </Link>
            </div>
          </div>

          {/* Meta tags */}
          <div className="flex flex-wrap gap-1.5 text-xs text-slate-300 sm:gap-2">
            {[
              `Workflow: ${task.workflowId?.name || "None"}`,
              `Stage: ${task.stageName || "None"}`,
              `Team: ${task.assignedGroupId?.name || "None"}`,
              `Assignee: ${task.assignedTo?.name || "Unassigned"}`,
            ].map((label) => (
              <span key={label} className="rounded-lg border border-slate-700 bg-slate-900/70 px-2 py-0.5 sm:rounded-xl sm:px-2.5 sm:py-1">
                {label}
              </span>
            ))}
          </div>

          <p className="text-xs text-slate-500">
            {canEditTasks
              ? "Open to edit workflow, assignments, stage progression, or delete."
              : "Open to review workflow stage progress and available actions."}
          </p>
        </div>
      ))}
    </div>
  );
}