import React from 'react';
import './CompatMatrix.css';

const STATUS_META = {
  yes: { label: '支持', icon: '✓', className: 'compat-status-yes' },
  partial: { label: '部分支持', icon: '◐', className: 'compat-status-partial' },
  no: { label: '不支持', icon: '✗', className: 'compat-status-no' }
};

const GPU_META = {
  none: { label: '无需 GPU', icon: '🖥️' },
  optional: { label: 'GPU 可选 (加速)', icon: '⚡' },
  required: { label: 'GPU 必需', icon: '🔥' }
};

const OS_META = [
  { key: 'windows', label: 'Windows' },
  { key: 'macos', label: 'macOS' },
  { key: 'linux', label: 'Linux' }
];

const CompatMatrix = ({ compat }) => {
  if (!compat) return null;

  const { hosts = [], os = {}, runtime, gpu = 'none', permissions = [], dependencies = [] } = compat;
  const gpuInfo = GPU_META[gpu] || GPU_META.none;

  return (
    <div className="compat-section">
      <div className="compat-section-header">
        <h3>兼容性与环境核验矩阵 (Compatibility Matrix)</h3>
        <span className="compat-verified-tag">✓ 已人工核验</span>
      </div>
      <p className="compat-section-sub">
        安装前请核对您的 Agent 宿主与运行环境。以下信息由 SciForge 逐项核验，而非搬运 README。
      </p>

      <div className="compat-grid">
        {/* Agent Host Compatibility */}
        <div className="compat-panel">
          <div className="compat-panel-title">🤖 Agent 宿主兼容性</div>
          <div className="compat-host-list">
            {hosts.map(host => {
              const meta = STATUS_META[host.status] || STATUS_META.no;
              return (
                <div key={host.name} className="compat-host-row">
                  <span className="compat-host-name">{host.name}</span>
                  <span className={`compat-status-badge ${meta.className}`}>
                    <span className="compat-status-icon">{meta.icon}</span>
                    {meta.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Runtime Environment */}
        <div className="compat-panel">
          <div className="compat-panel-title">⚙️ 运行环境要求</div>

          <div className="compat-env-row">
            <span className="compat-env-label">操作系统</span>
            <div className="compat-os-pills">
              {OS_META.map(({ key, label }) => (
                <span
                  key={key}
                  className={`compat-os-pill ${os[key] ? 'supported' : 'unsupported'}`}
                >
                  {os[key] ? '✓' : '✗'} {label}
                </span>
              ))}
            </div>
          </div>

          <div className="compat-env-row">
            <span className="compat-env-label">运行时</span>
            <span className="compat-env-value">
              <code>{runtime || '未标注'}</code>
            </span>
          </div>

          <div className="compat-env-row">
            <span className="compat-env-label">GPU 需求</span>
            <span className="compat-env-value">
              <span className="compat-gpu-tag">{gpuInfo.icon} {gpuInfo.label}</span>
            </span>
          </div>
        </div>

        {/* Permission Declaration */}
        <div className="compat-panel">
          <div className="compat-panel-title">🛡️ 权限声明</div>
          <ul className="compat-perm-list">
            {permissions.map((perm, idx) => (
              <li key={idx}>
                <span className="compat-perm-dot"></span>
                {perm}
              </li>
            ))}
          </ul>
        </div>

        {/* Dependencies */}
        <div className="compat-panel">
          <div className="compat-panel-title">📦 核心依赖清单</div>
          <div className="compat-dep-list">
            {dependencies.map(dep => (
              <code key={dep} className="compat-dep-pill">{dep}</code>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompatMatrix;
