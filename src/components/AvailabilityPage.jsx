import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AvailabilityPage.css';

const AvailabilityPage = ({
  eyebrow,
  title,
  description,
  details = [],
  statusLabel = '尚未开放',
}) => {
  useEffect(() => {
    document.title = `${title} | SciForge`;
    window.scrollTo(0, 0);
  }, [title]);

  return (
    <section className="availability-page" data-page-state="unavailable">
      <div className="container availability-shell">
        <div className="availability-status">{statusLabel}</div>
        <p className="availability-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="availability-description">{description}</p>

        {details.length > 0 && (
          <ul className="availability-details">
            {details.map((detail) => <li key={detail}>{detail}</li>)}
          </ul>
        )}

        <div className="availability-actions">
          <Link to="/" className="btn btn-primary">返回资源目录</Link>
          <Link to="/?scope=general" className="btn btn-outline">浏览通用</Link>
        </div>
      </div>
    </section>
  );
};

export default AvailabilityPage;
