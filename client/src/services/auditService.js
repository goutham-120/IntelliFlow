import { fetchGroups } from "./groupService";
import { fetchInboxNotifications } from "./notificationService";
import { fetchTasks } from "./taskService";
import { fetchUsers } from "./userService";
import { fetchWorkflows } from "./workflowService";

const buildEntry = ({ action, entityType, description, createdAt, actor, metadata = {} }, index) => ({
  id: `${entityType}-${action}-${index}`,
  action,
  entityType,
  description,
  createdAt,
  actor,
  metadata,
});

export const fetchAuditLogs = async () => {
  const [tasks, workflows, groups, users, notifications] = await Promise.all([
    fetchTasks(),
    fetchWorkflows(true),
    fetchGroups(),
    fetchUsers().catch(() => []),
    fetchInboxNotifications({ limit: 100 }),
  ]);

  const taskEntries = (Array.isArray(tasks) ? tasks : []).flatMap((task, index) => [
    buildEntry(
      {
        action: "task_created",
        entityType: "task",
        description: `Task "${task.title}" entered the system`,
        createdAt: task.createdAt,
        actor: task.assignedTo?.name || "System",
        metadata: { status: task.status, stageName: task.stageName || "Unstaged" },
      },
      index
    ),
    ...(task.updatedAt && task.updatedAt !== task.createdAt
      ? [
          buildEntry(
            {
              action: "task_updated",
              entityType: "task",
              description: `Task "${task.title}" was updated`,
              createdAt: task.updatedAt,
              actor: task.assignedTo?.name || "System",
              metadata: { status: task.status },
            },
            `${index}-updated`
          ),
        ]
      : []),
  ]);

  const workflowEntries = (Array.isArray(workflows) ? workflows : []).map((workflow, index) =>
    buildEntry(
      {
        action: "workflow_saved",
        entityType: "workflow",
        description: `Workflow "${workflow.name}" is available`,
        createdAt: workflow.updatedAt || workflow.createdAt,
        actor: "Admin",
        metadata: { stageCount: workflow.stages?.length || 0, isActive: workflow.isActive },
      },
      `workflow-${index}`
    )
  );

  const groupEntries = (Array.isArray(groups) ? groups : []).map((group, index) =>
    buildEntry(
      {
        action: "group_saved",
        entityType: "group",
        description: `Team "${group.name}" is configured`,
        createdAt: group.updatedAt || group.createdAt,
        actor: "Admin",
        metadata: { code: group.code, isActive: group.isActive },
      },
      `group-${index}`
    )
  );

  const userEntries = (Array.isArray(users) ? users : []).map((user, index) =>
    buildEntry(
      {
        action: "user_created",
        entityType: "user",
        description: `User "${user.name}" belongs to the organization`,
        createdAt: user.createdAt,
        actor: "Admin",
        metadata: { role: user.role, email: user.email },
      },
      `user-${index}`
    )
  );

  const notificationEntries = (Array.isArray(notifications) ? notifications : []).map(
    (notification, index) =>
      buildEntry(
        {
          action: notification.isRead ? "notification_read" : "notification_sent",
          entityType: "notification",
          description: notification.message,
          createdAt: notification.createdAt,
          actor: "System",
          metadata: { type: notification.type, isRead: notification.isRead },
        },
        `notification-${index}`
      )
  );

  return [...taskEntries, ...workflowEntries, ...groupEntries, ...userEntries, ...notificationEntries]
    .filter((entry) => entry.createdAt)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};
