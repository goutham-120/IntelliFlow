import Notification from "../models/Notification.js";
import Task from "../models/Task.js";
import Workflow from "../models/Workflow.js";
import Group from "../models/Group.js";
import User from "../models/User.js";
import { ACTIVE_TASK_STATUSES } from "../constants/taskStatus.js";

const daysAgo = (days) => {
  const value = new Date();
  value.setDate(value.getDate() - days);
  return value;
};

const createPerformanceEntry = (name) => ({
  name,
  totalTasks: 0,
  completedTasks: 0,
  activeTasks: 0,
  blockedTasks: 0,
  totalCompletionMs: 0,
});

const getOrCreatePerformanceEntry = (collection, key, name) => {
  const existing = collection.get(key);
  if (existing) return existing;

  const created = createPerformanceEntry(name);
  collection.set(key, created);
  return created;
};

const finalizePerformanceEntries = (entries) => {
  const mapped = entries.map((entry) => ({
    name: entry.name,
    totalTasks: entry.totalTasks,
    completedTasks: entry.completedTasks,
    activeTasks: entry.activeTasks,
    blockedTasks: entry.blockedTasks,
    completionRate:
      entry.totalTasks > 0 ? Number(((entry.completedTasks / entry.totalTasks) * 100).toFixed(1)) : 0,
    avgCompletionHours:
      entry.completedTasks > 0
        ? Number((entry.totalCompletionMs / entry.completedTasks / (1000 * 60 * 60)).toFixed(1))
        : 0,
  }));

  mapped.sort((a, b) => {
    if (b.completionRate !== a.completionRate) return b.completionRate - a.completionRate;
    if (b.completedTasks !== a.completedTasks) return b.completedTasks - a.completedTasks;
    if (b.totalTasks !== a.totalTasks) return b.totalTasks - a.totalTasks;
    return a.name.localeCompare(b.name);
  });

  return mapped;
};

const buildStageContributionMetrics = ({ tasks, groups }) => {
  const groupsById = new Map(
    groups.map((group) => [String(group._id), { name: group.name, isActive: group.isActive }])
  );

  const teamPerformanceMap = new Map(
    groups
      .filter((group) => group.isActive)
      .map((group) => [String(group._id), createPerformanceEntry(group.name)])
  );
  const employeePerformanceMap = new Map();

  tasks.forEach((task) => {
    const workflowStages = [...(task.workflowId?.stages || [])].sort((a, b) => a.order - b.order);
    const stageDetailsByName = new Map(
      workflowStages.map((stage) => [
        String(stage.name || "").trim().toLowerCase(),
        {
          order: stage.order,
          groupId: stage.groupId ? String(stage.groupId) : "",
        },
      ])
    );

    const completedStages = [...(task.completedStages || [])]
      .map((entry) => {
        const stageKey = String(entry.stageName || "").trim().toLowerCase();
        const stageDetails = stageDetailsByName.get(stageKey);
        return {
          ...entry,
          stageOrder: stageDetails?.order ?? Number.MAX_SAFE_INTEGER,
          stageGroupId: stageDetails?.groupId || "",
        };
      })
      .sort((a, b) => {
        if (a.stageOrder !== b.stageOrder) return a.stageOrder - b.stageOrder;
        return new Date(a.completedAt) - new Date(b.completedAt);
      });

    let previousCompletedAt = new Date(task.createdAt);
    completedStages.forEach((entry) => {
      const completedAt = new Date(entry.completedAt);
      const durationMs = Math.max(0, completedAt - previousCompletedAt);
      previousCompletedAt = completedAt;

      if (entry.stageGroupId) {
        const groupMeta = groupsById.get(entry.stageGroupId);
        const teamEntry = getOrCreatePerformanceEntry(
          teamPerformanceMap,
          entry.stageGroupId,
          groupMeta?.name || "Unknown Team"
        );
        teamEntry.totalTasks += 1;
        teamEntry.completedTasks += 1;
        teamEntry.totalCompletionMs += durationMs;
      }

      const completedById = entry.completedBy?._id ? String(entry.completedBy._id) : "";
      if (completedById) {
        const employeeEntry = getOrCreatePerformanceEntry(
          employeePerformanceMap,
          completedById,
          entry.completedBy.name || "Unknown User"
        );
        employeeEntry.totalTasks += 1;
        employeeEntry.completedTasks += 1;
        employeeEntry.totalCompletionMs += durationMs;
      }
    });

    if (task.status !== "done" && ACTIVE_TASK_STATUSES.includes(task.status)) {
      const currentGroupId = task.assignedGroupId?._id ? String(task.assignedGroupId._id) : "";
      if (currentGroupId) {
        const groupMeta = groupsById.get(currentGroupId);
        const teamEntry = getOrCreatePerformanceEntry(
          teamPerformanceMap,
          currentGroupId,
          groupMeta?.name || task.assignedGroupId?.name || "Unknown Team"
        );
        teamEntry.totalTasks += 1;
        teamEntry.activeTasks += 1;
        if (task.status === "blocked") {
          teamEntry.blockedTasks += 1;
        }
      }

      const currentUserId = task.assignedTo?._id ? String(task.assignedTo._id) : "";
      if (currentUserId) {
        const employeeEntry = getOrCreatePerformanceEntry(
          employeePerformanceMap,
          currentUserId,
          task.assignedTo?.name || "Unknown User"
        );
        employeeEntry.totalTasks += 1;
        employeeEntry.activeTasks += 1;
        if (task.status === "blocked") {
          employeeEntry.blockedTasks += 1;
        }
      }
    }
  });

  return {
    teamPerformance: finalizePerformanceEntries(Array.from(teamPerformanceMap.values())),
    employeePerformance: finalizePerformanceEntries(Array.from(employeePerformanceMap.values())),
  };
};

