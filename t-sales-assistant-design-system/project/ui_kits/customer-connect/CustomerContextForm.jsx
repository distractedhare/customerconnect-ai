import React from 'react';

export function CustomerContextForm({ value, onChange }) {
  const intents = [
    { id: "exploring", label: "Exploring" },
    { id: "upgrade", label: "Upgrade" },
    { id: "addline", label: "Add a Line" },
    { id: "newline", label: "New Line" },
    { id: "hint", label: "HINT" },
  ];
  const ages = ["18-24", "25-34", "35-54", "55+"];
  const vibes = ["Warm", "Reserved", "Skeptical", "In a Hurry"];

  return (
    <section className="form-card glass">
      <div className="eyebrow">Customer Context</div>
      <h2>Who's on the line?</h2>

      <div className="field">
        <div className="label">Call intent</div>
        <div className="chip-row">
          {intents.map(i => (
            <button key={i.id} className={`chip ${value.intent === i.id ? 'chip--active' : ''}`} onClick={() => onChange({ ...value, intent: i.id })}>
              {i.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <div className="label">Age range</div>
        <div className="chip-row">
          {ages.map(a => (
            <button key={a} className={`chip ${value.age === a ? 'chip--active' : ''}`} onClick={() => onChange({ ...value, age: a })}>
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <div className="label">Vibe</div>
        <div className="chip-row">
          {vibes.map(v => (
            <button key={v} className={`chip ${value.vibe === v ? 'chip--active' : ''}`} onClick={() => onChange({ ...value, vibe: v })}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <button className="cta-primary">
        Build Live Plan <i data-lucide="arrow-right"></i>
      </button>
    </section>
  );
}
