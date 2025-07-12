import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { Bell, Search, User, LogOut, Settings, Crown, UserCheck, LogIn, UserPlus } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import NotificationList from './NotificationList';
import axios from 'axios';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout, isAuthenticated, canPost, isGuest, isAdmin } = useAuth();
  const { unreadCount, setUnreadCount } = useSocket();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);



  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
    toast.success('Successfully logged out');
  };

  const handleSignOut = () => {
    handleLogout();
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="badge badge-admin flex items-center gap-1"><Crown size={12} /> Admin</span>;
      case 'user':
        return <span className="badge badge-user flex items-center gap-1"><UserCheck size={12} /> User</span>;
      case 'guest':
        return <span className="badge badge-guest">Guest</span>;
      default:
        return null;
    }
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="navbar-logo">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">P</span>
        </div>
        <span className="text-xl font-bold text-primary">PeerQ</span>
      </Link>

      {/* Search */}
      <form onSubmit={handleSearch} className="navbar-search">
        <div className="relative">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-surface text-text-primary placeholder-text-muted"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-text-muted" />
        </div>
      </form>

      {/* Navigation Items */}
      <div className="navbar-actions">
        {/* Theme Toggle */}
        <ThemeToggle size="sm" className="mr-2" />

        {isAuthenticated() ? (
          <>
            {/* Ask Question Button - Only for users who can post */}
            {canPost() && (
              <Link
                to="/ask"
                className="btn btn-primary"
              >
                Ask Question
              </Link>
            )}

            {/* Guest Upgrade Button */}
            {isGuest() && (
              <Link
                to="/login"
                className="btn btn-secondary"
              >
                Upgrade Account
              </Link>
            )}

            {/* Quick Sign Out Button - Visible on larger screens */}
            <button
              onClick={handleSignOut}
              className="hidden md:flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={handleNotificationClick}
                className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-background-secondary rounded-lg transition-colors"
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="navbar-dropdown" style={{right: 0}}>
                  <NotificationList 
                    showUnreadOnly={false}
                    className=""
                    maxHeight="max-h-96"
                  />
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 text-text-secondary hover:text-text-primary hover:bg-background-secondary rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-background-secondary rounded-full flex items-center justify-center">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-text-primary">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                {user?.role && (
                  <div className="hidden sm:block">
                    {getRoleBadge(user.role)}
                  </div>
                )}
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="navbar-dropdown" style={{right: 0}}>
                  <div className="dropdown-header">
                    <div className="text-sm font-medium text-text-primary">{user?.username}</div>
                    <div className="text-xs text-text-muted">{user?.email}</div>
                    {user?.role && (
                      <div className="mt-1">
                        {getRoleBadge(user.role)}
                      </div>
                    )}
                  </div>
                  <Link
                    to="/profile"
                    className="dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                  <Link
                    to="/notifications"
                    className="dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </Link>
                  {isAdmin() && (
                    <Link
                      to="/admin"
                      className="dropdown-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="dropdown-item text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-3">
            {/* Login Button */}
            <Link 
              to="/login" 
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue hover:text-blue hover:bg-primary-light rounded-lg transition-colors border border-blue-500"
            >
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </Link>
            {/* Signup Button */}
            <Link 
              to="/register" 
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary rounded-lg transition-colors shadow-sm"
            >
              <UserPlus className="h-4 w-4" />
              <span>Signup</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 