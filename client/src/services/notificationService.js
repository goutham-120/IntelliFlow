import api from "./api";

export const INBOX_UPDATED_EVENT = "inbox:updated";

export const emitInboxUpdated = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(INBOX_UPDATED_EVENT));
  }
};

export const fetchInboxNotifications = async (params = {}) => {
  const response = await api.get("/inbox", { params });
  return response.data;
};

export const fetchUnreadInboxCount = async () => {
  const response = await api.get("/inbox/unread-count");
  return response.data;
};

export const markInboxNotificationRead = async (notificationId) => {
  const response = await api.patch(`/inbox/${notificationId}/read`);
  emitInboxUpdated();
  return response.data;
};

export const markAllInboxNotificationsRead = async () => {
  const response = await api.patch("/inbox/read-all");
  emitInboxUpdated();
  return response.data;
};
