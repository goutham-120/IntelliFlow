import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import TaskTable from "../../components/tasks/TaskTable";
import { TASK_STATUS_OPTIONS } from "../../utils/constants";
import { completeTaskStage, fetchTasks, updateTask } from "../../services/taskService";
import useRole from "../../hooks/useRole";

export default function TaskList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { isAdmin } = useRole();
  const currentUserId = (() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return String(user?.id || user?._id || "");
    } catch {
      return "";
    }
  })();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const tasksData = await fetchTasks(statusFilter ? { status: statusFilter } : {});
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const message = location.state?.message;
    if (message) {
      setSuccess(message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  const handleQuickStatusUpdate = async (taskId, status) => {
    if (!isAdmin) return;

    setError("");
    setSuccess("");
    setUpdatingTaskId(taskId);
    try {
      const task = tasks.find((item) => item._id === taskId);
      const isWorkflowTask = Boolean(task?.workflowId?._id || task?.workflowId);
      const result =
        status === "done" && isWorkflowTask && task?.status !== "done"
          ? await completeTaskStage(taskId, { description: "Marked complete by admin" })
          : await updateTask(taskId, { status });
      setSuccess(result?.message || "Task updated");
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update task");
    } finally {
      setUpdatingTaskId("");
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-slate-800/90 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.14),transparent_28%),radial-gradient(circle_at_right,rgba(56,189,248,0.12),transparent_22%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(17,24,39,0.84))] p-6 shadow-[0_24px_60px_rgba(2,6,23,0.28)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-200/80">
              Execution Board
            </p>
            <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Task Operations</h1>
            <p className="text-sm text-slate-300">
              Track work, understand who owns it, and quickly move it forward.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-slate-700/80 bg-slate-950/70 px-3 py-2 shadow-[0_10px_24px_rgba(2,6,23,0.2)]">
              <label className="mr-2 text-xs uppercase tracking-wide text-slate-400">Status</label>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-100"
              >
                <option value="">All</option>
                {TASK_STATUS_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <Link
              to="/tasks/create"
              className="rounded-lg bg-[linear-gradient(135deg,#0f766e,#14b8a6)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(15,118,110,0.28)] transition hover:brightness-110"
            >
              + New Task
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-400/30 bg-rose-500/12 p-3 text-rose-200">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/12 p-3 text-emerald-200">
          {success}
        </div>
      )}

      <section className="rounded-lg border border-slate-800/90 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(17,24,39,0.8))] p-5 text-sm text-slate-300 shadow-[0_18px_45px_rgba(2,6,23,0.26)]">
        <p className="font-medium text-white">Quick orientation</p>
        <p className="mt-2 text-slate-400">
          Each card below shows a task, its workflow stage, current team, and current
          assignee. Admins can use the status picker on the card to make small updates quickly.
        </p>
      </section>

      <section className="rounded-lg border border-slate-800/90 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(17,24,39,0.8))] shadow-[0_18px_45px_rgba(2,6,23,0.26)]">
        <TaskTable
          tasks={tasks}
          loading={loading}
          updatingTaskId={updatingTaskId}
          onQuickStatusUpdate={handleQuickStatusUpdate}
          canEditTasks={isAdmin}
          currentUserId={currentUserId}
        />
      </section>
    </div>
  );
}
