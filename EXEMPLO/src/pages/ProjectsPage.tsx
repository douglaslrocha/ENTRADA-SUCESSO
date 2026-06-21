import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls, useScroll, useTransform } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { organismEventBus } from '../services/organismEventBus';
import { 
  Bell,
  X,
  Target, 
  Flag, 
  Briefcase, 
  CheckSquare, 
  Calendar, 
  ChevronRight, 
  ChevronLeft,
  Clock,
  Plus,
  Play,
  Pause,
  ArrowLeft,
  Activity,
  Zap,
  MoreVertical,
  CheckCircle2,
  Circle,
  Sparkles,
  TrendingUp,
  Trophy,
  AlertCircle,
  ArrowRight,
  Sun,
  Moon,
  CloudMoon,
  Sunrise,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Maximize2,
  Menu,
  GripVertical,
  Settings2,
  Move,
  Trash2,
  Wallet,
  DollarSign,
  FileText,
  LayoutGrid,
  ScrollText,
  TrendingDown,
  FolderPlus,
  PlusCircle,
  Award,
  Cpu,
  Workflow,
  Edit2,
  ChevronDown,
  Sliders,
  Heart,
  Repeat,
  MessageSquare,
  Pin,
  Send
} from 'lucide-react';
import Lottie from 'lottie-react';
import { fakeDB } from '../core/fakeDB';
import { ObjectiveCentral } from '../components/central/ObjectiveCentral';
import { useOrganismSync } from '../hooks/useOrganismSync';
import { safeLocalStorage } from '../utils/storage';
import { Category, Transaction, CategoryType } from '../types';
import { UnifiedFinanceModal } from '../components/UnifiedFinanceModal';
import AnimatedRocket from '../components/AnimatedRocket';
import { backgroundService } from '../services/backgroundService';
import { haptics } from '../services/HapticService';

interface ProjectsPageProps {
  onBack: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onToggleSidebar?: () => void;
  categories: Category[];
  transactions: Transaction[];
  onRefreshCategories: () => void;
}

// Custom high-performance local hook for Intersection Observer with comfortable margin
function useInView(options?: IntersectionObserverInit) {
  const [inView, setInView] = useState(true);
  const ref = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.IntersectionObserver) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, {
      rootMargin: '250px 0px 250px 0px', // Comfort margin to animate before it visually enters 100% of view
      threshold: 0,
      ...options
    });

    observer.observe(el);
    return () => {
      observer.unobserve(el);
    };
  }, [options]);

  return [ref, inView] as const;
}

// Stable Lottie animations for the header
const HEADER_LOTTIE_URL = "https://lottie.host/67e4e897-a97c-4363-820d-7617498c2596/9H1V6Z8Y8Z.json";
const FALLBACK_LOTTIE_URL = "https://assets3.lottiefiles.com/packages/lf20_sk5h1m6v.json";

const RoseIcon = React.memo(({ inView = true }: { inView?: boolean }) => {
  const pollen = useMemo(() => [...Array(6)].map((_, i) => ({
    id: i,
    startX: Math.random() * 60 - 30,
    startY: Math.random() * 60 - 30,
    duration: 5 + Math.random() * 3,
    delay: i * 0.8
  })), []);

  return (
    <motion.div
      key="rose"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.08, filter: "blur(3px)" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{ transform: 'translateZ(0)' }}
      className="relative flex items-center justify-center w-full h-full overflow-hidden"
    >
      {/* Partículas de Pólen/Brilho (Atmosfera) */}
      {inView && pollen.map((p) => (
        <motion.div
          key={`pollen-${p.id}`}
          initial={{ 
            x: p.startX, 
            y: p.startY, 
            opacity: 0,
            scale: 0 
          }}
          animate={{ 
            y: [p.startY, p.startY - 40, p.startY - 20, p.startY - 60],
            x: [p.startX, p.startX + 10, p.startX - 10, p.startX + 5],
            opacity: [0, 1, 0.8, 0],
            scale: [0, 1, 0.8, 0]
          }}
          transition={{ 
            duration: p.duration, 
            repeat: Infinity, 
            delay: p.delay,
            ease: "easeInOut" 
          }}
          className="absolute w-1 h-1 bg-yellow-200/60 rounded-full blur-[0.5px] z-0"
        />
      ))}

      <svg viewBox="0 0 100 100" className="w-10 h-10 md:w-12 md:h-12 relative z-10">
        <defs>
          {/* Degradê radial super premium para as pétalas com sombras aveludadas */}
          <radialGradient id="roseRed" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#ffe4e6" />
            <stop offset="15%" stopColor="#f43f5e" />
            <stop offset="60%" stopColor="#9f1239" />
            <stop offset="100%" stopColor="#4c0519" />
          </radialGradient>
          
          {/* Degradê de luz interior dourada para o núcleo em desabroche */}
          <radialGradient id="roseCore" cx="50%" cy="45%" r="40%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="30%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#881337" />
          </radialGradient>

          {/* Degradê do caule */}
          <linearGradient id="roseStem" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#064e3b" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>

          {/* Degradê de profundidade das folhas */}
          <linearGradient id="roseLeaf" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#022c22" />
            <stop offset="60%" stopColor="#047857" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>

        {/* Grupo com a Rosa Centrada e sua sequência de desabrochar */}
        <g style={{ transform: 'translateZ(0)' }}>
          {/* 1. Caule que cresce em espiral suave */}
          <motion.path
            d="M50 82 C49 71 49 61 50 54"
            stroke="url(#roseStem)"
            strokeWidth="3.2"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : { pathLength: 1 }}
            transition={{ pathLength: { duration: 1.2, ease: "easeInOut" } }}
            style={{ originX: "50px", originY: "82px" }}
          />

          {/* 2. Folhas orgânicas realistas coladas no talo com rotação controlada */}
          {[
            { d: "M50 72 C36 71 28 62 26 66 C28 72 38 76 50 73 Z", delay: 0.5, rotate: -8, originY: "72px" },
            { d: "M50 64 C64 63 72 54 74 58 C72 64 62 68 50 65 Z", delay: 0.8, rotate: 8, originY: "64px" }
          ].map((leaf, i) => (
            <motion.path
              key={`leaf-${i}`}
              d={leaf.d}
              fill="url(#roseLeaf)"
              initial={{ scale: 0, opacity: 0, rotate: leaf.rotate }}
              animate={inView ? { scale: 1, opacity: 1, rotate: [leaf.rotate, leaf.rotate + 2, leaf.rotate] } : { scale: 1, opacity: 1, rotate: leaf.rotate }}
              transition={{ 
                scale: { delay: leaf.delay, duration: 0.8, ease: "easeOut" },
                rotate: { repeat: Infinity, duration: 5 + i * 2, ease: "easeInOut" }
              }}
              style={{ originX: "50px", originY: leaf.originY }}
            />
          ))}

          {/* 3. Cálice / Base de sustentação (Sépala) */}
          <motion.path
            d="M42 54 C45 60 55 60 58 54 C54 52 46 52 42 54 Z"
            fill="#0f5132"
            initial={{ scale: 0, opacity: 0 }}
            animate={inView ? { scale: 1, opacity: 1 } : { scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
            style={{ originX: "50px", originY: "54px" }}
          />

          {/* 4. Pétalas Traseiras de Fundo (Camada 1) */}
          {[
            { d: "M50 52 C35 25 35 12 50 12 C65 12 65 25 50 52 Z", delay: 0.6, rotate: 0 },
            { d: "M50 52 C28 42 20 20 44 14 C54 10 52 30 50 52 Z", delay: 0.7, rotate: -12 },
            { d: "M50 52 C72 42 80 20 56 14 C46 10 48 30 50 52 Z", delay: 0.8, rotate: 12 }
          ].map((p, idx) => (
            <motion.path
              key={`back-petal-${idx}`}
              d={p.d}
              fill="url(#roseRed)"
              initial={{ scale: 0, opacity: 0, rotate: p.rotate }}
              animate={inView ? { 
                scale: 1, 
                opacity: 0.95,
                rotate: [p.rotate, p.rotate + 1.5, p.rotate - 1.5, p.rotate]
              } : { scale: 1, opacity: 0.95, rotate: p.rotate }}
              transition={{ 
                scale: { delay: p.delay, duration: 1.0, ease: "easeOut" },
                rotate: { repeat: Infinity, duration: 8 + idx, ease: "easeInOut" },
                opacity: { delay: p.delay, duration: 0.6 }
              }}
              style={{ originX: "50px", originY: "52px" }}
            />
          ))}

          {/* 5. Pétalas Intermediárias (Camada 2) */}
          {[
            { d: "M50 52 C24 45 22 28 41 22 C48 19 50 32 50 52 Z", delay: 1.0, rotate: -8 },
            { d: "M50 52 C76 45 78 28 59 22 C52 19 50 32 50 52 Z", delay: 1.1, rotate: 8 },
            { d: "M28 38 C28 54 72 54 72 38 C62 29 38 29 28 38 Z", delay: 1.2, rotate: 0 }
          ].map((p, idx) => (
            <motion.path
              key={`mid-petal-heavy-${idx}`}
              d={p.d}
              fill="url(#roseRed)"
              initial={{ scale: 0, opacity: 0, rotate: p.rotate }}
              animate={inView ? { 
                scale: 1, 
                opacity: 0.98,
                rotate: [p.rotate, p.rotate + 1, p.rotate - 1, p.rotate]
              } : { scale: 1, opacity: 0.98, rotate: p.rotate }}
              transition={{ 
                scale: { delay: p.delay, duration: 1.0, ease: "easeOut" },
                rotate: { repeat: Infinity, duration: 7 + idx, ease: "easeInOut" },
                opacity: { delay: p.delay, duration: 0.6 }
              }}
              style={{ originX: "50px", originY: "52px" }}
            />
          ))}

          {/* 6. Pétalas Médias Superpostas (Camada 3) */}
          {[
            { d: "M50 50 C34 41 32 30 43 25 C48 22 49 33 50 50 Z", delay: 1.4, rotate: -5 },
            { d: "M50 50 C66 41 68 30 57 25 C52 22 51 33 50 50 Z", delay: 1.5, rotate: 5 },
            { d: "M34 42 C34 50 66 50 66 42 C58 36 42 36 34 42 Z", delay: 1.6, rotate: 0 }
          ].map((p, idx) => (
            <motion.path
              key={`mid-petal-light-${idx}`}
              d={p.d}
              fill="url(#roseRed)"
              initial={{ scale: 0, opacity: 0, rotate: p.rotate }}
              animate={inView ? { 
                scale: 1, 
                opacity: 1,
                rotate: [p.rotate, p.rotate + 1, p.rotate - 1, p.rotate]
              } : { scale: 1, opacity: 1, rotate: p.rotate }}
              transition={{ 
                scale: { delay: p.delay, duration: 0.9, ease: "easeOut" },
                rotate: { repeat: Infinity, duration: 6 + idx, ease: "easeInOut" },
                opacity: { delay: p.delay, duration: 0.6 }
              }}
              style={{ originX: "50px", originY: "50px" }}
            />
          ))}

          {/* 7. Pétalas Próximas ao Botão (Camada 4) */}
          {[
            { d: "M50 49 C38 43 35 34 45 29 C49 27 50 35 50 49 Z", delay: 1.8, rotate: -3 },
            { d: "M50 49 C62 43 65 34 55 29 C51 27 50 35 50 49 Z", delay: 1.9, rotate: 3 },
            { d: "M39 42 C39 48 61 48 61 42 C55 38 45 38 39 42 Z", delay: 2.0, rotate: 0 }
          ].map((p, idx) => (
            <motion.path
              key={`inner-petal-${idx}`}
              d={p.d}
              fill="url(#roseCore)"
              initial={{ scale: 0, opacity: 0, rotate: p.rotate }}
              animate={inView ? { 
                scale: 1, 
                opacity: 1,
                rotate: [p.rotate, p.rotate + 0.5, p.rotate - 0.5, p.rotate]
              } : { scale: 1, opacity: 1, rotate: p.rotate }}
              transition={{ 
                scale: { delay: p.delay, duration: 0.8, ease: "easeOut" },
                rotate: { repeat: Infinity, duration: 5 + idx, ease: "easeInOut" },
                opacity: { delay: p.delay, duration: 0.6 }
              }}
              style={{ originX: "50px", originY: "49px" }}
            />
          ))}

          {/* 8. Botão Central de Enrolamento (Formato Espiral / Coração Interno) */}
          {[
            { d: "M45 38 C45 30 51 30 52 38 C52 42 47 42 46 38", delay: 2.2 },
            { d: "M55 38 C55 30 49 30 48 38 C48 42 53 42 54 38", delay: 2.3 }
          ].map((spiral, idx) => (
            <motion.path
              key={`spiral-${idx}`}
              d={spiral.d}
              fill="none"
              stroke="url(#roseCore)"
              strokeWidth="3.4"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={inView ? { 
                pathLength: 1, 
                opacity: 1 
              } : { pathLength: 1, opacity: 1 }}
              transition={{ 
                pathLength: { delay: spiral.delay, duration: 1.0, ease: "easeInOut" },
                opacity: { delay: spiral.delay, duration: 0.4 }
              }}
            />
          ))}
        </g>
      </svg>
    </motion.div>
  );
});

