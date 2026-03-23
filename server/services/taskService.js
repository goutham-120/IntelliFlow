import Task from "../models/Task.js";
import { emitTaskNotification } from "./notificationService.js";
import {
  buildTaskQuery,
  canRequesterCompleteStage,
  canRequesterManualAssign,
  createServiceError,
  ensureActiveGroupMember,
  ensureGroupInOrg,
  ensureTaskInOrg,
  ensureUserInOrg,
  ensureWorkflowInOrg,
  notifyTaskReachedGroupStage,
  resolveWorkflowStage,
  selectLeastLoadedGroupMember,
} from "./taskService.helpers.js";

export const createTaskService = async ({
  organizationId,
  requesterId,
  requesterRole,
  title,
  status = "pending",
  workflowId = null,
  stageName,
  assignedGroupId = null,
  assignedTo = null,
}) => {
  const taskData = {
    organizationId,
    title,
    status,
    workflowId: null,
    stageName: "",
    assignedGroupId: null,
    assignedTo: null,
  };

  if (workflowId) {
    const workflow = await ensureWorkflowInOrg({ organizationId, workflowId });
    const matchedStage = resolveWorkflowStage({ workflow, stageName });

    taskData.workflowId = workflow._id;
    taskData.stageName = matchedStage.name;
    taskData.assignedGroupId = matchedStage.groupId;
  } else if (assignedGroupId) {
    await ensureGroupInOrg({ organizationId, groupId: assignedGroupId });
    taskData.assignedGroupId = assignedGroupId;
  }

  if (assignedTo) {
    await ensureUserInOrg({ organizationId, userId: assignedTo });
    if (taskData.assignedGroupId) {
      const canAssign = await canRequesterManualAssign({
        organizationId,
        requesterId,
        requesterRole,
        groupId: taskData.assignedGroupId,
      });
      if (!canAssign) {
        throw createServiceError(403, "Only admin or current group admin can manually assign");
      }
      await ensureActiveGroupMember({
        organizationId,
        groupId: taskData.assignedGroupId,
        userId: assignedTo,
      });
    } else if (requesterRole !== "admin") {
      throw createServiceError(403, "Only admin can assign users to ungrouped tasks");
    }
    taskData.assignedTo = assignedTo;
  } else if (taskData.assignedGroupId) {
    const selectedMember = await selectLeastLoadedGroupMember({
      organizationId,
      groupId: taskData.assignedGroupId,
    });
    taskData.assignedTo = selectedMember.userId._id;
  }

  const task = await Task.create(taskData);

  if (task.assignedGroupId) {
    await notifyTaskReachedGroupStage({
      task,
      stageName: task.stageName || "Unstaged",
      groupId: task.assignedGroupId,
      assigneeId: task.assignedTo,
    });
  }

  return {
    status: 201,
    payload: {
      message: "Task created successfully",
      task,
    },
  };
};

export const getTasksService = async ({
  organizationId,
  status,
  workflowId,
  assignedTo,
  onlyMine = false,
  userId,
}) => {
  const query = buildTaskQuery({
    organizationId,
    status,
    workflowId,
    assignedTo,
    onlyMine,
    userId,
  });

  const tasks = await Task.find(query)
    .sort({ createdAt: -1 })
    .populate("workflowId", "name isActive")
    .populate("assignedGroupId", "name code")
    .populate("assignedTo", "name email role isActive");

  return {
    status: 200,
    payload: tasks,
  };
};

export const getTaskByIdService = async ({ organizationId, taskId }) => {
  const task = await Task.findOne({ _id: taskId, organizationId })
    .populate("workflowId", "name stages isActive")
    .populate("assignedGroupId", "name code description isActive")
    .populate("assignedTo", "name email role isActive");

  if (!task) {
    throw createServiceError(404, "Task not found");
  }

  return {
    status: 200,
    payload: task,
  };
};

