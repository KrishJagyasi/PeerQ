import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import NotificationList from '../components/NotificationList';
import { Bell, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Notifications = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <Bell className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-primary mb-2">Notifications</h1>
          <p className="text-text-muted mb-6">Please log in to view your notifications.</p>
          <Link
            to="/login"
            className="btn btn-primary"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              to="/"
              className="flex items-center space-x-2 text-text-muted hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-3">
            <Bell className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Notifications</h1>
              <p className="text-text-muted">Stay updated with your latest activities and announcements</p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-surface rounded-lg border border-surface-border shadow-sm">
          <NotificationList 
            showUnreadOnly={false}
            className=""
            maxHeight="max-h-[70vh]"
          />
        </div>
      </div>
    </div>
  );
};

export default Notifications; 