import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, LayoutDashboard, User, LogIn, UserPlus } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo">
          <div className="brand-icon-wrapper">
            <BookOpen size={20} />
          </div>
          <span>
            Study<span className="brand-text-gradient">Sphere</span>
          </span>
        </Link>

        {/* Navigation Actions */}
        <div className="nav-links">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="btn btn-outline btn-sm">
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </Link>

              <div className="user-profile-badge">
                <div className="user-avatar-circle">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="user-name-text">{user?.name}</span>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Log Out of StudySphere"
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">
                <LogIn size={16} />
                <span>Log In</span>
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                <UserPlus size={16} />
                <span>Sign Up</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
