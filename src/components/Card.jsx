import React from 'react';
import { Link } from 'react-router-dom';
import './Card.css';
import CategoryBadge from './CategoryBadge';

const getIconBg = (type) => {
  switch (type.toLowerCase()) {
    case 'skill':
      return 'rgba(59, 130, 246, 0.1)';
    case 'mcp':
      return 'rgba(139, 92, 246, 0.1)';
    case 'plugin':
      return 'rgba(16, 185, 129, 0.1)';
    default:
      return 'rgba(156, 163, 175, 0.1)';
  }
};

const Card = ({
  id,
  slug,
  title,
  description,
  type,
  icon,
  author,
  tags = [],
  compact = false,
  primaryFieldId,
  fieldIds = [],
  scope = 'discipline',
  publicationState = 'candidate',
}) => (
  <Link
    to={`/tool/${slug}`}
    data-resource-id={id}
    className={`card-container ${compact ? 'card-compact' : ''}`}
    data-resource-card={compact ? 'true' : undefined}
    data-primary-field={compact ? primaryFieldId : undefined}
    data-fields={compact ? fieldIds.join(' ') : undefined}
    data-scope={compact ? scope : undefined}
  >
    <div className="card-header">
      {!compact && (
        <div className="card-icon" style={{ backgroundColor: getIconBg(type) }}>
          {icon}
        </div>
      )}
      <CategoryBadge type={type} />
      {publicationState === 'candidate' && (
        <span className="card-verification">待来源核验</span>
      )}
    </div>

    <h3 className="card-title">{title}</h3>
    <p className="card-description">{description}</p>

    {tags.length > 0 && (
      <div className="card-tags" aria-label="资源标签">
        {tags.slice(0, 3).map((tag) => (
          <span key={tag} className="card-tag">{tag}</span>
        ))}
      </div>
    )}

    <div className="card-footer">
      <div className="author">{author}</div>
      <span className="card-detail-cta">查看候选信息 →</span>
    </div>
  </Link>
);

export default Card;
