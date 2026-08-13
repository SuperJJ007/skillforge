import React, { useEffect, useMemo, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import Card from '../components/Card';
import SearchBar from '../components/SearchBar';
import { FIELD_IDS, FILTER_GROUPS, FILTER_OPTIONS } from '../domain/catalog';
import { catalogService } from '../services/catalogService';
import './HomePage.css';

const RESOURCE_SECTIONS = [
  { id: 'skills', type: 'Skill', title: 'Skill' },
  { id: 'mcp', type: 'MCP', title: 'MCP' },
  { id: 'plugins', type: 'Plugin', title: 'Plugin' },
];

const resources = catalogService.listResources();

const ResourceSection = ({ id, title, items, activeFilterLabel, query }) => (
  <section id={id} className={`resource-section resource-section-${id}`} aria-labelledby={`${id}-title`}>
    <div className="container">
      <div className="resource-section-header">
        <h2 id={`${id}-title`} className="resource-section-title">{title}</h2>
      </div>

      {items.length > 0 ? (
        <div className="resource-grid">
          {items.map((resource) => (
            <Card key={resource.id} {...resource} compact />
          ))}
        </div>
      ) : (
        <div className="resource-empty">
          {query.trim()
            ? `${activeFilterLabel === '全部' ? '' : `${activeFilterLabel}中`}没有匹配的 ${title}。`
            : `${activeFilterLabel === '全部' ? '当前' : activeFilterLabel}暂无 ${title}，正在收录中。`}
        </div>
      )}
    </div>
  </section>
);

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const filterRailRef = useRef(null);
  const serializedParams = searchParams.toString();
  const requestedFields = searchParams.getAll('field');
  const requestedScopes = searchParams.getAll('scope');
  const requestedField = requestedFields.find((fieldId) => FIELD_IDS.has(fieldId));
  const hasGeneralScope = requestedScopes.includes('general');
  const activeFilter = hasGeneralScope
    ? 'general'
    : (FIELD_IDS.has(requestedField) ? requestedField : 'all');
  const query = searchParams.get('q') || '';
  const activeFilterLabel = FILTER_OPTIONS.find((option) => option.id === activeFilter)?.label || '全部';

  const queryMatches = useMemo(
    () => catalogService.searchResources(resources, query),
    [query],
  );
  const filteredResources = useMemo(
    () => catalogService.filterResources(queryMatches, activeFilter),
    [activeFilter, queryMatches],
  );
  const filterTotal = useMemo(
    () => catalogService.filterResources(resources, activeFilter).length,
    [activeFilter],
  );
  const sections = useMemo(
    () => RESOURCE_SECTIONS.map((section) => ({
      ...section,
      items: filteredResources.filter((resource) => resource.type === section.type),
    })),
    [filteredResources],
  );

  const updateParams = (updates, options) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);

      Object.entries(updates).forEach(([key, value]) => {
        if (!value) next.delete(key);
        else next.set(key, value);
      });

      return next;
    }, options);
  };

  useEffect(() => {
    const targetId = window.location.hash.slice(1);
    if (!RESOURCE_SECTIONS.some((section) => section.id === targetId)) return undefined;

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ block: 'start' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    document.title = 'SciForge | 科研 Skill、MCP 与 Plugin 资源库';
  }, []);

  useEffect(() => {
    const rail = filterRailRef.current;
    const activeButton = rail?.querySelector('[aria-pressed="true"]');
    if (!rail || !activeButton) return;

    const railRect = rail.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();
    const buttonLeftInRail = buttonRect.left - railRect.left + rail.scrollLeft;
    const targetLeft = buttonLeftInRail - ((rail.clientWidth - buttonRect.width) / 2);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    rail.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }, [activeFilter]);

  useEffect(() => {
    const next = new URLSearchParams(serializedParams);
    next.delete('field');
    next.delete('scope');
    next.delete('theme');

    if (activeFilter === 'general') next.set('scope', 'general');
    else if (activeFilter !== 'all') next.set('field', activeFilter);

    if (next.toString() !== serializedParams) setSearchParams(next, { replace: true });
  }, [activeFilter, serializedParams, setSearchParams]);

  const handleQueryChange = (value) => {
    updateParams({ q: value.trim() ? value : null }, { replace: true });
  };

  const handleFilterChange = (filterId) => {
    if (filterId === 'general') {
      updateParams({ field: null, scope: 'general' });
      return;
    }

    updateParams({
      field: filterId === 'all' ? null : filterId,
      scope: null,
    });
  };

  const clearAllFilters = () => {
    updateParams({ field: null, scope: null, q: null });
  };

  return (
    <div className="home-page theme-harbor">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="container home-hero-inner">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot" aria-hidden="true" />
            科研 Skill · MCP · Plugin
          </div>

          <h1 id="home-title" className="title-3d" data-text="SciForge">
            SciForge
          </h1>

          <p className="hero-heading">专注于科研工作的 Skill、MCP 与 Plugin 资源库</p>
          <p className="hero-description">
            精选并整理真正适合科研工作的 Agent 资源，按类型、适用范围和学科快速找到所需工具。
          </p>

          <SearchBar
            value={query}
            onChange={handleQueryChange}
            totalCount={filterTotal}
            scopeLabel={activeFilter === 'all' ? '' : activeFilterLabel}
          />
        </div>
      </section>

      {location.state?.catalogNotice && (
        <div className="container legacy-route-notice" role="status">
          {location.state.catalogNotice}
        </div>
      )}

      <section className="field-filter-section" aria-labelledby="field-filter-title">
        <div className="container">
          <div className="field-filter-heading">
            <h2 id="field-filter-title">资源分类</h2>
          </div>

          <div
            ref={filterRailRef}
            className="field-filters"
            role="group"
            aria-label="全局资源分类筛选"
          >
            {FILTER_GROUPS.map((group) => (
              <div
                key={group.id}
                className={`field-filter-group field-filter-group-${group.id}`}
                role="group"
                aria-label={group.label}
              >
                {group.options.map((option) => {
                  const hasMatches = catalogService.filterResources(queryMatches, option.id).length > 0;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={`field-filter ${activeFilter === option.id ? 'active' : ''} ${hasMatches ? '' : 'is-empty'}`}
                      aria-label={hasMatches
                        ? option.label
                        : `${option.label}，资源正在收录`}
                      aria-pressed={activeFilter === option.id}
                      onClick={() => handleFilterChange(option.id)}
                    >
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="resource-directory">
        {filteredResources.length > 0 ? (
          sections.map((section) => (
            <ResourceSection
              key={section.id}
              {...section}
              activeFilterLabel={activeFilterLabel}
              query={query}
            />
          ))
        ) : (
          <section className="resource-search-empty" aria-labelledby="empty-search-title">
            <div className="container">
              <h2 id="empty-search-title">
                {query.trim()
                  ? `在${activeFilter === 'all' ? '全部资源' : activeFilterLabel}中没有找到“${query.trim()}”`
                  : `${activeFilterLabel}资源正在收录中`}
              </h2>
              <p>
                {activeFilter === 'general' && !query.trim()
                  ? '收录不依赖特定学科对象、可跨学科复用的资源，如通用文献检索与获取、科研写作、引用管理，以及通用数据整理与绘图。学科专用工具仍归相应学科。'
                  : '可以切换资源分类或关键词，浏览其他科研资源。'}
              </p>
              <button type="button" className="clear-filters-button" onClick={clearAllFilters}>
                清除筛选
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default HomePage;
