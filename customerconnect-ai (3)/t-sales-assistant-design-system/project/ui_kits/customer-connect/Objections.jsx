import React from 'react';
import { PlayCard, SectionHeader, HintBanner } from './PlayCard.jsx';

export function Objections() {
  const objections = [
    {
      label: "Too expensive",
      reframe: "Anchor on their current bill, not our price.",
      talkTrack: "Totally fair — what are you paying right now? Let me see if we can actually shrink that before we talk about anything new.",
    },
    {
      label: "I'm not ready to switch",
      reframe: "Agree with them. Don't push. Ask one more question.",
      talkTrack: "Yeah, switching's a hassle — I get it. If I could make the switching part disappear, would the rest actually make sense?",
    },
    {
      label: "I need to talk to my spouse",
      reframe: "Offer to hold the deal. Real deadline, no pressure.",
      talkTrack: "Smart move. Here's what I'll do — I'll hold these numbers on my side through tonight. Loop them in, call me back, we pick right up.",
    },
  ];
  return (
    <div className="objections">
      <HintBanner />
      <SectionHeader eyebrow="Getting Pushback?" title="Let's Flip It" count={objections.length} />
      <div className="obj-list">
        {objections.map((o, i) => (
          <div key={i} className="obj-card glass">
            <div className="obj-head">
              <span className="obj-quote">"{o.label}"</span>
              <span className="pill pill--soft">Flip it</span>
            </div>
            <p className="obj-reframe">{o.reframe}</p>
            <div className="tt-well"><div className="talk-track">"{o.talkTrack}"</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}
