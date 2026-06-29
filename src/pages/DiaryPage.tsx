import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

import { fakeDB } from '../core/fakeDB';
import { safeLocalStorage } from '../utils/storage';
import { backgroundService } from '../services/backgroundService';
import { useOrganismSync } from '../hooks/useOrganismSync';
import { haptics } from '../services/HapticService';

const phrases = [
  "Hoje é mais um passo na sua evolução.",
  "O que você fez hoje para evoluir?",
  "Sua consciência está em movimento.",
  "Evoluir é um processo diário."
];

function HeroSection({ viewMode, setViewMode }: { viewMode: 'vertical' | 'horizontal', setViewMode: (mode: 'vertical' | 'horizontal') => void }) {
  const [index, setIndex] = useState(0);
  const [heroImages, setHeroImages] = useState(() => backgroundService.getImages('diary'));
  const [imageIndex, setImageIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail?.page === 'diary') {
        const newImages = backgroundService.getImages('diary');
        setHeroImages(newImages);
        setImageIndex(0);
      }
    };
    window.addEventListener('backgrounds-updated', handleUpdate);
    return () => window.removeEventListener('backgrounds-updated', handleUpdate);
  }, []);

  const particles = useMemo(() => [...Array(15)].map((_, i) => ({
    id: i,
    initialX: Math.random() * 100,
    initialY: Math.random() * 100,
    targetX: Math.random() * 100,
    duration: 25 + Math.random() * 20,
    delay: Math.random() * 10
  })), []);

  useEffect(() => {
    const phraseTimer = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 8000); // Slower phrase rotation

    const imageTimer = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 10000); // Very slow image rotation

    return () => {
      clearInterval(phraseTimer);
      clearInterval(imageTimer);
    };
  }, []);

  return (
    <section className="relative w-full h-[65vh] flex flex-col items-center justify-center overflow-hidden">
      {/* Background Carousel Layer */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div 
            key={imageIndex}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              scale: [1.05, 1.1, 1.05],
              x: [-10, 10, -10],
              y: [-5, 5, -5]
            }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 3, ease: "easeInOut" },
              scale: { duration: 45, repeat: Infinity, ease: "linear" },
              x: { duration: 45, repeat: Infinity, ease: "linear" },
              y: { duration: 45, repeat: Infinity, ease: "linear" }
            }}
            className="absolute inset-0"
          >
            <img 
              src={heroImages[imageIndex]} 
              className="w-full h-full object-cover opacity-50"
              referrerPolicy="no-referrer"
              alt="Hero background"
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[#121212] z-10" />
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay z-10" />
      </div>

      <div className="absolute inset-0 z-1 pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ 
              opacity: 0,
              x: p.initialX + "%",
              y: p.initialY + "%"
            }}
            animate={{
              opacity: [0, 0.2, 0],
              y: ["-5%", "105%"],
              x: [
                p.initialX + "%",
                p.targetX + "%"
              ]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear"
            }}
            className="absolute w-1 h-1 bg-white/30 rounded-full blur-[1px]"
          />
        ))}
      </div>

      {/* Subtle Glow/Light Layer */}
      <motion.div 
        animate={{
          opacity: [0.05, 0.2, 0.05],
          x: [-200, 200, -200],
          rotate: [0, 5, 0]
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 z-1 bg-gradient-to-tr from-white/5 via-transparent to-white/5 blur-[180px] pointer-events-none"
      />

      {/* Content Layer */}
      <div className="relative z-20 w-full max-w-7xl px-6 text-center flex flex-col items-center">
        <div className="flex items-center justify-center mb-2 overflow-hidden w-full min-h-[80px]">
          <AnimatePresence mode="wait">
            <motion.h1 
              key={index}
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
              className="font-light tracking-tight text-white/90 leading-none italic font-serif text-lg md:text-xl"
            >
              {phrases[index]}
            </motion.h1>
          </AnimatePresence>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 4, delay: 2 }}
          className="flex flex-col items-center"
        >
          <div className="w-12 h-[1px] bg-white/10 mb-6" />
          <p className="text-[9px] md:text-[10px] text-white/20 font-medium tracking-[0.5em] uppercase">
            Consciência e progresso contínuo.
          </p>
        </motion.div>
      </div>

      {/* TOGGLE DE VISUALIZAÇÃO E NOVO DIÁRIO - Agora absoluto na Hero, menor e horizontal */}
      <div className="absolute bottom-12 md:bottom-8 right-4 md:right-8 z-50 flex items-center gap-2 md:gap-3 mb-[22px]">
        <button 
          onClick={() => {
            const entry = fakeDB.createDiaryEntry();
            navigate(`/diary/${entry.id}`);
          }}
          className="px-3 md:px-4 py-2 md:py-2.5 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full flex items-center gap-2 hover:bg-white/15 transition-all group shadow-2xl h-[15.3195px]"
        >
          <span className="material-symbols-outlined group-hover:text-white text-sm md:text-base leading-none" style={{ color: '#f9fbed' }}>add</span>
          <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.3em] text-white/40 group-hover:text-white leading-none">
            Novo Diário
          </span>
        </button>

        <button 
          onClick={() => setViewMode(viewMode === 'vertical' ? 'horizontal' : 'vertical')}
          className="px-3 md:px-4 py-2 md:py-2.5 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full flex items-center gap-2 hover:bg-white/15 transition-all group shadow-2xl h-[13.3195px]"
        >
          <motion.span 
            animate={{ rotate: viewMode === 'horizontal' ? 90 : 0 }}
            className="material-symbols-outlined text-white/60 group-hover:text-white text-sm md:text-base leading-none"
          >
            {viewMode === 'vertical' ? 'view_carousel' : 'view_stream'}
          </motion.span>
          <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.3em] text-white/40 group-hover:text-white leading-none">
            {viewMode === 'vertical' ? 'Carrossel' : 'Lista'}
          </span>
        </button>
      </div>

      {/* Bottom Transition Gradient - Lowered and Softer */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#121212] via-[#121212]/80 to-transparent z-30 pointer-events-none" />
    </section>
  );
}

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

