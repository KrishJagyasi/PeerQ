import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminNotificationManager from '../components/AdminNotificationManager';
import { 
  Bell, 
  Users, 
  Settings, 
  BarChart3, 
  Shield, 
  AlertCircle,
  Home
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications');

  const adminTabs = [
    {
      id: 'notifications',
      name: 'Notifications',
      icon: Bell,
      component: AdminNotificationManager,
      description: 'Manage system notifications and user communications'
    },
    {
      id: 'users',
      name: 'User Management',
      icon: Users,
      component: null, // Placeholder for future implementation
      description: 'Manage user accounts and permissions'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: BarChart3,
      component: null, // Placeholder for future implementation
      description: 'View system analytics and reports'
    },
    {
      id: 'settings',
      name: 'System Settings',
      icon: Settings,
      component: null, // Placeholder for future implementation
      description: 'Configure system settings and preferences'
    }
  ];

  const activeTabData = adminTabs.find(tab => tab.id === activeTab);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-primary mb-2">Access Denied</h1>
          <p className="text-text-muted mb-6">You need administrator privileges to access this page.</p>
          <Link
            to="/"
            className="btn btn-primary flex items-center justify-center space-x-2"
          >
            <Home className="h-4 w-4" />
            <span>Go Home</span>
          </Link>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    if (!activeTabData?.component) {
      return (
        <div className="p-8 text-center">
          <activeTabData.icon className="h-12 w-12 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            {activeTabData.name}
          </h2>
          <p className="text-text-muted mb-4">{activeTabData.description}</p>
          <p className="text-sm text-text-muted">
            This feature is coming soon. Check back later for updates.
          </p>
        </div>
      );
    }

    const Component = activeTabData.component;
    return <Component />;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-2 text-text-primary hover:text-primary transition-colors"
              >
                <Home className="h-5 w-5" />
                <span className="font-medium">Back to Site</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-text-primary">Admin Panel</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-text-muted">Welcome,</span>
                <span className="text-sm font-medium text-text-primary">{user.username}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-surface border-r border-surface-border min-h-screen">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Admin Dashboard</h2>
              
              <nav className="space-y-1">
                {adminTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary text-white'
                          : 'text-text-muted hover:text-text-primary hover:bg-background-secondary'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-background">
            <div className="p-6">
              {activeTabData && (
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <activeTabData.icon className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold text-text-primary">
                      {activeTabData.name}
                    </h1>
                  </div>
                  <p className="text-text-muted">{activeTabData.description}</p>
                </div>
              )}
              
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin; 