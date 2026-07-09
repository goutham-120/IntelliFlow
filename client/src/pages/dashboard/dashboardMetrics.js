const ACTIVE_STATUSES = new Set(["pending", "in_progress", "blocked", "needs_changes"]);
const toId = (value) => String(value || "");

export const buildDashboardMetrics = ({ tasks = [], notifications = [], memberships = [], userId }) => {
  const myUserId = toId(userId);
  const myTasks = (tasks || []).filter((task) => toId(task.assignedTo?._id || task.assignedTo) === myUserId);
  const myActiveTasks = myTasks.filter((task) => ACTIVE_STATUSES.has(task.status));
  const myStageEntries = (tasks || []).flatMap((task) =>
    (task.completedStages || [])
      .filter((entry) => toId(entry.completedBy?._id || entry.completedBy) === myUserId)
      .map((entry) => ({
        taskId: task._id,
        stageName: entry.stageName || "Unnamed Stage",
      }))
  );

  const stageBreakdownMap = myStageEntries.reduce((acc, entry) => {
    acc.set(entry.stageName, (acc.get(entry.stageName) || 0) + 1);
    return acc;
  }, new Map());

  const stageBreakdown = Array.from(stageBreakdownMap.entries())
    .map(([stageName, count]) => ({ stageName, count }))
    .sort((a, b) => b.count - a.count || a.stageName.localeCompare(b.stageName));

  const contributedTaskIds = new Set(myStageEntries.map((entry) => toId(entry.taskId)));
  const unreadNotifications = (notifications || []).filter((notification) => !notification.isRead).length;

  return {
    myActiveTasks,
    myStageEntries,
    stageBreakdown,
    unreadNotifications,
    contributedTaskCount: contributedTaskIds.size,
    recentMyTasks: [...myTasks].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 6),
    membershipsCount: (memberships || []).length,
  };
};
