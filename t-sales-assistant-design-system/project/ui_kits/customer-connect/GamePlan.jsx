import React from 'react';
import { SectionHeader, PlayCard, HintBanner, CoachBanner } from './PlayCard.jsx';

export function GamePlan({ context }) {
  return (
    <div className="game-plan">
      <HintBanner />

      <SectionHeader eyebrow="Open Strong" title="First 30 Seconds" count={3} />
      <div className="play-grid">
        <PlayCard
          icon="message-square"
          eyebrow="The Low-Pressure Open"
          title="Lower the stakes"
          desc="Acknowledge they might just be looking. Gets them off the defensive."
          talkTrack="Hey! No pressure at all — are you just exploring what's out there today, or did something specific catch your eye?"
        />
        <PlayCard
          icon="target"
          eyebrow="The Bill-Check Lead"
          title="Anchor on the bill"
          desc="For 35-54 callers. Money is the doorway in."
          talkTrack="Mind if I pull up your current bill real quick? I want to make sure whatever we do today actually makes sense for you."
        />
      </div>

      <SectionHeader eyebrow="Dig Deeper" title="What's Really Going On?" count={2} />
      <div className="play-grid">
        <PlayCard
          icon="sparkles"
          eyebrow="One More Question"
          title="Ask one more than you think you need to"
          desc="The real objection usually lives on the second 'why.'"
          talkTrack="Got it — when you say the battery's rough, is it the mid-day slump, or are you making it to bedtime on a charge?"
        />
        <PlayCard
          icon="home"
          eyebrow="HINT Door Opener"
          title="Slip the address check in"
          desc="Phrase it as doing THEM a favor, not a pitch."
          talkTrack="While I've got you — what's the address? I want to see if you're in a spot where we can knock out that cable bill too."
        />
      </div>

      <CoachBanner>Slow down. Match their energy for the first 20 seconds before you try to lead.</CoachBanner>

      <SectionHeader eyebrow="Close It Out" title="Make It Easy to Say Yes" count={2} />
      <div className="play-grid">
        <PlayCard
          icon="shield"
          eyebrow="Non-Negotiable"
          title="P360 isn't an accessory"
          desc="Treat it as a given, not an add-on. One sentence, move on."
          talkTrack="I'm setting you up with P360 — that's your protection through the whole phone life. Standard on every upgrade."
        />
        <PlayCard
          icon="smartphone"
          eyebrow="Perfect Upgrade Cycle"
          title="Keep the bill flat"
          desc="Trade-in + Keep & Switch beats a raw upgrade for credit-sensitive callers."
          talkTrack="Based on what you're telling me, Keep & Switch is the smarter move — we bring your old phone over, no credit hit, and you keep the bill flat."
        />
      </div>
    </div>
  );
}
