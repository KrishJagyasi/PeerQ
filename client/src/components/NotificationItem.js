import React from 'react';
import { Bell, Gift, Info, MessageSquare, ThumbsUp, User, CheckCircle } from 'lucide-react';

const NotificationItem = ({ notification, onMarkAsRead, isRead }) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'discount':
        return <Gift className="h-4 w-4 text-green-600" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
      case 'answer':
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-orange-600" />;
      case 'mention':
        return <User className="h-4 w-4 text-indigo-600" />;
      case 'vote':
        return <ThumbsUp className="h-4 w-4 text-yellow-600" />;
      case 'accept':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'discount':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'answer':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'comment':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'mention':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'vote':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accept':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div
      className={`p-4 border-b border-surface-border hover:bg-background-secondary cursor-pointer transition-colors ${
        !isRead ? 'bg-primary-light/10' : ''
      }`}
      onClick={() => onMarkAsRead(notification._id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onMarkAsRead(notification._id);
        }
      }}
      aria-label={`Mark notification as read: ${notification.title}`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={`text-sm font-medium ${!isRead ? 'text-text-primary' : 'text-text-secondary'}`}>
                {notification.title}
              </p>
              <p className="text-xs text-text-muted mt-1 line-clamp-2">
                {notification.message}
              </p>
              {notification.discountCode && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-xs font-medium text-green-800">
                    Discount Code: <span className="font-bold">{notification.discountCode}</span>
                  </p>
                </div>
              )}
            </div>
            
            <div className="ml-2 flex flex-col items-end space-y-1">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeBadgeColor(notification.type)}`}>
                {notification.type}
              </span>
              {!isRead && (
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-text-muted">
              {formatDate(notification.createdAt)}
            </p>
            {notification.createdBy && (
              <p className="text-xs text-text-muted">
                by {notification.createdBy.username}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem; 