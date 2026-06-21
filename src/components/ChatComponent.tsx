import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Loader2, Send, Mic, Sparkles, Paperclip, Image as ImageIcon, FileText, Plus, Square, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { haptics } from '../services/HapticService';

const PHRASES = [
  "O sucesso é a soma de pequenos esforços repetidos diariamente.",
  "A disciplina é a ponte entre metas e realizações.",
  "Foco no que você pode controlar.",
  "Sua gestão financeira reflete sua maturidade.",
  "Pense grande, comece pequeno, aja agora.",
  "A clareza precede a maestria.",
  "Onde há ordem, há progresso.",
  "Transforme dados em decisões inteligentes.",
  "A excelência não é um ato, mas um hábito.",
  "Onde há foco, a energia flui.",
  "Decisões baseadas em dados superam intuições vagas.",
  "Sua visão determina seu destino.",
  "A consistência é o que transforma o comum em extraordinário.",
  "Planejamento sem execução é apenas alucinação.",
  "O tempo é o recurso mais escasso; use-o com sabedoria.",
  "Grandes conquistas exigem grandes responsabilidades.",
  "A clareza de propósito é o ponto de partida de todo sucesso.",
  "O conhecimento é poder, mas a aplicação é o que gera resultados.",
  "Seja o arquiteto do seu próprio futuro financeiro.",
  "A resiliência é a chave para superar qualquer obstáculo.",
  "Pequenas melhorias diárias levam a resultados massivos.",
  "O sucesso deixa rastros; siga os padrões da excelência.",
  "A autodisciplina é a forma mais pura de amor-próprio.",
  "Mantenha os pés no chão e a mente nas estrelas.",
  "A estratégia é a arte de fazer escolhas difíceis.",
  "O crescimento acontece fora da zona de conforto.",
  "Integridade é fazer o certo mesmo quando ninguém está olhando.",
  "Sua rede de contatos é o seu patrimônio líquido.",
  "O fracasso é apenas uma oportunidade para recomeçar com mais inteligência.",
  "A paciência é amarga, mas seu fruto é doce.",
  "O segredo do sucesso é a constância do propósito.",
  "Valorize o processo tanto quanto o resultado.",
  "A inovação distingue um líder de um seguidor.",
  "Otimismo é a fé que leva à realização.",
  "A coragem não é a ausência de medo, mas o triunfo sobre ele.",
  "O trabalho duro supera o talento quando o talento não trabalha duro.",
  "Defina suas prioridades ou alguém as definirá por você.",
  "A simplicidade é o último grau de sofisticação.",
  "Aprenda com o passado, planeje o futuro e viva o presente.",
  "A mente que se abre a uma nova ideia jamais volta ao seu tamanho original.",
  "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
  "A sorte favorece a mente preparada.",
  "Seja a mudança que você deseja ver no mundo.",
  "O único lugar onde o sucesso vem antes do trabalho é no dicionário.",
  "A melhor maneira de prever o futuro é criá-lo.",
  "Não espere por oportunidades, crie-as.",
  "O que não pode ser medido, não pode ser gerenciado.",
  "Foco é dizer não a centenas de outras boas ideias.",
  "A excelência é o resultado de muita prática e persistência.",
  "O sucesso não é definitivo, o fracasso não é fatal: é a coragem de continuar que conta.",
  "Acredite que você pode e você já está no meio do caminho.",
  "O único limite para a nossa realização de amanhã são as nossas dúvidas de hoje.",
  "A motivação é o que faz você começar. O hábito é o que faz você continuar.",
  "O sucesso é caminhar de fracasso em fracasso sem perder o entusiasmo.",
  "A jornada de mil milhas começa com um único passo.",
  "O que você faz hoje pode melhorar todos os seus amanhãs.",
  "A vida é 10% o que acontece com você e 90% como você reage a isso.",
  "A maior glória em viver não reside em nunca cair, mas em nos levantarmos cada vez que caímos.",
  "Se você quer algo que nunca teve, precisa estar disposto a fazer algo que nunca fez.",
  "A clareza mental é a base para decisões assertivas.",
  "O planejamento financeiro é a base da liberdade.",
  "A inteligência emocional é tão importante quanto a técnica.",
  "O compromisso com a excelência é inegociável.",
  "A disciplina é a alma de um exército; ela torna grandes os pequenos contingentes.",
  "A sabedoria é a recompensa por ouvir quando você preferia falar.",
  "O sucesso é a soma de pequenos detalhes bem executados.",
  "A visão sem ação é um sonho; ação sem visão é um pesadelo.",
  "O caráter é o que você é quando ninguém está olhando.",
  "A excelência é um processo contínuo de autossuperação.",
  "O foco é a chave para abrir as portas da produtividade.",
  "A gestão do tempo é a gestão da própria vida.",
  "O conhecimento aplicado é a maior riqueza de um profissional.",
  "A resiliência transforma desafios em degraus para o sucesso."
];

interface ChatComponentProps {
  onRecordInterpreted?: (record: any) => void;
  onCanvasResponse?: (response: any) => void;
}

