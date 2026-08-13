import React from 'react';
import './EvidencePanel.css';

const EvidencePanel = () => (
  <section className="evidence-empty" data-feature-state="unavailable">
    <h3>Bench 证据尚未开放</h3>
    <p>没有独立、版本化且可复核的评测结果时，本组件不会渲染分数、排行或模拟用例。</p>
  </section>
);

export default EvidencePanel;
