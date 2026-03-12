import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Bell, Trash2, Check, CheckCheck, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, loading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notificationId: string, read: boolean) => {
    if (!read) {
      await markAsRead(notificationId);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'worker_assigned':
        return '👷';
      case 'job_started':
        return '🚀';
      case 'job_completed':
        return '✅';
      case 'payment_received':
        return '💳';
      case 'payment_failed':
        return '❌';
      case 'cancelled':
        return '⛔';
      case 'pre_arrival':
        return '⏰';
      case 'review_request':
        return '⭐';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'worker_assigned':
        return 'bg-blue-50 border-l-4 border-blue-500';
      case 'job_started':
        return 'bg-purple-50 border-l-4 border-purple-500';
      case 'job_completed':
        return 'bg-green-50 border-l-4 border-green-500';
      case 'payment_received':
        return 'bg-green-50 border-l-4 border-green-500';
      case 'payment_failed':
        return 'bg-red-50 border-l-4 border-red-500';
      case 'cancelled':
        return 'bg-red-50 border-l-4 border-red-500';
      case 'pre_arrival':
        return 'bg-yellow-50 border-l-4 border-yellow-500';
      case 'review_request':
        return 'bg-indigo-50 border-l-4 border-indigo-500';
      default:
        return 'bg-gray-50 border-l-4 border-gray-500';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs p-0">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition text-white"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin inline-block w-6 h-6 border-3 border-red-200 border-t-red-600 rounded-full"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id, notification.read)}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition ${
                    !notification.read ? 'bg-blue-50' : ''
                  } ${getNotificationColor(notification.type)}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900 text-sm">{notification.title}</h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-gray-700 text-sm mt-1 line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Additional Data Display */}
                  {notification.data && notification.type === 'worker_assigned' && (
                    <div className="mt-3 bg-white/50 rounded-lg p-3 space-y-2">
                      {notification.data.worker_photo && (
                        <div className="flex items-center gap-2">
                          <img
                            src={notification.data.worker_photo}
                            alt={notification.data.worker_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">{notification.data.worker_name}</p>
                            <p className="text-xs text-gray-600">
                              ⭐ {notification.data.worker_rating} • {notification.data.verification_status}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="bg-gray-50 p-3 border-t border-gray-200 text-center">
              <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
