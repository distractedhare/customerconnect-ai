import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Wifi, Loader2, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { localAiService } from '../services/localAiService';
import { InitProgressReport } from '@mlc-ai/web-llm';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface OfflineCoachProps {
  onOpenOfflineAiSettings?: () => void;
}

const GENERIC_COACH_PATTERNS = [
  /unmatched/i,
  /superior service/i,
  /exceptional customer support/i,
  /future-?proof/i,
  /seamless integration/i,
  /your satisfaction is our top priority/i,
];

function buildFallbackCoachReply(objection: string): string {
  const lower = objection.toLowerCase();
  const mentionsPrice = /(cheap|cheaper|price|pricing|expens|cost|bill|save|saving)/.test(lower);
  const mentionsSwitch = /(switch|switching|port|porting|transfer|move everything|hassle|setup)/.test(lower);
  const mentionsCoverage = /(coverage|signal|service|network|bars|reception)/.test(lower);

  if (mentionsPrice && mentionsSwitch) {
    return [
      'Say: Totally fair. Nobody switches just to switch, so let’s put the real monthly total and perks side by side first.',
      'Proof: If the math wins, we handle the port and setup with you so it does not turn into a project.',
      'Ask: If the savings were real and the switch was guided, would you want to see it?'
    ].join('\n');
  }

  if (mentionsPrice) {
    return [
      'Say: I get that. The fastest way to see if it is worth it is to compare the full bill, not just the sticker price.',
      'Proof: Promos, streaming perks, and trade-in value usually change the math more than people expect.',
      'Ask: What are you paying now, all in, so we can compare it cleanly?'
    ].join('\n');
  }

  if (mentionsCoverage) {
    return [
      'Say: Fair pushback. Let’s check the places you actually use your phone most instead of guessing from old network stories.',
      'Proof: A quick coverage check is more useful than a generic carrier reputation.',
      'Ask: If the coverage looks good where you live and work, would you be open to the numbers?'
    ].join('\n');
  }

  if (mentionsSwitch) {
    return [
      'Say: That makes sense. The switch feels bigger in your head than it usually is on the floor.',
      'Proof: We walk the port, setup, and transfer with you so you are not stuck figuring it out alone.',
      'Ask: If the setup was guided, what would still feel risky about moving?'
    ].join('\n');
  }

  return [
    'Say: That is fair. Let’s keep it simple and focus on the one thing that would make switching worth it for you.',
    'Proof: Once we know the real blocker, we can show the exact promo or plan that solves it.',
    'Ask: What would have to be true for you to feel good about making a change today?'
  ].join('\n');
}

function normalizeCoachReply(raw: string, objection: string): string {
  const cleaned = raw
    .replace(/^gemma coach\s*[-:]\s*/i, '')
    .replace(/[“”]/g, '"')
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n')
    .trim();

  if (!cleaned || cleaned.length > 420 || GENERIC_COACH_PATTERNS.some((pattern) => pattern.test(cleaned))) {
    return buildFallbackCoachReply(objection);
  }

  const lineSource = cleaned
    .split(/\n+/)
    .map((line) => line.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean);

  const lines = (lineSource.length >= 3
    ? lineSource.slice(0, 3)
    : cleaned
        .split(/(?<=[.!?])\s+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 3)
  );

  if (lines.length < 2) {
    return buildFallbackCoachReply(objection);
  }

  return [
    lines[0]?.startsWith('Say:') ? lines[0] : `Say: ${lines[0]}`,
    lines[1]?.startsWith('Proof:') ? lines[1] : `Proof: ${lines[1]}`,
    lines[2]
      ? (lines[2].startsWith('Ask:') ? lines[2] : `Ask: ${lines[2]}`)
      : buildFallbackCoachReply(objection).split('\n')[2],
  ].join('\n');
}

