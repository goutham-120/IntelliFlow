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
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
        <h1 className="text-3xl font-bold text-white">Create Task</h1>
        <p className="text-sm text-slate-400">
          Choose workflow-driven creation or standalone task creation.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/40 bg-red-500/20 p-3 text-red-300">
          {error}
        </div>
      )}

      <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
        {loading ? (
          <div className="text-slate-400">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="inline-flex rounded-xl border border-slate-700 bg-slate-950 p-1">
              <button
                type="button"
                onClick={() => setCreateMode("workflow")}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  createMode === "workflow"
                    ? "bg-emerald-500 text-slate-950"
                    : "text-slate-300 hover:bg-slate-800"
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
                    : "text-slate-300 hover:bg-slate-800"
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
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-white"
              required
            />

            {createMode === "workflow" ? (
              <select
                value={workflowId}
                onChange={(event) => setWorkflowId(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-white"
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
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-white"
              >
                <option value="">Select group (optional)</option>
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
                className="rounded-xl bg-emerald-500 px-5 py-2.5 font-semibold text-slate-950 disabled:opacity-60"
              >
                {submitting ? "Creating..." : "Create Task"}
              </button>
              <Link
                to="/tasks"
                className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm text-slate-300"
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
