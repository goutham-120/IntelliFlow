import Notification from "../models/Notification.js";
import Task from "../models/Task.js";
import Workflow from "../models/Workflow.js";
import Group from "../models/Group.js";
import User from "../models/User.js";
import { ACTIVE_TASK_STATUSES, TASK_STATUS_LIST } from "../constants/taskStatus.js";

const daysAgo = (days) => {
  const value = new Date();
  value.setDate(value.getDate() - days);
  return value;
};

const toDateKey = (date) => new Date(date).toISOString().slice(0, 10);

const buildDailyBuckets = ({ lookbackDays }) => {
  const days = Math.max(1, Number(lookbackDays) || 14);
  const start = daysAgo(days - 1);
  start.setHours(0, 0, 0, 0);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      date: toDateKey(date),
      count: 0,
      totalCycleMs: 0,
      completedCount: 0,
    };
  });
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

const toEntityId = (value) => {
  if (!value) return "";
  if (value._id) return String(value._id);
  return String(value);
};

const getStageDurationMs = ({ entry, fallbackStart }) => {
  if (Number.isFinite(entry.durationMs) && entry.durationMs >= 0) {
    return entry.durationMs;
  }

  const completedAt = new Date(entry.completedAt);
  const startedAt = entry.startedAt ? new Date(entry.startedAt) : fallbackStart;
  return Math.max(0, completedAt - startedAt);
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

const buildStageContributionMetrics = ({ tasks, groups, users }) => {
  const groupsById = new Map(
    groups.map((group) => [String(group._id), { name: group.name, isActive: group.isActive }])
  );
  const usersById = new Map(
    (users || []).map((user) => [String(user._id), { name: user.name || "Unknown User" }])
  );

  const teamPerformanceMap = new Map(
    groups
      .filter((group) => group.isActive)
      .map((group) => [String(group._id), createPerformanceEntry(group.name)])
  );
  const employeePerformanceMap = new Map(
    (users || []).map((user) => [String(user._id), createPerformanceEntry(user.name || "Unknown User")])
  );

  tasks.forEach((task) => {
    let hasEmployeeStageCompletion = false;
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
      const durationMs = getStageDurationMs({ entry, fallbackStart: previousCompletedAt });
      previousCompletedAt = completedAt;

      const assignedGroupId = toEntityId(entry.assignedGroupId) || entry.stageGroupId;
      if (assignedGroupId) {
        const groupMeta = groupsById.get(assignedGroupId);
        const teamEntry = getOrCreatePerformanceEntry(
          teamPerformanceMap,
          assignedGroupId,
          entry.assignedGroupId?.name || groupMeta?.name || "Unknown Team"
        );
        teamEntry.totalTasks += 1;
        teamEntry.completedTasks += 1;
        teamEntry.totalCompletionMs += durationMs;
      }

      const stageOwnerId = toEntityId(entry.assignedTo) || toEntityId(entry.completedBy);
      if (stageOwnerId) {
        hasEmployeeStageCompletion = true;
        const userMeta = usersById.get(stageOwnerId);
        const employeeEntry = getOrCreatePerformanceEntry(
          employeePerformanceMap,
          stageOwnerId,
          entry.assignedTo?.name || entry.completedBy?.name || userMeta?.name || "Unknown User"
        );
        employeeEntry.totalTasks += 1;
        employeeEntry.completedTasks += 1;
        employeeEntry.totalCompletionMs += durationMs;
      }
    });

    const currentUserId = toEntityId(task.assignedTo);
    if (task.status === "done" && currentUserId && !hasEmployeeStageCompletion) {
      const userMeta = usersById.get(currentUserId);
      const employeeEntry = getOrCreatePerformanceEntry(
        employeePerformanceMap,
        currentUserId,
        task.assignedTo?.name || userMeta?.name || "Unknown User"
      );
      employeeEntry.totalTasks += 1;
      employeeEntry.completedTasks += 1;
      employeeEntry.totalCompletionMs += Math.max(
        0,
        new Date(task.updatedAt) - new Date(task.createdAt)
      );
    }

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

      if (currentUserId) {
        const userMeta = usersById.get(currentUserId);
        const employeeEntry = getOrCreatePerformanceEntry(
          employeePerformanceMap,
          currentUserId,
          task.assignedTo?.name || userMeta?.name || "Unknown User"
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

const buildTasksCreatedSeries = ({ tasks, lookbackDays }) => {
  const buckets = buildDailyBuckets({ lookbackDays });
  const bucketMap = new Map(buckets.map((bucket) => [bucket.date, bucket]));

  tasks.forEach((task) => {
    const key = toDateKey(task.createdAt);
    const bucket = bucketMap.get(key);
    if (bucket) bucket.count += 1;
  });

  return buckets.map(({ date, count }) => ({ date, count }));
};

const buildTasksCompletedSeries = ({ tasks, lookbackDays }) => {
  const buckets = buildDailyBuckets({ lookbackDays });
  const bucketMap = new Map(buckets.map((bucket) => [bucket.date, bucket]));

  tasks.forEach((task) => {
    if (task.status !== "done") return;
    const completedAt =
      [...(task.completedStages || [])]
        .map((entry) => entry.completedAt)
        .filter(Boolean)
        .sort((a, b) => new Date(b) - new Date(a))[0] || task.updatedAt;
    const key = toDateKey(completedAt);
    const bucket = bucketMap.get(key);
    if (!bucket) return;

    bucket.count += 1;
    bucket.completedCount += 1;
    bucket.totalCycleMs += Math.max(0, new Date(completedAt) - new Date(task.createdAt));
  });

  return buckets.map(({ date, count, completedCount, totalCycleMs }) => ({
    date,
    count,
    avgCycleHours:
      completedCount > 0
        ? Number((totalCycleMs / completedCount / (1000 * 60 * 60)).toFixed(1))
        : 0,
  }));
};

const buildBottleneckStages = ({ tasks }) => {
  const stageMap = new Map();

  tasks.forEach((task) => {
    const workflowStages = [...(task.workflowId?.stages || [])].sort((a, b) => a.order - b.order);
    const stageDetailsByName = new Map(
      workflowStages.map((stage) => [
        String(stage.name || "").trim().toLowerCase(),
        { order: stage.order, workflowName: task.workflowId?.name || "Workflow" },
      ])
    );

    let previousCompletedAt = new Date(task.createdAt);
    [...(task.completedStages || [])]
      .map((entry) => {
        const details = stageDetailsByName.get(String(entry.stageName || "").trim().toLowerCase());
        return { ...entry, stageOrder: details?.order ?? Number.MAX_SAFE_INTEGER, workflowName: details?.workflowName || task.workflowId?.name || "Workflow" };
      })
      .sort((a, b) => {
        if (a.stageOrder !== b.stageOrder) return a.stageOrder - b.stageOrder;
        return new Date(a.completedAt) - new Date(b.completedAt);
      })
      .forEach((entry) => {
        const durationMs = getStageDurationMs({ entry, fallbackStart: previousCompletedAt });
        previousCompletedAt = new Date(entry.completedAt);
        const key = `${task.workflowId?._id || "standalone"}:${entry.stageName}`;
        const existing = stageMap.get(key) || {
          stageName: entry.stageName || "Unstaged",
          workflowName: entry.workflowName,
          taskCount: 0,
          totalWaitMs: 0,
        };
        existing.taskCount += 1;
        existing.totalWaitMs += durationMs;
        stageMap.set(key, existing);
      });

    if (task.status !== "done" && task.stageName && task.workflowId) {
      const key = `${task.workflowId?._id || "standalone"}:${task.stageName}`;
      const existing = stageMap.get(key) || {
        stageName: task.stageName,
        workflowName: task.workflowId?.name || "Workflow",
        taskCount: 0,
        totalWaitMs: 0,
      };
      existing.taskCount += 1;
      existing.totalWaitMs += Math.max(0, new Date() - previousCompletedAt);
      stageMap.set(key, existing);
    }
  });

  return Array.from(stageMap.values())
    .map((entry) => ({
      stageName: entry.stageName,
      workflowName: entry.workflowName,
      taskCount: entry.taskCount,
      avgWaitHours:
        entry.taskCount > 0
          ? Number((entry.totalWaitMs / entry.taskCount / (1000 * 60 * 60)).toFixed(1))
          : 0,
    }))
    .filter((entry) => entry.taskCount > 0)
    .sort((a, b) => {
      if (b.avgWaitHours !== a.avgWaitHours) return b.avgWaitHours - a.avgWaitHours;
      if (b.taskCount !== a.taskCount) return b.taskCount - a.taskCount;
      return a.stageName.localeCompare(b.stageName);
    })
    .slice(0, 8);
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
    activeUsers,
    workflowStatusCounts,
    workflowsForStatusCards,
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
      .populate("completedStages.assignedTo", "name")
      .populate("completedStages.assignedGroupId", "name")
      .populate("completedStages.completedBy", "name"),
    User.find({ organizationId, isActive: true }).select("name"),
    Task.aggregate([
      { $match: { organizationId, workflowId: { $ne: null } } },
      {
        $group: {
          _id: {
            workflowId: "$workflowId",
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
    ]),
    Workflow.find({ organizationId }).select("name isActive"),
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
    users: activeUsers,
  });
  const tasksCreatedSeries = buildTasksCreatedSeries({
    tasks: tasksForContributionMetrics,
    lookbackDays,
  });
  const tasksCompletedSeries = buildTasksCompletedSeries({
    tasks: tasksForContributionMetrics,
    lookbackDays,
  });
  const bottleneckStages = buildBottleneckStages({ tasks: tasksForContributionMetrics });

  const workflowStatusCountMap = workflowStatusCounts.reduce((acc, entry) => {
    const workflowId = String(entry._id.workflowId);
    const existing = acc.get(workflowId) || {};
    existing[entry._id.status] = entry.count;
    acc.set(workflowId, existing);
    return acc;
  }, new Map());

  const workflowStatusCards = workflowsForStatusCards
    .map((workflow) => {
      const statusCounts = workflowStatusCountMap.get(String(workflow._id)) || {};
      const statuses = TASK_STATUS_LIST.map((status) => ({
        status,
        count: statusCounts[status] || 0,
      }));

      return {
        workflowId: workflow._id,
        name: workflow.name,
        isActive: workflow.isActive,
        totalTasks: statuses.reduce((sum, entry) => sum + entry.count, 0),
        statuses,
      };
    })
    .sort((a, b) => {
      if (b.totalTasks !== a.totalTasks) return b.totalTasks - a.totalTasks;
      return a.name.localeCompare(b.name);
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
      tasksCreatedSeries,
      tasksCompletedSeries,
      bottleneckStages,
      teamPerformance,
      employeePerformance,
      workflowStatusCards,
      recentTasks,
    },
  };
};

export default {
  getAnalyticsSummaryService,
};
