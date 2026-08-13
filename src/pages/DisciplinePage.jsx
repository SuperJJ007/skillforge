import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import AvailabilityPage from '../components/AvailabilityPage';
import { legacyTaxonomyAdapter } from '../repositories/LegacyTaxonomyAdapter';

const DisciplinePage = () => {
  const { id } = useParams();
  const migration = legacyTaxonomyAdapter.getDisciplineRoute(id);

  if (migration) {
    return (
      <Navigate
        replace
        to={migration.targetPath}
        state={{ catalogNotice: migration.notice }}
      />
    );
  }

  return (
    <AvailabilityPage
      eyebrow="Retired Route"
      title="旧学科页面不存在"
      description="学科筛选已统一到首页。该旧分类没有可验证的迁移目标，因此不会自动猜测新学科。"
      statusLabel="未找到迁移映射"
    />
  );
};

export default DisciplinePage;
