import Notification from "../models/Notification.js";
import Task from "../models/Task.js";
import Workflow from "../models/Workflow.js";
import Group from "../models/Group.js";
import User from "../models/User.js";
import { ACTIVE_TASK_STATUSES, TASK_STATUS_LIST } from "../constants/taskStatus.js";

// ─── Utilities ────────────────────────────────────────────────────────────────

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

const toEntityId = (value) => {
  if (!value) return "";
  if (value._id) return String(value._id);
  return String(value);
};

const finalizePerformanceEntries = (entries) => {
  const mapped = entries.map((entry) => ({
    name: entry.name,
    totalTasks: entry.totalTasks,
    completedTasks: entry.completedTasks,
    activeTasks: entry.activeTasks,
    blockedTasks: entry.blockedTasks,
    completionRate:
      entry.totalTasks > 0
        ? Number(((entry.completedTasks / entry.totalTasks) * 100).toFixed(1))
        : 0,
    avgCompletionHours:
      entry.completedTasks > 0
        ? Number(
            (entry.totalCompletionMs / entry.completedTasks / (1000 * 60 * 60)).toFixed(1)
          )
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

// ─── Performance Metrics (unchanged) ─────────────────────────────────────────

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
    (users || []).map((user) => [
      String(user._id),
      createPerformanceEntry(user.name || "Unknown User"),
    ])
  );

  tasks.forEach((task) => {
    let hasEmployeeStageCompletion = false;
    const workflowStages = [...(task.workflowId?.stages || [])].sort(
      (a, b) => a.order - b.order
    );
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

      const completedById = toEntityId(entry.completedBy);
      if (completedById) {
        hasEmployeeStageCompletion = true;
        const userMeta = usersById.get(completedById);
        const employeeEntry = getOrCreatePerformanceEntry(
          employeePerformanceMap,
          completedById,
          entry.completedBy?.name || userMeta?.name || "Unknown User"
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
      const currentGroupId = task.assignedGroupId?._id
        ? String(task.assignedGroupId._id)
        : "";
      if (currentGroupId) {
        const groupMeta = groupsById.get(currentGroupId);
        const teamEntry = getOrCreatePerformanceEntry(
          teamPerformanceMap,
          currentGroupId,
          groupMeta?.name || task.assignedGroupId?.name || "Unknown Team"
        );
        teamEntry.totalTasks += 1;
        teamEntry.activeTasks += 1;
        if (task.status === "blocked") teamEntry.blockedTasks += 1;
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
        if (task.status === "blocked") employeeEntry.blockedTasks += 1;
      }
    }
  });

  return {
    teamPerformance: finalizePerformanceEntries(Array.from(teamPerformanceMap.values())),
    employeePerformance: finalizePerformanceEntries(
      Array.from(employeePerformanceMap.values())
    ),
  };
};

// ─── NEW: Time-series helpers ─────────────────────────────────────────────────

/**
 * Fills in every date between start and end (inclusive) so the chart
 * never has gaps for days with zero activity.
 */
const buildDateRange = (startDate, endDate) => {
  const dates = [];
  const cursor = new Date(startDate);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10)); // "YYYY-MM-DD"
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
};

/**
 * Tasks created per day over the lookback window.
 * Returns [{ date: "YYYY-MM-DD", count: N }, ...]
 */
const getTasksCreatedTimeSeries = async ({ organizationId, createdAfter }) => {
  const rows = await Task.aggregate([
    { $match: { organizationId, createdAt: { $gte: createdAfter } } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const byDate = new Map(rows.map((r) => [r._id, r.count]));
  const dates = buildDateRange(createdAfter, new Date());

  return dates.map((date) => ({ date, count: byDate.get(date) || 0 }));
};

/**
 * Tasks completed per day + average cycle time (hours) per day.
 * "Completed" = a completedStages entry whose completedAt falls in the window.
 * Cycle time = completedAt of that stage entry minus task.createdAt.
 * Returns [{ date: "YYYY-MM-DD", count: N, avgCycleHours: N }, ...]
 */
const getTasksCompletedTimeSeries = async ({ organizationId, createdAfter }) => {
  const rows = await Task.aggregate([
    // Only tasks that have at least one completed stage in the window
    {
      $match: {
        organizationId,
        "completedStages.0": { $exists: true },
      },
    },
    // Unwind so each stage entry becomes its own document
    { $unwind: "$completedStages" },
    // Keep only stage completions within the lookback window
    {
      $match: {
        "completedStages.completedAt": { $gte: createdAfter },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$completedStages.completedAt" },
        },
        count: { $sum: 1 },
        // Average ms from task creation to this stage completion
        totalCycleMs: {
          $sum: {
            $subtract: ["$completedStages.completedAt", "$createdAt"],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const byDate = new Map(
    rows.map((r) => [
      r._id,
      {
        count: r.count,
        avgCycleHours: Number((r.totalCycleMs / r.count / (1000 * 60 * 60)).toFixed(2)),
      },
    ])
  );

  const dates = buildDateRange(createdAfter, new Date());

  return dates.map((date) => {
    const entry = byDate.get(date);
    return {
      date,
      count: entry?.count || 0,
      avgCycleHours: entry?.avgCycleHours || 0,
    };
  });
};

// ─── NEW: Bottleneck stages ───────────────────────────────────────────────────

/**
 * For every completed stage across all tasks, computes the wait time
 * (time spent in that stage = completedAt minus the previous stage's
 * completedAt, or task.createdAt for the first stage).
 *
 * Groups by stageName + workflowName, averages the wait, and returns
 * the top N slowest stages.
 *
 * Returns:
 * [
 *   {
 *     stageName: string,
 *     workflowName: string,
 *     avgWaitHours: number,
 *     taskCount: number,       // how many stage completions were measured
 *   },
 *   ...
 * ]
 */
const getBottleneckStages = async ({ organizationId, limit = 8 }) => {
  const rows = await Task.aggregate([
    // Only workflow tasks that have completed at least one stage
    {
      $match: {
        organizationId,
        workflowId: { $ne: null },
        "completedStages.0": { $exists: true },
      },
    },
    // Bring in workflow name + stage order list
    {
      $lookup: {
        from: "workflows",
        localField: "workflowId",
        foreignField: "_id",
        as: "workflow",
      },
    },
    { $unwind: { path: "$workflow", preserveNullAndEmpty: false } },
    // Sort completedStages by completedAt ascending so we can calculate deltas
    {
      $addFields: {
        completedStagesSorted: {
          $sortArray: { input: "$completedStages", sortBy: { completedAt: 1 } },
        },
      },
    },
    // Unwind with index so we know which entry is "first"
    {
      $unwind: {
        path: "$completedStagesSorted",
        includeArrayIndex: "stageIndex",
      },
    },
    // For each stage entry, attach the previous stage's completedAt
    // (or task.createdAt when stageIndex === 0)
    {
      $addFields: {
        prevCompletedAt: {
          $cond: [
            { $eq: ["$stageIndex", 0] },
            "$createdAt",
            {
              // Access the previous element in the sorted array
              $let: {
                vars: {
                  prevIdx: { $subtract: ["$stageIndex", 1] },
                },
                in: {
                  $getField: {
                    field: "completedAt",
                    input: {
                      $arrayElemAt: ["$completedStagesSorted", "$$prevIdx"],
                    },
                  },
                },
              },
            },
          ],
        },
      },
    },
    // Compute wait time in milliseconds (clamp to 0 to avoid negatives from
    // out-of-order timestamps)
    {
      $addFields: {
        waitMs: {
          $max: [
            0,
            {
              $subtract: [
                "$completedStagesSorted.completedAt",
                "$prevCompletedAt",
              ],
            },
          ],
        },
      },
    },
    // Group by stage name + workflow name
    {
      $group: {
        _id: {
          stageName: "$completedStagesSorted.stageName",
          workflowId: "$workflow._id",
          workflowName: "$workflow.name",
        },
        totalWaitMs: { $sum: "$waitMs" },
        taskCount: { $sum: 1 },
      },
    },
    // Compute average wait in hours
    {
      $addFields: {
        avgWaitHours: {
          $round: [
            { $divide: ["$totalWaitMs", { $multiply: ["$taskCount", 3600000] }] },
            2,
          ],
        },
      },
    },
    // Sort by slowest average first
    { $sort: { avgWaitHours: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        stageName: "$_id.stageName",
        workflowName: "$_id.workflowName",
        avgWaitHours: 1,
        taskCount: 1,
      },
    },
  ]);

  return rows;
};

// ─── Main service ─────────────────────────────────────────────────────────────

export const getAnalyticsSummaryService = async ({
  organizationId,
  lookbackDays = 14,
}) => {
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
    // ── NEW ──
    tasksCreatedSeries,
    tasksCompletedSeries,
    bottleneckStages,
  ] = await Promise.all([
    Task.aggregate([
      { $match: { organizationId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
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
    User.find({ organizationId, isActive: true }).select("name"),
    Task.aggregate([
      { $match: { organizationId, workflowId: { $ne: null } } },
      {
        $group: {
          _id: { workflowId: "$workflowId", status: "$status" },
          count: { $sum: 1 },
        },
      },
    ]),
    Workflow.find({ organizationId }).select("name isActive"),
    // ── NEW ──
    getTasksCreatedTimeSeries({ organizationId, createdAfter }),
    getTasksCompletedTimeSeries({ organizationId, createdAfter }),
    getBottleneckStages({ organizationId, limit: 8 }),
  ]);

  // ── existing derivations (unchanged) ──────────────────────────────────────

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
      teamPerformance,
      employeePerformance,
      workflowStatusCards,
      recentTasks,
      // ── NEW fields ──
      tasksCreatedSeries,    // [{ date, count }]
      tasksCompletedSeries,  // [{ date, count, avgCycleHours }]
      bottleneckStages,      // [{ stageName, workflowName, avgWaitHours, taskCount }]
    },
  };
};

export default { getAnalyticsSummaryService };