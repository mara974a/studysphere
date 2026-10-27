import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { LogIn, AlertCircle, CheckCircle2 } from 'lucide-react';

export const LogInPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // If redirected from successful sign-up or expired session
  const successBannerMessage = location.state?.successMessage;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.email.trim() || !formData.password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post('/auth/login', {
        email: formData.email.trim(),
        password: formData.password,
      });

      if (response.data && response.data.token) {
        // Save JWT & user info into AuthContext & LocalStorage
        login(response.data.token, response.data.user);

        // Redirect to intended page or dashboard
        const destination = location.state?.from?.pathname || '/dashboard';
        navigate(destination, { replace: true });
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setErrorMessage(err.response.data.message);
      } else if (err.code === 'ERR_NETWORK') {
        setErrorMessage(
          'Cannot connect to backend server. Please verify the API server is running.'
        );
      } else {
        setErrorMessage('Failed to sign in. Please verify your credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <LogIn size={24} />
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to access your study resources and contributions.</p>
        </div>

        {/* Success Banner (e.g. from Signup redirect) */}
        {successBannerMessage && (
          <div className="alert-box alert-success">
            <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{successBannerMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="alert-box alert-error">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="e.g. maya@university.edu"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Enter your account password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '12px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="spinner spinner-sm"></div>
                <span>Signing In...</span>
              </>
            ) : (
              'Sign In to StudySphere'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account yet?{' '}
          <Link to="/signup" className="auth-link">
            Sign Up here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LogInPage;
