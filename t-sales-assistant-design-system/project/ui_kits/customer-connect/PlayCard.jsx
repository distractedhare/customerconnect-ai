import React from 'react';

export function PlayCard({ icon = "zap", eyebrow = "Quick Play", title, desc, talkTrack }) {
  return (
    <article className="play-card glass">
      <header className="play-card-head">
        <span className="play-badge"><i data-lucide={icon}></i></span>
        <div>
          <div className="eyebrow eyebrow--muted">{eyebrow}</div>
          <div className="play-title">{title}</div>
        </div>
      </header>
      {desc && <p className="play-desc">{desc}</p>}
      {talkTrack && (
        <div className="tt-well">
          <div className="talk-track">"{talkTrack}"</div>
        </div>
      )}
    </article>
  );
}

export function HintBanner() {
  return (
    <div className="hint-banner">
      <span className="hint-ico"><i data-lucide="wifi"></i></span>
      <div className="hint-text">
        Check the address for Home Internet first. Rebate + Month On Us land best after availability is confirmed.
      </div>
    </div>
  );
}

export function CoachBanner({ children = "Smile while you say this. Your energy sets the tone for the entire interaction." }) {
  return (
    <aside className="coach-banner">
      <p><span>Coach:</span> {children}</p>
    </aside>
  );
}

export function SectionHeader({ eyebrow, title, count }) {
  return (
    <div className="section-head">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h2>{title}</h2>
      </div>
      {count != null && <div className="section-count">{count}</div>}
    </div>
  );
}
