import React from 'react';

export function Header({ title = "Your Game Plan", subtitle = "Exploring · 25-34 · Phone" }) {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="brand">
          <img src="../../assets/tmo-logo.svg" alt="T-Mobile" />
          <div className="brand-text">
            <div className="eyebrow">CustomerConnect AI</div>
            <div className="brand-title">T-Sales Assistant</div>
          </div>
        </div>
        <div className="header-ctx">
          <div className="eyebrow eyebrow--muted">Live Call</div>
          <div className="header-ctx-val">{subtitle}</div>
        </div>
      </div>
      <div className="app-title-row">
        <h1>{title}</h1>
        <button className="cta-ghost">Reset · New Call</button>
      </div>
    </header>
  );
}

export function TabBar({ active = "live", onChange = () => {} }) {
  const tabs = [
    { id: "live", label: "Live", icon: "zap" },
    { id: "learn", label: "Learn", icon: "book-open" },
    { id: "level", label: "Level Up", icon: "trophy" },
    { id: "discover", label: "Discover", icon: "target" },
  ];
  return (
    <nav className="tab-bar">
      {tabs.map(t => (
        <button key={t.id} className={`tab ${active === t.id ? 'tab--active' : ''}`} onClick={() => onChange(t.id)}>
          <i data-lucide={t.icon}></i>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
