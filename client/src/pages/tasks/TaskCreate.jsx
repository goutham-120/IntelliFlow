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
      <div className="rounded-[32px] border border-[#e8e8e4] bg-[radial-gradient(circle_at_top_left,rgba(216,237,230,0.9),transparent_28%),linear-gradient(180deg,#ffffff,#f9f9f7)] p-6 shadow-[0_18px_50px_rgba(17,17,17,0.06)]">
        <h1 className="text-3xl font-bold text-slate-900">Create Task</h1>
        <p className="text-sm text-slate-600">
          Choose the right creation path so new users understand whether work should
          follow a workflow or be handled as standalone work.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-[28px] border border-[#e8e8e4] bg-white p-6 shadow-[0_12px_35px_rgba(17,17,17,0.05)]">
        {loading ? (
          <div className="text-slate-500">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-2xl border border-[#e8e8e4] bg-[#fbfbfa] p-4 text-sm text-slate-700">
              <p className="font-medium text-slate-900">Beginner guide</p>
              <p className="mt-2 text-slate-500">
                Use <span className="text-slate-900">Workflow</span> when the task should move
                through defined stages. Use <span className="text-slate-900">Standalone</span> when
                it’s a direct work item without a workflow lifecycle.
              </p>
            </div>
            <div className="inline-flex rounded-xl border border-[#e8e8e4] bg-[#f4f6f3] p-1">
              <button
                type="button"
                onClick={() => setCreateMode("workflow")}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  createMode === "workflow"
                    ? "bg-emerald-500 text-slate-950"
                    : "text-slate-600 hover:bg-white"
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
                    : "text-slate-600 hover:bg-white"
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
              className="w-full rounded-xl border border-[#e8e8e4] bg-white px-4 py-2.5 text-slate-900"
              required
            />

            {createMode === "workflow" ? (
              <select
                value={workflowId}
                onChange={(event) => setWorkflowId(event.target.value)}
                className="w-full rounded-xl border border-[#e8e8e4] bg-white px-4 py-2.5 text-slate-900"
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
                className="w-full rounded-xl border border-[#e8e8e4] bg-white px-4 py-2.5 text-slate-900"
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
                className="rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white disabled:opacity-60"
              >
                {submitting ? "Creating..." : "Create Task"}
              </button>
              <Link
                to="/tasks"
                className="rounded-xl border border-[#e8e8e4] px-5 py-2.5 text-sm text-slate-700"
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
