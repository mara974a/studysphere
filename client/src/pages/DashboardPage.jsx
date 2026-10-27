import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import ResourceCard from '../components/ResourceCard';
import ResourceModal from '../components/ResourceModal';
import {
  Plus,
  Search,
  BookOpen,
  Filter,
  Layers,
  FileCheck2,
  RefreshCw,
  FolderOpen,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

const SUBJECT_OPTIONS = [
  'All',
  'Computer Science',
  'Mathematics',
  'Physics',
  'Biology',
  'Chemistry',
  'Engineering',
  'Business',
  'Other',
];

const RESOURCE_TYPES = [
  'All',
  'Notes',
  'Cheat Sheet',
  'Past Exam',
  'Textbook Guide',
  'Project Tutorial',
  'Video Lecture',
];

export const DashboardPage = () => {
  const { user } = useAuth();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [myOnly, setMyOnly] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Show auto-dismiss toast
  const triggerToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Fetch Resources from Backend API
  const fetchResources = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedSubject !== 'All') params.subject = selectedSubject;
      if (selectedType !== 'All') params.resourceType = selectedType;
      if (myOnly) params.myOnly = 'true';

      const res = await api.get('/resources', { params });
      if (res.data && res.data.data) {
        setResources(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.code === 'ERR_NETWORK') {
        setError('Backend server is unreachable. Please verify the server is running on port 5000.');
      } else {
        setError('Failed to load study resources. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedSubject, selectedType, myOnly]);

  useEffect(() => {
    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchResources();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchResources]);

  // Handle Create or Update Resource
  const handleModalSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingResource) {
        // PUT /api/resources/:id
        const res = await api.put(`/resources/${editingResource._id}`, formData);
        triggerToast('Study resource updated successfully!', 'success');
      } else {
        // POST /api/resources
        const res = await api.post('/resources', formData);
        triggerToast('New study resource published successfully!', 'success');
      }
      setIsModalOpen(false);
      setEditingResource(null);
      fetchResources();
    } catch (err) {
      console.error('Error saving resource:', err);
      const msg = err.response?.data?.message || 'Failed to save study resource.';
      triggerToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Resource
  const handleDeleteResource = async (id) => {
    if (!window.confirm('Are you sure you want to delete this study resource? This cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/resources/${id}`);
      triggerToast('Study resource deleted successfully.', 'success');
      fetchResources();
    } catch (err) {
      console.error('Error deleting resource:', err);
      const msg = err.response?.data?.message || 'Failed to delete resource.';
      triggerToast(msg, 'error');
    }
  };

  // Open Edit Modal
  const handleEditClick = (resource) => {
    setEditingResource(resource);
    setIsModalOpen(true);
  };

  // Open Create Modal
  const handleCreateClick = () => {
    setEditingResource(null);
    setIsModalOpen(true);
  };

  // Stats Calculations
  const totalCount = resources.length;
  const uniqueSubjects = new Set(resources.map((r) => r.subject)).size;
  const myUploadsCount = resources.filter(
    (r) => String(r.createdBy) === String(user?.id)
  ).length;

  return (
    <div className="dashboard-wrapper">
      <div className="container">
        {/* Floating Toast Notification */}
        {toastMessage && (
          <div
            className={`alert-box alert-${toastMessage.type}`}
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              zIndex: 200,
              boxShadow: 'var(--shadow-lg)',
              maxWidth: '420px',
            }}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Header Bar */}
        <div className="dashboard-header">
          <div className="dashboard-title-group">
            <h1>Welcome back, {user?.name || 'Scholar'} 👋</h1>
            <p className="dashboard-subtitle">
              Your personalized study repository and community resource vault.
            </p>
          </div>

          <button onClick={handleCreateClick} className="btn btn-primary btn-lg">
            <Plus size={18} />
            <span>Contribute Resource</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon">
              <BookOpen size={22} />
            </div>
            <div>
              <div className="stat-number">{totalCount}</div>
              <div className="stat-label">Resources Available</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Layers size={22} />
            </div>
            <div>
              <div className="stat-number">{uniqueSubjects}</div>
              <div className="stat-label">Disciplines Covered</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FileCheck2 size={22} />
            </div>
            <div>
              <div className="stat-number">{myUploadsCount}</div>
              <div className="stat-label">Your Contributions</div>
            </div>
          </div>
        </div>

        {/* Filter and Search Controls */}
        <div className="filter-bar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by title, topic, or #tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-group">
            {/* Subject Filter */}
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '160px' }}
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              {SUBJECT_OPTIONS.map((sub) => (
                <option key={sub} value={sub}>
                  Subject: {sub}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '150px' }}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {RESOURCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  Format: {type}
                </option>
              ))}
            </select>

            {/* My Uploads Toggle */}
            <button
              onClick={() => setMyOnly(!myOnly)}
              className={`btn btn-sm ${myOnly ? 'btn-primary' : 'btn-outline'}`}
            >
              {myOnly ? '✓ My Uploads Only' : 'My Uploads'}
            </button>

            {/* Refresh Button */}
            <button
              onClick={fetchResources}
              className="btn btn-secondary btn-sm"
              title="Refresh resources list"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert-box alert-error" style={{ marginBottom: '24px' }}>
            <AlertCircle size={20} />
            <div style={{ flex: 1 }}>
              <strong>Error loading resources: </strong> {error}
            </div>
            <button onClick={fetchResources} className="btn btn-secondary btn-sm">
              Retry
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="loading-screen" style={{ minHeight: '300px' }}>
            <div className="spinner"></div>
            <p>Fetching academic resources from MongoDB...</p>
          </div>
        ) : resources.length === 0 ? (
          /* Empty State */
          <div className="empty-state">
            <div className="empty-state-icon">
              <FolderOpen size={30} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>
              No study resources found
            </h3>
            <p
              style={{
                color: 'var(--text-secondary)',
                maxWidth: '440px',
                margin: '0 auto 20px',
              }}
            >
              {searchQuery || selectedSubject !== 'All' || selectedType !== 'All' || myOnly
                ? 'No resources match your active search or filter criteria. Try clearing some filters.'
                : 'Be the first scholar to upload a study guide, cheat sheet, or past exam solution!'}
            </p>
            <button onClick={handleCreateClick} className="btn btn-primary">
              <Plus size={16} />
              <span>Contribute First Resource</span>
            </button>
          </div>
        ) : (
          /* Resources Grid */
          <div className="resources-grid">
            {resources.map((item) => (
              <ResourceCard
                key={item._id}
                resource={item}
                currentUserId={user?.id}
                onEdit={handleEditClick}
                onDelete={handleDeleteResource}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Resource Modal */}
      <ResourceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingResource(null);
        }}
        onSubmit={handleModalSubmit}
        initialData={editingResource}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default DashboardPage;
