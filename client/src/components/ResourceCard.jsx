import React from 'react';
import { ExternalLink, Edit2, Trash2, Calendar, User as UserIcon } from 'lucide-react';

export const ResourceCard = ({ resource, currentUserId, onEdit, onDelete }) => {
  const isOwner =
    String(resource.createdBy) === String(currentUserId) ||
    currentUserId === 'admin';

  const formattedDate = resource.createdAt
    ? new Date(resource.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

  // Ensure link has valid protocol for external open
  const normalizedLink =
    resource.link?.startsWith('http://') || resource.link?.startsWith('https://')
      ? resource.link
      : `https://${resource.link}`;

  return (
    <article className="resource-card">
      <div className="resource-card-top">
        {/* Badges */}
        <div className="resource-badges">
          <span className="badge badge-subject">{resource.subject}</span>
          <span className="badge badge-type">{resource.resourceType}</span>
          {resource.difficulty && (
            <span className="badge badge-difficulty">{resource.difficulty}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="resource-title">{resource.title}</h3>

        {/* Description */}
        <p className="resource-description">{resource.description}</p>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="resource-tags">
            {resource.tags.map((tag, idx) => (
              <span key={idx} className="tag-pill">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="resource-card-bottom">
        {/* Metadata info */}
        <div className="resource-meta">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserIcon size={14} />
            <span>{resource.creatorName || 'Student'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '16px',
            gap: '8px',
          }}
        >
          <a
            href={normalizedLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
            style={{ flex: 1 }}
          >
            <ExternalLink size={14} />
            <span>Open Resource</span>
          </a>

          {isOwner && (
            <div className="resource-actions">
              <button
                onClick={() => onEdit(resource)}
                className="btn btn-secondary btn-sm"
                title="Edit this resource"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => onDelete(resource._id)}
                className="btn btn-danger btn-sm"
                title="Delete this resource"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default ResourceCard;
