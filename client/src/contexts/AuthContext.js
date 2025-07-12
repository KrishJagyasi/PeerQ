import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      // Normalize user data structure
      const userData = {
        ...response.data.user,
        id: response.data.user.id || response.data.user._id,
        _id: response.data.user._id || response.data.user.id
      };
      setUser(userData);
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Normalize user data structure
      const userData = {
        ...user,
        id: user.id || user._id,
        _id: user._id || user.id
      };
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      
      toast.success('Login successful!');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return false;
    }
  };

  const register = async (username, email, password, role = 'user') => {
    try {
      const response = await axios.post('/api/auth/register', { 
        username, 
        email, 
        password,
        role
      });
      const { token, user } = response.data;
      
      // Normalize user data structure
      const userData = {
        ...user,
        id: user.id || user._id,
        _id: user._id || user.id
      };
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      
      toast.success('Registration successful!');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return false;
    }
  };

  const registerGuest = async (username) => {
    try {
      const response = await axios.post('/api/auth/register/guest', { username });
      const { token, user } = response.data;
      
      // Normalize user data structure
      const userData = {
        ...user,
        id: user.id || user._id,
        _id: user._id || user.id
      };
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      
      toast.success('Guest account created successfully!');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Guest registration failed';
      toast.error(message);
      return false;
    }
  };

  const upgradeGuest = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/upgrade-guest', { email, password });
      const { token, user } = response.data;
      
      // Normalize user data structure
      const userData = {
        ...user,
        id: user.id || user._id,
        _id: user._id || user.id
      };
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      
      toast.success('Account upgraded successfully!');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Account upgrade failed';
      toast.error(message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (updates) => {
    try {
      const response = await axios.put('/api/auth/profile', updates);
      // Normalize user data structure
      const userData = {
        ...response.data.user,
        id: response.data.user.id || response.data.user._id,
        _id: response.data.user._id || response.data.user.id
      };
      setUser(userData);
      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return false;
    }
  };

  // Admin functions
  const getAllUsers = async () => {
    try {
      const response = await axios.get('/api/auth/users');
      return response.data.users;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch users';
      toast.error(message);
      return [];
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      const response = await axios.put(`/api/auth/users/${userId}/role`, { role });
      toast.success('User role updated successfully');
      return response.data.user;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update user role';
      toast.error(message);
      return null;
    }
  };

  const deleteUser = async (userId) => {
    try {
      await axios.delete(`/api/auth/users/${userId}`);
      toast.success('User deleted successfully');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete user';
      toast.error(message);
      return false;
    }
  };

  // Permission-based helper functions
  const isGuest = () => user?.role === 'guest';
  const isUser = () => user?.role === 'user';
  const isAdmin = () => user?.role === 'admin';
  const isAuthenticated = () => !!user;
  
  // Permission checks based on role
  const canView = () => true; // All roles can view
  const canPost = () => isAuthenticated() && !isGuest(); // Users and admins can post
  const canVote = () => isAuthenticated() && !isGuest(); // Users and admins can vote
  const canModerate = () => isAdmin(); // Only admins can moderate

  const value = {
    user,
    loading,
    login,
    register,
    registerGuest,
    upgradeGuest,
    logout,
    updateProfile,
    getAllUsers,
    updateUserRole,
    deleteUser,
    isAuthenticated,
    isGuest,
    isUser,
    isAdmin,
    canView,
    canPost,
    canVote,
    canModerate
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 