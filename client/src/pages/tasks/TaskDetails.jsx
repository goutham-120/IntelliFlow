import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import TaskStageButtons from "../../components/tasks/TaskStageButtons";
import TaskTimeline from "../../components/tasks/TaskTimeline";
import {
  assignTaskToGroup,
  fetchGroupMembers,
  fetchGroups,
} from "../../services/groupService";
import {
  completeTaskStage,
  deleteTask,
  fetchTaskById,
  updateTask,
} from "../../services/taskService";
import { fetchUsers } from "../../services/userService";
import { fetchWorkflows } from "../../services/workflowService";
import { TASK_STATUS_OPTIONS } from "../../utils/constants";

export default function TaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [taskMode, setTaskMode] = useState("workflow");
  const [groupRole, setGroupRole] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [assigningByGroup, setAssigningByGroup] = useState(false);
  const [completingStage, setCompletingStage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [canManualAssign, setCanManualAssign] = useState(false);

  const [form, setForm] = useState({
    title: "",
    status: "pending",
    workflowId: "",
    stageName: "",
    assignedGroupId: "",
    assignedTo: "",
  });

  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const isAdmin = user?.role === "admin";
  const currentUserId = String(user?.id || user?._id || "");

  const selectedWorkflow = useMemo(
    () => workflows.find((workflow) => workflow._id === form.workflowId) || null,
    [form.workflowId, workflows]
  );

  const selectedWorkflowStages = useMemo(() => {
    const stages = selectedWorkflow?.stages || [];
    return [...stages].sort((a, b) => a.order - b.order);
  }, [selectedWorkflow]);

  const canCompleteStage = useMemo(() => {
    if (!task || task.status === "done") return false;
    return String(task?.assignedTo?._id || "") === currentUserId;
  }, [currentUserId, task]);

  const canUseTeamLoadBalancing = Boolean(task?.assignedGroupId?._id) && (isAdmin || groupRole === "team_lead");

  const loadTaskData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [taskData, workflowsData, groupsData, usersData] = await Promise.all([
        fetchTaskById(taskId),
        fetchWorkflows(true),
        fetchGroups(),
        isAdmin ? fetchUsers() : Promise.resolve([]),
      ]);

      const workflowList = Array.isArray(workflowsData) ? workflowsData : [];
      const groupList = Array.isArray(groupsData) ? groupsData : [];
      const allUsers = Array.isArray(usersData) ? usersData : [];

      setTask(taskData);
      setWorkflows(workflowList);
      setGroups(groupList);
      setTaskMode(taskData?.workflowId?._id ? "workflow" : "standalone");

      const currentGroupId = taskData?.assignedGroupId?._id || "";
      if (currentGroupId) {
        const membersData = await fetchGroupMembers(currentGroupId);
        const memberships = Array.isArray(membersData?.memberships) ? membersData.memberships : [];
        const activeMembers = memberships
          .map((membership) => membership.userId)
          .filter((member) => member?.isActive);
        const myMembership = memberships.find(
          (membership) => String(membership?.userId?._id) === currentUserId
        );
        const roleInGroup = myMembership?.roleInGroup || "";
        setGroupRole(roleInGroup);
        setCanManualAssign(isAdmin || roleInGroup === "team_lead");
        setUsers(activeMembers);
      } else {
        setGroupRole("");
        setCanManualAssign(isAdmin);
        setUsers(allUsers.filter((member) => member?.isActive));
      }

      setForm({
        title: taskData?.title || "",
        status: taskData?.status || "pending",
        workflowId: taskData?.workflowId?._id || "",
        stageName: taskData?.stageName || "",
        assignedGroupId: taskData?.assignedGroupId?._id || "",
        assignedTo: taskData?.assignedTo?._id || "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load task");
    } finally {
      setLoading(false);
    }
  }, [currentUserId, isAdmin, taskId]);

  useEffect(() => {
    loadTaskData();
  }, [loadTaskData]);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const setMode = (mode) => {
    setTaskMode(mode);
    if (mode === "workflow") {
      setForm((prev) => ({
        ...prev,
        assignedGroupId: "",
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        workflowId: "",
        stageName: "",
      }));
    }
  };

  const handleWorkflowChange = (value) => {
    const workflow = workflows.find((item) => item._id === value);
    const stages = [...(workflow?.stages || [])].sort((a, b) => a.order - b.order);
    setForm((prev) => ({
      ...prev,
      workflowId: value,
      stageName: stages[0]?.name || "",
      assignedGroupId: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const trimmedTitle = form.title.trim();
    if (!trimmedTitle) {
      setError("Task title is required");
      return;
    }

    const payload = {
      title: trimmedTitle,
      status: form.status,
    };

    if (taskMode === "workflow") {
      if (!form.workflowId) {
        setError("Select a workflow");
        return;
      }
      payload.workflowId = form.workflowId;
      payload.stageName = form.stageName || null;
      payload.assignedGroupId = null;
    } else {
      payload.workflowId = null;
      payload.stageName = null;
      payload.assignedGroupId = form.assignedGroupId || null;
    }

    if (canManualAssign) {
      payload.assignedTo = form.assignedTo || null;
    }

    setSaving(true);
    try {
      const result = await updateTask(taskId, payload);
      setSuccess(result?.message || "Task updated");
      await loadTaskData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update task");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const shouldDelete = window.confirm("Delete this task permanently?");
    if (!shouldDelete) return;

    setError("");
    setSuccess("");
    setDeleting(true);
    try {
      const result = await deleteTask(taskId);
      navigate("/tasks", {
        replace: true,
        state: { message: result?.message || "Task deleted" },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete task");
      setDeleting(false);
    }
  };

  const handleAssignUsingGroup = async () => {
    const currentGroupId = task?.assignedGroupId?._id || "";
    if (!currentGroupId) {
      setError("This task must already belong to a team before workload balancing");
      return;
    }

    setError("");
    setSuccess("");
    setAssigningByGroup(true);
    try {
      const result = await assignTaskToGroup(currentGroupId, taskId);
      setSuccess(result?.message || "Task assigned using team balancing");
      await loadTaskData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign task");
    } finally {
      setAssigningByGroup(false);
    }
  };

  const handleCompleteStage = async () => {
    setError("");
    setSuccess("");
    setCompletingStage(true);
    try {
      const result = await completeTaskStage(taskId);
      setSuccess(result?.message || "Stage completed");
      await loadTaskData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete stage");
    } finally {
      setCompletingStage(false);
    }
  };

  if (loading) return <div className="text-slate-400">Loading task details...</div>;
  if (!task) {
    return (
      <div className="space-y-3">
        <p className="text-red-300">Task not found.</p>
        <Link to="/tasks" className="text-emerald-300 hover:underline">
          Back to Tasks
        </Link>
      </div>
    );
  }

  const timelineWorkflow =
    selectedWorkflow ||
    workflows.find((workflow) => workflow._id === task?.workflowId?._id) ||
    task?.workflowId;

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-slate-800/90 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.14),transparent_28%),radial-gradient(circle_at_right,rgba(56,189,248,0.12),transparent_22%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(17,24,39,0.84))] p-6 shadow-[0_24px_60px_rgba(2,6,23,0.28)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-white">Task Command Center</h1>
            <p className="text-sm text-slate-400">Task ID: {task._id}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl border border-rose-400/30 bg-rose-500/12 px-4 py-2 text-sm text-rose-200 hover:bg-rose-500/18 disabled:opacity-60"
            >
              {deleting ? "Deleting..." : "Delete Task"}
            </button>
            <Link
              to="/tasks"
              className="rounded-xl border border-emerald-400/30 bg-emerald-500/12 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-500/18"
            >
              Back to Tasks
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-500/12 p-3 text-rose-200">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/12 p-3 text-emerald-200">
          {success}
        </div>
      )}

      <section className="rounded-[28px] border border-slate-800/90 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(17,24,39,0.8))] p-5 text-sm text-slate-300 shadow-[0_18px_45px_rgba(2,6,23,0.26)]">
        <p className="font-medium text-white">How to use this page</p>
        <p className="mt-2 text-slate-400">
          The left side shows stage progress and team-based actions. The right side lets
          you edit the task&apos;s workflow, assignment, and status.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_2fr]">
        <div className="space-y-6">
          <TaskStageButtons
            task={task}
            canCompleteStage={canCompleteStage}
            completingStage={completingStage}
            onComplete={handleCompleteStage}
          />
          <TaskTimeline workflow={timelineWorkflow} task={task} />

          {canUseTeamLoadBalancing && (
            <section className="rounded-[28px] border border-slate-800/90 bg-[linear-gradient(180deg,rgba(15,23,42,0.95),rgba(2,6,23,0.84))] p-4 shadow-[0_18px_45px_rgba(2,6,23,0.24)]">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
                Team Load Balance
              </h3>
              <p className="mb-3 text-xs text-slate-400">
                Only the task&apos;s current team can rebalance workload for this task.
              </p>
              <div className="space-y-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
                  Team: <span className="font-medium text-white">{task.assignedGroupId?.name}</span>
                </div>
                <button
                  type="button"
                  onClick={handleAssignUsingGroup}
                  disabled={assigningByGroup}
                  className="w-full rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-200 hover:bg-emerald-500/16 disabled:opacity-60"
                >
                  {assigningByGroup ? "Assigning..." : "Auto Assign by Workload"}
                </button>
              </div>
            </section>
          )}
        </div>

        <section className="rounded-[28px] border border-slate-800/90 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(17,24,39,0.8))] p-6 shadow-[0_18px_45px_rgba(2,6,23,0.26)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-white">Edit Task</h2>
            <div className="inline-flex rounded-xl border border-slate-700 bg-slate-950/70 p-1">
              <button
                type="button"
                onClick={() => setMode("workflow")}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  taskMode === "workflow"
                    ? "bg-cyan-500 text-slate-950"
                    : "text-slate-300 hover:bg-slate-900"
                }`}
              >
                Workflow Mode
              </button>
              <button
                type="button"
                onClick={() => setMode("standalone")}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  taskMode === "standalone"
                    ? "bg-cyan-500 text-slate-950"
                    : "text-slate-300 hover:bg-slate-900"
                }`}
              >
                Standalone Mode
              </button>
            </div>
          </div>

          <div className="mb-4 rounded-2xl border border-slate-800/90 bg-slate-950/70 p-4 text-sm text-slate-300">
            <p className="font-medium text-white">Mode guide</p>
            <p className="mt-2 text-slate-400">
              Workflow mode keeps the task tied to an ordered process. Standalone mode is for
              direct work items that only need a team or assignee.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm text-slate-300">Title</span>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm text-slate-300">Status</span>
              <select
                value={form.status}
                onChange={(e) => setField("status", e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
              >
                {TASK_STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>

            {canManualAssign && (
              <label className="space-y-1">
                <span className="text-sm text-slate-300">Assigned User</span>
                <select
                  value={form.assignedTo}
                  onChange={(e) => setField("assignedTo", e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Unassigned</option>
                  {users.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name} ({item.email})
                    </option>
                  ))}
                </select>
              </label>
            )}

            {taskMode === "workflow" ? (
              <>
                <label className="space-y-1">
                  <span className="text-sm text-slate-300">Workflow</span>
                  <select
                    value={form.workflowId}
                    onChange={(e) => handleWorkflowChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="">Select workflow</option>
                    {workflows.map((workflow) => (
                      <option key={workflow._id} value={workflow._id}>
                        {workflow.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-sm text-slate-300">Stage</span>
                  <select
                    value={form.stageName}
                    onChange={(e) => setField("stageName", e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="">Select stage</option>
                    {selectedWorkflowStages.map((stage) => (
                      <option key={`${stage.order}-${stage.name}`} value={stage.name}>
                        {stage.order}. {stage.name}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            ) : (
              <label className="space-y-1 md:col-span-2">
                <span className="text-sm text-slate-300">Assigned Team</span>
                <select
                  value={form.assignedGroupId}
                  onChange={(e) => setField("assignedGroupId", e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Unassigned</option>
                  {groups.map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[linear-gradient(135deg,#0f766e,#10b981)] px-5 py-2.5 font-semibold text-white shadow-[0_12px_24px_rgba(16,185,129,0.18)] transition hover:brightness-105 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