const DayNightIcon = () => {
  const clouds = useMemo(() => [
    { id: 0, top: "35%", delay: 0, duration: 12, startX: -60, endX: 60 },
    { id: 1, top: "65%", delay: 6, duration: 12, startX: -60, endX: 60 }
  ], []);

  const nightStars = useMemo(() => [...Array(8)].map((_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    duration: 2 + Math.random() * 2,
    delay: Math.random() * 2
  })), []);

  return (
    <motion.div
      key="daynight"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-full"
    >
      {/* Céu Dinâmico com Gradiente */}
      <motion.div
        animate={{
          background: [
            "linear-gradient(to bottom, #fdba74, #fb923c)", // Amanhecer
            "linear-gradient(to bottom, #38bdf8, #0ea5e9)", // Dia
            "linear-gradient(to bottom, #818cf8, #4f46e5)", // Entardecer
            "linear-gradient(to bottom, #1e1b4b, #020617)", // Noite
            "linear-gradient(to bottom, #fdba74, #fb923c)"  // Volta ao Amanhecer
          ]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 z-0"
      />

      {/* Brilho Atmosférico (Glow) */}
      <motion.div
        animate={{
          opacity: [0.4, 0.2, 0.5, 0.3, 0.4],
          scale: [1, 1.2, 1, 1.1, 1]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 z-1 bg-white/10 blur-2xl"
      />

      {/* Sol Detalhado */}
      <motion.div
        animate={{
          y: [30, -15, -15, 30, 30],
          x: [-25, 0, 0, 25, -25],
          opacity: [0, 1, 1, 0, 0],
          rotate: [0, 360]
        }}
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
        animate={{
          y: [30, 30, 30, -15, 30],
          x: [25, 25, -25, 0, 25],
          opacity: [0, 0, 0, 1, 0],
          rotate: [-30, -30, -30, 0, -30]
        }}
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
      {clouds.map((cloud) => (
        <motion.div
          key={`cloud-${cloud.id}`}
          animate={{
            x: [cloud.startX, cloud.endX],
            opacity: [0, 1, 1, 0]
          }}
          transition={{ 
            duration: cloud.duration, 
            repeat: Infinity, 
            delay: cloud.delay,
            ease: "linear" 
          }}
          className="absolute z-20"
          style={{ top: cloud.top }}
        >
          <div className="relative">
            <motion.div 
              animate={{
                backgroundColor: [
                  "#fed7aa", // Amanhecer
                  "#ffffff", // Dia
                  "#c7d2fe", // Noite
                  "#fed7aa"
                ]
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="w-6 h-3 md:w-8 md:h-4 rounded-full blur-[0.5px] shadow-sm" 
            />
            <motion.div 
              animate={{
                backgroundColor: [
                  "#fed7aa",
                  "#ffffff",
                  "#c7d2fe",
                  "#fed7aa"
                ]
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 md:w-6 md:h-6 rounded-full -mt-3 md:-mt-4 ml-1 blur-[0.5px]" 
            />
          </div>
        </motion.div>
      ))}

      {/* Estrelas Cintilantes */}
      <motion.div
        animate={{
          opacity: [0, 0, 0, 1, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, times: [0, 0.6, 0.7, 0.9, 1] }}
        className="absolute inset-0 z-5"
      >
        {nightStars.map((star) => (
          <motion.div 
            key={star.id} 
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay
            }}
            className="absolute w-0.5 h-0.5 bg-white rounded-full"
            style={{ 
              top: `${star.top}%`, 
              left: `${star.left}%`
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

const FinanceHealthIcon = () => {
  const [phase, setPhase] = useState<'graph' | 'plus' | 'dollars' | 'heart' | 'ecg'>('graph');

  const heartGlowParticles = useMemo(() => [0, 1, 2, 3].map((i) => ({
    id: i,
    xOffset: (i % 2 === 0 ? -1 : 1) * (15 + Math.random() * 10),
    yOffset: (i < 2 ? -1 : 1) * (15 + Math.random() * 10),
    duration: 0.8,
    delay: i * 0.2
  })), []);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('plus'), 5000),
      setTimeout(() => setPhase('dollars'), 8000),
      setTimeout(() => setPhase('heart'), 12000),
      setTimeout(() => setPhase('ecg'), 16000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      key="finance-health"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
              animate={{ backgroundColor: ["rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(0,0,0,0.6)", "rgba(0,0,0,0)"] }}
              transition={{ duration: 5, times: [0, 0.4, 0.5, 1] }}
              className="absolute inset-0 z-0"
            />

            {/* Grid de fundo para detalhe */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <div key={`h-${i}`} className="absolute w-full h-px bg-white" style={{ top: `${i * 25}%` }} />
              ))}
              {[...Array(5)].map((_, i) => (
                <div key={`v-${i}`} className="absolute h-full w-px bg-white" style={{ left: `${i * 25}%` }} />
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
            {[...Array(30)].map((_, i) => (
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
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 90, 0]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 flex items-center justify-center"
            >
              <div className="w-8 h-2.5 bg-green-500 rounded-full absolute shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
              <div className="w-2.5 h-8 bg-green-500 rounded-full absolute shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
            </motion.div>

            {/* Cifrões Pequenos em Volta */}
            {[...Array(8)].map((_, i) => (
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
              animate={{ 
                scale: [1, 1.15, 1, 1.15, 1],
                filter: ["brightness(1)", "brightness(1.2)", "brightness(1)", "brightness(1.2)", "brightness(1)"]
              }}
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
              {heartGlowParticles.map((p) => (
                <motion.div
                  key={`heart-glow-${p.id}`}
                  animate={{ 
                    opacity: [0, 0.8, 0],
                    scale: [0, 1.5, 0],
                    x: p.xOffset,
                    y: p.yOffset
                  }}
                  transition={{ repeat: Infinity, duration: p.duration, delay: p.delay }}
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
                animate={{ 
                  pathLength: [0, 1, 1],
                  x: [-100, 0, 100]
                }}
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
                animate={{
                  cx: [0, 100],
                  cy: [50, 50, 30, 70, 50, 50, 20, 80, 50, 50],
                  opacity: [0, 1, 1, 0]
                }}
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
};

const MagicIcon = () => {
  const [mode, setMode] = useState<'stars' | 'eyes' | 'rose' | 'beckoning' | 'daynight' | 'financeHealth'>('stars');
  const [expressionIndex, setExpressionIndex] = useState(0);
  
  // Definição de 20 expressões faciais únicas
  const expressions = useMemo(() => [
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
  ], []);

  useEffect(() => {
    const modeInterval = setInterval(() => {
      setMode(prev => {
        if (prev === 'stars') return 'eyes';
        if (prev === 'eyes') return 'rose';
        if (prev === 'rose') return 'beckoning';
        if (prev === 'beckoning') return 'daynight';
        if (prev === 'daynight') return 'financeHealth';
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
  }, [expressions.length]);

  const current = expressions[expressionIndex];

  return (
    <div className="relative flex items-center justify-center w-full h-full scale-[0.75] md:scale-100">
      <AnimatePresence mode="wait">
        {mode === 'stars' && (
          <motion.div
            key="stars"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: [1, 1.05, 1] }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 1 }}
            className="flex items-center justify-center"
          >
            <motion.span
              animate={{ 
                filter: ['drop-shadow(0 0 0px #fff)', 'drop-shadow(0 0 10px #fff)', 'drop-shadow(0 0 0px #fff)'],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="material-symbols-outlined text-white text-base md:text-lg"
            >
              auto_awesome
            </motion.span>
          </motion.div>
        )}

        {mode === 'rose' && <RoseIcon />}
        
        {mode === 'daynight' && <DayNightIcon />}
        
        {mode === 'financeHealth' && <FinanceHealthIcon />}

        {mode === 'eyes' && (
          <motion.div
            key="eyes"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1,
              scale: 1,
              rotate: current.headRotate,
              y: current.name === 'Thinking' ? -1 : 0
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8, ease: "backOut" }}
            className="flex flex-col items-center justify-center gap-0.5 relative"
          >
            {/* Sobrancelhas */}
            <div className="absolute -top-1.5 flex justify-between w-9 px-0.5 z-20">
              {[0, 1].map((i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    y: current.browY, 
                    rotate: i === 0 ? -current.browRotate : current.browRotate,
                  }}
                  transition={{ duration: 0.5, ease: "circOut" }}
                  className="w-2.5 h-0.5 bg-white/40 rounded-full"
                />
              ))}
            </div>

            {/* Blush */}
            <motion.div
              animate={{
                opacity: current.blush,
                scale: current.blush > 0 ? 1 : 0.5
              }}
              transition={{ duration: 0.8 }}
              className="absolute top-1 flex justify-between w-9 px-0.5 pointer-events-none"
            >
              <div className="w-2 h-1.5 bg-pink-500/30 blur-[3px] rounded-full" />
              <div className="w-2 h-1.5 bg-pink-500/30 blur-[3px] rounded-full" />
            </motion.div>

            {/* Olhos */}
            <div className="flex gap-1.5 items-center justify-center z-10">
              {[0, 1].map((i) => (
                <div key={i} className="relative w-3.5 h-2 md:w-4 md:h-2.5 bg-white/5 rounded-full border border-white/10 overflow-hidden flex items-center justify-center">
                  <motion.div 
                    animate={{ 
                      scaleY: (current.name === 'Wink' && i === 1) ? 1 : (1 - current.eyeScaleY) 
                    }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-[#121212] z-10 origin-top"
                  />
                  <motion.div 
                    animate={{ 
                      scaleY: (current.name === 'Wink' && i === 1) ? 1 : (1 - current.eyeScaleY)
                    }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-[#121212] z-10 origin-bottom"
                  />
                  <motion.div
                    animate={{ 
                      scale: current.eyeScaleY > 1 ? 1.1 : 0.9,
                      x: current.name === 'Curious' ? (i === 0 ? 1 : 2) : 0
                    }}
                    className="w-1 h-1 md:w-1.5 md:h-1.5 bg-white rounded-full shadow-[0_0_5px_rgba(255,255,255,1)]"
                  />
                </div>
              ))}
            </div>
            
            {/* Boca / Sorriso */}
            <motion.div
              animate={{
                scaleX: current.mouthScaleX,
                scaleY: current.mouthScaleY,
                y: current.mouthY,
                borderRadius: current.name === 'Whistling' ? '50%' : '0 0 16px 16px'
              }}
              transition={{ duration: 0.5, ease: "backOut" }}
              className={`w-4 h-1.5 border-b-2 border-white/70 shadow-[0_3px_8px_rgba(255,255,255,0.2)]`}
            />
          </motion.div>
        )}

        {mode === 'beckoning' && (
          <motion.div
            key="beckoning"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: [0, 0, 2, 0] // Leve "suspiro" no final (tédio)
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center justify-center gap-0.5 relative"
          >
            {/* Sobrancelhas (Neutro -> Sério -> Tédio) */}
            <div className="absolute -top-2 flex justify-between w-10 px-0.5 z-20">
              {[0, 1].map((i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    y: [
                      -4, // Neutro
                      -4, 
                      -2, // Sério (baixando)
                      -2, 
                      -3, // Tédio (relaxado)
                      -3,
                      -4  // Voltar ao Neutro
                    ],
                    rotate: [
                      0, // Neutro
                      0, 
                      i === 0 ? -15 : 15, // Sério (franzindo)
                      i === 0 ? -15 : 15,
                      i === 0 ? 5 : -5, // Tédio (caído)
                      i === 0 ? 5 : -5,
                      0 // Voltar ao Neutro
                    ]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 9, 
                    times: [0, 0.25, 0.3, 0.55, 0.6, 0.85, 1],
                    ease: "easeInOut"
                  }}
                  className="w-3.5 h-0.5 bg-white/50 rounded-full"
                />
              ))}
            </div>

            {/* Olhos (Neutro -> Sério -> Tédio) */}
            <div className="flex gap-2 items-center justify-center z-10">
              {[0, 1].map((i) => (
                <div key={i} className="relative w-4 h-2.5 bg-white/5 rounded-full border border-white/10 overflow-hidden flex items-center justify-center">
                  {/* Pálpebras para Tédio/Sério */}
                  <motion.div 
                    animate={{ 
                      scaleY: [
                        0, // Neutro
                        0, 
                        0.2, // Sério (levemente semicerrado)
                        0.2, 
                        0.6, // Tédio (bem semicerrado)
                        0.6,
                        0 // Voltar ao Neutro
                      ]
                    }}
                    transition={{ repeat: Infinity, duration: 9, times: [0, 0.25, 0.3, 0.55, 0.6, 0.85, 1], ease: "easeInOut" }}
                    className="absolute inset-0 bg-[#121212] z-10 origin-top"
                  />
                  <motion.div
                    animate={{ 
                      scale: [
                        1, // Neutro
                        1, 
                        0.8, // Sério (foco)
                        0.8, 
                        1, // Tédio (desfocado)
                        1,
                        1 // Voltar ao Neutro
                      ],
                      y: [
                        0, 
                        0, 
                        0, 
                        0, 
                        1, // Tédio (olhando levemente para baixo)
                        1,
                        0 // Voltar ao Neutro
                      ]
                    }}
                    transition={{ repeat: Infinity, duration: 9, times: [0, 0.25, 0.3, 0.55, 0.6, 0.85, 1], ease: "easeInOut" }}
                    className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_5px_rgba(255,255,255,0.8)]"
                  />
                </div>
              ))}
            </div>

            {/* Boca (Neutro -> Sério -> Tédio) */}
            <motion.div
              animate={{
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
              }}
              transition={{ repeat: Infinity, duration: 9, times: [0, 0.3, 0.35, 0.6, 0.65, 1] }}
              className="w-5 h-1.5 border-b-2 border-white/60 rounded-[0_0_10px_10px]"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DiaryCard = ({ entry, viewMode, navigate }: { entry: any; viewMode: 'vertical' | 'horizontal'; navigate: any }) => {
  // Helper to handle date fallbacks from startAt
  const dateRef = entry.startAt ? new Date(entry.startAt) : new Date();
  const d = entry.day || dateRef.getDate().toString().padStart(2, '0');
  const m = entry.month || (dateRef.getMonth() + 1).toString().padStart(2, '0');
  const y = entry.year || dateRef.getFullYear().toString().slice(-2);
  const mName = entry.monthName || dateRef.toLocaleDateString('pt-BR', { month: 'long' });
  const wDay = entry.weekday || dateRef.toLocaleDateString('pt-BR', { weekday: 'long' });
  const timeStr = entry.time || dateRef.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
  const formattedMonthName = mName.charAt(0).toUpperCase() + mName.slice(1);
  const formattedWeekday = wDay.charAt(0).toUpperCase() + wDay.slice(1);

  const isCompleted = entry.status === 'completed';
  const startHour = entry.time || dateRef.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
  const endHour = entry.endAt 
    ? new Date(entry.endAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false }) 
    : '18:30';

  // Slideshow logic for 3 image slots
  const [imgIndices, setImgIndices] = useState([0, 1, 2]);
  const gallery = entry.gallery || [];

  useEffect(() => {
    if (gallery.length <= 3) return;

    const interval = setInterval(() => {
      setImgIndices(prev => {
        const next = [...prev];
        // Rotate indices
        return next.map(idx => (idx + 1) % gallery.length);
      });
    }, 4500); // Change image every 4.5 seconds
    return () => clearInterval(interval);
  }, [gallery.length]);

  const [windowWidth, setWindowWidth] = useState(() => typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  const hasImages = gallery.length > 0;
  const mainImg = hasImages ? gallery[imgIndices[0]] : null;
  const eventImg = (hasImages && gallery.length > 1) ? gallery[imgIndices[1]] : null;
  const circleImg = (hasImages && gallery.length > 2) ? gallery[imgIndices[2]] : null;

  const titleStr = entry.title || 'Sem título';
  const wordCount = titleStr.trim().split(/\s+/).length;
  const longestWordLength = Math.max(...titleStr.split(/\s+/).map(w => w.length), 1);
  
  // Dynamic font sizing based on word count and horizontal container capacity to avoid text overflow or forced hyphenation/splitting mid-word.
  let finalFontSize: number;
  if (isMobile) {
    let defaultMobileFont = 24;
    if (wordCount <= 2) defaultMobileFont = 48;
    else if (wordCount <= 4) defaultMobileFont = 40;
    else if (wordCount <= 7) defaultMobileFont = 33;

    // Standard card text width on mobile is ~280px
    const maxSafeMobileFont = Math.floor(280 / (longestWordLength * 0.52));
    finalFontSize = Math.max(18, Math.min(defaultMobileFont, maxSafeMobileFont));
  } else if (isTablet) {
    let defaultTabletFont = 30;
    if (wordCount <= 2) defaultTabletFont = 60;
    else if (wordCount <= 4) defaultTabletFont = 48;
    else if (wordCount <= 7) defaultTabletFont = 36;

    // Available text width on tablets is ~400px
    const maxSafeTabletFont = Math.floor(400 / (longestWordLength * 0.52));
    finalFontSize = Math.max(20, Math.min(defaultTabletFont, maxSafeTabletFont));
  } else {
    // Desktop layout
    let defaultDesktopFont = 48;
    if (wordCount <= 2) defaultDesktopFont = 96;
    else if (wordCount <= 4) defaultDesktopFont = 72;
    else if (wordCount <= 7) defaultDesktopFont = 60;

    // Available text width on desktop is ~440px
    const maxSafeDesktopFont = Math.floor(440 / (longestWordLength * 0.52));
    finalFontSize = Math.max(22, Math.min(defaultDesktopFont, maxSafeDesktopFont));
  }

  return (
    <motion.div
      layout="position"
      key={entry.id}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => navigate(`/diary/${entry.id}`)}
      className={`w-full max-w-[540px] bg-[#e6e2d7] rounded-[3.5rem] overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,0.3)] text-[#1a1a1a] flex flex-col flex-shrink-0 transition-all duration-700 cursor-pointer ${
        viewMode === 'horizontal' ? 'snap-center scale-[0.4] md:scale-[0.55] lg:scale-[0.65] mx-[-110px] md:mx-[-70px] lg:mx-[-40px]' : ''
      }`}
    >
      {/* HEADER DO CARD */}
      <div className="p-10 md:p-12 pb-8" style={{ paddingTop: '23px' }}>
        <div className="flex justify-between items-start mb-10" style={{ marginTop: '15px', marginBottom: '25px' }}>
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#1a1a1a]/40 uppercase">
            {entry.location || 'Localização não informada'}
          </span>
          <div className="px-4 py-1.5 rounded-full text-[9px] font-bold tracking-widest text-[#1a1a1a]/60 uppercase" style={{ backgroundColor: '#ffffff' }}>
            {entry.status === 'active' ? 'Em Aberto' : entry.status === 'completed' ? 'Finalizado' : (entry.status || 'Pendente')}
          </div>
        </div>

        <h2 
          style={{
            fontSize: `${finalFontSize}px`,
            ...(isMobile ? { 
              width: '289.046px',
              marginBottom: '40px',
              marginRight: '0px',
              marginTop: '0px',
              marginLeft: '-22px'
            } : {})
          }}
          className="font-medium tracking-tight leading-[0.95] mb-10 whitespace-pre-line break-normal transition-all duration-500"
        >
          {titleStr}
        </h2>

        {/* COMPONENTE DE DATA COMPLETO (OTIMIZADO MOBILE) */}
        <div 
          className="bg-[#05161d] p-4 rounded-[23px] flex flex-wrap items-center gap-4 md:gap-8 shadow-sm w-fit mx-auto md:ml-[-33px] mb-[-116px] relative z-10"
          style={{ 
            paddingLeft: '15px', 
            paddingRight: '9px', 
            paddingBottom: '6px', 
            paddingTop: '0px', 
            marginTop: '0px', 
            marginRight: '0px', 
            marginLeft: '-33px',
            ...(isMobile ? { width: '311.91px' } : {})
          }}
        >
          <div className="flex gap-4 items-center" style={{ marginTop: '-15px', paddingBottom: '0px' }}>
            {/* DIA */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex gap-1">
                <div className="relative bg-[#ff0050] rounded-lg w-10 h-14 md:w-12 md:h-16 flex items-center justify-center overflow-hidden shadow-lg">
                  <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent border-b border-black/60" />
                  <span className="text-2xl md:text-[35px] font-black text-[#ffffff] z-10 tracking-tighter">{d[0] || '0'}</span>
                  <div className="absolute inset-x-0 h-[1px] bg-black/80 top-1/2 -translate-y-1/2 z-20" />
                </div>
                <div className="relative bg-[#ff0050] rounded-lg w-10 h-14 md:w-12 md:h-16 flex items-center justify-center overflow-hidden shadow-lg">
                  <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent border-b border-black/60" />
                  <span className="text-2xl md:text-[35px] font-black text-[#ffffff] z-10 tracking-tighter">{d[1] || '0'}</span>
                  <div className="absolute inset-x-0 h-[1px] bg-black/80 top-1/2 -translate-y-1/2 z-20" />
                </div>
              </div>
              <span className="text-[6px] font-black tracking-[0.2em] text-[#05161d] uppercase">DIA</span>
            </div>

            {/* MÊS (NÚMERO) */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex gap-1">
                <div className="relative bg-[#000000] rounded-lg w-8 h-12 md:w-10 md:h-14 flex items-center justify-center overflow-hidden shadow-lg">
                  <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent border-b border-black/60" />
                  <span className="text-xl md:text-[25px] font-black text-[#ffffff] z-10 tracking-tighter">{m[0] || '0'}</span>
                  <div className="absolute inset-x-0 h-[1px] bg-black/80 top-1/2 -translate-y-1/2 z-20" />
                </div>
                <div className="relative bg-[#000000] rounded-lg w-8 h-12 md:w-10 md:h-14 flex items-center justify-center overflow-hidden shadow-lg">
                  <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent border-b border-black/60" />
                  <span className="text-xl md:text-[25px] font-black text-[#ffffff] z-10 tracking-tighter">{m[1] || '0'}</span>
                  <div className="absolute inset-x-0 h-[1px] bg-black/80 top-1/2 -translate-y-1/2 z-20" />
                </div>
              </div>
              <span className="text-[6px] font-black tracking-[0.2em] text-[#05161d] uppercase">MÊS</span>
            </div>

            {/* ANO */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex gap-1">
                <div className="relative bg-[#000000] rounded-lg w-8 h-12 md:w-10 md:h-14 flex items-center justify-center overflow-hidden shadow-lg">
                  <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent border-b border-black/60" />
                  <span className="text-xl md:text-[25px] font-black text-[#ffffff] z-10 tracking-tighter">{y[0] || '0'}</span>
                  <div className="absolute inset-x-0 h-[1px] bg-black/80 top-1/2 -translate-y-1/2 z-20" />
                </div>
                <div className="relative bg-[#000000] rounded-lg w-8 h-12 md:w-10 md:h-14 flex items-center justify-center overflow-hidden shadow-lg">
                  <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent border-b border-black/60" />
                  <span className="text-xl md:text-[25px] font-black text-[#ffffff] z-10 tracking-tighter">{y[1] || '0'}</span>
                  <div className="absolute inset-x-0 h-[1px] bg-black/80 top-1/2 -translate-y-1/2 z-20" />
                </div>
              </div>
              <span className="text-[6px] font-black tracking-[0.2em] text-[#05161d] uppercase">ANO</span>
            </div>
          </div>

          <div className="hidden md:block w-[1px] h-10 bg-white/10" />

          {/* DIA DA SEMANA E MÊS (HORIZONTAL COMPACTO) */}
          <div 
            className="flex items-center gap-3 md:gap-5 w-[258.931px] md:w-[367.921px]" 
            style={{ 
              marginTop: '-23px',
              ...(isMobile ? { width: '286.921px' } : {})
            }}
          >
            <div className="flex items-baseline gap-2">
              <span 
                className="text-[18px] font-black tracking-[0.1em] text-[#fffbfb] uppercase"
                style={{ 
                  marginLeft: '7px',
                  ...(isMobile ? { width: '157.51px', display: 'inline-block' } : {})
                }}
              >
                {formattedWeekday}
              </span>
            </div>
            
            <div 
              className="rounded-xl shadow-xl flex items-center justify-center border-box"
              style={{ 
                width: '98.4276px', 
                height: '20.983px', 
                marginLeft: '11px', 
                backgroundColor: '#051c08', 
                border: '1.59px solid #9d9d9d',
                marginTop: '-10px'
              }}
            >
              <span className="text-[12px] font-bold text-[#e8e4d9] tracking-[0.15em] uppercase leading-none" style={{ fontFamily: 'Verdana' }}>
                {formattedMonthName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO VISUAL (IMAGEM + OVERLAPS) */}
      <div className="px-4 md:px-5 relative" style={{ marginTop: '8px', height: '385.744px' }}>
        <div 
          className="relative aspect-[4/5] md:aspect-[16/11] rounded-[2.8rem] overflow-hidden shadow-lg"
          style={{ marginTop: '0px', marginBottom: '12px' }}
        >
          {hasImages && mainImg ? (
            <AnimatePresence mode="wait">
              <motion.img 
                key={mainImg}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 1 }}
                src={mainImg} 
                alt="Main" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a262b] to-[#081215] flex items-center justify-center relative">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                   style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
              <div className="flex flex-col items-center gap-4 text-white/10 select-none">
                <span className="material-symbols-outlined text-5xl font-light">book</span>
                <span className="text-[10px] tracking-[0.4em] uppercase font-bold">Sem Mídia</span>
              </div>
            </div>
          )}
          
          {/* CARD ESCURO/CLARO SOBREPOSTO (DIREITA) */}
          <div className={`absolute bottom-3 right-3 md:bottom-5 md:right-5 w-44 md:w-64 backdrop-blur-md rounded-[1.5rem] md:rounded-[2rem] p-3 md:p-4 shadow-2xl border transition-all duration-300 ${
            isCompleted 
              ? 'bg-white/95 border-black/10 text-black shadow-[0_15px_30px_rgba(0,0,0,0.15)]' 
              : 'bg-[#1a1a1a]/95 border-white/5 text-white'
          }`}>
            <div className="aspect-[4/3] rounded-xl md:rounded-2xl overflow-hidden mb-3 md:mb-4">
              {hasImages && eventImg ? (
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={eventImg}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    src={eventImg} 
                    alt="Evento" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </AnimatePresence>
              ) : (
                <div className={`w-full h-full rounded-xl md:rounded-2xl flex items-center justify-center border ${
                  isCompleted 
                    ? 'bg-black/[0.03] border-black/5' 
                    : 'bg-white/[0.04] border-white/5'
                }`}>
                  <span className={`material-symbols-outlined text-xl font-light ${
                    isCompleted ? 'text-black/20' : 'text-white/10'
                  }`}>event</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-end">
              <div className="space-y-1.5 flex-1 pr-1">
                {isCompleted ? (
                  <>
                    <div className="inline-block px-1.5 py-0.5 rounded bg-black text-white text-[7px] md:text-[9px] font-black tracking-[0.15em] mb-1.5 uppercase">
                      DIA FINALIZADO
                    </div>
                    <p className="text-black text-[11px] md:text-[13px] font-black tracking-wider uppercase leading-snug">
                      INÍCIO: {startHour}
                    </p>
                    <p className="text-black text-[11px] md:text-[13px] font-black tracking-wider uppercase leading-snug">
                      FIM: {endHour}
                    </p>
                  </>
                ) : (
                  <p className="text-white text-[11px] md:text-[13px] font-black tracking-wider uppercase leading-snug">
                    INICIADO ÀS {startHour}
                  </p>
                )}
                <p className={`text-[9.5px] md:text-[11.5px] tracking-wide font-bold uppercase transition-colors ${
                  isCompleted ? 'text-black/60' : 'text-white/60'
                }`}>
                  {`${d} ${formattedWeekday.slice(0, 3)}, ${formattedMonthName}`}
                </p>
              </div>
              <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center shadow-lg transition-colors shrink-0 ${
                isCompleted ? 'bg-black text-white' : 'bg-white text-black'
              }`}>
                <span className="material-symbols-outlined text-[14px] md:text-[18px]">chevron_right</span>
              </div>
            </div>
          </div>

          {/* PREVIEW CIRCULAR (ESQUERDA) - ANÉIS CONCÊNTRICOS */}
          <div className="absolute bottom-3 left-3 md:bottom-5 md:left-5 flex items-center justify-center">
            <div className="relative w-20 h-20 md:w-28 md:h-28 flex items-center justify-center">
              {/* Anéis de Radar */}
              <div className="absolute inset-0 border border-white/20 rounded-full scale-100" />
              <div className="absolute inset-0 border border-white/10 rounded-full scale-[1.2]" />
              <div className="absolute inset-0 border border-white/5 rounded-full scale-[1.4]" />
              
              <div className="w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden relative border-2 border-white/30 p-0.5">
                <div className="w-full h-full rounded-full overflow-hidden relative">
                  {hasImages && circleImg ? (
                    <AnimatePresence mode="wait">
                      <motion.img 
                        key={circleImg}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        src={circleImg} 
                        alt="Status" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </AnimatePresence>
                  ) : (
                    <div className="w-full h-full bg-[#ff0050]/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#ff0050] text-sm md:text-lg animate-pulse">favorite</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                    <div className="px-1.5 py-0.5 md:px-2 md:py-0.5 bg-black rounded-full text-[5px] md:text-[6px] font-black text-white tracking-[0.2em] uppercase">
                      {timeStr}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO DE CONTEÚDO */}
      <div className="p-10 md:p-14 text-center" style={{ marginBottom: '0px', marginTop: '0px', paddingBottom: '0px', paddingLeft: '40px', paddingTop: '15px' }}>
        
        <p className="text-[13px] md:text-[14px] font-medium leading-relaxed text-[#1a1a1a]/50 max-w-[360px] mx-auto mb-12 whitespace-pre-line">
          {entry.description || 'Sem descrição.'}
        </p>

      </div>

      {/* FOOTER DO CARD */}
      <div className="px-10 md:px-12 pb-12 flex flex-row justify-between items-center gap-6" style={{ marginTop: '-25px', marginBottom: '-15px' }}>
        <div className="flex flex-row gap-3">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/diary/${entry.id}`);
            }}
            className="px-4 md:px-7 py-3.5 border border-[#1a1a1a]/15 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest hover:bg-[#1a1a1a] hover:text-white transition-all"
          >
            Acessar Diário
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/diary/closure/${entry.id}`);
            }}
            className="px-4 md:px-7 py-3.5 border border-[#1a1a1a]/15 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest hover:bg-[#1a1a1a] hover:text-white transition-all"
          >
            Ver Resumo
          </button>
        </div>

        <button className="flex items-center gap-4 md:gap-8 bg-[#1a1a1a] text-white px-5 md:px-7 py-4 rounded-full group hover:shadow-xl transition-all">
          <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] hidden sm:inline">Mais info</span>
          <div className="w-8 h-8 bg-white/15 rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </div>
        </button>
      </div>
    </motion.div>
  );
};

export function DiaryPage({ onBack, onToggleSidebar }: { onBack: () => void; onToggleSidebar: () => void }) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'vertical' | 'horizontal'>(() => {
    return (safeLocalStorage.getItem('diary_view_mode') as 'vertical' | 'horizontal') || 'vertical';
  });
  const [entries, setEntries] = useState(fakeDB.diaries);
  const [visibleDiaryCount, setVisibleDiaryCount] = useState<number>(6);

  useOrganismSync(['diaryUpdated', 'systemReset'], React.useCallback(() => {
    setEntries([...fakeDB.diaries]);
  }, []));

  useEffect(() => {
    safeLocalStorage.setItem('diary_view_mode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    fakeDB.syncWithBackend();
  }, []);

  useEffect(() => {
    // Sync with fakeDB when returning to page or when fakeDB changes
    setEntries([...fakeDB.diaries]);
  }, [fakeDB.diaries, viewMode]);

  const renderedEntries = useMemo(() => {
    const visibleItems = viewMode === 'vertical' ? entries.slice(0, visibleDiaryCount) : entries;
    return visibleItems.map((entry) => (
      <DiaryCard 
        key={entry.id} 
        entry={entry} 
        viewMode={viewMode} 
        navigate={navigate} 
      />
    ));
  }, [entries, viewMode, navigate, visibleDiaryCount]);

  return (
    <div className={`min-h-screen bg-[#121212] text-white font-sans selection:bg-white/10 ${viewMode === 'vertical' ? 'overflow-y-auto' : 'overflow-hidden'}`}>
      {/* NAVEGAÇÃO SUPERIOR FIXA */}
      <nav className="fixed top-4 left-4 right-4 md:top-8 md:left-8 md:right-8 z-50 flex justify-between items-center pointer-events-auto">
        <div className="pointer-events-auto">
          <button 
            onClick={onToggleSidebar}
            className="px-4 pt-[7px] pb-[7px] md:w-[111.613px] md:h-[71.3075px] bg-white/10 backdrop-blur-xl border border-white/10 rounded-[14px] flex items-center justify-center gap-2 md:gap-3 hover:bg-white/20 transition-all group shadow-lg mr-0 mb-0 pointer-events-auto"
          >
            <span className="material-symbols-outlined text-white/70 group-hover:text-white text-sm md:text-base">menu</span>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 group-hover:text-white">Menu</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 md:gap-3 pointer-events-auto">
          <button 
            onClick={() => navigate('/identity')}
            className="px-3 py-2 md:px-6 md:py-3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full flex items-center hover:bg-white/20 transition-all group shadow-lg pr-[35px] mr-[-26px] md:mr-[-35px] md:w-[206.4px]"
          >
            <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 group-hover:text-white whitespace-nowrap translate-x-[4px] md:translate-x-[10px] inline-block">Douglas L. Rocha</span>
          </button>
          <button 
            onClick={() => navigate('/identity-view')}
            className="w-10 h-10 md:w-[50.6565px] md:h-[50.6565px] bg-white/10 backdrop-blur-xl border border-[#e4e4e4] rounded-[14px] flex items-center justify-center hover:bg-white/20 transition-all group shadow-lg overflow-hidden"
          >
            <MagicIcon />
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <HeroSection viewMode={viewMode} setViewMode={setViewMode} />

      {/* CONTAINER PRINCIPAL */}
      <main className={`relative z-40 transition-all duration-1000 ease-[0.22,1,0.36,1] ${
        viewMode === 'vertical' 
          ? "pt-1 max-w-screen-xl mx-auto px-6 py-12 flex flex-col items-center gap-32 mt-[-55px]" 
          : "w-full h-[400.75px] md:h-screen fixed top-0 left-0 md:inset-0 z-[60] bg-[#121212]/95 backdrop-blur-sm flex flex-row items-center gap-0 overflow-x-auto overflow-y-hidden snap-x snap-mandatory px-[10vw] md:px-[15vw] no-scrollbar mt-[-55px] md:mt-0 pt-0 pb-0"
      }`}>
        {/* O botão de fechar foi removido pois o toggle global agora lida com isso */}

        <AnimatePresence mode="popLayout">
          {renderedEntries}
        </AnimatePresence>

        {viewMode === 'vertical' && entries.length > visibleDiaryCount && (
          <div className="w-full flex justify-center py-4 mt-8">
            <button
              onClick={() => {
                setVisibleDiaryCount(prev => prev + 6);
                if (typeof haptics !== 'undefined') haptics.success();
              }}
              className="px-8 py-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full flex items-center gap-2.5 transition-all text-xs font-bold uppercase tracking-widest cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>Carregar diários anteriores</span>
              <span className="material-symbols-outlined animate-bounce text-sm">arrow_downward</span>
            </button>
          </div>
        )}

        {/* CITAÇÃO FINAL */}
        {viewMode === 'vertical' && (
          <div className="text-center opacity-20 py-20">
            <p className="font-serif italic text-xl">Sua jornada, escrita em cada onda.</p>
          </div>
        )}
      </main>
    </div>
  );
}
