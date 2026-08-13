import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { catalogService } from '../services/catalogService';
import './ToolDetailPage.css';

const getIconBg = (type) => {
  switch (type?.toLowerCase()) {
    case 'skill':
      return 'rgba(59, 130, 246, 0.1)';
    case 'mcp':
      return 'rgba(139, 92, 246, 0.1)';
    case 'plugin':
      return 'rgba(16, 185, 129, 0.1)';
    default:
      return 'rgba(156, 163, 175, 0.1)';
  }
};

const UNVERIFIED_EVIDENCE_ROWS = [
  { label: '目录来源', status: '待来源核验' },
  { label: '安装说明', status: '暂无已验证数据' },
  { label: '兼容性与权限', status: '未声明 / 未验证' },
  { label: 'GitHub 快照', status: '同步尚未接入' },
  { label: '社区评分', status: '功能尚未开放' },
  { label: 'Bench / 学术证据', status: '无独立证据' },
];

const formatProjectDate = (timestamp) => new Date(timestamp).toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});

const RepositoryAvatar = ({ avatarUrl, fallback, type }) => {
  const [imageFailed, setImageFailed] = useState(false);

  if (!avatarUrl || imageFailed) {
    return (
      <div
        className="detail-icon detail-repository-avatar detail-avatar-fallback"
        style={{ backgroundColor: getIconBg(type) }}
        aria-hidden="true"
      >
        {fallback}
      </div>
    );
  }

  return (
    <img
      className="detail-icon detail-repository-avatar"
      src={avatarUrl}
      alt="项目维护者头像"
      onError={() => setImageFailed(true)}
    />
  );
};

const SourceFactList = ({ items }) => (
  <div className="source-fact-list">
    {items.map((item) => (
      <article className="source-fact" key={`${item.title}-${item.evidenceUrl}`}>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </article>
    ))}
  </div>
);

const SourceLocatedDetails = ({ snapshot }) => {
  const { project } = snapshot;

  return (
    <div className="source-detail-stack">
      <section className="truth-section source-detail-section">
        <p className="truth-section-kicker">Capabilities</p>
        <h2>核心能力</h2>
        <SourceFactList items={project.capabilities} />
      </section>

      <section className="truth-section source-detail-section">
        <p className="truth-section-kicker">Installation</p>
        <h2>官方提供的安装与接入入口</h2>
        <div className="installation-list">
          {project.installationMethods.map((method) => (
            <article className="installation-method" key={`${method.title}-${method.command}`}>
              <div>
                <h3>{method.title}</h3>
                <p>{method.description}</p>
              </div>
              <pre><code>{method.command}</code></pre>
            </article>
          ))}
        </div>
      </section>

      <div className="source-detail-columns">
        <section className="truth-section source-detail-section">
          <p className="truth-section-kicker">Requirements</p>
          <h2>运行前提</h2>
          <SourceFactList items={project.requirements} />
        </section>

        <section className="truth-section source-detail-section">
          <p className="truth-section-kicker">Integrations</p>
          <h2>接入方式</h2>
          <SourceFactList items={project.integrations} />
        </section>
      </div>

      <section className="truth-section source-detail-section source-cautions">
        <p className="truth-section-kicker">Cautions</p>
        <h2>使用注意</h2>
        <SourceFactList items={project.cautions} />
      </section>
    </div>
  );
};

const UnverifiedCandidateDetails = () => (
  <div className="truth-section-grid">
    <section className="truth-section">
      <p className="truth-section-kicker">Installation</p>
      <h2>暂无经验证的安装说明</h2>
      <p>在 primary repository、manifest 和 latest snapshot 建立前，不展示下载按钮、CLI 命令、压缩包地址或文件树。</p>
    </section>

    <section className="truth-section">
      <p className="truth-section-kicker">Compatibility</p>
      <h2>兼容性与权限未验证</h2>
      <p>当前没有独立证据确认 runtime、操作系统、GPU、依赖、网络或文件权限要求。</p>
    </section>

    <section className="truth-section">
      <p className="truth-section-kicker">Repository</p>
      <h2>GitHub 同步尚未接入</h2>
      <p>不展示演示 Stars、Release、最近推送、协议、README、源码预览或未经证据支持的安全结论。</p>
    </section>

    <section className="truth-section">
      <p className="truth-section-kicker">Community & Evidence</p>
      <h2>评分与独立证据尚未开放</h2>
      <p>社区评分、Bench 分数、下载量、安装量、论文引用和自动进化记录均为空，不用模拟值占位。</p>
    </section>
  </div>
);

