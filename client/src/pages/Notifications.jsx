import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Bell,
  CheckCheck,
  Check,
  Trash2,
  Calendar,
  FileText,
  AlertCircle,
  Filter,
} from 'lucide-react';

export const Notifications = () => {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [filterUnread, setFilterUnread] = useState(false);

  const displayedNotifications = filterUnread
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  const getIconForType = (type) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-4 h-4 text-teal-600" />;
      case 'session':
        return <FileText className="w-4 h-4 text-sage-600" />;
      case 'intake':
        return <CheckCheck className="w-4 h-4 text-indigo-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Notification Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time updates regarding appointment schedules, notes, and clinical events
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition self-start sm:self-auto shadow-xs"
          >
            <CheckCheck className="w-4 h-4 text-sage-600" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter tab */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterUnread(false)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            !filterUnread
              ? 'bg-sage-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilterUnread(true)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            filterUnread
              ? 'bg-sage-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* Notification items */}
      {loading ? (
        <LoadingSpinner text="Checking for updates..." />
      ) : displayedNotifications.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-soft">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No notifications</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {filterUnread
              ? 'You have caught up with all notifications.'
              : 'Notifications will appear here when appointments are scheduled or updated.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft divide-y divide-slate-100 overflow-hidden">
          {displayedNotifications.map((n) => (
            <div
              key={n._id}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition ${
                !n.isRead ? 'bg-sage-50/40' : 'hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-2.5 rounded-xl shrink-0 ${
                    !n.isRead ? 'bg-white shadow-xs border border-sage-200' : 'bg-slate-100'
                  }`}
                >
                  {getIconForType(n.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1.5 block">
                    {new Date(n.createdAt).toLocaleDateString()} at{' '}
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!n.isRead && (
                  <button
                    onClick={() => markAsRead(n._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-sage-700 hover:bg-white transition"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(n._id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
