import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import TaskTable from "../../components/tasks/TaskTable";
import { TASK_STATUS_OPTIONS } from "../../utils/constants";
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
      <div className="rounded-[32px] border border-[#e8e8e4] bg-[radial-gradient(circle_at_top_left,rgba(216,237,230,0.9),transparent_28%),linear-gradient(180deg,#ffffff,#f9f9f7)] p-6 shadow-[0_18px_50px_rgba(17,17,17,0.06)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Task Operations</h1>
            <p className="text-sm text-slate-600">
              Track work, understand who owns it, and quickly move it forward.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-[#e8e8e4] bg-white px-3 py-2 shadow-sm">
              <label className="mr-2 text-xs uppercase tracking-wide text-slate-500">Status</label>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-lg border border-[#e8e8e4] bg-[#fbfbfa] px-3 py-1.5 text-sm text-slate-900"
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
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
            >
              + New Task
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-700">
          {success}
        </div>
      )}

      <section className="rounded-[28px] border border-[#e8e8e4] bg-white p-5 text-sm text-slate-700 shadow-[0_12px_35px_rgba(17,17,17,0.05)]">
        <p className="font-medium text-slate-900">Quick orientation</p>
        <p className="mt-2 text-slate-500">
          Each card below shows a task, its workflow stage, current team, and current
          assignee. Use the status picker on the card to make small updates quickly.
        </p>
      </section>

      <section className="rounded-[28px] border border-[#e8e8e4] bg-white shadow-[0_12px_35px_rgba(17,17,17,0.05)]">
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
