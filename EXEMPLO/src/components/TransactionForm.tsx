import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CategoryType, Category } from '../types';
import { db } from '../services/db';
import { ArrowLeft, Check, TrendingUp, TrendingDown, ChevronDown, Plus, Calendar, Clock, Sparkles, TriangleAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface TransactionFormProps {
  type: 'INCOME' | 'EXPENSE';
  categories: Category[];
  onBack: () => void;
  onSave: () => void;
  isEmbedded?: boolean;
  isActive?: boolean;
  onCreateCategorySuccess?: () => void;
}

// --- Wheel Picker Component ---
const WheelPicker: React.FC<{
  items: (string | number)[];
  value: string | number;
  onChange: (val: string | number) => void;
  label?: string;
}> = ({ items, value, onChange, label }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemHeight = 44;

  useEffect(() => {
    const index = items.indexOf(value);
    if (index !== -1 && scrollRef.current) {
      scrollRef.current.scrollTop = index * itemHeight;
    }
  }, [value, items]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const index = Math.round(scrollRef.current.scrollTop / itemHeight);
      if (items[index] !== undefined && items[index] !== value) {
        onChange(items[index]);
        if (window.navigator.vibrate) window.navigator.vibrate(2);
      }
    }
  };

  return (
    <div className="flex flex-col items-center select-none w-16">
      {label && <span className="text-[8px] font-black text-zinc-600 mb-3 uppercase tracking-[0.2em] text-center w-full">{label}</span>}
      <div 
        className="h-[132px] w-full overflow-y-auto snap-y snap-mandatory no-scrollbar relative overscroll-contain" 
        ref={scrollRef} 
        onScroll={handleScroll}
      >
        <div className="py-[44px]">
          {items.map((item, i) => {
            const isSelected = item === value;
            return (
              <div 
                key={i} 
                role="button"
                className={`h-[44px] w-full flex items-center justify-center snap-center transition-all duration-200 ease-out ${
                  isSelected 
                    ? 'text-indigo-600 dark:text-white font-black text-lg' 
                    : 'text-slate-400 dark:text-zinc-600 font-bold text-sm opacity-20 dark:opacity-20'
                }`}
              >
                <span className="w-full text-center">
                  {typeof item === 'number' ? item.toString().padStart(2, '0') : item}
                </span>
              </div>
            );
          })}
        </div>
        {/* Selection Highlight Overlay - Dimensões Exatas */}
        <div className="absolute top-[44px] left-0 right-0 h-[44px] border-y border-white/5 pointer-events-none bg-white/[0.03]" />
      </div>
    </div>
  );
};

const INCOME_MESSAGES = [
  "Parabéns pela sua evolução!",
  "Você está no caminho certo!",
  "Mais um passo rumo à liberdade!",
  "Sua disciplina está dando frutos!",
  "Excelente gestão financeira!",
  "Seu futuro agradece esse ganho!",
  "Rumo ao topo, continue assim!"
];

const EXPENSE_MESSAGES = [
  "Cuidado com os excessos!",
  "Analise se este gasto é essencial.",
  "Mantenha o foco no seu orçamento.",
  "Atenção ao seu limite mensal!",
  "Cada centavo conta no longo prazo.",
  "Pense duas vezes antes de gastar!",
  "Sua meta financeira exige atenção."
];

