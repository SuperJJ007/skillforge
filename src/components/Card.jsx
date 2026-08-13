import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Card.css';

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

const CardAvatar = ({ avatarUrl, fallback, type, author }) => {
  const [imageFailed, setImageFailed] = useState(false);

  if (!avatarUrl || imageFailed) {
    return (
      <span className="card-icon card-avatar-fallback" style={{ backgroundColor: getIconBg(type) }} aria-hidden="true">
        {fallback}
      </span>
    );
  }

  return (
    <img
      className="card-icon card-repository-avatar"
      src={avatarUrl}
      alt={`${author} 头像`}
      onError={() => setImageFailed(true)}
    />
  );
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
  sourceReviewState = 'unreviewed',
  sourceSnapshot,
}) => {
  const ownerAvatarUrl = sourceSnapshot?.project?.ownerAvatarUrl;

  return (
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
        <div className="card-header-identity">
          <CardAvatar
            avatarUrl={ownerAvatarUrl}
            fallback={ownerAvatarUrl ? title.slice(0, 1).toUpperCase() : icon}
            type={type}
            author={author}
          />
        </div>
        {publicationState === 'candidate' && (
          <span className={`card-verification ${sourceReviewState === 'source-located' ? 'is-source-located' : ''}`}>
            {sourceReviewState === 'source-located' ? '来源已定位' : '待来源核验'}
          </span>
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

    <div className="card-rating" aria-label="暂无社区评分">
      <span className="card-rating-stars" aria-hidden="true">☆☆☆☆☆</span>
      <span>暂无评分</span>
    </div>

    <div className="card-footer">
      <div className="author">{author}</div>
      <span className="card-detail-cta">查看更多信息 →</span>
    </div>
    </Link>
  );
};

export default Card;
