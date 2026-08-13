import React from 'react';
import { Link } from 'react-router-dom';
import './CategoryCard.css';

const CategoryCard = ({ id, title, description, icon }) => {
  return (
    <Link to={`/discipline/${id}`} className="category-card">
      <div className="category-icon">
        {icon}
      </div>
      <h3 className="category-title">{title}</h3>
      <p className="category-desc">{description}</p>
    </Link>
  );
};

export default CategoryCard;
