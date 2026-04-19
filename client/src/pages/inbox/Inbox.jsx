import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  fetchInboxNotifications,
  INBOX_UPDATED_EVENT,
  markAllInboxNotificationsRead,
  markInboxNotificationRead,
} from "../../services/notificationService";
import ToggleButton from "../../components/common/ToggleButton";

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

  useEffect(() => {
    const handleInboxUpdated = () => {
      loadNotifications(true);
    };

    window.addEventListener(INBOX_UPDATED_EVENT, handleInboxUpdated);
    return () => {
      window.removeEventListener(INBOX_UPDATED_EVENT, handleInboxUpdated);
    };
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
      <div className="rounded-[32px] border border-slate-800/90 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.14),transparent_28%),radial-gradient(circle_at_right,rgba(56,189,248,0.12),transparent_22%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(17,24,39,0.84))] p-6 shadow-[0_24px_60px_rgba(2,6,23,0.28)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-200/80">
              Message Center
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white">Inbox</h1>
            <p className="text-sm text-slate-300">
              Task alerts, team-stage assignments, and read-state control from one place.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => loadNotifications(true)}
              disabled={refreshing}
              className="rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:bg-slate-900 disabled:opacity-60"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={markingAll || !notifications.some((item) => !item.isRead)}
              className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-500/16 disabled:opacity-60"
            >
              {markingAll ? "Marking..." : "Mark All Read"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-500/12 p-3 text-rose-200">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/12 p-3 text-emerald-200">
          {success}
        </div>
      )}

      <section className="rounded-[28px] border border-slate-800/90 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(17,24,39,0.8))] p-4 shadow-[0_18px_45px_rgba(2,6,23,0.26)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-200">
              Filters
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Narrow the feed without dropping context.
            </p>
          </div>
          <ToggleButton
            pressed={unreadOnly}
            onPressedChange={setUnreadOnly}
            label="Unread Only"
            description="Show only notifications that still need action."
          />
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-800/90 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(17,24,39,0.8))] shadow-[0_18px_45px_rgba(2,6,23,0.26)]">
        {loading ? (
          <div className="p-6 text-slate-400">Loading inbox...</div>
        ) : !notifications.length ? (
          <div className="p-6 text-slate-400">No notifications found.</div>
        ) : (
          <div className="divide-y divide-slate-800/90">
            {notifications.map((notification) => (
              <article
                key={notification._id}
                className={`p-4 transition ${
                  notification.isRead
                    ? "bg-slate-950/35"
                    : "bg-[linear-gradient(90deg,rgba(13,148,136,0.14),rgba(15,23,42,0.18))]"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${notification.isRead ? "text-slate-300" : "text-white"}`}>
                      {notification.message}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
                      <span className="rounded-xl border border-slate-700 bg-slate-900/70 px-2 py-1">
                        Type: {notification.type}
                      </span>
                      <span className="rounded-xl border border-slate-700 bg-slate-900/70 px-2 py-1">
                        Time: {formatNotificationTime(notification.createdAt)}
                      </span>
                      {notification.taskId?.title && (
                        <span className="rounded-xl border border-slate-700 bg-slate-900/70 px-2 py-1">
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
                        className="rounded-xl border border-sky-400/20 bg-sky-500/10 px-3 py-1.5 text-xs text-sky-200 transition hover:bg-sky-500/16"
                      >
                        Open Task
                      </button>
                    )}
                    {!notification.isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(notification._id)}
                        disabled={busyId === notification._id}
                        className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-200 transition hover:bg-emerald-500/16 disabled:opacity-60"
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