const SourceProjectSidebar = ({ resource }) => {
  const licenseSpdx = resource.sourceSnapshot.project.license.spdx;
  const licenseUndeclared = licenseSpdx === 'NOASSERTION';

  return (
    <div className="sidebar-panel truthful-sidebar source-project-sidebar">
      <div className="source-summary-row source-rating-row">
        <p className="truth-section-kicker">Community rating</p>
        <div className="rating-empty" aria-label="暂无社区评分，评分功能尚未开放">
          <div className="rating-stars" aria-hidden="true">☆☆☆☆☆</div>
          <div className="rating-empty-copy">
            <strong>暂无社区评分</strong>
            <span>评分功能尚未开放</span>
          </div>
        </div>
      </div>
      <div className="source-summary-row source-license-row">
        <p className="truth-section-kicker">License</p>
        <div className="license-highlight">
          <span>{licenseUndeclared ? '许可证' : '开源许可证'}</span>
          <strong>{licenseUndeclared ? '来源未声明' : licenseSpdx}</strong>
          <small>{licenseUndeclared ? '发布前需复核' : '仓库声明'}</small>
        </div>
      </div>
      <div className="source-project-meta">
        <div>
          <span>来源类型</span>
          <strong>官方项目仓库</strong>
        </div>
        <div>
          <span>仓库更新时间</span>
          <strong>{formatProjectDate(resource.sourceSnapshot.source.revisionCommittedAt)}</strong>
        </div>
        <div>
          <span>信息采集时间</span>
          <strong>{formatProjectDate(resource.sourceSnapshot.source.fetchedAt)}</strong>
        </div>
      </div>
    </div>
  );
};

const UnverifiedSidebar = () => (
  <div className="sidebar-panel truthful-sidebar">
    <p className="truth-section-kicker">Evidence status</p>
    <h2>当前可用信息</h2>
    <div className="evidence-status-list">
      {UNVERIFIED_EVIDENCE_ROWS.map(({ label, status }) => (
        <div className="evidence-status-row" key={label}>
          <span>{label}</span>
          <strong>{status}</strong>
        </div>
      ))}
    </div>
    <Link to="/" className="btn btn-primary truthful-sidebar-action">返回目录</Link>
  </div>
);

const ToolDetailPage = () => {
  const { slug } = useParams();
  const resource = catalogService.getResource(slug);
  const sourceLocated = resource?.sourceReviewState === 'source-located'
    && Boolean(resource?.sourceSnapshot);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = resource ? `${resource.title} | SciForge` : '未找到资源 | SciForge';
  }, [resource]);

  if (!resource) {
    return (
      <div className="container section detail-not-found">
        <h1>未找到该资源</h1>
        <p>该候选条目不存在，或已经从候选目录中移除。</p>
        <Link to="/" className="btn btn-primary">返回资源目录</Link>
      </div>
    );
  }

  return (
    <div
      className="tool-detail-page container"
      data-publication-state={resource.publicationState}
      data-source-review-state={resource.sourceReviewState || 'unreviewed'}
    >
      <div className="breadcrumb">
        <Link to="/">SciForge</Link> / <span>{resource.type}</span> / <span className="current">{resource.title}</span>
      </div>

      <div className="detail-layout truthful-detail-layout">
        <main className="main-content">
          <div className="detail-overview-grid">
            <div className="detail-overview-main">
              <div className="tags-row">
                <span
                  className="type-badge"
                  style={{ backgroundColor: getIconBg(resource.type), color: '#111827', fontWeight: '600' }}
                >
                  {resource.type}
                </span>
                {resource.tags.map((tag) => <span key={tag} className="tag-pill">#{tag}</span>)}
              </div>

              <div className="detail-header-row">
                {sourceLocated ? (
                  <RepositoryAvatar
                    key={resource.slug}
                    avatarUrl={resource.sourceSnapshot.project.ownerAvatarUrl}
                    fallback={resource.title.slice(0, 1).toUpperCase()}
                    type={resource.type}
                  />
                ) : (
                  <div className="detail-icon" style={{ backgroundColor: getIconBg(resource.type) }} aria-hidden="true">
                    {resource.icon}
                  </div>
                )}
                <div className="detail-header-content">
                  <h1 className="detail-title">{resource.title}</h1>
                  <p className="detail-desc">{resource.description}</p>
                  <p className="detail-author">
                    目录署名：{' '}
                    {resource.authorSlug ? (
                      <Link to={`/author/${resource.authorSlug}`}>{resource.author} ↗</Link>
                    ) : resource.author}
                  </p>
                  {sourceLocated && (
                    <a
                      href={resource.sourceUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="btn btn-primary project-address-link"
                    >
                      查看项目地址 ↗
                    </a>
                  )}
                </div>
              </div>

              {!sourceLocated && (
                <div className="candidate-notice" role="note">
                  <strong>这是迁移候选，不是已发布推荐。</strong>
                  <span>当前只保留原型中的目录描述，尚未经过来源、仓库身份与人工发布流程核验。</span>
                </div>
              )}
            </div>

            <aside className="sidebar detail-overview-sidebar" aria-label={sourceLocated ? '项目信息' : '证据状态'}>
              {sourceLocated
                ? <SourceProjectSidebar resource={resource} />
                : <UnverifiedSidebar />}
            </aside>
          </div>

          {sourceLocated
            ? <SourceLocatedDetails snapshot={resource.sourceSnapshot} />
            : <UnverifiedCandidateDetails />}
        </main>
      </div>
    </div>
  );
};

export default ToolDetailPage;
