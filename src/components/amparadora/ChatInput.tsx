import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Sparkles, Paperclip, Image as ImageIcon, FileText, Plus, Square, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { haptics } from '../../services/HapticService';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  theme?: 'light' | 'dark';
  onFileSelect?: (file: File) => void;
}

export default function ChatInput({ onSend, isLoading, theme, onFileSelect }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  // Handle Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'pt-BR';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setValue(prev => prev + (prev.length ? ' ' : '') + finalTranscript);
          haptics.lightClick();
        }
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        haptics.lightClick();
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        haptics.error();
      };
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      haptics.mediumClick();
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
        haptics.success();
      } catch (err) {
        console.error('Failed to start recording:', err);
        haptics.error();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onFileSelect?.(file);
      setShowAttachments(false);
      haptics.success();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((value.trim() || selectedFile) && !isLoading) {
      haptics.send();
      onSend(value);
      setValue('');
      setSelectedFile(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4 pt-1 relative z-20">
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`mb-2 inline-flex items-center gap-2 p-2 px-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg overflow-hidden group`}
          >
            <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${theme === 'dark' ? 'bg-white/10' : 'bg-violet-500/10'}`}>
              <FileText size={16} className={theme === 'dark' ? 'text-white' : 'text-violet-500'} />
            </div>
            <div className="flex flex-col min-w-0 pr-8">
              <span className="text-[10px] font-black truncate max-w-[150px] uppercase tracking-widest text-[var(--text)]">
                {selectedFile.name}
              </span>
              <span className="text-[8px] text-[var(--muted)] opacity-60">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
            </div>
            <button 
              onClick={() => setSelectedFile(null)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors"
            >
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative group">
        {/* Subtle Glow Effect */}
        <div className={`absolute -inset-1 bg-gradient-to-r rounded-2xl blur-lg transition-opacity duration-700 ${isFocused || isRecording ? 'opacity-100' : 'opacity-0'} ${
          isRecording 
            ? 'from-red-500/20 via-red-500/10 to-red-500/20'
            : theme === 'dark'
              ? 'from-white/10 via-white/5 to-white/10'
              : 'from-violet-500/5 via-blue-500/5 to-violet-500/5'
        }`} />
        
        <div className={`relative bg-[var(--surface)] border transition-all duration-300 rounded-full shadow-lg shadow-black/5 overflow-visible ${
          isRecording
            ? 'border-red-500/40 ring-1 ring-red-500/10'
            : isFocused 
              ? theme === 'dark' 
                ? 'border-white/40 shadow-white/10' 
                : 'border-violet-500/20 shadow-violet-500/5'
              : 'border-[var(--border)]'
        }`}>
          <form 
            onSubmit={handleSubmit}
            className="flex items-center gap-1 p-1 px-1.5"
          >
            {/* Hidden inputs */}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileUpload}
            />

            {/* Multimodal Trigger */}
            <div className="relative flex-shrink-0">
              <button 
                type="button"
                onClick={() => setShowAttachments(!showAttachments)}
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${
                  showAttachments 
                    ? theme === 'dark' ? 'bg-white text-black shadow-white/20' : 'bg-violet-600 text-white shadow-violet-500/20 shadow-lg'
                    : `text-[var(--muted)] hover:bg-[var(--bg)] ${theme === 'dark' ? 'hover:text-white' : 'hover:text-violet-500'}`
                }`}
              >
                <Plus size={18} className={`transition-transform duration-300 ${showAttachments ? 'rotate-45' : ''}`} />
              </button>

              <AnimatePresence>
                {showAttachments && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowAttachments(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: -12, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      className="absolute bottom-full left-0 mb-2 flex items-center gap-1 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl p-1 z-50 origin-bottom-left backdrop-blur-xl"
                    >
                      {[
                        { icon: ImageIcon, label: 'Imagem', color: 'text-blue-500/80', bg: 'hover:bg-blue-500/5', action: () => fileInputRef.current?.click() },
                        { icon: FileText, label: 'Documento', color: theme === 'dark' ? 'text-white' : 'text-violet-500/80', bg: theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-violet-500/5', action: () => fileInputRef.current?.click() },
                        { icon: Paperclip, label: 'Anexo', color: theme === 'dark' ? 'text-white/80' : 'text-purple-500/80', bg: theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-purple-500/5', action: () => fileInputRef.current?.click() }
                      ].map((item, i) => (
                        <button 
                          key={i}
                          type="button"
                          onClick={() => {
                            item.action();
                            setShowAttachments(false);
                          }}
                          className={`flex items-center gap-2 px-3 py-2 ${item.bg} rounded-xl transition-all text-[10px] font-black uppercase tracking-widest text-[var(--text)] group opacity-80 hover:opacity-100 whitespace-nowrap`}
                        >
                          <item.icon size={14} className={item.color} />
                          {item.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <textarea
              ref={textareaRef}
              rows={1}
              value={value}
              onFocus={() => {
                setIsFocused(true);
                haptics.focusGain();
              }}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => {
                setValue(e.target.value);
                haptics.lightClick();
              }}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? "Ouvindo atentamente..." : "Pesquise..."}
              className="flex-1 bg-transparent border-none focus:ring-0 py-2 px-3 text-[var(--text)] text-sm md:text-[15px] placeholder:text-[var(--muted)]/40 resize-none no-scrollbar min-h-[38px] max-h-32"
            />

            <div className="flex items-center gap-1.5 flex-shrink-0 pr-1">
              <button 
                type="button"
                onClick={toggleRecording}
                className={`w-9 h-9 flex items-center justify-center transition-all rounded-full hover:bg-[var(--bg)] ${
                  isRecording
                    ? 'text-red-500 bg-red-500/10 ring-2 ring-red-500/20'
                    : isFocused 
                      ? theme === 'dark' ? 'text-white bg-white/5' : 'text-violet-500 bg-violet-500/5' 
                      : 'text-[var(--muted)]'
                }`}
                title={isRecording ? "Parar de ouvir" : "Escutar"}
              >
                <div className="relative">
                  {isRecording ? <Square size={16} className="fill-current" /> : <Mic size={19} />}
                  {(isFocused || isRecording) && (
                    <motion.div 
                      layoutId="mic-active"
                      className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                        isRecording ? 'bg-red-500' : theme === 'dark' ? 'bg-white' : 'bg-violet-500'
                      }`}
                      animate={isRecording ? { scale: [1, 2, 1], opacity: [0.5, 1, 0.5] } : { scale: [1, 1.5, 1] }}
                      transition={{ duration: isRecording ? 0.8 : 1.5, repeat: Infinity }}
                    />
                  )}
                </div>
              </button>

              <AnimatePresence mode="wait">
                {value.trim() || selectedFile ? (
                  <motion.button
                    key="send"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-9 h-9 flex items-center justify-center bg-slate-900 text-white rounded-full hover:bg-black active:scale-90 transition-all disabled:opacity-30 shadow-md shadow-black/10"
                    onClick={() => haptics.heavyClick()}
                  >
                    <Send size={16} />
                  </motion.button>
                ) : (
                  <div className={`w-9 h-9 flex items-center justify-center ${
                    theme === 'dark' ? 'text-white/20' : 'text-violet-500/20'
                  }`}>
                    <Sparkles size={16} />
                  </div>
                )}
              </AnimatePresence>
            </div>
          </form>
        </div>
      </div>
      
      <div className="mt-1.5 flex items-center justify-center gap-1.5 text-[7px] text-[var(--muted)] font-black uppercase tracking-[0.4em] px-4 opacity-20">
        Sincronia • Biológica
      </div>
    </div>
  );
}
