import {
  completeTaskStageService,
  createTaskService,
  deleteTaskService,
  getTaskByIdService,
  getTasksService,
  updateTaskService,
} from "../services/taskService.js";

export const createTask = async (req, res) => {
  try {
    const result = await createTaskService({
      organizationId: req.user.organizationId,
      requesterId: req.user._id,
      requesterRole: req.user.role,
      ...req.body,
    });
    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error("Create Task Error:", error.message);
    res.status(error.status || 500).json({ message: error.message || "Server Error" });
  }
};

export const getTasks = async (req, res) => {
  try {
    const result = await getTasksService({
      organizationId: req.user.organizationId,
      status: req.query.status,
      workflowId: req.query.workflowId,
      assignedTo: req.query.assignedTo,
      onlyMine: req.query.onlyMine === "true",
      userId: req.user._id,
    });
    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error("Get Tasks Error:", error.message);
    res.status(error.status || 500).json({ message: error.message || "Server Error" });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const result = await getTaskByIdService({
      organizationId: req.user.organizationId,
      taskId: req.params.taskId,
    });
    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error("Get Task Error:", error.message);
    res.status(error.status || 500).json({ message: error.message || "Server Error" });
  }
};

export const updateTask = async (req, res) => {
  try {
    const result = await updateTaskService({
      organizationId: req.user.organizationId,
      requesterId: req.user._id,
      requesterRole: req.user.role,
      taskId: req.params.taskId,
      ...req.body,
    });
    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error("Update Task Error:", error.message);
    res.status(error.status || 500).json({ message: error.message || "Server Error" });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const result = await deleteTaskService({
      organizationId: req.user.organizationId,
      taskId: req.params.taskId,
    });
    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error("Delete Task Error:", error.message);
    res.status(error.status || 500).json({ message: error.message || "Server Error" });
  }
};

export const completeTaskStage = async (req, res) => {
  try {
    const result = await completeTaskStageService({
      organizationId: req.user.organizationId,
      requesterId: req.user._id,
      requesterRole: req.user.role,
      taskId: req.params.taskId,
    });
    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error("Complete Task Stage Error:", error.message);
    res.status(error.status || 500).json({ message: error.message || "Server Error" });
  }
};
