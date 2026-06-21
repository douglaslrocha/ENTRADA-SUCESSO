import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { MemoryEntry } from '../../services/GlobalMemoryService';
import { Sparkles, User, Volume2, VolumeX, FileText, Download } from 'lucide-react';
import { haptics } from '../../services/HapticService';

interface MessageItemProps {
  message: MemoryEntry;
  isStreaming?: boolean;
  theme?: 'light' | 'dark';
}

export default function MessageItem({ message, isStreaming, theme }: MessageItemProps) {
  const isAssistant = message.role === 'assistant';
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      haptics.lightClick();
    } else {
      haptics.mediumClick();
      const text = message.content.replace(/[#*`]/g, ''); // Clean markdown for speech
      const newUtterance = new SpeechSynthesisUtterance(text);
      newUtterance.lang = 'pt-BR';
      newUtterance.rate = 1.0;
      
      newUtterance.onend = () => setIsSpeaking(false);
      newUtterance.onerror = () => setIsSpeaking(false);
      
      setUtterance(newUtterance);
      window.speechSynthesis.speak(newUtterance);
      setIsSpeaking(true);
    }
  };

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.2, ease: "easeOut" } }}
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex items-start ${isAssistant ? 'w-full' : 'gap-3 md:gap-5 flex-row-reverse max-w-[95%] ml-auto'} overflow-hidden shrink-0`}
    >
      {!isAssistant && (
        <div 
          className={`w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-xl border transition-all duration-500 ${
            theme === 'dark'
              ? 'bg-zinc-800 border-zinc-700 text-zinc-400'
              : 'bg-slate-500/10 border-slate-500/20 text-slate-600'
          }`}
        >
          <User size={18} />
        </div>
      )}

      <div className={`flex flex-col ${isAssistant ? 'items-start w-full' : 'items-end'} min-w-0 flex-1`}>
        {/* Attachments Display */}
        {message.attachments && message.attachments.length > 0 && (
          <div className={`mb-2 flex flex-wrap gap-2 ${isAssistant ? 'justify-start w-full' : 'justify-end'}`}>
            {message.attachments.map((file, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 ${
                  theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-black/5'
                }`}
              >
                {file.type.startsWith('image/') && file.url ? (
                  <img src={file.url} alt={file.name} className="max-w-[240px] max-h-[240px] object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="p-3 flex items-center gap-3 min-w-[180px]">
                    <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${theme === 'dark' ? 'bg-white/10' : 'bg-violet-500/10'}`}>
                      <FileText size={18} className={theme === 'dark' ? 'text-slate-300' : 'text-violet-500'} />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0 pr-4">
                      <span className="text-[11px] font-black truncate max-w-[120px] uppercase tracking-widest text-[var(--text)]">
                        {file.name}
                      </span>
                      <span className="text-[9px] text-[var(--muted)] opacity-60">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <Download size={14} className="text-[var(--muted)] opacity-40" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        <div 
          className={`relative px-4 py-2.5 md:px-6 md:py-3.5 rounded-2xl md:rounded-[28px] text-sm md:text-[15px] leading-relaxed shadow-sm border transition-all duration-300 group ${
            isAssistant 
              ? 'bg-[var(--surface)] border-[var(--border)] text-[var(--text)] rounded-tl-none w-full' 
              : theme === 'dark'
                ? 'bg-white/5 border-white/10 text-slate-200 rounded-tr-none'
                : 'bg-zinc-900 border-zinc-800 text-white rounded-tr-none'
          }`}
        >
          {isAssistant && (
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-[var(--border)] opacity-80">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                theme === 'dark' ? 'bg-white/10 text-white' : 'bg-violet-500/10 text-violet-600'
              }`}>
                <Sparkles size={14} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text)]">
                Amparadora
              </span>
              
              {!isStreaming && (
                <button 
                  onClick={toggleSpeech}
                  className={`ml-auto p-2 rounded-full transition-all ${
                    isSpeaking 
                      ? 'bg-violet-500 text-white shadow-lg scale-110' 
                      : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:text-violet-500 opacity-0 group-hover:opacity-100 hover:scale-105'
                  }`}
                >
                  {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
              )}
            </div>
          )}

          {isAssistant ? (
            <div className={`prose prose-sm md:prose-base dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/10 prose-pre:p-4 prose-pre:rounded-xl ${
              theme === 'dark' ? 'prose-code:text-white' : 'prose-code:text-violet-500'
            }`}>
              <ReactMarkdown>{message.content}</ReactMarkdown>
              {isStreaming && (
                <span className={`inline-block w-1.5 h-4 ml-1 animate-pulse align-middle ${
                  theme === 'dark' ? 'bg-white' : 'bg-violet-500'
                }`} />
              )}
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
        
        <span className={`mt-2 text-[9px] font-black tracking-widest text-[var(--muted)] opacity-50 uppercase flex items-center gap-1.5 px-2 ${isAssistant ? '' : 'justify-end'}`}>
          {isAssistant ? 'Resposta Síncrona' : 'Organismo'} • {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}
