import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import TaskTable from "../../components/tasks/TaskTable";
import { fetchTasks, updateTask } from "../../services/taskService";

export default function TaskList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

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
    setError("");
    setSuccess("");
    setUpdatingTaskId(taskId);
    try {
      const result = await updateTask(taskId, { status });
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
      <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Task Operations</h1>
            <p className="text-sm text-slate-400">Track tasks, stage movement, and assignees.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2">
              <label className="mr-2 text-xs uppercase tracking-wide text-slate-400">Status</label>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-white"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
            <Link
              to="/tasks/create"
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              + New Task
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/40 bg-red-500/20 p-3 text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/20 p-3 text-emerald-300">
          {success}
        </div>
      )}

      <section className="rounded-3xl border border-slate-800 bg-slate-900/50">
        <TaskTable
          tasks={tasks}
          loading={loading}
          updatingTaskId={updatingTaskId}
          onQuickStatusUpdate={handleQuickStatusUpdate}
        />
      </section>
    </div>
  );
}
