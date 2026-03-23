import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  fetchInboxNotifications,
  markAllInboxNotificationsRead,
  markInboxNotificationRead,
} from "../../services/notificationService";

const formatNotificationTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

export default function Inbox() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [markingAll, setMarkingAll] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadNotifications = useCallback(
    async (showRefreshing = false) => {
      setError("");
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const data = await fetchInboxNotifications({
          unreadOnly,
          limit: 80,
        });
        setNotifications(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load inbox");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [unreadOnly]
  );

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = async (notificationId) => {
    setError("");
    setSuccess("");
    setBusyId(notificationId);
    try {
      await markInboxNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        )
      );
      setSuccess("Notification marked as read");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to mark notification as read");
    } finally {
      setBusyId("");
    }
  };

  const handleMarkAllRead = async () => {
    setError("");
    setSuccess("");
    setMarkingAll(true);
    try {
      const result = await markAllInboxNotificationsRead();
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
          readAt: notification.readAt || new Date().toISOString(),
        }))
      );
      setSuccess(result?.message || "All notifications marked as read");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to mark all notifications as read");
    } finally {
      setMarkingAll(false);
    }
  };

  const handleOpenTask = async (notification) => {
    if (!notification?.taskId?._id) return;
    if (!notification.isRead) {
      await handleMarkRead(notification._id);
    }
    navigate(`/tasks/${notification.taskId._id}`);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-white">Inbox</h1>
            <p className="text-sm text-slate-400">Task alerts and assignment updates.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => loadNotifications(true)}
              disabled={refreshing}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800/70 disabled:opacity-60"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={markingAll || !notifications.some((item) => !item.isRead)}
              className="rounded-xl border border-emerald-400/50 px-4 py-2 text-sm text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-60"
            >
              {markingAll ? "Marking..." : "Mark All Read"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/40 bg-red-500/20 p-3 text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/20 p-3 text-emerald-300">
          {success}
        </div>
      )}

      <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-4">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
            className="h-4 w-4 accent-emerald-400"
          />
          Show only unread notifications
        </label>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/50">
        {loading ? (
          <div className="p-6 text-slate-400">Loading inbox...</div>
        ) : !notifications.length ? (
          <div className="p-6 text-slate-400">No notifications found.</div>
        ) : (
          <div className="divide-y divide-slate-800">
            {notifications.map((notification) => (
              <article
                key={notification._id}
                className={`p-4 transition ${notification.isRead ? "bg-slate-950/30" : "bg-slate-950/70"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${notification.isRead ? "text-slate-300" : "text-white"}`}>
                      {notification.message}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
                      <span className="rounded-lg border border-slate-700 px-2 py-1">
                        Type: {notification.type}
                      </span>
                      <span className="rounded-lg border border-slate-700 px-2 py-1">
                        Time: {formatNotificationTime(notification.createdAt)}
                      </span>
                      {notification.taskId?.title && (
                        <span className="rounded-lg border border-slate-700 px-2 py-1">
                          Task: {notification.taskId.title}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {notification.taskId?._id && (
                      <button
                        type="button"
                        onClick={() => handleOpenTask(notification)}
                        className="rounded-lg border border-cyan-400/50 px-3 py-1.5 text-xs text-cyan-300 hover:bg-cyan-500/10"
                      >
                        Open Task
                      </button>
                    )}
                    {!notification.isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(notification._id)}
                        disabled={busyId === notification._id}
                        className="rounded-lg border border-emerald-400/50 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-60"
                      >
                        {busyId === notification._id ? "Marking..." : "Mark Read"}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
