import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Crown, UserCheck, User, Settings, Shield, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const { 
    user, 
    updateProfile, 
    upgradeGuest, 
    getAllUsers, 
    updateUserRole, 
    deleteUser, 
    isAdmin, 
    isGuest 
  } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    avatar: ''
  });
  const [upgradeForm, setUpgradeForm] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [showUpgradeForm, setShowUpgradeForm] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (isAdmin()) {
      fetchAdminUsers();
    }
  }, [isAdmin]);

  const fetchAdminUsers = async () => {
    setAdminLoading(true);
    const users = await getAllUsers();
    setAdminUsers(users);
    setAdminLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const success = await updateProfile(formData);
    if (success) {
      setLoading(false);
    }
  };

  const handleUpgradeSubmit = async (e) => {
    e.preventDefault();
    
    if (upgradeForm.password !== upgradeForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setUpgradeLoading(true);
    const success = await upgradeGuest(upgradeForm.email, upgradeForm.password);
    if (success) {
      setShowUpgradeForm(false);
      setUpgradeForm({ email: '', password: '', confirmPassword: '' });
    }
    setUpgradeLoading(false);
  };

  const handleRoleUpdate = async (userId, newRole) => {
    const updatedUser = await updateUserRole(userId, newRole);
    if (updatedUser) {
      fetchAdminUsers(); // Refresh the list
    }
  };

  const handleUserDelete = async (userId, username) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      const success = await deleteUser(userId);
      if (success) {
        fetchAdminUsers(); // Refresh the list
      }
    }
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

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            Please log in to view your profile
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Profile</h1>
        <p className="text-text-secondary mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-text-primary">
                  {user.username}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  {getRoleBadge(user.role)}
                  <span className="text-sm text-text-muted">
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {isGuest() && !showUpgradeForm && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-yellow-800 mb-2">Guest Account</h3>
                <p className="text-yellow-700 text-sm mb-3">
                  You're currently using a guest account. Upgrade to a full account to:
                </p>
                <ul className="text-yellow-700 text-sm space-y-1 mb-3">
                  <li>• Post questions and answers</li>
                  <li>• Vote on content</li>
                  <li>• Access all features</li>
                </ul>
                <button
                  onClick={() => setShowUpgradeForm(true)}
                  className="btn btn-primary btn-sm"
                >
                  Upgrade Account
                </button>
              </div>
            )}

            {showUpgradeForm && (
              <div className="border border-primary-light rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-text-primary mb-4">Upgrade to Full Account</h3>
                <form onSubmit={handleUpgradeSubmit} className="space-y-4">
                  <div className="form-group">
                    <label htmlFor="upgradeEmail" className="form-label">Email *</label>
                    <input
                      type="email"
                      id="upgradeEmail"
                      value={upgradeForm.email}
                      onChange={(e) => setUpgradeForm(prev => ({ ...prev, email: e.target.value }))}
                      className="form-input"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="upgradePassword" className="form-label">Password *</label>
                    <input
                      type="password"
                      id="upgradePassword"
                      value={upgradeForm.password}
                      onChange={(e) => setUpgradeForm(prev => ({ ...prev, password: e.target.value }))}
                      className="form-input"
                      placeholder="Enter your password"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password *</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={upgradeForm.confirmPassword}
                      onChange={(e) => setUpgradeForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="form-input"
                      placeholder="Confirm your password"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={upgradeLoading}
                      className="btn btn-primary"
                    >
                      {upgradeLoading ? 'Upgrading...' : 'Upgrade Account'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUpgradeForm(false)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {!isGuest() && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-group">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input
                    type="text"
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="form-input"
                    placeholder="Enter your username"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="form-input"
                    placeholder="Enter your email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="avatar" className="form-label">Avatar URL</label>
                  <input
                    type="url"
                    id="avatar"
                    value={formData.avatar}
                    onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
                    className="form-input"
                    placeholder="Enter avatar URL (optional)"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="card-title flex items-center gap-2">
              <Settings size={16} />
              Account Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">Reputation:</span>
                <span className="font-semibold">{user.reputation || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Role:</span>
                <span className="font-semibold">{user.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Joined:</span>
                <span className="font-semibold">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {isAdmin() && (
            <div className="card mt-4">
              <h3 className="card-title flex items-center gap-2">
                <Shield size={16} />
                Admin Panel
              </h3>
              <p className="text-sm text-text-muted mb-4">
                Manage users and system settings
              </p>
              <button
                onClick={() => document.getElementById('admin-users').scrollIntoView()}
                className="btn btn-secondary w-full"
              >
                View All Users
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Admin Users Section */}
      {isAdmin() && (
        <div id="admin-users" className="mt-8">
          <div className="card">
            <h2 className="text-2xl font-bold text-text-primary mb-6">User Management</h2>
            
            {adminLoading ? (
              <div className="flex justify-center py-8">
                <div className="spinner"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Role</th>
                      <th className="text-left py-3 px-4">Joined</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map((adminUser) => (
                      <tr key={adminUser._id} className="border-b border-border">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {adminUser.username?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium">{adminUser.username}</div>
                              <div className="text-sm text-text-muted">{adminUser.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getRoleBadge(adminUser.role)}
                        </td>
                        <td className="py-3 px-4 text-sm text-text-muted">
                          {new Date(adminUser.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={adminUser.role}
                              onChange={(e) => handleRoleUpdate(adminUser._id, e.target.value)}
                              className="form-select text-sm"
                              disabled={adminUser.role === 'admin'}
                            >
                              <option value="guest">Guest</option>
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                            {adminUser.role !== 'admin' && (
                              <button
                                onClick={() => handleUserDelete(adminUser._id, adminUser.username)}
                                className="btn btn-danger btn-sm"
                                title="Delete user"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 