import React from 'react';
import Card from './Card';

const DisciplineBoard = ({ title, description, items }) => {
  return (
    <div className="section" style={{ padding: '4rem 0' }}>
      <div className="container">
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{title}</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px' }}>{description}</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {items.map((item, index) => (
            <Card key={index} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DisciplineBoard;