const DayNightIcon = React.memo(({ inView = true }: { inView?: boolean }) => {
  return (
    <motion.div
      key="daynight"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      style={{ transform: 'translateZ(0)' }}
      className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-full"
    >
      {/* Céu Dinâmico com Gradiente */}
      <motion.div
        animate={inView ? {
          background: [
            "linear-gradient(to bottom, #fdba74, #fb923c)", // Amanhecer
            "linear-gradient(to bottom, #38bdf8, #0ea5e9)", // Dia
            "linear-gradient(to bottom, #818cf8, #4f46e5)", // Entardecer
            "linear-gradient(to bottom, #1e1b4b, #020617)", // Noite
            "linear-gradient(to bottom, #fdba74, #fb923c)"  // Volta ao Amanhecer
          ]
        } : { background: "linear-gradient(to bottom, #38bdf8, #0ea5e9)" }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 z-0"
      />

      {/* Brilho Atmosférico (Glow) */}
      <motion.div
        animate={inView ? {
          opacity: [0.4, 0.2, 0.5, 0.3, 0.4],
          scale: [1, 1.2, 1, 1.1, 1]
        } : { opacity: 0.3, scale: 1 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 z-1 bg-white/10 blur-2xl"
      />

      {/* Sol Detalhado */}
      <motion.div
        animate={inView ? {
          y: [30, -15, -15, 30, 30],
          x: [-25, 0, 0, 25, -25],
          opacity: [0, 1, 1, 0, 0],
          rotate: [0, 360]
        } : { y: -15, x: 0, opacity: 1, rotate: 0 }}
        transition={{ 
          y: { duration: 12, repeat: Infinity, times: [0, 0.2, 0.4, 0.5, 1], ease: "easeInOut" },
          x: { duration: 12, repeat: Infinity, times: [0, 0.2, 0.4, 0.5, 1], ease: "easeInOut" },
          opacity: { duration: 12, repeat: Infinity, times: [0, 0.15, 0.45, 0.55, 1] },
          rotate: { duration: 20, repeat: Infinity, ease: "linear" }
        }}
        className="absolute z-10 flex items-center justify-center"
      >
        {/* Núcleo do Sol */}
        <div className="w-5 h-5 md:w-6 md:h-6 bg-yellow-300 rounded-full shadow-[0_0_20px_#facc15,0_0_40px_#fbbf24]" />
        
        {/* Raios do Sol */}
        {[...Array(8)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-8 md:h-10 bg-gradient-to-t from-transparent via-yellow-200/40 to-transparent rounded-full"
            style={{ transform: `rotate(${i * 45}deg)` }}
          />
        ))}
      </motion.div>

      {/* Lua Detalhada (Crescente) */}
      <motion.div
        animate={inView ? {
          y: [30, 30, 30, -15, 30],
          x: [25, 25, -25, 0, 25],
          opacity: [0, 0, 0, 1, 0],
          rotate: [-30, -30, -30, 0, -30]
        } : { y: 30, x: 25, opacity: 0, rotate: -30 }}
        transition={{ 
          y: { duration: 12, repeat: Infinity, times: [0, 0.5, 0.6, 0.8, 1], ease: "easeInOut" },
          x: { duration: 12, repeat: Infinity, times: [0, 0.5, 0.6, 0.8, 1], ease: "easeInOut" },
          opacity: { duration: 12, repeat: Infinity, times: [0, 0.55, 0.65, 0.9, 1] }
        }}
        className="absolute z-10 flex items-center justify-center"
      >
        <svg viewBox="0 0 100 100" className="w-5 h-5 md:w-6 md:h-6 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
          <path 
            d="M75 50 C75 75 50 90 25 75 C45 75 60 55 60 40 C60 25 45 10 25 15 C50 5 75 25 75 50 Z" 
            fill="#f8fafc" 
          />
          {/* Crateras sutis */}
          <circle cx="65" cy="45" r="3" fill="#cbd5e1" opacity="0.4" />
          <circle cx="55" cy="65" r="2" fill="#cbd5e1" opacity="0.3" />
        </svg>
      </motion.div>

      {/* Nuvens com Iluminação de Borda */}
      {[0, 1].map((i) => (
        <motion.div
          key={`cloud-${i}`}
          animate={inView ? {
            x: [-40, 40],
            opacity: [0, 0.9, 0.9, 0]
          } : { x: 0, opacity: 0.9 }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            delay: i * 4,
            ease: "linear" 
          }}
          className="absolute z-20"
          style={{ top: i === 0 ? "35%" : "65%" }}
        >
          <div className="relative">
            <motion.div 
              animate={inView ? {
                backgroundColor: [
                  "#fed7aa", // Amanhecer
                  "#ffffff", // Dia
                  "#c7d2fe", // Noite
                  "#fed7aa"
                ]
              } : { backgroundColor: "#ffffff" }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="w-6 h-3 md:w-8 md:h-4 rounded-full blur-[0.5px] shadow-sm" 
            />
            <motion.div 
              animate={inView ? {
                backgroundColor: [
                  "#fed7aa",
                  "#ffffff",
                  "#c7d2fe",
                  "#fed7aa"
                ]
              } : { backgroundColor: "#ffffff" }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 md:w-6 md:h-6 rounded-full -mt-3 md:-mt-4 ml-1 blur-[0.5px]" 
            />
          </div>
        </motion.div>
      ))}

      {/* Estrelas Cintilantes */}
      <motion.div
        animate={inView ? {
          opacity: [0, 0, 0, 1, 0]
        } : { opacity: 0 }}
        transition={{ duration: 12, repeat: Infinity, times: [0, 0.6, 0.7, 0.9, 1] }}
        className="absolute inset-0 z-5"
      >
        {inView && [...Array(8)].map((_, i) => (
          <motion.div 
            key={i} 
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
            className="absolute w-0.5 h-0.5 bg-white rounded-full"
            style={{ 
              top: `${Math.random() * 100}%`, 
              left: `${Math.random() * 100}%`
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
});

const FinanceHealthIcon = React.memo(({ inView = true }: { inView?: boolean }) => {
  const [phase, setPhase] = useState<'graph' | 'plus' | 'dollars' | 'heart' | 'ecg'>('graph');

  useEffect(() => {
    if (!inView) return;
    const timers = [
      setTimeout(() => setPhase('plus'), 5000),
      setTimeout(() => setPhase('dollars'), 8000),
      setTimeout(() => setPhase('heart'), 12000),
      setTimeout(() => setPhase('ecg'), 16000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  return (
    <motion.div
      key="finance-health"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ transform: 'translateZ(0)' }}
      className="relative w-full h-full flex items-center justify-center overflow-visible"
    >
      <AnimatePresence mode="wait">
        {phase === 'graph' && (
          <motion.div
            key="graph"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full h-full flex items-center justify-center"
          >
            {/* Fundo que escurece na explosão */}
            <motion.div 
              animate={inView ? { backgroundColor: ["rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(0,0,0,0.6)", "rgba(0,0,0,0)"] } : { backgroundColor: "rgba(0,0,0,0)" }}
              transition={{ duration: 5, times: [0, 0.4, 0.5, 1] }}
              className="absolute inset-0 z-0"
            />

            {/* Grid de fundo para detalhe */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <div key={`h-${i}`} className="absolute w-full h-px bg-[var(--text)]" style={{ top: `${i * 25}%` }} />
              ))}
              {[...Array(5)].map((_, i) => (
                <div key={`v-${i}`} className="absolute h-full w-px bg-[var(--text)]" style={{ left: `${i * 25}%` }} />
              ))}
            </div>

            {/* Gráfico Detalhado */}
            <svg viewBox="0 0 100 100" className="w-10 h-10 md:w-12 md:h-12 relative z-10">
              <motion.path
                d="M10 85 L25 70 L40 75 L55 50 L70 55 L85 15"
                fill="none"
                stroke="#22c55e"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
              {/* Pontos de dados */}
              {[10, 25, 40, 55, 70, 85].map((x, i) => {
                const y = [85, 70, 75, 50, 55, 15][i];
                return (
                  <motion.circle
                     key={i}
                    cx={x}
                    cy={y}
                    r="1.5"
                    fill="#4ade80"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: (i * 2) / 6, duration: 0.3 }}
                  />
                );
              })}
            </svg>

            {/* Explosão Dinâmica e Lenta - Contida no container */}
            {inView && [...Array(30)].map((_, i) => (
              <motion.div
                key={`firework-star-${i}`}
                initial={{ x: 17, y: -17, scale: 0, opacity: 0 }}
                animate={{ 
                  x: 17 + Math.cos(i * 12 * (Math.PI / 180)) * (20 + Math.random() * 25),
                  y: -17 + Math.sin(i * 12 * (Math.PI / 180)) * (20 + Math.random() * 25),
                  scale: [0, 1.2, 0.6, 0],
                  opacity: [0, 1, 1, 0],
                  rotate: [0, 360]
                }}
                transition={{ 
                  delay: 2, 
                  duration: 2.5, 
                  ease: "easeOut" 
                }}
                className="absolute z-20 pointer-events-none"
              >
                {i % 2 === 0 ? (
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ['#facc15', '#ef4444', '#3b82f6', '#22c55e'][i % 4], boxShadow: '0 0 8px currentColor' }} />
                ) : (
                  <span className="material-symbols-outlined text-[10px] text-yellow-200 fill-1" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>star</span>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {phase === 'plus' && (
          <motion.div
            key="plus"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="relative w-full h-full flex items-center justify-center"
          >
            {/* Símbolo de Mais Grosso e em Destaque */}
            <motion.div
              animate={inView ? { 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 90, 0]
              } : { scale: 1, rotate: 0 }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 flex items-center justify-center"
            >
              <div className="w-8 h-2.5 bg-green-500 rounded-full absolute shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
              <div className="w-2.5 h-8 bg-green-500 rounded-full absolute shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
            </motion.div>

            {/* Cifrões Pequenos em Volta */}
            {inView && [...Array(8)].map((_, i) => (
              <motion.div
                key={`small-dollar-${i}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: Math.cos(i * 45 * (Math.PI / 180)) * 25,
                  y: Math.sin(i * 45 * (Math.PI / 180)) * 25,
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  delay: i * 0.2,
                  ease: "easeOut"
                }}
                className="absolute text-[10px] font-bold text-green-400/80"
              >
                $
              </motion.div>
            ))}
          </motion.div>
        )}

        {phase === 'dollars' && (
          <motion.div
            key="dollars"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full h-full flex flex-col-reverse items-center justify-center gap-[-2px]"
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`dollar-${i}`}
                initial={{ y: 30, opacity: 0, rotateX: 45, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, rotateX: 0, scale: 1 }}
                transition={{ delay: i * 0.3, duration: 0.6, ease: "backOut" }}
                className="relative w-10 h-5 md:w-12 md:h-6 bg-[#d1e2d3] border border-[#7a9a7e] rounded-[1px] shadow-md flex items-center justify-center overflow-hidden"
                style={{ zIndex: i }}
              >
                {/* Micro detalhes do Dólar */}
                <div className="absolute inset-[1px] border border-[#a3bfa7] opacity-40" />
                <div className="absolute left-1 top-1 text-[4px] text-[#4a674e] font-serif leading-none">1</div>
                <div className="absolute right-1 top-1 text-[4px] text-[#4a674e] font-serif leading-none">1</div>
                <div className="absolute left-1 bottom-1 text-[4px] text-[#4a674e] font-serif leading-none">1</div>
                <div className="absolute right-1 bottom-1 text-[4px] text-[#4a674e] font-serif leading-none">1</div>
                
                {/* Oval do Retrato */}
                <div className="w-3 h-4 border border-[#7a9a7e] rounded-full flex items-center justify-center bg-[#c2d6c4]">
                  <div className="w-2 h-2.5 bg-[#4a674e]/20 rounded-full" />
                </div>
                
                {/* Selos e Textos */}
                <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border border-[#4a674e]/30 rounded-full" />
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border border-[#4a674e]/30 rounded-full" />
                
                {/* Linhas de texto micro */}
                <div className="absolute bottom-1 w-6 h-[1px] bg-[#4a674e]/20" />
                <div className="absolute top-1 w-4 h-[1px] bg-[#4a674e]/20" />
                
                {/* Brilho de cédula nova */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
              </motion.div>
            ))}
          </motion.div>
        )}

        {phase === 'heart' && (
          <motion.div
            key="heart"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="relative flex items-center justify-center overflow-visible"
          >
            <motion.div
              animate={inView ? { 
                scale: [1, 1.15, 1, 1.15, 1],
                filter: ["brightness(1)", "brightness(1.2)", "brightness(1)", "brightness(1.2)", "brightness(1)"]
              } : { scale: 1 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
              className="relative flex items-center justify-center overflow-visible"
            >
              {/* Coração Totalmente Preenchido e Pulsante */}
              <svg viewBox="0 0 24 24" className="w-8 h-8 md:w-9 md:h-9 drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]">
                <path 
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                  fill="#ef4444"
                />
              </svg>

              {/* Efeito de "coçar" (partículas de energia) */}
              {inView && [0, 1, 2, 3].map((i) => (
                <motion.div
                  key={`heart-glow-${i}`}
                  animate={{ 
                    opacity: [0, 0.8, 0],
                    scale: [0, 1.5, 0],
                    x: (i % 2 === 0 ? -1 : 1) * (15 + Math.random() * 10),
                    y: (i < 2 ? -1 : 1) * (15 + Math.random() * 10)
                  }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
                  className="absolute w-1.5 h-1.5 bg-red-400 rounded-full blur-[1px]"
                />
              ))}
            </motion.div>
          </motion.div>
        )}

        {phase === 'ecg' && (
          <motion.div
            key="ecg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full h-full flex items-center justify-center"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <motion.path
                d="M0 50 L30 50 L35 30 L40 70 L45 50 L70 50 L75 20 L80 80 L85 50 L100 50"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                initial={{ pathLength: 0, x: -100 }}
                animate={inView ? { 
                  pathLength: [0, 1, 1],
                  x: [-100, 0, 100]
                } : { pathLength: 1, x: 0 }}
                transition={{ 
                   duration: 3, 
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              {/* Brilho do pulso */}
              <motion.circle
                r="2"
                fill="#ef4444"
                animate={inView ? {
                  cx: [0, 100],
                  cy: [50, 50, 30, 70, 50, 50, 20, 80, 50, 50],
                  opacity: [0, 1, 1, 0]
                } : { cx: 50, cy: 50, opacity: 0 }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

const MagicIcon = () => {
  const [ref, inView] = useInView();
  const [mode, setMode] = useState<'stars' | 'eyes' | 'rose' | 'beckoning' | 'daynight' | 'financeHealth' | 'jet'>('stars');
  const [expressionIndex, setExpressionIndex] = useState(0);
  
  // Definição de 20 expressões faciais únicas
  const expressions = [
    { name: 'Happy', browY: -2, browRotate: 10, eyeScaleY: 1, mouthScaleX: 1.2, mouthScaleY: 1, mouthY: 0, blush: 0.6, headRotate: 5 },
    { name: 'Surprised', browY: -5, browRotate: 0, eyeScaleY: 1.2, mouthScaleX: 0.8, mouthScaleY: 1.5, mouthY: 2, blush: 0.2, headRotate: 0 },
    { name: 'Thinking', browY: -1, browRotate: -5, eyeScaleY: 0.8, mouthScaleX: 0.6, mouthScaleY: 0.4, mouthY: 0, blush: 0.1, headRotate: -10 },
    { name: 'Wink', browY: -2, browRotate: 5, eyeScaleY: 1, mouthScaleX: 1.1, mouthScaleY: 0.8, mouthY: -1, blush: 0.5, headRotate: 8 },
    { name: 'Curious', browY: -4, browRotate: 15, eyeScaleY: 1, mouthScaleX: 0.9, mouthScaleY: 0.6, mouthY: 0, blush: 0.3, headRotate: 12 },
    { name: 'Excited', browY: -3, browRotate: 20, eyeScaleY: 1.1, mouthScaleX: 1.5, mouthScaleY: 1.2, mouthY: -2, blush: 0.8, headRotate: -5 },
    { name: 'Skeptical', browY: 0, browRotate: -10, eyeScaleY: 0.7, mouthScaleX: 1, mouthScaleY: 0.3, mouthY: 1, blush: 0, headRotate: 5 },
    { name: 'Shy', browY: -1, browRotate: 5, eyeScaleY: 0.9, mouthScaleX: 0.8, mouthScaleY: 0.5, mouthY: 0, blush: 1, headRotate: -8 },
    { name: 'Playful', browY: -3, browRotate: -15, eyeScaleY: 1, mouthScaleX: 1.3, mouthScaleY: 0.9, mouthY: -1, blush: 0.6, headRotate: 15 },
    { name: 'Bored', browY: 1, browRotate: 0, eyeScaleY: 0.5, mouthScaleX: 1.1, mouthScaleY: 0.2, mouthY: 2, blush: 0, headRotate: 0 },
    { name: 'Awe', browY: -6, browRotate: 0, eyeScaleY: 1.3, mouthScaleX: 0.7, mouthScaleY: 1.8, mouthY: 3, blush: 0.4, headRotate: -5 },
    { name: 'Grin', browY: -2, browRotate: 10, eyeScaleY: 0.9, mouthScaleX: 1.6, mouthScaleY: 0.7, mouthY: -2, blush: 0.5, headRotate: 10 },
    { name: 'Focused', browY: 2, browRotate: -5, eyeScaleY: 0.4, mouthScaleX: 0.7, mouthScaleY: 0.3, mouthY: 0, blush: 0, headRotate: 0 },
    { name: 'Mischievous', browY: -1, browRotate: -20, eyeScaleY: 0.8, mouthScaleX: 1.4, mouthScaleY: 0.5, mouthY: -1, blush: 0.4, headRotate: -12 },
    { name: 'Content', browY: -2, browRotate: 5, eyeScaleY: 0.6, mouthScaleX: 1, mouthScaleY: 0.4, mouthY: 0, blush: 0.3, headRotate: 5 },
    { name: 'Dazzled', browY: -5, browRotate: 10, eyeScaleY: 1.2, mouthScaleX: 1.2, mouthScaleY: 1.4, mouthY: 1, blush: 0.7, headRotate: -8 },
    { name: 'Cool', browY: -1, browRotate: 0, eyeScaleY: 0.7, mouthScaleX: 1.2, mouthScaleY: 0.2, mouthY: 0, blush: 0, headRotate: 10 },
    { name: 'Sleepy', browY: 0, browRotate: 0, eyeScaleY: 0.1, mouthScaleX: 0.8, mouthScaleY: 0.3, mouthY: 1, blush: 0.1, headRotate: 0 },
    { name: 'Determined', browY: 2, browRotate: -15, eyeScaleY: 0.8, mouthScaleX: 0.9, mouthScaleY: 0.4, mouthY: 0, blush: 0.2, headRotate: 0 },
    { name: 'Whistling', browY: -3, browRotate: 5, eyeScaleY: 1, mouthScaleX: 0.3, mouthScaleY: 0.3, mouthY: 1, blush: 0.3, headRotate: 10 }
  ];

  useEffect(() => {
    if (!inView) return;
    const modeInterval = setInterval(() => {
      setMode(prev => {
        if (prev === 'stars') return 'eyes';
        if (prev === 'eyes') return 'rose';
        if (prev === 'rose') return 'beckoning';
        if (prev === 'beckoning') return 'daynight';
        if (prev === 'daynight') return 'financeHealth';
        if (prev === 'financeHealth') return 'jet';
        return 'stars';
      });
    }, 20000); // Aumentado para 20s para acomodar a nova sequência longa de 5 fases de 4s cada
    
    const expressionInterval = setInterval(() => {
      setExpressionIndex(prev => (prev + 1) % expressions.length);
    }, 3000);

    return () => {
      clearInterval(modeInterval);
      clearInterval(expressionInterval);
    };
  }, [expressions.length, inView]);

  const current = expressions[expressionIndex];

  return (
    <div ref={ref} className="relative flex items-center justify-center w-full h-full scale-[0.75] md:scale-100">
      <AnimatePresence mode="wait">
        {mode === 'stars' && (
          <motion.div
            key="stars"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: [1, 1.05, 1] } : { opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 1 }}
            className="flex items-center justify-center"
          >
            <motion.span
              animate={inView ? { 
                filter: [`drop-shadow(0 0 0px var(--text))`, `drop-shadow(0 0 10px var(--text))`, `drop-shadow(0 0 0px var(--text))`],
                rotate: [0, 5, -5, 0]
              } : { filter: `drop-shadow(0 0 0px var(--text))`, rotate: 0 }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="material-symbols-outlined text-[var(--text)] text-base md:text-lg"
            >
              auto_awesome
            </motion.span>
          </motion.div>
        )}

        {mode === 'rose' && <RoseIcon inView={inView} />}
        
        {mode === 'daynight' && <DayNightIcon inView={inView} />}
        
        {mode === 'financeHealth' && <FinanceHealthIcon inView={inView} />}

        {mode === 'jet' && (
          <motion.div
            key="jet"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 2 }}
            className="flex items-center justify-center"
          >
            <AnimatedRocket color="var(--text)" sizeForSidebar={true} />
          </motion.div>
        )}

        {mode === 'eyes' && (
          <motion.div
            key="eyes"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { 
              opacity: 1,
              scale: 1,
              rotate: current.headRotate,
              y: current.name === 'Thinking' ? -1 : 0
            } : { opacity: 1, scale: 1, rotate: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8, ease: "backOut" }}
            className="flex flex-col items-center justify-center gap-0.5 relative"
          >
            {/* Sobrancelhas */}
            <div className="absolute -top-1.5 flex justify-between w-9 px-0.5 z-20">
              {[0, 1].map((i) => (
                <motion.div
                  key={i}
                  animate={inView ? { 
                    y: current.browY, 
                    rotate: i === 0 ? -current.browRotate : current.browRotate,
                  } : { y: 0, rotate: 0 }}
                  transition={{ duration: 0.5, ease: "circOut" }}
                  className="w-2.5 h-0.5 bg-[var(--text)]/40 rounded-full"
                />
              ))}
            </div>

            {/* Blush */}
            <motion.div
              animate={inView ? {
                opacity: current.blush,
                scale: current.blush > 0 ? 1 : 0.5
              } : { opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute top-1 flex justify-between w-9 px-0.5 pointer-events-none"
            >
              <div className="w-2 h-1.5 bg-pink-500/30 blur-[3px] rounded-full" />
              <div className="w-2 h-1.5 bg-pink-500/30 blur-[3px] rounded-full" />
            </motion.div>

            {/* Olhos */}
            <div className="flex gap-1.5 items-center justify-center z-10">
              {[0, 1].map((i) => (
                <div key={i} className="relative w-3.5 h-2 md:w-4 md:h-2.5 bg-[var(--text)]/5 rounded-full border border-[var(--border)] overflow-hidden flex items-center justify-center">
                  <motion.div 
                    animate={inView ? { 
                      scaleY: (current.name === 'Wink' && i === 1) ? 1 : (1 - current.eyeScaleY) 
                    } : { scaleY: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-[var(--surface-hover)] z-10 origin-top"
                  />
                  <motion.div 
                    animate={inView ? { 
                      scaleY: (current.name === 'Wink' && i === 1) ? 1 : (1 - current.eyeScaleY)
                    } : { scaleY: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-[var(--surface-hover)] z-10 origin-bottom"
                  />
                  <motion.div
                    animate={inView ? { 
                      scale: current.eyeScaleY > 1 ? 1.1 : 0.9,
                      x: current.name === 'Curious' ? (i === 0 ? 1 : 2) : 0
                    } : { scale: 1, x: 0 }}
                    className="w-1 h-1 md:w-1.5 md:h-1.5 bg-[var(--text)] rounded-full shadow-[0_0_5px_rgba(var(--primary-rgb),0.5)]"
                  />
                </div>
              ))}
            </div>
            
            {/* Boca / Sorriso */}
            <motion.div
              animate={inView ? {
                scaleX: current.mouthScaleX,
                scaleY: current.mouthScaleY,
                y: current.mouthY,
                borderRadius: current.name === 'Whistling' ? '50%' : '0 0 16px 16px'
              } : { scaleX: 1, scaleY: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "backOut" }}
              className={`w-4 h-1.5 border-b-2 border-[var(--text)]/70 shadow-[0_3px_8px_rgba(0,0,0,0.1)]`}
            />
          </motion.div>
        )}

        {mode === 'beckoning' && (
          <motion.div
            key="beckoning"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { 
              opacity: 1, 
              scale: 1,
              y: [0, 0, 2, 0] // Leve "suspiro" no final (tédio)
            } : { opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center justify-center gap-0.5 relative"
          >
            {/* Sobrancelhas (Neutro -> Sério -> Tédio) */}
            <div className="absolute -top-2 flex justify-between w-10 px-0.5 z-20">
              {[0, 1].map((i) => (
                <motion.div
                  key={i}
                  animate={inView ? { 
                    y: [
                      -4, // Neutro
                      -4, 
                      -2, // Sério (baixando)
                      -2, 
                      -3, // Tédio (relaxado)
                      -3
                    ],
                    rotate: [
                      0, // Neutro
                      0, 
                      i === 0 ? -15 : 15, // Sério (franzindo)
                      i === 0 ? -15 : 15,
                      i === 0 ? 5 : -5, // Tédio (caído)
                      i === 0 ? 5 : -5
                    ]
                  } : { y: -3, rotate: 0 }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 9, 
                    times: [0, 0.3, 0.35, 0.6, 0.65, 1],
                    ease: "easeInOut"
                  }}
                  className="w-3.5 h-0.5 bg-[var(--text)]/50 rounded-full"
                />
              ))}
            </div>

            {/* Olhos (Neutro -> Sério -> Tédio) */}
            <div className="flex gap-2 items-center justify-center z-10">
              {[0, 1].map((i) => (
                <div key={i} className="relative w-4 h-2.5 bg-[var(--text)]/5 rounded-full border border-[var(--border)] overflow-hidden flex items-center justify-center">
                  {/* Pálpebras para Tédio/Sério */}
                  <motion.div 
                    animate={inView ? { 
                      scaleY: [
                        0, // Neutro
                        0, 
                        0.2, // Sério (levemente semicerrado)
                        0.2, 
                        0.6, // Tédio (bem semicerrado)
                        0.6
                      ]
                    } : { scaleY: 0.1 }}
                    transition={{ repeat: Infinity, duration: 9, times: [0, 0.3, 0.35, 0.6, 0.65, 1] }}
                    className="absolute inset-0 bg-[var(--surface-hover)] z-10 origin-top"
                  />
                  <motion.div
                    animate={inView ? { 
                      scale: [
                        1, // Neutro
                        1, 
                        0.8, // Sério (foco)
                        0.8, 
                        1, // Tédio (desfocado)
                        1
                      ],
                      y: [
                        0, 
                        0, 
                        0, 
                        0, 
                        1, // Tédio (olhando levemente para baixo)
                        1
                      ]
                    } : { scale: 1, y: 0 }}
                    transition={{ repeat: Infinity, duration: 9, times: [0, 0.3, 0.35, 0.6, 0.65, 1] }}
                    className="w-1.5 h-1.5 bg-[var(--text)] rounded-full shadow-[0_0_5px_rgba(var(--primary-rgb),0.8)]"
                  />
                </div>
              ))}
            </div>

            {/* Boca (Neutro -> Sério -> Tédio) */}
            <motion.div
              animate={inView ? {
                scaleX: [
                  1, // Neutro
                  1, 
                  0.7, // Sério (boca apertada)
                  0.7, 
                  1.2, // Tédio (boca relaxada/larga)
                  1.2
                ],
                scaleY: [
                  0.2, // Neutro
                  0.2, 
                  0.1, // Sério
                  0.1, 
                  0.1, // Tédio
                  0.1
                ],
                y: [
                  0, 
                  0, 
                  0, 
                  0, 
                  1, // Tédio (levemente caída)
                  1
                ]
              } : { scaleX: 1, scaleY: 0.2, y: 0 }}
              transition={{ repeat: Infinity, duration: 9, times: [0, 0.3, 0.35, 0.6, 0.65, 1] }}
              className="w-5 h-1.5 border-b-2 border-[var(--text)]/60 rounded-[0_0_10px_10px]"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onBack, theme, onToggleTheme, onToggleSidebar, categories, transactions, onRefreshCategories }) => {
  const [data, setData] = useState(fakeDB.getAll());
  const [objectives, setObjectives] = useState(fakeDB.objectives);

  useOrganismSync(undefined, React.useCallback(() => {
    setData(fakeDB.getAll());
    setObjectives(fakeDB.objectives);
  }, []));

  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string | null>(null);
  const [centralInitialView, setCentralInitialView] = useState<'dashboard' | 'manager' | 'manifestation' | 'goals-overview'>('dashboard');
  const [centralOpenMeta, setCentralOpenMeta] = useState(false);
  const [centralOpenTask, setCentralOpenTask] = useState(false);
  const [centralMetaId, setCentralMetaId] = useState<string | undefined>(undefined);
  const [selectedObjectiveForTaskUnit, setSelectedObjectiveForTaskUnit] = useState<any | null>(null);
  const [objectiveSelectPurpose, setObjectiveSelectPurpose] = useState<'meta' | 'task' | null>(null);
  const [bgVersion, setBgVersion] = useState(0);

  // Sync backgrounds with Central de Comando
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail?.page === 'objectives') {
        setBgVersion(v => v + 1);
      }
    };
    
    const handleBackendError = (e: any) => {
      alert(`[ERRO DE SINCRONIZAÇÃO]\n${e?.message || e?.detail?.message || 'Falha na comunicação com o servidor.'}`);
    };
    
    const handleReSync = () => {
      setData(fakeDB.getAll());
      setObjectives(fakeDB.objectives);
    };
    
    window.addEventListener('backgrounds-updated', handleUpdate);
    const unsubscribeError = organismEventBus.subscribe('backendError', handleBackendError);
    const unsubscribeSync = organismEventBus.subscribe('goalUpdated', handleReSync);
    const unsubscribeReset = organismEventBus.subscribe('systemReset', handleReSync);
    
    return () => {
      window.removeEventListener('backgrounds-updated', handleUpdate);
      unsubscribeError();
      unsubscribeSync();
      unsubscribeReset();
    };
  }, []);

  // Sync backgrounds strictly with Central de Comando (Experience session)
  const allBackgroundImages = useMemo(() => {
    return backgroundService.getImages('objectives');
  }, [bgVersion]);

  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % allBackgroundImages.length);
    }, 10000); // Slightly faster rotation for "reverberation" feel
    return () => clearInterval(timer);
  }, [allBackgroundImages.length]);

  const [greeting, setGreeting] = useState('');
  const [showFoco, setShowFoco] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>(() => {
    const saved = safeLocalStorage.getItem('objectivesViewMode');
    return (saved as 'carousel' | 'grid') || 'grid';
  });
  const [lottieData, setLottieData] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeHeaderSlide, setActiveHeaderSlide] = useState(1);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'week' | 'insights' | 'patterns' | 'amparadora' | 'important'>('all');
  const [expandedNotifId, setExpandedNotifId] = useState<any>(null);
  const [likedNotifIds, setLikedNotifIds] = useState<string[]>(() => {
    try {
      const saved = safeLocalStorage.getItem('liked_notif_ids');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [reverberatedNotifIds, setReverberatedNotifIds] = useState<string[]>(() => {
    try {
      const saved = safeLocalStorage.getItem('reverberated_notif_ids');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [pinnedNotifIds, setPinnedNotifIds] = useState<string[]>(() => {
    try {
      const saved = safeLocalStorage.getItem('pinned_notif_ids');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [notifComments, setNotifComments] = useState<Record<string, string[]>>(() => {
    try {
      const saved = safeLocalStorage.getItem('notif_comments');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [visibleNotifCount, setVisibleNotifCount] = useState<number>(4);

  const toggleLikeNotif = (id: string) => {
    const next = likedNotifIds.includes(id) ? likedNotifIds.filter(x => x !== id) : [...likedNotifIds, id];
    setLikedNotifIds(next);
    safeLocalStorage.setItem('liked_notif_ids', JSON.stringify(next));
    if (typeof haptics !== 'undefined') haptics.lightClick();
  };
  const toggleReverberateNotif = (id: string) => {
    const next = reverberatedNotifIds.includes(id) ? reverberatedNotifIds.filter(x => x !== id) : [...reverberatedNotifIds, id];
    setReverberatedNotifIds(next);
    safeLocalStorage.setItem('reverberated_notif_ids', JSON.stringify(next));
    if (typeof haptics !== 'undefined') haptics.success();
  };
  const togglePinNotif = (id: string) => {
    const next = pinnedNotifIds.includes(id) ? pinnedNotifIds.filter(x => x !== id) : [...pinnedNotifIds, id];
    setPinnedNotifIds(next);
    safeLocalStorage.setItem('pinned_notif_ids', JSON.stringify(next));
    if (typeof haptics !== 'undefined') haptics.lightClick();
  };
  const addNotifComment = (id: string, text: string) => {
    if (!text.trim()) return;
    const next = { ...notifComments, [id]: [...(notifComments[id] || []), text] };
    setNotifComments(next);
    safeLocalStorage.setItem('notif_comments', JSON.stringify(next));
    if (typeof haptics !== 'undefined') haptics.success();
  };

  const [registeredEvMinutes, setRegisteredEvMinutes] = useState<number | null>(null);
  const [vectorCalibrated, setVectorCalibrated] = useState(false);
  const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);
  const [financeTab, setFinanceTab] = useState<'income' | 'expense' | 'categories'>('expense');
  const [weather, setWeather] = useState<{ 
    temp: number; 
    condition: string; 
    icon: React.ReactNode;
    humidity?: number;
    windSpeed?: number;
    city?: string;
    sunrise?: string;
    sunset?: string;
  } | null>(null);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Lottie data with robust error handling and fallback
  useEffect(() => {
    const loadLottie = async (url: string, isFallback = false) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        try {
          const json = JSON.parse(text);
          setLottieData(json);
        } catch (parseError) {
          throw new Error('Response is not valid JSON');
        }
      } catch (err) {
        if (!isFallback) {
          loadLottie(FALLBACK_LOTTIE_URL, true);
        } else {
          console.warn('Failed to load any Lottie animation for ProjectsPage');
        }
      }
    };

    loadLottie(HEADER_LOTTIE_URL);
  }, []);

  // Update greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Olá, bom dia, Douglas.');
    else if (hour >= 12 && hour < 18) setGreeting('Olá, boa tarde, Douglas.');
    else if (hour >= 18 && hour <= 23) setGreeting('Olá, boa noite, Douglas.');
    else setGreeting('Olá, boa madrugada, Douglas.');
  }, []);

  // Foco cycle: Starts with FOCO (10s), then greeting (15s)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const startCycle = () => {
      // 1. Start by showing FOCO (initial state is true)
      // Wait 10 seconds BEFORE switching to greeting
      timeoutId = setTimeout(() => {
        setShowFoco(false);
        
        // 2. While showing Greeting
        // Wait 15 seconds BEFORE switching back to FOCO
        timeoutId = setTimeout(() => {
          setShowFoco(true);
          startCycle(); // Re-run
        }, 15000);
      }, 10000);
    };

    startCycle();
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Weather integration
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        // Fetch Weather with Sunrise/Sunset
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=sunrise,sunset&timezone=auto`);
        const weatherData = await weatherRes.json();
        
        // Fetch City Name (Reverse Geocoding)
        const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt`);
        const geoData = await geoRes.json();
        
        const { temperature, weathercode, windspeed } = weatherData.current_weather;
        const sunrise = weatherData.daily.sunrise[0].split('T')[1];
        const sunset = weatherData.daily.sunset[0].split('T')[1];
        
        // Map weathercode to description and icon
        let condition = 'Limpo';
        let icon = <Sun size={14} className="text-amber-400" />;
        
        if (weathercode >= 1 && weathercode <= 3) {
          condition = 'Nublado';
          icon = <Cloud size={14} className="text-gray-400" />;
        } else if (weathercode >= 45 && weathercode <= 48) {
          condition = 'Nevoeiro';
          icon = <Wind size={14} className="text-gray-300" />;
        } else if (weathercode >= 51 && weathercode <= 67) {
          condition = 'Chuva';
          icon = <CloudRain size={14} className="text-blue-400" />;
        } else if (weathercode >= 71 && weathercode <= 77) {
          condition = 'Neve';
          icon = <CloudSnow size={14} className="text-white" />;
        } else if (weathercode >= 80 && weathercode <= 82) {
          condition = 'Pancadas';
          icon = <CloudRain size={14} className="text-blue-500" />;
        } else if (weathercode >= 95) {
          condition = 'Tempestade';
          icon = <CloudLightning size={14} className="text-yellow-400" />;
        }

        setWeather({ 
          temp: Math.round(temperature), 
          condition, 
          icon,
          windSpeed: Math.round(windspeed),
          city: geoData.city || geoData.locality || 'Localização Atual',
          sunrise,
          sunset
        });
      } catch (err) {
        console.error('Weather fetch error:', err);
      }
    }, (error) => {
      console.warn('Geolocation error:', error.message);
    });
  }, []);

  useEffect(() => {
    safeLocalStorage.setItem('objectivesViewMode', viewMode);
  }, [viewMode]);

  // Sync with fakeDB
  useEffect(() => {
    const interval = setInterval(() => {
      const allData = fakeDB.getAll();
      setData(allData);
      // Only update objectives if the length changed or if we're not dragging
      // For simplicity, we'll just sync the other data
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const navigate = useNavigate();

  const handleNotificationAction = (notif: any) => {
    if (typeof haptics !== 'undefined') haptics.success();
    
    switch (notif.action) {
      case 'Otimizar Fluxo':
        navigate('/amparadora');
        break;
      case 'Sintonizar Frequência':
        navigate('/presences');
        break;
      case 'Registrar Agora':
      case 'Escrever Diário':
        navigate('/diary/new');
        break;
      case 'Analisar Diário':
        navigate('/diary');
        break;
      case 'Definir Objetivo':
        setSelectedObjectiveId('new');
        break;
      case 'Gerenciar Finanças':
      case 'Ajustar Orçamento':
      case 'Analisar Finanças':
        setFinanceTab(notif.action === 'Ajustar Orçamento' ? 'categories' : 'expense');
        setIsFinanceModalOpen(true);
        break;
      case 'Recalibrar Vetor':
        setVectorCalibrated(true);
        import('../services/NotificationService').then(({ notificationService }) => {
          notificationService.notify({
            title: 'Reflexo Estável',
            body: 'Seu vetor existencial foi perfeitamente recalibrado com 100% de estabilidade e alinhamento.',
            type: 'success',
            layout: 'progress',
            data: { value: 100 }
          });
        }).catch(err => console.error(err));
        break;
      case 'Sintonizar Pulso':
      case 'Analisar Alinhamento':
        setExpandedNotifId(expandedNotifId === notif.id ? null : notif.id);
        break;
      default:
        break;
    }
    
    // Do not close notification sidebar if they chose an expand action
    if (notif.action !== 'Sintonizar Pulso' && notif.action !== 'Analisar Alinhamento') {
      setShowNotifications(false);
    }
  };
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
  const [holdingItemId, setHoldingItemId] = useState<string | null>(null);
  const holdTimer = useRef<NodeJS.Timeout | null>(null);

  const handleHoldStart = (id: string) => {
    holdTimer.current = setTimeout(() => {
      setHoldingItemId(id);
    }, 800);
  };

  const handleHoldEnd = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    setHoldingItemId(null);
  };

  const handleDeleteObjective = (id: string) => {
    fakeDB.deleteObjective(id);
    setObjectives(fakeDB.objectives);
    setData(fakeDB.getAll());
    setItemToDelete(null);
  };

  // State for secondary creation modals
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskExecutionType, setTaskExecutionType] = useState<'standard' | 'energy-work'>('standard');
  const [isAddingMeta, setIsAddingMeta] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isAddingQuickNote, setIsAddingQuickNote] = useState(false);

  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [selectedObjectiveIdForMetaOrTask, setSelectedObjectiveIdForMetaOrTask] = useState<string>('');

  // Energy Work Execution Modal for Task completion
  const DEFAULT_SENSATIONS = [
    'Parestesia', 'Calafrio benigno', 'Vassouramento energético', 'Presença amparadora', 
    'Expansibilidade', 'Balonamento', 'Mini-decolagem', 'EV espontâneo', 'Sonoridades intracranianas',
    'Vibração', 'Calor', 'Frio', 'Leveza', 'Expansão', 'Pulsação', 'Formigamento'
  ];

  const DEFAULT_PHENOMENA = [
    'Absorção de Energia', 'Exteriorização de Energia', 'Estado Vibracional (EV)', 
    'Projeção Lúcida', 'Clarividência Espontânea', 'Intuição Amparadora', 'Acoplamento Áurico',
    'Clarividência', 'Projeção', 'Pangrafia', 'Psicometria', 'Autofania'
  ];

  const DEFAULT_FATUISTICA = [
    { value: 'ev', label: 'Circularização de Energias (EV)' },
    { value: 'absorcao', label: 'Absorção de Energias' },
    { value: 'exteriorizacao', label: 'Exteriorização Cosmoconstante' },
    { value: 'tenepes', label: 'Pesquisa Assistencial / Equipe' },
    { value: 'consciencia_cosmica', label: 'Consciência Cósmica (Cosmoconsciência)' },
    { value: 'fenomenos_registrados', label: 'Fenômenos Registrados (Autopesquisa)' },
    { value: 'fenomenos_externos', label: 'Fenômenos Externos (Parafatos)' },
    { value: 'desassim', label: 'Desassimilação Simpática (Desassim)' },
    { value: 'projecao_lucida', label: 'Projeção Lúcida (Projeciologia)' },
    { value: 'acoplamento', label: 'Acoplamento Interconsciencial' },
    { value: 'auto_retrocognicao', label: 'Auto-retrocognição (Memória Holosomática)' }
  ];

  const [executingTask, setExecutingTask] = useState<any | null>(null);
  const [isGlobalEditActive, setIsGlobalEditActive] = useState(false);
  const [execIntensity, setExecIntensity] = useState(5);
  const [execSymmetry, setExecSymmetry] = useState(3);
  const [execLucidity, setExecLucidity] = useState(3);
  const [execNotes, setExecNotes] = useState('');
  const [execSensations, setExecSensations] = useState<string[]>([]);
  const [execPhenomena, setExecPhenomena] = useState<string[]>([]);
  const [execTechnique, setExecTechnique] = useState('ev');

  const [customSensations, setCustomSensations] = useState<string[]>(() => {
    try {
      const data = localStorage.getItem('energy_work_sensations');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  const [customPhenomena, setCustomPhenomena] = useState<string[]>(() => {
    try {
      const data = localStorage.getItem('energy_work_phenomena');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  const [customFatuistica, setCustomFatuistica] = useState<string[]>(() => {
    try {
      const data = localStorage.getItem('energy_work_fatuistica');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  const sensationsOptions = [
    ...DEFAULT_SENSATIONS.map((s, idx) => ({ id: `default_${idx}`, label: s, isDefault: true })),
    ...customSensations.map((cs, idx) => ({ id: `custom_${idx}`, label: cs, isDefault: false }))
  ];

  const phenomenaOptions = [
    ...DEFAULT_PHENOMENA.map((p, idx) => ({ id: `default_${idx}`, label: p, isDefault: true })),
    ...customPhenomena.map((cp, idx) => ({ id: `custom_${idx}`, label: cp, isDefault: false }))
  ];

  const fatuisticaOptions = [
    ...DEFAULT_FATUISTICA.map(f => ({ ...f, isDefault: true })),
    ...customFatuistica.map(cf => ({ value: cf, label: cf, isDefault: false }))
  ];

  const [newSensationInput, setNewSensationInput] = useState('');
  const [showNewSensationInput, setShowNewSensationInput] = useState(false);
  const [newPhenomenonInput, setNewPhenomenonInput] = useState('');
  const [showNewPhenomenonInput, setShowNewPhenomenonInput] = useState(false);
  const [newFatuisticaInput, setNewFatuisticaInput] = useState('');
  const [showNewFatuisticaInput, setShowNewFatuisticaInput] = useState(false);

  const addCustomSensation = () => {
    const val = newSensationInput.trim();
    if (val && !DEFAULT_SENSATIONS.includes(val) && !customSensations.includes(val)) {
      const updated = [...customSensations, val];
      setCustomSensations(updated);
      localStorage.setItem('energy_work_sensations', JSON.stringify(updated));
      setExecSensations(prev => [...prev, val]);
      setNewSensationInput('');
      setShowNewSensationInput(false);
    }
  };

  const handleEditSensation = (oldVal: string) => {
    const newVal = prompt('Editar Sinalética:', oldVal);
    if (newVal && newVal.trim() && newVal.trim() !== oldVal) {
      const val = newVal.trim();
      const updated = customSensations.map(s => s === oldVal ? val : s);
      setCustomSensations(updated);
      localStorage.setItem('energy_work_sensations', JSON.stringify(updated));
      if (execSensations.includes(oldVal)) {
        setExecSensations(prev => prev.map(s => s === oldVal ? val : s));
      }
    }
  };

  const handleDeleteSensation = (val: string) => {
    if (confirm(`Excluir a sinalética customizada "${val}"?`)) {
      const updated = customSensations.filter(s => s !== val);
      setCustomSensations(updated);
      localStorage.setItem('energy_work_sensations', JSON.stringify(updated));
      setExecSensations(prev => prev.filter(s => s !== val));
    }
  };

  const addCustomPhenomenon = () => {
    const val = newPhenomenonInput.trim();
    if (val && !DEFAULT_PHENOMENA.includes(val) && !customPhenomena.includes(val)) {
      const updated = [...customPhenomena, val];
      setCustomPhenomena(updated);
      localStorage.setItem('energy_work_phenomena', JSON.stringify(updated));
      setExecPhenomena(prev => [...prev, val]);
      setNewPhenomenonInput('');
      setShowNewPhenomenonInput(false);
    }
  };

  const handleEditPhenomenon = (oldVal: string) => {
    const newVal = prompt('Editar Fenômeno:', oldVal);
    if (newVal && newVal.trim() && newVal.trim() !== oldVal) {
      const val = newVal.trim();
      const updated = customPhenomena.map(s => s === oldVal ? val : s);
      setCustomPhenomena(updated);
      localStorage.setItem('energy_work_phenomena', JSON.stringify(updated));
      if (execPhenomena.includes(oldVal)) {
        setExecPhenomena(prev => prev.map(s => s === oldVal ? val : s));
      }
    }
  };

  const handleDeletePhenomenon = (val: string) => {
    if (confirm(`Excluir o fenômeno customizado "${val}"?`)) {
      const updated = customPhenomena.filter(s => s !== val);
      setCustomPhenomena(updated);
      localStorage.setItem('energy_work_phenomena', JSON.stringify(updated));
      setExecPhenomena(prev => prev.filter(s => s !== val));
    }
  };

  const addCustomFatuistica = () => {
    const trimmed = newFatuisticaInput.trim();
    if (trimmed && !DEFAULT_FATUISTICA.some(opt => opt.label.toLowerCase() === trimmed.toLowerCase()) && !customFatuistica.includes(trimmed)) {
      const updated = [...customFatuistica, trimmed];
      setCustomFatuistica(updated);
      localStorage.setItem('energy_work_fatuistica', JSON.stringify(updated));
      setExecTechnique(trimmed);
      setNewFatuisticaInput('');
      setShowNewFatuisticaInput(false);
    }
  };

  const handleEditFatuistica = (oldVal: string) => {
    const newVal = prompt('Editar Técnica/Fenômeno (Fatuística):', oldVal);
    if (newVal && newVal.trim() && newVal.trim() !== oldVal) {
      const val = newVal.trim();
      const updated = customFatuistica.map(s => s === oldVal ? val : s);
      setCustomFatuistica(updated);
      localStorage.setItem('energy_work_fatuistica', JSON.stringify(updated));
      if (execTechnique === oldVal) {
        setExecTechnique(val);
      }
    }
  };

  const handleDeleteFatuistica = (val: string) => {
    if (confirm(`Excluir a fatuística customizada "${val}"?`)) {
      const updated = customFatuistica.filter(s => s !== val);
      setCustomFatuistica(updated);
      localStorage.setItem('energy_work_fatuistica', JSON.stringify(updated));
      if (execTechnique === val) {
        setExecTechnique('ev');
      }
    }
  };

  // Quick Action Handlers
  const handleCreateDiary = () => {
    const allDiaries = fakeDB.diaries || [];
    const activeDiary = allDiaries.find((d: any) => d.status === 'active');
    
    if (activeDiary) {
      navigate(`/diary/${activeDiary.id}`);
    } else {
      const entry = fakeDB.createDiaryEntry();
      navigate(`/diary/${entry.id}`);
    }
  };

  const handleCreateWorkspace = () => {
    navigate('/manager', { state: { action: 'create-workspace' } });
  };

  const handleCreateDocument = () => {
    navigate('/manager', { state: { action: 'create-document' } });
  };

  const handleCreateObjective = () => {
    setSelectedObjectiveId('new');
  };

  const handleCreateMeta = () => {
    setObjectiveSelectPurpose('meta');
  };

  const handleCreateTask = () => {
    setObjectiveSelectPurpose('task');
  };

  const handleCreateConquest = () => {
    navigate('/mural', { state: { openModal: 'add-asset' } });
  };

  const handleCreateCategory = () => {
    setFinanceTab('categories');
    setIsFinanceModalOpen(true);
  };

  const handleCreateFolder = () => {
    navigate('/manager', { state: { action: 'create-folder' } });
  };

  const handleCreateSystem = () => {
    navigate('/central');
  };

  const handleOpenIara = () => {
    navigate('/amparadora', { state: { action: 'new-chat' } });
  };

  const handleOpenQuickNotes = () => {
    setNewItemTitle('');
    setNewItemDescription('');
    setIsAddingQuickNote(true);
  };

  const submitNewMeta = () => {
    if (!newItemTitle.trim()) return;
    const targetObjectiveId = selectedObjectiveIdForMetaOrTask || data.objectives[0]?.id || 'none';
    fakeDB.createGoal({ title: newItemTitle, objectiveId: targetObjectiveId });
    setData(fakeDB.getAll());
    setIsAddingMeta(false);
    setNewItemTitle('');
  };

  const submitNewTask = () => {
    if (!newItemTitle.trim()) return;
    const targetObjectiveId = selectedObjectiveIdForMetaOrTask || data.objectives[0]?.id || 'none';
    const matchingProject = data.projects.find((p: any) => p.objectiveId === targetObjectiveId || p.parentId === targetObjectiveId);
    const targetProjectId = matchingProject?.id || data.projects[0]?.id || 'none';

    fakeDB.createTask({ 
      title: newItemTitle, 
      projectId: targetProjectId,
      objectiveId: targetObjectiveId,
      executionType: taskExecutionType
    });
    setData(fakeDB.getAll());
    setIsAddingTask(false);
    setNewItemTitle('');
    setTaskExecutionType('standard');
  };

  const handleCompleteEnergyWork = async () => {
    if (!executingTask) return;
    
    const updatedTask = {
      ...executingTask,
      status: 'completed',
      date: Date.now(),
      executionType: 'energy-work',
      energyWorkExecution: {
        holosomaticImpacts: {
          physical: Math.min(execIntensity, 4),
          energy: execIntensity,
          emotional: 4,
          mental: execIntensity
        },
        symmetry: execSymmetry,
        lucidity: execLucidity,
        sensations: execSensations,
        phenomena: execPhenomena,
        notes: execNotes,
        technique: execTechnique
      }
    };

    try {
      const res = await fetch(`/api/tasks/${updatedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': localStorage.getItem('userId') || 'default'
        },
        body: JSON.stringify(updatedTask)
      });
      
      const tIdx = fakeDB.tasks.findIndex(t => t.id === updatedTask.id);
      if (tIdx !== -1) {
        fakeDB.tasks[tIdx] = updatedTask;
      } else {
        fakeDB.tasks.push(updatedTask);
      }
      safeLocalStorage.setItem('dashboard_snapshot_dirty', 'true');
      console.log(`[ProjectsPage] Tarefa Bioenergética completada e arquivada.`);
      organismEventBus.emit('goalUpdated', updatedTask);
    } catch (err) {
      console.error('Erro ao sincronizar tarefa bioenergética:', err);
    }

    setExecutingTask(null);
    setExecNotes('');
    setExecSensations([]);
    setExecPhenomena([]);
    setData(fakeDB.getAll());
  };

  const submitQuickNote = () => {
    if (!newItemTitle.trim()) return;
    fakeDB.createDocument({ title: newItemTitle, content: newItemDescription, workspaceId: data.workspaces[0]?.id || 'none' });
    setData(fakeDB.getAll());
    setIsAddingQuickNote(false);
    setNewItemTitle('');
    setNewItemDescription('');
  };

  // Timeline data processing
  const timelineItems = useMemo(() => {
    const tasks = data.tasks.map(t => ({ ...t, type: 'task', time: t.date || t.createdAt }));
    const events = data.events.map(e => ({ ...e, type: 'event', time: e.date }));
    
    return [...tasks, ...events].sort((a, b) => a.time - b.time);
  }, [data]);

  const handleAddObjective = (title: string) => {
    const newObj = fakeDB.createObjective({ title });
    setObjectives([newObj, ...objectives]);
    setIsAdding(false);
  };

  const handleReorder = (newOrder: any[]) => {
    setObjectives(newOrder);
    fakeDB.reorderObjectives(newOrder);
  };

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacityHeader = useTransform(scrollY, [0, 300], [1, 0]);

  const [headerVisible, setHeaderVisible] = useState(true);
  useEffect(() => {
    return scrollY.onChange((latest) => {
      setHeaderVisible(latest < 450);
    });
  }, [scrollY]);

  // Clock calculations
  const secondsDegrees = (currentTime.getSeconds() / 60) * 360;
  const minutesDegrees = (currentTime.getMinutes() / 60) * 360 + (currentTime.getSeconds() / 60) * 6;
  const hoursDegrees = (currentTime.getHours() % 12 / 12) * 360 + (currentTime.getMinutes() / 60) * 30;

  // Weather/Period icon logic
  const getPeriodIcon = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return <Sunrise className="text-amber-300" size={28} />; // Morning
    if (hour >= 12 && hour < 18) return <Sun className="text-amber-500" size={28} />; // Afternoon
    if (hour >= 18 && hour < 24) return <Moon className="text-indigo-400" size={28} />; // Night
    return <CloudMoon className="text-blue-300" size={28} />; // Dawn
  };

  const getPeriodLabel = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return 'Manhã';
    if (hour >= 12 && hour < 18) return 'Tarde';
    if (hour >= 18 && hour < 24) return 'Noite';
    return 'Madrugada';
  };

  const aiNotifications = useMemo(() => {
    const list: any[] = [];
    
    // Calculate actual days since last diary
    const diariesList = data.diaries || [];
    let daysSinceLastDiary = 0;
    let hasDiaries = diariesList.length > 0;
    if (hasDiaries) {
      const latestDiary = diariesList.reduce((latest: any, d: any) => {
        const dDate = new Date(d.date || d.createdAt).getTime();
        const lDate = new Date(latest.date || latest.createdAt).getTime();
        return dDate > lDate ? d : latest;
      }, diariesList[0]);
      
      const diffTime = Math.abs(Date.now() - new Date(latestDiary.date || latestDiary.createdAt).getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      daysSinceLastDiary = diffDays;
    }

    // Calculate real finances balance
    let totalIncome = 0;
    let totalExpense = 0;
    transactions.forEach((t: any) => {
      const cat = categories.find(c => c.id === t.category_id);
      if (cat) {
        if (cat.type === CategoryType.INCOME) {
          totalIncome += t.value;
        } else {
          totalExpense += t.value;
        }
      } else {
        totalExpense += t.value;
      }
    });
    const balance = totalIncome - totalExpense;

    const hasObjectives = objectives && objectives.length > 0;

    // Card 1: Foco e Eficiência Neural (Performance) - Realtid
    const activeObjTitle = hasObjectives ? objectives[0].title : 'Despertar Existencial';
    const activeTasks = hasObjectives ? (data.tasks || []).filter((t: any) => t.objectiveId === objectives[0].id) : [];
    const completedTasks = activeTasks.filter((t: any) => t.status === 'done' || t.status === 'completed');
    const progressPercent = activeTasks.length > 0 ? Math.round((completedTasks.length / activeTasks.length) * 100) : 0;
    
    list.push({
      id: 'notif-focus-1',
      type: 'performance',
      title: 'Gradiente de Eficiência Neural',
      message: hasObjectives
        ? `Douglas, seu vetor ativo "${activeObjTitle}" está operando com ${progressPercent}% de eficiência de foco. Você concluiu com sucesso ${completedTasks.length} de suas ${activeTasks.length} tarefas físicas sintonizadas.`
        : 'Sua mente possui energia dispersa neste instante. Nenhum vetor de longo prazo foi programado. Marque uma prioridade clara ou objetivo no painel principal para ativar análises dedicadas.',
      time: 'Agora',
      priority: 'high',
      action: hasObjectives ? 'Otimizar Fluxo' : 'Definir Objetivo',
      trend: [35, 48, 62, 58, 80, 95, 92],
      confidence: hasObjectives ? 'Sincronia Ativa de Vetor a 92%' : 'Nível Base Consciencial',
      groups: ['today', 'insights', 'important'],
      icon: <Cpu size={16} />
    });

    // Card 2: Autoconsciência Semântica (Pattern) - Correlação com Diários
    list.push({
      id: 'notif-pattern-2',
      type: 'pattern',
      title: 'Mapeamento de Causa & Efeito Consciencial',
      message: hasDiaries
        ? `Análise Semântica Longitudinal: Cruzando seus ${diariesList.length} diários recentes, o sistema identificou que dedicar tempo a detalhar seus estados de energia sutil (como o EV) eleva seu foco intelectual em fins de tarde em até 41%.`
        : 'Inicie seu mapeamento semântico de autopesquisa. Seus registros no diário funcionarão como insumos ativos de dados de inteligência comportamental para cruzar com seu foco diário.',
      time: 'Há 5min',
      priority: 'high',
      action: hasDiaries ? 'Analisar Diário' : 'Escrever Diário',
      connections: ['Introspecção Ativa', 'Dopamina Saudável', 'Sincronização Consciencial'],
      groups: ['patterns', 'insights', 'important'],
      icon: <Activity size={16} />
    });

    // Card 3: Mensagem da Presença Amparadora (Amparadora) - Conexão Emocional Profunda
    const topTaskText = hasObjectives && activeTasks.filter((t: any) => t.status !== 'done' && t.status !== 'completed')[0]
      ? `ao executar "${activeTasks.filter((t: any) => t.status !== 'done' && t.status !== 'completed')[0].title}"`
      : 'ao organizar sua rotina diária';

    list.push({
      id: 'notif-amparadora-3',
      type: 'amparadora',
      title: 'Presença Amparadora',
      message: `Douglas, sinto uma pressa sutil e foco exacerbado em seus registros ${topTaskText}. Respire fundo por 90 segundos, sinta a quietude de seus canais de energia consciencial e desacelere. Estou presente nesta caminhada existencial com você.`,
      time: 'Em tempo real',
      priority: 'medium',
      action: 'Sintonizar Pulso',
      groups: ['amparadora', 'today', 'important'],
      icon: <Sparkles size={16} />
    });

    // Card 4: Sincronia Financeira & Snowball de Patrimônio (Performance/Alert)
    const financeMsg = transactions.length > 0
      ? (balance < 0 
          ? `Douglas, suas despesas superam em ${Math.abs(balance).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} seu faturamento real. Considere reestruturar despesas não essenciais para expandir seu snowball patrimonial.`
          : `Douglas, seu saldo líquido está superavitário em ${balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}. Parabéns pelo fluxo harmônico de ativos, isso pavimenta seu runway para a proexis profissional!`)
      : 'Sua inteligência financeira no painel está descalibrada (sem registros). Insira suas entradas para calcular com precisão seu snowball existencial de sobrevivência confortável.';

    list.push({
      id: 'notif-finance-4',
      type: balance < 0 ? 'alert' : 'performance',
      title: balance < 0 ? 'Alerta de Fluxo Financeiro sutil' : 'Rendimento e Superávit Patrimonial',
      message: financeMsg,
      time: 'Há 1h',
      priority: balance < 0 ? 'high' : 'medium',
      action: balance < 0 ? 'Ajustar Orçamento' : 'Analisar Finanças',
      groups: balance < 0 ? ['today', 'important', 'insights'] : ['today', 'insights'],
      icon: <Wallet size={16} />
    });

    // Card 5: Direção Existencial & Calibração de Vetores (Direction)
    list.push({
      id: 'notif-direction-5',
      type: 'direction',
      title: 'Direção Tridimensional de Metas',
      message: hasObjectives && objectives.length >= 2
        ? `Seu vetor estratégico secundário "${objectives[1].title}" está aguardando calibração de consistência das atividades. Dilua seu foco estruturado para mitigar desníveis nos objetivos.`
        : 'Projeção de Metas: Você está consumindo 85% do seu tempo de fluxo operacional em micro-tarefas secundárias. Deseja sintonizar e calibrar seus prazos com los objetivos planejados para o ano?',
      time: 'Ativo',
      priority: 'medium',
      action: 'Analisar Alinhamento',
      contemplativeImage: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=600&auto=format&fit=crop',
      groups: ['week', 'insights'],
      icon: <Zap size={16} />
    });

    // Card 6: Alerta Existencial de Introspecção (Alert / Performance)
    if (hasDiaries && daysSinceLastDiary > 2) {
      list.push({
        id: 'notif-diary-alert-6',
        type: 'alert',
        title: 'Sinal de Introspecção Recuado',
        message: `Douglas, você está há ${daysSinceLastDiary} dias sem registrar seu diário existencial. A falta de escrita reflexiva pode levar à perda de rastros de sua autopesquisa e inteligência de rumos.`,
        time: `${daysSinceLastDiary}d atrás`,
        priority: 'high',
        action: 'Registrar Agora',
        groups: ['today', 'important'],
        icon: <AlertCircle size={16} />
      });
    } else {
      list.push({
        id: 'notif-diary-perf-6',
        type: 'performance',
        title: 'Consistência em Autopesquisa Diária',
        message: 'Douglas, sua consistência de escrita e autopesquisa está excelente. Registrar seus estados de sono, humor, e mobilizações de energia sutil pavimenta o caminho da sua inteligência emocional de alta resolução.',
        time: 'Ontem',
        priority: 'medium',
        action: 'Analisar Diário',
        groups: ['today', 'insights'],
        icon: <Sparkles size={16} />
      });
    }

    // Card 7: Padrão Consciencial Profundo (Insight Semântico de Diários - Pattern)
    const lastDiarySnippet = hasDiaries && diariesList[0].description
      ? `Em seu último diário ("${diariesList[0].title.replace('\n', ' ')}"), você registrou reflexões valiosas. O sistema detectou que a documentação formal de seus insights bloqueia a ansiedade existencial imediata e ruídos superficiais de distraidores externos.`
      : 'Sua atenção contínua é absorvida por estímulos e ruídos diários na ausência de filtragem consciencial. Escreva diários frequentes para gerarmos insights de sentimentos autênticos.';

    list.push({
      id: 'notif-semantic-7',
      type: 'pattern',
      title: 'Resgate Existencial & Autocuidado',
      message: `${lastDiarySnippet} Este feed pessoal de altíssima qualidade foi feito para substituir totalmente o scroll infinito superficial das redes sociais convencionais.`,
      time: 'Ontem',
      priority: 'medium',
      action: 'Sintonizar Pulso',
      connections: ['Foco Autêntico', 'Isolamento de Ruídos', 'Dopamina Saudável'],
      groups: ['week', 'patterns', 'insights'],
      icon: <Activity size={16} />
    });

    // Card 8: Eco-Estabilidade & Foco (Insight / Performance)
    const weatherText = weather 
      ? `Com o clima de ${weather.temp}°C e condição ${weather.condition || 'Serena'},`
      : 'Considerando sua sincronia biológica no ambiente de trabalho padrão,';

    list.push({
      id: 'notif-weather-8',
      type: 'performance',
      title: 'Sincronia Ecológica & Foco',
      message: `${weatherText} sugerimos intercalar micro-pausas de respiração profunda e mobilização de energia vital (EV) com as sessões de hiper-foco intelectual para reoxigenar a psique.`,
      time: 'Semanal',
      priority: 'low',
      action: 'Sintonizar Pulso',
      groups: ['week', 'insights'],
      icon: <Cpu size={16} />
    });

    return list;
  }, [objectives, transactions, data, categories, weather]);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'all') return aiNotifications;
    return aiNotifications.filter(notif => notif.groups?.includes(activeFilter));
  }, [aiNotifications, activeFilter]);

  return (
    <div className="min-h-screen bg-transparent text-[var(--text)] pb-32 overflow-x-hidden font-sans selection:bg-primary/20 transition-colors duration-500">
      {/* Deletion Confirmation Modal */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setItemToDelete(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-[var(--surface)] rounded-[3rem] p-10 w-full max-w-sm shadow-2xl text-center overflow-hidden border border-white/10"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-red-600" />
              <div className="p-8 bg-red-600/10 text-red-500 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                <Trash2 size={48} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-widest text-[var(--text)] mb-3">Excluir Alvo?</h3>
              <p className="text-[var(--muted)] text-sm font-medium leading-relaxed mb-10 px-4">
                O objetivo <span className="text-[var(--text)] font-black">"{itemToDelete.title}"</span> e todo o seu progresso serão removidos permanentemente.
              </p>
              <div className="flex flex-col gap-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDeleteObjective(itemToDelete.id)}
                  className="w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_10px_30px_rgba(220,38,38,0.3)] hover:bg-red-500 transition-all border border-red-400/20"
                >
                  Confirmar Exclusão
                </motion.button>
                <button 
                  onClick={() => setItemToDelete(null)}
                  className="w-full py-5 text-[var(--muted)] font-black uppercase tracking-[0.2em] text-[10px] hover:text-[var(--text)] transition-colors"
                >
                  Manter Objetivo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Creation Modals */}
      <AnimatePresence>
        {(isAddingMeta || isAddingTask || isAddingQuickNote) && (
          <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsAddingMeta(false);
                setIsAddingTask(false);
                setIsAddingQuickNote(false);
              }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-[var(--surface)] rounded-[2rem] p-8 w-full max-w-md shadow-2xl overflow-hidden border border-white/10"
            >
              <h3 className="text-xl font-black uppercase tracking-widest text-[var(--text)] mb-6">
                {isAddingMeta ? 'Nova Meta' : isAddingTask ? 'Nova Tarefa' : 'Nota Rápida'}
              </h3>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text)]/40 block mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    placeholder="Digite o título..."
                    autoFocus
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-[var(--text)] placeholder-white/20 focus:outline-none focus:border-[var(--primary)] transition-colors"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (isAddingMeta) submitNewMeta();
                        if (isAddingTask) submitNewTask();
                        if (isAddingQuickNote) submitQuickNote();
                      }
                    }}
                  />
                </div>

                {(isAddingMeta || isAddingTask) && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text)]/40 block mb-2">
                      Atrelar ao Objetivo (Obrigatório)
                    </label>
                    <select
                      value={selectedObjectiveIdForMetaOrTask}
                      onChange={(e) => setSelectedObjectiveIdForMetaOrTask(e.target.value)}
                      className="w-full bg-[#111111] border border-white/10 rounded-xl p-4 text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-colors text-sm font-semibold"
                    >
                      <option value="" className="text-white bg-neutral-900">-- Escolha o Objetivo --</option>
                      {data.objectives.map(obj => (
                        <option key={obj.id} value={obj.id} className="text-white bg-neutral-900">
                          🎯 {obj.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {isAddingQuickNote && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text)]/40 block mb-2">
                      Conteúdo
                    </label>
                    <textarea
                      value={newItemDescription}
                      onChange={(e) => setNewItemDescription(e.target.value)}
                      placeholder="Descreva a nota..."
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-[var(--text)] placeholder-white/20 focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
                    />
                  </div>
                )}

                {isAddingTask && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text)]/40 block mb-2">
                      Tipo de Atividade
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTaskExecutionType('standard')}
                        className={`p-3.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          taskExecutionType === 'standard'
                            ? 'bg-[var(--primary)] text-white border-transparent'
                            : 'bg-white/5 border-white/10 text-[var(--muted)] hover:text-white'
                        }`}
                      >
                        Padrão (Física/Mental)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTaskExecutionType('energy-work')}
                        className={`p-3.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          taskExecutionType === 'energy-work'
                            ? 'bg-zinc-700 text-white border-transparent shadow-lg shadow-zinc-800/10'
                            : 'bg-white/5 border-white/10 text-[var(--muted)] hover:text-white'
                        }`}
                      >
                        Fatuística / Energética
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setIsAddingMeta(false);
                    setIsAddingTask(false);
                    setIsAddingQuickNote(false);
                  }}
                  className="flex-1 py-4 text-[var(--muted)] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white/5 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (isAddingMeta) submitNewMeta();
                    else if (isAddingTask) submitNewTask();
                    else if (isAddingQuickNote) submitQuickNote();
                  }}
                  className="flex-1 py-4 bg-[var(--primary)] text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_10px_30px_rgba(16,185,129,0.3)]"
                >
                  Criar
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Energy Work Completion Modal */}
      <AnimatePresence>
        {executingTask && (
          <div className="fixed inset-0 z-[30000] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExecutingTask(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-[#050608] border border-white/10 rounded-[2rem] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl transition-all duration-300"
            >
              <header className="p-6 border-b border-white/5 flex items-center justify-between relative overflow-hidden shrink-0 bg-[#08090c]">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-700 to-zinc-650" />
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-zinc-800/40 rounded-xl shrink-0">
                    <Activity className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-bold text-teal-400 uppercase tracking-widest">Execução Bioenergética</span>
                      <button
                        type="button"
                        onClick={() => setIsGlobalEditActive(!isGlobalEditActive)}
                        className={`p-1 rounded transition-all flex items-center justify-center shrink-0 border-none bg-transparent outline-none cursor-pointer ${
                          isGlobalEditActive 
                            ? 'text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]' 
                            : 'text-zinc-500 hover:text-white'
                        }`}
                        title="Alternar Modo de Edições de Itens"
                      >
                        <Sliders size={12} className="stroke-[2.5]" />
                      </button>
                    </div>
                    <h3 className="text-base font-black tracking-tight text-white line-clamp-1">{executingTask.title}</h3>
                  </div>
                </div>
                <button 
                  onClick={() => setExecutingTask(null)}
                  className="rounded-xl w-9 h-9 flex items-center justify-center border border-white/10 bg-white/5 hover:text-white text-zinc-400 transition-all active:scale-95 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </header>

              <div className="flex-1 p-6 space-y-6 overflow-y-auto scrollbar-none text-zinc-300">
                {/* Sliders */}
                <div className="space-y-4">
                  {/* Energy Volume */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 font-sans">Volume Bioenergético (VBE)</span>
                      <span className="px-2.5 py-0.5 bg-zinc-700 text-white rounded-md text-xs font-black shadow-lg shadow-zinc-800/10">{execIntensity}/10</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={execIntensity} 
                      onChange={(e) => setExecIntensity(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-zinc-900 rounded-full appearance-none accent-zinc-550 cursor-pointer" 
                    />
                  </div>

                  {/* Symmetry and Lucidity side-by-side */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 truncate font-sans">Sincromodalidade</span>
                        <span className="text-zinc-400 font-mono text-xs">{execSymmetry}/5</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="5" 
                        value={execSymmetry} 
                        onChange={(e) => setExecSymmetry(parseInt(e.target.value, 10))}
                        className="w-full h-1 bg-zinc-900 rounded-full appearance-none accent-zinc-500 cursor-pointer" 
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 truncate font-sans">Hiperlucidez</span>
                        <span className="text-emerald-400 font-mono text-xs">{execLucidity}/5</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="5" 
                        value={execLucidity} 
                        onChange={(e) => setExecLucidity(parseInt(e.target.value, 10))}
                        className="w-full h-1 bg-zinc-900 rounded-full appearance-none accent-emerald-500 cursor-pointer" 
                      />
                    </div>
                  </div>
                </div>

                {/* Fatuística (Técnica / Fato) Selector with Full CRUD Parity */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Fatuística (Técnica / Fato)</label>
                        <p className="text-[8px] font-medium text-zinc-650 uppercase tracking-widest text-zinc-400">Técnica Principal do Experimento</p>
                      </div>
                    </div>
                    {!showNewFatuisticaInput ? (
                      <button 
                        type="button"
                        onClick={() => setShowNewFatuisticaInput(true)}
                        className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-[8px] font-black text-teal-400 uppercase tracking-widest hover:bg-teal-500/20 transition-all cursor-pointer"
                      >
                        + Nova Técnica
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 bg-zinc-900 border border-white/10 rounded-xl p-1">
                        <input 
                          type="text"
                          placeholder="Nova técnica"
                          value={newFatuisticaInput}
                          onChange={(e) => setNewFatuisticaInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addCustomFatuistica();
                            }
                          }}
                          className="bg-transparent outline-none text-[10px] px-2 py-1 text-white max-w-[120px]"
                        />
                        <button 
                          type="button"
                          onClick={addCustomFatuistica}
                          className="p-1 bg-teal-650 hover:bg-teal-700 text-white rounded cursor-pointer"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => setShowNewFatuisticaInput(false)}
                          className="p-1 text-zinc-500 hover:text-red-400 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="relative group/sel">
                    <select 
                      value={execTechnique}
                      onChange={(e) => setExecTechnique(e.target.value)}
                      className="w-full p-4 rounded-3xl border border-white/5 outline-none text-xs font-bold transition-all bg-black text-white focus:border-teal-500 appearance-none cursor-pointer pr-10 hover:border-white/20 select-none text-left"
                    >
                      {DEFAULT_FATUISTICA.map(opt => (
                        <option key={opt.value} value={opt.value} className="bg-black text-white">{opt.label}</option>
                      ))}
                      {customFatuistica.map(cf => (
                        <option key={cf} value={cf} className="bg-black text-white">{cf}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                  </div>

                  {customFatuistica.length > 0 && (
                    <div className="horizontal-flow-4-rows pt-1 pr-1">
                      {customFatuistica.map(cf => (
                        <span key={cf} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-[9px] font-bold bg-teal-500/10 border border-teal-500/15 text-teal-400">
                          <span>{cf}</span>
                          {isGlobalEditActive && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleEditFatuistica(cf)}
                                className="p-1 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors cursor-pointer border-none flex items-center justify-center bg-transparent shrink-0"
                                title="Editar"
                              >
                                <Edit2 className="w-2.5 h-2.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteFatuistica(cf)}
                                className="p-1 hover:bg-red-500/15 rounded-full text-white/40 hover:text-red-400 transition-colors cursor-pointer border-none flex items-center justify-center bg-transparent shrink-0"
                                title="Excluir"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sensations */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 font-sans">Detectar Sinalética</span>
                  </div>
                  <div className="horizontal-flow-4-rows">
                    {sensationsOptions.map(s => {
                      const active = execSensations.includes(s.label);
                      return (
                        <div key={s.id} className="relative group">
                          <button 
                            type="button"
                            onClick={() => {
                              setExecSensations(prev => 
                                prev.includes(s.label) ? prev.filter(x => x !== s.label) : [...prev, s.label]
                              );
                            }}
                            className={`text-[10px] px-3.5 py-1.5 rounded-xl border transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                              active 
                                ? 'bg-zinc-700/40 border-zinc-500/40 text-white font-black shadow-lg shadow-zinc-850/10' 
                                : 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:text-white'
                            }`}
                          >
                            <span>{s.label}</span>
                            {!s.isDefault && isGlobalEditActive && (
                              <div className="flex items-center gap-0.5 ml-1 border-l border-white/10 pl-1.5 opacity-60 hover:opacity-100 transition-opacity">
                                <span 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditSensation(s.label);
                                  }}
                                  className="p-0.5 hover:text-white transition-colors cursor-pointer text-zinc-400"
                                  title="Editar"
                                >
                                  <Edit2 className="w-2.5 h-2.5" />
                                </span>
                                <span 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSensation(s.label);
                                  }}
                                  className="p-0.5 hover:text-red-400 transition-colors cursor-pointer text-zinc-400"
                                  title="Excluir"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </span>
                              </div>
                            )}
                          </button>
                        </div>
                      );
                    })}

                    {!showNewSensationInput ? (
                      <button 
                        type="button"
                        onClick={() => setShowNewSensationInput(true)}
                        className="p-1 px-2.5 border border-dashed border-zinc-500/30 hover:border-indigo-500 text-zinc-500 hover:text-indigo-400 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-bold">Mais</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 bg-zinc-900 border border-white/10 rounded-xl p-1">
                        <input 
                          type="text"
                          placeholder="Nova sinalética"
                          value={newSensationInput}
                          onChange={(e) => setNewSensationInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addCustomSensation();
                            }
                          }}
                          className="bg-transparent outline-none text-[10px] px-2 py-1 text-white max-w-[120px]"
                        />
                        <button 
                          type="button"
                          onClick={addCustomSensation}
                          className="p-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded cursor-pointer"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => setShowNewSensationInput(false)}
                          className="p-1 text-zinc-500 hover:text-red-400 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Phenomena */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 font-sans">Acontecimentos Parapsíquicos</span>
                  </div>
                  <div className="horizontal-flow-4-rows">
                    {phenomenaOptions.map(p => {
                      const active = execPhenomena.includes(p.label);
                      return (
                        <div key={p.id} className="relative group">
                          <button 
                            type="button"
                            onClick={() => {
                              setExecPhenomena(prev => 
                                prev.includes(p.label) ? prev.filter(x => x !== p.label) : [...prev, p.label]
                              );
                            }}
                            className={`text-[10px] px-3.5 py-1.5 rounded-xl border transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                              active 
                                ? 'bg-purple-500/20 border-purple-500 text-purple-400 font-black shadow-lg shadow-purple-500/10' 
                                : 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:text-white'
                            }`}
                          >
                            <span>{p.label}</span>
                            {!p.isDefault && isGlobalEditActive && (
                              <div className="flex items-center gap-0.5 ml-1 border-l border-white/10 pl-1.5 opacity-65 hover:opacity-100 transition-opacity">
                                <span 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditPhenomenon(p.label);
                                  }}
                                  className="p-0.5 hover:text-white transition-colors cursor-pointer text-zinc-400"
                                  title="Editar"
                                >
                                  <Edit2 className="w-2.5 h-2.5" />
                                </span>
                                <span 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePhenomenon(p.label);
                                  }}
                                  className="p-0.5 hover:text-red-400 transition-colors cursor-pointer text-zinc-400"
                                  title="Excluir"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </span>
                              </div>
                            )}
                          </button>
                        </div>
                      );
                    })}

                    {!showNewPhenomenonInput ? (
                      <button 
                        type="button"
                        onClick={() => setShowNewPhenomenonInput(true)}
                        className="p-1 px-2.5 border border-dashed border-zinc-500/30 hover:border-purple-500 text-zinc-500 hover:text-purple-400 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-bold">Mais</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 bg-zinc-900 border border-white/10 rounded-xl p-1">
                        <input 
                          type="text"
                          placeholder="Novo fenômeno"
                          value={newPhenomenonInput}
                          onChange={(e) => setNewPhenomenonInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addCustomPhenomenon();
                            }
                          }}
                          className="bg-transparent outline-none text-[10px] px-2 py-1 text-white max-w-[120px]"
                        />
                        <button 
                          type="button"
                          onClick={addCustomPhenomenon}
                          className="p-1 bg-purple-600 hover:bg-purple-700 text-white rounded cursor-pointer"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => setShowNewPhenomenonInput(false)}
                          className="p-1 text-zinc-500 hover:text-red-400 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 font-sans">Relato de autopesquisa imediata</span>
                  <textarea
                    value={execNotes}
                    onChange={(e) => setExecNotes(e.target.value)}
                    placeholder="Quais fenômenos ou parapercepções marcaram essa prática de autopesquisa?"
                    className="w-full min-h-[100px] p-4 bg-zinc-900 border border-white/5 rounded-2xl text-xs sm:text-sm font-normal text-white placeholder-white/20 outline-none focus:border-zinc-500 transition-all resize-none leading-relaxed"
                  />
                </div>
              </div>

              <footer className="p-6 border-t border-white/5 flex items-center justify-end gap-3 shrink-0 bg-[#08090c]">
                <button 
                  onClick={() => setExecutingTask(null)}
                  className="px-5 py-3 rounded-xl border border-white/10 text-xs font-bold text-zinc-400 hover:text-white transition-all active:scale-95 cursor-pointer text-center uppercase tracking-widest"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleCompleteEnergyWork}
                  className="px-6 py-3 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-white font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 cursor-pointer text-center"
                >
                  Concluir Prática e Registrar
                </button>
              </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Layer 1: Background Environment - Standardized to z-0 */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[var(--bg)]">
        {/* Carousel Background with Parallax and Cross-fade */}
        <AnimatePresence initial={false}>
          <motion.div 
            key={allBackgroundImages[bgIndex]}
            style={{ y: y1 }}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ 
              opacity: theme === 'dark' ? 0.5 : 0.35,
              scale: [1.1, 1.05, 1.1],
            }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{
              opacity: { duration: 4, ease: "easeInOut" },
              scale: { duration: 40, repeat: Infinity, ease: "linear" }
            }}
            className="absolute -inset-[10%]"
          >
            <img 
              src={allBackgroundImages[bgIndex]} 
              alt="Nature Background"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </AnimatePresence>

        {/* Blur & Overlays */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute inset-0 backdrop-blur-[1px] ${theme === 'light' ? 'bg-[var(--bg)]/40' : 'bg-[var(--bg)]/30'} transition-colors duration-500`} />
          
          {/* Radial Focus - Light in the center */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.03)_0%,transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--bg)_100%)]" />
          
          {/* Subtle Breathing Light Animation - Reduced intensity */}
          <motion.div 
            animate={{ 
              opacity: [0.02, 0.05, 0.02],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute inset-0 bg-gradient-to-b from-emerald-500/3 via-transparent to-transparent pointer-events-none"
          />
        </div>

        {/* Lottie Particles (Almost Invisible) */}
        <div className="absolute inset-0 overflow-hidden opacity-[0.02] md:opacity-[0.03]">
          <div className="absolute inset-0 scale-150">
            {headerVisible && lottieData && (
              <Lottie 
                animationData={lottieData}
                loop={true}
                style={{ width: '100%', height: '100%' }}
              />
            )}
          </div>
        </div>

        {/* Depth Gradients - Limited height and intensity to avoid "fog" effect */}
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[var(--bg)] to-transparent opacity-40" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[var(--bg)] to-transparent opacity-30" />
      </div>

      {/* Layer 2: Header Content - Standardized to z-10 */}
      <header 
        style={{ marginTop: '0px', marginBottom: '-10px' }}
        className="relative z-10 min-h-[40vh] md:min-h-[50vh] flex flex-col items-center justify-start pt-28 md:pt-32 px-4 md:px-10 text-center"
      >
        {/* Navigation Area */}
        <div className="absolute top-8 left-8 md:top-12 md:left-12 flex items-center gap-4">
          {onToggleSidebar && (
            <button 
              onClick={onToggleSidebar}
              style={{ width: '80.3138px', height: '35.3138px', marginLeft: '-7px', marginTop: '2px', borderRadius: '9.98918px' }}
              className="bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--surface-hover)] transition-all active:scale-95 backdrop-blur-2xl group shadow-xl"
              title="Menu"
            >
              <Menu size={18} className="text-[var(--muted)] group-hover:text-[var(--text)]" />
            </button>
          )}
        </div>

        {/* Cópia dos botões do Diário */}
        <div className="absolute top-8 right-8 md:top-12 md:right-12 flex items-center gap-1.5 md:gap-3 z-50">
          <button 
            onClick={() => navigate('/identity')}
            className="px-3 py-2 md:px-6 md:py-3 bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] rounded-full flex items-center hover:bg-[var(--surface-hover)] transition-all group shadow-lg pr-[35px] mr-[-26px] md:mr-[-35px] md:w-[206.4px]"
          >
            <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text)]/70 group-hover:text-[var(--text)] whitespace-nowrap translate-x-[4px] md:translate-x-[10px] inline-block">Douglas L. Rocha</span>
          </button>
          <button 
            onClick={() => navigate('/identity-view')}
            className="w-10 h-10 md:w-[50.6565px] md:h-[50.6565px] bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] rounded-[14px] flex items-center justify-center hover:bg-[var(--surface-hover)] transition-all group shadow-lg overflow-hidden"
          >
            <MagicIcon />
          </button>

          {/* Notification Bell */}
          <button 
            onClick={() => setShowNotifications(true)}
            className="flex w-10 h-10 md:w-[50.6565px] md:h-[50.6565px] bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] rounded-[14px] items-center justify-center hover:bg-[var(--surface-hover)] transition-all group shadow-lg relative"
          >
            <Bell size={18} className="text-[var(--text)] group-hover:scale-110 transition-transform" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          </button>
        </div>

        <motion.div 
          style={{ opacity: opacityHeader }}
          className="flex flex-col items-center w-full px-0.5 md:px-2 relative mb-12"
        >
          <AnimatePresence mode="wait" initial={false}>
            {activeHeaderSlide === 0 ? (
              <motion.div 
                key="actions-slide"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.02}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -40) setActiveHeaderSlide(1);
                }}
                initial={{ opacity: 0, x: -100, filter: 'blur(10px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: 100, filter: 'blur(10px)' }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-full flex flex-col items-center cursor-grab active:cursor-grabbing"
              >
                {/* Painel de Execução Direta - Cockpit Estilo Widget */}
                <div className="relative group w-full md:w-[1012px] px-1 md:px-0">
                  <div className="absolute -inset-10 bg-gradient-to-r from-purple-500/5 via-transparent to-emerald-500/5 rounded-[60px] blur-3xl opacity-20 pointer-events-none"></div>
                  
                  <div className="relative flex flex-row items-center justify-center gap-4 md:gap-8 p-3 md:p-2 rounded-2xl md:rounded-full bg-[var(--surface)]/70 border border-[var(--border)] backdrop-blur-[40px] shadow-2xl w-[373.069px] md:w-[1012px] h-auto mx-auto md:mx-0 px-[11px] md:px-8 ml-[-20px] md:ml-0 mr-0 md:mr-0">
                    
                    {/* NÚCLEO */}
                    <div 
                      className="flex items-center gap-1.5 md:gap-2 shrink-0 mt-[22px] md:mt-[12px]"
                    >
                      <QuickActionCard 
                         style={{ marginRight: '0px', marginLeft: '0px' }}
                         className="w-[56.9987px] h-[69.9987px] md:w-14 md:h-14"
                         labelStyle={{ fontSize: '10px' }}
                         icon={<ScrollText />} 
                         label="Diário" 
                         onClick={handleCreateDiary}
                      />
                      <QuickActionCard 
                         className="w-[56.9987px] h-[69.9987px] md:w-14 md:h-14"
                         labelStyle={{ fontSize: '11px' }}
                         icon={<Sparkles className="text-purple-400" />} 
                         label="IA" 
                         onClick={handleOpenIara}
                      />
                    </div>

                    <div 
                      style={{ marginLeft: '-9px', marginRight: '-33px', paddingRight: '0px' }}
                      className="h-6 w-px bg-[var(--border)] opacity-30 shrink-0 md:mx-4" 
                    />

                    <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-2 md:gap-6 flex-1">
                      <ActionGroup title="FINANCEIRO" className="md:mr-[5px]">
                        <QuickActionCard 
                          className="w-[55.9987px] h-12 md:w-14 md:h-14"
                          icon={<TrendingUp />} 
                          label="Receita" 
                          onClick={() => {
                            setFinanceTab('income');
                            setIsFinanceModalOpen(true);
                          }}
                        />
                        <QuickActionCard 
                          className="w-[55.9987px] h-12 md:w-14 md:h-14"
                          icon={<TrendingDown />} 
                          label="Despesa" 
                          onClick={() => {
                            setFinanceTab('expense');
                            setIsFinanceModalOpen(true);
                          }}
                        />
                        <QuickActionCard 
                          className="w-[55.9987px] h-12 md:w-14 md:h-14"
                          icon={<PlusCircle />} 
                          label="Categor." 
                          onClick={handleCreateCategory}
                        />
                      </ActionGroup>

                      <ActionGroup title="PRODUÇÃO" innerClassName="mr-[-23px] md:mr-0">
                        <QuickActionCard 
                          className="w-[60.9987px] h-12 md:w-14 md:h-14"
                          icon={<LayoutGrid />} 
                          label="Workspace" 
                          onClick={handleCreateWorkspace}
                        />
                        <QuickActionCard 
                          className="w-[60.9987px] h-12 md:w-14 md:h-14"
                          icon={<FolderPlus />} 
                          label="Pasta" 
                          onClick={handleCreateFolder}
                        />
                        <QuickActionCard 
                          className="w-[60.9987px] h-12 md:w-14 md:h-14"
                          icon={<FileText />} 
                          label="Doc" 
                          onClick={handleCreateDocument}
                        />
                      </ActionGroup>

                      <ActionGroup title="DIREÇÃO" className="md:ml-[52px]" innerClassName="ml-[-28px] md:ml-0 mr-0 md:mr-0">
                        <QuickActionCard 
                          className="w-[55.9987px] h-12 md:w-14 md:h-14"
                          icon={<Target />} 
                          label="Objetivo" 
                          onClick={handleCreateObjective}
                        />
                        <QuickActionCard 
                          className="w-[55.9987px] h-12 md:w-14 md:h-14"
                          icon={<Flag />} 
                          label="Meta" 
                          onClick={handleCreateMeta}
                        />
                        <QuickActionCard 
                          className="w-[55.9987px] h-12 md:w-14 md:h-14"
                          icon={<CheckSquare />} 
                          label="Tarefa" 
                          onClick={handleCreateTask}
                        />
                        <QuickActionCard 
                          className="w-[55.9987px] h-12 md:w-14 md:h-14"
                          icon={<Trophy />} 
                          label="Evolução" 
                          onClick={handleCreateConquest}
                        />
                      </ActionGroup>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : activeHeaderSlide === 1 ? (
              <motion.div 
                key="greeting-slide"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.02}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -40) setActiveHeaderSlide(2);
                  else if (info.offset.x > 40) setActiveHeaderSlide(0);
                }}
                initial={{ opacity: 0, x: 100, filter: 'blur(10px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: -100, filter: 'blur(10px)' }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-full cursor-grab active:cursor-grabbing"
              >
                {/* 1. Primary Hierarchy: Greeting & Foco */}
                <div 
                  style={{ marginTop: '0px', marginBottom: '0px' }}
                  className="mb-8 md:mb-12 w-full min-h-[200px] md:min-h-[350px] flex items-center justify-center relative overflow-visible"
                >
                  <AnimatePresence mode="wait">
                    {!showFoco ? (
                      <motion.h1 
                        key="greeting"
                        initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-5xl md:text-9xl font-light tracking-tight text-[var(--text)] leading-tight text-center"
                      >
                        <span className="block md:inline opacity-30">
                          {greeting.split(',').slice(0, 2).join(',')},
                        </span>
                        <span className="relative block md:inline bg-gradient-to-b from-[var(--text)] to-[var(--text)]/40 bg-clip-text text-transparent pb-4">
                          {/* Silver Shimmer Overlay */}
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--text)]/20 to-transparent bg-[length:200%_100%] animate-silver-shimmer bg-clip-text text-transparent pointer-events-none">
                            {greeting.split(',').slice(2).join(',')}
                          </span>
                          {/* Base Text */}
                          {greeting.split(',').slice(2).join(',')}
                        </span>
                      </motion.h1>
                    ) : (
                      <motion.div
                        key="foco"
                        initial={{ opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
                        animate={{ 
                          opacity: 1, 
                          scale: [0.8, 1.05, 1],
                          filter: 'blur(0px)',
                          letterSpacing: ['0.05em', '0.2em', '0.1em']
                        }}
                        exit={{ opacity: 0, scale: 1.1, filter: 'blur(15px)' }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="flex items-center justify-center w-full"
                      >
                        <motion.h1
                          className="animate-foco-silver-glow text-[106px] md:text-[310px] pl-[0.16em] md:pl-[0.1em] font-black tracking-[0.1em] uppercase leading-none text-center"
                        >
                          Foco
                        </motion.h1>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="widget-slide"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 50) setActiveHeaderSlide(1);
                }}
                initial={{ opacity: 0, x: 100, filter: 'blur(10px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: -100, filter: 'blur(10px)' }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-full flex flex-col items-center cursor-grab active:cursor-grabbing"
              >
                {/* Apple Style Widget */}
                <div className="relative group w-full max-w-5xl">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[var(--primary)]/10 to-transparent rounded-[48px] blur-2xl opacity-30 group-hover:opacity-60 transition duration-1000"></div>
                  <div className="relative flex flex-col lg:flex-row items-center gap-6 lg:gap-8 xl:gap-8 p-5 md:p-8 lg:p-6 xl:p-8 rounded-[32px] md:rounded-[40px] bg-[var(--surface)]/40 border border-[var(--border)] backdrop-blur-[40px] shadow-2xl w-full">
                    
                    {/* Analog/Digital Hybrid Clock */}
                    <div className="relative w-44 h-44 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-44 lg:h-44 xl:w-48 xl:h-48 flex items-center justify-center shrink-0">
                      {/* Clock Outer Ring */}
                      <div className="absolute inset-0 rounded-full border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] to-transparent shadow-inner" />
                      
                      {/* Hour Markers */}
                      {[...Array(12)].map((_, i) => (
                        <div 
                           key={i} 
                           className={`absolute rounded-full ${i % 3 === 0 ? 'w-1.5 h-4 bg-[var(--text)]/40' : 'w-0.5 h-2 bg-[var(--text)]/10'}`}
                           style={{ transform: `rotate(${i * 30}deg) translateY(-22px)` }}
                        />
                      ))}
 
                      {/* Hands */}
                      <motion.div 
                        className="absolute w-1.5 h-12 sm:h-14 md:h-18 lg:h-12 xl:h-15 bg-[var(--text)] rounded-full origin-bottom shadow-2xl z-20"
                        style={{ rotate: hoursDegrees, bottom: '50%', x: '-50%' }}
                      />
                      <motion.div 
                        className="absolute w-1 h-16 sm:h-18 md:h-24 lg:h-16 xl:h-20 bg-[var(--text)]/60 rounded-full origin-bottom shadow-xl z-20"
                        style={{ rotate: minutesDegrees, bottom: '50%', x: '-50%' }}
                      />
                      <motion.div 
                        className="absolute w-0.5 h-20 sm:h-22 md:h-28 lg:h-20 xl:h-22 bg-emerald-500 rounded-full origin-bottom z-30"
                        style={{ rotate: secondsDegrees, bottom: '50%', x: '-50%' }}
                      />
                      <div className="absolute w-3 h-3 rounded-full bg-[var(--text)] border-4 border-[var(--bg)] z-40 shadow-2xl" />
                    </div>
 
                    {/* Date & Context Info - Horizontal Layout */}
                    <div className="flex-1 flex flex-col gap-6 w-full">
                      {/* Top Row: Clock & Date */}
                      <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
                        {/* Digital Clock */}
                        <div className="flex items-baseline gap-1 bg-[var(--surface)] px-5 py-2.5 rounded-[20px] border border-[var(--border)] backdrop-blur-xl shadow-xl w-[171.65px] h-[72.8px] items-center justify-center md:w-auto md:h-auto">
                          <span className="text-[50px] font-normal md:text-6xl md:font-extralight text-[var(--text)] tracking-tighter leading-none">
                            {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[30px] md:text-lg font-medium text-emerald-500/60 tabular-nums">
                            {currentTime.toLocaleTimeString('pt-BR', { second: '2-digit' })}
                          </span>
                        </div>
 
                        {/* Date Info */}
                        <div className="flex flex-col items-center md:items-end text-center md:text-right">
                          <h2 className="text-[32px] md:text-4xl lg:text-3xl xl:text-4xl font-light text-[var(--text)] tracking-tight leading-none mb-1">
                            {currentTime.toLocaleDateString('pt-BR', { weekday: 'long' })}
                          </h2>
                          <p className="text-[20px] font-bold md:text-lg md:font-medium text-[var(--muted)] tracking-wide">
                            {currentTime.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
 
                      {/* Bottom Row: Period & Opportunity */}
                      <div className="flex flex-col md:flex-row lg:flex-col xl:flex-row items-center lg:items-start xl:items-center justify-between gap-4 md:gap-6 pt-6 border-t border-[var(--border)] w-full">
                        <div className="flex items-center gap-3 sm:gap-5 lg:gap-3 xl:gap-4 w-full md:w-auto justify-between md:justify-start">
                          <motion.div 
                            animate={{ scale: [1, 1.05, 1], rotate: [0, 3, -3, 0] }}
                            transition={{ duration: 6, repeat: Infinity }}
                            className="relative p-2.5 sm:p-3.5 rounded-[18px] sm:rounded-[22px] bg-[var(--surface)] border border-[var(--border)] backdrop-blur-2xl shadow-2xl overflow-hidden group"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--text)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            {getPeriodIcon()}
                          </motion.div>
                          
                          <div className="flex flex-col text-left">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[9px] sm:text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.4em]">Status Temporal</span>
                              {weather && (
                                <span className="text-[8px] sm:text-[9px] font-bold text-emerald-500/60 italic tracking-wide">{weather.city}</span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 sm:gap-3">
                              <span className="text-[20px] sm:text-[25px] font-bold md:text-xl lg:text-lg xl:text-lg md:font-light text-[var(--text)]/90">{getPeriodLabel()}</span>
                              {weather && (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="flex items-center gap-1.5 bg-[var(--surface)] pl-1.5 pr-2 py-0.5 sm:py-1 rounded-full border border-[var(--border)] backdrop-blur-3xl shadow-lg scale-90 sm:scale-100 xl:scale-95 origin-left"
                                >
                                  <div className="p-1 rounded-full bg-[var(--bg)]/5">
                                    {weather.icon}
                                  </div>
                                  <div className="flex flex-col leading-none">
                                    <span className="text-xs sm:text-sm font-medium text-[var(--text)] tabular-nums">{weather.temp}°C</span>
                                    <span className="text-[6px] sm:text-[7px] font-black uppercase text-[var(--muted)] tracking-widest">{weather.condition}</span>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </div>
 
                        {/* Visual Stimuli: Sun Path & Opportunity */}
                        <div className="flex items-center gap-3 sm:gap-4 xl:gap-4 w-full md:w-auto justify-between md:justify-end flex-wrap sm:flex-nowrap">
                          {weather && (
                            <div className="flex items-center gap-3 px-3 sm:px-3.5 py-1.5 rounded-xl bg-[var(--surface)]/20 border border-[var(--border)] shrink-0">
                              <div className="flex flex-col items-center gap-1">
                                <Sunrise size={11} className="text-amber-300/50" />
                                <span className="text-[9px] lg:text-[8.5px] xl:text-[9px] font-medium text-[var(--muted)] tabular-nums">{weather.sunrise}</span>
                              </div>
                              
                              {/* Visual Sun Path Line */}
                              <div className="relative w-8 xl:w-10 h-px bg-[var(--border)]">
                                <motion.div 
                                  animate={{ left: ['0%', '100%', '0%'] }}
                                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                  className="absolute top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-amber-400/40 blur-[1px]"
                                />
                              </div>
 
                              <div className="flex flex-col items-center gap-1">
                                <Moon size={11} className="text-indigo-300/50" />
                                <span className="text-[9px] lg:text-[8.5px] xl:text-[9px] font-medium text-[var(--muted)] tabular-nums">{weather.sunset}</span>
                              </div>
                            </div>
                          )}
 
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-2 px-3 py-2 xl:px-3.5 xl:py-2 rounded-[18px] bg-emerald-500/5 border border-emerald-500/10 backdrop-blur-md shadow-inner group cursor-default shrink-0"
                          >
                            <div className="relative">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                              <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-30" />
                            </div>
                            <div className="flex flex-col leading-snug">
                              <span className="text-[8px] sm:text-[8.5px] xl:text-[9px] font-black uppercase tracking-[0.2em] xl:tracking-[0.25em] text-emerald-500/80 group-hover:text-emerald-400 transition-colors">Janela de Oportunidade</span>
                              <span className="text-[7px] sm:text-[7.5px] font-medium text-emerald-500/30 uppercase tracking-[0.06em] xl:tracking-[0.08em]">Sistema Operacional Ativo</span>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
 
        </motion.div>


      </header>

      {/* Layer 3: Objectives Section - Standardized to z-20 with transparent background to show Layer 1 */}
      <section className="relative z-20 pb-20 bg-transparent">
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="px-[18px] md:px-16 mb-12 flex flex-col items-center w-full gap-8"
        >
          {/* Centered Stylized Main Title */}
          <div className="relative group w-full flex flex-col items-center">
            <div 
              className="relative z-20 flex items-center gap-4 mb-[9px] pt-0 pb-0 h-[65.654px]"
              style={{ marginTop: '-50px' }}
            >
              <motion.div 
                initial={{ scaleX: 0, rotate: 0 }}
                whileInView={{ scaleX: 1 }}
                animate={{ 
                  rotate: [0, 0, 90, 90, 90, 90, 90, 0, 0],
                  y: [0, 0, 0, -12, 12, 0, 0, 0, 0],
                  scaleX: [1, 1, 1, 1, 1, 1, 1, 1, 1]
                }}
                transition={{ 
                  duration: 10, 
                  repeat: Infinity,
                  times: [0, 0.3, 0.4, 0.5, 0.6, 0.75, 0.85, 0.95, 1],
                  ease: "easeInOut",
                  scaleX: { duration: 1, delay: 0.5 }
                }}
                className="h-px w-12 bg-emerald-500 origin-center"
              />
            <div className="flex flex-col items-center gap-2 mb-[-3px]">
              <AnimatedRocket color="#10b981" intense={true} />
              <span 
                className="font-black uppercase tracking-[0.6em] text-[12px] md:text-[22px]" 
                style={{ marginTop: '-65px', color: '#10b981' }}
              >
                Mural de Metas
              </span>
            </div>
              <motion.div 
                initial={{ scaleX: 0, rotate: 0 }}
                whileInView={{ scaleX: 1 }}
                animate={{ 
                  rotate: [0, 0, 90, 90, 90, 90, 90, 0, 0],
                  y: [0, 0, 0, -12, 12, 0, 0, 0, 0],
                  scaleX: [1, 1, 1, 1, 1, 1, 1, 1, 1]
                }}
                transition={{ 
                  duration: 10, 
                  repeat: Infinity,
                  times: [0, 0.3, 0.4, 0.5, 0.6, 0.75, 0.85, 0.95, 1],
                  ease: "easeInOut",
                  scaleX: { duration: 1, delay: 0.5 }
                }}
                className="h-px w-12 bg-emerald-500 origin-center"
              />
            </div>
            
            <h2 className="text-[55px] md:text-[140px] font-black uppercase tracking-tighter leading-[0.8] text-[var(--text)] text-center relative">
               <span className="relative z-10 animate-foco-silver-glow inline-block">Objetivos</span>
               {/* Animated Background Text Effect - Centered */}
               <motion.span 
                 initial={{ opacity: 0 }}
                 whileInView={{ opacity: 0.03 }}
                 className="absolute -top-4 left-1/2 -translate-x-1/2 text-[70px] md:text-[160px] pointer-events-none select-none z-0 whitespace-nowrap"
               >
                 OB J ET IV OS
               </motion.span>
               

            </h2>
            
            <div className="mt-8 md:mt-12 flex items-center justify-center flex-col w-full gap-8 pl-[13px]">
              <div className="flex flex-col items-center gap-4">
                <p className="text-[10px] md:text-xs font-medium text-[var(--muted)] max-w-sm text-center leading-relaxed tracking-wide uppercase">
                  Mapeamento estratégico de metas e conquistas em tempo real.
                </p>
                {/* Carousel indicators removed as per user request */}
                <div className="flex gap-1.5 opacity-0 pointer-events-none">
                  <div className={`w-1 h-1 rounded-full ${viewMode === 'grid' ? 'bg-emerald-500' : 'bg-transparent'}`} />
                </div>
              </div>

              {/* View Mode Toggle - Standardized to z-30 */}
              <div className="flex items-center p-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-full backdrop-blur-2xl shadow-2xl gap-1 z-30 relative h-[42px]">
                <button 
                  onClick={() => setIsReordering(!isReordering)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-500 ${isReordering ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
                  title={isReordering ? "Salvar Ordem" : "Reordenar Objetivos"}
                >
                  <Settings2 size={14} className={isReordering ? 'animate-spin-slow' : ''} />
                  <span className="text-[9px] font-black uppercase tracking-widest">{isReordering ? 'Salvar' : 'Organizar'}</span>
                </button>

                <div className="w-px h-4 bg-[var(--border)] mx-1" />

                <button 
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-3 px-6 py-2 rounded-full transition-all duration-500 ${viewMode === 'grid' ? 'bg-[var(--bg)] text-[var(--text)] shadow-lg' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
                >
                  <motion.div animate={{ rotate: viewMode === 'grid' ? 0 : 90 }}>
                    <Zap size={14} className={viewMode === 'grid' ? 'text-emerald-500' : ''} />
                  </motion.div>
                  <span className="text-[9px] font-black uppercase tracking-widest">Geral</span>
                </button>
                <button 
                  onClick={() => setViewMode('carousel')}
                  className={`flex items-center gap-3 px-6 py-2 rounded-full transition-all duration-500 ${viewMode === 'carousel' ? 'bg-[var(--bg)] text-[var(--text)] shadow-lg' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
                >
                  <motion.div animate={{ rotate: viewMode === 'carousel' ? 0 : -90 }}>
                    <Maximize2 size={14} className={viewMode === 'carousel' ? 'text-emerald-500' : ''} />
                  </motion.div>
                  <span className="text-[9px] font-black uppercase tracking-widest">Foco</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {viewMode === 'carousel' ? (
            <motion.div
              key="carousel-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="w-full overflow-x-auto no-scrollbar relative"
              ref={carouselRef}
            >
              <div className="flex gap-6 px-6 pt-12 pb-12 w-max relative">
    <Reorder.Group 
      axis="x" 
      values={objectives} 
      onReorder={handleReorder}
      className="flex gap-6 relative"
      style={{ cursor: isReordering ? 'default' : 'grab' }}
    >
      {objectives.map((obj) => (
        <ObjectiveCard 
          key={obj.id} 
          objective={obj} 
          isActive={activeVideoId === obj.id}
          isReordering={isReordering}
          isHolding={holdingItemId === obj.id}
          onHoldStart={() => handleHoldStart(obj.id)}
          onHoldEnd={handleHoldEnd}
          onDeleteRequest={() => setItemToDelete(obj)}
          onVideoToggle={() => setActiveVideoId(activeVideoId === obj.id ? null : obj.id)}
          onOpen={() => setSelectedObjectiveId(obj.id)}
          dragConstraints={carouselRef}
        />
      ))}
    </Reorder.Group>
                
                {/* Add New Objective Placeholder / Form - OUTSIDE Reorder.Group */}
                <AnimatePresence mode="wait">
                  {!isAdding ? (
                    <motion.div 
                      key="add-button"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => setSelectedObjectiveId('new')}
                      className="min-w-[280px] md:min-w-[360px] h-[440px] rounded-[32px] border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-4 text-zinc-600 hover:text-zinc-400 hover:border-white/10 transition-all cursor-pointer"
                    >
                      <div className="p-4 rounded-full bg-[var(--surface)]">
                        <Plus size={32} />
                      </div>
                      <span className="font-bold uppercase tracking-widest text-xs">Novo Objetivo</span>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="add-form"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="min-w-[280px] md:min-w-[360px] h-[440px] rounded-[32px] bg-[var(--surface)] border border-[var(--border)] p-8 flex flex-col justify-between"
                    >
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black tracking-widest uppercase text-[var(--muted)]">Novo Objetivo</span>
                          <button onClick={() => setIsAdding(false)} className="text-[var(--muted)] hover:text-[var(--text)]">
                            <ChevronLeft size={20} />
                          </button>
                        </div>
                        <input 
                          autoFocus
                          placeholder="Qual o seu próximo grande alvo?"
                          className="w-full bg-transparent text-2xl font-bold text-[var(--text)] placeholder:text-[var(--muted)]/50 outline-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value) {
                              handleAddObjective(e.currentTarget.value);
                            }
                          }}
                        />
                        <p className="text-sm text-[var(--muted)] leading-relaxed">
                          Defina um objetivo que impulsione sua visão de futuro.
                        </p>
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          const input = e.currentTarget.parentElement?.querySelector('input');
                          if (input?.value) handleAddObjective(input.value);
                        }}
                        className="w-full py-4 rounded-2xl bg-[var(--text)] text-[var(--bg)] font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all"
                      >
                        Criar Objetivo
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="grid-view"
              variants={gridVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="px-8 md:px-16 pt-12 pb-20"
              ref={gridRef}
            >
              <Reorder.Group 
                axis="y" 
                values={objectives} 
                onReorder={handleReorder}
                className={isReordering 
                  ? "flex flex-col gap-4 max-w-2xl mx-auto relative" 
                  : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6 relative"
                }
              >
                {objectives.map((obj) => (
                  <CompactObjectiveCard 
                    key={obj.id} 
                    objective={obj} 
                    isReordering={isReordering}
                    isHolding={holdingItemId === obj.id}
                    onHoldStart={() => handleHoldStart(obj.id)}
                    onHoldEnd={handleHoldEnd}
                    onDeleteRequest={() => setItemToDelete(obj)}
                    onOpen={() => setSelectedObjectiveId(obj.id)}
                    dragConstraints={gridRef}
                  />
                ))}
                
                {/* Add New in Grid - Inside Reorder.Group but not draggable if possible, 
                    actually Reorder.Group children MUST be Reorder.Item. 
                    So we'll use a regular motion.div and hope it doesn't break the list.
                    Actually, it's better to keep it outside but the grid will break.
                    Let's use a wrapper. */}
                <motion.div 
                  layout
                  variants={cardVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedObjectiveId('new')}
                  className="aspect-[4/5] rounded-3xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-3 text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--primary)]/20 transition-all cursor-pointer bg-[var(--surface)]/20"
                >
                  <Plus size={24} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Novo Alvo</span>
                </motion.div>
              </Reorder.Group>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Timeline Section */}
      <section className="px-6 mt-12 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-10 group">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[var(--border)]" />
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#ffffff] whitespace-nowrap flex items-center gap-4">
            Fluxo de Execução
            <button 
              onClick={() => {
                setNewItemTitle('');
                setIsAddingTask(true);
              }}
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-[var(--primary)] text-white/50 hover:text-white border border-white/10 transition-all text-[8px] tracking-[0.2em] flex items-center gap-2 opacity-50 group-hover:opacity-100"
            >
              <Plus size={10} /> NOVA TAREFA
            </button>
          </h2>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[var(--border)]" />
        </div>

        <div className="relative space-y-8 pl-8 border-l border-[var(--border)]">
          {timelineItems.length > 0 ? (
            timelineItems.map((item, idx) => (
              <TimelineItem 
                key={item.id} 
                item={item} 
                index={idx} 
                onComplete={() => {
                  if (item.executionType === 'energy-work') {
                    setExecutingTask(item);
                  } else {
                    fakeDB.completeTask(item.id);
                    setData(fakeDB.getAll());
                  }
                }}
              />
            ))
          ) : (
            <div className="py-20 text-center opacity-20">
              <Activity size={48} className="mx-auto mb-4" />
              <p>Nenhuma atividade registrada para hoje.</p>
            </div>
          )}
        </div>
      </section>
      {/* Objective Central Detail View */}
      <AnimatePresence>
        {selectedObjectiveId && (
          <ObjectiveCentral 
            objectiveId={selectedObjectiveId} 
            initialView={centralInitialView}
            initialOpenMetaBuilder={centralOpenMeta}
            initialOpenTaskBuilder={centralOpenTask}
            initialMetaId={centralMetaId}
            onClose={() => {
              setSelectedObjectiveId(null);
              setCentralInitialView('dashboard');
              setCentralOpenMeta(false);
              setCentralOpenTask(false);
              setCentralMetaId(undefined);
            }} 
          />
        )}
      </AnimatePresence>

      {/* Objective Selector Modal for Meta/Task creation */}
      <AnimatePresence>
        {objectiveSelectPurpose && (
          <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setObjectiveSelectPurpose(null);
                setSelectedObjectiveForTaskUnit(null);
              }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-[#0d0d0e]/95 border border-white/10 rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl overflow-hidden text-white"
            >
              {/* Background gradient glow */}
              <div className="absolute -top-12 -left-12 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-widest text-[#bae1ff]">
                      {objectiveSelectPurpose === 'meta' 
                        ? 'Criar Nova Meta' 
                        : selectedObjectiveForTaskUnit 
                          ? 'Escolha a Meta da Tarefa' 
                          : 'Criar Nova Tarefa'}
                    </h3>
                    <p className="text-[10px] font-semibold text-zinc-400 mt-1 uppercase tracking-wider">
                      {objectiveSelectPurpose === 'meta' 
                        ? 'Selecione o Objetivo correspondente' 
                        : selectedObjectiveForTaskUnit 
                          ? `Objetivo: ${selectedObjectiveForTaskUnit.title}` 
                          : 'Passo 1: Selecione o Objetivo'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedObjectiveForTaskUnit && (
                      <button 
                        onClick={() => setSelectedObjectiveForTaskUnit(null)}
                        className="p-2 hover:bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors"
                        title="Voltar ao Objetivo"
                      >
                        <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        setObjectiveSelectPurpose(null);
                        setSelectedObjectiveForTaskUnit(null);
                      }}
                      className="p-2 hover:bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                </div>

                {data.objectives.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-4xl text-zinc-650 mb-2">rocket_launch</span>
                    <p className="text-sm font-bold text-zinc-450">Nenhum objetivo encontrado.</p>
                    <p className="text-xs text-zinc-500 mt-1">Crie um objetivo primeiro antes de adicionar metas e tarefas.</p>
                    <button
                      onClick={() => {
                        setObjectiveSelectPurpose(null);
                        setSelectedObjectiveForTaskUnit(null);
                        handleCreateObjective();
                      }}
                      className="mt-6 px-6 py-3 bg-gradient-to-r from-teal-500 to-purple-600 text-white rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
                    >
                      Criar Novo Objetivo
                    </button>
                  </div>
                ) : !selectedObjectiveForTaskUnit ? (
                  /* STEP 1: SELECT OBJECTIVE */
                  <div className="space-y-3 max-h-[350px] overflow-y-auto no-scrollbar pr-1 py-1">
                    {data.objectives.map((obj) => (
                      <motion.button
                        key={obj.id}
                        whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => {
                          if (objectiveSelectPurpose === 'meta') {
                            setCentralInitialView('goals-overview');
                            setCentralOpenMeta(true);
                            setSelectedObjectiveId(obj.id);
                            setObjectiveSelectPurpose(null);
                          } else {
                            // Task creation requires selecting target Meta too
                            const matchingObj = data.objectives.find(o => o.id === obj.id);
                            const metas = matchingObj?.metas || [];
                            if (metas.length === 0) {
                              // Force creating meta first
                              setSelectedObjectiveForTaskUnit({
                                ...obj,
                                metas: []
                              });
                            } else {
                              setSelectedObjectiveForTaskUnit(matchingObj || obj);
                            }
                          }
                        }}
                        className="w-full text-left p-4 bg-white/[0.02] border border-white/5 hover:border-white/20 rounded-[1.5rem] transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-white/15 flex items-center justify-center text-[#bae1ff] group-hover:text-purple-400 transition-colors">
                            <span className="material-symbols-outlined text-xl">rocket_launch</span>
                          </div>
                          <div>
                            <p className="text-sm font-extrabold tracking-tight group-hover:text-teal-300 transition-colors">
                              {obj.title}
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-0.5">
                              {obj.category || 'Geral'}
                            </p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-sm text-zinc-650 group-hover:text-white group-hover:translate-x-1 transition-all">
                          chevron_right
                        </span>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  /* STEP 2: SELECT META inside the chosen objective */
                  <div className="space-y-3">
                    {(!selectedObjectiveForTaskUnit.metas || selectedObjectiveForTaskUnit.metas.length === 0) ? (
                      <div className="text-center py-6">
                        <span className="material-symbols-outlined text-4xl text-rose-500/80 mb-2">warning</span>
                        <p className="text-sm font-bold text-zinc-300">Sem metas neste Objetivo</p>
                        <p className="text-xs text-zinc-500 mt-2 max-w-sm mx-auto leading-relaxed">
                          Para criar uma tarefa, você precisa de pelo menos uma Meta (goal) registrada neste objetivo para vinculá-la.
                        </p>
                        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-2">
                          <button
                            onClick={() => setSelectedObjectiveForTaskUnit(null)}
                            className="px-5 py-2.5 border border-white/10 text-white rounded-full font-bold text-xs uppercase tracking-wider hover:bg-white/5"
                          >
                            Mudar Objetivo
                          </button>
                          <button
                            onClick={() => {
                              const targetId = selectedObjectiveForTaskUnit.id;
                              setObjectiveSelectPurpose(null);
                              setSelectedObjectiveForTaskUnit(null);
                              setCentralInitialView('goals-overview');
                              setCentralOpenMeta(true);
                              setSelectedObjectiveId(targetId);
                            }}
                            className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-purple-600 text-white rounded-full font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all shadow-md"
                          >
                            Criar Meta para {selectedObjectiveForTaskUnit.title}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-zinc-500 mb-2">Selecione para qual meta deseja criar a tarefa:</p>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar pr-1 py-1">
                          {selectedObjectiveForTaskUnit.metas.map((meta: any) => (
                            <motion.button
                              key={meta.id}
                              whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => {
                                setCentralInitialView('goals-overview');
                                setCentralOpenTask(true);
                                setCentralMetaId(meta.id);
                                setSelectedObjectiveId(selectedObjectiveForTaskUnit.id);
                                setObjectiveSelectPurpose(null);
                                setSelectedObjectiveForTaskUnit(null);
                              }}
                              className="w-full text-left p-4 bg-white/[0.01]/70 hover:bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-[1.5rem] transition-all flex items-center justify-between group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-teal-400 group-hover:text-teal-300 transition-colors">
                                  <span className="material-symbols-outlined text-base">flag</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs md:text-sm font-bold tracking-tight text-white group-hover:text-teal-300 transition-colors truncate">
                                    {meta.intention || 'Meta sem nome'}
                                  </p>
                                </div>
                              </div>
                              <span className="material-symbols-outlined text-xs text-zinc-650 group-hover:text-white transition-all">
                                flex_direction
                              </span>
                            </motion.button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <UnifiedFinanceModal 
        isOpen={isFinanceModalOpen}
        onClose={() => setIsFinanceModalOpen(false)}
        initialTab={financeTab}
        categories={categories}
        onRefreshCategories={onRefreshCategories}
      />

      {/* AI Notifications Sidebar */}
      <AnimatePresence>
        {showNotifications && (() => {
          const isDark = theme === 'dark';

          // Pre-calculate filter items and layouts locally for elegant grouping
          const filters = [
            { id: 'all', label: 'Tudo', icon: <LayoutGrid size={14} /> },
            { id: 'today', label: 'Hoje', icon: <Calendar size={14} /> },
            { id: 'week', label: 'Semana', icon: <Clock size={14} /> },
            { id: 'insights', label: 'Insights', icon: <Zap size={14} /> },
            { id: 'patterns', label: 'Padrões', icon: <Activity size={14} /> },
            { id: 'amparadora', label: 'Amparadora', icon: <Sparkles size={14} /> },
            { id: 'important', label: 'Urgente', icon: <AlertCircle size={14} /> },
          ];

          const filterCounts = {
            all: aiNotifications.length,
            today: aiNotifications.filter(n => n.groups?.includes('today')).length,
            week: aiNotifications.filter(n => n.groups?.includes('week')).length,
            insights: aiNotifications.filter(n => n.groups?.includes('insights')).length,
            patterns: aiNotifications.filter(n => n.groups?.includes('patterns')).length,
            amparadora: aiNotifications.filter(n => n.groups?.includes('amparadora')).length,
            important: aiNotifications.filter(n => n.groups?.includes('important')).length,
          };

          // Inner breathing component for Amparadora expanded card
          const ExpandedBreather = () => {
            const [phase, setPhase] = useState<'Inalar' | 'Reter' | 'Exalar'>('Inalar');
            const [sec, setSec] = useState(4);

            useEffect(() => {
              const timer = setInterval(() => {
                setSec(p => {
                  if (p <= 1) {
                    if (phase === 'Inalar') { setPhase('Reter'); return 4; }
                    else if (phase === 'Reter') { setPhase('Exalar'); return 4; }
                    else { setPhase('Inalar'); return 4; }
                  }
                  return p - 1;
                });
              }, 1000);
              return () => clearInterval(timer);
            }, [phase]);

            return (
              <div className={`mt-4 p-5 rounded-3xl flex flex-col items-center justify-center gap-4 border transition-all duration-300 ${
                isDark ? 'bg-amber-500/5 border-amber-500/10' : 'bg-amber-500/[0.04] border-amber-500/20 shadow-xs'
              }`}>
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
                  <Sparkles size={10} className="animate-pulse" />
                  <span>Respirador Harmonizador Coletivo</span>
                </div>
                
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <motion.div
                    animate={{
                      scale: phase === 'Inalar' ? [1, 1.9, 1.9] : phase === 'Reter' ? 1.9 : [1.9, 1, 1],
                      opacity: phase === 'Inalar' ? [0.35, 0.7, 0.7] : phase === 'Reter' ? 0.7 : [0.7, 0.35, 0.35],
                    }}
                    transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
                    className="absolute w-14 h-14 rounded-full bg-amber-400/20 dark:bg-amber-400/15 blur-md"
                  />
                  <motion.div
                    animate={{
                      scale: phase === 'Inalar' ? [1, 1.5] : phase === 'Reter' ? 1.5 : [1.5, 1],
                    }}
                    transition={{ duration: 4, ease: "easeInOut" }}
                    className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-md shadow-amber-500/15 z-10"
                  />
                </div>

                <div className="flex flex-col items-center text-center">
                  <span className="text-[13px] font-black text-amber-700 dark:text-amber-300 uppercase tracking-[0.15em]">{phase}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-1">
                    Segure o fluxo por {sec}s
                  </span>
                </div>
              </div>
            );
          };

          const renderModularCard = (notif: any, idx: number) => {
            const isExpanded = expandedNotifId === notif.id;

            let cardStyle = isDark 
              ? "bg-[#0b0c0f]/92 border-white/[0.05] hover:border-white/15 text-white shadow-[0_15px_32px_rgba(0,0,0,0.5),0_4px_20px_rgba(192,192,192,0.18),inset_0_1px_3px_rgba(192,192,192,0.30)] hover:shadow-[0_24px_48px_rgba(0,0,0,0.7),0_8px_32px_rgba(192,192,192,0.32),inset_0_1px_4px_rgba(192,192,192,0.45)] backdrop-blur-md"
              : "bg-white border-black/[0.06] hover:border-black/15 shadow-sm text-slate-900";
            
            let typeLabel = notif.type;
            let labelStyle = isDark ? "bg-white/5 border-white/10 text-white/60" : "bg-slate-100 border-slate-200 text-slate-600";
            let pulseGlow = false;
            let actionBtnBg = isDark ? "bg-white/10 text-white hover:bg-emerald-500 hover:text-black" : "bg-slate-100 text-slate-800 hover:bg-emerald-500 hover:text-white";
            let actionTextColor = isDark ? "text-white/40 group-hover/link:text-white" : "text-slate-500 group-hover/link:text-slate-900";
  
            // Type customization based on theme/color
            switch (notif.type) {
              case 'performance':
                cardStyle = isDark 
                  ? "bg-[#050a08]/92 border-emerald-500/10 hover:border-emerald-500/25 hover:bg-[#080f0c]/92 text-white shadow-[0_15px_32px_rgba(0,0,0,0.5),0_4px_20px_rgba(192,192,192,0.18),inset_0_1px_3px_rgba(192,192,192,0.30)] hover:shadow-[0_24px_48px_rgba(0,0,0,0.7),0_8px_32px_rgba(192,192,192,0.32),inset_0_1px_4px_rgba(192,192,192,0.45)] backdrop-blur-md"
                  : "bg-emerald-50/70 border-emerald-200/80 hover:bg-emerald-50 hover:border-emerald-300 shadow-[0_2px_12px_rgba(16,185,129,0.02)] text-slate-900";
                typeLabel = "Insight Adaptativo";
                labelStyle = isDark ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-500/10 border-emerald-500/15 text-emerald-800 font-bold";
                if (!isDark) {
                  actionBtnBg = "bg-emerald-500/10 text-emerald-800 hover:bg-emerald-500 hover:text-white";
                  actionTextColor = "text-emerald-700/60 group-hover/link:text-emerald-900";
                }
                break;
              case 'alert':
                cardStyle = isDark 
                  ? "bg-[#0d0506]/92 border-rose-500/15 hover:border-rose-500/25 hover:bg-[#12080a]/92 text-white shadow-[0_15px_32px_rgba(0,0,0,0.5),0_4px_20px_rgba(192,192,192,0.18),inset_0_1px_3px_rgba(192,192,192,0.30)] hover:shadow-[0_24px_48px_rgba(0,0,0,0.7),0_8px_32px_rgba(192,192,192,0.32),inset_0_1px_4px_rgba(192,192,192,0.45)] backdrop-blur-md"
                  : "bg-rose-50/70 border-rose-200/80 hover:bg-rose-50 hover:border-rose-300 shadow-[0_2px_12px_rgba(244,63,94,0.02)] text-slate-900";
                typeLabel = "Alerta Existencial";
                labelStyle = isDark ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-rose-500/15 border-rose-500/20 text-rose-800 font-bold";
                pulseGlow = true;
                if (!isDark) {
                  actionBtnBg = "bg-rose-500/10 text-rose-800 hover:bg-rose-500 hover:text-white";
                  actionTextColor = "text-rose-700/60 group-hover/link:text-rose-900";
                }
                break;
              case 'pattern':
                cardStyle = isDark 
                  ? "bg-[#04060b]/92 border-blue-500/10 hover:border-blue-500/25 hover:bg-[#07090f]/92 text-white shadow-[0_15px_32px_rgba(0,0,0,0.5),0_4px_20px_rgba(192,192,192,0.18),inset_0_1px_3px_rgba(192,192,192,0.30)] hover:shadow-[0_24px_48px_rgba(0,0,0,0.7),0_8px_32px_rgba(192,192,192,0.32),inset_0_1px_4px_rgba(192,192,192,0.45)] backdrop-blur-md"
                  : "bg-blue-50/70 border-blue-200/80 hover:bg-blue-50 hover:border-blue-300 shadow-[0_2px_12px_rgba(59,130,246,0.02)] text-slate-900";
                typeLabel = "Padrão Detectado";
                labelStyle = isDark ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-blue-500/15 border-blue-500/20 text-blue-800 font-bold";
                if (!isDark) {
                  actionBtnBg = "bg-blue-500/10 text-blue-800 hover:bg-blue-500 hover:text-white";
                  actionTextColor = "text-blue-700/60 group-hover/link:text-blue-900";
                }
                break;
              case 'direction':
                cardStyle = isDark 
                  ? "bg-[#04040a]/92 border-indigo-500/10 hover:border-indigo-500/25 hover:bg-[#07070f]/92 text-white shadow-[0_15px_32px_rgba(0,0,0,0.5),0_4px_20px_rgba(192,192,192,0.18),inset_0_1px_3px_rgba(192,192,192,0.30)] hover:shadow-[0_24px_48px_rgba(0,0,0,0.7),0_8px_32px_rgba(192,192,192,0.32),inset_0_1px_4px_rgba(192,192,192,0.45)] backdrop-blur-md"
                  : "bg-indigo-50/70 border-indigo-200/80 hover:bg-indigo-50 hover:border-indigo-300 shadow-[0_2px_12px_rgba(99,102,241,0.02)] text-slate-900";
                typeLabel = "Direção Existencial";
                labelStyle = isDark ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-indigo-500/15 border-indigo-500/20 text-indigo-800 font-bold";
                if (!isDark) {
                  actionBtnBg = "bg-indigo-500/10 text-indigo-800 hover:bg-indigo-500 hover:text-white";
                  actionTextColor = "text-indigo-700/60 group-hover/link:text-indigo-900";
                }
                break;
              case 'amparadora':
                cardStyle = isDark 
                  ? "bg-[#0c0906]/92 border-amber-500/10 hover:border-amber-500/25 hover:bg-[#110e0a]/92 shadow-[0_15px_32px_rgba(0,0,0,0.5),0_4px_20px_rgba(192,192,192,0.18),inset_0_1px_3px_rgba(192,192,192,0.30)] hover:shadow-[0_24px_48px_rgba(0,0,0,0.7),0_8px_32px_rgba(192,192,192,0.32),inset_0_1px_4px_rgba(192,192,192,0.45)] text-white backdrop-blur-md"
                  : "bg-amber-50/80 border-amber-200 hover:bg-amber-50 hover:border-amber-300 shadow-[0_4px_16px_rgba(245,158,11,0.03)] text-slate-900";
                typeLabel = "Amparadora";
                labelStyle = isDark 
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-500 font-serif italic text-[11px] tracking-wide normal-case"
                  : "bg-amber-500/15 border-amber-500/20 text-amber-800 font-serif italic text-[11.5px] tracking-wide normal-case font-bold";
                if (!isDark) {
                  actionBtnBg = "bg-amber-500/15 text-amber-900 hover:bg-amber-500 hover:text-white";
                  actionTextColor = "text-amber-800/60 group-hover/link:text-amber-950";
                }
                break;
            }

            const bodyTextColor = isDark 
              ? (notif.type === 'amparadora' ? 'text-amber-100/85' : 'text-slate-200/80') 
              : (notif.type === 'amparadora' ? 'text-amber-950/90' : 'text-slate-700/90');

            let expandedRingClass = '';
            if (isExpanded) {
              switch (notif.type) {
                case 'performance':
                  expandedRingClass = isDark ? 'ring-2 ring-emerald-500/50' : 'ring-2 ring-emerald-500/40';
                  break;
                case 'alert':
                  expandedRingClass = isDark ? 'ring-2 ring-rose-500/50' : 'ring-2 ring-rose-500/40';
                  break;
                case 'pattern':
                  expandedRingClass = isDark ? 'ring-2 ring-blue-500/50' : 'ring-2 ring-blue-500/40';
                  break;
                case 'direction':
                  expandedRingClass = isDark ? 'ring-2 ring-indigo-500/50' : 'ring-2 ring-indigo-500/40';
                  break;
                case 'amparadora':
                  expandedRingClass = isDark ? 'ring-2 ring-amber-500/50' : 'ring-2 ring-amber-500/40';
                  break;
                default:
                  expandedRingClass = isDark ? 'ring-2 ring-emerald-500/30' : 'ring-2 ring-emerald-500/30';
              }
            }

            return (
              <div className={`flex gap-3 sm:gap-4 group/card relative ${pulseGlow ? 'before:absolute before:-inset-2 before:-z-10 before:rounded-[2.5rem] before:bg-rose-500/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:blur-md' : ''}`}>
                
                {/* Timeline Axis Bullet node */}
                <span className="shrink-0 pt-2.5 flex flex-col items-center">
                  <span className={`w-3.5 h-3.5 rounded-full border-2 bg-[var(--surface)] z-20 transition-all duration-500 group-hover/card:scale-125 shadow-[0_0_15px_rgba(0,0,0,0.1)] ${
                    notif.priority === 'high' 
                      ? 'border-emerald-500 shadow-emerald-500/20' 
                      : notif.type === 'alert'
                        ? 'border-rose-500 shadow-rose-500/20'
                        : notif.type === 'amparadora'
                          ? 'border-amber-400 shadow-amber-400/20'
                          : 'border-[var(--border)]'
                  }`} />
                </span>

                {/* Main Card Frame */}
                <div 
                  onClick={() => {
                    setExpandedNotifId(isExpanded ? null : notif.id);
                    if (typeof haptics !== 'undefined') haptics.lightClick();
                  }}
                  className={`flex-1 p-4 sm:p-5 md:p-6 rounded-[2rem] sm:rounded-[2.5rem] border-2 transition-all duration-350 select-none backdrop-blur-3xl shadow-md hover:shadow-lg overflow-hidden relative cursor-pointer ${cardStyle} ${expandedRingClass}`}
                >
                  {/* Subtle dynamic silver (prata) inner shadows/gradients */}
                  <div 
                    className={`absolute inset-[2px] pointer-events-none z-0 overflow-hidden rounded-[calc(2.5rem-2px)] select-none isolate ${
                      isDark ? 'mix-blend-screen' : 'mix-blend-multiply'
                    }`}
                    style={{ transform: 'translate3d(0, 0, 0)', WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
                  >
                    {/* Using idx % 5 to set different directions/alignments for the silver highlight inside different cards */}
                    {idx % 5 === 0 && (
                      <div 
                        className="absolute -top-6 -left-6 w-44 h-44 filter blur-md"
                        style={{
                          borderRadius: '42% 58% 70% 30% / 45% 45% 55% 55%',
                          transform: 'rotate(-5deg)',
                          background: isDark 
                            ? 'linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(203,213,225,0.2) 50%, transparent 100%)' 
                            : 'linear-gradient(135deg, rgba(148,163,184,0.35) 0%, rgba(203,213,225,0.15) 50%, transparent 100%)'
                        }}
                      />
                    )}
                    {idx % 5 === 1 && (
                      <div 
                        className="absolute -bottom-8 -right-8 w-48 h-48 filter blur-md"
                        style={{
                          borderRadius: '70% 30% 52% 48% / 60% 40% 60% 40%',
                          transform: 'rotate(50deg)',
                          background: isDark 
                            ? 'linear-gradient(315deg, rgba(255,255,255,0.45) 0%, rgba(203,213,225,0.2) 50%, transparent 100%)' 
                            : 'linear-gradient(315deg, rgba(148,163,184,0.35) 0%, rgba(203,213,225,0.15) 50%, transparent 100%)'
                        }}
                      />
                    )}
                    {idx % 5 === 2 && (
                      <div 
                        className="absolute -top-6 -right-6 w-44 h-44 filter blur-md"
                        style={{
                          borderRadius: '35% 65% 30% 70% / 51% 49% 51% 49%',
                          transform: 'rotate(-30deg)',
                          background: isDark 
                            ? 'linear-gradient(225deg, rgba(255,255,255,0.45) 0%, rgba(203,213,225,0.2) 50%, transparent 100%)' 
                            : 'linear-gradient(225deg, rgba(148,163,184,0.35) 0%, rgba(203,213,225,0.15) 50%, transparent 100%)'
                        }}
                      />
                    )}
                    {idx % 5 === 3 && (
                      <div 
                        className="absolute -bottom-8 -left-8 w-48 h-48 filter blur-md"
                        style={{
                          borderRadius: '58% 42% 52% 48% / 40% 60% 40% 60%',
                          transform: 'rotate(80deg)',
                          background: isDark 
                            ? 'linear-gradient(45deg, rgba(255,255,255,0.45) 0%, rgba(203,213,225,0.2) 50%, transparent 100%)' 
                            : 'linear-gradient(45deg, rgba(148,163,184,0.35) 0%, rgba(203,213,225,0.15) 50%, transparent 100%)'
                        }}
                      />
                    )}
                    {idx % 5 === 4 && (
                      <div 
                        className="absolute top-0 bottom-0 left-0 w-24 filter blur-sm"
                        style={{
                          borderRadius: '25% 75% 60% 40% / 55% 35% 65% 45%',
                          transform: 'rotate(-12deg)',
                          background: isDark 
                            ? 'linear-gradient(90deg, rgba(255,255,255,0.4) 0%, rgba(203,213,225,0.15) 50%, transparent 100%)' 
                            : 'linear-gradient(90deg, rgba(148,163,184,0.35) 0%, rgba(203,213,225,0.1) 50%, transparent 100%)'
                        }}
                      />
                    )}
                    {/* Premium border framing to enhance depth */}
                    <div className={`absolute inset-[1px] rounded-[calc(2.5rem-3px)] border pointer-events-none ${
                        isDark ? 'border-white/20' : 'border-slate-300/10'
                    }`} />
                  </div>
                  {/* Atmospheric blurs inside individual card types */}
                  {notif.type === 'amparadora' && (
                    <div className="absolute -right-12 -top-12 w-28 h-28 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover/card:bg-amber-500/10 transition-colors" />
                  )}
                  {notif.type === 'direction' && (
                    <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none group-hover/card:bg-indigo-500/10 transition-colors" />
                  )}

                  {/* Top line metadata */}
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className={`flex items-center gap-2 py-1 px-3.5 rounded-full border text-[9px] font-black uppercase tracking-widest shadow-xs ${labelStyle}`}>
                      <span className="scale-110 shrink-0">{notif.icon}</span>
                      {typeLabel}
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-widest tabular-nums">{notif.time}</span>
                  </div>

                  {/* Body textual content */}
                  <div className="relative z-10">
                    <h3 className={`text-sm md:text-base font-black mb-2.5 tracking-tight leading-snug ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {notif.title}
                    </h3>
                    
                    <p className={`text-[13px] md:text-[14px] leading-relaxed tracking-normal ${bodyTextColor} ${
                      notif.type === 'amparadora' 
                        ? 'font-serif italic tracking-wide leading-relaxed text-[14px] md:text-[15px]' 
                        : 'font-medium'
                    } ${isExpanded ? 'mb-4' : 'mb-3'}`}>
                      {notif.message}
                    </p>
                  </div>

                  {/* Modular Visualizer Section */}
                  
                  {/* TYPE 1: Adaptative Insight - columns graph chart */}
                  {notif.type === 'performance' && notif.trend && (
                    <div className={`rounded-3xl p-4 mb-4 border shadow-xs relative z-10 ${
                      isDark ? 'bg-black/20 border-white/5' : 'bg-emerald-500/5 border-emerald-500/10'
                    }`}>
                      <div className="flex justify-between items-center mb-3">
                        <span className={`text-[8px] font-black uppercase tracking-widest ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                          Gradiente de Produtividade
                        </span>
                        <span className={`text-[9.5px] font-mono font-bold ${isDark ? 'text-emerald-500/50' : 'text-emerald-800/60'}`}>
                          {notif.confidence}
                        </span>
                      </div>
                      <div className="flex items-end gap-1.5 h-16 px-1">
                        {notif.trend.map((val: number, i: number) => (
                          <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            whileInView={{ height: `${val}%` }}
                            transition={{ duration: 1, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                            className={`flex-1 rounded-t-lg opacity-85 group-hover/card:opacity-100 transition-all duration-300 ${
                              isDark 
                                ? 'bg-gradient-to-t from-emerald-600/30 via-emerald-500/80 to-emerald-400' 
                                : 'bg-gradient-to-t from-emerald-300/30 via-emerald-500/80 to-emerald-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TYPE 2: Existential Alert - Pulse Urgência */}
                  {notif.type === 'alert' && (
                    <div className={`mb-4 py-3 px-4 rounded-2xl border flex items-center gap-3 relative z-10 ${
                      isDark ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-rose-50 border-rose-100 text-rose-700'
                    }`}>
                      <span className="relative flex h-20 w-2 shrink-0 items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-rose-400 dark:bg-rose-600 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 dark:bg-rose-400"></span>
                      </span>
                      <span className="text-[9.5px] font-black tracking-widest uppercase">
                        Sinal Crítico de Instabilidade
                      </span>
                    </div>
                  )}

                  {/* TYPE 3: Detected Pattern - Cause & Effect flow visual */}
                  {notif.type === 'pattern' && notif.connections && (
                    <div className={`rounded-3xl p-4 mb-4 border relative z-10 flex flex-col gap-2.5 ${
                      isDark ? 'bg-black/20 border-white/5' : 'bg-blue-500/5 border-blue-500/10'
                    }`}>
                      <div className={`text-[8px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                        Fluxo Causa-Efeito Mapeado
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {notif.connections.map((conn: string, i: number) => (
                          <React.Fragment key={i}>
                            <div className={`px-2.5 py-1 rounded-full text-[9px] font-bold shrink-0 border ${
                              isDark ? 'bg-white/5 border-white/5 text-slate-300' : 'bg-blue-50 border-blue-100 text-blue-900'
                            }`}>
                              {conn}
                            </div>
                            {i < notif.connections.length - 1 && (
                              <span className={`text-xs font-black shrink-0 ${isDark ? 'text-blue-400/40' : 'text-blue-500/50'}`}>➔</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TYPE 4: Existential Direction - Atmospheric contemplation image */}
                  {notif.type === 'direction' && notif.contemplativeImage && (
                    <div className="relative rounded-3xl overflow-hidden mb-4 border border-black/[0.05] dark:border-white/5 shadow-xs h-24 group/img z-10">
                      <img 
                        src={notif.contemplativeImage} 
                        alt="Contemplation Map" 
                        className="w-full h-full object-cover brightness-[0.45] contrast-125 transition-transform duration-[2s] group-hover/card:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-3">
                        <span className="text-[8px] font-black text-indigo-300 uppercase tracking-widest">Coordenador de Vetor Cósmico</span>
                        <span className="text-[9.5px] text-white/70 font-bold">Reorientação Temporal do Planejamento</span>
                      </div>
                    </div>
                  )}

                  {/* TYPE 5: Message from Amparadora - Personal avatar & warm resonance */}
                  {notif.type === 'amparadora' && (
                    <div className={`mb-4 flex items-center gap-3.5 border py-3 px-4 rounded-3xl z-10 relative ${
                      isDark ? 'bg-amber-500/5 border-amber-500/15' : 'bg-amber-500/[0.05] border-amber-200'
                    }`}>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 flex items-center justify-center text-amber-950 font-black shadow-md shadow-amber-500/10 group-hover/card:scale-105 transition-transform shrink-0">
                        <Sparkles size={13} className="animate-pulse text-amber-950" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[9.5px] font-black uppercase tracking-[0.25em] text-amber-700 dark:text-amber-400">Canal Cósmico Ativo</span>
                        <span className="text-[10.5px] font-bold text-amber-900/60 dark:text-amber-200/55 leading-none mt-1">Sintonia e Serenidade</span>
                      </div>
                    </div>
                  )}

                  {/* NEW EXPANDED CONTENT VIEW - Rich diagnostic meta */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="border-t border-black/[0.06] dark:border-white/10 pt-4 mt-4 space-y-4 text-left z-20 relative overflow-hidden"
                      >
                        {/* Dynamic context block depending on alert type */}
                        {notif.type === 'performance' && (
                          <div className="space-y-3">
                            <h4 className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-[#111111]/40'}`}>Bio-Métricas Clínicas de Estresse</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <div className={`p-3 rounded-2xl border ${isDark ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-200/50'}`}>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Foco Sustentado</p>
                                <p className={`text-sm font-extrabold mt-1 ${isDark ? 'text-white' : 'text-[#111111]'}`}>94.8% <span className="text-[10px] text-emerald-500 font-bold ml-1">▲ 11%</span></p>
                              </div>
                              <div className={`p-3 rounded-2xl border ${isDark ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-200/50'}`}>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Resgate Cognitivo</p>
                                <p className={`text-sm font-extrabold mt-1 ${isDark ? 'text-white' : 'text-[#111111]'}`}>3.2m de pico</p>
                              </div>
                            </div>
                            <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                              O padrão de produtividade sugere excelente sincronicidade com suas metas principais. Evite longas sessões de dopamina rápida no próximo ciclo.
                            </p>
                          </div>
                        )}

                        {notif.type === 'alert' && (
                          <div className="space-y-3">
                            <h4 className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-rose-400' : 'text-rose-600/95'}`}>Energosfera & Calibração Ativa</h4>
                            <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                              Sua biosfera energética acumula desgaste. Um hiato de 5 dias nas práticas vitais pode levar à melancolia existencial sutil.
                            </p>
                            
                            {/* EV registration interactions */}
                            {registeredEvMinutes ? (
                              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-wider">
                                <CheckSquare size={16} />
                                <span>Sucesso: {registeredEvMinutes} min de EV registrados!</span>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <span className="text-[9.5px] font-black uppercase tracking-widest text-slate-400">Registrar prática existencial rápida:</span>
                                <div className="flex gap-2.5">
                                  {[10, 20, 35].map(min => (
                                    <button
                                      key={min}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setRegisteredEvMinutes(min);
                                        if (typeof haptics !== 'undefined') haptics.success();
                                      }}
                                      className="flex-1 py-1.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border border-rose-500/25 dark:border-rose-500/20 bg-rose-500/5 dark:bg-rose-500/[0.02] text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 dark:hover:bg-rose-500/20 hover:-translate-y-0.5 transition-all duration-300 shadow-sm"
                                    >
                                      {min} Minutos
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {notif.type === 'pattern' && (
                          <div className="space-y-3">
                            <h4 className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-[#111111]/40'}`}>Correlação Temporal Avançada</h4>
                            <div className={`p-4 rounded-3xl border flex flex-col gap-2 ${isDark ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-200/50'}`}>
                              <p className="text-[10.5px] font-bold text-slate-500 dark:text-slate-300">
                                Sincronicidade do Foco estável com Mobilização Energética (EV):
                              </p>
                              <div className="w-full bg-black/10 dark:bg-black/30 rounded-full h-2.5 border border-black/[0.04] dark:border-white/5 overflow-hidden mt-1.5">
                                <div className="bg-blue-500 h-full rounded-full" style={{ width: '91.4%' }} />
                              </div>
                              <span className="text-[8.5px] text-slate-400 uppercase tracking-widest font-black text-right block">91.4% de correlação matemática</span>
                            </div>
                            <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                              Sempre que você realiza o EV às primeiras horas da manhã, sua taxa de conclusão de objetivos semanais sobe drasticamente.
                            </p>
                          </div>
                        )}

                        {notif.type === 'direction' && (
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-500/80 dark:text-indigo-400">Projeção Tridimensional de Metas</h4>
                            <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                              Detectado desvio do vetor em tarefas secundárias de baixa relevância de longo prazo. Deseja reorientar seus prazos para o propósito programado?
                            </p>
                            
                            {vectorCalibrated ? (
                              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-wider">
                                <CheckSquare size={16} />
                                <span>Vetor Existencial Calibrado!</span>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setVectorCalibrated(true);
                                  if (typeof haptics !== 'undefined') haptics.success();
                                }}
                                className="w-full py-2 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/20 transition-colors"
                              >
                                Sintonizar Alinhamento Cósmico
                              </button>
                            )}
                          </div>
                        )}

                        {notif.type === 'amparadora' && (
                          <div className="space-y-1">
                            <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                              Sincronize a expansão do seu peito com a sutil flutuação energética do guia de serenidade:
                            </p>
                            <ExpandedBreather />
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action Link Frame */}
                  <div className="flex items-center gap-3 group/link cursor-pointer pt-4 w-fit relative z-10" onClick={(e) => {
                    e.stopPropagation();
                    handleNotificationAction(notif);
                  }}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${actionBtnBg}`}>
                      <ArrowRight size={14} strokeWidth={3} className="text-inherit group-hover/link:text-black" />
                    </div>
                    <span className={`text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 ${actionTextColor}`}>
                      {notif.action}
                    </span>
                  </div>

                  {/* Interactive Consciencial Social Bar */}
                  <div className="border-t border-black/[0.05] dark:border-white/[0.05] mt-4 pt-3.5 flex flex-wrap gap-2.5 items-center justify-between relative z-10">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      {/* Sintonizar (Like) */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLikeNotif(notif.id);
                        }}
                        className={`flex items-center gap-1.5 text-[10.5px] font-bold tracking-tight py-1 px-3 rounded-full transition-all duration-200 ${
                          likedNotifIds.includes(notif.id) 
                            ? 'bg-rose-500/15 text-rose-500' 
                            : 'text-slate-400 dark:text-slate-500 hover:text-rose-500 hover:bg-rose-500/5'
                        }`}
                        title="Sintonizar estado vibracional com este norte"
                      >
                        <Heart size={13} fill={likedNotifIds.includes(notif.id) ? "currentColor" : "none"} strokeWidth={2.5} className={likedNotifIds.includes(notif.id) ? "animate-pulse" : ""} />
                        <span>{likedNotifIds.includes(notif.id) ? 'Sintonizado (98%)' : 'Sintonizar'}</span>
                      </button>

                      {/* Reverberar (Repost/Resonate) */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleReverberateNotif(notif.id);
                        }}
                        className={`flex items-center gap-1.5 text-[10.5px] font-bold tracking-tight py-1 px-3 rounded-full transition-all duration-200 ${
                          reverberatedNotifIds.includes(notif.id) 
                            ? 'bg-emerald-500/15 text-emerald-500' 
                            : 'text-slate-400 dark:text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/5'
                        }`}
                        title="Reverberar este padrão nos seus corpos"
                      >
                        <Repeat size={13} strokeWidth={2.5} className={reverberatedNotifIds.includes(notif.id) ? "rotate-180 transition-transform duration-500" : ""} />
                        <span>{reverberatedNotifIds.includes(notif.id) ? 'Reverberando' : 'Reverberar'}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Fixar (Pin) */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePinNotif(notif.id);
                        }}
                        className={`p-1.5 rounded-full transition-all duration-200 ${
                          pinnedNotifIds.includes(notif.id) 
                            ? 'bg-indigo-500/15 text-indigo-500' 
                            : 'text-slate-400 dark:text-slate-500 hover:text-indigo-400 hover:bg-white/5'
                        }`}
                        title="Fixar no topo de sua consciência"
                      >
                        <Pin size={13} fill={pinnedNotifIds.includes(notif.id) ? "currentColor" : "none"} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>

                  {/* Comments Thread & Private Diary Dialogue */}
                  <div className="mt-3.5 relative z-10 border-t border-black/[0.04] dark:border-white/[0.04] pt-3 text-left">
                    {/* List past comments */}
                    {notifComments[notif.id] && notifComments[notif.id].length > 0 && (
                      <div className="space-y-2 mb-3 max-h-36 overflow-y-auto pr-1">
                        {notifComments[notif.id].map((comment, commentIndex) => (
                          <div key={commentIndex} className={`p-2.5 rounded-xl border flex flex-col gap-1 text-[11.5px] ${
                            isDark ? 'bg-white/[0.02] border-white/[0.04]' : 'bg-slate-50 border-slate-200/50'
                          }`}>
                            <div className="flex justify-between items-center text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                              <span>Douglas (Auto-reflexão)</span>
                              <span>Agora</span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">{comment}</p>
                          </div>
                        ))}

                        {/* Amparadora Auto-Reflection reply to simulate high quality interactions! */}
                        <div className={`p-3 rounded-2xl border flex items-start gap-2.5 text-xs bg-amber-500/[0.03] border-amber-500/15 text-amber-900/90 dark:text-amber-100/80`}>
                          <Sparkles size={13} className="text-amber-500 shrink-0 mt-0.5" />
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">Guardião da Retaguarda</span>
                            <p className="font-serif italic leading-relaxed mt-1">
                              Douglas, sua autodiagnose é crucial para consolidar essa postura. Integrar esse quantum de lucidez blinda sua mente de distrações supérfluas. Estou acompanhando.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quick commentary submission */}
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="text"
                        placeholder="Registrar autorreflexão..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = (e.target as HTMLInputElement).value;
                            if (val.trim()) {
                              addNotifComment(notif.id, val);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                        className={`flex-1 text-xs py-1.5 px-3.5 rounded-full border focus:outline-none transition-colors ${
                          isDark 
                            ? 'bg-black/40 border-white/10 text-white focus:border-emerald-500/50 placeholder-white/30' 
                            : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-500/50 placeholder-slate-400'
                        }`}
                      />
                      <button 
                        onClick={(e) => {
                          const inputNode = e.currentTarget.previousElementSibling as HTMLInputElement;
                          if (inputNode && inputNode.value.trim()) {
                            addNotifComment(notif.id, inputNode.value);
                            inputNode.value = '';
                          }
                        }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105 active:scale-95 shrink-0`}
                      >
                        <Send size={11} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          };

          return (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setShowNotifications(false)}
                className="fixed inset-0 bg-black/55 backdrop-blur-[6px] z-[1000]"
              />

              {/* Elegant dynamic long thin white arrow pointing towards the sidebar (exactly where user marked in desktop viewport) */}
              <div className="fixed left-[10%] lg:left-[14%] xl:left-[16%] top-[50%] -translate-y-1/2 z-[1002] hidden md:flex items-center pointer-events-none select-none">
                <motion.div
                  initial={{ opacity: 0, x: -60 }}
                  animate={{ opacity: 0.55, x: 0 }}
                  exit={{ opacity: 0, x: -60 }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-start gap-3"
                >
                  <svg width="320" height="16" viewBox="0 0 320 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="0" y1="8" x2="314" y2="8" stroke="white" strokeWidth="1" strokeLinecap="round" />
                    <line x1="314" y1="8" x2="304" y2="3" stroke="white" strokeWidth="1" strokeLinecap="round" />
                    <line x1="314" y1="8" x2="304" y2="13" stroke="white" strokeWidth="1" strokeLinecap="round" />
                  </svg>
                  <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">
                    Clique fora do painel para fechar
                  </span>
                </motion.div>
              </div>
              
              {/* Sidebar Container - Advanced responsive Wide expander */}
              <motion.div
                initial={{ x: '100%', opacity: 0.95 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0.95 }}
                transition={{ type: 'spring', damping: 32, stiffness: 260, mass: 0.9 }}
                className={`fixed top-0 right-0 h-full w-[95vw] md:w-[680px] lg:w-[860px] xl:w-[980px] max-w-[95vw] md:max-w-[1000px] border-l shadow-3xl z-[1001] flex flex-row md:flex-row-reverse font-sans overflow-hidden backdrop-blur-3xl transition-all duration-500 ${
                  isDark 
                    ? 'bg-[#0a0a0c]/93 text-white border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.85)]' 
                    : 'bg-[#fcfcfd]/96 text-[#121214] border-black/[0.06] shadow-black/10'
                }`}
              >
                {/* COLUMN 1: Control & Synthesis Center (Wide Mode Only - md:flex) */}
                <div className={`hidden md:flex flex-col w-[260px] lg:w-[300px] border-r md:border-r-0 md:border-l overflow-y-auto shrink-0 p-6 custom-scrollbar justify-between transition-colors duration-500 bg-transparent`} style={{ backgroundColor: isDark ? '#080a0f' : '#12141c', borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.1)' }}>
                  <div className="space-y-8">
                    {/* Identity & Resonance System */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-white/10 text-white border border-white/15 shadow-md">
                        <Cpu size={16} strokeWidth={2.5} />
                      </div>
                      <div className="flex flex-col overflow-hidden text-left">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] truncate text-white">Douglas L. Rocha</span>
                        <span className="text-[8px] font-bold uppercase tracking-widest leading-none mt-1 text-white/45">Sincronizador Cósmico</span>
                      </div>
                    </div>

                    {/* Sintonia & Focus Circle Widget */}
                    <div className="rounded-3xl p-4 space-y-3 border bg-white/[0.02] border-white/5 transition-colors duration-500">
                      <div className="flex justify-between items-center text-[8px] tracking-widest font-black uppercase">
                        <span className="text-white/35">Sintonização de Rota</span>
                        <span className="text-emerald-400 font-extrabold">96% ESTÁVEL</span>
                      </div>
                      <div className="flex items-center gap-3 rounded-2xl p-2.5 border bg-black/25 border-white/5 transition-colors duration-500">
                        <div className="relative w-10 h-10 rounded-full flex items-center justify-center border border-emerald-500/20">
                          <div className="absolute inset-0.5 rounded-full border border-dashed border-emerald-500/40 animate-spin" />
                          <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <Activity size={10} className="animate-pulse" />
                          </div>
                        </div>
                        <div className="flex flex-col leading-tight text-left">
                          <span className="text-[9.5px] font-black uppercase text-white/90">Organismo Ativo</span>
                          <span className="text-[8.5px] font-bold text-white/30">Vetor Consciencial</span>
                        </div>
                      </div>
                    </div>

                    {/* Inteligente grouping filters (Desktop Sidebar view) */}
                    <div className="space-y-2 text-left">
                      <h3 className="text-[8px] font-black tracking-[0.25em] ml-1 uppercase mb-3 px-1 text-white/25">Agrupamentos Inteligentes</h3>
                      <div className="flex flex-col gap-1.5">
                        {filters.map(filt => {
                          const isSel = activeFilter === filt.id;
                          const count = filterCounts[filt.id as keyof typeof filterCounts] || 0;
                          return (
                            <button
                              key={filt.id}
                              onClick={() => {
                                setActiveFilter(filt.id as any);
                                if (typeof haptics !== 'undefined') haptics.lightClick();
                              }}
                              className={`w-full py-2.5 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-between transition-all duration-300 border ${
                                isSel
                                  ? 'bg-white/10 border-white/20 text-white font-bold shadow-[0_0_15px_rgba(255,255,255,0.06)] translate-x-1'
                                  : 'bg-transparent border-transparent text-white/40 hover:text-white hover:bg-white/[0.02]'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className={isSel ? 'text-white' : 'text-white/30'}>{filt.icon}</span>
                                <span>{filt.label}</span>
                              </div>
                              {count > 0 && (
                                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8.5px] font-black transition-all ${
                                  isSel ? 'bg-white text-black shadow-md' : 'bg-white/5 text-white/30'
                                }`}>
                                  {count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* COLUMN 2: Neural Feed & Timeline Scroll */}
                <div 
                  className="flex-1 flex flex-col h-full overflow-hidden relative"
                  style={{
                    backgroundColor: isDark ? '#001013' : 'transparent'
                  }}
                >
                  {isDark && allBackgroundImages && allBackgroundImages[bgIndex] && (
                    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none opacity-40">
                      <img 
                        src={allBackgroundImages[bgIndex]} 
                        alt=""
                        className="w-full h-full object-cover filter brightness-[0.45] contrast-[1.1] saturate-[0.8]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-[#001013] via-transparent to-[#001013]" />
                      <div className="absolute inset-0 backdrop-blur-[1.5px]" />
                    </div>
                  )}

                  {/* Subtle neural architectural patterns for Light Mode */}
                  {!isDark && (
                    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden mix-blend-multiply opacity-[0.07] select-none">
                      {/* Neural abstract connections grid */}
                      <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgb(22, 23, 25) 1.5px, transparent 1.5px)`,
                        backgroundSize: '24px 24px'
                      }} />
                      {/* Elegant orbital shadow gradient connecting from the black sidebar (right) */}
                      <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-black via-black/30 to-transparent filter blur-md hidden md:block" />
                      <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-black via-black/30 to-transparent filter blur-md md:hidden" />
                      {/* Opaque dark focus nodes mimicking the dark sidebar aesthetic */}
                      <div className="absolute top-1/4 right-10 w-96 h-96 bg-black/60 rounded-full filter blur-[120px]" />
                      <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-black/50 rounded-full filter blur-[100px]" />
                    </div>
                  )}

                  {/* Horizonal Chips dynamic filters selector for Mobile devices (hidden on md+) */}
                  <div className={`flex gap-2 px-4 py-3 overflow-x-auto select-none no-scrollbar md:hidden border-b shrink-0 relative z-10 ${
                    isDark ? 'border-white/5 bg-black/20' : 'border-black/[0.05] bg-slate-100/40'
                  }`}>
                    {/* Compact Mobile Close Button */}
                    <button 
                      onClick={() => {
                        setShowNotifications(false);
                        if (typeof haptics !== 'undefined') haptics.lightClick();
                      }}
                      className={`h-7 w-7 rounded-full shrink-0 flex items-center justify-center transition-all duration-300 border cursor-pointer active:scale-90 ${
                        isDark 
                          ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' 
                          : 'bg-black/5 border-black/10 text-slate-800 hover:bg-black/10'
                      }`}
                      aria-label="Voltar"
                    >
                      <ChevronLeft size={14} strokeWidth={3} />
                    </button>

                    {filters.map(filt => {
                      const isSel = activeFilter === filt.id;
                      const count = filterCounts[filt.id as keyof typeof filterCounts] || 0;
                      return (
                        <button
                          key={filt.id}
                          onClick={() => {
                            setActiveFilter(filt.id as any);
                            if (typeof haptics !== 'undefined') haptics.lightClick();
                          }}
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1.2 transition-all duration-300 border ${
                            isSel 
                              ? isDark
                                ? 'bg-white/10 border-white/25 text-white font-bold shadow-[0_0_15px_rgba(255,255,255,0.08)] backdrop-blur-md' 
                                : 'bg-[#15161c]/90 border-black/15 text-white font-bold backdrop-blur-md shadow-xs'
                              : isDark
                                ? 'bg-white/[0.02] border-white/5 text-white/45'
                                : 'bg-black/[0.03] border-black/[0.04] text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <span>{filt.icon}</span>
                          <span>{filt.label}</span>
                          {count > 0 && (
                            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7.5px] font-black ${
                              isSel ? 'bg-white text-black' : 'bg-black/5 dark:bg-white/10 text-slate-400 dark:text-white/60'
                            }`}>
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Scrollable Feed Container - Immersive Axis Timeline */}
                  <div 
                    className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-10 custom-scrollbar relative z-10"
                    style={{
                      backgroundColor: 'transparent',
                      boxShadow: isDark ? 'inset 0 20px 30px rgba(0, 0, 0, 0.85), inset 12px 0 24px rgba(0, 0, 0, 0.75), inset -12px 0 24px rgba(0, 0, 0, 0.75), inset 0 -20px 30px rgba(0, 0, 0, 0.85)' : undefined
                    }}
                  >

                    <div 
                      className={`absolute left-[22.5px] sm:left-[31.5px] top-9 bottom-9 w-[2px] z-10 opacity-50 ${
                        isDark 
                          ? 'bg-gradient-to-b from-emerald-500/30 via-white/5 to-emerald-500/30' 
                          : 'bg-gradient-to-b from-emerald-500/30 via-slate-200 to-emerald-500/30'
                      }`} 
                    />

                    {filteredNotifications.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-[#111111]/30 dark:text-white/30 animate-pulse">
                          <LayoutGrid size={20} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-[#ffffff]/60">Sem reverberações</p>
                          <p className="text-[10px] text-slate-400 dark:text-white/30 max-w-xs leading-relaxed">Nenhum registro correspondente nesta categoria do mapeador neural.</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {filteredNotifications.slice(0, visibleNotifCount).map((notif: any, idx: number) => (
                          <motion.div
                            key={notif.id}
                            initial={{ opacity: 0, x: 20, y: 10 }}
                            animate={{ opacity: 1, x: 0, y: 0 }}
                            transition={{ delay: idx * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            className="relative z-10"
                          >
                            {renderModularCard(notif, idx)}
                          </motion.div>
                        ))}

                        {filteredNotifications.length > visibleNotifCount && (
                          <div className="flex justify-center pt-4 pb-8 z-20 relative">
                            <button
                              onClick={() => {
                                setVisibleNotifCount(prev => prev + 4);
                                if (typeof haptics !== 'undefined') haptics.success();
                              }}
                              className={`py-3 px-6 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border flex items-center gap-2 hover:scale-[1.03] active:scale-95 cursor-pointer shadow-md ${
                                isDark 
                                  ? 'bg-[#151a22]/80 border-emerald-500/30 text-emerald-400 hover:border-emerald-500 hover:bg-[#1b222d]' 
                                  : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-300'
                              }`}
                            >
                              <span>Carregar mais insights</span>
                              <ChevronDown size={12} className="animate-bounce" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>


                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </div>
  );
};

// --- Sub-Components ---

const ObjectiveCard = React.memo(({ objective, isActive, onVideoToggle, onOpen, isReordering, dragConstraints, isHolding, onHoldStart, onHoldEnd, onDeleteRequest }: any) => {
  const [currentMediaIdx, setCurrentMediaIdx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const media = useMemo(() => objective.media || [], [objective.media]);
  const dragControls = useDragControls();
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Intersection Observer for viewport rendering
  useEffect(() => {
    if (typeof window === 'undefined' || !window.IntersectionObserver) return;
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, {
      rootMargin: '250px 0px 250px 0px', // Comfort margin to animate before it visually enters the scroll space
      threshold: 0
    });

    observer.observe(el);
    return () => {
      observer.unobserve(el);
    };
  }, []);

  // Auto-rotate images if not playing video
  useEffect(() => {
    if (!inView || isActive || isHovered || isReordering || media.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentMediaIdx(prev => (prev + 1) % media.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isActive, isHovered, media.length, isReordering, inView]);

  // Handle video playback
  useEffect(() => {
    if (inView && isActive && videoRef.current && !isReordering) {
      videoRef.current.play().catch(err => console.log('Video play error:', err));
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isActive, isReordering, inView]);

  const currentMedia = useMemo(() => media[currentMediaIdx] || { type: 'image', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600' }, [media, currentMediaIdx]);
  const videoMedia = useMemo(() => media.find((m: any) => m.type === 'video'), [media]);

  // Deadline Logic
  const deadline = useMemo(() => {
    if (!objective.deadline) return { label: 'Sem prazo', color: 'text-zinc-500', urgency: 0 };
    const now = Date.now();
    const diff = objective.deadline - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days <= 0) return { label: 'Concluído', color: 'text-emerald-500', urgency: 0 };
    if (days <= 15) return { label: `Termina em ${days} dias`, color: 'text-red-400', urgency: 3 };
    if (days <= 90) return { label: `Termina em ${days} dias`, color: 'text-amber-400', urgency: 2 };
    
    const date = new Date(objective.deadline);
    const month = date.toLocaleDateString('pt-BR', { month: 'short' });
    const year = date.getFullYear();
    return { label: `Até ${month} ${year}`, color: 'text-white/40', urgency: 1 };
  }, [objective.deadline]);

  const progress = useMemo(() => fakeDB.getObjectiveProgress(objective.id), [objective.id]);

  return (
    <Reorder.Item 
      value={objective}
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={dragConstraints}
      dragMomentum={false}
      dragElastic={0.05}
      whileHover={isDragging || isReordering ? undefined : { scale: 1.01 }}
      whileTap={isDragging || isReordering ? undefined : { scale: 0.98 }}
      whileDrag={{ 
        scale: 1.03, 
        boxShadow: "0 40px 80px rgba(0,0,0,0.8)",
        zIndex: 100,
        opacity: 0.9
      }}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      onPointerDown={onHoldStart}
      onPointerUp={onHoldEnd}
      onPointerLeave={onHoldEnd}
      style={{ transform: 'translateZ(0)' }}
      onClick={() => !isDragging && !isReordering && onOpen()}
      className={`w-[280px] md:w-[360px] min-w-[280px] md:min-w-[360px] h-[440px] rounded-[32px] relative group overflow-hidden flex-shrink-0 ${isReordering ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
    >
      {/* Delete Overlay */}
      <AnimatePresence>
        {isHolding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-2xl flex flex-col items-center justify-center gap-6 text-white p-6 text-center"
          >
            <motion.button
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 10 }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteRequest();
              }}
              className="p-8 bg-white text-red-600 rounded-full shadow-[0_20px_60px_rgba(220,38,38,0.6)] border-4 border-red-50"
            >
              <Trash2 size={40} strokeWidth={2.5} />
            </motion.button>
            <div className="space-y-2">
              <p className="font-black uppercase tracking-[0.3em] text-[10px] text-white">Excluir Alvo?</p>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onHoldEnd();
                }}
                className="text-[9px] font-black text-white/60 hover:text-white uppercase tracking-[0.2em] px-5 py-2 bg-white/10 rounded-full border border-white/20 transition-all backdrop-blur-md"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag Handle Overlay */}
      {isReordering && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onPointerDown={(e) => {
            e.preventDefault();
            dragControls.start(e);
          }}
          className="absolute inset-0 z-50 bg-black/60 backdrop-blur-[4px] flex flex-col items-center justify-center gap-4 cursor-grab active:cursor-grabbing group/handle transition-all touch-none select-none"
          style={{ WebkitTouchCallout: 'none' }}
        >
          <motion.div 
            animate={isDragging ? { scale: 1.2, rotate: 5 } : { scale: 1 }}
            className={`p-6 rounded-full border transition-all duration-300 ${isDragging ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)]' : 'bg-white/10 border-white/20 text-white group-hover/handle:bg-white/20'}`}
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

      <motion.div
        ref={cardRef}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => setIsHovered(true)}
        className="w-full h-full relative rounded-[32px] overflow-hidden transition-shadow duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.8)] border border-white/5"
      >
        {/* Glow effect during drag */}
        <motion.div 
          animate={{ opacity: isHovered ? 0.3 : 0 }}
          className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/20 to-transparent z-10 pointer-events-none"
        />
        {/* Evolved Border Glow */}
        <div className="absolute inset-0 z-10 pointer-events-none rounded-[32px] border border-white/10 group-hover:border-white/20 transition-colors duration-700" />
        <div className="absolute inset-0 z-10 pointer-events-none rounded-[32px] animate-border-flow opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

        {/* Dynamic Media Background */}
        <div className="absolute inset-0 z-0 overflow-hidden rounded-[32px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={isActive ? 'video' : currentMedia.url}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: isActive ? 1.15 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0 z-0"
            >
              {isActive && videoMedia ? (
                <video 
                  ref={videoRef}
                  src={videoMedia.url}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img 
                  src={currentMedia.url} 
                  alt={objective.title} 
                  className="w-full h-full object-cover transition-all duration-1000"
                  referrerPolicy="no-referrer"
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Content Layer */}
        <div className="absolute inset-0 z-30 p-8 flex flex-col justify-between rounded-[32px] overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-2">
              <div className="px-4 h-7 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-xl border border-white/10 w-fit">
                <span className="text-[9px] font-black tracking-[0.3em] uppercase text-white/60 leading-none">{objective.type || 'Estratégico'}</span>
              </div>
              {objective.goalIds?.length > 0 && (
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-fit">
                  <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">{objective.goalIds.length} Metas</span>
                </div>
              )}
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onDeleteRequest(); }}
              className="p-2.5 rounded-full bg-black/20 backdrop-blur-xl border border-white/5 text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Play Button - Teaser */}
          <div className="flex-1 flex items-center justify-center">
            {videoMedia && (
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); onVideoToggle(); }}
                className={`w-16 h-16 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center text-white shadow-2xl transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
              >
                {isActive ? (
                  <Pause size={24} fill="currentColor" />
                ) : (
                  <div className="relative">
                    <Play size={24} fill="currentColor" className="ml-1" />
                    <div className="absolute inset-0 animate-ping rounded-full bg-white/20" />
                  </div>
                )}
              </motion.button>
            )}
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-3xl md:text-4xl font-light text-[#ffffff] tracking-tight leading-tight drop-shadow-2xl">
                {objective.title}
              </h3>
            </motion.div>

            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-widest ${deadline.color} ${deadline.urgency >= 3 ? 'animate-pulse-soft' : ''}`}>
                  <Clock size={14} className="opacity-50" />
                  <span>{deadline.label}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-white/20 tabular-nums">{progress}%</span>
                  <div className="flex -space-x-3">
                    {[1,2].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-[var(--bg)] bg-[var(--surface)] flex items-center justify-center text-[9px] font-black text-[var(--text)]/40 shadow-xl">
                        {i}
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-[var(--bg)] bg-[var(--surface)]/5 backdrop-blur-xl flex items-center justify-center text-[9px] font-black text-[var(--text)]/60 shadow-xl">
                      +
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Media Swipe Controls (Manual) */}
        <div className="absolute inset-x-0 top-0 h-1 z-40 flex gap-1 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          {media.map((_: any, i: number) => (
            <div 
              key={i}
              onClick={() => setCurrentMediaIdx(i)}
              className={`flex-1 h-full rounded-full transition-all duration-300 cursor-pointer ${i === currentMediaIdx ? 'bg-white' : 'bg-white/20'}`}
            />
          ))}
        </div>
        
        {/* Swipe Gestures Area */}
        <div 
          className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing rounded-[40px]"
          onMouseDown={(e) => {
            const startX = e.clientX;
            const onMouseUp = (upE: MouseEvent) => {
              const diff = upE.clientX - startX;
              if (Math.abs(diff) > 50) {
                if (diff > 0) setCurrentMediaIdx(prev => (prev - 1 + media.length) % media.length);
                else setCurrentMediaIdx(prev => (prev + 1) % media.length);
              }
              window.removeEventListener('mouseup', onMouseUp);
            };
            window.addEventListener('mouseup', onMouseUp);
          }}
        />
      </motion.div>
    </Reorder.Item>
  );
});

const gridVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
} as const;

const CompactObjectiveCard: React.FC<{ objective: any; onOpen: () => void; isReordering?: boolean; dragConstraints?: any; isHolding?: boolean; onHoldStart?: () => void; onHoldEnd?: () => void; onDeleteRequest?: () => void }> = React.memo(({ objective, onOpen, isReordering, dragConstraints, isHolding, onHoldStart, onHoldEnd, onDeleteRequest }) => {
  const [currentMediaIdx, setCurrentMediaIdx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const media = useMemo(() => objective.media || [], [objective.media]);
  const videoMedia = useMemo(() => media.find((m: any) => m.type === 'video'), [media]);
  const currentMedia = useMemo(() => media[currentMediaIdx] || { url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1600' }, [media, currentMediaIdx]);
  const progress = useMemo(() => fakeDB.getObjectiveProgress(objective.id), [objective.id]);
  const dragControls = useDragControls();
  const cardRef = useRef<HTMLLIElement>(null);
  const [inView, setInView] = useState(true);

  // Intersection Observer for viewport rendering
  useEffect(() => {
    if (typeof window === 'undefined' || !window.IntersectionObserver) return;
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, {
      rootMargin: '250px 0px 250px 0px', // Comfort margin to animate before it visually enters the scroll space
      threshold: 0
    });

    observer.observe(el);
    return () => {
      observer.unobserve(el);
    };
  }, []);

  // Slow auto-rotate images
  useEffect(() => {
    if (!inView || media.length <= 1 || isReordering) return;
    const interval = setInterval(() => {
      setCurrentMediaIdx(prev => (prev + 1) % media.length);
    }, 6000); // Slower than focus mode
    return () => clearInterval(interval);
  }, [media.length, isReordering, inView]);

  const deadline = useMemo(() => {
    if (!objective.deadline) return null;
    const now = Date.now();
    const diff = objective.deadline - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days <= 0) return { label: 'Concluído', color: 'text-emerald-500' };
    if (days <= 15) return { label: `${days}d restantes`, color: 'text-red-400' };
    
    const date = new Date(objective.deadline);
    const month = date.toLocaleDateString('pt-BR', { month: 'short' });
    const year = date.getFullYear();
    return { label: `${month} ${year}`, color: 'text-white/40' };
  }, [objective.deadline]);

  return (
    <Reorder.Item 
      ref={cardRef}
      value={objective}
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={dragConstraints}
      dragMomentum={false}
      dragElastic={0.05}
      whileHover={isDragging || isReordering ? undefined : { y: -4, scale: 1.02 }}
      whileTap={isDragging || isReordering ? undefined : { scale: 0.97 }}
      whileDrag={{ 
        scale: 1.05, 
        boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
        zIndex: 100,
        opacity: 0.9
      }}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      onPointerDown={onHoldStart}
      onPointerUp={onHoldEnd}
      onPointerLeave={onHoldEnd}
      style={{ transform: 'translateZ(0)' }}
      onClick={() => !isDragging && !isReordering && onOpen()}
      className={`relative rounded-3xl overflow-hidden group bg-[var(--surface)] border border-[var(--border)] shadow-lg ${isReordering ? 'cursor-default aspect-video h-24' : 'cursor-grab active:cursor-grabbing aspect-[4/5]'}`}
    >
      {/* Delete Overlay for Grid */}
      <AnimatePresence>
        {isHolding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="absolute inset-0 z-50 bg-black/60 backdrop-blur-2xl flex flex-col items-center justify-center gap-4 px-4 rounded-lg text-center"
          >
            <motion.button 
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ type: 'spring', damping: 10 }}
               whileHover={{ scale: 1.15 }}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteRequest && onDeleteRequest();
              }}
              className="bg-white text-red-600 p-4 rounded-full shadow-2xl border-4 border-red-50"
            >
              <Trash2 size={24} strokeWidth={2.5} />
            </motion.button>
            <button 
               onClick={(e) => { e.stopPropagation(); onHoldEnd && onHoldEnd(); }}
               className="text-[9px] font-black text-white/60 hover:text-white uppercase tracking-widest bg-white/10 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-md transition-all"
            >
              Cancelar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag Handle Overlay for Grid */}
      {isReordering && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onPointerDown={(e) => {
            e.preventDefault();
            dragControls.start(e);
          }}
          className="absolute inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center cursor-grab active:cursor-grabbing group/handle transition-all touch-none select-none"
          style={{ WebkitTouchCallout: 'none' }}
        >
          <motion.div 
            animate={isDragging ? { scale: 1.2 } : { scale: 1 }}
            className={`p-3 rounded-full border transition-all duration-300 ${isDragging ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]' : 'bg-white/10 border-white/20 text-white group-hover/handle:bg-white/20'}`}
          >
            <GripVertical size={20} />
          </motion.div>
        </motion.div>
      )}

      {/* Background Image */}
      <div className="absolute inset-0 z-0 rounded-3xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img 
            key={currentMedia.url}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            src={currentMedia.url} 
            alt={objective.title} 
            className="w-full h-full object-cover transition-transform duration-[6000ms] group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>
      </div>

      {/* Glow effect during drag */}
      <motion.div 
        animate={{ opacity: 0 }}
        whileDrag={{ opacity: 0.2 }}
        className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/30 to-transparent z-10 pointer-events-none"
      />

      {/* Content */}
      <div className="absolute inset-0 z-10 p-4 flex flex-col justify-between rounded-3xl overflow-hidden bg-gradient-to-t from-black/80 via-black/20 to-transparent">
        <div className="flex justify-between items-start">
          <div className="px-2 h-4 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/10">
            <span className="text-[6px] font-black tracking-widest uppercase text-white/80 leading-none">{objective.type || 'Meta'}</span>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={(e) => { e.stopPropagation(); onDeleteRequest && onDeleteRequest(); }}
              className="p-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/60 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <Trash2 size={10} />
            </button>
            {videoMedia && (
              <div className="p-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/60">
                <Play size={10} fill="currentColor" />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-[#ffffff] leading-tight line-clamp-2 drop-shadow-md">
            {objective.title}
          </h3>

          <div className="space-y-1.5">
            <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-emerald-500/80" 
              />
            </div>
            
            {deadline && (
              <div className={`flex items-center gap-1 text-[6px] font-black uppercase tracking-widest ${deadline.color}`}>
                <Clock size={8} className="opacity-50" />
                <span>{deadline.label}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Reorder.Item>
  );
});

// Action Group Component - Organizes widgets into functional areas
const ActionGroup = React.memo(({ title, children, style, className, innerClassName }: { title: string, children: React.ReactNode, style?: React.CSSProperties, className?: string, innerClassName?: string }) => (
  <div className={`flex flex-col gap-1.5 items-center md:items-start animate-in fade-in slide-in-from-bottom-2 duration-700 shrink-0 ${className || ''}`} style={{ transform: 'translateZ(0)' }}>
    <h3 className="text-[7px] md:text-[9px] font-black tracking-[0.2em] text-emerald-500/40 uppercase whitespace-nowrap ml-1">{title}</h3>
    <div className={`flex flex-row gap-2 ${innerClassName || ''}`} style={style}>
      {children}
    </div>
  </div>
));

// Refined Quick Action Card Component - Minimalist Widget Style
const QuickActionCard = React.memo(({ 
  icon, 
  label, 
  onClick,
  style,
  labelStyle,
  className = "w-12 h-12 md:w-14 md:h-14"
}: { 
  icon: React.ReactNode; 
  label: string; 
  onClick: () => void; 
  style?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  className?: string;
}) => {
  return (
    <motion.button
      whileHover={{ 
        scale: 1.05, 
        y: -3, 
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.2)'
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{ transform: 'translateZ(0)', ...style }}
      className={`flex flex-col items-center justify-center gap-1 rounded-xl md:rounded-2xl bg-white/10 border border-white/20 text-[var(--text)] backdrop-blur-xl shadow-[0_4px_10px_rgba(0,0,0,0.15)] hover:border-white/40 transition-all duration-500 cursor-pointer group shrink-0 ring-1 ring-white/5 ${className}`}
    >
      <div className="flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 15 }) : icon}
      </div>
      <span 
        style={labelStyle}
        className="text-[8px] md:text-[9px] font-black uppercase tracking-tight text-center leading-none opacity-50 group-hover:opacity-100 transition-opacity px-1 mt-1"
      >
        {label}
      </span>
    </motion.button>
  );
});

const TimelineItem = React.memo(({ item, index, onComplete }: any) => {
  const isTask = item.type === 'task';
  const isCompleted = item.status === 'done' || item.status === 'completed';

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.05, 0.5), duration: 0.8 }}
      style={{ transform: 'translateZ(0)' }}
      className="relative group"
    >
      {/* Timeline Dot */}
      <div className={`absolute -left-[37px] top-1.5 w-3 h-3 rounded-full border-2 border-[var(--bg)] z-10 transition-all duration-700 ${isCompleted ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-[var(--text)]/10'}`} />
      
      <div className="flex items-start gap-5 p-5 rounded-[24px] bg-[var(--surface)]/40 border border-[var(--border)] hover:border-[var(--primary)]/20 hover:bg-[var(--surface-hover)]/40 transition-all cursor-pointer group/item">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (isTask && !isCompleted) onComplete();
          }}
          className={`p-3.5 rounded-2xl transition-all duration-500 ${isCompleted ? 'bg-emerald-500/10 text-emerald-500' : 'bg-[var(--text)]/5 text-[var(--text)]/20 group-hover/item:text-[var(--text)]/40'}`}
        >
          {isTask ? (isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />) : <Calendar size={18} />}
        </button>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className={`font-light text-base tracking-tight transition-all duration-700 ${isCompleted ? 'text-[var(--text)]/20 line-through' : 'text-[var(--text)]/80'}`}>
              {item.title}
            </h4>
            {item.time && (
              <span className="text-[9px] font-black text-[var(--text)]/20 uppercase tracking-[0.2em]">
                {new Date(item.time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[9px] font-bold text-[var(--text)]/20 uppercase tracking-widest">
              <Zap size={10} className={isCompleted ? 'text-emerald-500/40' : 'text-amber-500/40'} />
              <span>{item.projectName || 'Operação'}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-[var(--text)]/5" />
            <span className="text-[9px] font-bold text-[var(--text)]/10 uppercase tracking-widest">
              {isTask ? 'Tarefa' : 'Evento'}
            </span>
          </div>
        </div>

        <ChevronRight size={16} className="text-[var(--text)]/10 group-hover/item:text-[var(--text)]/30 transition-colors self-center" />
      </div>
    </motion.div>
  );
});