export const updateTaskService = async ({
  organizationId,
  requesterId,
  requesterRole,
  taskId,
  title,
  status,
  workflowId,
  stageName,
  assignedGroupId,
  assignedTo,
}) => {
  const task = await ensureTaskInOrg({ organizationId, taskId });
  const previousAssignedGroupId = task.assignedGroupId ? String(task.assignedGroupId) : null;
  const previousStageName = task.stageName;

  if (title !== undefined) task.title = title;
  if (status !== undefined) task.status = status;

  const nextWorkflowId = workflowId !== undefined ? workflowId : task.workflowId;

  if (nextWorkflowId) {
    const workflow = await ensureWorkflowInOrg({ organizationId, workflowId: nextWorkflowId });
    const nextStageName = stageName !== undefined ? stageName : task.stageName;
    const matchedStage = resolveWorkflowStage({
      workflow,
      stageName: nextStageName || undefined,
    });

    task.workflowId = workflow._id;
    task.stageName = matchedStage.name;
    task.assignedGroupId = matchedStage.groupId;
  } else if (workflowId !== undefined && workflowId === null) {
    task.workflowId = null;
    task.stageName = "";
    if (assignedGroupId === undefined) {
      task.assignedGroupId = null;
    }
  } else if (assignedGroupId !== undefined) {
    if (assignedGroupId === null) {
      task.assignedGroupId = null;
    } else {
      await ensureGroupInOrg({ organizationId, groupId: assignedGroupId });
      task.assignedGroupId = assignedGroupId;
    }
  }

  if (stageName !== undefined && !nextWorkflowId) {
    throw createServiceError(400, "stageName can be updated only when workflow is attached");
  }

  if (assignedTo !== undefined) {
    const canAssign = await canRequesterManualAssign({
      organizationId,
      requesterId,
      requesterRole,
      groupId: task.assignedGroupId,
    });
    if (!canAssign) {
      throw createServiceError(403, "Only admin or current group admin can manually assign");
    }

    if (assignedTo === null) {
      task.assignedTo = null;
    } else {
      await ensureUserInOrg({ organizationId, userId: assignedTo });
      if (task.assignedGroupId) {
        await ensureActiveGroupMember({
          organizationId,
          groupId: task.assignedGroupId,
          userId: assignedTo,
        });
      }
      task.assignedTo = assignedTo;
    }
  } else {
    const currentAssignedGroupId = task.assignedGroupId ? String(task.assignedGroupId) : null;
    const groupChanged = currentAssignedGroupId !== previousAssignedGroupId;
    if (task.assignedGroupId && (groupChanged || !task.assignedTo)) {
      const selectedMember = await selectLeastLoadedGroupMember({
        organizationId,
        groupId: task.assignedGroupId,
      });
      task.assignedTo = selectedMember.userId._id;
    }
    if (!task.assignedGroupId && groupChanged) {
      task.assignedTo = null;
    }
  }

  await task.save();

  const currentAssignedGroupId = task.assignedGroupId ? String(task.assignedGroupId) : null;
  const groupChanged = currentAssignedGroupId !== previousAssignedGroupId;
  const stageChanged = task.stageName !== previousStageName;
  if (task.assignedGroupId && (groupChanged || stageChanged)) {
    await notifyTaskReachedGroupStage({
      task,
      stageName: task.stageName || "Unstaged",
      groupId: task.assignedGroupId,
      assigneeId: task.assignedTo,
    });
  }

  return {
    status: 200,
    payload: {
      message: "Task updated successfully",
      task,
    },
  };
};

export const deleteTaskService = async ({ organizationId, taskId }) => {
  const deleted = await Task.findOneAndDelete({ _id: taskId, organizationId });
  if (!deleted) {
    throw createServiceError(404, "Task not found");
  }

  return {
    status: 200,
    payload: {
      message: "Task deleted successfully",
    },
  };
};

export const completeTaskStageService = async ({
  organizationId,
  requesterId,
  requesterRole,
  taskId,
}) => {
  const task = await ensureTaskInOrg({ organizationId, taskId });

  if (!task.workflowId) {
    throw createServiceError(400, "Stage completion is available only for workflow tasks");
  }
  if (task.status === "done") {
    throw createServiceError(400, "Task is already completed");
  }

  const workflow = await ensureWorkflowInOrg({ organizationId, workflowId: task.workflowId });
  const stages = [...(workflow.stages || [])].sort((a, b) => a.order - b.order);
  if (!stages.length) {
    throw createServiceError(400, "Workflow has no stages");
  }

  const currentStageIndex = stages.findIndex(
    (stage) => stage.name.toLowerCase() === String(task.stageName || "").toLowerCase()
  );
  if (currentStageIndex < 0) {
    throw createServiceError(400, "Current task stage is invalid for this workflow");
  }

  const canComplete = await canRequesterCompleteStage({
    organizationId,
    requesterId,
    requesterRole,
    assignedGroupId: task.assignedGroupId,
    assignedTo: task.assignedTo,
  });
  if (!canComplete) {
    throw createServiceError(
      403,
      "Only assignee, group admin, supervisor, or admin can complete this stage"
    );
  }

  const currentStage = stages[currentStageIndex];
  const completionEntry = {
    stageName: currentStage.name,
    completedBy: requesterId,
    completedAt: new Date(),
  };

  const alreadyRecorded = (task.completedStages || []).some(
    (entry) => entry.stageName.toLowerCase() === currentStage.name.toLowerCase()
  );
  if (!alreadyRecorded) {
    task.completedStages.push(completionEntry);
  }

  const nextStage = stages[currentStageIndex + 1];
  if (!nextStage) {
    task.status = "done";
    await task.save();

    await emitTaskNotification({
      organizationId: task.organizationId,
      taskId: task._id,
      type: "task_completed",
      recipientUserIds: task.assignedTo ? [task.assignedTo] : [],
      message: `Task "${task.title}" has been completed`,
    });

    return {
      status: 200,
      payload: {
        message: "Final stage completed. Task marked as done",
        task,
      },
    };
  }

  task.stageName = nextStage.name;
  task.assignedGroupId = nextStage.groupId;
  const selectedMember = await selectLeastLoadedGroupMember({
    organizationId,
    groupId: nextStage.groupId,
  });
  task.assignedTo = selectedMember.userId._id;
  task.status = "in_progress";
  await task.save();

  await notifyTaskReachedGroupStage({
    task,
    stageName: nextStage.name,
    groupId: nextStage.groupId,
    assigneeId: task.assignedTo,
  });

  return {
    status: 200,
    payload: {
      message: "Stage completed and task moved to next stage",
      task,
    },
  };
};
