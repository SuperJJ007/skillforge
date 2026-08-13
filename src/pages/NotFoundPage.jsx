import React from 'react';
import AvailabilityPage from '../components/AvailabilityPage';

const NotFoundPage = () => (
  <AvailabilityPage
    eyebrow="404"
    title="没有这个页面"
    description="该地址不存在，或对应的原型功能已经退役。"
    statusLabel="页面不存在"
  />
);

export default NotFoundPage;