const AnimatedStars = ({ size = 20 }: { size?: number }) => (
  <div className="flex items-center gap-0.5 md:gap-1.5 px-0.5">
    <motion.svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="w-[22px] h-[22px] md:w-[20px] md:h-[20px]"
    >
      <defs>
        <linearGradient id="star-shine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.9)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <motion.path
        d="M12 3c0 4.5 4.5 9 9 9-4.5 0-9 4.5-9 9 0-4.5-4.5-9-9-9 4.5 0 9-4.5 9-9Z"
        fill="#4285F4"
        animate={{ 
          scale: [1, 1.15, 1],
          rotate: [0, 5, 0, -5, 0]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.svg>
    <motion.span 
      className="text-[#4285F4] font-bold text-[14px] md:text-[13px] leading-none tracking-tight"
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      AI
    </motion.span>
  </div>
);

export default function ChatComponent({ }: ChatComponentProps) {
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const placeholder = useMemo(() => {
    const hour = new Date().getHours();
    let greeting = "";
    if (hour >= 5 && hour < 12) greeting = "Bom dia Douglas, vamos?";
    else if (hour >= 12 && hour < 18) greeting = "Boa tarde Douglas, vamos?";
    else if (hour >= 18 && hour < 24) greeting = "Boa noite Douglas, vamos nessa?";
    else greeting = "Boa madrugada Douglas, vamos nessa?";
    return `${greeting} ${PHRASES[Math.floor(Math.random() * PHRASES.length)]}`;
  }, []);

  // Handle Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'pt-BR';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
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

      recognitionRef.current.onerror = () => {
        setIsRecording(false);
        haptics.error();
      };
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
        haptics.success();
      } catch (err) {
        haptics.error();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowAttachments(false);
      haptics.success();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((value.trim() || selectedFile) && !isLoading) {
      haptics.send();
      setIsLoading(true);
      
      // Navigate to Amparadora and pass the message
      navigate('/amparadora', { 
        state: { 
          initialMessage: value,
          initialFile: selectedFile 
        } 
      });
      
      setValue('');
      setSelectedFile(null);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50">
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-2 inline-flex items-center gap-2 p-2 px-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg overflow-hidden group relative"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-violet-500/10">
              <FileText size={16} className="text-violet-500" />
            </div>
            <div className="flex flex-col min-w-0 pr-8">
              <span className="text-[10px] font-black truncate max-w-[150px] uppercase tracking-widest text-[var(--text)]">
                {selectedFile.name}
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
        <div className={`absolute -inset-1 bg-gradient-to-r from-violet-500/20 via-blue-500/10 to-violet-500/20 rounded-2xl blur-lg transition-opacity duration-700 ${isFocused || isRecording ? 'opacity-100' : 'opacity-0'}`} />
        
        <div className={`relative bg-[var(--surface)] border transition-all duration-300 rounded-full shadow-lg shadow-black/5 overflow-visible ${
          isRecording ? 'border-red-500/40' : isFocused ? 'border-violet-500/20' : 'border-[var(--border)]'
        }`}>
          <form onSubmit={handleSubmit} className="flex items-center gap-1 p-1 px-1.5">
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />

            <div className="relative flex-shrink-0">
              <button 
                type="button"
                onClick={() => setShowAttachments(!showAttachments)}
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${
                  showAttachments ? 'bg-violet-600 text-white shadow-lg' : 'text-[var(--muted)] hover:bg-[var(--bg)] hover:text-violet-500'
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
                        { icon: ImageIcon, label: 'Imagem', color: 'text-blue-500/80', action: () => fileInputRef.current?.click() },
                        { icon: FileText, label: 'Documento', color: 'text-violet-500/80', action: () => fileInputRef.current?.click() },
                      ].map((item, i) => (
                        <button 
                          key={i}
                          type="button"
                          onClick={() => { item.action(); setShowAttachments(false); }}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-violet-500/5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest text-[var(--text)] group opacity-80 hover:opacity-100 whitespace-nowrap"
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

            <input
              type="text"
              value={value}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setValue(e.target.value)}
              placeholder={isRecording ? "Ouvindo atentamente..." : placeholder}
              className="flex-1 bg-transparent border-none focus:ring-0 py-2 px-3 text-[var(--text)] text-sm placeholder:text-[var(--muted)]/40 resize-none outline-none truncate"
            />

            <div className="flex items-center gap-1.5 flex-shrink-0 pr-1">
              <button 
                type="button"
                onClick={toggleRecording}
                className={`w-9 h-9 flex items-center justify-center transition-all rounded-full hover:bg-[var(--bg)] ${
                  isRecording ? 'text-red-500 bg-red-500/10 ring-2 ring-red-500/20' : isFocused ? 'text-violet-500 bg-violet-500/5' : 'text-[var(--muted)]'
                }`}
              >
                <div className="relative">
                  {isRecording ? <Square size={16} className="fill-current" /> : <Mic size={19} />}
                </div>
              </button>

              <button
                type="submit"
                disabled={isLoading || (!value.trim() && !selectedFile)}
                className="w-9 h-9 flex items-center justify-center bg-slate-900 text-white rounded-full hover:bg-black active:scale-90 transition-all disabled:opacity-30 shadow-md shadow-black/10"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
