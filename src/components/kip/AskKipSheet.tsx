import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Mic, Sparkles } from 'lucide-react';
import { useKipStore } from '../../hooks/useKipStore';
import KipAvatar from './KipAvatar';

/**
 * AskKipSheet - Global AI interface for the T-Mobile Sales Assistant.
 * Built as a bottom sheet (mobile) or side panel (desktop).
 */
export default function AskKipSheet() {
  const { isOpen, closeKip, messages, sendMessage, isTyping } = useKipStore();
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (inputValue.trim() && !isTyping) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeKip}
            className="fixed inset-0 z-[60] bg-black/64 backdrop-blur-md"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[70] flex h-[82vh] flex-col overflow-hidden rounded-t-[2.5rem] bg-t-dark-gray border-t border-white/10 md:right-0 md:left-auto md:top-0 md:h-full md:w-[420px] md:rounded-l-[2.5rem] md:rounded-t-none md:border-l md:border-t-0"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-white/5 p-6">
              <div className="flex items-center gap-3">
                <KipAvatar size="medium" state="listening" showGlow />
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight text-white">Ask Kip</h2>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-t-magenta">AI Support Intelligence</p>
                </div>
              </div>
              <button
                onClick={closeKip}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6 scrollbar-hide"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'kip' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`flex max-w-[85%] gap-3 ${msg.role === 'kip' ? 'flex-row' : 'flex-row-reverse'}`}>
                    {msg.role === 'kip' && (
                      <div className="mt-1 shrink-0">
                        <KipAvatar size="tiny" state="idle" />
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm md:text-base ${
                        msg.role === 'kip'
                          ? 'bg-white/5 text-white/90 rounded-tl-none border border-white/5'
                          : 'bg-t-magenta text-white rounded-tr-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start gap-3">
                  <div className="mt-1 shrink-0">
                    <KipAvatar size="tiny" state="listening" showGlow />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl bg-white/5 px-4 py-3">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="h-1.5 w-1.5 rounded-full bg-t-magenta"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                      className="h-1.5 w-1.5 rounded-full bg-t-magenta"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                      className="h-1.5 w-1.5 rounded-full bg-t-magenta"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="shrink-0 p-6">
              <div className="relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Kip anything..."
                  className="w-full resize-none rounded-[1.4rem] border border-white/10 bg-white/5 py-4 pl-5 pr-28 text-white placeholder:text-white/20 focus:border-t-magenta/50 focus:outline-none min-h-[64px] max-h-32"
                  rows={1}
                />
                <div className="absolute right-2 bottom-2 flex gap-1">
                  <button className="flex h-10 w-10 items-center justify-center rounded-xl text-white/40 hover:bg-white/5 hover:text-white transition-colors">
                    <Mic className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isTyping}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-t-magenta text-white shadow-[0_4px_12px_rgba(226,0,116,0.3)] disabled:opacity-50 disabled:shadow-none hover:bg-t-magenta/90"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 opacity-30">
                <Sparkles className="h-3 w-3 text-t-magenta" />
                {/* TODO: switch to 'Kip · Gemma' once live model is wired */}
                <span className="text-[9px] uppercase tracking-[0.25em] font-medium text-white">Kip · canon mode</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
