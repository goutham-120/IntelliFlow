import { Link } from "react-router-dom";

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
        <div key={task._id} className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-white">{task.title}</h3>
            <div className="flex items-center gap-2">
              <select
                value={task.status}
                onChange={(event) => onQuickStatusUpdate(task._id, event.target.value)}
                disabled={updatingTaskId === task._id}
                className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs uppercase text-slate-300 disabled:opacity-60"
              >
                <option value="pending">pending</option>
                <option value="in_progress">in_progress</option>
                <option value="done">done</option>
                <option value="blocked">blocked</option>
              </select>
              <Link
                to={`/tasks/${task._id}`}
                className="rounded-lg border border-emerald-400/50 px-3 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-500/10"
              >
                View / Edit
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-300">
            <span className="rounded-lg border border-slate-700 px-2.5 py-1">
              Workflow: {task.workflowId?.name || "None"}
            </span>
            <span className="rounded-lg border border-slate-700 px-2.5 py-1">
              Stage: {task.stageName || "None"}
            </span>
            <span className="rounded-lg border border-slate-700 px-2.5 py-1">
              Group: {task.assignedGroupId?.name || "None"}
            </span>
            <span className="rounded-lg border border-slate-700 px-2.5 py-1">
              Assignee: {task.assignedTo?.name || "Unassigned"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
