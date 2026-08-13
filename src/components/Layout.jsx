import React from 'react';
import Navbar from './Navbar';
import './Layout.css';

const GITHUB_URL = 'https://github.com/SuperJJ007/skillforge';

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />

      <div className="prototype-notice" role="note" aria-label="当前数据状态">
        <div className="container prototype-notice-inner">
          <strong>前端基线</strong>
          <span>当前目录只展示来源已定位候选；认证、提交、评分、GitHub 同步与 Bench 尚未接入。</span>
        </div>
      </div>

      <main id="main-content" className="site-main">
        {children}
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <div className="footer-brand">SciForge</div>
            <p>面向科研工作的 Skill、MCP 与 Plugin 资源库。</p>
          </div>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer noopener">GitHub ↗</a>
        </div>
      </footer>
    </>
  );
};

export default Layout;
