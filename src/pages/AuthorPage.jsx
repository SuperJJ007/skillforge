import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Card from '../components/Card';
import { catalogService } from '../services/catalogService';
import './AuthorPage.css';

const AuthorPage = () => {
  const { slug } = useParams();
  const author = catalogService.getAuthor(slug);
  const resources = catalogService.listResourcesByAuthor(slug);
  const hasLocatedSource = resources.some((resource) => resource.sourceReviewState === 'source-located');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = author ? `${author.displayName} | SciForge` : '未找到署名 | SciForge';
  }, [author]);

  if (!author) {
    return (
      <div className="container section author-not-found">
        <h1>未找到该署名</h1>
        <p>该作者或机构不在当前候选目录中。</p>
        <Link to="/" className="btn btn-primary">返回资源目录</Link>
      </div>
    );
  }

  return (
    <div className="author-page" data-verification-state={author.verificationState}>
      <section className="author-header-section">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">SciForge</Link> / <span>目录署名</span> / <span className="current">{author.displayName}</span>
          </div>

          <div className="author-candidate-notice" role="note">
            当前仅展示项目仓库中的候选署名关系；这不代表作者认领、维护权限或正式发布。
          </div>

          <div className="author-profile-card">
            <div className="author-avatar" aria-hidden="true">{author.displayName.slice(0, 1)}</div>
            <div className="author-profile-info">
              <div className="author-name-row">
                <h1>{author.displayName}</h1>
                <span className="author-type-badge">{author.entityType}</span>
                <span className="author-verification-badge">
                  {hasLocatedSource ? '来源已定位' : '待来源核验'}
                </span>
              </div>
              {author.affiliation && <div className="author-affiliation">{author.affiliation}</div>}
              {author.homepageUrl && (
                <a href={author.homepageUrl} target="_blank" rel="noreferrer noopener" className="author-homepage-link">
                  候选来源主页 ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="author-section-title">关联候选</h2>
          <p className="author-section-sub">这里只表示候选目录中的署名关联，不代表维护权限、官方认领或已发布目录事实。</p>
          {resources.length > 0 ? (
            <div className="grid grid-cols-3 gap-6">
              {resources.map((resource) => <Card key={resource.id} {...resource} />)}
            </div>
          ) : (
            <p className="author-empty">当前没有关联候选。</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default AuthorPage;
