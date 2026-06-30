import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Save, 
  Calendar, 
  CheckCircle, 
  X, 
  ArrowLeft, 
  Activity, 
  Move, 
  GripVertical,
  Plus,
  Settings,
  Trophy,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  BarChart3,
  Wallet,
  DollarSign,
  Target,
  Zap,
  ChevronDown,
  Search,
  Clock,
  ArrowRight,
  Menu,
  Layers,
  Brain,
  Sun,
  Moon,
  RotateCcw,
  Smartphone,
  Pizza,
  Tv,
  Shield,
  Sparkles
} from 'lucide-react';
import Lottie from 'lottie-react';
import { Reorder, useDragControls, motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { ResponsiveContainer, AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, ReferenceLine, ReferenceDot } from 'recharts';
import { Category, Transaction, CategoryType } from '../types';
import { db } from '../services/db';
import { safeLocalStorage } from '../utils/storage';
import { backgroundService } from '../services/backgroundService';
import { existentialFinancialService } from '../services/existentialFinancialService';
import { TransactionForm } from '../components/TransactionForm';
import { CategoryManager } from '../components/CategoryManager';
import { UnifiedFinanceModal } from '../components/UnifiedFinanceModal';
import { haptics } from '../services/HapticService';
import { useOrganismSync } from '../hooks/useOrganismSync';
import { useLocation } from 'react-router-dom';
// @ts-ignore
import cosmicSunrisePath from '../assets/images/cosmic_sunrise_path_1780689391324.png';

interface CortesPageProps {
  onBack: () => void;
  onToggleSidebar?: () => void;
  categories: Category[];
  transactions: Transaction[];
  onRefreshCategories: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

// --- COMPONENTES AUXILIARES ---

const TransactionItem = ({ 
  transaction, 
  categories, 
  formatCurrency,
  scale = 1,
  isEditingFinancialMode = false,
  onEdit,
  onDuplicate,
  onMove,
  onDelete
}: { 
  transaction: Transaction, 
  categories: Category[], 
  formatCurrency: (v: number) => string,
  scale?: number,
  isEditingFinancialMode?: boolean,
  onEdit?: (t: Transaction) => void,
  onDuplicate?: (t: Transaction) => void,
  onMove?: (t: Transaction) => void,
  onDelete?: (id: string) => void
}) => {
  const cat = categories.find(c => c.id === transaction.category_id);
  const isIncome = cat?.type === CategoryType.INCOME;

  const [isEditingThisItem, setIsEditingThisItem] = React.useState(false);
  const [editedNote, setEditedNote] = React.useState(transaction.note || '');
  const [editedValue, setEditedValue] = React.useState(transaction.value.toString());
  const [editedCat, setEditedCat] = React.useState(transaction.category_id || '');

  React.useEffect(() => {
    setEditedNote(transaction.note || '');
    setEditedValue(transaction.value.toString());
    setEditedCat(transaction.category_id || '');
  }, [transaction]);

  return (
    <div 
      style={{ 
        transform: `scale(${scale})`,
        transition: 'transform 0.1s ease-out'
      }}
      className="mb-3 px-2"
    >
      <div className="p-4 flex flex-col group transition-all cursor-pointer bg-white dark:bg-[#111111] rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-white/20">
        
        {isEditingThisItem ? (
          <div className="space-y-3 py-1">
            <div className="flex gap-2">
              <input 
                type="text"
                value={editedNote}
                onChange={e => setEditedNote(e.target.value)}
                placeholder="Descrição"
                className="flex-[2] text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-1.5 outline-none font-bold text-gray-900 dark:text-white"
              />
              <input 
                type="text"
                value={editedValue}
                onChange={e => setEditedValue(e.target.value)}
                placeholder="Valor"
                className="flex-1 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-1.5 outline-none font-black text-right text-gray-900 dark:text-white"
              />
            </div>
            
            <div className="flex gap-2 items-center justify-between pt-1">
              <select 
                value={editedCat} 
                onChange={e => setEditedCat(e.target.value)}
                className="text-xs font-black uppercase tracking-wider bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 outline-none text-gray-500"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.type === CategoryType.INCOME ? '+' : '-'})</option>
                ))}
              </select>
              
              <div className="flex gap-1.5">
                <button 
                  onClick={() => {
                    const parsedVal = parseFloat(editedValue);
                    if (!isNaN(parsedVal) && parsedVal >= 0) {
                      if (onEdit) {
                        onEdit({
                          ...transaction,
                          note: editedNote,
                          value: parsedVal,
                          category_id: editedCat
                        });
                      }
                      setIsEditingThisItem(false);
                    }
                  }}
                  className="px-3 py-1 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-xs font-black uppercase tracking-wider hover:brightness-110 shadow-md"
                >
                  Salvar
                </button>
                <button 
                  onClick={() => setIsEditingThisItem(false)}
                  className="px-3 py-1 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-black uppercase tracking-wider"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between" onClick={() => {
              if (isEditingFinancialMode) {
                haptics.lightClick();
                setIsEditingThisItem(true);
              } else {
                haptics.lightClick();
              }
            }}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isIncome 
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white' 
                    : 'bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500 group-hover:bg-zinc-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black'
                }`}>
                  {isIncome ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                </div>
                <div className="flex flex-col">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
                    {transaction.note || cat?.name || 'Sem descrição'}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{cat?.name}</span>
                    <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                    <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                      {new Date(transaction.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-lg font-black tracking-tighter ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                  {isIncome ? '+' : '-'} {formatCurrency(transaction.value)}
                </p>
                <p className="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  {isEditingFinancialMode ? 'Modo Rascunho ✎' : 'Confirmado'}
                </p>
              </div>
            </div>

            {isEditingFinancialMode && (
              <div className="flex items-center justify-end gap-1.5 mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsEditingThisItem(true); }}
                  className="flex items-center gap-1 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-[#6366f1] hover:bg-[#6366f1]/10 rounded-lg transition-colors"
                >
                  ✎ Editar
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDuplicate && onDuplicate(transaction); }}
                  className="flex items-center gap-1 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                >
                  ❑ Duplicar
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onMove && onMove(transaction); }}
                  className="flex items-center gap-1 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
                >
                  ⇅ Mover
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete && onDelete(transaction.id); }}
                  className="flex items-center gap-1 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  ✕ Excluir
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const SeriousActionButton = ({ icon, onClick, label, iconColor }: { icon: React.ReactNode, onClick: () => void, label: string, iconColor?: string }) => (
  <motion.button
    whileHover={{ scale: 1.02, backgroundColor: 'rgba(0,0,0,0.05)' }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="flex items-center gap-2 px-3 py-1.5 md:px-3.5 md:py-2 rounded-xl bg-zinc-900/90 text-white border border-white/10 shadow-md transition-all group"
  >
    <div className="text-zinc-400 group-hover:text-white transition-colors" style={{ color: iconColor }}>
      {React.cloneElement(icon as React.ReactElement<any>, { size: 14.5 })}
    </div>
    <span className="text-[10.5px] font-black uppercase tracking-widest hidden sm:inline">{label}</span>
  </motion.button>
);

const NavButton = ({ icon, label, onClick, showLabel = false }: { icon: React.ReactNode, label?: string, onClick: () => void, showLabel?: boolean }) => (
  <motion.button
    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-zinc-900 dark:text-zinc-100 transition-all"
  >
    <div className="shrink-0">
      {React.cloneElement(icon as React.ReactElement<any>, { size: 17.5 })}
    </div>
    {showLabel && label && (
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    )}
  </motion.button>
);

const PastCard = ({ label, realValue, predictedValue, formatCurrency }: { label: string, realValue: number, predictedValue: number, formatCurrency: (v: number) => string }) => {
  const diff = realValue - predictedValue;
  const isPositive = diff >= 0;
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`min-w-[240px] p-5 rounded-[28px] border bg-white/80 dark:bg-[#111111]/80 backdrop-blur-sm transition-all relative overflow-hidden ${isPositive ? 'border-emerald-100 dark:border-emerald-500/20 shadow-emerald-500/5' : 'border-rose-100 dark:border-rose-500/20 shadow-rose-500/5'}`}
    >
      {/* Alertas Visuais Inteligentes */}
      {isPositive ? (
        <motion.div 
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 bg-emerald-400/5 pointer-events-none" 
        />
      ) : (
        <motion.div 
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 bg-rose-400/5 pointer-events-none" 
        />
      )}

      <div className="relative z-10 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</span>
          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${isPositive ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'}`}>
            Realizado
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[7px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Real</p>
            <p className="text-sm font-black text-gray-900 dark:text-white tracking-tight">{formatCurrency(realValue)}</p>
          </div>
          <div>
            <p className="text-[7px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Previsto</p>
            <p className="text-sm font-black text-gray-400 dark:text-gray-600 tracking-tight">{formatCurrency(predictedValue)}</p>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
          <span className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Diferença</span>
          <span className={`text-[9px] font-black ${isPositive ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
            {isPositive ? '+' : ''}{formatCurrency(diff)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const FutureCard = ({ period, label, current, aiPredicted, userGoal, formatCurrency }: { period: string, label: string, current: number, aiPredicted: number, userGoal?: number, formatCurrency: (v: number) => string }) => {
  const isPositive = userGoal ? userGoal >= aiPredicted : aiPredicted >= current;
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`min-w-[280px] p-6 rounded-[32px] border transition-all relative overflow-hidden ${isPositive ? 'bg-white dark:bg-[#111111] border-emerald-100 dark:border-emerald-500/20 shadow-emerald-500/5' : 'bg-white dark:bg-[#111111] border-rose-100 dark:border-rose-500/20 shadow-rose-500/5'}`}
    >
      {/* Alertas Visuais Inteligentes */}
      {isPositive ? (
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 bg-emerald-400/5 pointer-events-none" 
        />
      ) : (
        <motion.div 
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 bg-rose-400/5 pointer-events-none" 
        />
      )}

      <div className="relative z-10 space-y-5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">{label}</span>
          <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${isPositive ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'}`}>
            {isPositive ? 'Crescimento' : 'Alerta'}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Previsão IA</p>
            <p className={`text-xl font-black tracking-tighter ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {formatCurrency(aiPredicted)}
            </p>
          </div>

          {userGoal !== undefined && userGoal > 0 && (
            <div className="pt-3 border-t border-gray-50 dark:border-white/5">
              <p className="text-[8px] font-black text-indigo-400 dark:text-indigo-300 uppercase tracking-widest mb-1">Sua Meta</p>
              <div className="flex items-end justify-between">
                <p className="text-lg font-black tracking-tighter text-indigo-900 dark:text-indigo-100">
                  {formatCurrency(userGoal)}
                </p>
                <span className={`text-[9px] font-black ${userGoal >= aiPredicted ? 'text-emerald-500 dark:text-emerald-400' : 'text-orange-500 dark:text-orange-400'}`}>
                  {Math.abs(((userGoal / aiPredicted) - 1) * 100).toFixed(0)}% {userGoal >= aiPredicted ? '↑' : '↓'}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="pt-3 flex items-center gap-2">
          <div className="flex-1 h-1 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (aiPredicted / current) * 50)}%` }}
              className={`h-full ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`}
            />
          </div>
          <span className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Score 92</span>
        </div>
      </div>
    </motion.div>
  );
};

