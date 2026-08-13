import React from 'react';
import AvailabilityPage from '../components/AvailabilityPage';

const SubmitPage = () => (
  <AvailabilityPage
    eyebrow="Submission"
    title="资源提交尚未开放"
    description="提交 API、仓库身份解析、验证队列与人工审核尚未实现，因此不会接收表单，也不会伪造“已进入评测队列”的结果。"
    details={[
      '开放前必须先完成真实登录、幂等提交与限流。',
      'GitHub 验证只读取允许列表，并经过持久队列与人工审核。',
    ]}
  />
);

export default SubmitPage;
