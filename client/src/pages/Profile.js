import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Calendar, Award, MessageSquare, Eye } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [stats, setStats] = useState({
    questions: 0,
    answers: 0,
    reputation: 0
  });
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  });

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      // In a real app, you'd have an endpoint for user stats
      // For now, we'll use the user data we have
      setStats({
        questions: 0, // Would come from API
        answers: 0,   // Would come from API
        reputation: user?.reputation || 0
      });
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const success = await updateProfile(formData);
      if (success) {
        setEditing(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-600">Please log in to view your profile</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="w-full h-full rounded-full"
              />
            ) : (
              user.username.charAt(0).toUpperCase()
            )}
          </div>
          
          <div className="profile-info">
            <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-500">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>

          <button
            onClick={() => setEditing(!editing)}
            className="btn btn-outline"
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div className="stat-item">
            <div className="stat-number">{stats.reputation}</div>
            <div className="stat-label">Reputation</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.questions}</div>
            <div className="stat-label">Questions</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.answers}</div>
            <div className="stat-label">Answers</div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      {editing && (
        <div className="card mt-6">
          <h3 className="card-title">Edit Profile</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="form-input"
                required
                minLength={3}
                maxLength={30}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="avatar" className="form-label">
                Avatar URL
              </label>
              <input
                type="url"
                id="avatar"
                name="avatar"
                value={formData.avatar}
                onChange={handleChange}
                className="form-input"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User Activity (placeholder) */}
      <div className="card mt-6">
        <h3 className="card-title">Recent Activity</h3>
        <div className="text-center py-8 text-gray-500">
          <p>No recent activity to display</p>
        </div>
      </div>
    </div>
  );
};

export default Profile; 