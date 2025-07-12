import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Users, 
  Search, 
  Filter,
  Loader,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminNotificationManager = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    userId: '',
    isRead: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    hasNext: false,
    hasPrev: false
  });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    userId: '',
    discountCode: ''
  });

  const fetchNotifications = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axios.get(`/api/notifications/admin/all?${params}`);
      setNotifications(response.data.notifications);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setError('Failed to load notifications');
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/notifications/users/all');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    
    try {
      const notificationData = {
        ...formData,
        userId: formData.userId || null // null for broadcast
      };

      await axios.post('/api/notifications', notificationData);
      
      toast.success('Notification created successfully');
      setShowCreateModal(false);
      resetForm();
      fetchNotifications();
    } catch (error) {
      console.error('Failed to create notification:', error);
      toast.error(error.response?.data?.message || 'Failed to create notification');
    }
  };

  const handleUpdateNotification = async (e) => {
    e.preventDefault();
    
    try {
      await axios.patch(`/api/notifications/${selectedNotification._id}`, formData);
      
      toast.success('Notification updated successfully');
      setShowEditModal(false);
      setSelectedNotification(null);
      resetForm();
      fetchNotifications();
    } catch (error) {
      console.error('Failed to update notification:', error);
      toast.error(error.response?.data?.message || 'Failed to update notification');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/notifications/${notificationId}`);
      toast.success('Notification deleted successfully');
      fetchNotifications();
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleToggleReadStatus = async (notificationId, currentStatus) => {
    try {
      const endpoint = currentStatus ? 'unread' : 'read';
      await axios.patch(`/api/notifications/${notificationId}/${endpoint}`);
      
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, isRead: !currentStatus } : n)
      );
      
      toast.success(`Notification marked as ${currentStatus ? 'unread' : 'read'}`);
    } catch (error) {
      console.error('Failed to toggle read status:', error);
      toast.error('Failed to update notification status');
    }
  };

  const openEditModal = (notification) => {
    setSelectedNotification(notification);
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      userId: notification.userId || '',
      discountCode: notification.discountCode || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      userId: '',
      discountCode: ''
    });
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchNotifications(1);
  };

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, []);

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'discount': return 'bg-green-100 text-green-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'answer': return 'bg-purple-100 text-purple-800';
      case 'comment': return 'bg-orange-100 text-orange-800';
      case 'mention': return 'bg-indigo-100 text-indigo-800';
      case 'vote': return 'bg-yellow-100 text-yellow-800';
      case 'accept': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-surface rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
              <button
                onClick={onClose}
                className="text-text-muted hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    );
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-text-primary mb-2">Access Denied</h2>
        <p className="text-text-muted">You need admin privileges to access this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Notification Manager</h1>
            <p className="text-text-muted">Manage system notifications and user communications</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Notification</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-lg border border-surface-border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-surface-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Types</option>
              <option value="info">Info</option>
              <option value="discount">Discount</option>
              <option value="answer">Answer</option>
              <option value="comment">Comment</option>
              <option value="mention">Mention</option>
              <option value="vote">Vote</option>
              <option value="accept">Accept</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
            <select
              value={filters.isRead}
              onChange={(e) => handleFilterChange('isRead', e.target.value)}
              className="w-full px-3 py-2 border border-surface-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Status</option>
              <option value="false">Unread</option>
              <option value="true">Read</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Search</label>
            <input
              type="text"
              placeholder="Search notifications..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 border border-surface-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => fetchNotifications()}
              className="w-full btn btn-secondary"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-surface rounded-lg border border-surface-border">
        {loading ? (
          <div className="p-8 text-center">
            <Loader className="h-8 w-8 text-primary animate-spin mx-auto mb-2" />
            <p className="text-sm text-text-muted">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-text-muted">{error}</p>
            <button
              onClick={() => fetchNotifications()}
              className="mt-2 text-sm text-primary hover:text-primary-dark"
            >
              Try again
            </button>
          </div>
        ) : notifications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background-secondary">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Message</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Target</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {notifications.map((notification) => (
                  <tr key={notification._id} className="hover:bg-background-secondary">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(notification.type)}`}>
                        {notification.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-text-primary">{notification.title}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-text-muted max-w-xs truncate">{notification.message}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-text-muted">
                        {notification.userId ? (
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {notification.userId.username}
                          </span>
                        ) : (
                          <span className="text-green-600 font-medium">Broadcast</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleReadStatus(notification._id, notification.isRead)}
                        className={`flex items-center space-x-1 text-xs ${
                          notification.isRead ? 'text-green-600' : 'text-yellow-600'
                        }`}
                      >
                        {notification.isRead ? (
                          <>
                            <Eye className="h-3 w-3" />
                            <span>Read</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3" />
                            <span>Unread</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-text-muted">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(notification)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteNotification(notification._id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <Bell className="h-8 w-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-muted">No notifications found</p>
          </div>
        )}
      </div>

      {/* Create Notification Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Create Notification"
      >
        <form onSubmit={handleCreateNotification} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-surface-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Notification title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Message *</label>
            <textarea
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-3 py-2 border border-surface-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="Notification message"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Type *</label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-surface-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="info">Info</option>
              <option value="discount">Discount</option>
              <option value="answer">Answer</option>
              <option value="comment">Comment</option>
              <option value="mention">Mention</option>
              <option value="vote">Vote</option>
              <option value="accept">Accept</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Target User</label>
            <select
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              className="w-full px-3 py-2 border border-surface-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Broadcast to all users</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.username} ({user.email})
                </option>
              ))}
            </select>
          </div>
          
          {formData.type === 'discount' && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Discount Code</label>
              <input
                type="text"
                value={formData.discountCode}
                onChange={(e) => setFormData({ ...formData, discountCode: e.target.value })}
                className="w-full px-3 py-2 border border-surface-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="DISCOUNT20"
              />
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Create Notification
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Notification Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedNotification(null);
          resetForm();
        }}
        title="Edit Notification"
      >
        <form onSubmit={handleUpdateNotification} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-surface-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Message *</label>
            <textarea
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-3 py-2 border border-surface-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Type *</label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-surface-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="info">Info</option>
              <option value="discount">Discount</option>
              <option value="answer">Answer</option>
              <option value="comment">Comment</option>
              <option value="mention">Mention</option>
              <option value="vote">Vote</option>
              <option value="accept">Accept</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Target User</label>
            <select
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              className="w-full px-3 py-2 border border-surface-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Broadcast to all users</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.username} ({user.email})
                </option>
              ))}
            </select>
          </div>
          
          {formData.type === 'discount' && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Discount Code</label>
              <input
                type="text"
                value={formData.discountCode}
                onChange={(e) => setFormData({ ...formData, discountCode: e.target.value })}
                className="w-full px-3 py-2 border border-surface-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowEditModal(false);
                setSelectedNotification(null);
                resetForm();
              }}
              className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Update Notification
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminNotificationManager; 