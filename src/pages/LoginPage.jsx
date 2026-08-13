import React from 'react';
import AvailabilityPage from '../components/AvailabilityPage';

const LoginPage = () => (
  <AvailabilityPage
    eyebrow="Authentication"
    title="登录尚未开放"
    description="真实账号系统尚未接入。当前页面不会收集邮箱、密码、验证码，也不会伪造认证结果。"
    details={[
      '后续只接入架构指定的 Supabase Auth + GitHub PKCE。',
      '认证、角色与账号状态在服务端验证完成前，不开放任何写操作。',
    ]}
  />
);

export default LoginPage;
