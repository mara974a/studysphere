import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="loading-screen" style={{ minHeight: 'calc(100vh - 160px)' }}>
      <h1 style={{ fontSize: '4rem', color: '#818cf8', marginBottom: '8px' }}>404</h1>
      <h2 style={{ marginBottom: '12px' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
        The study path or resource you requested does not exist.
      </p>
      <Link to="/" className="btn btn-primary">
        <Home size={16} />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;
