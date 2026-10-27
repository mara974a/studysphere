import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Share2,
  FileText,
  Code,
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  const sampleSubjects = [
    'Computer Science',
    'Mathematics',
    'Physics',
    'Engineering',
    'Biology',
    'Business',
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-pill-badge">
            <Sparkles size={16} />
            <span>Open Academic Vault for High Achievers</span>
          </div>

          <h1 className="hero-title">
            The Central Hub for All Your{' '}
            <span className="brand-text-gradient">Study Resources</span>
          </h1>

          <p className="hero-subtitle">
            Find, share, and organize lecture notes, exam cheat sheets, solved past
            papers, and tutorial guides in one unified academic vault.
          </p>

          <div className="hero-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                <span>Go to Your Dashboard</span>
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn btn-primary btn-lg">
                  <span>Get Started — Sign Up</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  <span>Log In to Account</span>
                </Link>
              </>
            )}
          </div>

          {/* Subject Pills Preview */}
          <div
            style={{
              marginTop: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Popular subjects:
            </span>
            {sampleSubjects.map((sub, idx) => (
              <span key={idx} className="badge badge-subject">
                {sub}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section style={{ padding: '40px 0 80px' }}>
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Search size={24} />
              </div>
              <h3 className="feature-title">Instant Keyword & Tag Search</h3>
              <p className="feature-description">
                Quickly locate exact lecture summaries, exam formulas, or code
                snippets filtered by subject, format, and difficulty.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Share2 size={24} />
              </div>
              <h3 className="feature-title">Community Contributed</h3>
              <p className="feature-description">
                Contribute high-yield notes, Google Drive folders, and study
                guides to help fellow students excel in their coursework.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <ShieldCheck size={24} />
              </div>
              <h3 className="feature-title">Secure & Authenticated</h3>
              <p className="feature-description">
                Protected by JWT authentication and bcrypt password encryption to
                keep your contributions and academic profile secure.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
