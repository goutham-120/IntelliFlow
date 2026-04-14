import api from "./api";

export const fetchAnalyticsDashboard = async (lookbackDays = 14) => {
  const response = await api.get("/analytics/summary", {
    params: { lookbackDays },
  });

  const payload = response.data || {};

  return {
    summary: {
      totalTasks: payload.summary?.totalTasks || 0,
      activeTasks: payload.summary?.activeTasks || 0,
      activeWorkflows: payload.summary?.totalWorkflows || 0,
      groups: payload.summary?.totalGroups || 0,
      users: payload.summary?.totalUsers || 0,
      unreadNotifications: payload.summary?.unreadNotifications || 0,
      recentTasks: payload.summary?.recentTasks || 0,
    },
    taskStatusData: payload.taskStatusData || [],
    stageLoadData: payload.stageLoadData || [],
    workflowMixData: payload.workflowMixData || [],
    teamLoadData: payload.teamLoadData || [],
    employeeLoadData: payload.employeeLoadData || [],
    teamPerformance: payload.teamPerformance || [],
    employeePerformance: payload.employeePerformance || [],
    latestTasks: payload.recentTasks || [],
  };
};
