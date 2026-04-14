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

const buildPerformancePipeline = ({ matchStage, lookupStage, nameField, limit }) => [
  { $match: matchStage },
  lookupStage,
  {
    $project: {
      ownerName: {
        $ifNull: [{ $arrayElemAt: [nameField, 0] }, "Unassigned"],
      },
      status: 1,
      createdAt: 1,
      updatedAt: 1,
    },
  },
  {
    $group: {
      _id: "$ownerName",
      totalTasks: { $sum: 1 },
      completedTasks: {
        $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] },
      },
      activeTasks: {
        $sum: {
          $cond: [{ $in: ["$status", ACTIVE_TASK_STATUSES] }, 1, 0],
        },
      },
      blockedTasks: {
        $sum: { $cond: [{ $eq: ["$status", "blocked"] }, 1, 0] },
      },
      totalCompletionMs: {
        $sum: {
          $cond: [
            { $eq: ["$status", "done"] },
            { $subtract: ["$updatedAt", "$createdAt"] },
            0,
          ],
        },
      },
    },
  },
  {
    $addFields: {
      completionRate: {
        $cond: [
          { $eq: ["$totalTasks", 0] },
          0,
          { $multiply: [{ $divide: ["$completedTasks", "$totalTasks"] }, 100] },
        ],
      },
      avgCompletionHours: {
        $cond: [
          { $eq: ["$completedTasks", 0] },
          0,
          {
            $divide: [
              { $divide: ["$totalCompletionMs", "$completedTasks"] },
              1000 * 60 * 60,
            ],
          },
        ],
      },
    },
  },
  { $sort: { completionRate: -1, completedTasks: -1, totalTasks: -1, _id: 1 } },
  { $limit: limit },
];

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
    recentTasks,
    teamPerformance,
    employeePerformance,
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
    Task.find({ organizationId, createdAt: { $gte: createdAfter } })
      .select("title status stageName createdAt updatedAt")
      .sort({ createdAt: -1 })
      .limit(8),
    Task.aggregate(
      buildPerformancePipeline({
        matchStage: { organizationId, assignedGroupId: { $ne: null } },
        lookupStage: {
          $lookup: {
            from: "groups",
            localField: "assignedGroupId",
            foreignField: "_id",
            as: "owner",
          },
        },
        nameField: "$owner.name",
        limit: 8,
      })
    ),
    Task.aggregate(
      buildPerformancePipeline({
        matchStage: { organizationId, assignedTo: { $ne: null } },
        lookupStage: {
          $lookup: {
            from: "users",
            localField: "assignedTo",
            foreignField: "_id",
            as: "owner",
          },
        },
        nameField: "$owner.name",
        limit: 10,
      })
    ),
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
        label: entry._id,
        value: entry.totalTasks,
      })),
      employeeLoadData: employeePerformance.map((entry) => ({
        label: entry._id,
        value: entry.totalTasks,
      })),
      teamPerformance: teamPerformance.map((entry) => ({
        name: entry._id,
        totalTasks: entry.totalTasks,
        completedTasks: entry.completedTasks,
        activeTasks: entry.activeTasks,
        blockedTasks: entry.blockedTasks,
        completionRate: Number(entry.completionRate?.toFixed(1) || 0),
        avgCompletionHours: Number(entry.avgCompletionHours?.toFixed(1) || 0),
      })),
      employeePerformance: employeePerformance.map((entry) => ({
        name: entry._id,
        totalTasks: entry.totalTasks,
        completedTasks: entry.completedTasks,
        activeTasks: entry.activeTasks,
        blockedTasks: entry.blockedTasks,
        completionRate: Number(entry.completionRate?.toFixed(1) || 0),
        avgCompletionHours: Number(entry.avgCompletionHours?.toFixed(1) || 0),
      })),
      recentTasks,
    },
  };
};

export default {
  getAnalyticsSummaryService,
};
