import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MemoryEntry } from '../../services/GlobalMemoryService';
import MessageItem from './MessageItem';

interface MessageListProps {
  messages: MemoryEntry[];
  streamingMessage?: string;
  isLoading: boolean;
  theme?: 'light' | 'dark';
}

export default function MessageList({ messages, streamingMessage, isLoading, theme }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const lastMessageRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (instant = false) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: instant ? 'auto' : 'smooth'
      });
    }
  };

  const scrollToLastMessageTop = () => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Keep track of previous state to detect when a message finishes
  const prevStreaming = useRef(streamingMessage);

  useEffect(() => {
    // If we are currently streaming, keep scrolling to bottom to see progress
    if (streamingMessage) {
      scrollToBottom();
    } 
    // If a streaming message JUST finished
    else if (prevStreaming.current && !streamingMessage) {
      const lastMsg = messages[messages.length - 1];
      // If it's a long assistant message (e.g. > 400 chars), scroll to its top
      if (lastMsg && lastMsg.role === 'assistant' && lastMsg.content.length > 400) {
        // Small delay to ensure DOM is updated
        setTimeout(scrollToLastMessageTop, 100);
      } else {
        scrollToBottom();
      }
    }
    
    prevStreaming.current = streamingMessage;
  }, [messages, streamingMessage]);

  // Initial scroll to bottom on mount
  useEffect(() => {
    scrollToBottom(true);
  }, []);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto overflow-x-hidden px-4 md:px-0 py-6 md:py-10 no-scrollbar scroll-smooth"
      style={{ touchAction: 'pan-y' }}
    >
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-10">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <div 
              key={msg.id} 
              ref={idx === messages.length - 1 ? lastMessageRef : null}
            >
              <MessageItem message={msg} theme={theme} />
            </div>
          ))}
          
          {streamingMessage && (
            <div ref={lastMessageRef}>
              <MessageItem 
                message={{ 
                  id: 'streaming', 
                  role: 'assistant', 
                  content: streamingMessage, 
                  timestamp: new Date().toISOString() 
                }} 
                isStreaming
                theme={theme}
              />
            </div>
          )}

          {isLoading && !streamingMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-4"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center animate-pulse ${
                theme === 'dark' ? 'bg-white/5' : 'bg-violet-500/10'
              }`}>
                <div className={`w-4 h-4 rounded-full ${
                  theme === 'dark' ? 'bg-white/20' : 'bg-violet-500'
                }`} />
              </div>
              <div className={`px-4 py-2 rounded-2xl text-sm italic flex items-center gap-2 ${
                theme === 'dark' ? 'bg-white/5 text-slate-400' : 'bg-[var(--surface)] text-[var(--muted)]'
              }`}>
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  Pensando...
                </motion.span>
                <div className="flex gap-1 ml-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className={`w-1 h-1 rounded-full ${theme === 'dark' ? 'bg-white/40' : 'bg-violet-500/40'}`}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ 
                        duration: 1, 
                        repeat: Infinity, 
                        delay: i * 0.2,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