export default function OfflineCoach({ onOpenOfflineAiSettings }: OfflineCoachProps) {
  const [isReady, setIsReady] = useState(localAiService.isReady());
  const [progress, setProgress] = useState<InitProgressReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "I'm your offline Gemma coach. I run entirely on your device, so I work instantly even in dead zones. What objection are you stuck on?",
    }
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribeProgress = localAiService.onProgress((p) => setProgress(p));
    const unsubscribeReady = localAiService.onReady((ready) => setIsReady(ready));

    return () => {
      unsubscribeProgress();
      unsubscribeReady();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !isReady || isGenerating) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsGenerating(true);

    try {
      const systemPrompt = `You are a T-Mobile retail floor coach helping a rep handle one objection in the moment.
Reply in exactly 3 short lines with these labels:
Say:
Proof:
Ask:
Rules:
- sound like a real store rep, not a corporate ad
- 55 words max total
- plain spoken English
- acknowledge the concern first
- if price is mentioned, compare the total bill and value
- if switching hassle is mentioned, mention guided setup or port help
- never use phrases like unmatched, superior service, exceptional customer support, future-proof, or seamless integration`;
      const response = await localAiService.generateResponse(userMsg.content, systemPrompt);
      const normalized = normalizeCoachReply(response, userMsg.content);
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: normalized
      }]);
    } catch (err) {
      console.error("Generation error:", err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: buildFallbackCoachReply(userMsg.content)
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (error) {
    return (
      <div className="rounded-2xl border border-error-border bg-error-surface p-6 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-error-accent mb-3" />
        <h3 className="text-sm font-bold text-error-foreground mb-2">Offline Coach Unavailable</h3>
        <p className="text-xs text-error-foreground/80">{error}</p>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="rounded-3xl border border-t-light-gray bg-surface p-8 text-center shadow-lg glass-card">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-t-magenta/10">
          <Wifi className="h-8 w-8 text-t-magenta" />
        </div>
        <h2 className="mb-2 text-lg font-extrabold tracking-tight">Gemma Offline Coach Not Ready</h2>
        <p className="mb-6 text-sm text-t-dark-gray">
          Download Gemma before the shift starts so the rep-safe coach is ready when service drops.
        </p>
        
        <div className="p-4 rounded-2xl border border-t-light-gray bg-t-light-gray/5 mb-6">
          <p className="text-xs font-medium text-t-dark-gray">
            Open <strong>Settings → Offline AI</strong> to download the model and confirm the device is ready.
          </p>
        </div>

        {onOpenOfflineAiSettings ? (
          <button
            type="button"
            onClick={onOpenOfflineAiSettings}
            className="focus-ring mb-4 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-t-magenta px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-[0_12px_24px_rgba(226,0,116,0.22)] transition-transform hover:scale-[1.01] active:scale-95"
          >
            Open Offline AI Settings
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        ) : null}

        {progress && (
          <div className="mx-auto max-w-sm text-left mb-4">
            <div className="mb-2 flex justify-between text-xs font-bold text-t-dark-gray">
              <span>{progress.text}</span>
              <span>{Math.round((progress.progress || 0) * 100)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-t-light-gray">
              <div 
                className="h-full bg-t-magenta transition-all duration-300" 
                style={{ width: `${Math.max(5, (progress.progress || 0) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-[600px] flex-col rounded-3xl border border-t-light-gray bg-surface shadow-lg glass-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-t-light-gray bg-surface-elevated px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-t-magenta/10">
            <Wifi className="h-5 w-5 text-t-magenta" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold tracking-tight">Gemma Coach</h2>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-success-accent">
              <ShieldCheck className="h-3 w-3" />
              <span>100% Private & Offline</span>
            </div>
          </div>
        </div>
        <div className="rounded-full bg-t-light-gray/50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-t-dark-gray">
          Powered by Gemma
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user' 
                  ? 'bg-t-magenta text-white rounded-tr-sm' 
                  : 'bg-t-light-gray/30 text-foreground rounded-tl-sm border border-t-light-gray'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="mb-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-t-magenta">
                  <Bot className="h-3 w-3" />
                  <span>Gemma Coach</span>
                </div>
              )}
              <p className="leading-relaxed whitespace-pre-line">{msg.content}</p>
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-t-light-gray bg-t-light-gray/30 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-t-magenta" />
                <span className="text-xs font-medium text-t-dark-gray">Gemma is thinking…</span>
                </div>
              </div>
            </div>
          )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-t-light-gray bg-surface-elevated p-4">
        <div className="relative flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type an objection (e.g., 'Verizon is cheaper')…"
            className="focus-ring min-h-[52px] w-full resize-none rounded-xl border border-t-light-gray bg-surface px-4 py-3 text-sm placeholder:text-t-muted focus:border-t-magenta"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isGenerating}
            className="focus-ring flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-t-magenta text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
