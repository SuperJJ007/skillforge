import React from 'react';
import AvailabilityPage from '../components/AvailabilityPage';

const BenchPage = () => (
  <AvailabilityPage
    eyebrow="Retired Prototype"
    title="Bench 排行已退出首版范围"
    description="当前没有可发布的独立评测证据、版本化方法和复核流程，因此不展示演示分数或排行榜。"
    details={[
      '以后恢复时，每项结果都必须带 benchmark、版本、方法与证据链接。',
      'GitHub 活跃度、README 描述和社区评分不能替代 Bench 证据。',
    ]}
    statusLabel="原型已退役"
  />
);

export default BenchPage;
