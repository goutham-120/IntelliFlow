import { fetchTasks } from "./taskService";

const WARNING_HOURS = 36;
const BREACH_HOURS = 72;

const getAgeHours = (createdAt) => {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return 0;
  return (Date.now() - created.getTime()) / 36e5;
};

export const getDerivedSlaStatus = (task) => {
  if (task?.status === "done") return "completed";
  const ageHours = getAgeHours(task?.createdAt);
  if (ageHours >= BREACH_HOURS) return "breached";
  if (ageHours >= WARNING_HOURS) return "warning";
  return "on_track";
};

export const fetchSlaDashboard = async () => {
  const tasks = await fetchTasks();
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const records = safeTasks.map((task) => {
    const ageHours = getAgeHours(task.createdAt);
    const status = getDerivedSlaStatus(task);
    return {
      taskId: task._id,
      title: task.title,
      workflowName: task.workflowId?.name || "Standalone",
      stageName: task.stageName || "Unstaged",
      taskStatus: task.status,
      assigneeName: task.assignedTo?.name || "Unassigned",
      ageHours,
      status,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  });

  const summary = records.reduce(
    (acc, record) => {
      acc.total += 1;
      acc[record.status] += 1;
      return acc;
    },
    { total: 0, on_track: 0, warning: 0, breached: 0, completed: 0 }
  );

  return {
    summary,
    records: records.sort((a, b) => b.ageHours - a.ageHours),
  };
};
