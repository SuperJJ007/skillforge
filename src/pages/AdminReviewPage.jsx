import React from 'react';
import AvailabilityPage from '../components/AvailabilityPage';

const AdminReviewPage = () => (
  <AvailabilityPage
    eyebrow="Admin Review"
    title="审核工作台尚未开放"
    description="Admin API、角色校验、review draft、验证证据和审计事件尚未实现。当前页面不会提供绕过后端状态机的本地审核操作。"
    details={[
      'editor/admin 权限必须在路由进入和每次 mutation 时重新验证。',
      '审核界面只会调用受控 Admin API，不允许直接修改数据库表。',
    ]}
  />
);

export default AdminReviewPage;
