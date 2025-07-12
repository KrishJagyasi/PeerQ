import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { login, registerGuest } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [guestUsername, setGuestUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const success = await login(formData.email, formData.password);
    if (success) {
      navigate('/');
    }
    setLoading(false);
  };

  const handleGuestSubmit = async (e) => {
    e.preventDefault();
    setGuestLoading(true);

    const success = await registerGuest(guestUsername);
    if (success) {
      navigate('/');
    }
    setGuestLoading(false);
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Welcome to PeerQ</h1>
        <p className="text-text-secondary mt-2">
          Sign in to your account or continue as guest
        </p>
      </div>

      {!showGuestForm ? (
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? (
                <>
                  <div className="spinner mr-2"></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-text-secondary">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:text-primary-hover">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowGuestForm(true)}
              className="text-primary hover:text-primary-hover text-sm"
            >
              Continue as Guest
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <form onSubmit={handleGuestSubmit} className="space-y-4">
            <div className="form-group">
              <label htmlFor="guestUsername" className="form-label">
                Username
              </label>
              <input
                type="text"
                id="guestUsername"
                value={guestUsername}
                onChange={(e) => setGuestUsername(e.target.value)}
                className="form-input"
                placeholder="Choose a username"
                required
                minLength={3}
                maxLength={30}
              />
              <p className="text-sm text-text-muted mt-1">
                Guest accounts can browse and read content but cannot post questions or answers.
              </p>
            </div>

            <button
              type="submit"
              disabled={guestLoading}
              className="btn btn-secondary w-full"
            >
              {guestLoading ? (
                <>
                  <div className="spinner mr-2"></div>
                  Creating guest account...
                </>
              ) : (
                'Continue as Guest'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setShowGuestForm(false)}
              className="text-primary hover:text-primary-hover text-sm"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login; 