export const TransactionForm: React.FC<TransactionFormProps> = ({ type, categories, onBack, onSave, isEmbedded, isActive, onCreateCategorySuccess }) => {
  const [value, setValue] = useState('0,00');
  const [rawAmount, setRawAmount] = useState(0);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [localCreatedCategories, setLocalCreatedCategories] = useState<Category[]>([]);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<CategoryType>(type === 'INCOME' ? CategoryType.INCOME : CategoryType.ESSENTIAL);
  
  const [useCurrentTime, setUseCurrentTime] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  
  const [day, setDay] = useState(new Date().getDate());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [hour, setHour] = useState(new Date().getHours());
  const [minute, setMinute] = useState(new Date().getMinutes());

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');

  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => i + 1), []);
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const years = useMemo(() => Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i), []);
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);

  const [note, setNote] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const constraintsRef = useRef(null);

  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isActive && inputRef.current) {
      // Pequeno delay para não travar a transição do carrossel
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  // Sincroniza estados ao mudar o tipo de transação (Entrada vs Saída)
  useEffect(() => {
    setCategoryId('');
    setIsCreatingCategory(false);
    setNewCatName('');
    setNewCatType(type === 'INCOME' ? CategoryType.INCOME : CategoryType.ESSENTIAL);
  }, [type]);

  // Regra de redimensionamento automático do valor para caber no espaço
  const valueFontSize = useMemo(() => {
    const integerPart = value.split(',')[0];
    const len = integerPart.length;
    
    // No desktop (lg), o container é menor (col-span-6), então aumentamos a margem de segurança (charsToFit)
    // Isso reduz a escala base do VW para que o texto caiba na lateral do formulário.
    const charsToFit = Math.max(len, 2) + (isDesktop ? 6.5 : 1.8); 
    const vwPerChar = 100 / charsToFit;
    
    return {
      // Ajuste de "teto" (max-size) para desktop: de 20rem para 12rem.
      // Isso libera os ~10px solicitados em escalas maiores para evitar o corte lateral.
      integer: `clamp(3rem, ${vwPerChar}vw, ${isDesktop ? '12.5rem' : '20rem'})`,
      cents: `clamp(1.5rem, ${vwPerChar * 0.6}vw, ${isDesktop ? '6.2rem' : '10rem'})`
    };
  }, [value, isDesktop]);

  const filteredCategories = useMemo(() => {
    const allUniqueCategories = [...(categories || [])];
    localCreatedCategories.forEach(localCat => {
      if (!allUniqueCategories.some(c => c.id === localCat.id)) {
        allUniqueCategories.push(localCat);
      }
    });

    if (type === 'INCOME') {
      return allUniqueCategories.filter(c => c.type === CategoryType.INCOME || c.id === categoryId);
    }
    return allUniqueCategories.filter(c => c.type !== CategoryType.INCOME || c.id === categoryId);
  }, [categories, localCreatedCategories, type, categoryId]);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    const amount = parseInt(val || '0') / 100;
    setRawAmount(amount);
    setValue(amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
  };

  const handleCreateCategory = () => {
    if (!newCatName) return;
    const newCat = db.addCategory({ name: newCatName, type: newCatType });
    setLocalCreatedCategories(prev => [...prev, newCat]);
    setCategoryId(newCat.id);
    setIsCreatingCategory(false);
    setNewCatName('');
    if (onCreateCategorySuccess) {
      onCreateCategorySuccess();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rawAmount <= 0 || !categoryId || isSubmitting) return;

    setIsSubmitting(true);
    
    // Pick random message
    const messages = type === 'INCOME' ? INCOME_MESSAGES : EXPENSE_MESSAGES;
    setCurrentMessage(messages[Math.floor(Math.random() * messages.length)]);
    
    // Show animation overlay
    setShowAnimation(true);

    // Trigger fireworks for income
    if (type === 'INCOME') {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 200 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    }

    // Wait for animation to finish
    await new Promise(resolve => setTimeout(resolve, 3000));

    let finalDate: Date;
    if (useCurrentTime) {
      finalDate = new Date();
    } else {
      finalDate = new Date(year, month - 1, day, hour, minute);
    }
    
    db.addTransaction({
      value: rawAmount,
      category_id: categoryId,
      date: finalDate.toISOString(),
      note: name ? `${name}${note ? ` - ${note}` : ''}` : note
    });
    
    onSave();
    setIsSubmitting(false);
    setShowAnimation(false);
  };

  const content = (
    <div className="w-full h-full flex flex-col relative">
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-10 lg:gap-14">
        
        {/* 5. INPUT DE VALOR (ULTRA HERO STYLE) - Coluna da esquerda no Desktop */}
        <div className={`relative flex flex-col items-center justify-center py-20 lg:py-0 lg:h-full lg:col-span-6 group overflow-hidden rounded-[48px] border backdrop-blur-xl shadow-2xl transition-all duration-500 ${
          type === 'INCOME' 
            ? 'bg-emerald-500/[0.03] border-emerald-500/20 shadow-emerald-500/10' 
            : 'bg-rose-500/[0.03] border-rose-500/20 shadow-rose-500/10'
        }`}>
          {/* Dynamic Background Glow - More Intense */}
          <div className={`absolute inset-0 opacity-10 dark:opacity-20 blur-[100px] pointer-events-none transition-colors duration-700 ${type === 'INCOME' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          
          <motion.label 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative z-10 text-[11px] font-black uppercase tracking-[0.5em] mb-8 transition-colors ${
              type === 'INCOME' ? 'text-emerald-500/50' : 'text-rose-500/50'
            }`}
          >
            {type === 'INCOME' ? 'Valor da Entrada' : 'Valor da Saída'}
          </motion.label>
          
          <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-4 px-2 sm:px-6 w-full">
            <span className={`text-3xl md:text-4xl font-black font-outfit transition-colors duration-500 self-end mb-6 ${
              type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              R$
            </span>
            
            <div className="relative flex flex-col items-center flex-1">
              {/* Hidden Input for capturing typing */}
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={value}
                onChange={handleValueChange}
                className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-text caret-transparent"
                autoFocus={isActive}
                tabIndex={isActive ? 0 : -1}
              />
              
              {/* Visual Display - Split Integer and Cents */}
              <div className={`flex items-baseline justify-center font-outfit font-black tracking-tighter transition-all duration-500 ${
                type === 'INCOME' 
                  ? 'text-emerald-400 drop-shadow-[0_0_40px_rgba(52,211,153,0.6)]' 
                  : 'text-rose-400 drop-shadow-[0_0_40px_rgba(244,63,94,0.6)]'
              } ${value === '0,00' ? 'opacity-30' : 'opacity-100'}`}>
                <span 
                  className="text-7xl sm:text-8xl md:text-[8rem] lg:text-[7rem] xl:text-[9rem] leading-none transition-all duration-300"
                  style={valueFontSize.integer ? { fontSize: valueFontSize.integer } : {}}
                >
                  {value.split(',')[0]}
                </span>
                <span 
                  className="text-3xl sm:text-4xl md:text-6xl leading-none ml-1 opacity-80 transition-all duration-300"
                  style={valueFontSize.cents ? { fontSize: valueFontSize.cents } : {}}
                >
                  ,{value.split(',')[1]}
                </span>
              </div>
              
              {/* Premium Animated Underline */}
              <div className="absolute -bottom-6 left-0 right-0 h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  layoutId="underline-glow"
                  className={`h-full w-full ${
                    type === 'INCOME' 
                      ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,1)]' 
                      : 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,1)]'
                  }`}
                  initial={{ x: '-100%' }}
                  animate={{ x: '0%' }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                />
              </div>
            </div>
          </div>

          {/* Subtle Decorative Elements */}
          <div className="absolute top-4 right-6 opacity-10">
            <Sparkles size={40} className={type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'} />
          </div>
        </div>

        {/* Coluna da direita no Desktop - Campos do Formulário */}
        <div className="lg:col-span-6 space-y-8 lg:space-y-6">
          {/* 6. NOME DA TRANSAÇÃO */}
          <div className="space-y-3">
            <label className={`text-[10px] font-black uppercase tracking-widest ${type === 'INCOME' ? 'text-emerald-500/40' : 'text-rose-500/40'}`}>Nome da Transação</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Salário, Mercado, Freelance"
              className={`w-full bg-white/5 border rounded-2xl p-5 lg:p-4 text-white font-bold placeholder-white/10 transition-all outline-none backdrop-blur-md ${
                type === 'INCOME' 
                  ? 'border-emerald-500/10 focus:border-emerald-500/40 focus:bg-emerald-500/5' 
                  : 'border-rose-500/10 focus:border-rose-500/40 focus:bg-rose-500/5'
              }`}
            />
          </div>

          {/* 7. CATEGORIA INTELIGENTE */}
          <div className="space-y-4 lg:space-y-3">
            <div className="flex justify-between items-center">
              <label className={`text-[10px] font-black uppercase tracking-widest ${type === 'INCOME' ? 'text-emerald-500/40' : 'text-rose-500/40'}`}>Categoria</label>
              <button 
                type="button"
                onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors ${
                  type === 'INCOME' ? 'text-emerald-500/60 hover:text-emerald-400' : 'text-rose-500/60 hover:text-rose-400'
                }`}
              >
                {isCreatingCategory ? 'Cancelar' : <><Plus size={12} /> Criar Categoria</>}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {isCreatingCategory ? (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className={`overflow-hidden space-y-4 p-6 lg:p-5 rounded-3xl border backdrop-blur-md ${
                    type === 'INCOME' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'
                  }`}
                >
                  <input
                    type="text"
                    placeholder="Nome da Categoria"
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 lg:p-3 text-white font-bold outline-none focus:border-white/30"
                  />
                  <div className="flex gap-2">
                    {type === 'INCOME' ? (
                      <div className="flex-1 bg-black/40 border border-white/10 rounded-xl p-4 lg:p-3 text-white/50 font-bold outline-none text-xs flex items-center">
                        Tipo: Receita
                      </div>
                    ) : (
                      <select
                        value={newCatType}
                        onChange={e => setNewCatType(e.target.value as CategoryType)}
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl p-4 lg:p-3 text-white font-bold outline-none appearance-none"
                      >
                        <option value={CategoryType.ESSENTIAL} className="bg-zinc-900">Custo Fixo Essencial</option>
                        <option value={CategoryType.CUTTABLE} className="bg-zinc-900">Custo Variável (Cortável)</option>
                      </select>
                    )}
                    <button 
                      type="button"
                      onClick={handleCreateCategory}
                      className={`px-6 lg:px-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-white active:scale-95 transition-all text-center ${
                        type === 'INCOME' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                      }`}
                    >
                      Salvar
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="relative">
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className={`w-full bg-white/5 border rounded-2xl p-5 lg:p-4 text-white font-bold appearance-none outline-none transition-all backdrop-blur-md ${
                      type === 'INCOME' 
                        ? 'border-emerald-500/10 focus:border-emerald-500/40 focus:bg-emerald-500/5' 
                        : 'border-rose-500/10 focus:border-rose-500/40 focus:bg-rose-500/5'
                    }`}
                    required
                  >
                    <option value="" className="bg-zinc-900">Selecione a origem/destino</option>
                    {filteredCategories.map(c => (
                      <option key={c.id} value={c.id} className="bg-zinc-900">
                        {c.name} {c.type === CategoryType.ESSENTIAL ? '(Essencial)' : c.type === CategoryType.CUTTABLE ? '(Cortável)' : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={20} />
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* 8. DATA + HORA (WHEEL PICKER) */}
          <div className="space-y-6 lg:space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Calendar size={14} className={type === 'INCOME' ? 'text-emerald-500/40' : 'text-rose-500/40'} />
                <label className={`text-[10px] font-black uppercase tracking-widest ${type === 'INCOME' ? 'text-emerald-500/40' : 'text-rose-500/40'}`}>Data e Hora</label>
              </div>
              
              {/* 9. AUTO DATA/HORA */}
              <button 
                type="button"
                onClick={() => setUseCurrentTime(!useCurrentTime)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all backdrop-blur-md ${
                  useCurrentTime 
                    ? (type === 'INCOME' 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/20' 
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-rose-500/20')
                    : 'bg-white/5 border-white/10 text-white/30'
                }`}
              >
                <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center transition-all ${
                  useCurrentTime 
                    ? (type === 'INCOME' ? 'bg-emerald-500 border-emerald-400' : 'bg-rose-500 border-rose-400')
                    : 'border-white/10'
                }`}>
                  {useCurrentTime && <Check size={8} className="text-white" />}
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest">Agora</span>
              </button>
            </div>

            <AnimatePresence>
              {!useCurrentTime && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className={`rounded-[32px] border p-6 lg:p-4 flex justify-around items-center shadow-inner backdrop-blur-md ${
                    type === 'INCOME' ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-rose-500/5 border-rose-500/10'
                  }`}>
                    <WheelPicker label="Dia" items={days} value={day} onChange={v => setDay(v as number)} />
                    <WheelPicker label="Mês" items={months} value={month} onChange={v => setMonth(v as number)} />
                    <WheelPicker label="Ano" items={years} value={year} onChange={v => setYear(v as number)} />
                    <div className="w-px h-12 bg-white/5 mx-2" />
                    <WheelPicker label="Hora" items={hours} value={hour} onChange={v => setHour(v as number)} />
                    <WheelPicker label="Min" items={minutes} value={minute} onChange={v => setMinute(v as number)} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 10. OBSERVAÇÃO */}
          <div className="space-y-3">
            <label className={`text-[10px] font-black uppercase tracking-widest ${type === 'INCOME' ? 'text-emerald-500/40' : 'text-rose-500/40'}`}>Observações</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Algum detalhe?"
              rows={2}
              className={`w-full bg-white/5 border rounded-2xl p-5 lg:p-4 text-white font-bold placeholder-white/10 transition-all outline-none resize-none backdrop-blur-md ${
                type === 'INCOME' 
                  ? 'border-emerald-500/10 focus:border-emerald-500/40 focus:bg-emerald-500/5' 
                  : 'border-rose-500/10 focus:border-rose-500/40 focus:bg-rose-500/5'
              }`}
            />
          </div>
        </div>

        {/* 11. BOTÃO DE AÇÃO FLUTUANTE (BOLA DRAGGABLE) - SÓ APARECE SE ATIVO */}
        {isActive && !showAnimation && (
          <>
            {/* Invisible fixed container for drag constraints - covers the whole screen */}
            <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[-1]" />
            
            <motion.button
              type="submit"
              disabled={isSubmitting}
              drag
              dragConstraints={constraintsRef}
              dragElastic={0.1}
              dragMomentum={true}
              dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
              initial={{ opacity: 0, scale: 0, x: 100 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0, x: 100 }}
              whileHover={{ scale: 1.05, cursor: 'grab' }}
              whileTap={{ scale: 0.95, cursor: 'grabbing' }}
              className={`fixed right-6 top-10 w-32 h-32 rounded-full z-[100] shadow-[0_30px_70px_rgba(0,0,0,0.3)] dark:shadow-[0_30px_70px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center gap-2 border-2 overflow-hidden p-4 text-center
                ${type === 'INCOME' 
                  ? 'bg-emerald-50 dark:bg-[#040d08] text-emerald-600 dark:text-emerald-500/90 border-emerald-200 dark:border-emerald-500/20' 
                  : 'bg-rose-50 dark:bg-[#0d0404] text-rose-600 dark:text-rose-500/90 border-rose-200 dark:border-rose-500/20'}
              `}
            >
            {type === 'INCOME' && (
              <motion.div 
                animate={{ 
                  x: ['-100%', '200%'],
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "linear",
                  repeatDelay: 1
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent skew-x-[-20deg] z-0 pointer-events-none"
              />
            )}
            
            {type === 'EXPENSE' && (
              <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-transparent z-0 pointer-events-none" />
            )}

            <div className="relative z-10 flex flex-col items-center gap-1">
              <Sparkles size={28} className={type === 'INCOME' ? 'text-emerald-500/70' : 'text-rose-500/70'} /> 
              <span className="text-[9px] font-black uppercase tracking-[0.2em] leading-tight whitespace-pre-line">
                {type === 'INCOME' ? 'evoluir\nsucesso' : 'TENCIONAR\nPERDA'}
              </span>
            </div>
            
            {/* Efeito de profundidade na borda */}
            <div className={`absolute inset-0 rounded-full border-t-2 opacity-30 pointer-events-none ${type === 'INCOME' ? 'border-emerald-400' : 'border-rose-400'}`} />
          </motion.button>
        </>)}

        {/* 12. OVERLAY DE ANIMAÇÃO DE SUCESSO/ALERTA */}
        <AnimatePresence>
          {showAnimation && (
            <motion.div 
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(24px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(4px)', scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90"
            >
              <div className="relative flex flex-col items-center gap-12 text-center px-10">
                {/* A BOLA QUE CRESCEU */}
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ 
                    scale: 1,
                    opacity: 1,
                    rotate: type === 'EXPENSE' ? [0, -5, 5, -5, 5, 0] : 0
                  }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ 
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                    rotate: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                  }}
                  className={`w-64 h-64 rounded-full flex items-center justify-center shadow-[0_0_100px_rgba(0,0,0,1)] border-4 relative overflow-hidden
                    ${type === 'INCOME' 
                      ? 'bg-[#040d08] border-emerald-500/40 text-emerald-400' 
                      : 'bg-[#0d0404] border-rose-500/40 text-rose-400'}
                  `}
                >
                  {/* Efeito de Camadas para Ganho (Sucesso) */}
                  {type === 'INCOME' && (
                    <>
                      {/* Camada 3: Ainda maior, bem leve */}
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: [1, 1.4, 1.2], opacity: [0, 0.1, 0.05] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-emerald-500 rounded-full blur-3xl"
                      />
                      {/* Camada 2: Maior, com blur + baixa opacidade */}
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: [1, 1.2, 1.1], opacity: [0, 0.2, 0.1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        className="absolute inset-0 bg-emerald-500 rounded-full blur-2xl"
                      />
                      {/* Camada 1: Base sólida, verde suave */}
                      <motion.div 
                        className="absolute inset-0 bg-emerald-500/10 rounded-full"
                      />
                      {/* Efeito de Onda / Reverberação */}
                      <motion.div 
                        animate={{ scale: [1, 2], opacity: [0.3, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                        className="absolute inset-0 border-2 border-emerald-500/30 rounded-full"
                      />
                    </>
                  )}

                  {/* Efeito "Pegajoso" / Fluido para Saída */}
                  {type === 'EXPENSE' && (
                    <motion.div 
                      animate={{ 
                        scale: [1, 1.1, 1],
                        borderRadius: ["50%", "40% 60% 50% 50%", "60% 40% 50% 50%", "50%"]
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 bg-rose-500/10 blur-2xl"
                    />
                  )}

                  {type === 'INCOME' ? (
                    <motion.span 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative z-10 text-8xl font-serif font-black tracking-tighter text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.6)]"
                    >
                      A
                    </motion.span>
                  ) : (
                    <div className="relative z-10 flex flex-col items-center gap-4">
                      <TriangleAlert size={80} className="text-rose-500 animate-pulse" />
                      <div className="flex gap-2">
                        <TriangleAlert size={20} className="text-rose-500/50" />
                        <TriangleAlert size={20} className="text-rose-500/50" />
                        <TriangleAlert size={20} className="text-rose-500/50" />
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* TEXTO DINÂMICO */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-4"
                >
                  <h2 className={`text-4xl font-black uppercase tracking-tighter leading-none
                    ${type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}
                  `}>
                    {type === 'INCOME' ? 'Evolução!' : 'Atenção!'}
                  </h2>
                  <p className="text-zinc-400 font-bold text-lg max-w-xs mx-auto">
                    {currentMessage}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
      {/* Removido o spacer pois o botão agora é flutuante */}
    </div>
  );

  if (isEmbedded) return content;

  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white p-6 pt-safe">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="mb-8 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-400 dark:text-zinc-400 hover:text-slate-600 dark:hover:text-white transition-all">
          <ArrowLeft size={20} />
        </button>
        {content}
      </div>
    </div>
  );
};
