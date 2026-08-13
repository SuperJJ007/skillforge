import React from 'react';
import './AcademicCredit.css';

const AcademicCredit = () => (
  <section className="academic-credit" data-feature-state="unavailable">
    <div className="credit-summary">
      <div className="credit-stat">
        <div className="credit-stat-label">学术证据尚未开放</div>
        <p className="credit-stat-note">没有 DOI 来源与人工复核流程时，不展示引用数、论文使用记录或登记成功状态。</p>
      </div>
    </div>
  </section>
);

export default AcademicCredit;