const MonthCard = ({ 
  type, 
  label, 
  currentValue, 
  aiPredicted, 
  userGoal, 
  realValue,
  onGoalChange,
  formatCurrency 
}: { 
  type: 'past' | 'present' | 'future',
  label: string,
  currentValue: number,
  aiPredicted: number,
  userGoal?: number,
  realValue?: number,
  onGoalChange?: (val: number) => void,
  formatCurrency: (v: number) => string
}) => {
  const isFuture = type === 'future';
  const isPresent = type === 'present';
  const isPast = type === 'past';
  
  const isPositive = isPast 
    ? realValue! >= aiPredicted 
    : aiPredicted >= currentValue;

  // Comparação de Performance (Passado)
  const pastPerformanceIA = isPast ? ((realValue! / aiPredicted) - 1) * 100 : 0;
  const pastPerformanceUser = isPast && userGoal ? ((realValue! / userGoal) - 1) * 100 : 0;

  // Comparação de Performance (Presente)
  const presentPerformanceIA = isPresent ? ((currentValue / aiPredicted) - 1) * 100 : 0;
  const presentPerformanceUser = isPresent && userGoal ? ((currentValue / userGoal) - 1) * 100 : 0;

  return (
    <motion.div
      data-type={type}
      whileHover={{ y: -12, scale: isPresent ? 1.18 : 1.12, zIndex: 30 }}
      whileInView={{ 
        scale: isPresent ? 1.12 : 1.08,
        y: -5,
        zIndex: 20
      }}
      viewport={{ amount: 0.8, margin: "-5% 0px -5% 0px" }}
      initial={{ scale: isPresent ? 1.05 : 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`min-w-[280px] sm:min-w-[320px] p-[2px] rounded-[32px] sm:rounded-[36px] transition-all relative overflow-hidden snap-center ${
        isPresent ? 'animate-green-silver-border shadow-2xl z-10' :
        isPositive ? 'bg-white dark:bg-[#111111] border border-emerald-100 dark:border-emerald-500/20 shadow-emerald-500/5' : 
        'bg-white dark:bg-[#111111] border border-rose-100 dark:border-rose-500/20 shadow-rose-500/5'
      }`}
    >
      <div className={`w-full h-full p-4 sm:p-7 rounded-[30px] sm:rounded-[34px] relative overflow-hidden ${
        isPresent ? 'bg-zinc-900 text-white' : 'bg-transparent'
      }`}>
        {/* Alertas Visuais Inteligentes & Reforço Emocional */}
        {isPresent ? (
          isPositive ? (
            <motion.div 
              animate={{ opacity: [0.05, 0.2, 0.05], scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 bg-emerald-400/15 pointer-events-none blur-2xl" 
            />
          ) : (
            <motion.div 
              animate={{ opacity: [0.05, 0.15, 0.05] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-rose-400/15 pointer-events-none blur-2xl" 
            />
          )
        ) : (
          isPositive ? (
            <motion.div 
              animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.02, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 bg-emerald-400/5 pointer-events-none" 
            />
          ) : (
            <motion.div 
              animate={{ opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-rose-400/5 pointer-events-none" 
            />
          )
        )}

        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-center">
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isPresent ? 'text-zinc-400' : 'text-gray-400'}`}>
              {label}
            </span>
            <div className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
              isPresent ? 'bg-emerald-500 text-white' :
              isPast ? 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-zinc-400' :
              isPositive ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'
            }`}>
              {isPresent ? 'Hoje' : isPast ? 'Realizado' : isPositive ? 'Crescimento' : 'Alerta'}
            </div>
          </div>

        <div className="space-y-5">
          {isPast ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Realizado</p>
                  <p className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight">{formatCurrency(realValue!)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Previsto IA</p>
                  <p className="text-base sm:text-lg font-black text-gray-400 dark:text-gray-600 tracking-tight">{formatCurrency(aiPredicted)}</p>
                </div>
              </div>
              
              <div className="pt-3 border-t border-gray-50 dark:border-white/5 grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-[7px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Performance IA</p>
                  <span className={`text-[10px] font-black ${pastPerformanceIA >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                    {pastPerformanceIA >= 0 ? '↑' : '↓'} {Math.abs(pastPerformanceIA).toFixed(1)}%
                  </span>
                </div>
                {userGoal && userGoal > 0 && (
                  <div className="flex flex-col gap-1 text-right">
                    <p className="text-[7px] font-black text-indigo-400 dark:text-indigo-300 uppercase tracking-widest">Meta: {formatCurrency(userGoal)}</p>
                    <span className={`text-[10px] font-black ${pastPerformanceUser >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                      {pastPerformanceUser >= 0 ? 'Meta Atingida' : 'Abaixo da Meta'} ({Math.abs(pastPerformanceUser).toFixed(1)}%)
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : isPresent ? (
            <div className="space-y-4">
              <div>
                <p className="text-[8px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1">Saldo Atual</p>
                <p className="text-2xl sm:text-3xl font-black text-white tracking-tighter">{formatCurrency(currentValue)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-[8px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1">Previsão IA</p>
                  <p className="text-sm font-black text-zinc-300 dark:text-zinc-200">{formatCurrency(aiPredicted)}</p>
                  <span className={`text-[9px] font-black ${presentPerformanceIA >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {presentPerformanceIA >= 0 ? '+' : ''}{presentPerformanceIA.toFixed(1)}%
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1">Sua Meta</p>
                  <p className="text-sm font-black text-zinc-300 dark:text-zinc-200">{userGoal ? formatCurrency(userGoal) : '---'}</p>
                  {userGoal && (
                    <span className={`text-[9px] font-black ${presentPerformanceUser >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {presentPerformanceUser >= 0 ? '+' : ''}{presentPerformanceUser.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest mb-1 text-gray-400 dark:text-gray-500">
                Previsão IA
              </p>
              <p className={`text-2xl font-black tracking-tighter ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {formatCurrency(aiPredicted)}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isPositive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
                <span className={`text-[8px] font-black uppercase tracking-widest ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  Tendência {isPositive ? 'Positiva' : 'Alerta'}
                </span>
              </div>
            </div>
          )}

          {isFuture && (
            <div className="pt-4 border-t border-gray-50 dark:border-white/5 space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-[8px] font-black text-indigo-400 dark:text-indigo-300 uppercase tracking-widest">Sua Meta</p>
                {userGoal && userGoal > 0 && (
                  <span className={`text-[9px] font-black ${userGoal >= aiPredicted ? 'text-emerald-500 dark:text-emerald-400' : 'text-orange-500 dark:text-orange-400'}`}>
                    {Math.abs(((userGoal / aiPredicted) - 1) * 100).toFixed(0)}% {userGoal >= aiPredicted ? '↑' : '↓'}
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300">R$</span>
                <input 
                  type="number"
                  value={userGoal || ''}
                  onChange={(e) => onGoalChange?.(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-black outline-none focus:border-indigo-500 transition-all"
                  placeholder="Definir meta..."
                />
              </div>
            </div>
          )}
        </div>

        {!isPast && (
          <div className="pt-3 flex items-center gap-2">
            <div className={`flex-1 h-1 rounded-full overflow-hidden ${isPresent ? 'bg-white/10' : 'bg-gray-100'}`}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (aiPredicted / currentValue) * 50)}%` }}
                className={`h-full ${isPresent ? 'bg-emerald-400' : isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`}
              />
            </div>
            <span className={`text-[8px] font-black uppercase tracking-widest ${isPresent ? 'text-zinc-500' : 'text-gray-400'}`}>
              Confiança 92%
            </span>
          </div>
        )}
      </div>
    </div>
  </motion.div>
);
};

export const CortesPage: React.FC<CortesPageProps> = ({ 
  onBack, 
  onToggleSidebar, 
  categories, 
  transactions, 
  onRefreshCategories,
  theme = 'dark',
  onToggleTheme
}) => {
  const formatUnabbreviatedTime = (totalHours: number) => {
    const years = Math.floor(totalHours / (24 * 365));
    const remainingHoursAfterYears = totalHours % (24 * 365);
    const months = Math.floor(remainingHoursAfterYears / (24 * 30));
    const remainingHoursAfterMonths = remainingHoursAfterYears % (24 * 30);
    const days = Math.floor(remainingHoursAfterMonths / 24);
    const hours = Math.floor(remainingHoursAfterMonths % 24);
    const mins = Math.floor((totalHours * 60) % 60);

    const parts: string[] = [];
    if (years > 0) {
      parts.push(`${years} ${years === 1 ? 'ano' : 'anos'}`);
    }
    if (months > 0) {
      parts.push(`${months} ${months === 1 ? 'mês' : 'meses'}`);
    }
    if (days > 0) {
      parts.push(`${days} ${days === 1 ? 'dia' : 'dias'}`);
    }
    if (years === 0 && months === 0 && days === 0) {
      if (hours > 0) {
        parts.push(`${hours} ${hours === 1 ? 'hora' : 'horas'}`);
      }
      if (mins > 0 || hours === 0) {
        parts.push(`${mins} ${mins === 1 ? 'minuto' : 'minutos'}`);
      }
    } else if (hours > 0 && years === 0) {
      parts.push(`${hours} ${hours === 1 ? 'hora' : 'horas'}`);
    }

    if (parts.length === 0) return "0 minutos";
    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return `${parts[0]} e ${parts[1]}`;
    return `${parts.slice(0, -1).join(', ')} e ${parts[parts.length - 1]}`;
  };

  const location = useLocation();

  const [bgImages, setBgImages] = useState(() => backgroundService.getImages('finance'));
  const [bgIndex, setBgIndex] = useState(0);
  
  // Estados para Navegação Interna
  const [activeSubView, setActiveSubView] = useState<'main' | 'income' | 'expense' | 'categories'>('main');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'income' | 'expense' | 'categories'>('income');

  useEffect(() => {
    if (location.state && location.state.openModal) {
      const openType = location.state.openModal;
      if (openType === 'income' || openType === 'expense' || openType === 'categories') {
         setModalTab(openType);
         setIsModalOpen(true);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  
  // Estados para Filtros
  const [filterPeriod, setFilterPeriod] = useState<'day' | 'week' | 'month' | 'year' | 'all'>('month');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Estados Originais do Módulo de Cortes
  const [inputs, setInputs] = useState<{ [key: string]: number }>({});
  const [viewMode, setViewMode] = useState<'HISTORICO' | 'FUTURO'>('HISTORICO');
  const [futureRange, setFutureRange] = useState<number>(6);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'ESSE_MES' | '3_MESES' | 'HISTORICO_TOTAL'>('ESSE_MES');
  const [isReordering, setIsReordering] = useState(false);
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);
  const containerRef = useRef<HTMLDivElement>(null);

  // Background Carousel Logic updated to use backgroundService
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail?.page === 'finance') {
        const newImages = backgroundService.getImages('finance');
        setBgImages(newImages);
        setBgIndex(0);
      }
    };
    window.addEventListener('backgrounds-updated', handleUpdate);
    return () => window.removeEventListener('backgrounds-updated', handleUpdate);
  }, []);

  useEffect(() => {
    if (bgImages.length <= 1) {
      setBgIndex(0);
      return;
    }
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % bgImages.length);
    }, 10000); // 10s rotation
    return () => clearInterval(timer);
  }, [bgImages.length]);

  // Estados para Expansão de Projeção
  const [multiPeriodGoals, setMultiPeriodGoals] = useState<{ [key: string]: number }>(() => {
    const saved = safeLocalStorage.getItem('financial_multi_period_goals');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    safeLocalStorage.setItem('financial_multi_period_goals', JSON.stringify(multiPeriodGoals));
  }, [multiPeriodGoals]);

  const [projectionHorizon, setProjectionHorizon] = useState<'30' | '90' | '365'>('30');
  const [showProjectionModal, setShowProjectionModal] = useState(false);
  const [tempProjectionValue, setTempProjectionValue] = useState<string>('');
  const [selectedGoalPeriod, setSelectedGoalPeriod] = useState<string>('30');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const transactionListRef = useRef<HTMLDivElement>(null);

  // --- ESTADOS DO MODO DE EDIÇÃO FINANCEIRA INVISÍVEL ---
  const [isEditingFinancialMode, setIsEditingFinancialMode] = useState(false);
  const [editingFinancialDraft, setEditingFinancialDraft] = useState<Transaction[]>([]);
  const [showActiveToast, setShowActiveToast] = useState(false);
  const [inlineEditingField, setInlineEditingField] = useState<'balance' | 'income' | 'expense' | null>(null);
  const [inlineEditingValue, setInlineEditingValue] = useState('');

  // --- MODO ANALISTA FINANCEIRO / FINANCIAL INTELLIGENCE CENTER (FIC) ---
  const [isAnalystModeOpen, setIsAnalystModeOpen] = useState(false);
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);
  const [activePerspective, setActivePerspective] = useState<'patrimonio' | 'rec_desp' | 'categorias' | 'waterfall' | 'objetivo_vida'>('patrimonio');
  const [ficViewMode, setFicViewMode] = useState<'focused' | 'continuous'>('focused');
  const [selectedForecastScenario, setSelectedForecastScenario] = useState<'realista' | 'otimista' | 'conservadora'>('realista');
  const [zoomDays, setZoomDays] = useState(30);
  const [panOffset, setPanOffset] = useState(0); // em dias, positivo = futuro, negativo = passado
  const [yAxisMultiplier, setYAxisMultiplier] = useState(1.0);
  const [simLifeYears, setSimLifeYears] = useState(7);
  const [simLifeInvestment, setSimLifeInvestment] = useState(4500);
  const [manualMonthlySurvivalCost, setManualMonthlySurvivalCost] = useState<number | null>(null);

  const [ficChatMessages, setFicChatMessages] = useState<Array<{ sender: 'user' | 'system'; text: string }>>([
    { sender: 'system', text: 'Central de Inteligência Financeira conectada ao Gemini 3.5. Como posso analisar seus dados hoje?' }
  ]);
  const [ficQuestionInput, setFicQuestionInput] = useState('');
  const [ficLoading, setFicLoading] = useState(false);
  const [enabledLayers, setEnabledLayers] = useState({
    balance: true,
    income: true,
    expense: true,
    goals: true,
    categories: true
  });

  // --- ESTADOS DE GAMEFICAÇÃO DE VONTADE & PISTA EXISTENCIAL ---
  const [simulationAmount, setSimulationAmount] = useState('150');
  const [futureBuyToast, setFutureBuyToast] = useState(false);

  // --- ESTADOS DA INTELIGÊNCIA ALQUÍMICA DE TRANSMUTAÇÃO DE CAPITAL ---
  const [transmuterSearchQuery, setTransmuterSearchQuery] = useState('');
  const [transmuterFilterType, setTransmuterFilterType] = useState<'all' | 'expense' | 'asset'>('all');
  const [transmuterSelectedId, setTransmuterSelectedId] = useState<string | null>(null);
  const [transmuterSimName, setTransmuterSimName] = useState('');
  const [transmuterSimValue, setTransmuterSimValue] = useState('');
  const [transmuterSimList, setTransmuterSimList] = useState<Array<{ id: string; name: string; value: number; type: 'expense' | 'asset'; categoryName: string; date: string }>>([]);
  const [activeDesktopTab, setActiveDesktopTab] = useState<'prioritaria' | 'dispersao' | 'vontade' | 'transmutations'>('prioritaria');

  useEffect(() => {
    if (!isAnalystModeOpen) return;
    const blockZoom = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };
    const blockTouchZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    window.addEventListener('wheel', blockZoom, { passive: false });
    window.addEventListener('touchstart', blockTouchZoom, { passive: false });
    return () => {
      window.removeEventListener('wheel', blockZoom);
      window.removeEventListener('touchstart', blockTouchZoom);
    };
  }, [isAnalystModeOpen]);

  const handleFicQuestionSubmit = async (customQuestion?: string) => {
    const questionText = (customQuestion || ficQuestionInput || '').trim();
    if (!questionText) return;

    haptics.lightClick();
    setFicQuestionInput('');
    setFicLoading(true);

    // Append user message immediately
    setFicChatMessages(prev => [...prev, { sender: 'user', text: questionText }]);

    try {
      // Assemble the financial summary context
      const categoryBreakdownString = explorerCategoriesData
        .map(c => `  - ${c.name} (${c.isIncome ? 'RECEITA' : 'DESPESA'}): ${formatCurrency(c.value)}`)
        .join('\n');

      const systemPrompt = `Você é o Diretor Financeiro (CFO) e Especialista em Inteligência de Negócios (BI) integrado ao Bloomberg-like Financial Intelligence Center.
O usuário está visualizando a interface gráfica unificada agora. Sua tarefa é fornecer uma análise densa, técnica, precisa e acionável.

MÉTRICAS FINANCEIRAS DO PERÍODO CORRENTE:
- Patrimônio Líquido Acumulado: R$ ${formatCurrency(stats.balance)}
- Faturamento Operacional (Receitas): R$ ${formatCurrency(stats.income)}
- Desembolsos Operacionais (Despesas): R$ ${formatCurrency(stats.expenses)}
- Resultado Líquido da Janela (Fluxo de Caixa): R$ ${formatCurrency(stats.result)} (${stats.result >= 0 ? 'SUPERÁVIT' : 'DÉFICIT'})
- Taxa de Poupança Acumulada: ${stats.income > 0 ? Math.round((stats.result / stats.income) * 100) : 0}%
- Cobertura de Reserva Básica (Burn Rate): ${(stats.balance / (stats.expenses || 1)).toFixed(2)} meses de custo sustentado

DISTRIBUIÇÃO POR CATEGORIAS:
${categoryBreakdownString || 'Nenhuma categoria registrada no período ativo.'}

METAS E ATIVOS:
- Metas de longo prazo estão ativas.

DIRETRIZES DE RESPOSTA (IMPORTANTÍSSIMO):
1. Responda em PORTUGUÊS (PT-BR).
2. Seja extremamente direto, conciso, profissional e use linguajar corporativo enterprise (CFO/Bloomberg-style). Emojis de menos, métricas na lata de mais.
3. Limite a resposta a um tamanho que se encaixe perfeitamente no terminal (máximo 4 a 5 frases ou bullets elegantes). Não enrole.`;

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': 'default'
        },
        body: JSON.stringify({
          provider: 'gemini',
          model: 'gemini-3.5-flash',
          messages: [
            { role: 'user', content: `${systemPrompt}\n\nPERGUNTA DO USUÁRIO CORRE DE ACORDO COM SEUS DADOS:\n"${questionText}"` }
          ],
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Conexão com gateway retornou código ${response.status}`);
      }

      const resJson = await response.json();
      const answer = resJson.text?.trim() || 'Resposta analítica indisponível.';
      setFicChatMessages(prev => [...prev, { sender: 'system', text: answer }]);
    } catch (err: any) {
      console.error('[FIC Chat Error]:', err);
      setFicChatMessages(prev => [
        ...prev, 
        { sender: 'system', text: 'Falha ao processar análise em tempo real. Verifique conexões de rede.' }
      ]);
    } finally {
      setFicLoading(false);
    }
  };

  const activeTransactions = useMemo(() => {
    return isEditingFinancialMode ? editingFinancialDraft : transactions;
  }, [isEditingFinancialMode, editingFinancialDraft, transactions]);

  const realMonthlySurvivalCost = useMemo(() => {
    return existentialFinancialService.calculateAverageMonthlyExpense(activeTransactions, categories);
  }, [activeTransactions, categories]);

  const monthlySurvivalCost = manualMonthlySurvivalCost !== null ? manualMonthlySurvivalCost : realMonthlySurvivalCost;
  const setMonthlySurvivalCost = (val: number | ((prev: number) => number)) => {
    if (typeof val === 'function') {
      setManualMonthlySurvivalCost(val(monthlySurvivalCost));
    } else {
      setManualMonthlySurvivalCost(val);
    }
  };

  const handleToggleEditingFinancialMode = () => {
    if (isEditingFinancialMode) {
      setIsEditingFinancialMode(false);
      setInlineEditingField(null);
    } else {
      haptics.success();
      setIsEditingFinancialMode(true);
      setEditingFinancialDraft(JSON.parse(JSON.stringify(transactions)));
      setShowActiveToast(true);
      setTimeout(() => {
        setShowActiveToast(false);
      }, 4000);
    }
  };

  const handleStartInlineEdit = (field: 'balance' | 'income' | 'expense', value: number) => {
    haptics.lightClick();
    setInlineEditingField(field);
    setInlineEditingValue(value.toFixed(2).replace('.', ','));
  };

  const handleSaveInlineValue = () => {
    const cleanNum = parseFloat(inlineEditingValue.replace(/\./g, '').replace(',', '.'));
    if (isNaN(cleanNum)) {
      setInlineEditingField(null);
      return;
    }
    
    setEditingFinancialDraft(prev => {
      const copy = [...prev];
      if (inlineEditingField === 'balance') {
        const currentBalance = copy.reduce((acc, t) => {
          const isInc = categories.find(c => c.id === t.category_id)?.type === CategoryType.INCOME;
          return isInc ? acc + t.value : acc - t.value;
        }, 0);
        const diff = cleanNum - currentBalance;
        if (Math.abs(diff) > 0.01) {
          const targetType = diff > 0 ? CategoryType.INCOME : CategoryType.CUTTABLE;
          let cat = categories.find(c => c.type === targetType);
          copy.push({
            id: 'adj-' + Math.random().toString(36).substring(2, 9),
            value: Math.abs(diff),
            category_id: cat?.id || '',
            date: new Date().toISOString(),
            note: 'Ajuste Geral de Patrimônio Líquido'
          });
        }
      } else if (inlineEditingField === 'income') {
        const currentIncome = copy
          .filter(t => categories.find(c => c.id === t.category_id)?.type === CategoryType.INCOME)
          .reduce((acc, t) => acc + t.value, 0);
        const diff = cleanNum - currentIncome;
        if (Math.abs(diff) > 0.01) {
          const cat = categories.find(c => c.type === CategoryType.INCOME);
          copy.push({
            id: 'adj-inc-' + Math.random().toString(36).substring(2, 9),
            value: Math.abs(diff),
            category_id: cat?.id || '',
            date: new Date().toISOString(),
            note: diff > 0 ? 'Ajuste de Saldo de Entrada' : 'Ajuste de Dedução de Entrada'
          });
        }
      } else if (inlineEditingField === 'expense') {
        const currentExpense = copy
          .filter(t => categories.find(c => c.id === t.category_id)?.type !== CategoryType.INCOME)
          .reduce((acc, t) => acc + t.value, 0);
        const diff = cleanNum - currentExpense;
        if (Math.abs(diff) > 0.01) {
          const cat = categories.find(c => c.type !== CategoryType.INCOME);
          copy.push({
            id: 'adj-exp-' + Math.random().toString(36).substring(2, 9),
            value: Math.abs(diff),
            category_id: cat?.id || '',
            date: new Date().toISOString(),
            note: 'Ajuste de Despesa'
          });
        }
      }
      return copy;
    });
    setInlineEditingField(null);
  };

  const handleEditDraftTransaction = (updatedTx: Transaction) => {
    haptics.lightClick();
    setEditingFinancialDraft(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
  };

  const handleDuplicateDraftTransaction = (tx: Transaction) => {
    haptics.success();
    const duplicated: Transaction = {
      ...tx,
      id: 'dup-' + Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString(),
      note: tx.note ? `${tx.note} (Cópia)` : 'Transação Duplicada'
    };
    setEditingFinancialDraft(prev => [duplicated, ...prev]);
  };

  const handleMoveDraftTransaction = (tx: Transaction) => {
    haptics.lightClick();
    const currentIndex = categories.findIndex(c => c.id === tx.category_id);
    const nextIndex = (currentIndex + 1) % categories.length;
    const nextCat = categories[nextIndex];
    setEditingFinancialDraft(prev => prev.map(t => t.id === tx.id ? { ...t, category_id: nextCat.id } : t));
  };

  const handleDeleteDraftTransaction = (id: string) => {
    haptics.actionCritical();
    setEditingFinancialDraft(prev => prev.filter(t => t.id !== id));
  };

  const handleSaveAllChanges = () => {
    haptics.success();
    db.saveAllTransactions(editingFinancialDraft);
    onRefreshCategories();
    setIsEditingFinancialMode(false);
    setInlineEditingField(null);
  };

  const handleDiscardAllChanges = () => {
    haptics.close();
    setIsEditingFinancialMode(false);
    setInlineEditingField(null);
    setEditingFinancialDraft([]);
  };

  const [lottieData, setLottieData] = useState<any>(null);

  useEffect(() => {
    const loadLottie = async (url: string, isFallback = false) => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          setLottieData(data);
        } catch (parseError) {
          throw new Error('Response is not valid JSON');
        }
      } catch (err) {
        if (!isFallback) {
          // Fallback to a stable abstract animation
          loadLottie('https://lottie.host/67e4e897-a97c-4363-820d-7617498c2596/9H1V6Z8Y8Z.json', true);
        } else {
          console.warn('Failed to load any Lottie animation for CortesPage');
        }
      }
    };

    // Primary URL (attempting a more stable one first)
    loadLottie('https://assets9.lottiefiles.com/packages/lf20_pucia9k3.json');
  }, []);

  // Helper para meses reais
  const getMonthData = (offset: number) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() + offset);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    return { key, label, date, offset };
  };

  // Forçar scroll para o topo ao montar a página
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, []);

  // Background Carousel Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % bgImages.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [bgImages]);

  // Sync local categories with props
  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  // Carregar projeções salvas
  useEffect(() => {
    const projections = db.getProjections ? db.getProjections() : [];
    const initialInputs: { [key: string]: number } = {};
    projections.forEach(p => {
      initialInputs[`${p.category_id}-${p.month}-${p.year}`] = p.allowed_value;
    });
    setInputs(initialInputs);
  }, []);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  const getHistoricalBalance = useCallback((year: number, monthIndex: number) => {
    const cutoffDate = new Date(year, monthIndex + 1, 1);
    return activeTransactions.reduce((acc, t) => {
      if (new Date(t.date) >= cutoffDate) return acc;
      const cat = categories.find(c => c.id === t.category_id);
      const isInc = cat?.type === CategoryType.INCOME;
      return isInc ? acc + t.value : acc - t.value;
    }, 0);
  }, [activeTransactions, categories]);

  // --- LÓGICA DE FILTROS E ESTATÍSTICAS ---
  
  const filteredTransactions = useMemo(() => {
    return activeTransactions.filter(t => {
      const tDate = new Date(t.date);
      const now = new Date();
      
      // Filtro de Período
      if (filterPeriod === 'day') {
        if (tDate.toDateString() !== now.toDateString()) return false;
      } else if (filterPeriod === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        if (tDate < weekAgo) return false;
      } else if (filterPeriod === 'month') {
        if (tDate.getMonth() !== now.getMonth() || tDate.getFullYear() !== now.getFullYear()) return false;
      } else if (filterPeriod === 'year') {
        if (tDate.getFullYear() !== now.getFullYear()) return false;
      }

      // Filtro de Categoria
      if (filterCategory !== 'all' && t.category_id !== filterCategory) return false;

      // Filtro de Tipo
      const cat = categories.find(c => c.id === t.category_id);
      if (filterType === 'income' && cat?.type !== CategoryType.INCOME) return false;
      if (filterType === 'expense' && cat?.type === CategoryType.INCOME) return false;

      // Busca
      if (searchQuery && !t.note?.toLowerCase().includes(searchQuery.toLowerCase())) {
        const catName = cat?.name.toLowerCase() || '';
        if (!catName.includes(searchQuery.toLowerCase())) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activeTransactions, categories, filterPeriod, filterCategory, filterType, searchQuery]);

  const listItems = useMemo(() => {
    const items: (Transaction | { type: 'header', label: string })[] = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;

    let lastLabel = '';
    filteredTransactions.forEach(t => {
      const tDate = new Date(t.date);
      const tDay = new Date(tDate.getFullYear(), tDate.getMonth(), tDate.getDate()).getTime();
      
      let label = '';
      if (tDay === today) label = 'Hoje';
      else if (tDay === yesterday) label = 'Ontem';
      else label = tDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

      if (label !== lastLabel) {
        items.push({ type: 'header', label });
        lastLabel = label;
      }
      items.push(t);
    });
    return items;
  }, [filteredTransactions]);

  const [listScales, setListScales] = useState<number[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      if (!transactionListRef.current) return;

      const container = transactionListRef.current;
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height / 2;

      const children = Array.from(container.children[0]?.children || []);

      const newScales = children.map((child) => {
        const rect = child.getBoundingClientRect();
        const itemCenter = rect.top + rect.height / 2;

        const distance = Math.abs(containerCenter - itemCenter);
        const maxDistance = containerRect.height / 2;
        const normalized = Math.min(distance / maxDistance, 1);

        // Escala suave: centro (1.0) -> bordas (0.94)
        return 1 - (normalized * 0.06);
      });

      setListScales(newScales);
    };

    handleScroll();

    const container = transactionListRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [listItems]);

  const stats = useMemo(() => {
    const income = filteredTransactions
      .filter(t => categories.find(c => c.id === t.category_id)?.type === CategoryType.INCOME)
      .reduce((acc, t) => acc + t.value, 0);
    
    const expenses = filteredTransactions
      .filter(t => categories.find(c => c.id === t.category_id)?.type !== CategoryType.INCOME)
      .reduce((acc, t) => acc + t.value, 0);

    return {
      income,
      expenses,
      result: income - expenses,
      balance: activeTransactions.reduce((acc, t) => {
        const isInc = categories.find(c => c.id === t.category_id)?.type === CategoryType.INCOME;
        return isInc ? acc + t.value : acc - t.value;
      }, 0)
    };
  }, [filteredTransactions, categories, activeTransactions]);

  // --- MODELO ANALISTA FINANCEIRO EXATO (DYNAMIC TIMELINES & COYFIN-GRADE RESOLUTIONS) ---
  const analystChartData = useMemo(() => {
    const Today = new Date();
    Today.setHours(12, 0, 0, 0);

    // Zoom and pan calculate start and end offsets around the today view point shifts
    const centerDate = new Date(Today.getTime() + panOffset * 24 * 60 * 60 * 1000);
    const halfSpan = zoomDays / 2;
    const startDate = new Date(centerDate.getTime() - halfSpan * 24 * 60 * 60 * 1000);
    const endDate = new Date(centerDate.getTime() + halfSpan * 24 * 60 * 60 * 1000);

    let intervalDays = 1;
    let formatOption: 'day_short' | 'month_short' | 'year' | 'hour' | 'event' = 'day_short';

    if (zoomDays > 1460) {
      intervalDays = 180; // Décadas (>4 anos): agrupamos a cada 6 meses (semi-anual)
      formatOption = 'year';
    } else if (zoomDays > 300) {
      intervalDays = 30; // Anos (1 a 4 anos): mensal
      formatOption = 'month_short';
    } else if (zoomDays > 90) {
      intervalDays = 7; // Meses (3 a 12 meses): semanal
      formatOption = 'day_short';
    } else if (zoomDays > 14) {
      intervalDays = 2; // Semanas (15 a 90 d): agrupamos a cada 2 dias
      formatOption = 'day_short';
    } else if (zoomDays > 4) {
      intervalDays = 1; // Dias (5 a 14 d): diário exato
      formatOption = 'day_short';
    } else {
      formatOption = 'event'; // Menos de 4 dias: Eventos individuais chronológicos!
    }

    const points: any[] = [];
    const transactionsSorted = [...activeTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const currentBalance = stats.balance;
    const netDailyTrend = stats.result / 30;
    const dailyIncomeTrend = stats.income / 30;
    const dailyExpenseTrend = stats.expenses / 30;

    const getBalanceAtDate = (date: Date) => {
      const targetTime = date.getTime();
      const txsAfter = transactionsSorted.filter(t => new Date(t.date).getTime() > targetTime);
      const diffSum = txsAfter.reduce((acc, t) => {
        const isInc = categories.find(c => c.id === t.category_id)?.type === CategoryType.INCOME;
        return isInc ? acc + t.value : acc - t.value;
      }, 0);
      return currentBalance - diffSum;
    };

    if (formatOption === 'event') {
      const periodTxs = transactionsSorted.filter(t => {
        const tTime = new Date(t.date).getTime();
        return tTime >= startDate.getTime() && tTime <= endDate.getTime();
      });

      if (periodTxs.length === 0) {
        const startBal = getBalanceAtDate(startDate);
        const endBal = getBalanceAtDate(endDate);
        points.push({
          date: 'Base',
          fullDate: startDate.toLocaleDateString('pt-BR'),
          isFuture: startDate.getTime() > Today.getTime(),
          isToday: false,
          pastBalance: startDate.getTime() > Today.getTime() ? null : startBal,
          futureBalance: startDate.getTime() > Today.getTime() ? startBal : null,
          income: 0,
          expense: 0,
          meta: multiPeriodGoals[getMonthData(7).key] || (startBal * 1.15),
          rawBalance: startBal,
          rawIncome: 0,
          rawExpense: 0,
          breakdown: []
        });
        points.push({
          date: 'Fim',
          fullDate: endDate.toLocaleDateString('pt-BR'),
          isFuture: endDate.getTime() > Today.getTime(),
          isToday: false,
          pastBalance: endDate.getTime() > Today.getTime() ? null : endBal,
          futureBalance: endDate.getTime() > Today.getTime() ? endBal : null,
          income: 0,
          expense: 0,
          meta: multiPeriodGoals[getMonthData(7).key] || (endBal * 1.15),
          rawBalance: endBal,
          rawIncome: 0,
          rawExpense: 0,
          breakdown: []
        });
      } else {
        periodTxs.forEach((t) => {
          const tDate = new Date(t.date);
          const bal = getBalanceAtDate(tDate);
          const isInc = categories.find(c => c.id === t.category_id)?.type === CategoryType.INCOME;
          const catName = categories.find(c => c.id === t.category_id)?.name || 'Outro';

          points.push({
            date: t.note || catName,
            fullDate: tDate.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
            isFuture: tDate.getTime() > Today.getTime(),
            isToday: Math.abs(tDate.getTime() - Today.getTime()) < 12 * 60 * 60 * 1000,
            pastBalance: tDate.getTime() > Today.getTime() ? null : bal,
            futureBalance: bal,
            income: isInc ? t.value : null,
            expense: !isInc ? t.value : null,
            meta: multiPeriodGoals[getMonthData(7).key] || (bal * 1.15),
            rawBalance: bal,
            rawIncome: isInc ? t.value : 0,
            rawExpense: !isInc ? t.value : 0,
            breakdown: [{ name: t.note || catName, value: t.value, isIncome: isInc }]
          });
        });
      }
    } else {
      const totalSteps = Math.ceil((endDate.getTime() - startDate.getTime()) / (intervalDays * 24 * 60 * 60 * 1000));
      const stepsToGenerate = Math.min(100, Math.max(2, totalSteps)); // Prevent crash or hangs
      const actualStepDays = (endDate.getTime() - startDate.getTime()) / stepsToGenerate / (24 * 60 * 60 * 1000);

      for (let i = 0; i <= stepsToGenerate; i++) {
        const pointDate = new Date(startDate.getTime() + i * actualStepDays * 24 * 60 * 60 * 1000);
        const isFuture = pointDate.getTime() > Today.getTime();

        let label = '';
        if (formatOption === 'year') {
          label = pointDate.getFullYear().toString();
        } else if (formatOption === 'month_short') {
          label = pointDate.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        } else {
          label = pointDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        }

        const fullDateStr = pointDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

        let balanceVal = 0;
        let incVal = 0;
        let expVal = 0;
        let breakdownList: any[] = [];

        if (!isFuture) {
          balanceVal = getBalanceAtDate(pointDate);

          const limitPast = new Date(pointDate.getTime() - actualStepDays * 24 * 60 * 60 * 1000);
          const periodActivity = transactionsSorted.filter(t => {
            const tTime = new Date(t.date).getTime();
            return tTime > limitPast.getTime() && tTime <= pointDate.getTime();
          });

          periodActivity.forEach(t => {
            const isInc = categories.find(c => c.id === t.category_id)?.type === CategoryType.INCOME;
            if (isInc) incVal += t.value;
            else expVal += t.value;

            const catName = categories.find(c => c.id === t.category_id)?.name || 'Outro';
            breakdownList.push({
              name: t.note || catName,
              value: t.value,
              isIncome: isInc
            });
          });
        } else {
          const daysFromToday = (pointDate.getTime() - Today.getTime()) / (24 * 60 * 60 * 1000);
          balanceVal = currentBalance + (netDailyTrend * daysFromToday);
          incVal = dailyIncomeTrend * actualStepDays;
          expVal = dailyExpenseTrend * actualStepDays;
        }

        const currentGoal = multiPeriodGoals[getMonthData(7).key] || (currentBalance * 1.15);

        points.push({
          date: label,
          fullDate: fullDateStr,
          isFuture,
          isToday: Math.abs(pointDate.getTime() - Today.getTime()) < (actualStepDays * 12 * 60 * 60 * 1000),
          pastBalance: isFuture ? null : (enabledLayers.balance ? balanceVal : null),
          futureBalance: (enabledLayers.balance ? balanceVal : null),
          income: enabledLayers.income ? incVal : null,
          expense: enabledLayers.expense ? expVal : null,
          meta: enabledLayers.goals ? currentGoal : null,
          rawBalance: balanceVal,
          rawIncome: incVal,
          rawExpense: expVal,
          breakdown: breakdownList
        });
      }
    }

    return points;
  }, [zoomDays, panOffset, enabledLayers, activeTransactions, categories, stats, multiPeriodGoals]);

  // --- MODELOS DE SELEÇÃO EXCLUSIVA DE PERSPECTIVAS ---
  const explorerCategoriesData = useMemo(() => {
    const Today = new Date();
    Today.setHours(12, 0, 0, 0);
    const centerDate = new Date(Today.getTime() + panOffset * 24 * 60 * 60 * 1000);
    const halfSpan = zoomDays / 2;
    const startDate = new Date(centerDate.getTime() - halfSpan * 24 * 60 * 60 * 1000);
    const endDate = new Date(centerDate.getTime() + halfSpan * 24 * 60 * 60 * 1000);

    const periodTxs = activeTransactions.filter(t => {
      const tTime = new Date(t.date).getTime();
      return tTime >= startDate.getTime() && tTime <= endDate.getTime();
    });

    const groups: { [catId: string]: { name: string; value: number; color: string; isIncome: boolean } } = {};
    const colors = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#f43f5e', '#a855f7', '#06b6d4', '#14b8a6'];
    periodTxs.forEach(t => {
      const cat = categories.find(c => c.id === t.category_id);
      const catId = t.category_id || 'outro';
      const catName = cat?.name || 'Outro';
      const catIndex = categories.findIndex(c => c.id === t.category_id);
      const catColor = catIndex >= 0 ? colors[catIndex % colors.length] : '#a1a1aa';
      const isInc = cat?.type === CategoryType.INCOME;

      if (!groups[catId]) {
        groups[catId] = { name: catName, value: 0, color: catColor, isIncome: isInc };
      }
      groups[catId].value += t.value;
    });

    return Object.values(groups).sort((a, b) => b.value - a.value);
  }, [zoomDays, panOffset, activeTransactions, categories]);

  const explorerWaterfallData = useMemo(() => {
    const Today = new Date();
    Today.setHours(12, 0, 0, 0);
    const centerDate = new Date(Today.getTime() + panOffset * 24 * 60 * 60 * 1000);
    const halfSpan = zoomDays / 2;
    const startDate = new Date(centerDate.getTime() - halfSpan * 24 * 60 * 60 * 1000);
    const endDate = new Date(centerDate.getTime() + halfSpan * 24 * 60 * 60 * 1000);

    const getBalanceAtDate = (date: Date) => {
      const targetTime = date.getTime();
      const txsAfter = activeTransactions.filter(t => new Date(t.date).getTime() > targetTime);
      const diffSum = txsAfter.reduce((acc, t) => {
        const isInc = categories.find(c => c.id === t.category_id)?.type === CategoryType.INCOME;
        return isInc ? acc + t.value : acc - t.value;
      }, 0);
      return stats.balance - diffSum;
    };

    const startBal = getBalanceAtDate(startDate);
    const endBal = getBalanceAtDate(endDate);

    const periodTxs = activeTransactions.filter(t => {
      const tTime = new Date(t.date).getTime();
      return tTime >= startDate.getTime() && tTime <= endDate.getTime();
    });

    let incSum = 0;
    let expSum = 0;
    periodTxs.forEach(t => {
      const isInc = categories.find(c => c.id === t.category_id)?.type === CategoryType.INCOME;
      if (isInc) incSum += t.value;
      else expSum += t.value;
    });

    return [
      { name: 'Saldo Base', transparent: 0, val: startBal, displayVal: startBal, fill: '#64748b' },
      { name: 'Receitas (+)', transparent: startBal, val: incSum, displayVal: incSum, fill: '#10b981' },
      { name: 'Despesas (-)', transparent: Math.max(0, startBal + incSum - expSum), val: expSum, displayVal: -expSum, fill: '#f43f5e' },
      { name: 'Saldo Final', transparent: 0, val: endBal, displayVal: endBal, fill: '#6366f1' }
    ];
  }, [zoomDays, panOffset, activeTransactions, categories, stats.balance]);

  // --- CONTROLES DE ZOOM E PAN DINÂMICOS (MAQUINA DO TEMPO) ---
  const [isDragPanning, setIsDragPanning] = useState(false);
  const [dragStartMouseX, setDragStartMouseX] = useState(0);
  const [touchDistStart, setTouchDistStart] = useState<number | null>(null);

  const handleChartWheel = (e: React.WheelEvent) => {
    // Zoom acumulativo e contínuo
    const scaleFactor = e.deltaY < 0 ? 0.85 : 1.15;
    setZoomDays(prev => {
      const nextRaw = prev * scaleFactor;
      // Permite zoom contínuo de 2 dias até 10 anos (3650 dias!)
      return Math.round(Math.max(2, Math.min(nextRaw, 3650)));
    });
  };

  const handleChartMouseDown = (e: React.MouseEvent) => {
    setIsDragPanning(true);
    setDragStartMouseX(e.clientX);
  };

  const handleChartMouseMove = (e: React.MouseEvent) => {
    if (!isDragPanning) return;
    const deltaX = e.clientX - dragStartMouseX;
    if (Math.abs(deltaX) > 3) {
      // Um arraste de 1 pixel desloca proporcionalmente à quantidade de dias no gráfico
      const daysPerPx = zoomDays / 500;
      const daysMoved = deltaX * daysPerPx * -1; // esquerda joga para o futuro, direita para o passado
      setPanOffset(prev => prev + daysMoved);
      setDragStartMouseX(e.clientX);
    }
  };

  const handleChartMouseUpOrLeave = () => {
    setIsDragPanning(false);
  };

  const handleChartTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragPanning(true);
      setDragStartMouseX(e.touches[0].clientX);
    } else if (e.touches.length === 2) {
      // Inicia gesto de pinça para zoom mobile
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      setTouchDistStart(dist);
    }
  };

  const handleChartTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragPanning) {
      const deltaX = e.touches[0].clientX - dragStartMouseX;
      if (Math.abs(deltaX) > 3) {
        const daysPerPx = zoomDays / 300;
        const daysMoved = deltaX * daysPerPx * -1;
        setPanOffset(prev => prev + daysMoved);
        setDragStartMouseX(e.touches[0].clientX);
      }
    } else if (e.touches.length === 2 && touchDistStart !== null) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const delta = touchDistStart - dist;
      if (Math.abs(delta) > 8) {
        setZoomDays(prev => {
          const scaleFactor = delta > 0 ? 1.15 : 0.85;
          const next = Math.round(prev * scaleFactor);
          return Math.max(2, Math.min(next, 3650));
        });
        setTouchDistStart(dist);
      }
    }
  };

  const handleChartTouchEnd = () => {
    setIsDragPanning(false);
    setTouchDistStart(null);
  };

  const handleResetChartZoomPan = () => {
    haptics.lightClick();
    setZoomDays(30);
    setPanOffset(0);
  };

  const months = useMemo(() => {
    const list = [];
    for (let i = -6; i <= 12; i++) {
      const data = getMonthData(i);
      list.push({
        ...data,
        type: i < 0 ? 'past' : i === 0 ? 'present' : 'future'
      });
    }
    return list;
  }, []);

  const distributionData = useMemo(() => {
    const data: { name: string; value: number; color: string }[] = [];
    const expenseTransactions = filteredTransactions.filter(t => 
      categories.find(c => c.id === t.category_id)?.type !== CategoryType.INCOME
    );

    const totals: { [key: string]: number } = {};
    expenseTransactions.forEach(t => {
      const cat = categories.find(c => c.id === t.category_id);
      if (cat) {
        totals[cat.name] = (totals[cat.name] || 0) + t.value;
      }
    });

    const colors = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];
    Object.entries(totals).forEach(([name, value], idx) => {
      data.push({ name, value, color: colors[idx % colors.length] });
    });

    return data.sort((a, b) => b.value - a.value);
  }, [filteredTransactions, categories]);

  // Alinhamento com Objetivos (Simulado baseado em categorias de investimento/metas)
  const objectiveStats = useMemo(() => {
    const invested = filteredTransactions
      .filter(t => {
        const cat = categories.find(c => c.id === t.category_id);
        return cat?.name.toLowerCase().includes('objetivo') || cat?.name.toLowerCase().includes('investimento');
      })
      .reduce((acc, t) => acc + t.value, 0);
    
    const totalExpenses = stats.expenses || 1;
    return {
      invested,
      outside: stats.expenses - invested,
      ratio: (invested / totalExpenses) * 100
    };
  }, [filteredTransactions, categories, stats.expenses]);

  // --- LÓGICA ORIGINAL DO MÓDULO DE CORTES ---
  const spendingData = useMemo(() => {
    const intervals: any[] = [];
    const now = new Date();
    const currM = now.getMonth();
    const currY = now.getFullYear();

    const createMonthLabel = (date: Date) => {
      return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();
    };

    if (viewMode === 'FUTURO') {
      for (let i = 1; i <= futureRange; i++) {
        const d = new Date(currY, currM + i, 1);
        intervals.push({
          start: new Date(d),
          label: createMonthLabel(d),
          month: d.getMonth(),
          year: d.getFullYear(),
          isFuture: true
        });
      }
    } else {
      let monthsToBack = 1;
      if (selectedPeriod === '3_MESES') monthsToBack = 3;
      if (selectedPeriod === 'HISTORICO_TOTAL') monthsToBack = 12;

      for (let i = 0; i < monthsToBack; i++) {
        const d = new Date(currY, currM - i, 1);
        intervals.push({
          start: new Date(d),
          label: createMonthLabel(d),
          month: d.getMonth(),
          year: d.getFullYear(),
          isFuture: false
        });
      }
    }

    const result: any = {};
    localCategories.filter(c => c.type !== CategoryType.INCOME).forEach(cat => {
      const periods = intervals.map(interval => {
        const spent = activeTransactions
          .filter(t => t.category_id === cat.id)
          .filter(t => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === interval.month && tDate.getFullYear() === interval.year;
          })
          .reduce((acc, t) => acc + t.value, 0);

        const specificKey = `${cat.id}-${interval.month}-${interval.year}`;
        const limit = inputs[specificKey] ?? 0;
        const economy = limit > 0 ? limit - spent : 0;

        return { ...interval, spent, economy, limit };
      });

      const totalFiltered = periods.reduce((acc, p) => acc + p.spent, 0);
      result[cat.id] = { filtered: totalFiltered, periods };
    });

    return result;
  }, [localCategories, activeTransactions, selectedPeriod, viewMode, futureRange, inputs]);

  const handleSaveProjection = (catId: string, month: number, year: number, value: number, label: string) => {
    if (db.saveProjection) {
      db.saveProjection({ category_id: catId, month, year, allowed_value: value });
      // Usar um feedback visual em vez de alert se possível, mas mantendo a lógica original
      alert(`Simulação: Estratégia para ${label} Consolidada!`);
    }
  };

  const handleReorder = (newOrder: Category[]) => {
    setLocalCategories(newOrder);
  };

  const saveReorder = () => {
    db.reorderCategories(localCategories);
    onRefreshCategories();
    setIsReordering(false);
  };

  const handleOpenModal = (tab: 'income' | 'expense' | 'categories') => {
    setModalTab(tab);
    setIsModalOpen(true);
  };

  useEffect(() => {
    console.log('[DEBUG] isModalOpen:', isModalOpen);
  }, [isModalOpen]);

  // --- RENDERS ---

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0b0c] text-gray-900 dark:text-gray-100 pb-20 font-sans relative overflow-x-hidden" ref={containerRef}>
      
      <UnifiedFinanceModal 
        isOpen={isModalOpen}
        onClose={() => {
          document.body.style.overflow = 'unset';
          setIsModalOpen(false);
        }}
        initialTab={modalTab}
        categories={categories}
        onRefreshCategories={onRefreshCategories}
      />

      <AnimatePresence>
        {isAnalystModeOpen && (
          <motion.div 
            initial={{ opacity: 0, translateY: 10, scale: 0.995 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            exit={{ opacity: 0, translateY: 10, scale: 0.995 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] bg-[#f8fafc] dark:bg-[#07070a] text-slate-900 dark:text-zinc-100 p-0 flex flex-col justify-between overflow-hidden select-none font-sans"
          >
            {/* FLOATING ACTION BUTTONS AT THE TOP RIGHT (STACKED VERTICALLY) */}
            <div className="absolute top-4 right-4 z-[1000] flex flex-col items-center gap-3">
              <button 
                onClick={() => { haptics.lightClick(); onToggleTheme?.(); }}
                className="w-11 h-11 rounded-full bg-white/90 dark:bg-[#121217]/90 backdrop-blur-md border border-slate-200/80 dark:border-zinc-850 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-[0_4px_14px_rgba(0,0,0,0.08)] text-slate-800 dark:text-zinc-100 font-bold hover:scale-105 active:scale-95"
                title="Mudar Tema"
              >
                {theme === 'dark' ? <Sun size={16} className="text-amber-450" /> : <Moon size={16} className="text-indigo-600" />}
              </button>
              <button 
                onClick={() => { haptics.lightClick(); setIsAnalystModeOpen(false); }}
                className="w-11 h-11 rounded-full bg-white/90 dark:bg-[#121217]/90 backdrop-blur-md border border-slate-200/80 dark:border-zinc-850 flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-950/25 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer shadow-[0_4px_14px_rgba(0,0,0,0.08)] text-slate-600 dark:text-zinc-400 hover:scale-105 active:scale-95"
                title="Fechar"
              >
                <X size={16} />
              </button>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 overflow-y-auto px-1 sm:px-6 py-6 lg:py-10 md:p-10">
              <style dangerouslySetInnerHTML={{ __html: `
                .bg-stripes-pattern {
                  background-image: linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent);
                  background-size: 1.5rem 1.5rem;
                }
              `}} />

              {/* WORKSPACE FLOW (Otimizado responsivamente para Mobile e Desktop) */}
              <div className="max-w-4xl mx-auto space-y-8 sm:space-y-10 w-full">

                {/* SECTION 1: EXECUÇÃO PRIORITÁRIA */}
                <section className="space-y-6" id="execucao-prioritaria">
                  <header className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 bg-white dark:bg-[#111115] border border-indigo-100 dark:border-indigo-900/50 px-4 py-1.5 rounded-full shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse"></div>
                      <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-widest">Consciênciometria de Fluxo</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                      Execução Prioritária
                    </h1>
                    <h2 className="text-4xl md:text-5xl font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tight leading-none">
                      da Proéxis
                    </h2>
                    
                    {(() => {
                      const activeBalance = stats.balance > 0 ? stats.balance : 18500;
                      const hourlyCost = Number((monthlySurvivalCost / 729.12).toFixed(2));
                      const seguroHourlyCost = hourlyCost > 0 ? hourlyCost : 6.17;
                      const hoursCreated = Math.floor(activeBalance / seguroHourlyCost);
                      const daysCreated = Math.floor(hoursCreated / 24);

                      let badgeText = "🏆 Iniciante Proexológico";
                      let badgeColor = "bg-pink-50 dark:bg-pink-950/25 border-pink-100 dark:border-pink-900/40 text-pink-600 dark:text-pink-400";
                      
                      if (daysCreated > 10 && daysCreated <= 120) {
                        badgeText = "🌟 Praticante Proexológico";
                        badgeColor = "bg-amber-50 dark:bg-amber-950/25 border-amber-100 dark:border-amber-900/40 text-amber-600 dark:text-amber-400";
                      } else if (daysCreated > 120) {
                        badgeText = "⚡ Autônomo Proexológico";
                        badgeColor = "bg-emerald-50 dark:bg-emerald-950/25 border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400";
                      }

                      return (
                        <div className="pt-2">
                          <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border font-bold text-xs uppercase tracking-wider shadow-sm ${badgeColor}`}>
                            {badgeText}
                          </span>
                        </div>
                      );
                    })()}
                  </header>

                  {/* Main Hero Card */}
                  {(() => {
                    const activeBalance = stats.balance > 0 ? stats.balance : 18500;
                    const hourlyCost = Number((monthlySurvivalCost / 729.12).toFixed(2));
                    const seguroHourlyCost = hourlyCost > 0 ? hourlyCost : 6.17;
                    const hoursCreated = Math.floor(activeBalance / seguroHourlyCost);
                    const daysCreated = Math.floor(hoursCreated / 24);
                    const hoursCreatedLeft = hoursCreated % 24;

                    return (
                      <div 
                        className="relative rounded-[32px] overflow-hidden bg-gradient-to-b from-[#121217] to-[#07070a] border border-zinc-800/80 text-white min-h-[380px] flex flex-col justify-center card-shadow p-8 md:p-14"
                      >
                        {/* Subtle pure dark pattern overlay */}
                        <div className="absolute inset-0 bg-noise-pattern opacity-[0.02] pointer-events-none"></div>
                        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                          <div className="space-y-6">
                            <div className="flex items-center gap-2 text-[13px] font-bold opacity-90 uppercase tracking-widest text-emerald-400">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
                              </svg>
                              Você comprou
                            </div>
                            
                            <div className="leading-none">
                              <div className="flex items-baseline gap-4 flex-wrap">
                                <span className="text-8xl md:text-9xl font-black tracking-tighter text-white">{daysCreated}</span>
                                <span className="text-5xl md:text-7xl font-black text-emerald-400">DIAS</span>
                              </div>
                              <p style={{ fontSize: '27px', textAlign: 'center' }} className="text-[22px] font-black tracking-tight mt-1 uppercase text-zinc-300">De vida comprada</p>
                            </div>
                            
                            <div className="space-y-4">
                              {(() => {
                                const computedYears = Math.floor(daysCreated / 365);
                                const computedMonths = Math.floor((daysCreated % 365) / 30);
                                const computedRemainingDays = Math.floor((daysCreated % 365) % 30);

                                let equivalencePhrase = "";
                                if (daysCreated === 0) {
                                  equivalencePhrase = "nenhum dia de autonomia";
                                } else {
                                  const parts = [];
                                  if (computedYears > 0) {
                                    parts.push(`${computedYears} ${computedYears === 1 ? 'ano' : 'anos'}`);
                                  }
                                  if (computedMonths > 0) {
                                    parts.push(`${computedMonths} ${computedMonths === 1 ? 'mês' : 'meses'}`);
                                  }
                                  if (computedRemainingDays > 0 || parts.length === 0) {
                                    parts.push(`${computedRemainingDays} ${computedRemainingDays === 1 ? 'dia' : 'dias'}`);
                                  }
                                  
                                  if (parts.length === 1) {
                                    equivalencePhrase = parts[0];
                                  } else if (parts.length === 2) {
                                    equivalencePhrase = `${parts[0]} e ${parts[1]}`;
                                  } else {
                                    equivalencePhrase = `${parts[0]}, ${parts[1]} e ${parts[2]}`;
                                  }
                                }
                                return (
                                  <p className="text-base font-medium leading-relaxed max-w-sm text-zinc-300">
                                    Seu patrimônio atual já comprou <span className="text-emerald-450 font-black">{hoursCreated.toLocaleString('pt-BR')} horas</span> de liberdade existencial para o seu futuro, o que equivale a exatamente <span className="text-white font-extrabold underline decoration-emerald-500/50">{equivalencePhrase}</span> de pura autonomia reservada hoje.
                                  </p>
                                );
                              })()}
                            </div>
                          </div>

                          <div style={{ marginRight: '0px' }} className="flex md:justify-end">
                            <div style={{ height: '171.444px', marginTop: '0px', paddingTop: '19px', width: '294px', paddingRight: '16px', marginRight: '-15px', marginLeft: '13px', paddingLeft: '16px' }} className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-850 rounded-3xl space-y-6 shadow-2xl">
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                  <svg className="h-7 w-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                  </svg>
                                </div>
                                <div className="text-left">
                                  <div style={{ fontSize: '32px' }} className="text-2xl font-black text-white">R$ {seguroHourlyCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                  <div style={{ fontSize: '10px' }} className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">= 1 Hora de Vida</div>
                                </div>
                              </div>
                              <p className="text-xs text-zinc-400 leading-relaxed font-semibold text-left">
                                Valor da sua hora de existência baseado nos seus custos mínimos
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}


                  {/* UNIFIED MEGA DASHBOARD OF EXISTENTIAL REDEMPTION (The Heart of the System) */}
                  {(() => {
                    const activeBalance = stats.balance > 0 ? stats.balance : 18500;
                    const hourlyCost = Number((monthlySurvivalCost / 729.12).toFixed(2));
                    const seguroHourlyCost = hourlyCost > 0 ? hourlyCost : 6.17;
                    const hoursCreated = Math.floor(activeBalance / seguroHourlyCost);
                    const daysCreated = Math.floor(hoursCreated / 24);

                    const targetYears = simLifeYears;
                    const targetDays = targetYears * 365;
                    const remainingDays = Math.max(0, targetDays - daysCreated);
                    const remYears = Math.floor(remainingDays / 365);
                    const remDays = Math.round(remainingDays % 365);

                    // Calculations for cost & targets
                    const totalDirectCost = Math.round(monthlySurvivalCost * 12 * targetYears);
                    const targetAssetPool = Math.round((monthlySurvivalCost * 12) / 0.0328707);

                    const progressPercentageDirect = Math.min(100, Math.max(0.1, (activeBalance / totalDirectCost) * 100));

                    // Jogo da vontade calculations
                    const simAmountNum = Number(simulationAmount) || 0;
                    const simHours = simAmountNum / seguroHourlyCost;
                    const simDays = Math.floor(simHours / 24);
                    const simHoursLeft = Math.round(simHours % 24);

                    return (
                      <div className="bg-zinc-950 text-white rounded-2xl sm:rounded-[36px] overflow-hidden dark:bg-[#07070a] border border-zinc-800 dark:border-zinc-850 p-4 sm:p-6 md:p-10 card-shadow text-left space-y-8 relative sm:-mx-4 md:-mx-8 lg:mx-0 xl:mx-0">
                        {/* Subtle Monochrome Dark Radial Overlay */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-zinc-800/10 rounded-full blur-3xl pointer-events-none"></div>

                        {/* Elegant Fine Banknote Guilloché Relief Lines - Ultra Subtle & Premium */}
                        <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.03] pointer-events-none select-none mix-blend-overlay overflow-hidden">
                          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                              <pattern id="banknote-guilloche-1" width="120" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
                                <path d="M0 12 C 30 0, 90 24, 120 12" fill="none" stroke="#10b981" strokeWidth="0.5" />
                                <path d="M0 6 C 30 -6, 90 18, 120 6" fill="none" stroke="#10b981" strokeWidth="0.3" />
                                <path d="M0 18 C 30 6, 90 30, 120 18" fill="none" stroke="#10b981" strokeWidth="0.3" />
                                <path d="M0 0 C 40 12, 80 -12, 120 0" fill="none" stroke="#10b981" strokeWidth="0.4" />
                                <path d="M0 24 C 40 36, 80 12, 120 24" fill="none" stroke="#10b981" strokeWidth="0.4" />
                              </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#banknote-guilloche-1)" />
                          </svg>
                        </div>

                        {/* HEADER & SIMPLE DESCRIPTION */}
                        <div className="relative z-10 border-b border-zinc-800 pb-5 sm:pb-6 flex flex-col justify-center items-center gap-2 text-center w-full">
                          <h3 
                            style={{ fontSize: '26px' }}
                            className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-none text-center w-full"
                          >
                            Compre sua Plena Autonomia
                          </h3>
                        </div>

                        {/* 1. THE SUBCONSCIOUS PSYCHOLOGICAL MIND MAP (The Conversion Mechanics) */}
                        <div className="relative z-10 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                            <span className="text-[9.5px] font-black uppercase text-emerald-400 tracking-widest">Equação Psicológica da Liberdade (Mental Map)</span>
                          </div>
                          
                          {/* Interactive Flow Diagram */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5 items-stretch select-none relative">
                            {/* Card A: Fuel */}
                            <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-850 flex flex-col justify-between hover:border-emerald-500/20 transition-all text-left">
                              <div>
                                <span 
                                  style={{ textAlign: 'center' }}
                                  className="text-[9px] font-bold text-zinc-500 block uppercase tracking-wider"
                                >
                                  O COMBUSTÍVEL (Ativos)
                                </span>
                                <div 
                                  style={{ textAlign: 'center' }}
                                  className="text-xl font-black text-white mt-1"
                                >
                                  R$ {activeBalance.toLocaleString('pt-BR')}
                                </div>
                              </div>
                              <span 
                                style={{ textAlign: 'center' }}
                                className="text-[9px] text-zinc-400 mt-4 font-semibold leading-relaxed"
                              >
                                Toda a sua energia vital armazenada em formato líquido.
                              </span>
                            </div>

                            {/* Divider arrow 1 - split */}
                            <div className="flex flex-col justify-center items-center py-1 md:py-0">
                              <div className="bg-zinc-950 px-4 py-3 rounded-xl border border-zinc-850 text-center z-10 w-full sm:w-auto space-y-1">
                                <span className="text-[9px] font-black text-rose-450 uppercase block tracking-wider">Dividido Pelo</span>
                                <span className="text-xs font-black text-white block">R$ {monthlySurvivalCost.toLocaleString('pt-BR')} /mês</span>
                                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block leading-none">(CUSTO DE SOBREVIVÊNCIA)</span>
                              </div>
                            </div>

                             {/* Card B: Sovereignty (A Força Vital - High Contrast Emphasis) */}
                             <div className="bg-gradient-to-br from-[#07070a] via-[#121217] to-black w-full p-6 rounded-xl border-2 border-emerald-500/50 flex flex-col justify-between shadow-[0_8px_32px_rgba(16,185,129,0.15)] text-left relative overflow-hidden group hover:border-emerald-400 transition-all">
                               {/* Inside decorative banknote visual engraving stamp */}
                               <div className="absolute inset-0 opacity-[0.1] pointer-events-none">
                                 <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                   <circle cx="50%" cy="50%" r="45" fill="none" stroke="#10b981" strokeWidth="0.5" strokeDasharray="3 3" />
                                   <line x1="10%" y1="10%" x2="90%" y2="90%" stroke="#10b981" strokeWidth="0.3" />
                                   <line x1="90%" y1="10%" x2="10%" y2="90%" stroke="#10b981" strokeWidth="0.3" />
                                 </svg>
                               </div>
 
                               <div className="relative z-10 space-y-4">
                                 <div className="flex items-center justify-between">
                                   <span className="text-[10px] font-black text-white block uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-md">
                                     A FORÇA VITAL (Tempo)
                                   </span>
                                   <span className="text-xs">🛡️</span>
                                 </div>
                                 <div className="space-y-1.5">
                                   <span className="text-[11px] font-black text-zinc-300 block uppercase tracking-tight">Você tem atualmente</span>
                                   <div className="text-[52px] font-black text-white tracking-tight flex items-baseline gap-1.5 leading-none">
                                     {daysCreated} <span className="text-[20px] font-black text-emerald-400">DIAS DE VIDA</span>
                                   </div>
                                   {(() => {
                                     const computedYears = Math.floor(daysCreated / 365);
                                     const computedMonths = Math.floor((daysCreated % 365) / 30);
                                     const computedRemainingDays = Math.floor((daysCreated % 365) % 30);
 
                                     let equivalencePhrase = "";
                                     if (daysCreated === 0) {
                                       equivalencePhrase = "Nenhum dia de autonomia";
                                     } else {
                                       const parts = [];
                                       if (computedYears > 0) {
                                         parts.push(`${computedYears} ${computedYears === 1 ? 'ano' : 'anos'}`);
                                       }
                                       if (computedMonths > 0) {
                                         parts.push(`${computedMonths} ${computedMonths === 1 ? 'mês' : 'meses'}`);
                                       }
                                       if (computedRemainingDays > 0 || parts.length === 0) {
                                         parts.push(`${computedRemainingDays} ${computedRemainingDays === 1 ? 'dia' : 'dias'}`);
                                       }
                                       
                                       if (parts.length === 1) {
                                         equivalencePhrase = `Equivale a exatamente ${parts[0]}`;
                                       } else if (parts.length === 2) {
                                         equivalencePhrase = `Equivale a ${parts[0]} e ${parts[1]}`;
                                       } else {
                                         equivalencePhrase = `Equivale a ${parts[0]}, ${parts[1]} e ${parts[2]}`;
                                       }
                                     }
                                     return (
                                       <span className="text-[10.5px] font-bold text-zinc-100 bg-white/10 px-2.5 py-1.5 rounded-md block leading-snug">
                                         💡 {equivalencePhrase}
                                       </span>
                                     );
                                   })()}
                                 </div>
                               </div>
                             </div>
                          </div>
                          <p className="text-[10px] font-bold text-zinc-500 text-center leading-relaxed max-w-xl mx-auto uppercase">
                            ������ O segredo da alma soberana: reduzir o gargalo de consumo (Custo) expande instantaneamente o seu combustível em tempo útil de vida comprada.
                          </p>
                        </div>

                        {/* 2. RESULTS & COMPARATIVE GRID BLOCK (Displays comparison FIRST in full width) */}
                        <div className="relative z-10 space-y-6">
                          <div className="grid grid-cols-1 gap-4 md:gap-6">
                            {/* Card A: Meta (Prata Inteligente & Graphite Premium Card) */}
                            <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-black w-full p-6 sm:p-8 rounded-2xl border-2 border-zinc-400/90 shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-left relative overflow-hidden group hover:border-zinc-300 transition-all col-span-1">
                              {/* Inside decorative banknote visual engraving stamp - pure white minimal opacity */}
                              <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
                                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="50%" cy="50%" r="50" fill="none" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="3 3" />
                                  <line x1="10%" y1="10%" x2="90%" y2="90%" stroke="#ffffff" strokeWidth="0.3" />
                                  <line x1="90%" y1="10%" x2="10%" y2="90%" stroke="#ffffff" strokeWidth="0.3" />
                                </svg>
                              </div>

                              <div className="relative z-10 space-y-4">
                                <div className="space-y-4">
                                  <div>
                                    <span className="text-xs sm:text-sm font-black text-zinc-400 uppercase tracking-widest block">
                                      Para você possuir exatamente
                                    </span>
                                    <div className="inline-flex items-center gap-3 sm:gap-5 mt-2.5 select-none">
                                      <span className="text-8xl sm:text-9xl md:text-[11rem] font-black text-white tracking-tighter leading-none">
                                        {simLifeYears}
                                      </span>
                                      <div className="flex flex-col justify-center border-l-2 border-emerald-500/30 pl-3 sm:pl-4">
                                        <span 
                                          style={{ fontSize: '22px' }}
                                          className="font-black text-zinc-100 uppercase tracking-widest leading-none"
                                        >
                                          {simLifeYears === 1 ? 'ANO DE VIDA' : 'ANOS DE VIDA'}
                                        </span>
                                        <span 
                                          style={{ fontSize: '22px' }}
                                          className="font-black text-emerald-400 uppercase tracking-widest leading-none mt-1 animate-pulse"
                                        >
                                          {simLifeYears === 1 ? 'COMPRADO' : 'COMPRADOS'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="pt-4 border-t border-zinc-800">
                                    <span 
                                      style={{ fontSize: '10px' }}
                                      className="font-bold text-white block uppercase tracking-widest mb-1.5"
                                    >
                                      você precisa desembolsar um total de:
                                    </span>
                                    <div className="text-2xl sm:text-3.5xl font-black text-rose-450 tracking-tight leading-none">
                                      R$ {totalDirectCost.toLocaleString('pt-BR')}
                                    </div>
                                    
                                    {/* Ultra-high-contrast pill with crisp BLACK text style requested directly by the user */}
                                    <div className="mt-4 bg-zinc-200 border border-white text-zinc-950 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase text-center block shadow-[0_2px_10px_rgba(255,255,255,0.05)]">
                                      * Segurança completa de sobrevivência por {(simLifeYears * 12)} meses de liberdade existencial.
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>


                        </div>

                        {/* 3. INPUT DECISIONS & SLIDERS (Now UNDER the results) */}
                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-2 border-t border-zinc-800/50">
                          {/* Alvo de Autonomia Input */}
                          <div className="bg-zinc-900 border border-zinc-800/80 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                            <div className="text-center flex flex-col items-center justify-center w-full">
                              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-md inline-flex mb-3 mx-auto">
                                Tempo de Autonomia Alvo
                              </span>
                              
                              <div className="flex items-center gap-3 w-full justify-center">
                                <button 
                                  onClick={() => { haptics.mediumClick(); setSimLifeYears(Math.max(1, simLifeYears - 1)); }}
                                  className="w-10 h-10 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-850 flex items-center justify-center text-xl font-black transition-colors shrink-0"
                                >
                                  -
                                </button>
                                <div className="flex-1 max-w-[200px] text-center bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3">
                                  <input 
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={simLifeYears}
                                    onChange={(e) => { 
                                      const val = Math.max(1, Math.min(50, Number(e.target.value) || 1));
                                      setSimLifeYears(val); 
                                    }}
                                    className="w-full text-center text-2xl font-black bg-transparent border-none text-white focus:outline-none"
                                  />
                                  <span className="text-[8px] font-black uppercase text-zinc-400 tracking-wider block">
                                    {simLifeYears === 1 ? 'ANO' : 'ANOS'} DE AUTONOMIA
                                  </span>
                                </div>
                                <button 
                                  onClick={() => { haptics.mediumClick(); setSimLifeYears(Math.min(50, simLifeYears + 1)); }}
                                  className="w-10 h-10 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-850 flex items-center justify-center text-xl font-black transition-colors shrink-0"
                                >
                                  +
                                </button>
                              </div>

                              <div className="flex gap-1.5 flex-wrap mt-3.5 justify-center w-full">
                                {[1, 3, 5, 7, 10, 15, 20].map((y) => (
                                  <button
                                    key={y}
                                    onClick={() => { haptics.heavyClick(); setSimLifeYears(y); }}
                                    className={`px-2.5 py-1 rounded-lg text-[9px] font-black tracking-wider transition-all uppercase ${
                                      simLifeYears === y
                                      ? 'bg-emerald-500 border border-emerald-400 text-white shadow-md'
                                      : 'bg-zinc-950 border border-zinc-800 hover:border-zinc-750 text-zinc-400'
                                    }`}
                                  >
                                    {y} {y === 1 ? 'Ano' : 'Anos'}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1.5 w-full">
                              <input
                                type="range"
                                min="1"
                                max="45"
                                value={simLifeYears}
                                onChange={(e) => { haptics.lightClick(); setSimLifeYears(Number(e.target.value)); }}
                                className="w-full h-1 bg-zinc-950 cursor-pointer accent-emerald-500"
                              />
                            </div>
                          </div>

                          {/* Custo de Sobrevivência Vital Input */}
                          <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 p-5 sm:p-6 rounded-[24px] flex flex-col justify-between space-y-4 shadow-xl">
                            <div className="text-left w-full">
                              <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest bg-zinc-800 border border-zinc-700/60 px-3 py-1 rounded-md inline-block mb-3 font-sans">
                                CUSTO DE SOBREVIVÊNCIA MENSAL
                              </span>
                              
                              <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-850 p-5 rounded-xl space-y-3 shadow-inner">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <span className="text-[10px] font-black text-zinc-400 block uppercase tracking-wider font-sans">
                                    Hoje o seu custo de vida mensal por mês é de:
                                  </span>
                                  {manualMonthlySurvivalCost !== null ? (
                                    <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 font-sans">
                                      Simulado (Manual)
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans">
                                      Real (Automático)
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex items-center justify-between py-1 gap-4 flex-wrap">
                                  <div className="text-3xl sm:text-4xl font-mono font-black text-rose-500 dark:text-rose-450 tracking-tight leading-none text-left">
                                    R$ {monthlySurvivalCost.toLocaleString('pt-BR')}
                                  </div>
                                  
                                  {manualMonthlySurvivalCost !== null && (
                                    <button
                                      onClick={() => { haptics.heavyClick(); setManualMonthlySurvivalCost(null); }}
                                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition-all text-[9px] font-black uppercase tracking-wider shadow-md hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
                                      title="Resetar para o custo real de transações"
                                    >
                                      <RotateCcw size={11} />
                                      <span>Voltar p/ Real (R$ {realMonthlySurvivalCost.toLocaleString('pt-BR')})</span>
                                    </button>
                                  )}
                                </div>
                                
                                <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider text-left font-sans mt-1 leading-normal">
                                  {manualMonthlySurvivalCost !== null 
                                    ? 'Custo de vida simulado para simulações de liberdade financeira e Proéxis' 
                                    : 'Gasto mensal recorrente calculado de forma automática com suas despesas reais dos últimos 30 dias'}
                                </span>
                              </div>

                              <div className="flex gap-1.5 flex-wrap mt-4">
                                {[1500, 3000, 5000, 8050, 12000, 18000].map((cost) => (
                                  <button
                                    key={cost}
                                    onClick={() => { haptics.heavyClick(); setMonthlySurvivalCost(cost); }}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black tracking-wider transition-all uppercase ${
                                      monthlySurvivalCost === cost
                                      ? 'bg-zinc-200 text-zinc-950 border-white font-black scale-[1.02] shadow-md'
                                      : 'bg-zinc-950 border border-zinc-800 hover:border-zinc-750 text-zinc-400 hover:text-white'
                                    }`}
                                  >
                                    R$ {cost.toLocaleString('pt-BR')}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <input
                                type="range"
                                min="1000"
                                max="25000"
                                step="500"
                                value={monthlySurvivalCost}
                                onChange={(e) => { haptics.lightClick(); setMonthlySurvivalCost(Number(e.target.value)); }}
                                className="w-full h-1 bg-zinc-950 cursor-pointer accent-emerald-500"
                              />
                            </div>

                            {/* Custo Real por Períodos */}
                            <div className="mt-2 pt-3 border-t border-zinc-850 space-y-2">
                              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Sua Vida por Período de Manutenção</span>
                              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                                <div className="bg-zinc-950/50 p-2 rounded-lg border border-zinc-850/50 flex justify-between items-center">
                                  <span className="text-zinc-500 font-semibold uppercase">1 Mês:</span>
                                  <span className="font-bold text-white tracking-tight">R$ {monthlySurvivalCost.toLocaleString('pt-BR')}</span>
                                </div>
                                <div className="bg-zinc-950/50 p-2 rounded-lg border border-zinc-850/50 flex justify-between items-center">
                                  <span className="text-zinc-500 font-semibold uppercase">3 Meses:</span>
                                  <span className="font-bold text-white tracking-tight">R$ {(monthlySurvivalCost * 3).toLocaleString('pt-BR')}</span>
                                </div>
                                <div className="bg-zinc-950/50 p-2 rounded-lg border border-zinc-850/50 flex justify-between items-center">
                                  <span className="text-zinc-500 font-semibold uppercase">6 Meses:</span>
                                  <span className="font-bold text-white tracking-tight">R$ {(monthlySurvivalCost * 6).toLocaleString('pt-BR')}</span>
                                </div>
                                <div className="bg-zinc-950/50 p-2 rounded-lg border border-zinc-850/50 flex justify-between items-center">
                                  <span className="text-emerald-400 font-semibold uppercase">1 Ano:</span>
                                  <span className="font-black text-emerald-400 tracking-tight">R$ {(monthlySurvivalCost * 12).toLocaleString('pt-BR')}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* PART 3: THE WILL TRANSMUTATION ENGINE (Embedded Game of the Will Simulator) */}
                        <div className="bg-zinc-900 border border-zinc-800 py-6 md:py-8 px-[7px] rounded-[32px] relative z-10 space-y-6 overflow-hidden sm:-mx-4 md:-mx-8 lg:mx-0 xl:mx-0">
                          {/* Elegant Fine Banknote Guilloché Relief Lines inside Jogo da Vontade */}
                          <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03] pointer-events-none select-none mix-blend-overlay overflow-hidden">
                            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                              <defs>
                                <pattern id="banknote-guilloche-2" width="100" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(-15)">
                                  <path d="M0 10 C 25 20, 75 0, 100 10" fill="none" stroke="#10b981" strokeWidth="0.5" />
                                  <path d="M0 5 C 25 15, 75 -5, 100 5" fill="none" stroke="#10b981" strokeWidth="0.3" />
                                  <path d="M0 15 C 25 25, 75 5, 100 15" fill="none" stroke="#10b981" strokeWidth="0.3" />
                                </pattern>
                              </defs>
                              <rect width="100%" height="100%" fill="url(#banknote-guilloche-2)" />
                            </svg>
                          </div>

                          <div className="flex items-center gap-3 relative z-10">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
                              </svg>
                            </div>
                            <div>
                              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block leading-none">O Alquimista Psíquico</span>
                              <h4 className="text-xl font-black uppercase text-white mt-0.5">Simulador do Jogo da Vontade</h4>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                            <div className="lg:col-span-12 xl:col-span-7 space-y-4">
                              <p className="text-[12.5px] font-medium text-zinc-300 leading-relaxed">
                                Descubra quanto tempo a mais você compra <span className="text-emerald-400 font-extrabold underline decoration-emerald-500">agora mesmo</span> ao dizer não para um gasto supérfluo:
                              </p>

                              <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-4 w-full">
                                <div className="flex items-baseline justify-between gap-4 w-full">
                                  <div className="flex items-baseline gap-1.5 text-left">
                                    <span className="text-xs font-black text-emerald-400 block pb-1">VALOR INJETADO:</span>
                                    <span className="text-2xl font-black text-white">R$ {simulationAmount}</span>
                                  </div>
                                  <input
                                    type="number"
                                    value={simulationAmount}
                                    onChange={(e) => { setSimulationAmount(e.target.value.replace(/\D/g, '')); }}
                                    className="w-24 px-2.5 py-1 text-xs font-black text-center rounded-lg border border-zinc-800 bg-zinc-900 text-emerald-300 focus:outline-none"
                                  />
                                </div>

                                <input
                                  type="range"
                                  min="20"
                                  max="5000"
                                  step="20"
                                  value={simulationAmount}
                                  onChange={(e) => { haptics.lightClick(); setSimulationAmount(e.target.value); }}
                                  className="w-full h-1.5 bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />

                                <div className="flex gap-1.5 flex-wrap">
                                  {['50', '150', '350', '800', '1800', '3000'].map((val) => (
                                    <button
                                      key={val}
                                      onClick={() => { haptics.mediumClick(); setSimulationAmount(val); }}
                                      className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${
                                        simulationAmount === val
                                        ? 'bg-emerald-500 border-emerald-500 text-white shadow'
                                        : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-850'
                                      }`}
                                    >
                                      R$ {val}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="lg:col-span-12 xl:col-span-5 bg-zinc-950 border-2 border-zinc-800 p-6 rounded-3xl text-center relative overflow-hidden shadow-inner w-full">
                              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Resultado de Transmutação Imediata</span>
                              <div className="text-3xl md:text-4xl font-black text-emerald-400 tracking-tight my-4">
                                {simDays > 0 ? (
                                  <>
                                    +{simDays} {simDays === 1 ? 'DIA' : 'DIAS'}
                                    {simHoursLeft > 0 ? ` e ${simHoursLeft} ${simHoursLeft === 1 ? 'HORA' : 'HORAS'}` : ''}
                                  </>
                                ) : (
                                  `+${simHoursLeft} ${simHoursLeft === 1 ? 'HORA' : 'HORAS'}`
                                )}
                              </div>
                              <p className="text-[10px] font-bold text-white bg-emerald-600 rounded-full inline-block px-4 py-1.5 uppercase tracking-wide shadow-md">
                                De pura paz e tempo livre comprado!
                              </p>
                              <div className="text-[9.5px] text-zinc-500 italic leading-snug mt-3 font-semibold mx-auto max-w-xs">
                                “Você acabou de trocar um prazer artificial efêmero de R$ {Number(simulationAmount).toLocaleString('pt-BR')} por {simDays > 0 ? `${simDays} ${simDays === 1 ? 'dia' : 'dias'} e` : ""} {simHoursLeft} {simHoursLeft === 1 ? 'hora' : 'horas'} de autonomia incontestável no seu amanhã.”
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </section>

                {/* FOUR ADAPTIVE VITAL METRIC CARDS - Fits beautifully with light/dark adaptive layout, and soft physical shadow outlines */}
                {(() => {
                  const activeBalance = stats.balance > 0 ? stats.balance : 18500;
                  const hourlyCost = Number((monthlySurvivalCost / 729.12).toFixed(2));
                  const seguroHourlyCost = hourlyCost > 0 ? hourlyCost : 6.17;
                  const seguroDailyCost = Number((seguroHourlyCost * 24).toFixed(2));
                  const hoursCreated = Math.floor(activeBalance / seguroHourlyCost);
                  const daysCreated = Math.floor(hoursCreated / 24);
                  return (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full mt-8" id="stats-dashboard-grid">
                      {/* CARD A - Tempo Comprado */}
                      <motion.div 
                        whileHover={{ y: -4, scale: 1.015 }}
                        className="bg-[#f0fbf5] dark:bg-[#0e2118]/45 border border-emerald-250/75 dark:border-emerald-900/50 p-4 sm:p-5 rounded-[22px] flex flex-col justify-between shadow-[0_6px_20px_rgba(16,185,129,0.03)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.3)] text-left hover:border-emerald-400 dark:hover:border-emerald-600 transition-all duration-300 relative overflow-hidden h-full"
                      >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9.5px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-md">Tempo Seguro</span>
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-450 flex items-center justify-center shrink-0">
                            <Clock size={14} className="text-emerald-600 dark:text-emerald-400" />
                          </div>
                        </div>
                        <div className="mt-4 sm:mt-5">
                          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight leading-none">
                            {daysCreated} <span className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-500">Dias</span>
                          </div>
                          <p className="text-[9.5px] sm:text-[10px] font-bold text-slate-500 dark:text-zinc-400 mt-1.5 uppercase tracking-tight leading-none">Livre de pressões financeiras</p>
                        </div>
                      </motion.div>

                      {/* CARD B - Valor da Hora */}
                      <motion.div 
                        whileHover={{ y: -4, scale: 1.015 }}
                        className="bg-[#f5f3ff] dark:bg-[#141224]/45 border border-indigo-250/75 dark:border-indigo-900/50 p-4 sm:p-5 rounded-[22px] flex flex-col justify-between shadow-[0_6px_20px_rgba(99,102,241,0.03)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.3)] text-left hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-300 relative overflow-hidden h-full"
                      >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl pointer-events-none"></div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9.5px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded-md">Valor da Hora</span>
                          <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-455 flex items-center justify-center shrink-0">
                            <svg className="h-4 w-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
                            </svg>
                          </div>
                        </div>
                        <div className="mt-4 sm:mt-5">
                          <div className="text-2xl sm:text-3xl font-black text-indigo-650 dark:text-indigo-450 tracking-tight leading-none">
                            R$ <span className="font-extrabold">{seguroHourlyCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <p className="text-[9.5px] sm:text-[10px] font-bold text-slate-500 dark:text-zinc-400 mt-1.5 uppercase tracking-tight leading-none">Seu custo vital por hora</p>
                        </div>
                      </motion.div>

                      {/* CARD C - Consumo Diário */}
                      <motion.div 
                        whileHover={{ y: -4, scale: 1.015 }}
                        className="bg-[#fff1f2] dark:bg-[#200f13]/45 border border-rose-250/75 dark:border-rose-900/50 p-4 sm:p-5 rounded-[22px] flex flex-col justify-between shadow-[0_6px_20px_rgba(244,63,94,0.03)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.3)] text-left hover:border-rose-455 dark:hover:border-rose-600 transition-all duration-300 relative overflow-hidden h-full"
                      >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-full blur-xl pointer-events-none"></div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9.5px] font-black text-rose-650 dark:text-rose-400 uppercase tracking-wider bg-rose-500/10 px-2 py-0.5 rounded-md">Consumo Diário</span>
                          <div className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-450 flex items-center justify-center shrink-0">
                            <svg className="h-4 w-4 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
                            </svg>
                          </div>
                        </div>
                        <div className="mt-4 sm:mt-5">
                          <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight leading-none">
                            R$ <span className="font-extrabold">{seguroDailyCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <p className="text-[9.5px] sm:text-[10px] font-bold text-slate-500 dark:text-zinc-400 mt-1.5 uppercase tracking-tight leading-none">Oxigênio por 24 horas</p>
                        </div>
                      </motion.div>

                      {/* CARD D - Custo Mensal */}
                      <motion.div 
                        whileHover={{ y: -4, scale: 1.015 }}
                        className="bg-slate-100/60 dark:bg-[#121217] border border-slate-205 dark:border-zinc-800 p-4 sm:p-5 rounded-[22px] flex flex-col justify-between shadow-[0_6px_20px_rgba(0,0,0,0.02)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.3)] text-left hover:border-slate-350 dark:hover:border-zinc-700 transition-all duration-300 relative overflow-hidden h-full"
                      >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-[#a855f7]/5 rounded-full blur-xl pointer-events-none"></div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9.5px] font-black text-slate-650 dark:text-zinc-450 uppercase tracking-wider bg-slate-200/50 dark:bg-zinc-800 px-2 py-0.5 rounded-md">Custo Mensal</span>
                          <div className="w-7 h-7 rounded-lg bg-slate-200/50 dark:bg-zinc-850 text-slate-600 dark:text-zinc-450 flex items-center justify-center shrink-0">
                            <svg className="h-4 w-4 text-slate-550 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                            </svg>
                          </div>
                        </div>
                        <div className="mt-4 sm:mt-5">
                          <div className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-zinc-200 tracking-tight leading-none">
                            R$ <span className="font-extrabold">{monthlySurvivalCost.toLocaleString('pt-BR')}</span>
                          </div>
                          <p className="text-[9.5px] sm:text-[10px] font-bold text-slate-500 dark:text-zinc-400 mt-1.5 uppercase tracking-tight leading-none">Manutenção Vital Mínima</p>
                        </div>
                      </motion.div>
                    </div>
                  );
                })()}

                {/* 🧠 INTELIGÊNCIA ALQUÍMICA DE TRANSMUTAÇÃO DE CAPITAL */}
                <section className="bg-slate-50 dark:bg-[#0a0a0f] border border-slate-200/80 dark:border-zinc-850 rounded-[32px] p-6 md:p-8 space-y-6 mt-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)] text-left relative overflow-hidden transition-all duration-300">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                  {/* Header Minimalista e Intelectual */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-rose-100/15 dark:border-zinc-850/50 pb-5 relative z-10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Brain size={16} className="text-indigo-500 dark:text-indigo-400 animate-pulse" />
                        <span className="text-[10px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase block">Fórmula de Equivalência Existencial</span>
                      </div>
                      <h3 className="text-xl font-bold font-sans text-slate-900 dark:text-white tracking-tight">Conversão Alquímica de Capital em Tempo de Vida</h3>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                      {/* Custo de vida base */}
                      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-3.5 py-1.5 rounded-xl text-[11px] font-bold text-slate-500 dark:text-zinc-400 tracking-tight shadow-sm">
                        Custo Base: <strong className="text-slate-800 dark:text-zinc-200">R$ {monthlySurvivalCost.toLocaleString('pt-BR')}/mês</strong> (~R$ {((monthlySurvivalCost || 3000)/720).toFixed(2)}/h)
                      </div>
                      
                      {/* Busca minimalista */}
                      <div className="relative">
                        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                        <input
                          type="text"
                          placeholder="Pesquisar registro..."
                          value={transmuterSearchQuery}
                          onChange={(e) => setTransmuterSearchQuery(e.target.value)}
                          className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl py-1.5 pl-9 pr-3 text-[11px] text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all w-full sm:w-44 font-semibold shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10 w-full">
                    
                    {/* LEFT WORKSTATION (4 columns): Simular Transmutação Customizada */}
                    <div className="lg:col-span-4 bg-white dark:bg-[#0c0c11] border border-slate-200/80 dark:border-zinc-850/70 p-6 rounded-[24px] space-y-4 shadow-[0_4px_16px_rgba(0,0,0,0.02)] dark:shadow-none text-left w-full">
                      <div className="flex items-center gap-2 pb-2.5 border-b border-rose-100/10 dark:border-zinc-850/55">
                        <Sparkles size={14} className="text-indigo-500 animate-pulse" />
                        <h4 className="text-xs font-black uppercase text-slate-800 dark:text-zinc-200 tracking-wider">Simular Nova Transmutação</h4>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-black text-slate-400 dark:text-zinc-550 uppercase tracking-widest block mb-1 text-left">Nome do Item / Gasto</label>
                          <input
                            type="text"
                            placeholder="Ex: Troca de celular fútil"
                            value={transmuterSimName}
                            onChange={(e) => setTransmuterSimName(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-850/80 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-450 dark:placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-left"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-black text-slate-400 dark:text-zinc-550 uppercase tracking-widest block mb-1 text-left">Valor Monetário (R$)</label>
                          <input
                            type="number"
                            placeholder="Ex: 5600"
                            value={transmuterSimValue}
                            onChange={(e) => setTransmuterSimValue(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-850/80 rounded-xl px-3.5 py-2 text-xs font-black text-slate-900 dark:text-white placeholder-slate-450 dark:placeholder-zinc-600 focus:outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-left"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            haptics.heavyClick();
                            const val = parseFloat(transmuterSimValue);
                            const name = transmuterSimName.trim();
                            if (!name || isNaN(val) || val <= 0) return;
                            const newItem = {
                              id: `sim-item-${Date.now()}`,
                              name,
                              value: val,
                              type: 'expense' as const,
                              categoryName: 'Gasto Simulado',
                              date: new Date().toISOString()
                            };
                            setTransmuterSimList([newItem, ...transmuterSimList]);
                            setTransmuterSimName('');
                            setTransmuterSimValue('');
                            setFutureBuyToast(true);
                            setTimeout(() => setFutureBuyToast(false), 3500);
                          }}
                          className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>⚡ Transmutar em Tempo</span>
                        </button>

                        {/* RESULTADO DA SIMULAÇÃO LOCALIZADO */}
                        {transmuterSimList.length > 0 && (
                          <div className="pt-4 border-t border-slate-100 dark:border-zinc-850/60 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Resultado da Simulação</span>
                              <button
                                type="button"
                                onClick={() => {
                                  haptics.lightClick();
                                  setTransmuterSimList([]);
                                }}
                                className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-wider cursor-pointer"
                              >
                                Limpar / Reset
                              </button>
                            </div>
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                              {transmuterSimList.map((item) => {
                                const hourly = (monthlySurvivalCost / 729.12) || 6.17;
                                const hoursConverted = item.value / hourly;
                                const timeStr = formatUnabbreviatedTime(hoursConverted);
                                return (
                                  <div key={item.id} className="p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/30 dark:border-indigo-950/30 flex justify-between items-center text-xs">
                                    <div className="min-w-0 flex-1 text-left">
                                      <p className="font-bold text-slate-900 dark:text-zinc-100 truncate text-left">{item.name}</p>
                                      <p className="text-[10px] font-semibold text-slate-400 dark:text-zinc-550 text-left">R$ {item.value.toLocaleString('pt-BR')}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                        + {timeStr}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* RIGHT WORKSTATION (8 columns): Existing Filtration and Scrollable Ledger */}
                    <div className="lg:col-span-8 space-y-4 w-full">
                      {/* Filtro Silencioso */}
                      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar justify-start">
                        <button
                          onClick={() => { haptics.lightClick(); setTransmuterFilterType('all'); }}
                          className={`px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap border cursor-pointer ${
                            transmuterFilterType === 'all'
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-950 border-slate-900 dark:border-white shadow-sm'
                              : 'bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:text-slate-800 dark:hover:text-white shadow-sm'
                          }`}
                        >
                          Todos os Itens
                        </button>
                        <button
                          onClick={() => { haptics.lightClick(); setTransmuterFilterType('expense'); }}
                          className={`px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap border cursor-pointer ${
                            transmuterFilterType === 'expense'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                              : 'bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:text-rose-500 shadow-sm'
                          }`}
                        >
                          Despesas & Desperdiçadores
                        </button>
                        <button
                          onClick={() => { haptics.lightClick(); setTransmuterFilterType('asset'); }}
                          className={`px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap border cursor-pointer ${
                            transmuterFilterType === 'asset'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:text-emerald-500 shadow-sm'
                          }`}
                        >
                          Bens e Ativos
                        </button>
                      </div>

                      {/* Lista com scroll dedicada e otimizada */}
                      <div className="relative">
                        {(() => {
                          const itemsList: Array<{
                            id: string;
                            name: string;
                            value: number;
                            categoryName: string;
                            type: 'expense' | 'asset';
                            image: string | null;
                          }> = [];

                          // 1. Gastos Reais
                          activeTransactions.forEach(t => {
                            const cat = categories.find(c => c.id === t.category_id);
                            if (cat && cat.type !== CategoryType.INCOME) {
                              itemsList.push({
                                id: t.id,
                                name: t.note || 'Despesa Corrente',
                                value: t.value,
                                categoryName: cat.name || 'Gasto Geral',
                                type: 'expense',
                                image: null
                              });
                            }
                          });

                          // 2. Ativos Reais do Mural de Sucesso
                          const mural = db.getMuralData();
                          const realAssets = mural.assets || [];
                          realAssets.forEach((a: any, idx: number) => {
                            itemsList.push({
                              id: a.id || `mural-asset-${idx}`,
                              name: a.name || a.category || 'Ativo Registrado',
                              value: Number(a.value) || 0,
                              categoryName: 'Ativos Patrimoniais',
                              type: 'asset',
                              image: a.image || (a.images && a.images[0]) || null
                            });
                          });

                          // 3. Casos de Simulação Acadêmica Inteligente (Ponto focal de reflexão consciente)
                          const presetReflections = [
                            { id: 'pres-1', name: 'Trocar para smartphone topo de linha sem necessidade', value: 7800, categoryName: 'Supérfluos & Status', type: 'expense' as const, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=300' },
                            { id: 'pres-2', name: 'Pizza, jantares & delivery recorrentes por mero impulso', value: 380, categoryName: 'Alimentação Fútil', type: 'expense' as const, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300' },
                            { id: 'pres-3', name: 'Assinaturas de serviços e softwares esquecidos e sem uso', value: 140, categoryName: 'Serviços Ociosos', type: 'expense' as const, image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=300' },
                            { id: 'pres-4', name: 'CDI / Títulos Públicos de Liquidez e Renda Segura', value: 15000, categoryName: 'Blindagem de Vida', type: 'asset' as const, image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=300' }
                          ];

                          presetReflections.forEach(preset => {
                            if (!itemsList.some(it => it.name === preset.name)) {
                              itemsList.push(preset);
                            }
                          });



                          // Filtrar por busca e tipo
                          const finalItems = itemsList.filter(item => {
                            const matchesSearch = item.name.toLowerCase().includes(transmuterSearchQuery.toLowerCase()) ||
                                                  item.categoryName.toLowerCase().includes(transmuterSearchQuery.toLowerCase());
                            const matchesType = transmuterFilterType === 'all' || item.type === transmuterFilterType;
                            return matchesSearch && matchesType;
                          });

                          // Ordenar por valor decrescente
                          finalItems.sort((a, b) => b.value - a.value);

                          const formatUnabbreviatedTime = (totalHours: number) => {
                            const years = Math.floor(totalHours / (24 * 365));
                            const remainingHoursAfterYears = totalHours % (24 * 365);
                            const months = Math.floor(remainingHoursAfterYears / (24 * 30));
                            const remainingHoursAfterMonths = remainingHoursAfterYears % (24 * 30);
                            const days = Math.floor(remainingHoursAfterMonths / 24);
                            const hours = Math.floor(remainingHoursAfterMonths % 24);
                            const mins = Math.floor((totalHours * 60) % 60);

                            const parts: string[] = [];
                            if (years > 0) {
                              parts.push(`${years} ${years === 1 ? 'ano' : 'anos'}`);
                            }
                            if (months > 0) {
                              parts.push(`${months} ${months === 1 ? 'mês' : 'meses'}`);
                            }
                            if (days > 0) {
                              parts.push(`${days} ${days === 1 ? 'dia' : 'dias'}`);
                            }
                            if (years === 0 && months === 0 && days === 0) {
                              if (hours > 0) {
                                  parts.push(`${hours} ${hours === 1 ? 'hora' : 'horas'}`);
                                }
                                if (mins > 0 || hours === 0) {
                                  parts.push(`${mins} ${mins === 1 ? 'minuto' : 'minutos'}`);
                                }
                              } else if (hours > 0 && years === 0) {
                                parts.push(`${hours} ${hours === 1 ? 'hora' : 'horas'}`);
                              }

                              if (parts.length === 0) return "0 minutos";
                              if (parts.length === 1) return parts[0];
                              if (parts.length === 2) return `${parts[0]} e ${parts[1]}`;
                              return `${parts.slice(0, -1).join(', ')} e ${parts[parts.length - 1]}`;
                            };

                            const getPersuasiveComment = (name: string, value: number, type: 'expense' | 'asset', hoursConverted: number) => {
                              const equivalence = formatUnabbreviatedTime(hoursConverted);
                              if (type === 'expense') {
                                if (value >= 5000) {
                                  return `Evitar esta saída de capital resgata incríveis ${equivalence} de total autonomia existencial de volta para a sua vida, livrando você de submissões desnecessárias.`;
                                } else if (value >= 1000) {
                                  return `Este dispêndio consumiria ${equivalence} de sua plena liberdade física no planeta. Poupar esta quantia blinda seu bem-estar contra imprevistos.`;
                                } else if (value >= 300) {
                                  return `Se você recusar esse gasto desnecessário, você ganharia ${equivalence} livres de qualquer encargo ou obrigação física para se dedicar aos seus propósitos.`;
                                } else {
                                  return `Esse capricho suga ${equivalence} de tempo livre e paz de espírito pura. Cada pequena renúncia consciente consolida sua serenidade espiritual.`;
                                }
                              } else {
                                if (value >= 10000) {
                                  return `Excelente blindagem de capital. Este investimento sólido apoia a sua independência existencial por exatos ${equivalence} de total autonomia no Cosmos.`;
                                } else {
                                  return `Base estruturada de soberania material. Este ativo garante a você ${equivalence} de respiração, conforto e sossego inabaláveis no plano físico.`;
                                }
                              }
                            };

                            if (finalItems.length === 0) {
                              return (
                                <div className="text-center py-12 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl text-slate-400 dark:text-zinc-500 w-full">
                                  <p className="text-xs font-semibold">Nenhum gasto ou ativo encontrado.</p>
                                </div>
                              );
                            }

                            return (
                              <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-zinc-800 scrollbar-track-transparent text-left w-full">
                                {finalItems.map(item => {
                                  const hourly = (monthlySurvivalCost / 720) || 6.17;
                                  const totalHoursConverted = item.value / hourly;
                                  const timeStr = formatUnabbreviatedTime(totalHoursConverted);

                                  const formulaStr = `R$ ${item.value.toLocaleString('pt-BR')} ÷ R$ ${hourly.toFixed(2)}/hora = ${totalHoursConverted.toFixed(1)} horas`;
                                  const comment = getPersuasiveComment(item.name, item.value, item.type, totalHoursConverted);

                                  // Helper function to render fallback category icon if no real image exists
                                  const renderCategoryIcon = () => {
                                    const normCat = (item.categoryName || '').toLowerCase();
                                    const normName = (item.name || '').toLowerCase();
                                    
                                    if (normCat.includes('alimentação') || normCat.includes('pizza') || normName.includes('pizza') || normName.includes('restaurante') || normName.includes('comida') || normName.includes('delivery') || normName.includes('almoço') || normName.includes('jantar')) {
                                      return <Pizza size={20} className="text-rose-500 dark:text-rose-400" />;
                                    }
                                    if (normCat.includes('smartphone') || normName.includes('celular') || normName.includes('telefone') || normName.includes('smartphone')) {
                                      return <Smartphone size={20} className="text-indigo-500 dark:text-indigo-400" />;
                                    }
                                    if (normCat.includes('assinatura') || normCat.includes('ociosos') || normName.includes('netflix') || normName.includes('spotify') || normName.includes('software') || normName.includes('sistemas') || normName.includes('assinatura')) {
                                      return <Tv size={20} className="text-rose-500 dark:text-rose-400" />;
                                    }
                                    if (normCat.includes('reserva') || normCat.includes('blindagem') || normCat.includes('tesouro') || normCat.includes('invest') || normName.includes('cdi') || normName.includes('título') || normName.includes('fundo') || normName.includes('selic')) {
                                      return <Shield size={20} className="text-emerald-500 dark:text-emerald-400" />;
                                    }
                                    
                                    return item.type === 'expense'
                                      ? <TrendingDown size={20} className="text-rose-500 dark:text-rose-400" />
                                      : <TrendingUp size={20} className="text-emerald-500 dark:text-emerald-400" />;
                                  };

                                  return (
                                    <div
                                      key={item.id}
                                      className="p-4 sm:p-5 rounded-[22px] bg-white dark:bg-[#121217] border border-slate-200/60 dark:border-zinc-850/70 flex flex-col gap-4 hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 hover:border-slate-300 dark:hover:border-zinc-800 shadow-[0_4px_16px_rgba(0,0,0,0.025)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.055)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all duration-300 relative overflow-hidden text-left w-full"
                                    >
                                      {/* 1. TOP ROW: Image/Icon + Title & Price */}
                                      <div className="flex items-center gap-3.5 min-w-0 w-full justify-between">
                                        <div className="flex items-center gap-3.5 min-w-0">
                                          <div className="relative shrink-0">
                                            {item.image ? (
                                              <img 
                                                src={item.image} 
                                                alt={item.name} 
                                                referrerPolicy="no-referrer"
                                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-[14px] object-cover border border-slate-200/80 dark:border-zinc-800 shadow-sm"
                                              />
                                            ) : (
                                              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-[14px] flex items-center justify-center border shadow-sm ${
                                                item.type === 'expense'
                                                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-600'
                                                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                                              }`}>
                                                {renderCategoryIcon()}
                                              </div>
                                            )}
                                            <div className={`absolute -bottom-1 -right-1 w-5.5 h-5.5 rounded-lg flex items-center justify-center border text-[9px] font-black shadow-sm ${
                                              item.type === 'expense'
                                                ? 'bg-rose-500/15 border-rose-500/20 text-rose-600 dark:text-rose-455'
                                                : 'bg-emerald-500/15 border-emerald-500/20 text-emerald-600 dark:text-emerald-455'
                                            }`}>
                                              {item.type === 'expense' ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
                                            </div>
                                          </div>

                                          <div className="min-w-0 flex-1">
                                            <span className="text-sm font-black text-slate-900 dark:text-zinc-100 uppercase tracking-tight leading-tight select-all block">
                                              {item.name}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest block mt-0.5">
                                              {item.categoryName}
                                            </span>
                                          </div>
                                        </div>

                                        <span className="px-2.5 py-1 rounded-[10px] text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-750 dark:text-zinc-300 border border-slate-200/55 dark:border-zinc-800 whitespace-nowrap shrink-0">
                                          R$ {item.value.toLocaleString('pt-BR')}
                                        </span>
                                      </div>

                                      {/* 2. MIDDLE SECTION: Full-width Comment */}
                                      <div className="text-left w-full pl-0">
                                        <p className="text-[12px] font-semibold text-slate-600 dark:text-zinc-400 leading-relaxed italic bg-slate-50/50 dark:bg-[#0c0c10]/50 border border-slate-100/50 dark:border-zinc-850/40 p-3 rounded-[14px] w-full text-left">
                                          “{comment}”
                                        </p>
                                      </div>

                                      {/* 3. BOTTOM SECTION: Full-width Time & Formula */}
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-100/80 dark:border-zinc-850/75 w-full">
                                        <div className="text-[12px] font-black uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                                          <Clock size={12} className="animate-pulse text-indigo-600 dark:text-indigo-400 shrink-0" />
                                          <span>
                                            {item.type === 'expense' 
                                              ? `Você ganharia ${timeStr} de vida a mais para sua vida` 
                                              : `Você garantiu ${timeStr} de vida a mais para sua vida`}
                                          </span>
                                        </div>
                                        <span className="text-[9.5px] font-mono font-bold text-slate-450 dark:text-zinc-500 uppercase tracking-wider shrink-0 sm:text-right">
                                          {formulaStr}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                    </div>
                </section>
                
                {/* Global Footer */}
                <footer className="text-center py-6">
                  <div className="border-t border-slate-100 dark:border-zinc-850 pt-8 w-full opacity-0 pointer-events-none" />
                </footer>
              </div>

              {/* OBSOLETE SEPARATE DESKTOP LAYOUT (Agora unificado de forma responsiva no WORKSPACE FLOW acima para paridade total de containers e recursos tanto no mobile quanto no desktop) */}
              <div className="hidden">
                
                {/* 1. Desktop Executive Header Panel */}
                <header className="flex items-center justify-between gap-6 pb-6 border-b border-slate-200/50 dark:border-zinc-850/80">
                  <div className="space-y-1.5 text-left">
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">
                      CONSCIÊNCIOMETRIA DE FLUXO & SOBERANIA FINANCEIRA
                    </span>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                      Sustento da Proéxis <span className="text-indigo-600 dark:text-indigo-400">— Workspace de Autonomia</span>
                    </h1>
                  </div>

                  {(() => {
                    const activeBalance = stats.balance > 0 ? stats.balance : 18500;
                    const hourlyCost = Number((monthlySurvivalCost / 729.12).toFixed(2));
                    const seguroHourlyCost = hourlyCost > 0 ? hourlyCost : 6.17;
                    const hoursCreated = Math.floor(activeBalance / seguroHourlyCost);
                    const daysCreated = Math.floor(hoursCreated / 24);

                    let badgeText = "🏆 Iniciante Proexológico";
                    let badgeColor = "bg-pink-500/10 border-pink-500/20 text-pink-500";
                    
                    if (daysCreated > 10 && daysCreated <= 120) {
                      badgeText = "🌟 Praticante Proexológico";
                      badgeColor = "bg-amber-500/10 border-amber-500/20 text-amber-500";
                    } else if (daysCreated > 120) {
                      badgeText = "⚡ Autônomo Proexológico";
                      badgeColor = "bg-emerald-500/10 border-emerald-500/20 text-emerald-500";
                    }

                    return (
                      <span className={`px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider ${badgeColor}`}>
                        {badgeText}
                      </span>
                    );
                  })()}
                </header>

                {/* 2. Top Executive KPI Cards (Row of 4 elegant cards) */}
                {(() => {
                  const activeBalance = stats.balance > 0 ? stats.balance : 18500;
                  const hourlyCost = Number((monthlySurvivalCost / 729.12).toFixed(2));
                  const seguroHourlyCost = hourlyCost > 0 ? hourlyCost : 6.17;
                  const hoursCreated = Math.floor(activeBalance / seguroHourlyCost);
                  const daysCreated = Math.floor(hoursCreated / 24);
                  const dailyOperationalCost = hourlyCost * 24;

                  return (
                    <div className="grid grid-cols-4 gap-6 w-full">
                      {/* CARD 1: Autonomia Existencial */}
                      <div className="bg-white dark:bg-[#0c0c11] border border-slate-200/80 dark:border-zinc-850/80 rounded-[22px] p-5 flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                          <Clock size={22} className="animate-pulse" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-black text-slate-400 dark:text-zinc-550 uppercase tracking-widest block">DIAS DE AUTONOMIA</span>
                          <span className="text-2xl font-black text-slate-900 dark:text-white block mt-0.5 leading-none">
                            {daysCreated} {daysCreated === 1 ? 'Dia' : 'Dias'}
                          </span>
                        </div>
                      </div>

                      {/* CARD 2: Valor Hora */}
                      <div className="bg-white dark:bg-[#0c0c11] border border-slate-200/80 dark:border-zinc-850/80 rounded-[22px] p-5 flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                          <TrendingDown size={22} />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-black text-slate-400 dark:text-zinc-550 uppercase tracking-widest block">SUSTENTO POR HORA</span>
                          <span className="text-2xl font-black text-slate-900 dark:text-white block mt-0.5 leading-none">
                            R$ {seguroHourlyCost.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* CARD 3: Custo Diário */}
                      <div className="bg-white dark:bg-[#0c0c11] border border-slate-200/80 dark:border-zinc-850/80 rounded-[22px] p-5 flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-[#3b82f6]/10 text-blue-500 flex items-center justify-center shrink-0">
                          <Sparkles size={22} />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-black text-slate-400 dark:text-zinc-550 uppercase tracking-widest block">CUSTO DIÁRIO</span>
                          <span className="text-2xl font-black text-slate-900 dark:text-white block mt-0.5 leading-none">
                            R$ {dailyOperationalCost.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* CARD 4: Patrimônio Convertido */}
                      <div className="bg-white dark:bg-[#0c0c11] border border-slate-200/80 dark:border-zinc-850/80 rounded-[22px] p-5 flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                          <Shield size={22} />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-black text-slate-400 dark:text-zinc-550 uppercase tracking-widest block">SALDO ADQUIRIDO</span>
                          <span className="text-2xl font-black text-slate-900 dark:text-white block mt-0.5 leading-none">
                            R$ {activeBalance.toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 3. Symmetric Dual Workstation Workspace */}
                <div className="grid grid-cols-12 gap-8 items-start w-full">
                  
                  {/* LEFT SIDE WORKSPACE: FÓRMULA DE SOBREVIVÊNCIA FINANCEIRA (8 columns) */}
                  <div className="col-span-8 bg-[#0a0a0f]/40 dark:bg-[#0a0a0f]/80 border border-slate-200 dark:border-zinc-850 p-8 rounded-[32px] space-y-8 text-left w-full">
                    <div className="border-b border-slate-100 dark:border-zinc-850/60 pb-5 flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-black uppercase text-slate-800 dark:text-zinc-200 tracking-wider">
                          Fórmula de Sobrevivência e Autonomia
                        </h3>
                        <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                          Calibração de variáveis proexológicas & cálculo do tempo existencial puro
                        </p>
                      </div>
                    </div>

                    {/* Guilloché Widescreen Banknote */}
                    {(() => {
                      const activeBalance = stats.balance > 0 ? stats.balance : 18500;
                      const hourlyCost = Number((monthlySurvivalCost / 729.12).toFixed(2));
                      const seguroHourlyCost = hourlyCost > 0 ? hourlyCost : 6.17;
                      const hoursCreated = Math.floor(activeBalance / seguroHourlyCost);
                      const daysCreated = Math.floor(hoursCreated / 24);

                      // Accurate breakdown
                      const computedYears = Math.floor(daysCreated / 365);
                      const computedRemainingDaysAfterYears = daysCreated % 365;
                      const computedMonths = Math.floor(computedRemainingDaysAfterYears / 30);
                      const computedRemainingDays = computedRemainingDaysAfterYears % 30;

                      let equivalencePhrase = "";
                      if (daysCreated === 0) {
                        equivalencePhrase = "Nenhum dia de autonomia";
                      } else {
                        const parts = [];
                        if (computedYears > 0) parts.push(`${computedYears} ${computedYears === 1 ? 'ano' : 'anos'}`);
                        if (computedMonths > 0) parts.push(`${computedMonths} ${computedMonths === 1 ? 'mês' : 'meses'}`);
                        if (computedRemainingDays > 0 || parts.length === 0) parts.push(`${computedRemainingDays} ${computedRemainingDays === 1 ? 'dia' : 'dias'}`);
                        equivalencePhrase = `Equivale a exatamente ${parts.join(', ').replace(/, ([^,]*)$/, ' e $1')}`;
                      }

                      return (
                        <div className="relative rounded-[28px] overflow-hidden bg-gradient-to-b from-[#121217] to-[#07070a] border border-zinc-800/80 text-white p-8 md:p-10 flex flex-col justify-center shadow-xl w-full">
                          <div className="absolute inset-0 bg-noise-pattern opacity-[0.02] pointer-events-none"></div>
                          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

                          {/* Banknote Watermark Ring Engraving */}
                          <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-[0.06] pointer-events-none select-none">
                            <svg className="w-56 h-56 text-white" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                              <circle cx="50" cy="50" r="45" strokeWidth="0.5" strokeDasharray="1 1" />
                              <circle cx="50" cy="50" r="38" strokeWidth="0.3" />
                              <circle cx="50" cy="50" r="30" strokeWidth="0.7" strokeDasharray="3 1" />
                            </svg>
                          </div>

                          <div className="relative z-10 flex flex-col gap-6 w-full text-left">
                            <div className="flex items-start justify-between min-w-0 w-full">
                              <div className="space-y-1">
                                <span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase">BANCO DA CONSCIÊNCIA AUTÔNOMA</span>
                                <h3 className="text-xl font-bold tracking-tight text-zinc-100 uppercase sm:text-2xl">AUTONOMIA EXISTENCIAL PURA</h3>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">CÓDIGO DE EMISSÃO</span>
                                <span className="text-xs font-bold text-zinc-300 font-mono">#PRX-{daysCreated}-AUT</span>
                              </div>
                            </div>

                            <div className="w-full h-px bg-zinc-800/60 my-1"></div>

                            <div className="flex flex-col md:flex-row items-baseline gap-2 md:gap-5 min-w-0 w-full justify-between">
                              <div className="flex items-baseline gap-1 md:gap-3">
                                <span className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none select-none">
                                  {daysCreated}
                                </span>
                                <div className="text-left">
                                  <span className="text-xl md:text-2xl font-black text-zinc-100 uppercase block leading-none">{daysCreated === 1 ? 'DIA' : 'DIAS'}</span>
                                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest block mt-1 leading-none">DE RESPIRO INTEGRAL</span>
                                </div>
                              </div>

                              <div className="mt-4 md:mt-0 font-mono text-[10.5px] font-bold text-zinc-400 uppercase tracking-wide border border-zinc-800 bg-black/40 px-3.5 py-2.5 rounded-xl shrink-0">
                                R$ {activeBalance.toLocaleString('pt-BR')} ÷ R$ {seguroHourlyCost}/hora
                              </div>
                            </div>

                            <p className="text-[12px] font-bold text-zinc-350 tracking-wide bg-white/5 border border-white/10 px-4 py-3 rounded-xl block leading-snug w-full">
                              💡 {equivalencePhrase}
                            </p>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Calibration Control Sliders side-by-side inside structured control widgets */}
                    <div className="grid grid-cols-2 gap-6 w-full">
                      {/* SLIDER A: Custo de Sobrevivência Proexológica */}
                      <div className="bg-white dark:bg-[#0c0c11] border border-slate-205/60 dark:border-zinc-850/85 p-6 rounded-[24px] space-y-4 shadow-sm w-full">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-850 pb-2.5">
                          <div className="min-w-0">
                            <span className="text-[10px] font-black text-slate-400 dark:text-zinc-550 uppercase tracking-widest block">VARIÁVEL A</span>
                            <h4 className="text-xs font-black uppercase text-slate-800 dark:text-zinc-200 tracking-wider font-sans">Custo de Sobrevivência</h4>
                          </div>
                          <span className="px-2 py-1 text-[11px] font-mono font-black bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
                            R$ {monthlySurvivalCost}/mês
                          </span>
                        </div>

                        <div className="space-y-2">
                          <input
                            type="range"
                            min="2000"
                            max="30000"
                            step="250"
                            value={monthlySurvivalCost}
                            onChange={(e) => { haptics.lightClick(); setMonthlySurvivalCost(Number(e.target.value)); }}
                            className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                          <div className="flex justify-between text-[9px] font-bold text-indigo-500 uppercase tracking-wider">
                            <span>R$ 2.000</span>
                            <span>Mínimo Essencial</span>
                            <span>R$ 30.000</span>
                          </div>
                        </div>
                      </div>

                      {/* SLIDER B: Meta Conscienciométrica de Anos (Sustento Planejado) */}
                      <div className="bg-white dark:bg-[#0c0c11] border border-slate-205/60 dark:border-zinc-850/85 p-6 rounded-[24px] space-y-4 shadow-sm w-full">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-850 pb-2.5">
                          <div className="min-w-0">
                            <span className="text-[10px] font-black text-slate-400 dark:text-zinc-550 uppercase tracking-widest block">VARIÁVEL B</span>
                            <h4 className="text-xs font-black uppercase text-slate-800 dark:text-zinc-200 tracking-wider">Meta de Autonomia</h4>
                          </div>
                          <span className="px-2 py-1 text-[11px] font-mono font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
                            {simLifeYears} Anos
                          </span>
                        </div>

                        <div className="space-y-2">
                          <input
                            type="range"
                            min="1"
                            max="30"
                            step="1"
                            value={simLifeYears}
                            onChange={(e) => { haptics.lightClick(); setSimLifeYears(Number(e.target.value)); }}
                            className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          />
                          <div className="flex justify-between text-[9px] font-bold text-emerald-500 uppercase tracking-wider">
                            <span>1 Ano</span>
                            <span>Soberania de Longo Prazo</span>
                            <span>30 Anos</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Meta Simulator Card ("Para você possuir exatamente X anos de autonomia") */}
                    {(() => {
                      const customRequiredCapital = simLifeYears * 12 * monthlySurvivalCost;
                      const netBalance = stats.balance > 0 ? stats.balance : 18500;
                      const missingCapital = customRequiredCapital - netBalance;
                      const percentageProgress = Math.min(100, Math.floor((netBalance / customRequiredCapital) * 100));

                      return (
                        <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-black w-full p-8 rounded-[28px] border-2 border-zinc-400/90 shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-left relative overflow-hidden group hover:border-zinc-300 transition-all">
                          <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
                            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="50%" cy="50%" r="50" fill="none" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="3 3" />
                              <line x1="10%" y1="10%" x2="90%" y2="90%" stroke="#ffffff" strokeWidth="0.3" />
                              <line x1="90%" y1="10%" x2="10%" y2="90%" stroke="#ffffff" strokeWidth="0.3" />
                            </svg>
                          </div>

                          <div className="relative z-10 space-y-6 w-full text-left">
                            <div className="text-left">
                              <span className="text-xs font-black text-zinc-400 uppercase tracking-widest block">
                                Para você possuir exatamente
                              </span>
                              <div className="inline-flex items-center gap-5 mt-2.5 select-none text-left">
                                <span className="text-8xl font-black text-white tracking-tighter leading-none">
                                  {simLifeYears}
                                </span>
                                <div className="flex flex-col justify-center border-l-2 border-emerald-500/30 pl-4 text-left">
                                  <span className="text-lg font-black text-white uppercase tracking-tight leading-none">{simLifeYears === 1 ? 'ANO CORRIDO' : 'ANOS CORRIDOS'}</span>
                                  <span className="text-[10px] font-black text-emerald-400 tracking-wider uppercase block mt-1.5 text-left">DE TOTAL AUTONOMIA NO PLANETA</span>
                                </div>
                              </div>
                            </div>

                            <div className="w-full h-px bg-zinc-700/50"></div>

                            {/* Live calculations */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                              <div className="space-y-1 text-left">
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block text-left">Capital Necessário</span>
                                <span className="text-base font-black text-emerald-400 font-mono text-left block">
                                  R$ {customRequiredCapital.toLocaleString('pt-BR')}
                                </span>
                                <p className="text-[10px] text-zinc-400 leading-normal text-left">
                                  Calculado como {simLifeYears} anos × 12 meses × R$ {monthlySurvivalCost}.
                                </p>
                              </div>

                              <div className="space-y-1 border-t md:border-t-0 md:border-l border-zinc-800 pt-3 md:pt-0 md:pl-5 text-left">
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block text-left">Status do Progresso</span>
                                <span className="text-base font-black text-zinc-100 font-mono text-left block">
                                  {percentageProgress}% Concluído
                                </span>
                                <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
                                  <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${percentageProgress}%` }} />
                                </div>
                              </div>

                              <div className="space-y-1 border-t md:border-t-0 md:border-l border-zinc-800 pt-3 md:pt-0 md:pl-5 text-left">
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block text-left">Falta para Alcançar</span>
                                <span className="text-base font-black text-rose-400 font-mono text-left block">
                                  {missingCapital <= 0 ? 'Meta Superada!' : `R$ ${missingCapital.toLocaleString('pt-BR')}`}
                                </span>
                                <p className="text-[10px] text-zinc-450 leading-normal text-left">
                                  {missingCapital <= 0 
                                    ? 'Seu patrimônio consciente já ultrapassa o valor estipulado para a meta.' 
                                    : `Poupar esta quantia concede a você ${simLifeYears} ${simLifeYears === 1 ? 'ano' : 'anos'} extras de respiração.`}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* RIGHT SIDE WORKSPACE: ALAlchemy Transmuter (4 columns) */}
                  <div className="col-span-4 bg-[#0a0a0f]/40 dark:bg-[#0a0a0f]/80 border border-slate-200 dark:border-zinc-850 p-6 rounded-[28px] space-y-6 shadow-sm text-left w-full sticky top-4 max-h-[780px] overflow-y-auto">
                    <div className="border-b border-slate-100 dark:border-zinc-850/60 pb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-indigo-500 shrink-0 animate-pulse" />
                        <h3 className="text-sm font-black uppercase text-slate-800 dark:text-zinc-200 tracking-wider">
                          Alquimia do Tempo
                        </h3>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-1">
                        Conversão direta de moeda em fração de tempo livre puro
                      </p>
                    </div>

                    {/* Quick Sim Form */}
                    <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-slate-150 dark:border-zinc-850/40 space-y-4">
                      <span className="text-[9px] font-black text-indigo-650 dark:text-indigo-400 tracking-widest block uppercase text-left">⚡ Simular Nova Transmutação</span>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-[9px] font-black text-slate-400 dark:text-zinc-550 uppercase tracking-wider block mb-1 text-left">Nome do Item</label>
                          <input
                            type="text"
                            placeholder="Ex: Assinatura obsoleta"
                            value={transmuterSimName}
                            onChange={(e) => setTransmuterSimName(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-black text-slate-400 dark:text-zinc-550 uppercase tracking-wider block mb-1 text-left">Valor Monetário (R$)</label>
                          <input
                            type="number"
                            placeholder="Ex: 150"
                            value={transmuterSimValue}
                            onChange={(e) => setTransmuterSimValue(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            haptics.heavyClick();
                            const val = parseFloat(transmuterSimValue);
                            const name = transmuterSimName.trim();
                            if (!name || isNaN(val) || val <= 0) return;
                            const newItem = {
                              id: `sim-item-${Date.now()}`,
                              name,
                              value: val,
                              type: 'expense' as const,
                              categoryName: 'Gasto Simulado',
                              date: new Date().toISOString()
                            };
                            setTransmuterSimList([newItem, ...transmuterSimList]);
                            setTransmuterSimName('');
                            setTransmuterSimValue('');
                            setFutureBuyToast(true);
                            setTimeout(() => setFutureBuyToast(false), 3500);
                          }}
                          className="w-full bg-indigo-650 hover:bg-indigo-600 active:scale-[0.98] text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-1"
                        >
                          ⚡ Transmutar em Tempo
                        </button>
                      </div>
                    </div>

                    {/* Integrated Transmuter Search Ledger list */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-400 dark:text-zinc-550 uppercase tracking-widest block text-left">LIVRO DE ATIVOS E RENOVAÇÕES</span>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => setTransmuterFilterType('all')}
                            className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-wider cursor-pointer border transition-all ${
                              transmuterFilterType === 'all'
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-950 border-slate-900 dark:border-white shadow-sm'
                                : 'bg-white dark:bg-zinc-900/30 text-slate-500 border-slate-200 dark:border-zinc-800 hover:text-slate-850'
                            }`}
                          >
                            Tudo
                          </button>
                          <button
                            onClick={() => setTransmuterFilterType('expense')}
                            className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-wider cursor-pointer border transition-all ${
                              transmuterFilterType === 'expense'
                                ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                                : 'bg-white dark:bg-zinc-900/30 text-slate-500 border-slate-200 dark:border-zinc-800 hover:text-rose-650'
                            }`}
                          >
                            Custos
                          </button>
                          <button
                            onClick={() => setTransmuterFilterType('asset')}
                            className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-wider cursor-pointer border transition-all ${
                              transmuterFilterType === 'asset'
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                : 'bg-white dark:bg-zinc-900/30 text-slate-500 border-slate-200 dark:border-zinc-800 hover:text-emerald-650'
                            }`}
                          >
                            Ativos
                          </button>
                        </div>
                      </div>

                      {(() => {
                        const itemsList: Array<{
                          id: string;
                          name: string;
                          value: number;
                          categoryName: string;
                          type: 'expense' | 'asset';
                          image: string | null;
                        }> = [];

                        // 1. Gastos Reais
                        activeTransactions.forEach(t => {
                          const cat = categories.find(c => c.id === t.category_id);
                          if (cat && cat.type !== CategoryType.INCOME) {
                            itemsList.push({
                              id: t.id,
                              name: t.note || 'Despesa Corrente',
                              value: t.value,
                              categoryName: cat.name || 'Gasto Geral',
                              type: 'expense',
                              image: null
                            });
                          }
                        });

                        // 2. Ativos Reais
                        const mural = db.getMuralData();
                        const realAssets = mural.assets || [];
                        realAssets.forEach((a: any, idx: number) => {
                          itemsList.push({
                            id: a.id || `mural-asset-${idx}`,
                            name: a.name || a.category || 'Ativo Registrado',
                            value: Number(a.value) || 0,
                            categoryName: 'Ativos Patrimoniais',
                            type: 'asset',
                            image: a.image || null
                          });
                        });

                        // 3. Preset Simulators
                        const presetReflections = [
                          { id: 'pres-1', name: 'Trocar para smartphone desnecessário', value: 7800, categoryName: 'Supérfluos', type: 'expense' as const, image: null },
                          { id: 'pres-2', name: 'Delivery diário recorrente por mero impulso', value: 380, categoryName: 'Alimentação Fútil', type: 'expense' as const, image: null },
                          { id: 'pres-3', name: 'Assinaturas de serviços esquecidos e ociosos', value: 140, categoryName: 'Serviços Ociosos', type: 'expense' as const, image: null },
                          { id: 'pres-4', name: 'CDI / Renda Fixa de Liquidez Imediata', value: 15000, categoryName: 'Reserva Segura', type: 'asset' as const, image: null }
                        ];

                        presetReflections.forEach(preset => {
                          if (!itemsList.some(it => it.name === preset.name)) {
                            itemsList.push(preset);
                          }
                        });

                        // 4. Custom simulated records
                        transmuterSimList.forEach(item => {
                          if (!itemsList.some(it => it.id === item.id)) {
                            itemsList.push({
                              id: item.id,
                              name: item.name,
                              value: item.value,
                              categoryName: item.categoryName,
                              type: item.type,
                              image: null
                            });
                          }
                        });

                        const finalItems = itemsList.filter(item => {
                          const matchesSearch = item.name.toLowerCase().includes(transmuterSearchQuery.toLowerCase()) ||
                                                item.categoryName.toLowerCase().includes(transmuterSearchQuery.toLowerCase());
                          const matchesType = transmuterFilterType === 'all' || item.type === transmuterFilterType;
                          return matchesSearch && matchesType;
                        });

                        // Ordenar por valor decrescente
                        finalItems.sort((a, b) => b.value - a.value);

                        const formatUnabbreviatedTime = (totalHours: number) => {
                          const years = Math.floor(totalHours / (24 * 365));
                          const remainingHoursAfterYears = totalHours % (24 * 365);
                          const months = Math.floor(remainingHoursAfterYears / (24 * 30));
                          const remainingHoursAfterMonths = remainingHoursAfterYears % (24 * 30);
                          const days = Math.floor(remainingHoursAfterMonths / 24);
                          const hours = Math.floor(remainingHoursAfterMonths % 24);

                          const parts: string[] = [];
                          if (years > 0) parts.push(`${years} a`);
                          if (months > 0) parts.push(`${months} m`);
                          if (days > 0) parts.push(`${days} d`);
                          if (parts.length === 0) return `${Math.floor(hours)} h`;
                          return parts.slice(0, 2).join(' e ');
                        };

                        if (finalItems.length === 0) {
                          return (
                            <div className="text-center py-6 border border-dashed border-slate-205 dark:border-zinc-800 rounded-2xl text-slate-400 text-[10px] w-full">
                              Sem itens correspondentes.
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-3.5 max-h-[385px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-zinc-800 scrollbar-track-transparent text-left w-full">
                            {finalItems.map(item => {
                              const hourly = (monthlySurvivalCost / 720) || 6.17;
                              const totalHoursConverted = item.value / hourly;
                              const timeStr = formatUnabbreviatedTime(totalHoursConverted);

                              return (
                                <div
                                  key={item.id}
                                  className="p-3.5 rounded-2xl bg-slate-50/50 dark:bg-[#121217] hover:bg-slate-100/40 dark:hover:bg-zinc-900/60 border border-slate-200/50 dark:border-zinc-850/60 flex items-center justify-between gap-3 text-left w-full transition-all"
                                >
                                  <div className="min-w-0 flex-1">
                                    <span className="text-xs font-black text-slate-900 dark:text-zinc-100 uppercase tracking-tight leading-none block select-all text-left">
                                      {item.name}
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest block mt-1.5 text-left">
                                      {item.categoryName} • R$ {item.value.toLocaleString('pt-BR')}
                                    </span>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                                      item.type === 'expense'
                                        ? 'bg-rose-550/15 text-rose-500'
                                        : 'bg-emerald-550/15 text-emerald-500'
                                    }`}>
                                      {item.type === 'expense' ? `+ ${timeStr}` : `+ ${timeStr}`}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* FLOATING SUCCESS TOAST */}
            <AnimatePresence>
              {futureBuyToast && (
                <motion.div 
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.9 }}
                  className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] max-w-sm w-[90%] bg-emerald-500 text-white p-5 rounded-[24px] shadow-[0_20px_40px_rgba(16,185,129,0.3)] border border-emerald-400 flex items-center gap-4 text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl shrink-0 font-bold">✨</div>
                  <div>
                    <h5 className="font-exrabold text-sm uppercase tracking-wide">Plano Sincronizado!</h5>
                    <p className="text-xs text-emerald-50 leading-snug mt-0.5 font-medium">Parabéns! Plano estabelecido e registrado com sucesso.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

            {/* 1. CAMADA DE FUNDO (BACKGROUND EMOCIONAL) */}
      <div className="absolute top-0 left-0 w-full h-[600px] pointer-events-none overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={bgIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img 
              src={bgImages[bgIndex]} 
              alt="Background" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Overlays dinâmicos */}
            <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[2px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#f8fafc]/20 to-[#f8fafc]" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Header Estilo iOS / ObjectiveCentral Refinado - Container Único Flutuante Fixo */}
      <div className="fixed top-0 inset-x-0 z-50 p-2 md:p-3.5 flex justify-center bg-transparent pointer-events-none">
        <div className="flex items-center gap-2 sm:gap-3 px-3 py-1.5 rounded-[22px] bg-white/60 dark:bg-black/80 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.18)] pointer-events-auto">
          {/* Voltar */}
          <NavButton 
            onClick={onBack}
            icon={<ArrowLeft />}
          />

          <div className="w-[1px] h-5 bg-zinc-200 dark:bg-zinc-800 mx-1" />

          {/* Ações de Destaque - Sério / Neutro */}
          <div className="flex items-center gap-1.5">
            <SeriousActionButton 
              icon={<Plus />} 
              onClick={() => handleOpenModal('income')} 
              label="Ganho"
              iconColor="#dcffd8"
            />
            <SeriousActionButton 
              icon={<TrendingDown />} 
              onClick={() => handleOpenModal('expense')} 
              label="Gasto"
              iconColor="#949494"
            />
            <SeriousActionButton 
              icon={<Layers />} 
              onClick={() => handleOpenModal('categories')} 
              label="Categorias"
              iconColor="#bfc2ff"
            />
          </div>

          <div className="w-[1px] h-5 bg-zinc-200 dark:bg-zinc-800 mx-1" />

          {/* Menu Lateral */}
          <NavButton 
            onClick={onToggleSidebar || (() => {})}
            icon={<Menu />}
            label="Menu"
            showLabel
          />
        </div>
      </div>

      <div className="relative z-10 max-w-[1800px] mx-auto px-4 sm:px-6 pt-20 md:pt-24 space-y-10">
        
        {/* TOASTS E DOCKS DO MODO DE EDIÇÃO FINANCEIRA INVISÍVEL */}
        <AnimatePresence>
          {showActiveToast && (
            <motion.div 
              initial={{ opacity: 0, y: -40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-5 py-2.5 bg-zinc-900/95 dark:bg-[#151515]/95 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl flex items-center gap-2 pointer-events-none"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Modo Edição Ativado</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isEditingFinancialMode && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 bg-zinc-900/90 dark:bg-zinc-950/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full flex items-center gap-6"
            >
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6366f1] animate-pulse">Modo Edição Ativo</span>
                <span className="text-[10px] text-zinc-400 font-bold whitespace-nowrap">Há alterações não salvas no rascunho</span>
              </div>
              <div className="w-[1px] h-6 bg-zinc-800" />
              <div className="flex gap-2">
                <button 
                  onClick={handleDiscardAllChanges}
                  className="px-4 py-2 hover:bg-white/10 text-zinc-300 rounded-full text-xs font-black uppercase tracking-wider transition-colors duration-250 cursor-pointer"
                >
                  Descartar
                </button>
                <button 
                  onClick={handleSaveAllChanges}
                  className="px-5 py-2 bg-[#6366f1] hover:bg-[#6366f1]/90 text-white rounded-full text-xs font-black uppercase tracking-wider transition-all duration-250 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. VISÃO FINANCEIRA (TOPO) - REFINADA */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
          
          {/* Micro-elemento flutuante invisível e discreto para ativar o modo de edição financeiro premium */}
          <button
            onClick={handleToggleEditingFinancialMode}
            className={`absolute z-50 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 cursor-pointer ${
              isEditingFinancialMode 
                ? 'text-[#6366f1] scale-125 opacity-100 rotate-45' 
                : 'text-zinc-400 hover:text-[#6366f1] opacity-35 hover:opacity-100 scale-100'
            } -right-3 top-1/2 -translate-y-1/2 md:-right-4 md:top-4 md:translate-y-0`}
            title="Ajuste de Órbita"
          >
            <span 
              style={{
                paddingBottom: '0px',
                paddingLeft: '0px',
                marginLeft: '0px',
              }}
              className="text-base font-black select-none mb-[1100px] md:mb-0"
            >
              ✦
            </span>
          </button>

          {/* Hero Widget: Saldo + Gráfico */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-8 bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-[48px] p-8 md:p-10 lg:p-12 shadow-2xl shadow-black/5 flex flex-col justify-between gap-10 relative overflow-hidden group"
          >
            {/* Brilho na borda */}
            <div className="absolute inset-0 border border-white/60 dark:border-white/10 rounded-[48px] pointer-events-none" />
            
            <div className="w-full space-y-8 relative z-10">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-black dark:bg-white dark:text-black text-white flex items-center justify-center shadow-lg">
                    <Wallet size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-gray-500">Patrimônio Líquido</span>
                </div>
                
                {inlineEditingField === 'balance' ? (
                  <div className="flex items-center gap-3">
                    <input 
                      type="text"
                      autoFocus
                      value={inlineEditingValue}
                      onChange={(e) => setInlineEditingValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveInlineValue();
                        if (e.key === 'Escape') setInlineEditingField(null);
                      }}
                      onBlur={() => handleSaveInlineValue()}
                      className="text-[clamp(1.4rem,7vw,3.6rem)] font-black w-72 bg-amber-500/10 dark:bg-amber-400/10 text-amber-500 dark:text-amber-400 border border-amber-500/50 rounded-2xl px-3 py-1 outline-none tracking-tighter"
                    />
                    <button onClick={() => handleSaveInlineValue()} className="p-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:brightness-110">✓</button>
                    <button onClick={() => setInlineEditingField(null)} className="p-2 bg-rose-500 text-white rounded-xl text-xs font-bold hover:brightness-110">✕</button>
                  </div>
                ) : isEditingFinancialMode ? (
                  <h2 
                    onClick={() => handleStartInlineEdit('balance', stats.balance)}
                    className="text-[clamp(1.8rem,9vw,4.8rem)] font-black text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-305 tracking-tighter leading-none whitespace-nowrap cursor-pointer hover:scale-[1.01] transition-transform flex items-center gap-2 group"
                  >
                    {formatCurrency(stats.balance)} <span className="text-base font-normal tracking-normal text-amber-400 animate-pulse">✎</span>
                  </h2>
                ) : (
                  <h2 className="text-[clamp(1.8rem,9vw,4.8rem)] font-black text-gray-900 dark:text-white tracking-tighter leading-none whitespace-nowrap">
                    {formatCurrency(stats.balance)}
                  </h2>
                )}

                <div className="flex items-center gap-3 mt-6">
                  <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1.5">
                    <TrendingUp size={12} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">+4.2% este mês</span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest">Atualizado agora</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 xs:gap-6 sm:gap-8 pt-8 border-t border-black/5 dark:border-white/5">
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Entradas</p>
                  
                  {inlineEditingField === 'income' ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="text"
                        autoFocus
                        value={inlineEditingValue}
                        onChange={(e) => setInlineEditingValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveInlineValue();
                          if (e.key === 'Escape') setInlineEditingField(null);
                        }}
                        onBlur={() => handleSaveInlineValue()}
                        className="text-sm xs:text-base font-black w-full max-w-28 bg-amber-500/10 dark:bg-amber-400/10 text-amber-500 dark:text-amber-400 border border-amber-500/30 rounded-xl px-2 py-1 outline-none tracking-tight"
                      />
                    </div>
                  ) : isEditingFinancialMode ? (
                    <p 
                      onClick={() => handleStartInlineEdit('income', stats.income)}
                      className="text-[clamp(1rem,4.5vw,1.5rem)] xs:text-[21px] sm:text-2xl font-black text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-305 tracking-tight cursor-pointer flex items-center gap-1.5 leading-none truncate whitespace-nowrap"
                    >
                      {formatCurrency(stats.income)} <span className="text-xs font-normal">✎</span>
                    </p>
                  ) : (
                    <p className="text-[clamp(1rem,4.5vw,1.5rem)] xs:text-[21px] sm:text-2xl font-black text-emerald-500 dark:text-emerald-400 tracking-tight leading-none truncate whitespace-nowrap">{formatCurrency(stats.income)}</p>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Saídas</p>
                  
                  {inlineEditingField === 'expense' ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="text"
                        autoFocus
                        value={inlineEditingValue}
                        onChange={(e) => setInlineEditingValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveInlineValue();
                          if (e.key === 'Escape') setInlineEditingField(null);
                        }}
                        onBlur={() => handleSaveInlineValue()}
                        className="text-sm xs:text-base font-black w-full max-w-28 bg-amber-500/10 dark:bg-amber-400/10 text-amber-500 dark:text-amber-400 border border-amber-500/30 rounded-xl px-2 py-1 outline-none tracking-tight"
                      />
                    </div>
                  ) : isEditingFinancialMode ? (
                    <p 
                      onClick={() => handleStartInlineEdit('expense', stats.expenses)}
                      className="text-[clamp(1rem,4.5vw,1.5rem)] xs:text-[21px] sm:text-2xl font-black text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-305 tracking-tight cursor-pointer flex items-center gap-1.5 leading-none truncate whitespace-nowrap"
                    >
                      {formatCurrency(stats.expenses)} <span className="text-xs font-normal">✎</span>
                    </p>
                  ) : (
                    <p className="text-[clamp(1rem,4.5vw,1.5rem)] xs:text-[21px] sm:text-2xl font-black text-[#820057] dark:text-rose-400 tracking-tight leading-none truncate whitespace-nowrap">{formatCurrency(stats.expenses)}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0 w-full min-h-[380px] md:min-h-[420px] relative z-10 outline-none flex flex-col justify-between" tabIndex={-1}>
              <div className="flex items-center justify-between mb-4 select-none">
                <div className="flex flex-col">
                  <span className="text-[7px] sm:text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500">Navegação Contínua</span>
                  <span className="text-xs font-bold text-gray-500 dark:text-zinc-400">
                    Janela de {zoomDays} dias {(panOffset !== 0) && `• Deslocado ${Math.round(panOffset)}d`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {(zoomDays !== 30 || panOffset !== 0) && (
                    <button 
                      onClick={handleResetChartZoomPan}
                      className="px-2.5 py-1 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[5px] sm:text-[9px] font-black uppercase tracking-widest text-[#6366f1] rounded-lg transition-colors cursor-pointer"
                    >
                      Resetar Zoom
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      haptics.success();
                      setIsAnalystModeOpen(true);
                    }}
                    className="pl-[9px] pr-[7px] py-[4px] sm:px-3 sm:py-1 bg-[#6366f1] hover:bg-[#6366f1]/90 text-white text-[8px] sm:text-[10px] font-black uppercase tracking-wider rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-1 cursor-pointer"
                  >
                    Sustento da Proéxis 📊
                  </button>
                </div>
              </div>

              <div 
                className="relative flex-1 min-h-[300px] md:min-h-[360px] cursor-grab active:cursor-grabbing select-none"
                onWheel={handleChartWheel}
                onMouseDown={handleChartMouseDown}
                onMouseMove={handleChartMouseMove}
                onMouseUp={handleChartMouseUpOrLeave}
                onMouseLeave={handleChartMouseUpOrLeave}
                onTouchStart={handleChartTouchStart}
                onTouchMove={handleChartTouchMove}
                onTouchEnd={handleChartTouchEnd}
              >
                {/* Visual help overlay */}
                <div className="absolute top-2 left-2 z-20 pointer-events-none opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1 text-[8px] font-black text-gray-400 uppercase tracking-widest">
                  <span>🖱 Wheel: Zoom • Drag: Navegar</span>
                </div>

                <div className="absolute inset-0 bg-emerald-500/5 dark:bg-emerald-500/2 blur-[80px] rounded-full pointer-events-none" />
                
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analystChartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorValueFuture" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.12)" strokeOpacity={0.6} vertical={false} />

                    <XAxis 
                      dataKey="date" 
                      stroke="currentColor" 
                      className="text-gray-400 dark:text-zinc-500 opacity-80"
                      fontSize={9}
                      fontWeight={800}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />

                    <YAxis 
                      stroke="currentColor"
                      className="text-gray-400 dark:text-zinc-500 opacity-80"
                      fontSize={9}
                      fontWeight={800}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
                      dx={-8}
                    />

                    {/* Today indicator */}
                    {analystChartData.find(d => d.isToday) && (
                      <ReferenceLine
                        x={analystChartData.find(d => d.isToday)?.date}
                        stroke="#10b981"
                        strokeDasharray="4 4"
                        strokeWidth={1.5}
                        label={{
                          value: 'HOJE',
                          fill: '#10b981',
                          fontSize: 8,
                          fontWeight: '900',
                          position: 'top',
                          offset: 10
                        }}
                      />
                    )}

                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const isFut = data.isFuture;
                          return (
                            <div className="bg-zinc-950/95 text-white p-3 md:p-4 rounded-2xl border border-white/10 shadow-2xl space-y-1.5 max-w-[240px]">
                              <p className="text-[9px] font-black uppercase tracking-widest text-[#6366f1] mb-1">
                                {isFut ? 'Cenário Projetado' : 'Consolidado'}
                              </p>
                              <div className="flex justify-between items-center text-xs gap-4">
                                <span className="text-zinc-400 font-bold">Data:</span>
                                <span className="font-black text-white">{data.fullDate}</span>
                              </div>
                              
                              <div className="flex justify-between items-center text-xs gap-4">
                                <span className="text-zinc-400 font-bold">Patrimônio:</span>
                                <span className="font-black text-emerald-400">{formatCurrency(data.rawBalance)}</span>
                              </div>

                              {!isFut && data.breakdown && data.breakdown.length > 0 && (
                                <div className="border-t border-white/15 pt-1.5 space-y-1 max-h-[120px] overflow-y-auto pr-1">
                                  <p className="text-[8px] font-black uppercase text-gray-400 mb-1">Lançamentos no Período:</p>
                                  {data.breakdown.map((b: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center text-[10px] gap-2">
                                      <span className="text-zinc-300 truncate max-w-[110px]">{b.name}</span>
                                      <span className={`font-black ${b.isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {b.isIncome ? '+' : '-'}{formatCurrency(b.value)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />

                    <Area 
                      type="monotone" 
                      dataKey="pastBalance" 
                      stroke="#10b981" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                      filter="url(#glow)"
                      connectNulls
                      isAnimationActive={false}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="futureBalance" 
                      stroke="#6366f1" 
                      strokeWidth={2} 
                      strokeDasharray="5 4"
                      fillOpacity={1}
                      fill="url(#colorValueFuture)" 
                      connectNulls
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* Secondary Stats */}
          <div className="lg:col-span-4 grid grid-cols-1 gap-6">
            <StatCard 
              label="Resultado Líquido" 
              value={stats.result} 
              icon={<Activity size={20} />} 
              color={stats.result >= 0 ? "bg-indigo-600 text-white" : "bg-red-600 text-white"}
              trend={null}
              isGlass
            />

            <MuralSuccessCarousel />

            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[40px] p-8 flex flex-col justify-between group overflow-hidden relative">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                    <Zap size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">Insight de IA</span>
                </div>
                <p className="text-sm font-medium leading-relaxed text-gray-600 dark:text-gray-400">
                  Seu saldo projetado para o fim do mês é de <span className="font-black text-gray-900 dark:text-white">{formatCurrency(stats.balance + stats.result)}</span>. 
                  Considere reduzir gastos em <span className="text-orange-500 font-bold">Lazer</span> para acelerar seu objetivo de viagem.
                </p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
            </div>
          </div>
        </section>

        {/* 2. CONTROLE RÁPIDO & FILTROS */}
        <section className="space-y-6">
          {/* Ações Rápidas - Reposicionadas e Refinadas */}
          <div className="w-fit bg-zinc-900/5 backdrop-blur-xl border border-black/5 p-2 sm:p-2.5 rounded-[32px] shadow-xl text-center mb-[25px] ml-6">
            <div className="flex justify-center gap-2 sm:gap-3">
              <button 
                onClick={() => handleOpenModal('income')}
                className="px-5 sm:px-7 py-2.5 bg-emerald-600 text-white rounded-[20px] font-black text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-[0_10px_20px_-5px_rgba(16,185,129,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)] border-t border-white/10 flex items-center justify-center gap-2 group active:translate-y-0.5 active:shadow-none"
              >
                <Plus size={14} />
                Novo Ganho
              </button>
              <button 
                onClick={() => handleOpenModal('expense')}
                className="px-5 sm:px-7 py-2.5 bg-zinc-900 text-white rounded-[20px] font-black text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-[0_10px_20px_-5px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.1)] border-t border-white/5 flex items-center justify-center gap-2 group active:translate-y-0.5 active:shadow-none"
              >
                <Plus size={14} />
                Novo Gasto
              </button>
            </div>
          </div>

          {/* 3. PROJEÇÃO + TIMELINE (BLOCO PRINCIPAL - MOVIDO) */}
          <div className="relative">
            {/* HEADER PREMIUM DE ENTRADA - REFINADO E COMPACTO */}
            <div className="px-6 md:px-10 pt-8 pb-2 md:pt-12 md:pb-4 animate-gradient-flow rounded-t-[48px] border-t border-x border-gray-100/10 relative z-30 flex flex-col items-center text-center">
              {/* Micro brilho metálico de topo */}
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent opacity-20" />
              
              <div className="relative z-10 space-y-4">
                <div className="flex flex-col items-center justify-center gap-1 relative">
                  {/* Título Principal - Alto Contraste (Escuro) */}
                  <h2 className="text-[1.35rem] sm:text-3xl md:text-6xl font-black uppercase tracking-tight text-gray-900 dark:text-white leading-tight drop-shadow-sm whitespace-nowrap">
                    Vida Financeira
                  </h2>
                  {/* Camada de Brilho (Shimmer) sobreposta para efeito premium sem perder visibilidade */}
                  <h2 className="absolute inset-0 text-[1.35rem] sm:text-3xl md:text-6xl font-black uppercase tracking-tight animate-silver-shimmer bg-clip-text text-transparent leading-tight pointer-events-none whitespace-nowrap">
                    Vida Financeira
                  </h2>
                </div>
              </div>
            </div>

            {/* FUSÃO VISUAL (TRANSITION FUMÊ) - ULTRA CURTA E INTENSA */}
            <div className="h-8 relative z-20 overflow-hidden pointer-events-none">
              {/* Transição ultra rápida: Branco/Verde para Preto em apenas 32px com animação de fluxo */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black animate-gradient-flow opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-black/40" />
            </div>

            {/* Projeção Expandida (Atualizada para Meses Reais) - SEM MARGEM NEGATIVA PARA EVITAR SOBREPOSIÇÃO */}
            <div className={`rounded-b-[48px] pt-4 pb-2 sm:pt-6 sm:pb-6 px-6 sm:px-8 md:pt-8 md:pb-10 md:px-12 shadow-2xl relative overflow-hidden group transition-all duration-700 z-10 ${
              (multiPeriodGoals[months[7]?.key] || (stats.balance + (stats.result * 1 * 0.85))) >= stats.balance 
              ? 'bg-black dark:bg-[#050505] text-white' 
              : 'bg-rose-950 text-white'
            }`}
            style={{
              background: (multiPeriodGoals[months[7]?.key] || (stats.balance + (stats.result * 1 * 0.85))) >= stats.balance 
                ? 'linear-gradient(145deg, #050505 0%, #1a1a1a 45%, #2a2a2a 50%, #1a1a1a 55%, #050505 100%)' 
                : undefined,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 25px 50px -12px rgba(0,0,0,0.5)'
            }}>
              {/* Textura de Relevo Sutil */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
              
              {/* Efeito de Brilho Dinâmico Premium */}
              <motion.div 
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.1, 0.2, 0.1],
                  rotate: [0, 90, 0]
                }}
                transition={{ duration: 10, repeat: Infinity }}
                className={`absolute -top-20 -right-20 w-80 h-80 rounded-full blur-[100px] transition-colors duration-700 ${
                  (multiPeriodGoals[months[7]?.key] || (stats.balance + (stats.result * 1 * 0.85))) >= stats.balance 
                  ? 'bg-emerald-500/20' 
                  : 'bg-rose-500/10'
                }`}
              />
              
              <div className="relative z-10 space-y-6 sm:space-y-10">
                {/* PRÉ-HEADER REFINADO */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl transition-colors shadow-lg ${
                      (multiPeriodGoals[months[7]?.key] || (stats.balance + (stats.result * 1 * 0.85))) >= stats.balance 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-white/5 text-rose-200 border border-white/10'
                    }`}>
                      <Zap size={18} className="sm:w-[20px] sm:h-[20px]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] text-gray-500">Próximo Mês</span>
                      <p className="text-base sm:text-lg font-black tracking-tight text-white">{months[7]?.label}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:block w-8 h-8 opacity-40">
                      {lottieData && (
                        <Lottie 
                          animationData={lottieData} 
                          loop={true} 
                          style={{ width: 32, height: 32 }}
                        />
                      )}
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { 
                        const presentCard = carouselRef.current?.querySelector('[data-type="present"]');
                        if (presentCard) {
                          presentCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                        }
                      }}
                      className="px-3 py-1.5 bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-indigo-300 border border-white/10 backdrop-blur-md shadow-sm cursor-pointer hover:bg-white/10 transition-all"
                    >
                      Análise de Fluxo
                    </motion.button>
                  </div>
                </div>


                <div className="grid grid-cols-1 gap-6 sm:gap-10">
                  <div className="space-y-1 sm:space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] sm:text-[11px] font-black text-gray-500 uppercase tracking-widest">Previsão IA</p>
                      <div className="flex flex-col items-end">
                        <span className="text-[7px] sm:text-xl font-black text-gray-400/40 uppercase tracking-widest">Saldo Atual</span>
                        <span className="text-[9px] sm:text-2xl font-black text-gray-200 tracking-tighter">{formatCurrency(stats.balance)}</span>
                      </div>
                    </div>
                    <p className="text-5xl sm:text-7xl font-black tracking-tighter">
                      {formatCurrency(stats.balance + (stats.result * 1 * 0.85))}
                    </p>
                  </div>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowGoalModal(true)}
                  className="w-full py-6 sm:py-8 bg-white/5 border border-white/10 rounded-[32px] sm:rounded-[40px] flex flex-col items-center justify-center gap-2 sm:gap-3 shadow-2xl backdrop-blur-xl relative overflow-hidden group/meta transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover/meta:opacity-100 transition-opacity duration-500" />
                  <Target size={20} className="text-indigo-400 mb-1 sm:mb-2 sm:scale-125" />
                  <span className="text-[9px] sm:text-[12px] font-black uppercase tracking-[0.3em] text-indigo-400">Sua Meta Pessoal</span>
                  <p className="text-3xl sm:text-6xl font-black tracking-tighter text-white relative z-10">
                    {multiPeriodGoals[months[7]?.key] > 0 ? formatCurrency(multiPeriodGoals[months[7]?.key]) : '---'}
                  </p>
                  {multiPeriodGoals[months[7]?.key] > 0 && (
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl text-[10px] sm:text-[14px] font-black ${
                      multiPeriodGoals[months[7]?.key] > (stats.balance + (stats.result * 1 * 0.85)) 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {Math.abs(((multiPeriodGoals[months[7]?.key] / (stats.balance + (stats.result * 1 * 0.85))) - 1) * 100).toFixed(1)}% 
                      {multiPeriodGoals[months[7]?.key] > (stats.balance + (stats.result * 1 * 0.85)) ? '↑' : '↓'}
                    </div>
                  )}
                </motion.button>

                <div className="pt-2 sm:pt-4 mb-3 sm:mb-0 mx-5">
                  <div className="flex justify-between items-center mb-2 sm:mb-4">
                    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest opacity-40">Confiança da IA</span>
                    <span className="text-[10px] sm:text-[11px] font-black text-zinc-500">92%</span>
                  </div>
                  <div className="h-1.5 sm:h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '92%' }}
                      transition={{ duration: 2, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
                      className="h-full bg-zinc-500" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Financeira & Carrossel de Futuros */}
            <div className="space-y-2 sm:space-y-10 pt-4 sm:pt-16">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 gap-4 sm:gap-0">
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="p-3 sm:p-4 bg-gray-100 rounded-2xl sm:rounded-3xl text-gray-400 shadow-inner">
                    <Clock size={20} className="sm:w-[22px] sm:h-[22px]" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] text-gray-900">Timeline de Evolução</h3>
                    <p className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 sm:mt-1">Fluxo Contínuo de Capital</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gray-200" />
                    <span className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-tighter">Passado</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                    <span className="text-[8px] sm:text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Hoje</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
                    <span className="text-[8px] sm:text-[9px] font-black text-indigo-500 uppercase tracking-tighter">Futuro</span>
                  </div>
                </div>
              </div>

              {/* Carrossel de Cards (Passado + Presente + Futuro) */}
              <div 
                ref={carouselRef}
                className="flex gap-6 sm:gap-10 overflow-x-auto no-scrollbar pb-16 sm:pb-24 -mx-4 px-10 sm:mx-0 sm:px-0 scroll-smooth pt-12 sm:pt-20 snap-x snap-mandatory"
              >
                {months.map(m => (
                  <MonthCard 
                    key={m.key}
                    type={m.type as any}
                    label={m.label}
                    currentValue={stats.balance}
                    aiPredicted={stats.balance + (stats.result * m.offset * 0.85)}
                    userGoal={multiPeriodGoals[m.key]}
                    realValue={m.type === 'past' ? getHistoricalBalance(m.date.getFullYear(), m.date.getMonth()) : undefined}
                    onGoalChange={(val) => setMultiPeriodGoals(prev => ({ ...prev, [m.key]: val }))}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </div>

              {/* Linha do Tempo Visual Expandida Mês a Mês */}
              <div 
                className="bg-gray-50/50 dark:bg-white/5 border-none rounded-[32px] sm:rounded-[40px] pl-4 sm:pl-[16px] pt-4 sm:pt-[13px] pb-4 sm:pb-8 relative overflow-hidden ml-0 -mt-[50px] mb-[15px]"
              >
                <div className="flex justify-between items-center relative z-10">
                  {/* Passado (6 meses atrás) */}
                  <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gray-300 dark:bg-zinc-700 shadow-sm" />
                    <div className="text-center">
                      <p className="text-[7px] sm:text-[8px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">{months[0].label}</p>
                      <p className="text-[9px] sm:text-[10px] font-black text-gray-600 dark:text-zinc-400 tracking-tight">{formatCurrency(getHistoricalBalance(months[0].date.getFullYear(), months[0].date.getMonth()))}</p>
                    </div>
                  </div>

                  <div className="flex-1 h-[1.5px] sm:h-[2px] bg-gradient-to-r from-gray-200 dark:from-zinc-800 via-emerald-500 to-indigo-500 mx-2 sm:mx-4 relative">
                    <motion.div 
                      animate={{ left: ['0%', '100%'] }}
                      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                      className="absolute top-1/2 -translate-y-1/2 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,1)] z-10"
                    />
                  </div>

                  {/* Presente - Ponto Central */}
                  <div className="flex flex-col items-center gap-1.5 sm:gap-2 scale-105 sm:scale-110">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], boxShadow: ['0 0 0px rgba(16,185,129,0)', '0 0 20px rgba(16,185,129,0.4)', '0 0 0px rgba(16,185,129,0)'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500 border-[3px] sm:border-4 border-white dark:border-zinc-900 shadow-lg z-20" 
                    />
                    <div className="text-center">
                      <p className="text-[7px] sm:text-[8px] font-black text-emerald-500 uppercase tracking-widest">Hoje</p>
                      <p className="text-[10px] sm:text-xs font-black text-emerald-700 dark:text-emerald-500 tracking-tight">{formatCurrency(stats.balance)}</p>
                    </div>
                  </div>

                  <div className="flex-1 h-[1.5px] sm:h-[2px] bg-indigo-200 dark:bg-indigo-900/40 mx-2 sm:mx-4 border-t border-dashed border-indigo-300 dark:border-indigo-800" />

                  {/* Futuro (12 meses à frente) */}
                  <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-indigo-500 shadow-sm" />
                    <div className="text-center">
                      <p className="text-[7px] sm:text-[8px] font-black text-indigo-500 uppercase tracking-widest">{months[months.length-1].label}</p>
                      <p className="text-[9px] sm:text-[10px] font-black text-indigo-700 dark:text-indigo-400 tracking-tight">
                        {formatCurrency(stats.balance + (stats.result * 12 * 0.85))}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Background Flow Effect */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                   <div className="absolute top-1/2 left-0 right-0 h-16 -translate-y-1/2 bg-gradient-to-r from-transparent via-emerald-500/20 to-indigo-500/20 blur-3xl" />
                </div>
              </div>
            </div>

            {/* Alinhamento com Objetivos */}
            <div className="bg-white dark:bg-black/90 border border-gray-100 dark:border-white/10 rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 shadow-sm">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Target size={18} className="text-emerald-500" />
                  <h2 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-gray-400 dark:text-zinc-500">Foco Estratégico</h2>
                </div>
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[8px] sm:text-[9px] font-black text-gray-300 dark:text-zinc-600 uppercase tracking-widest mb-1">Investido em Objetivos</p>
                      <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">{formatCurrency(objectiveStats.invested)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] sm:text-[9px] font-black text-gray-300 dark:text-zinc-600 uppercase tracking-widest mb-1">Fora do Foco</p>
                      <p className="text-base sm:text-lg font-black text-gray-400 dark:text-zinc-500 tracking-tighter">{formatCurrency(objectiveStats.outside)}</p>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden flex p-0.5 border border-gray-100 dark:border-white/10">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${objectiveStats.ratio}%` }} />
                  </div>
                  <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">
                    {objectiveStats.ratio > 30 ? '🔥 Excelente alinhamento com seus objetivos!' : '⚠️ Atenção: Seus gastos fora do foco estão altos.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4, 5 & 6. SISTEMA INTEGRADO: FILTROS, MOVIMENTAÇÕES E ANÁLISE */}
        <section className="px-0 pb-20">
        <div className="max-w-[1800px] mx-auto pt-0 -mx-1">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/90 dark:bg-black/90 backdrop-blur-3xl border border-white/50 dark:border-white/10 rounded-[48px] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col w-full"
          >
            {/* 1. FILTROS (TOPO – COMPACTO E INTELIGENTE) */}
            <div className="p-4 md:p-8 border-b border-gray-100/50 dark:border-white/5 bg-gray-50/30 dark:bg-white/5">
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                {/* Busca Integrada */}
                <div className="relative w-full md:w-1/3 group">
                  <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Buscar transação..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-6 pt-[7px] pb-[6px] bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-black transition-all shadow-sm text-gray-900 dark:text-white"
                  />
                </div>

                {/* Scroll Lateral de Filtros no Mobile */}
                <div className="w-full md:flex-1 overflow-x-auto no-scrollbar flex items-center gap-3 pb-2 md:pb-0 px-0">
                  {/* Dropdown de Categoria */}
                  <div className="relative shrink-0 px-0">
                    <select 
                      value={filterCategory}
                      onChange={e => setFilterCategory(e.target.value)}
                      className="pl-6 pr-12 pt-[7px] pb-[5px] bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-black dark:focus:border-white transition-all appearance-none cursor-pointer shadow-sm text-gray-900 dark:text-white"
                    >
                      <option value="all">Categorias</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Alternador Ganhos/Gastos */}
                  <div className="flex bg-gray-100/50 dark:bg-white/5 pt-[2px] pb-[2px] rounded-2xl border border-gray-200 dark:border-white/10 shrink-0 px-0">
                    {[
                      { id: 'all', label: 'Tudo', color: 'text-gray-400', active: 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm' },
                      { id: 'income', label: 'Ganhos', color: 'text-gray-400', active: 'bg-white dark:bg-zinc-800 text-emerald-500 shadow-sm' },
                      { id: 'expense', label: 'Gastos', color: 'text-gray-400', active: 'bg-white dark:bg-zinc-800 text-red-500 shadow-sm' }
                    ].map(type => (
                      <button 
                        key={type.id}
                        onClick={() => setFilterType(type.id as any)}
                        className={`px-4 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${filterType === type.id ? type.active : type.color}`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>

                  {/* Períodos */}
                  <div className="flex items-center gap-1.5 shrink-0 px-0">
                    {['day', 'week', 'month', 'year', 'all'].map(p => (
                      <button 
                        key={p}
                        onClick={() => setFilterPeriod(p as any)}
                        className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filterPeriod === p ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg' : 'bg-white/50 dark:bg-white/5 text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/10'}`}
                      >
                        {p === 'day' ? 'Dia' : p === 'week' ? 'Sem' : p === 'month' ? 'Mês' : p === 'year' ? 'Ano' : '∞'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. LISTA DE MOVIMENTAÇÕES (CENTRO – TRADICIONAL PREMIUM) */}
            <div className="relative bg-white dark:bg-[#111111]">
              {/* Container de Scroll Tradicional */}
              <div 
                ref={transactionListRef}
                className="h-[500px] overflow-y-auto no-scrollbar overscroll-contain bg-white dark:bg-[#111111]"
              >
                {listItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-20 space-y-4">
                    <div className="w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                      <Search size={48} />
                    </div>
                    <p className="text-sm font-black text-gray-400 uppercase tracking-[0.3em]">Nenhuma transação encontrada</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-1">
                    {listItems.map((item, index) => {
                      if ('type' in item && item.type === 'header') {
                        return (
                          <div 
                            key={item.label} 
                            style={{ 
                              transform: `scale(${listScales[index] || 1})`,
                              transition: 'transform 0.1s ease-out'
                            }}
                            className="pt-6 pb-4 px-4"
                          >
                            <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{item.label}</h3>
                          </div>
                        );
                      }
                      const t = item as Transaction;
                      return (
                        <TransactionItem 
                          key={t.id}
                          transaction={t} 
                          categories={categories} 
                          formatCurrency={formatCurrency} 
                          scale={listScales[index] || 1}
                          isEditingFinancialMode={isEditingFinancialMode}
                          onEdit={handleEditDraftTransaction}
                          onDuplicate={handleDuplicateDraftTransaction}
                          onMove={handleMoveDraftTransaction}
                          onDelete={handleDeleteDraftTransaction}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 3. VISUALIZAÇÕES (BASE – SUPORTE ANALÍTICO) */}
            <div className="p-6 md:p-12 border-t border-gray-100 dark:border-white/5 bg-gray-50/20 dark:bg-white/5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
                {/* Distribuição por Categoria */}
                <div className="space-y-6 md:space-y-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl shadow-lg shadow-black/10">
                        <PieChartIcon size={16} />
                      </div>
                      <div>
                        <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white">Distribuição</h3>
                        <p className="text-[7px] md:text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Alocação de Recursos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[7px] md:text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Total</p>
                      <p className="text-base md:text-lg font-black text-gray-900 dark:text-white tracking-tighter">{formatCurrency(stats.expenses)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
                    <div className="h-[220px] md:h-[260px] relative">
                      <ResponsiveContainer width="100%" height="100%" className="outline-none">
                        <PieChart>
                          <Pie
                            data={distributionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={10}
                            dataKey="value"
                          >
                            {distributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ borderRadius: '24px', border: 'none', backgroundColor: '#000', color: '#fff', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: '900' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value: number) => formatCurrency(value)}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[7px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest">Macro</span>
                        <span className="text-sm font-black text-gray-900 dark:text-white tracking-tighter">Fluxo</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {distributionData.slice(0, 5).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow cursor-default">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-[9px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-tight">{item.name}</span>
                          </div>
                          <span className="text-[9px] font-black text-gray-900 dark:text-white">{formatCurrency(item.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Evolução de Volume (Carousel Dinâmico) */}
                <div className="space-y-6 md:space-y-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/10">
                        <BarChart3 size={16} />
                      </div>
                      <div>
                        <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-gray-900">Volume de Fluxo</h3>
                        <p className="text-[7px] md:text-[8px] font-bold text-gray-400 uppercase tracking-widest">Ganhos vs Gastos</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                      </div>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="overflow-x-auto no-scrollbar flex snap-x snap-mandatory gap-6 pb-4">
                      {/* View 1: Barras Simples */}
                      <div className="min-w-full snap-center h-[220px] md:h-[260px] bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
                        <ResponsiveContainer width="100%" height="100%" className="outline-none">
                          <BarChart data={[
                            { name: 'Ganhos', value: stats.income, color: '#10b981' },
                            { name: 'Gastos', value: stats.expenses, color: '#000000' }
                          ]}>
                            <XAxis dataKey="name" hide />
                            <YAxis hide />
                            <Tooltip 
                              cursor={{ fill: 'transparent' }}
                              contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: '900' }}
                              formatter={(value: number) => formatCurrency(value)}
                            />
                            <Bar dataKey="value" radius={[16, 16, 16, 16]} barSize={60}>
                              {[
                                { name: 'Ganhos', value: stats.income, color: '#10b981' },
                                { name: 'Gastos', value: stats.expenses, color: '#000000' }
                              ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* View 2: Comparativo de Resultado */}
                      <div className="min-w-full snap-center h-[220px] md:h-[260px] bg-black rounded-[32px] p-8 flex flex-col justify-between shadow-xl">
                        <div>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">Resultado Líquido</p>
                          <h4 className={`text-3xl font-black tracking-tighter ${stats.result >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {formatCurrency(stats.result)}
                          </h4>
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between items-end">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Eficiência</span>
                            <span className="text-xl font-black text-white">{Math.round((stats.result / (stats.income || 1)) * 100)}%</span>
                          </div>
                          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: `${Math.max(0, Math.min(100, (stats.result / (stats.income || 1)) * 100))}%` }}
                              className={`h-full ${stats.result >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* View 3: Evolução Temporal Real baseada nos últimos lançamentos */}
                      <div className="min-w-full snap-center h-[220px] md:h-[260px] bg-white dark:bg-[#151515] rounded-[32px] p-6 border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
                        <p className="text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-4">Fluxo de Caixa Líquido</p>
                        <ResponsiveContainer width="100%" height="100%" className="outline-none">
                          <AreaChart data={activeTransactions.slice(-12).reverse().map((t) => {
                            const isInc = categories.find(c => c.id === t.category_id)?.type === CategoryType.INCOME;
                            return {
                              date: t.date,
                              value: isInc ? t.value : -t.value,
                              note: t.note || categories.find(c => c.id === t.category_id)?.name || 'Lançamento'
                            };
                          })}>
                            <defs>
                              <linearGradient id="colorValueFlowMini" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <Tooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-zinc-950 text-white p-3 rounded-2xl border border-white/10 shadow-2xl space-y-0.5">
                                      <p className="text-[8px] font-black uppercase text-gray-400 tracking-wider">
                                        {new Date(data.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                      </p>
                                      <p className="text-xs font-extrabold truncate max-w-[160px] text-[#bfc2ff]">{data.note}</p>
                                      <p className={`text-sm font-black ${data.value >= 0 ? 'text-emerald-400' : 'text-rose-450'}`}>
                                        {data.value >= 0 ? '+' : ''}{formatCurrency(data.value)}
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.12)" strokeOpacity={0.5} vertical={false} />
                            <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValueFlowMini)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    {/* Indicadores de Swipe */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                       <div className="w-1 h-1 rounded-full bg-gray-300" />
                       <div className="w-1 h-1 rounded-full bg-gray-200" />
                       <div className="w-1 h-1 rounded-full bg-gray-200" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

        {/* --- MÓDULO DE CORTES (ORIGINAL E INTOCÁVEL) --- */}
        <div className="pt-10 sm:pt-16 border-t border-gray-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-orange-500 text-white rounded-2xl shadow-lg shadow-orange-500/20">
              <TrendingDown size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Otimização de Custos</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Módulo de Estratégia e Cortes</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => isReordering ? saveReorder() : setIsReordering(true)}
                className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 ${isReordering ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50'}`}
              >
                {isReordering ? (
                  <>
                    <CheckCircle size={16} />
                    Salvar Ordem
                  </>
                ) : (
                  <>
                    <Move size={16} />
                    Organizar Categorias
                  </>
                )}
              </button>
            </div>

            <button 
              onClick={() => setShowPeriodModal(true)}
              className="px-6 py-3 bg-white border border-gray-200 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
            >
              <Calendar size={16} />
              {selectedPeriod === 'ESSE_MES' ? 'Este Mês' : selectedPeriod === '3_MESES' ? '3 Meses' : 'Histórico Total'}
            </button>
          </div>

          <div className="max-w-xl mx-auto mb-6 sm:mb-8 bg-white p-2 rounded-full shadow-sm flex border border-gray-100 pb-2 sm:pb-2">
            <button 
              onClick={() => setViewMode('HISTORICO')}
              className={`flex-1 py-3 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-full transition-all ${viewMode === 'HISTORICO' ? 'bg-black text-white' : 'text-gray-400 hover:text-gray-900'}`}
            >
              Histórico
            </button>
            <button 
              onClick={() => setViewMode('FUTURO')}
              className={`flex-1 py-3 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-full transition-all ${viewMode === 'FUTURO' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-orange-500'}`}
            >
              Planejamento Futuro
            </button>
          </div>

          <div className="flex flex-col gap-6 sm:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Reorder.Group 
              axis="y" 
              values={localCategories} 
              onReorder={handleReorder}
              className="flex flex-col gap-6 sm:gap-8"
            >
              {localCategories.filter(c => c.type !== CategoryType.INCOME).map(cat => {
                const stats = spendingData[cat.id];
                if (!stats) return null;

                return (
                  <CategoryBlock 
                    key={cat.id}
                    cat={cat}
                    stats={stats}
                    isReordering={isReordering}
                    inputs={inputs}
                    setInputs={setInputs}
                    handleSaveProjection={handleSaveProjection}
                    formatCurrency={formatCurrency}
                    dragConstraints={containerRef}
                  />
                );
              })}
            </Reorder.Group>
          </div>
        </div>
      </div>

      {/* Modal de Edição de Meta */}
      <AnimatePresence>
        {showGoalModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, pointerEvents: 'none' }}
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGoalModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-[32px] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6">
                <button onClick={() => setShowGoalModal(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                    <Target size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight">Definir Meta Pessoal</h3>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{months[7]?.label}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 block">Valor da Meta (R$)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black">R$</span>
                      <input 
                        type="number"
                        autoFocus
                        value={multiPeriodGoals[months[7]?.key] || ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setMultiPeriodGoals(prev => ({ ...prev, [months[7]?.key]: val }));
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xl font-black text-white outline-none focus:border-indigo-500 transition-all"
                        placeholder="Ex: 5000"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Previsão IA</span>
                      <span className="text-[10px] font-black text-white">{formatCurrency(stats.balance + (stats.result * 1 * 0.85))}</span>
                    </div>
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[92%]" />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowGoalModal(false)}
                  className="w-full py-4 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all shadow-xl"
                >
                  Confirmar Meta
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal do Filtro de Período (Original) */}
      {showPeriodModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-[500px] bg-white rounded-[32px] overflow-hidden shadow-2xl">
            <div className="bg-black text-white p-8 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">Seletor de Período</h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Horizonte de Análise</p>
              </div>
              <button onClick={() => setShowPeriodModal(false)} className="p-3 bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-all text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 grid grid-cols-2 gap-4">
              <button onClick={() => { setSelectedPeriod('ESSE_MES'); setShowPeriodModal(false); }} className="p-4 bg-gray-50 rounded-xl font-bold text-[10px] uppercase text-gray-500 hover:bg-gray-100 hover:text-black">Este Mês</button>
              <button onClick={() => { setSelectedPeriod('3_MESES'); setShowPeriodModal(false); }} className="p-4 bg-gray-50 rounded-xl font-bold text-[10px] uppercase text-gray-500 hover:bg-gray-100 hover:text-black">3 Meses</button>
              <button onClick={() => { setSelectedPeriod('HISTORICO_TOTAL'); setShowPeriodModal(false); }} className="p-4 bg-gray-50 rounded-xl font-bold text-[10px] uppercase text-gray-500 hover:bg-gray-100 hover:text-black">Histórico Total</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente Carrossel do Mural de Sucesso em Alto Padrão 3D Cover Flow
const MuralSuccessCarousel = () => {
  const syncKey = useOrganismSync();
  
  const successAssets = useMemo(() => {
    const mural = db.getMuralData();
    const assetsList = mural.assets ?? [];
    
    return assetsList.map((a: any) => ({
      ...a,
      image: a.image || (a.images && a.images[0]) || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800'
    }));
  }, [syncKey]);

  const [activeIndex, setActiveIndex] = useState(0);
  const isInteracting = useRef(false);
  const touchTimeout = useRef<any>(null);

  // Auxiliar para calcular o índice cíclico/distância para o efeito Cover Flow
  const getRelativeIndex = (idx: number, active: number, total: number) => {
    let diff = idx - active;
    if (total > 2) {
      if (diff > total / 2) diff -= total;
      if (diff < -total / 2) diff += total;
    }
    return diff;
  };

  // Troca automática de slides a cada 6 segundos
  useEffect(() => {
    if (successAssets.length <= 1) return;
    
    const interval = setInterval(() => {
      if (isInteracting.current) return;
      setActiveIndex(prev => (prev + 1) % successAssets.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [successAssets.length]);

  const delayAutoRotation = () => {
    isInteracting.current = true;
    if (touchTimeout.current) clearTimeout(touchTimeout.current);
    touchTimeout.current = setTimeout(() => {
      isInteracting.current = false;
    }, 5000);
  };

  // Tratar a navegação manual ou clique nos cartões secundários
  const handleCardClick = (idx: number, offset: number) => {
    delayAutoRotation();
    if (offset !== 0) {
      setActiveIndex(idx);
    }
  };

  const handlePrev = () => {
    delayAutoRotation();
    setActiveIndex(prev => (prev - 1 + successAssets.length) % successAssets.length);
  };

  const handleNext = () => {
    delayAutoRotation();
    setActiveIndex(prev => (prev + 1) % successAssets.length);
  };

  // Tratar o arrasto físico (swipe no toque/dedo e mouse)
  const handleDragEnd = (event: any, info: any) => {
    delayAutoRotation();
    const swipeThreshold = 40;
    if (info.offset.x < -swipeThreshold) {
      handleNext();
    } else if (info.offset.x > swipeThreshold) {
      handlePrev();
    }
  };

  return (
    <div className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl border border-white/60 dark:border-white/10 rounded-[48px] p-6 shadow-2xl shadow-black/5 relative overflow-hidden flex flex-col justify-between h-[400px] md:h-[440px]">
      <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-2 relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
            <Trophy size={18} />
          </div>
          <div className="text-left">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-800 dark:text-zinc-200">Mural de Conquistas</h4>
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500">Bens Cadastrados</span>
          </div>
        </div>
        
        {successAssets.length > 1 && (
          <div className="flex items-center gap-1.5">
            <button 
              onClick={handlePrev}
              className="p-1.5 bg-black/5 dark:bg-white/5 rounded-xl text-gray-500 hover:text-black dark:hover:text-white transition-all hover:bg-black/10 dark:hover:bg-white/10"
              aria-label="Anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={handleNext}
              className="p-1.5 bg-black/5 dark:bg-white/5 rounded-xl text-gray-500 hover:text-black dark:hover:text-white transition-all hover:bg-black/10 dark:hover:bg-white/10"
              aria-label="Próximo"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Arena 3D de Encaixe Cover Flow */}
      {successAssets.length === 0 ? (
        <div className="flex-1 w-full flex flex-col items-center justify-center text-center p-6 space-y-3 relative z-20">
          <div className="w-16 h-16 rounded-3xl bg-zinc-100 dark:bg-zinc-800/40 flex items-center justify-center text-zinc-400 dark:text-zinc-500 border border-zinc-200/40 dark:border-zinc-700/20">
            <Trophy size={26} className="opacity-60" />
          </div>
          <div className="space-y-1">
            <h5 className="text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-zinc-300">Nenhum marco cadastrado</h5>
            <p className="text-[9px] text-gray-400 dark:text-zinc-500 max-w-[240px]">
              Clique em editar para cadastrar seus patrimônios e conquistas alcançadas.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 w-full relative flex items-center justify-center overflow-visible py-4 select-none">
          <motion.div 
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.4}
            onDragEnd={handleDragEnd}
            className="relative w-full h-[270px] md:h-[300px] flex items-center justify-center cursor-grab active:cursor-grabbing overflow-visible"
            style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
          >
            {successAssets.map((asset, idx) => {
              const offset = getRelativeIndex(idx, activeIndex, successAssets.length);
              const isCenter = offset === 0;
              const isVisible = Math.abs(offset) <= 1;

              // Variantes de transformação 3D dinâmicas (ângulo, escala, deslocamento espacial e transparência)
              const rotateY = -offset * 32;
              const x = offset * 135; 
              const z = -Math.round(Math.abs(offset) * 110);
              const scale = 1 - Math.abs(offset) * 0.15;
              const zIndex = 10 - Math.abs(offset);
              const opacity = isVisible ? (isCenter ? 1 : 0.55) : 0;

              return (
                <motion.div
                  key={asset.id}
                  onClick={() => handleCardClick(idx, offset)}
                  style={{ 
                    transformStyle: "preserve-3d",
                    zIndex,
                    pointerEvents: isVisible ? 'auto' : 'none'
                  }}
                  animate={{ 
                    x, 
                    rotateY, 
                    scale,
                    z,
                    opacity
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 280, 
                    damping: 24, 
                    mass: 0.8
                  }}
                  className={`absolute w-[190px] md:w-[220px] h-[260px] md:h-[290px] rounded-[32px] overflow-hidden shadow-2xl transition-shadow duration-300 ${isCenter ? 'ring-2 ring-amber-500/35 shadow-amber-500/5' : 'filter blur-[0.6px]'}`}
                >
                  {/* Imagem de Fundo Completa */}
                  <img 
                    src={asset.image} 
                    className="absolute inset-0 w-full h-full object-cover select-none"
                    alt={asset.name}
                    referrerPolicy="no-referrer"
                    draggable={false}
                  />
                  
                  {/* Degradê Premium para Leitura Translúcida */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent z-10 pointer-events-none" />
                  
                  {/* Badge Superior */}
                  <div className="absolute top-4 right-4 z-20 bg-amber-500 text-black px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg pointer-events-none">
                    <span className="uppercase font-sans font-black">Mural</span>
                  </div>

                  {/* Conteúdo Detalhado Completo do Bem (Sem fonte mono de zero cortado) */}
                  <div className="absolute inset-x-0 bottom-0 p-5 z-20 flex flex-col justify-end text-left pointer-events-none">
                    <div>
                      <span className="text-[8px] font-black text-amber-400 dark:text-amber-300 uppercase tracking-widest block font-sans">
                        {asset.category}
                      </span>
                      <h3 className="text-sm md:text-base font-black uppercase tracking-tight text-white leading-tight mt-0.5 font-sans">
                        {asset.name}
                      </h3>
                    </div>
                    
                    <div className="flex justify-between items-end pt-1 bg-gradient-to-t from-black/20 to-transparent mt-1">
                      <div className="space-y-0.5">
                        <p className="text-base md:text-lg font-black text-white tracking-tight leading-none font-sans">
                          R$ {Number(asset.value).toLocaleString('pt-BR')}
                        </p>
                        <p className="text-white/45 text-[7px] font-bold uppercase tracking-widest font-sans">
                          Patrimônio Realizado
                        </p>
                      </div>
                      
                      <div className="w-7 h-7 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center text-white">
                        <Trophy size={12} className="text-amber-400" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      )}

      {/* Indicadores inferiores */}
      {successAssets.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2 relative z-20">
          {successAssets.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                delayAutoRotation();
                setActiveIndex(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeIndex ? 'w-5 bg-black dark:bg-white' : 'w-1.5 bg-black/25 dark:bg-white/20'}`}
              aria-label={`Ir para o asset ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Componente Auxiliar para Cards de Estatística
const StatCard = ({ label, value, icon, color, trend, isGlass }: any) => (
  <motion.div 
    whileHover={{ y: -5, scale: 1.02 }}
    className={`${isGlass ? 'bg-white/60 backdrop-blur-2xl border border-white/40' : color} p-8 rounded-[32px] shadow-sm flex flex-col justify-between min-h-[160px] relative overflow-hidden group`}
  >
    <div className="flex justify-between items-start relative z-10">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isGlass ? 'bg-black text-white' : (color.includes('white') ? 'bg-gray-50 text-gray-400' : 'bg-white/20 text-white')}`}>
        {icon}
      </div>
      {trend && (
        <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${trend.startsWith('+') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
          {trend}
        </span>
      )}
    </div>

    <div className="relative z-10 text-left">
      <p className={`text-[9px] font-black uppercase tracking-[0.3em] mb-1 ${isGlass ? 'text-gray-400' : (color.includes('white') ? 'text-gray-400' : 'text-white/60')}`}>{label}</p>
      <p className={`text-3xl font-black tracking-tighter ${isGlass ? 'text-gray-900' : ''}`}>
        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
      </p>
    </div>
    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
  </motion.div>
);


const CategoryBlock = ({ cat, stats, isReordering, inputs, setInputs, handleSaveProjection, formatCurrency, dragConstraints }: any) => {
  const dragControls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);

  return (
    <Reorder.Item 
      value={cat}
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={dragConstraints}
      dragMomentum={false}
      dragElastic={0.05}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      className="relative"
    >
      {/* Drag Handle Overlay */}
      {isReordering && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onPointerDown={(e) => {
            e.preventDefault();
            dragControls.start(e);
          }}
          className="absolute inset-0 z-50 bg-black/60 backdrop-blur-[4px] flex flex-col items-center justify-center gap-4 cursor-grab active:cursor-grabbing group/handle transition-all touch-none select-none rounded-[40px]"
          style={{ WebkitTouchCallout: 'none' }}
        >
          <motion.div 
            animate={isDragging ? { scale: 1.2, rotate: 5 } : { scale: 1 }}
            className={`p-6 rounded-full border transition-all duration-300 ${isDragging ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.5)]' : 'bg-white/10 border-white/20 text-white group-hover/handle:bg-white/20'}`}
          >
            <Move size={32} />
          </motion.div>
          <motion.span 
            animate={isDragging ? { opacity: 1, y: 0 } : { opacity: 0.6, y: 5 }}
            className="text-[10px] font-black uppercase tracking-[0.4em] text-white"
          >
            {isDragging ? 'Movendo...' : 'Toque para Arrastar'}
          </motion.span>
        </motion.div>
      )}

      <div className="bg-white border border-gray-100 rounded-[32px] sm:rounded-[40px] p-4 sm:p-10 shadow-sm text-left group hover:border-black/10 transition-all overflow-hidden">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-6 px-2 sm:px-0">
          <div className="space-y-1 text-left">
            <h4 className="text-2xl font-black uppercase tracking-tighter text-gray-900 leading-none">{cat.name}</h4>
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Diretrizes de Otimização Financeira</p>
          </div>
          <div className="w-full sm:w-auto text-left sm:text-right bg-black/5 px-6 py-3 rounded-2xl border border-black/5">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-0.5">Total no Período</p>
            <p className="text-xl font-black text-gray-900 tracking-tighter">{formatCurrency(stats.filtered)}</p>
          </div>
        </div>

        {/* CARROSSEL DOS MESES */}
        <div className="flex overflow-x-auto no-scrollbar gap-6 p-6 sm:p-8 bg-gray-50/50 rounded-[48px] snap-x snap-mandatory border border-gray-100/50">
          {stats.periods.map((period: any, idx: number) => {
            const specificKey = `${cat.id}-${period.month}-${period.year}`;
            const currentLimit = inputs[specificKey] ?? 0;
            const isOver = period.economy < 0;

            return (
              <div
                key={idx}
                className={`flex-shrink-0 w-[82vw] sm:w-[340px] p-6 sm:p-8 rounded-[36px] border transition-all snap-center relative overflow-hidden group/pcard 
                  ${isOver && !period.isFuture
                    ? 'bg-gradient-to-br from-gray-50 via-white to-gray-200 border-gray-300 shadow-[0_4px_15px_rgba(0,0,0,0.25)]' 
                    : 'bg-gradient-to-br from-gray-50 via-white to-emerald-100 border-emerald-200 shadow-[0_4px_15px_rgba(0,0,0,0.2)]'
                  }`}
              >
                <div className="space-y-7 relative z-10">
                  
                  {/* Label Mês Preto + Ícone Direita */}
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full bg-black text-white">
                      {period.label}
                    </span>
                    {period.isFuture ? (
                      <Activity size={24} className="text-orange-500 animate-pulse drop-shadow-sm" />
                    ) : period.economy >= 0 ? (
                      <TrendingUp size={24} className="text-emerald-600 animate-grow-pulse drop-shadow-sm" />
                    ) : (
                      <TrendingDown size={24} className="text-red-500 drop-shadow-sm" />
                    )}
                  </div>

                  {/* Cota de Gasto (Mês) */}
                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 px-2 block">Cota de Gasto (Mês)</label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">R$</span>
                        <input
                          type="number"
                          value={inputs[specificKey] ?? ''}
                          onChange={e => setInputs({ ...inputs, [specificKey]: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-white py-3 pl-10 pr-4 rounded-2xl font-black text-sm outline-none border border-black/5 focus:border-black transition-all shadow-sm text-gray-900"
                          placeholder="0,00"
                        />
                      </div>
                      <button
                        onClick={() => {
                          handleSaveProjection(cat.id, period.month, period.year, inputs[specificKey] || 0, period.label);
                          haptics.success();
                        }}
                        className="flex-shrink-0 bg-gradient-to-br from-slate-700 via-slate-900 via-emerald-950 to-black text-white p-3.5 rounded-2xl hover:brightness-125 hover:scale-105 transition-all shadow-xl active:scale-95 border border-white/10"
                        title="Salvar Diretriz"
                      >
                        <Save size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Gasto Realizado e Economia - Apenas se não for futuro */}
                  {!period.isFuture && (
                    <div className="grid grid-cols-1 gap-5 pt-6 border-t border-black/5">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Gasto Realizado</p>
                        <p className="text-4xl font-black tracking-tighter text-black">{formatCurrency(period.spent)}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Economia Real</p>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${period.economy >= 0 ? 'bg-green-100 text-green-600 shadow-[0_2px_8px_rgba(34,197,94,0.2)] animate-grow-pulse' : 'bg-red-100 text-red-600 shadow-[0_2px_8px_rgba(220,38,38,0.2)]'}`}>
                            {period.economy >= 0 ? <CheckCircle size={10} /> : <X size={11} className="stroke-[3]" />}
                          </div>
                        </div>
                        <p className={`text-2xl font-black tracking-tighter ${period.economy >= 0 ? 'text-emerald-500 animate-shine-green' : 'text-red-600'}`}>
                          {formatCurrency(period.economy)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Progress Bar de Eficiência Financeira - Apenas se não for futuro */}
                  {!period.isFuture && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                        <span className="text-gray-400">Eficiência Financeira</span>
                        <span className={period.economy >= 0 ? 'text-gray-900 font-bold' : 'text-red-600 font-bold'}>
                          {currentLimit > 0 ? Math.round((period.spent / currentLimit) * 100) : 0}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden p-[1px] border border-black/5">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${period.economy < 0 ? 'bg-gray-400 shadow-[0_0_10px_rgba(0,0,0,0.1)]' : 'bg-gradient-to-r from-green-400 to-green-600 shadow-[0_0_8px_rgba(34,197,94,0.2)]'}`}
                          style={{ width: `${Math.min((period.spent / (currentLimit || 1)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                </div>
                
                {/* Aura Colorida ao fundo */}
                <div className={`absolute bottom-0 right-0 w-40 h-40 blur-[80px] rounded-full -mr-20 -mb-20 opacity-20 pointer-events-none ${period.isFuture ? 'bg-orange-500' : period.economy >= 0 ? 'bg-emerald-500' : 'bg-gray-600'}`} />
              </div>
            );
          })}
        </div>
      </div>
    </Reorder.Item>
  );
};
