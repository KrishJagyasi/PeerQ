import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import NotificationItem from './NotificationItem';
import { Bell, Loader, AlertCircle, CheckCircle, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const NotificationList = ({ 
  showUnreadOnly = false, 
  onNotificationClick,
  className = "",
  maxHeight = "max-h-96"
}) => {
  const { user } = useAuth();
  const { unreadCount, setUnreadCount } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    hasNext: false,
    hasPrev: false
  });
  const [filters, setFilters] = useState({
    type: '',
    page: 1,
    limit: 20
  });

  const fetchNotifications = async (page = 1, type = '') => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: filters.limit.toString()
      });
      
      if (type) {
        params.append('type', type);
      }

      const response = await axios.get(`/api/notifications?${params}`);
      
      if (page === 1) {
        setNotifications(response.data.notifications);
      } else {
        setNotifications(prev => [...prev, ...response.data.notifications]);
      }
      
      setPagination(response.data.pagination);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setError('Failed to load notifications');
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/read`);
      
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      if (onNotificationClick) {
        onNotificationClick(notificationId);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/read-all');
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
      
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleFilterChange = (newType) => {
    const newFilters = { ...filters, type: newType, page: 1 };
    setFilters(newFilters);
    fetchNotifications(1, newType);
  };

  const loadMore = () => {
    if (pagination.hasNext && !loading) {
      const nextPage = pagination.current + 1;
      fetchNotifications(nextPage, filters.type);
    }
  };

  useEffect(() => {
    fetchNotifications(1, filters.type);
  }, [user]);

  const filteredNotifications = showUnreadOnly 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  if (error) {
    return (
      <div className={`p-4 text-center ${className}`}>
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-sm text-text-muted">{error}</p>
        <button
          onClick={() => fetchNotifications(1, filters.type)}
          className="mt-2 text-sm text-primary hover:text-primary-dark"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="p-4 border-b border-surface-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-text-primary" />
            <h3 className="text-lg font-semibold text-text-primary">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary text-white">
                  {unreadCount}
                </span>
              )}
            </h3>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center space-x-1 text-xs text-primary hover:text-primary-dark transition-colors"
              title="Mark all as read"
            >
              <CheckCircle className="h-3 w-3" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="mt-3 flex items-center space-x-2">
          <Filter className="h-4 w-4 text-text-muted" />
          <div className="flex space-x-1">
            {['', 'info', 'discount', 'answer', 'comment', 'mention', 'vote', 'accept'].map((type) => (
              <button
                key={type}
                onClick={() => handleFilterChange(type)}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  filters.type === type
                    ? 'bg-primary text-white'
                    : 'bg-background-secondary text-text-muted hover:text-text-primary'
                }`}
              >
                {type || 'All'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className={`overflow-y-auto ${maxHeight}`}>
        {loading && notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Loader className="h-8 w-8 text-primary animate-spin mx-auto mb-2" />
            <p className="text-sm text-text-muted">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <>
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onMarkAsRead={markAsRead}
                isRead={notification.isRead}
              />
            ))}
            
            {/* Load More */}
            {pagination.hasNext && (
              <div className="p-4 text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-4 py-2 text-sm text-primary hover:text-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    'Load more'
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center">
            <Bell className="h-8 w-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-muted">
              {showUnreadOnly ? 'No unread notifications' : 'No notifications'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList; 