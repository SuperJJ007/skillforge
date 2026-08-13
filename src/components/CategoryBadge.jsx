import React from 'react';

const CategoryBadge = ({ type }) => {
  const getBadgeStyle = () => {
    switch (type.toLowerCase()) {
      case 'skill':
        return { bg: '#dbeafe', color: '#1e3a8a', label: 'Skill' };
      case 'mcp':
        return { bg: '#e5e7eb', color: '#374151', label: 'MCP' };
      case 'plugin':
        return { bg: '#d1fae5', color: '#065f46', label: 'Plugin' };
      default:
        return { bg: '#e5e7eb', color: '#374151', label: type };
    }
  };

  const style = getBadgeStyle();

  return (
    <span style={{
      backgroundColor: style.bg,
      color: style.color,
      padding: '4px 12px',
      borderRadius: 'var(--radius-full)',
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }}>
      {style.label}
    </span>
  );
};

export default CategoryBadge;
