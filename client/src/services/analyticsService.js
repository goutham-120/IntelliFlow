import api from "./api";

export const fetchAnalyticsDashboard = async (lookbackDays = 14) => {
  const response = await api.get("/analytics/summary", {
    params: { lookbackDays },
  });

  const payload = response.data || {};
  const summary = payload.summary || {};
  const totalWorkflows = Number(summary.totalWorkflows || summary.activeWorkflows || 0);
  const totalGroups = Number(summary.totalGroups || summary.groups || 0);
  const totalUsers = Number(summary.totalUsers || summary.users || 0);

  return {
    summary: {
      totalTasks: Number(summary.totalTasks || 0),
      activeTasks: Number(summary.activeTasks || 0),
      totalWorkflows,
      totalGroups,
      totalUsers,
      activeWorkflows: totalWorkflows,
      groups: totalGroups,
      users: totalUsers,
      unreadNotifications: Number(summary.unreadNotifications || 0),
      recentTasks: Number(summary.recentTasks || 0),
    },
    taskStatusData: Array.isArray(payload.taskStatusData) ? payload.taskStatusData : [],
    stageLoadData: Array.isArray(payload.stageLoadData) ? payload.stageLoadData : [],
    workflowMixData: Array.isArray(payload.workflowMixData) ? payload.workflowMixData : [],
    teamLoadData: Array.isArray(payload.teamLoadData) ? payload.teamLoadData : [],
    employeeLoadData: Array.isArray(payload.employeeLoadData) ? payload.employeeLoadData : [],
    teamPerformance: Array.isArray(payload.teamPerformance) ? payload.teamPerformance : [],
    employeePerformance: Array.isArray(payload.employeePerformance)
      ? payload.employeePerformance
      : [],
    workflowStatusCards: Array.isArray(payload.workflowStatusCards)
      ? payload.workflowStatusCards
      : [],
    latestTasks: Array.isArray(payload.recentTasks) ? payload.recentTasks : [],
    tasksCreatedSeries: Array.isArray(payload.tasksCreatedSeries)
      ? payload.tasksCreatedSeries
      : [],
    tasksCompletedSeries: Array.isArray(payload.tasksCompletedSeries)
      ? payload.tasksCompletedSeries
      : [],
    bottleneckStages: Array.isArray(payload.bottleneckStages) ? payload.bottleneckStages : [],
  };
};
