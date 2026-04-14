import { createController } from "./controllerHandler.js";
import {
  completeTaskStageService,
  createTaskService,
  deleteTaskService,
  getTaskByIdService,
  getTasksService,
  updateTaskService,
} from "../services/taskService.js";

const withTaskRequester = (req) => ({
  organizationId: req.user.organizationId,
  requesterId: req.user._id,
  requesterRole: req.user.role,
});

export const createTask = createController("Create Task", createTaskService, (req) => ({
  ...withTaskRequester(req),
  ...req.body,
}));

export const getTasks = createController("Get Tasks", getTasksService, (req) => ({
  organizationId: req.user.organizationId,
  status: req.query.status,
  workflowId: req.query.workflowId,
  assignedTo: req.query.assignedTo,
  onlyMine: req.query.onlyMine === "true",
  userId: req.user._id,
}));

export const getTaskById = createController("Get Task", getTaskByIdService, (req) => ({
  organizationId: req.user.organizationId,
  taskId: req.params.taskId,
}));

export const updateTask = createController("Update Task", updateTaskService, (req) => ({
  ...withTaskRequester(req),
  taskId: req.params.taskId,
  ...req.body,
}));

export const deleteTask = createController("Delete Task", deleteTaskService, (req) => ({
  organizationId: req.user.organizationId,
  taskId: req.params.taskId,
}));

export const completeTaskStage = createController(
  "Complete Task Stage",
  completeTaskStageService,
  (req) => ({
    ...withTaskRequester(req),
    taskId: req.params.taskId,
  })
);
