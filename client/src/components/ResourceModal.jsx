import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';

const SUBJECT_OPTIONS = [
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
  'Notes',
  'Cheat Sheet',
  'Past Exam',
  'Textbook Guide',
  'Project Tutorial',
  'Video Lecture',
];

const DIFFICULTY_LEVELS = ['Introductory', 'Intermediate', 'Advanced'];

export const ResourceModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    subject: 'Computer Science',
    resourceType: 'Notes',
    difficulty: 'Intermediate',
    link: '',
    description: '',
    tags: '',
  });

  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        subject: initialData.subject || 'Computer Science',
        resourceType: initialData.resourceType || 'Notes',
        difficulty: initialData.difficulty || 'Intermediate',
        link: initialData.link || '',
        description: initialData.description || '',
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
      });
    } else {
      setFormData({
        title: '',
        subject: 'Computer Science',
        resourceType: 'Notes',
        difficulty: 'Intermediate',
        link: '',
        description: '',
        tags: '',
      });
    }
    setFormError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formError) setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.title.trim()) {
      return setFormError('Please enter a descriptive resource title.');
    }
    if (!formData.link.trim()) {
      return setFormError('Please provide a valid URL/link for the resource.');
    }
    if (!formData.description.trim()) {
      return setFormError('Please provide a short description of the content.');
    }

    onSubmit(formData);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#818cf8" />
            <h2 style={{ fontSize: '1.35rem' }}>
              {initialData ? 'Edit Study Resource' : 'Contribute Study Resource'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn btn-outline btn-sm"
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {formError && (
              <div className="alert-box alert-error">{formError}</div>
            )}

            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="title">
                Resource Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                className="form-input"
                placeholder="e.g. Operating Systems: Synchronization & Deadlocks"
                value={formData.title}
                onChange={handleChange}
                maxLength={120}
                required
              />
            </div>

            {/* Subject & Type Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
              }}
            >
              <div className="form-group">
                <label className="form-label" htmlFor="subject">
                  Academic Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  className="form-select"
                  value={formData.subject}
                  onChange={handleChange}
                >
                  {SUBJECT_OPTIONS.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="resourceType">
                  Resource Format *
                </label>
                <select
                  id="resourceType"
                  name="resourceType"
                  className="form-select"
                  value={formData.resourceType}
                  onChange={handleChange}
                >
                  {RESOURCE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="difficulty">
                  Difficulty Level
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  className="form-select"
                  value={formData.difficulty}
                  onChange={handleChange}
                >
                  {DIFFICULTY_LEVELS.map((diff) => (
                    <option key={diff} value={diff}>
                      {diff}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Link / URL */}
            <div className="form-group">
              <label className="form-label" htmlFor="link">
                Resource Link / URL *
              </label>
              <input
                id="link"
                name="link"
                type="url"
                className="form-input"
                placeholder="https://drive.google.com/... or https://github.com/..."
                value={formData.link}
                onChange={handleChange}
                required
              />
              <span className="form-hint">
                Direct link to Google Drive, GitHub, Notion, YouTube, or docs.
              </span>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="description">
                Summary & Key Topics *
              </label>
              <textarea
                id="description"
                name="description"
                className="form-textarea"
                rows={3}
                placeholder="Summarize what this resource covers and how it helps students..."
                value={formData.description}
                onChange={handleChange}
                maxLength={1000}
                required
              />
            </div>

            {/* Tags */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="tags">
                Tags (Comma-separated)
              </label>
              <input
                id="tags"
                name="tags"
                type="text"
                className="form-input"
                placeholder="React, Midterms, Semaphore, Big-O"
                value={formData.tags}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner spinner-sm"></div>
                  <span>Saving...</span>
                </>
              ) : initialData ? (
                'Save Changes'
              ) : (
                'Publish Resource'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceModal;
