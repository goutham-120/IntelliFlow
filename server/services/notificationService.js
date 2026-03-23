import GroupMembership from "../models/GroupMembership.js";
import Notification from "../models/Notification.js";

const collectRecipientUserIds = async ({
  organizationId,
  recipientUserIds = [],
  recipientGroupId = null,
}) => {
  const uniqueRecipientIds = new Set(
    recipientUserIds.filter(Boolean).map((userId) => String(userId))
  );

  if (recipientGroupId) {
    const memberships = await GroupMembership.find({
      organizationId,
      groupId: recipientGroupId,
      isActive: true,
    }).select("userId");

    memberships.forEach((membership) => {
      if (membership.userId) {
        uniqueRecipientIds.add(String(membership.userId));
      }
    });
  }

  return [...uniqueRecipientIds];
};

export const emitTaskNotification = async ({
  organizationId,
  taskId,
  type,
  recipientUserIds = [],
  recipientGroupId = null,
  message,
}) => {
  const resolvedRecipientUserIds = await collectRecipientUserIds({
    organizationId,
    recipientUserIds,
    recipientGroupId,
  });

  if (!resolvedRecipientUserIds.length) return;

  const now = new Date();
  const entries = resolvedRecipientUserIds.map((recipientUserId) => ({
    organizationId,
    taskId: taskId || null,
    recipientUserId,
    type,
    message,
    isRead: false,
    readAt: null,
    createdAt: now,
    updatedAt: now,
  }));

  await Notification.insertMany(entries, { ordered: false });
};
