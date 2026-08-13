import React from 'react';
import AvailabilityPage from '../components/AvailabilityPage';

const DisciplinePage = () => (
  <AvailabilityPage
    eyebrow="Retired Route"
    title="旧学科页面已退役"
    description="学科筛选已经统一到首页，并同时作用于 Skill、MCP 与 Plugin。旧页面不再展示 bundles、推荐组合或重复 taxonomy。"
    statusLabel="旧路由已退役"
  />
);

export default DisciplinePage;
