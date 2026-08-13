import React, { useEffect } from 'react';
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

const EVIDENCE_ROWS = [
  ['目录状态', '待来源核验'],
  ['安装说明', '暂无已验证数据'],
  ['兼容性与权限', '未声明 / 未验证'],
  ['GitHub 快照', '同步尚未接入'],
  ['社区评分', '功能尚未开放'],
  ['Bench / 学术证据', '无独立证据'],
];

const ToolDetailPage = () => {
  const { id } = useParams();
  const resource = catalogService.getResource(id);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = resource ? `${resource.title} | SciForge` : '未找到资源 | SciForge';
  }, [resource]);

  if (!resource) {
    return (
      <div className="container section detail-not-found">
        <h1>未找到该资源</h1>
        <p>该候选条目不存在，或已经从迁移清单中移除。</p>
        <Link to="/" className="btn btn-primary">返回资源目录</Link>
      </div>
    );
  }

  return (
    <div className="tool-detail-page container" data-publication-state={resource.publicationState}>
      <div className="breadcrumb">
        <Link to="/">SciForge</Link> / <span>{resource.type}</span> / <span className="current">{resource.title}</span>
      </div>

      <div className="detail-layout truthful-detail-layout">
        <main className="main-content">
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
            <div className="detail-icon" style={{ backgroundColor: getIconBg(resource.type) }} aria-hidden="true">
              {resource.icon}
            </div>
            <div>
              <h1 className="detail-title">{resource.title}</h1>
              <p className="detail-author">
                目录署名：{' '}
                {resource.authorId ? (
                  <Link to={`/author/${resource.authorId}`}>{resource.author} ↗</Link>
                ) : resource.author}
              </p>
            </div>
          </div>

          <div className="candidate-notice" role="note">
            <strong>这是迁移候选，不是已发布推荐。</strong>
            <span>当前只保留原型中的目录描述，尚未经过来源、仓库身份与人工发布流程核验。</span>
          </div>

          <p className="detail-desc">{resource.description}</p>

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
        </main>

        <aside className="sidebar" aria-label="证据状态">
          <div className="sidebar-panel truthful-sidebar">
            <p className="truth-section-kicker">Evidence status</p>
            <h2>当前可用信息</h2>
            <div className="evidence-status-list">
              {EVIDENCE_ROWS.map(([label, status]) => (
                <div className="evidence-status-row" key={label}>
                  <span>{label}</span>
                  <strong>{status}</strong>
                </div>
              ))}
            </div>
            <Link to="/" className="btn btn-primary truthful-sidebar-action">返回目录</Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ToolDetailPage;
