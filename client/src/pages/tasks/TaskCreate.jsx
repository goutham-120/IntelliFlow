import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchGroups } from "../../services/groupService";
import { createTask } from "../../services/taskService";
import { fetchWorkflows } from "../../services/workflowService";

export default function TaskCreate() {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [createMode, setCreateMode] = useState("workflow");
  const [title, setTitle] = useState("");
  const [workflowId, setWorkflowId] = useState("");
  const [assignedGroupId, setAssignedGroupId] = useState("");

  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [workflowsData, groupsData] = await Promise.all([
          fetchWorkflows(false),
          isAdmin ? fetchGroups() : Promise.resolve([]),
        ]);
        setWorkflows(Array.isArray(workflowsData) ? workflowsData : []);
        setGroups(Array.isArray(groupsData) ? groupsData : []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load task create dependencies");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [isAdmin]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Task title is required");
      return;
    }

    const payload = { title: trimmedTitle };
    if (createMode === "workflow") {
      if (!workflowId) {
        setError("Select a workflow for workflow-driven task creation");
        return;
      }
      payload.workflowId = workflowId;
    } else if (assignedGroupId) {
      payload.assignedGroupId = assignedGroupId;
    }

    setSubmitting(true);
    try {
      const result = await createTask(payload);
      navigate("/tasks", {
        state: { message: result?.message || "Task created successfully" },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-slate-800/90 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.14),transparent_28%),radial-gradient(circle_at_right,rgba(56,189,248,0.12),transparent_22%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(17,24,39,0.84))] p-6 shadow-[0_24px_60px_rgba(2,6,23,0.28)]">
        <h1 className="text-3xl font-bold text-white">Create Task</h1>
        <p className="text-sm text-slate-300">
          Choose the right creation path so new users understand whether work should
          follow a workflow or be handled as standalone work.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-500/12 p-3 text-rose-200">
          {error}
        </div>
      )}

      <section className="rounded-[28px] border border-slate-800/90 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(17,24,39,0.8))] p-6 shadow-[0_18px_45px_rgba(2,6,23,0.26)]">
        {loading ? (
          <div className="text-slate-400">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-2xl border border-slate-800/90 bg-slate-950/70 p-4 text-sm text-slate-300">
              <p className="font-medium text-white">Beginner guide</p>
              <p className="mt-2 text-slate-400">
                Use <span className="text-white">Workflow</span> when the task should move
                through defined stages. Use <span className="text-white">Standalone</span> when
                it&apos;s a direct work item without a workflow lifecycle.
              </p>
            </div>
            <div className="inline-flex rounded-xl border border-slate-700 bg-slate-950/70 p-1">
              <button
                type="button"
                onClick={() => setCreateMode("workflow")}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  createMode === "workflow"
                    ? "bg-emerald-500 text-slate-950"
                    : "text-slate-300 hover:bg-slate-900"
                }`}
              >
                Workflow
              </button>
              <button
                type="button"
                onClick={() => setCreateMode("standalone")}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  createMode === "standalone"
                    ? "bg-emerald-500 text-slate-950"
                    : "text-slate-300 hover:bg-slate-900"
                }`}
              >
                Standalone
              </button>
            </div>

            <input
              type="text"
              placeholder="Task title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
              required
            />

            {createMode === "workflow" ? (
              <select
                value={workflowId}
                onChange={(event) => setWorkflowId(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Select workflow</option>
                {workflows
                  .filter((workflow) => workflow?.isActive)
                  .map((workflow) => (
                    <option key={workflow._id} value={workflow._id}>
                      {workflow.name}
                    </option>
                  ))}
              </select>
            ) : (
              <select
                value={assignedGroupId}
                onChange={(event) => setAssignedGroupId(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Select team (optional)</option>
                {groups.map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.name}
                  </option>
                ))}
              </select>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-[linear-gradient(135deg,#0f766e,#10b981)] px-5 py-2.5 font-semibold text-white shadow-[0_12px_24px_rgba(16,185,129,0.18)] transition hover:brightness-105 disabled:opacity-60"
              >
                {submitting ? "Creating..." : "Create Task"}
              </button>
              <Link
                to="/tasks"
                className="rounded-xl border border-slate-700 bg-slate-950/70 px-5 py-2.5 text-sm text-slate-300 transition hover:border-slate-500 hover:bg-slate-900"
              >
                Back to Tasks
              </Link>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