export const getAnalyticsSummaryService = async ({ organizationId, lookbackDays = 14 }) => {
  const createdAfter = daysAgo(Number(lookbackDays) || 14);

  const [
    taskCounts,
    stageCounts,
    workflowCounts,
    totalWorkflows,
    totalGroups,
    totalUsers,
    unreadNotifications,
    groups,
    recentTasks,
    tasksForContributionMetrics,
  ] = await Promise.all([
    Task.aggregate([{ $match: { organizationId } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    Task.aggregate([
      { $match: { organizationId } },
      {
        $group: {
          _id: {
            $cond: [
              { $or: [{ $eq: ["$stageName", null] }, { $eq: ["$stageName", ""] }] },
              "Unstaged",
              "$stageName",
            ],
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 8 },
    ]),
    Task.aggregate([
      { $match: { organizationId } },
      {
        $lookup: {
          from: "workflows",
          localField: "workflowId",
          foreignField: "_id",
          as: "workflow",
        },
      },
      {
        $project: {
          workflowName: {
            $ifNull: [{ $arrayElemAt: ["$workflow.name", 0] }, "Standalone"],
          },
        },
      },
      { $group: { _id: "$workflowName", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ]),
    Workflow.countDocuments({ organizationId, isActive: true }),
    Group.countDocuments({ organizationId, isActive: true }),
    User.countDocuments({ organizationId, isActive: true }),
    Notification.countDocuments({ organizationId, isRead: false }),
    Group.find({ organizationId }).select("name isActive"),
    Task.find({ organizationId, createdAt: { $gte: createdAfter } })
      .select("title status stageName createdAt updatedAt")
      .sort({ createdAt: -1 })
      .limit(8),
    Task.find({ organizationId })
      .populate("workflowId", "name stages")
      .populate("assignedGroupId", "name")
      .populate("assignedTo", "name")
      .populate("completedStages.completedBy", "name"),
  ]);

  const tasksByStatus = taskCounts.reduce(
    (acc, entry) => ({ ...acc, [entry._id]: entry.count }),
    {}
  );

  const totalTasks = taskCounts.reduce((sum, entry) => sum + entry.count, 0);
  const activeTasks = ACTIVE_TASK_STATUSES.reduce(
    (sum, status) => sum + (tasksByStatus[status] || 0),
    0
  );

  const { teamPerformance, employeePerformance } = buildStageContributionMetrics({
    tasks: tasksForContributionMetrics,
    groups,
  });

  return {
    status: 200,
    payload: {
      summary: {
        totalTasks,
        activeTasks,
        totalWorkflows,
        totalGroups,
        totalUsers,
        unreadNotifications,
        recentTasks: recentTasks.length,
      },
      tasksByStatus,
      taskStatusData: taskCounts.map((entry) => ({
        label: entry._id,
        value: entry.count,
      })),
      stageLoadData: stageCounts.map((entry) => ({
        label: entry._id,
        value: entry.count,
      })),
      workflowMixData: workflowCounts.map((entry) => ({
        label: entry._id,
        value: entry.count,
      })),
      teamLoadData: teamPerformance.map((entry) => ({
        label: entry.name,
        value: entry.totalTasks,
      })),
      employeeLoadData: employeePerformance.map((entry) => ({
        label: entry.name,
        value: entry.totalTasks,
      })),
      teamPerformance,
      employeePerformance,
      recentTasks,
    },
  };
};

export default {
  getAnalyticsSummaryService,
};
