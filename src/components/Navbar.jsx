import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const GITHUB_URL = 'https://github.com/SuperJJ007/skillforge';

const Navbar = () => {
  const { pathname, search } = useLocation();
  const sectionHref = (sectionId) => (
    pathname === '/' ? `${search || ''}#${sectionId}` : `/#${sectionId}`
  );

  return (
    <>
      <a className="skip-link" href="#main-content">跳到主要内容</a>
      <header className="navbar-wrapper">
        <div className="container nav-container">
          <Link to={pathname === '/' ? `/${search || ''}` : '/'} className="logo-brand" aria-label="SciForge 首页">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            SciForge
          </Link>

          <nav className="nav-menu" aria-label="主导航">
            <a href={sectionHref('skills')} className="nav-link">Skill</a>
            <a href={sectionHref('mcp')} className="nav-link">MCP</a>
            <a href={sectionHref('plugins')} className="nav-link">Plugin</a>
          </nav>

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="github-link"
            aria-label="在 GitHub 查看 SciForge"
          >
            <svg width="19" height="19" aria-hidden="true">
              <use href="/icons.svg#github-icon" />
            </svg>
            <span>GitHub</span>
          </a>
        </div>
      </header>
    </>
  );
};

export default Navbar;
