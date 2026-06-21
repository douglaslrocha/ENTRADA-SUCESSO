import React from 'react';
import { motion } from 'motion/react';

interface IconProps {
  color: string;
}

// 1. DIARY (Diário - auto_stories): Super Premium Brand Representation for "MEU DIÁRIO"
// Inspired by the official brand logo. Features a technical cartographic globe, a majestic centered obsidian metal 'A',
// a shimmering radiant blue supernova lens flare in the upper-left, and a primary horizontal capsule displaying "MEU DIÁRIO".
export const AnimatedDiary: React.FC<IconProps> = ({ color }) => {
  return (
    <div className="relative w-10 h-10 flex items-center justify-center overflow-visible scale-[1.3]">
      {/* 1. Subtle, dual-colored premium halo reflecting ambient diary/brand light */}
      <motion.div
        className="absolute w-8 h-8 rounded-full opacity-25 blur-md pointer-events-none"
        style={{
          background: `radial-gradient(circle, #2563eb 0%, #000000 65%, transparent 100%)`
        }}
        animate={{
          scale: [0.95, 1.25, 0.95],
          opacity: [0.18, 0.38, 0.18]
        }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 2. Primary SVG Vector Asset */}
      <motion.svg
        viewBox="0 0 100 100"
        className="w-10 h-10 overflow-visible selection:bg-transparent"
        style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.65))' }}
      >
        <defs>
          {/* Radial gradient for the void space of the globe */}
          <radialGradient id="globeSpaceVoid" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="65%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>

          {/* Metallic/mineral gradient for the continents of the globe */}
          <linearGradient id="globeContinents" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="50%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* Deep obsidian gold/graphite gradient for the letter 'A' */}
          <linearGradient id="letterAObsidian" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="30%" stopColor="#0f172a" />
            <stop offset="70%" stopColor="#020617" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          {/* Pristine metallic silver gradient for borders of letter A */}
          <linearGradient id="silverTrim" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* Lens flare gradients */}
          <radialGradient id="supernovaBlueCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="20%" stopColor="#a5f3fc" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="80%" stopColor="#1e40af" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          <linearGradient id="flareRay" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="45%" stopColor="#bfdbfe" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="55%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>

          <radialGradient id="pillHighlight" cx="50%" cy="0%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/* Clip path to keep continents confined inside the globe circle */}
          <clipPath id="earthBound">
            <circle cx="50" cy="52" r="32" />
          </clipPath>

          {/* Glow visual filter for supreme brand bloom */}
          <filter id="superGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Arc path definitions for labels */}
          <path id="topCapsulePath" d="M 23,39 A 35.5,35.5 0 0,1 77,39" fill="none" />
          <path id="bottomLeftCapsulePath" d="M 23,65 A 35.5,35.5 0 0,0 52,87.5" fill="none" />
        </defs>

        {/* ==================== LAYER 1: GLOBE CONCENTRICS ==================== */}
        <g clipPath="url(#earthBound)">
          {/* Globe space sphere void */}
          <circle cx="50" cy="52" r="32" fill="url(#globeSpaceVoid)" />

          {/* Static continents, reflecting perfect spatial grounding */}
          <g fill="url(#globeContinents)" opacity="0.55">
            <path d="M 23,38 C 21,34 26,26 31,30 C 35,32 38,40 37,45 C 36,48 40,54 41,60 C 42,65 37,70 34,75 C 32,78 35,84 31,82 C 27,80 28,74 29,68 C 27,62 25,58 26,52 Z" />
            <path d="M 54,28 C 58,26 62,32 64,36 C 66,40 63,45 61,48 C 59,52 64,58 65,64 C 66,70 61,74 58,78 C 54,75 50,68 51,62 C 52,56 48,46 54,28 Z" />
            <path d="M 68,30 C 72,28 78,35 77,42 C 76,46 80,50 82,54 C 84,58 81,64 78,68 C 76,71 70,68 68,64 C 66,60 67,52 68,30 Z" />
          </g>

          {/* Cartography lines */}
          <circle cx="50" cy="52" r="32" fill="none" stroke="#475569" strokeWidth="0.4" opacity="0.4" />
          <line x1="18" y1="52" x2="82" y2="52" stroke="#475569" strokeWidth="0.4" opacity="0.4" />
          <path d="M 50,20 A 32,32 0 0,0 50,84" fill="none" stroke="#475569" strokeWidth="0.4" opacity="0.25" />
          <path d="M 50,20 A 32,32 0 0,1 50,84" fill="none" stroke="#475569" strokeWidth="0.4" opacity="0.25" />
        </g>

        {/* ==================== LAYER 2: CURVED TOP BLACK CAPSULE & TEXT ==================== */}
        {/* "ADICIONARES GLOBAL INC" */}
        <path 
          d="M 24,39 A 35.5,35.5 0 0,1 76,39" 
          fill="none" 
          stroke="#111827" 
          strokeWidth="5" 
          strokeLinecap="round" 
          opacity="0.95"
        />
        <text opacity="0.95">
          <textPath href="#topCapsulePath" startOffset="50%" textAnchor="middle" fill="#f8fafc" fontSize="3.1" fontWeight="bold" letterSpacing="0.4">
            ADICIONARES GLOBAL INC
          </textPath>
        </text>

        {/* ==================== LAYER 3: VELVET BLUE LOWER RIBBON & TEXT ==================== */}
        {/* "COLLEGE DE AMPARADORES" */}
        <path 
          d="M 23,65 A 35.5,35.5 0 0,0 52,87.5" 
          fill="none" 
          stroke="#004cff" 
          strokeWidth="5" 
          strokeLinecap="round" 
        />
        <text>
          <textPath href="#bottomLeftCapsulePath" startOffset="50%" textAnchor="middle" fill="#ffffff" fontSize="2.8" fontWeight="bold" letterSpacing="0.3">
            COLLEGE DE AMPARADORES
          </textPath>
        </text>

        {/* ==================== LAYER 4: SUPERNOVA BACK FLARE ==================== */}
        {/* Positioned at exact coordinates corresponding to upper-left limb of globe (center x=29, y=32) */}
        <g>
          {/* Shimmering cosmic blue outer radial sphere */}
          <motion.circle
            cx="29"
            cy="32"
            r="13"
            fill="url(#supernovaBlueCore)"
            filter="url(#superGlow)"
            animate={{
              scale: [0.88, 1.2, 0.88],
              opacity: [0.75, 0.95, 0.75]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Laser Light Rays rotating continuously on the Upper-Left star */}
          <motion.g
            style={{ transformOrigin: '29px 32px' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          >
            {/* Horizontal flare ray */}
            <path d="M 2,32 Q 29,31 56,32 Q 29,33 2,32 Z" fill="url(#flareRay)" />
            {/* Vertical flare ray */}
            <path d="M 29,5 Q 28,32 29,59 Q 30,32 29,5 Z" fill="url(#flareRay)" />
            {/* Diagonal 1 */}
            <path d="M 10,13 Q 29,32 48,51 Q 29,32 10,13 Z" fill="url(#flareRay)" opacity="0.75" />
            {/* Diagonal 2 */}
            <path d="M 48,13 Q 29,32 10,51 Q 29,32 48,13 Z" fill="url(#flareRay)" opacity="0.75" />
          </motion.g>

          {/* White-Hot Supernova Central Node */}
          <motion.circle
            cx="29"
            cy="32"
            r="3.2"
            fill="#ffffff"
            filter="url(#superGlow)"
            animate={{ scale: [0.9, 1.15, 0.9] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <circle cx="29" cy="32" r="1.5" fill="#ffffff" />
        </g>

        {/* ==================== LAYER 5: THE MAJESTIC CAPITAL 'A' ==================== */}
        <motion.path
          d="M 50,13 L 78,85 L 64,85 L 59,71 L 41,71 L 36,85 L 22,85 Z M 50,30 L 55.5,50 L 44.5,50 Z"
          fill="url(#letterAObsidian)"
          fillRule="evenodd"
          stroke="url(#silverTrim)"
          strokeWidth="1.2"
          strokeLinejoin="round"
          style={{ transformOrigin: '50px 49px' }}
          animate={{ scale: [1, 1.015, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Star flare at the bottom-left vertex of the 'A' (reflecting beautifully) */}
        <g>
          <motion.g
            style={{ transformOrigin: '33px 77px' }}
            animate={{ scale: [0.7, 1.3, 0.7], rotate: [0, 90, 180] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path d="M 33,67 L 33,87 M 23,77 L 43,77" stroke="#ffffff" strokeWidth="1.2" filter="url(#superGlow)" />
            <circle cx="33" cy="77" r="1.5" fill="#ffffff" />
          </motion.g>
        </g>

        {/* ==================== LAYER 6: PRIMARY HORIZONTAL CAPSULE ("MEU DIÁRIO") ==================== */}
        <g style={{ filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.7))" }}>
          {/* Base black outer boundary pill */}
          <rect 
            x="4" 
            y="40" 
            width="92" 
            height="18" 
            rx="9" 
            fill="#f8fafc" 
            stroke="#94a3b8" 
            strokeWidth="1.2" 
          />
          
          {/* Glossy upper gradient overlay inside capsule */}
          <rect 
            x="5.2" 
            y="41.2" 
            width="89.6" 
            height="7.5" 
            rx="4.5" 
            fill="url(#pillHighlight)" 
          />

          {/* Micro cybernetic side dot lamps */}
          <circle cx="7" cy="49" r="1" fill="#475569" opacity="0.8" />
          <circle cx="93" cy="49" r="1" fill="#3b82f6" opacity="0.8" />

          {/* Elegant Title text "MEU DIÁRIO" */}
          <text
            x="50"
            y="52.8"
            fill="#111827"
            fontSize="10"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="0.8"
            textAnchor="middle"
            style={{ userSelect: 'none', pointerEvents: 'none' }}
          >
            MEU DIÁRIO
          </text>
        </g>

        {/* ==================== LAYER 7: SECONDARY CAPSULE ("SPACE") ==================== */}
        <g style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>
          {/* Semi-transparent high-contrast small capsule */}
          <rect 
            x="58" 
            y="54" 
            width="24" 
            height="9.5" 
            rx="4.75" 
            fill="#111827" 
            fillOpacity="0.9" 
            stroke="#6b7280" 
            strokeWidth="0.8" 
          />
          
          {/* Tiny star gleam on the edge of the SPACE capsule */}
          <circle cx="58.5" cy="58.75" r="0.6" fill="#60a5fa" filter="url(#superGlow)" />
          <circle cx="81.5" cy="58.75" r="0.6" fill="#a7f3d0" />

          {/* "SPACE" clean text */}
          <text
            x="70"
            y="60.8"
            fill="#ffffff"
            fontSize="5.2"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="0.6"
            textAnchor="middle"
            style={{ userSelect: 'none', pointerEvents: 'none' }}
          >
            SPACE
          </text>
        </g>
      </motion.svg>
    </div>
  );
};

// 2. DASHBOARD (Dashboard da Vida - dashboard): Super Premium Analytical Telemetry & Chart Center
// Represents a highly sophisticated data analytics dashboard. Styled with micro-grids, a live-updating line-chart area,
// breathing multi-segment bar charts, a high-fidelity dynamic progress gauge, and elegant cybernetic telemetry pulses.
// Configured with distinct premium pastel colors for each dataset module (Lilac/Violet/Rose, Mint Green, Coral/Amber).
export const AnimatedDashboard: React.FC<IconProps> = ({ color }) => {
  return (
    <div className="relative w-10 h-10 flex items-center justify-center overflow-visible scale-[1.32]">
      {/* 1. Subtle Elegant Multi-Color Pastel Ambient Aura - Balanced & Contained */}
      <motion.div
        className="absolute w-6 h-6 rounded-full opacity-20 blur-sm pointer-events-none"
        style={{
          background: `radial-gradient(circle, #fbcfe8 0%, #cffafe 60%, transparent 100%)`
        }}
        animate={{
          scale: [0.85, 1.05, 0.85],
          opacity: [0.1, 0.22, 0.1]
        }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 2. Micro Dashboard Main Assembly */}
      <motion.svg
        viewBox="0 0 24 24"
        className="w-9 h-9 overflow-visible selection:bg-transparent"
        style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.45))' }}
      >
        <defs>
          {/* Pastel Lilac/Lavender Gradient for Upper Line Graph */}
          <linearGradient id="chartLineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#d8b4fe" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>

          <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
          </linearGradient>

          {/* Pastel Mint Green Gradient for Lower Left Bars */}
          <linearGradient id="barGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="50%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#a7f3d0" />
          </linearGradient>

          {/* Pastel Amber/Gold Gradient for Lower Right Gauge */}
          <linearGradient id="gaugeWarmGrad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="60%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>

          <filter id="premiumMetricGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* --- Grid Backplate Lines (Fine Analytical Metric Grid) --- */}
        <g stroke="#334155" strokeWidth="0.5" opacity="0.3" strokeDasharray="1.5 1.5">
          {/* Main dividing crosshairs */}
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="12" y1="3" x2="12" y2="21" />
          {/* Mini helper grids */}
          <line x1="3" y1="7.5" x2="21" y2="7.5" opacity="0.5" />
          <line x1="3" y1="16.5" x2="21" y2="16.5" opacity="0.5" />
          <line x1="7.5" y1="3" x2="7.5" y2="21" opacity="0.5" />
          <line x1="16.5" y1="3" x2="16.5" y2="21" opacity="0.5" />
        </g>

        {/* ==================== UPPER SECTOR: Live Line Area Graph (Pastel Lilac) ==================== */}
        {/* Transparent area gradient block */}
        <motion.path
          d="M 3,11 L 3,8.5 Q 6,4.5 9.5,7 T 16,5 Q 18.5,3.5 21,4 L 21,11 Z"
          fill="url(#chartAreaGrad)"
          animate={{ opacity: [0.7, 0.9, 0.7] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Live glossy trend line */}
        <motion.path
          d="M 3,8.5 Q 6,4.5 9.5,7 T 16,5 Q 18.5,3.5 21,4"
          fill="none"
          stroke="url(#chartLineGrad)"
          strokeWidth="1.2"
          strokeLinecap="round"
          animate={{ pathLength: [0.15, 1, 0.15] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Live tracking glowing telemetry point riding on the graph */}
        <motion.circle
          r="0.95"
          fill="#ffffff"
          filter="url(#premiumMetricGlow)"
          animate={{
            cx: [3, 6, 9.5, 12, 16, 18.5, 21],
            cy: [8.5, 5.8, 7, 5.5, 5, 3.8, 4],
            opacity: [0, 1, 1, 1, 1, 1, 0]
          }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Live data dots to highlight important milestone index values (Lilac contrast) */}
        <circle cx="9.5" cy="7" r="0.6" fill="#f5d0fe" />
        <circle cx="16" cy="5" r="0.6" fill="#d8b4fe" />

        {/* ==================== LOWER LEFT: Staggered Dynamic Bar Charts (Pastel Mint Green) ==================== */}
        {/* Analytical ground axis */}
        <line x1="3" y1="20" x2="11" y2="20" stroke="#475569" strokeWidth="0.75" />

        {/* Bar 1 (Left): Breathing, representing high-frequency data inflow */}
        <motion.rect
          x="4.2"
          width="1.6"
          rx="0.5"
          fill="url(#barGrad)"
          animate={{
            y: [19.5, 15, 19.5],
            height: [0.5, 5, 0.5]
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Bar 2 (Middle): Tall executive metric bar */}
        <motion.rect
          x="6.7"
          width="1.6"
          rx="0.5"
          fill="url(#barGrad)"
          animate={{
            y: [19.5, 13.5, 19.5],
            height: [0.5, 6.5, 0.5]
          }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />

        {/* Bar 3 (Right): Breathing metric representing secondary index tracking */}
        <motion.rect
          x="9.2"
          width="1.6"
          rx="0.5"
          fill="url(#barGrad)"
          animate={{
            y: [19.5, 16, 19.5],
            height: [0.5, 4, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        />

        {/* ==================== LOWER RIGHT: High-Fidelity Performance Gauge (Pastel Sunset Amber) ==================== */}
        {/* Base tracker ring */}
        <circle cx="17" cy="16.5" r="3.4" fill="none" stroke="#334155" strokeWidth="0.8" />

        {/* Vibrant arcing progress value indicator */}
        <motion.circle
          cx="17"
          cy="16.5"
          r="3.4"
          fill="none"
          stroke="url(#gaugeWarmGrad)"
          strokeWidth="1.15"
          strokeDasharray="21.3" // circumference is approx 21.36
          animate={{
            strokeDashoffset: [21.3, 5, 21.3],
            rotate: [0, 360]
          }}
          style={{ transformOrigin: '17px 16.5px' }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Ultra-precise HUD corner bracket overlays for professional chart aesthetic */}
        <path d="M 2.5,4.5 L 2.5,2.5 L 4.5,2.5" stroke="#475569" strokeWidth="0.55" fill="none" opacity="0.6" />
        <path d="M 21.5,4.5 L 21.5,2.5 L 19.5,2.5" stroke="#475569" strokeWidth="0.55" fill="none" opacity="0.6" />
        <path d="M 2.5,19.5 L 2.5,21.5 L 4.5,21.5" stroke="#475569" strokeWidth="0.55" fill="none" opacity="0.6" />
        <path d="M 21.5,19.5 L 21.5,21.5 L 19.5,21.5" stroke="#475569" strokeWidth="0.55" fill="none" opacity="0.6" />

        {/* Dynamic center indicator dot pulsing live telemetry */}
        <circle cx="17" cy="16.5" r="1" fill="#ffffff" />
        <motion.circle
          cx="17"
          cy="16.5"
          r="2.2"
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.4"
          animate={{ scale: [0.6, 1.4, 0.6], opacity: [0.8, 0.1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.svg>
    </div>
  );
};

// 3. AMPARADORA (Amparadora - clone of original Command Center): Super Premium AI Cognitive Synapse Core
// Featuring a highly detailed neural network with branching dendritic paths, traveling action-potential sparks,
// and a majestic, ultra-luminous central brain synapse bulb that pulses elegantly.
export const AnimatedAmparadora: React.FC<IconProps> = ({ color }) => {
  return (
    <div className="relative w-10 h-10 flex items-center justify-center overflow-visible scale-[1.25]">
      {/* 1. Cyber-Cognitive Healing Aura - Balanced & Contained */}
      <motion.div
        className="absolute w-6 h-6 rounded-full opacity-25 blur-sm pointer-events-none"
        style={{
          background: `radial-gradient(circle, #38bdf8 0%, ${color} 60%, transparent 100%)`
        }}
        animate={{
          scale: [0.85, 1.05, 0.85],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 2. Synaptic / AI Core Vector Assembly */}
      <motion.svg
        viewBox="0 0 24 24"
        className="w-8 h-8 overflow-visible selection:bg-transparent"
        style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.55))' }}
      >
        <defs>
          {/* Neon energy core radial gradient */}
          <radialGradient id="amparadoraSynapseCoreGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#38bdf8" />
            <stop offset="70%" stopColor={color} />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>

          {/* Core glow filter */}
          <filter id="synapticIntellectGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* --- Dendritic Neural Connections / Axon Branches (Synapses) --- */}
        {/* These form the main biological synapse architecture branching from the center */}
        <g stroke={color} strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.65">
          {/* Dendrite 1: North Branch */}
          <path d="M 12,12 L 12,5.5" />
          <path d="M 12,5.5 L 9.5,3.5" />
          <path d="M 12,5.5 L 14.5,3.5" />

          {/* Dendrite 2: South-East Branch */}
          <path d="M 12,12 L 17.5,15.5" />
          <path d="M 17.5,15.5 L 20.5,15.5" />
          <path d="M 17.5,15.5 L 18.5,18.5" />

          {/* Dendrite 3: South-West Branch */}
          <path d="M 12,12 L 6.5,15.5" />
          <path d="M 6.5,15.5 L 3.5,15.5" />
          <path d="M 6.5,15.5 L 5.5,18.5" />
        </g>

        {/* Glowing Neural Terminal Buttons / Nodes */}
        <g fill="#38bdf8" stroke="#0f172a" strokeWidth="0.5">
          {/* North term */}
          <circle cx="9.5" cy="3.5" r="1.1" />
          <circle cx="14.5" cy="3.5" r="1.1" />
          {/* South-East term */}
          <circle cx="20.5" cy="15.5" r="1.1" />
          <circle cx="18.5" cy="18.5" r="1.1" />
          {/* South-West term */}
          <circle cx="3.5" cy="15.5" r="1.1" />
          <circle cx="5.5" cy="18.5" r="1.1" />
        </g>

        {/* --- Animated Action Potentials (Energy Sparks travelling along synapses) --- */}
        {/* Spark 1: Moving down North Branch */}
        <motion.circle
          cx="12"
          r="1"
          fill="#ffffff"
          filter="url(#synapticIntellectGlow)"
          animate={{
            cy: [12, 5.5, 3.5],
            cx: [12, 12, 9.5],
            opacity: [0, 1, 1, 0]
          }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Spark 2: Moving down South-East Branch */}
        <motion.circle
          cx="12"
          cy="12"
          r="1"
          fill="#ffffff"
          filter="url(#synapticIntellectGlow)"
          animate={{
            cx: [12, 17.5, 18.5],
            cy: [12, 15.5, 18.5],
            opacity: [0, 1, 1, 0]
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
        />

        {/* Spark 3: Moving down South-West Branch */}
        <motion.circle
          cx="12"
          cy="12"
          r="1"
          fill="#ffffff"
          filter="url(#synapticIntellectGlow)"
          animate={{
            cx: [12, 6.5, 3.5],
            cy: [12, 15.5, 15.5],
            opacity: [0, 1, 1, 0]
          }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
        />

        {/* --- Concentric Gyroscopic Tech Orbits --- */}
        {/* Outer Circular Tech Orbit Ring (Clockwise) */}
        <motion.circle
          cx="12"
          cy="12"
          r="10.2"
          fill="none"
          stroke={color}
          strokeWidth="1.2"
          strokeDasharray="16 10 4 10"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '12px 12px' }}
        />

        {/* Inner Counter-Rotation Gyro Orbit Ring (Counter-Clockwise) */}
        <motion.circle
          cx="12"
          cy="12"
          r="7.5"
          fill="none"
          stroke="#475569"
          strokeWidth="0.8"
          strokeDasharray="8 6"
          opacity="0.8"
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '12px 12px' }}
        />

        {/* --- Central Glowing Brain Synapse Soma (The Intelligent Heart of Amparadora) --- */}
        {/* Micro-scale biological-tech core with glowing neurotransmitter halo */}
        <g style={{ transformOrigin: '12px 12px' }}>
          {/* Pulsating bio-luminescent outer bubble */}
          <motion.circle
            cx="12"
            cy="12"
            r="4.2"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="0.8"
            filter="url(#synapticIntellectGlow)"
            animate={{
              scale: [0.85, 1.25, 0.85],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Central Core Brain Synapse Core Sphere */}
          <motion.circle
            cx="12"
            cy="12"
            r="3"
            fill="url(#amparadoraSynapseCoreGrad)"
            stroke="#0b1329"
            strokeWidth="0.6"
            animate={{
              scale: [0.95, 1.12, 0.95],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Inside Synapse Junction Cross Spark Detail */}
          <path
            d="M 12,10.5 L 12,13.5 M 10.5,12 L 13.5,12"
            stroke="#ffffff"
            strokeWidth="0.6"
            strokeLinecap="round"
            opacity="0.85"
          />
        </g>
      </motion.svg>
    </div>
  );
};
// 4. FINANCES (Finanças - payments): Super Premium Cybernetic Financial Core
// Extremely high-fidelity, larger, featuring floating ledger documents, rotating orbits, green/gold cyber dial
// and a secure central glowing shield inscribed with a gold "R$" sign for instant subconscious recognition.
export const AnimatedFinancials: React.FC<IconProps> = ({ color }) => {
  return (
    <div className="relative w-10 h-10 flex items-center justify-center overflow-visible scale-[1.25]">
      {/* 1. Ethereal ambient background neon aura - Premium Luxury Blue & Emerald Core */}
      <motion.div
        className="absolute w-6 h-6 rounded-full opacity-25 blur-sm pointer-events-none"
        style={{
          background: `radial-gradient(circle, #34d399 0%, #0ea5e9 60%, transparent 100%)`
        }}
        animate={{
          scale: [0.85, 1.05, 0.85],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 2. Primary Cyber Dial Console SVG */}
      <motion.svg
        viewBox="0 0 24 24"
        className="w-8 h-8 overflow-visible selection:bg-transparent"
        style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.65))' }}
      >
        <defs>
          {/* Premium Metallic Royal Navy-Dark Slate Gradient */}
          <radialGradient id="financialInnerGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="60%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>

          {/* Premium Platinum / Silver Metallic Gradient */}
          <linearGradient id="platinumLuxuryGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#e2e8f0" />
            <stop offset="70%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* Premium Emerald/Fintech Green Metallic Gradient */}
          <linearGradient id="emeraldTechGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="40%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          {/* Dark metallic rim gradient */}
          <linearGradient id="darkConsoleRim" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="50%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Premium Emerald glow filter */}
          <filter id="emeraldLuxuryGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.0" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* --- Track for Square Motion with rotating dashes (straight lines flying in a square) --- */}
        {/* Dash 1: Platinado dash rotating clockwise */}
        <motion.rect
          x="1.5"
          y="1.5"
          width="21"
          height="21"
          rx="5"
          fill="none"
          stroke="url(#platinumLuxuryGrad)"
          strokeWidth="1.0"
          strokeDasharray="6 26"
          animate={{
            strokeDashoffset: [0, 32]
          }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
          opacity="0.85"
        />

        {/* Dash 2: Emerald Green dash rotating counter-clockwise */}
        <motion.rect
          x="1.5"
          y="1.5"
          width="21"
          height="21"
          rx="5"
          fill="none"
          stroke="url(#emeraldTechGrad)"
          strokeWidth="1.0"
          strokeDasharray="8 24"
          style={{ rotate: 180, transformOrigin: '12px 12px' }}
          animate={{
            strokeDashoffset: [0, -32]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          opacity="0.9"
        />

        {/* --- Multi-layered Concentric Metallic Console (Square card with rounded edges) --- */}
        {/* Outer Dark Steel Bezel (Enlarged squared button with rounded corners representing a high-end credit card / bank token) */}
        <rect
          x="2.5"
          y="2.5"
          width="19"
          height="19"
          rx="4.5"
          ry="4.5"
          fill="url(#darkConsoleRim)"
          stroke="url(#platinumLuxuryGrad)"
          strokeWidth="0.8"
        />

        {/* Glowing Emerald Green Border Ring inside the Bezel (Enlarged) */}
        <motion.rect
          x="4.2"
          y="4.2"
          width="15.6"
          height="15.6"
          rx="3.5"
          ry="3.5"
          fill="none"
          stroke="#10b981"
          strokeWidth="0.8"
          filter="url(#emeraldLuxuryGlow)"
          animate={{
            opacity: [0.5, 0.9, 0.5]
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Core Glowing Squared Display with Rounded Corners (Theme Deep Obsidian Blue-Slate) */}
        <rect
          x="5.2"
          y="5.2"
          width="13.6"
          height="13.6"
          rx="2.8"
          ry="2.8"
          fill="url(#financialInnerGrad)"
          stroke="#334155"
          strokeWidth="0.6"
        />

        {/* Secure Chip Grid / Technology lines (represents credit cards, stocks, digital transactions in platinum) */}
        <path
          d="M 6.5,8 H 9.5 M 6.5,12 H 8.5 M 14.5,12 H 17.5 M 14.5,16 H 17.5"
          stroke="url(#platinumLuxuryGrad)"
          strokeWidth="0.45"
          strokeLinecap="round"
          opacity="0.35"
        />
        <path
          d="M 8.5,5.2 V 7.5 M 15.5,5.2 V 7.5 M 12,18.8 V 17"
          stroke="url(#platinumLuxuryGrad)"
          strokeWidth="0.45"
          strokeLinecap="round"
          opacity="0.35"
        />

        {/* Corner Platinado Accents highlighting luxury design finish */}
        <path d="M 5.8 8.5 L 5.8 5.8 L 8.5 5.8" fill="none" stroke="url(#platinumLuxuryGrad)" strokeWidth="0.4" />
        <path d="M 18.2 8.5 L 18.2 5.8 L 15.5 5.8" fill="none" stroke="url(#platinumLuxuryGrad)" strokeWidth="0.4" />
        <path d="M 5.8 15.5 L 5.8 18.2 L 8.5 18.2" fill="none" stroke="url(#platinumLuxuryGrad)" strokeWidth="0.4" />
        <path d="M 18.2 15.5 L 18.2 18.2 L 15.5 18.2" fill="none" stroke="url(#platinumLuxuryGrad)" strokeWidth="0.4" />

        {/* --- Super-Expressive Subconscious Visual: Secure Platinum & Emerald Currency Symbol (R$) --- */}
        {/* Placed centered and enlarged with shadow depth overlay */}
        <motion.g
          animate={{
            scale: [0.97, 1.03, 0.97],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '12px 12px' }}
        >
          {/* Drop shadow outline behind text to create severe legibility and premium 3D lift */}
          <text
            x="12.5"
            y="12.6"
            fill="#000000"
            opacity="0.95"
            fontSize="7.8"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
            textAnchor="middle"
            dominantBaseline="central"
            letterSpacing="-0.3px"
            style={{ filter: 'blur(0.5px)' }}
          >
            R$
          </text>
          
          <text
            x="12"
            y="12"
            fill="url(#platinumLuxuryGrad)"
            fontSize="7.8"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
            textAnchor="middle"
            dominantBaseline="central"
            letterSpacing="-0.3px"
            style={{ filter: 'drop-shadow(0 1px 2px rgba(16, 185, 129, 0.45))' }}
          >
            R$
          </text>
        </motion.g>
      </motion.svg>
    </div>
  );
};

// 5. MURAL (Mural de Sucesso - military_tech): Super Premium 3D Diamond of Wealth
// Representing assets, value and triumph. Featuring multi-faceted refraction paths, 
// a diagonal animated glare sweep, and ambient floating diamond glint stars on the sides.
export const AnimatedMural: React.FC<IconProps> = ({ color }) => {
  return (
    <div className="relative w-10 h-10 flex items-center justify-center overflow-visible scale-[1.25]">
      {/* 1. Ethereal ambient background diamond aura - Balanced & Contained */}
      <motion.div
        className="absolute w-6 h-6 rounded-full opacity-25 blur-sm pointer-events-none"
        style={{
          background: `radial-gradient(circle, #38bdf8 0%, #a855f7 60%, transparent 100%)`
        }}
        animate={{
          scale: [0.85, 1.05, 0.85],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 2. Floating Diamond Glint Stars on the Sides (Representing luxury, wealth & triumph) */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`diamond-sparkle-${i}`}
          className="absolute pointer-events-none"
          style={{
            width: i % 2 === 0 ? '5px' : '3px',
            height: i % 2 === 0 ? '5px' : '3px',
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.2, 1.2, 0.2],
            x: i === 0 ? -14 : i === 1 ? 14 : i === 2 ? -8 : 8,
            y: i === 0 ? -6 : i === 1 ? 8 : i === 2 ? 12 : -12,
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            delay: i * 0.55,
            ease: "easeInOut"
          }}
        >
          {/* Glinting/sparkling four-point star vector */}
          <svg viewBox="0 0 10 10" className="w-full h-full text-cyan-200 fill-current drop-shadow-[0_0_2px_#38bdf8]">
            <path d="M5,0 L6,4 L10,5 L6,6 L5,10 L4,6 L0,5 L4,4 Z" />
          </svg>
        </motion.div>
      ))}

      {/* 3. Primary 3D Crystalline Diamond Assembly */}
      <motion.svg
        viewBox="0 0 24 24"
        className="w-8 h-8 overflow-visible selection:bg-transparent"
        style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.55))' }}
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <defs>
          {/* Brilliant glass gradients for maximum realism and 3D facet refraction */}
          <linearGradient id="diamGradBaseBlue" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="50%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          <linearGradient id="diamGradPureWhite" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>

          <linearGradient id="diamGradRoseEmerald" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>

          <linearGradient id="diamGradRichGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="#713f12" />
          </linearGradient>

          {/* Glare mask layout */}
          <clipPath id="diamondOuterClip">
            <polygon points="6,4 18,4 23,10 12,22 1,10" />
          </clipPath>

          <filter id="ultraDiamondGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.0" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* --- Backplate Ambient Diamond Halo --- */}
        <polygon
          points="6,4 18,4 23,10 12,22 1,10"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1.8"
          opacity="0.3"
          filter="url(#ultraDiamondGlow)"
        />

        {/* --- Facet Polygons (Prismatic 3D Configuration) --- */}
        {/* Upper Left Crown Star */}
        <polygon
          points="6,4 1,10 6.5,10"
          fill="url(#diamGradBaseBlue)"
          stroke="#0f172a"
          strokeWidth="0.3"
          strokeLinejoin="round"
        />

        {/* Upper Left-Center Bezel Table */}
        <polygon
          points="6,4 12,4 12,10 6.5,10"
          fill="url(#diamGradPureWhite)"
          stroke="#0f172a"
          strokeWidth="0.3"
          strokeLinejoin="round"
        />

        {/* Upper Right-Center Bezel Table */}
        <polygon
          points="12,4 18,4 17.5,10 12,10"
          fill="url(#diamGradRoseEmerald)"
          opacity="0.9"
          stroke="#0f172a"
          strokeWidth="0.3"
          strokeLinejoin="round"
        />

        {/* Upper Right Crown Star */}
        <polygon
          points="18,4 17.5,10 23,10"
          fill="url(#diamGradBaseBlue)"
          stroke="#0f172a"
          strokeWidth="0.3"
          strokeLinejoin="round"
        />

        {/* Lower Left Pavilion */}
        <polygon
          points="1,10 6.5,10 12,22"
          fill="url(#diamGradBaseBlue)"
          stroke="#0f172a"
          strokeWidth="0.3"
          strokeLinejoin="round"
        />

        {/* Lower Left-Center Pavilion (Includes Rich Gold highlights representing wealth & core values) */}
        <polygon
          points="6.5,10 12,10 12,22"
          fill="url(#diamGradRichGold)"
          opacity="0.92"
          stroke="#0f172a"
          strokeWidth="0.3"
          strokeLinejoin="round"
        />

        {/* Lower Right-Center Pavilion */}
        <polygon
          points="12,10 17.5,10 12,22"
          fill="url(#diamGradBaseBlue)"
          stroke="#0f172a"
          strokeWidth="0.3"
          strokeLinejoin="round"
        />

        {/* Lower Right Pavilion */}
        <polygon
          points="17.5,10 23,10 12,22"
          fill="url(#diamGradPureWhite)"
          stroke="#0f172a"
          strokeWidth="0.3"
          strokeLinejoin="round"
        />

        {/* --- Animated Diagonal Optical Glare Sweep --- */}
        <g clipPath="url(#diamondOuterClip)">
          <motion.line
            x1="-10" y1="0" x2="-2" y2="24"
            stroke="#ffffff"
            strokeWidth="3.2"
            opacity="0.75"
            style={{ filter: 'drop-shadow(0 0 4px #ffffff)' }}
            animate={{ x: [-15, 35] }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: 'easeInOut',
              repeatDelay: 1.2
            }}
          />
        </g>

        {/* --- High Contrast Overlay Facet Edges --- */}
        {/* We place delicate, bright, semi-transparent white lines on top of facet boundaries to trigger subconscious realism */}
        <polyline
          points="6,4 12,4 18,4"
          stroke="#ffffff"
          strokeWidth="0.5"
          fill="none"
          opacity="0.75"
        />
        <line
          x1="12" y1="4" x2="12" y2="10"
          stroke="#ffffff"
          strokeWidth="0.4"
          opacity="0.6"
        />
        <line
          x1="12" y1="10" x2="12" y2="22"
          stroke="#ffffff"
          strokeWidth="0.4"
          opacity="0.65"
        />
        <polyline
          points="1,10 6.5,10 12,10 17.5,10 23,10"
          stroke="#ffffff"
          strokeWidth="0.45"
          fill="none"
          opacity="0.5"
        />
      </motion.svg>
    </div>
  );
};

// 6. MANAGER (Gerenciador - folder_open): Super Premium Cybernetic Directory Hub
// Extremely high-fidelity, larger, featuring floating holographic document pages, 
// nested workspace orbits, neon orange directory outlines, and a central folder-core that breathes elegantly.
export const AnimatedManager: React.FC<IconProps> = ({ color }) => {
  return (
    <div className="relative w-10 h-10 flex items-center justify-center overflow-visible scale-[1.25]">
      {/* 1. Cyber-Directory Ambient Neon Aura - Balanced & Contained */}
      <motion.div
        className="absolute w-6 h-6 rounded-full opacity-25 blur-sm pointer-events-none"
        style={{
          background: `radial-gradient(circle, #f97316 0%, #ca8a04 60%, transparent 100%)`
        }}
        animate={{
          scale: [0.85, 1.05, 0.85],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 2. Floating Holographic Workspace Tabs / Sheets in the background */}
      <div className="absolute inset-0 pointer-events-none overflow-visible">
        {/* Workspace Tab 1: Floating top-left */}
        <motion.div
          className="absolute"
          style={{ left: '-6px', top: '0px', width: '13px', height: '13px' }}
          animate={{
            y: [0, -3, 0],
            rotate: [-12, -6, -12],
          }}
          transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg viewBox="0 0 12 12" className="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            <rect x="0" y="0" width="12" height="12" rx="2" fill="#1e293b" stroke="#f97316" strokeWidth="0.5" strokeDasharray="1 1" />
            <circle cx="3" cy="3" r="1" fill="#f97316" />
            <line x1="5" y1="3" x2="10" y2="3" stroke="#94a3b8" strokeWidth="0.5" opacity="0.6" />
            <line x1="3" y1="6" x2="9" y2="6" stroke="#94a3b8" strokeWidth="0.5" opacity="0.4" />
          </svg>
        </motion.div>

        {/* Workspace Tab 2: Floating bottom-right */}
        <motion.div
          className="absolute"
          style={{ right: '-6px', bottom: '2px', width: '12px', height: '12px' }}
          animate={{
            y: [-1, 2, -1],
            rotate: [15, 5, 15],
          }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg viewBox="0 0 12 12" className="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            <rect x="0" y="0" width="12" height="12" rx="2" fill="#0f172a" stroke="#ca8a04" strokeWidth="0.5" />
            <circle cx="9" cy="9" r="1.1" fill="#eab308" />
            <line x1="2" y1="4" x2="10" y2="4" stroke="#94a3b8" strokeWidth="0.5" opacity="0.5" />
            <line x1="2" y1="7" x2="7" y2="7" stroke="#94a3b8" strokeWidth="0.5" opacity="0.5" />
          </svg>
        </motion.div>
      </div>

      {/* 3. Primary Cybernetic Manager Folder SVG */}
      <motion.svg
        viewBox="0 0 24 24"
        className="w-8 h-8 overflow-visible selection:bg-transparent"
        style={{ filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.6))' }}
        animate={{ y: [0, -1.5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <defs>
          {/* Neon orange folder gradient */}
          <linearGradient id="cyberFolderGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff7e33" />
            <stop offset="50%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          {/* Deep dark carbon backing */}
          <linearGradient id="carbonBacking" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2c3035" />
            <stop offset="100%" stopColor="#0a0c0e" />
          </linearGradient>

          {/* Glowing node filter */}
          <filter id="neonApricotGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.0" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* --- Directory Connection Tree Lines (Subconscious organization representation) --- */}
        <g stroke="#f97316" strokeWidth="0.65" strokeLinecap="round" fill="none" opacity="0.7">
          {/* Main vertical tree index link */}
          <path d="M 4,4 L 4,14" />
          <path d="M 4,7 L 9,7" />
          <path d="M 4,12 L 8,12" />
        </g>

        {/* Tiny Connection Hub Nodes */}
        <circle cx="4" cy="4" r="1" fill="#ff7e33" />
        <circle cx="9" cy="7" r="1.1" fill="#ca8a04" />
        <circle cx="8" cy="12" r="1" fill="#ff7e33" />

        {/* --- Main 3D High-Tech Open Folder Console --- */}
        {/* Back Frame Lid */}
        <path
          d="M 3,6 A 1.5 1.5 0 0 1 4.5 4.5 H 9.5 L 12 7.5 H 20.5 A 1.5 1.5 0 0 1 22 9 V 19 C 22 19.8 21.3 20.5 20.5 20.5 H 4.5 C 3.7 20.5 3 19.8 3 19 Z"
          fill="url(#carbonBacking)"
          stroke="#4b5563"
          strokeWidth="0.6"
        />

        {/* Sticking Out Document Pages (representing structural files/workspaces) */}
        {/* Page A (Deeply inside) */}
        <motion.path
          d="M 6.5,8 H 17.5 V 15 H 6.5 Z"
          fill="#cbd5e1"
          opacity="0.85"
          animate={{ y: [0, -2.5, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Page B (Higher layer, brighter, with mini-document lines) */}
        <motion.path
          d="M 8.5,6 H 19.5 V 14 H 8.5 Z"
          fill="#f8fafc"
          style={{ filter: 'drop-shadow(0 -1px 2px rgba(0,0,0,0.15))' }}
          animate={{ y: [0, -3.8, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
        >
          {/* We'll use miniature overlay lines for detail */}
        </motion.path>

        {/* Floating Mini Document Text Lines Overlay (Animated to go up together) */}
        <g stroke="#94a3b8" strokeWidth="0.6" strokeLinecap="round" opacity="0.6">
          <motion.line
            x1="10.5" y1="8" x2="17.5" y2="8"
            animate={{ y: [0, -3.8, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
          />
          <motion.line
            x1="10.5" y1="10.5" x2="15.5" y2="10.5"
            animate={{ y: [0, -3.8, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
          />
        </g>

        {/* Folder Front Cover Flap - Stylized with isometric/Cyber look and glowing lines */}
        <motion.path
          d="M 3,9 C 3,9 4.2,9 4.2,9 H 20.5 C 20.5,9 22,9 22,9 V 19.5 C 22,20.2 21.3,20.8 20.5,20.8 H 4.5 C 3.7 20.8 3 20.2 3 19.5 Z"
          fill="url(#cyberFolderGrad)"
          stroke="url(#cyberFolderGrad)"
          strokeWidth="0.3"
          style={{ filter: 'drop-shadow(0 -2px 6px rgba(0,0,0,0.5))' }}
          animate={{
            skewY: [0, -1.5, 0],
          }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Neon Orange Glowing Circuit Line running horizontally across the front panel */}
        <motion.path
          d="M 3.2,12.5 L 9.5,12.5 L 11,14 L 21.8,14"
          fill="none"
          stroke="#f97316"
          strokeWidth="0.85"
          filter="url(#neonApricotGlow)"
          animate={{
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* --- Golden Center Core Directory Key/Symbol --- */}
        {/* This concentric mechanical/cyber hub inside the folder adds outstanding depth */}
        <g style={{ transformOrigin: '12.5px 16px' }}>
          {/* Inner small spinning tech disk */}
          <motion.circle
            cx="12.5"
            cy="16"
            r="2"
            fill="#0f172a"
            stroke="#f59e0b"
            strokeWidth="0.65"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          {/* Center core dot */}
          <circle cx="12.5" cy="16" r="0.8" fill="#ffffff" />
        </g>
      </motion.svg>
    </div>
  );
};

// 7. EDITOR (Editor - edit_note): Super Premium Holographic Notepad & Scanning Stylus Pen
// An interactive, multi-layered electronic document slate featuring glowing binder rings,
// technical neon text lines, and a floating cyberpunk pen that hovers with magnetic dynamic light sparks.
export const AnimatedEditor: React.FC<IconProps> = ({ color }) => {
  return (
    <div className="relative w-10 h-10 flex items-center justify-center overflow-visible scale-[1.2]">
      {/* 1. Notepad Glow Halo - Balanced & Contained */}
      <motion.div
        className="absolute w-6 h-6 rounded-full opacity-20 blur-sm pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${color} 0%, transparent 100%)`
        }}
        animate={{
          scale: [0.85, 1.05, 0.85],
          opacity: [0.12, 0.22, 0.12]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.svg
        viewBox="0 0 24 24"
        className="w-8 h-8 overflow-visible selection:bg-transparent"
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }}
      >
        <defs>
          <linearGradient id="editorPadGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#09090b" />
          </linearGradient>
          <linearGradient id="penBodyGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <filter id="editorNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* The Notepad Plate (Isometric Slate) */}
        <motion.path
          d="M 4,4 C 4,2.9 4.9,2 6,2 H 18 C 19.1,2 20,2.9 20,4 V 20 C 20,21.1 19.1,22 18,22 H 6 C 4.9,22 4,21.1 4,20 Z"
          fill="url(#editorPadGrad)"
          stroke="#475569"
          strokeWidth="0.8"
          animate={{ rotate: [0, 0.5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Binder Ring Holes on the Left Margin */}
        <g fill="#09090b" stroke="#334155" strokeWidth="0.3">
          <circle cx="6.5" cy="5" r="0.6" />
          <circle cx="6.5" cy="9" r="0.6" />
          <circle cx="6.5" cy="13" r="0.6" />
          <circle cx="6.5" cy="17" r="0.6" />
        </g>

        {/* Binder Rings */}
        <g fill="none" stroke="#94a3b8" strokeWidth="0.45" strokeLinecap="round">
          <path d="M 5,4.2 C 5.5,4.2 6.2,4.6 6.5,5" />
          <path d="M 5,8.2 C 5.5,8.2 6.2,8.6 6.5,9" />
          <path d="M 5,12.2 C 5.5,12.2 6.2,12.6 6.5,13" />
          <path d="M 5,16.2 C 5.5,16.2 6.2,16.6 6.5,17" />
        </g>

        {/* Clipboard Top Metallic Clamp */}
        <path d="M 9,1 L 15,1 L 14,3.2 L 10,3.2 Z" fill="#334155" stroke="#64748b" strokeWidth="0.4" strokeLinejoin="round" />
        <circle cx="12" cy="2.1" r="0.45" fill="#f8fafc" />

        {/* Written Document Text Lines (with neon colors) */}
        {/* Title line */}
        <line x1="9" y1="5.5" x2="16" y2="5.5" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.9" />
        {/* Body Lines with progressive animated writing highlights */}
        <line x1="9" y1="8.5" x2="17.5" y2="8.5" stroke="#cbd5e1" strokeWidth="0.65" strokeLinecap="round" opacity="0.8" />
        <line x1="9" y1="11" x2="16.5" y2="11" stroke="#cbd5e1" strokeWidth="0.65" strokeLinecap="round" opacity="0.8" />
        <line x1="9" y1="13.5" x2="18" y2="13.5" stroke="#cbd5e1" strokeWidth="0.65" strokeLinecap="round" opacity="0.8" />
        
        {/* Active Line (being written) */}
        <motion.line
          x1="9" y1="16" x2="14" y2="16"
          stroke={color}
          strokeWidth="0.8"
          strokeLinecap="round"
          filter="url(#editorNeonGlow)"
          animate={{ x1: [9, 13, 9], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Hovering Cybernetic Stylus/Pen Writer */}
        <motion.g
          style={{ transformOrigin: '15.5px 16.5px' }}
          animate={{
            x: [0, -1.8, 0],
            y: [0, -1.2, 0],
            rotate: [18, 22, 18],
          }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Pen Shaft body */}
          <path d="M 14.5,11.5 L 19,-1 L 20,0 L 15.5,12.5 Z" fill="url(#penBodyGrad)" stroke="#475569" strokeWidth="0.3" strokeLinejoin="round" />
          
          {/* Pen Tip collar in accent color */}
          <path d="M 14.5,11.5 L 15.5,12.5 L 14.2,14.5 L 13.5,13 Z" fill={color} />
          
          {/* Solder Core Pen tip/nib */}
          <polygon points="13.5,13 14.2,14.5 13,15.5" fill="#f8fafc" />

          {/* Micro laser energy source */}
          <circle cx="15" cy="12" r="0.4" fill="#ffffff" filter="url(#editorNeonGlow)" />
        </motion.g>

        {/* Spark/Energy particle arising from local pen focus */}
        <motion.circle
          cx="13"
          cy="15.5"
          r="0.55"
          fill="#ffffff"
          filter="url(#editorNeonGlow)"
          animate={{
            scale: [0.3, 1.25, 0.3],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
        />
        <motion.circle
          cx="11.5"
          cy="16.5"
          r="0.4"
          fill={color}
          animate={{
            y: [0, 1.5],
            opacity: [1, 0],
          }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </motion.svg>
    </div>
  );
};

// 8. CENTRAL DE COMANDO (Command Center - settings_suggest): Ultra-Realistic High-Complexity AI Hardware Processor PCB
// Represents the master mechanical/electronic system engine. Features high-fidelity textured composite PCB substrate,
// an intricate labyrinth of micro-circuit traces in fractal wiring, gold-plated structural contact pins, 
// multi-layer microchip architecture with deep metallic shadows, and a hyper-realist pulsing AI central logic core 
// with dynamic data-packet stream energy.
export const AnimatedCommandCenter: React.FC<IconProps> = ({ color }) => {
  return (
    <div className="relative w-10 h-10 flex items-center justify-center overflow-visible scale-[0.96]">
      {/* 1. Ethereal background light-slate aura for presence */}
      <motion.div
        className="absolute w-6 h-6 rounded-full opacity-15 blur-sm pointer-events-none"
        style={{
          background: `radial-gradient(circle, #94a3b8 0%, transparent 100%)`
        }}
        animate={{
          scale: [0.9, 1.1, 0.9],
          opacity: [0.08, 0.18, 0.08]
        }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.svg
        viewBox="0 0 24 24"
        className="w-10 h-10 overflow-visible"
        style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.35))' }}
      >
        <defs>
          {/* Subtle Platinum Metallic Gradient */}
          <linearGradient id="cmdPlatinumGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
          {/* Faint Emerald Gradient */}
          <linearGradient id="cmdGreenGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          {/* Light Gray/Platinum Status Badge Background */}
          <linearGradient id="badgeBgGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="45%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
        </defs>

        {/* --- Background Precision Dial Ticks (Aesthetic, low contrast) --- */}
        <circle cx="12" cy="12" r="9.5" fill="none" stroke="#334155" strokeWidth="0.5" strokeDasharray="1.2 3" opacity="0.5" />
        
        {/* Understated Crosshair Anchors */}
        <line x1="12" y1="1.5" x2="12" y2="3" stroke="#475569" strokeWidth="0.5" opacity="0.4" />
        <line x1="12" y1="21" x2="12" y2="22.5" stroke="#475569" strokeWidth="0.5" opacity="0.4" />
        <line x1="1.5" y1="12" x2="3" y2="12" stroke="#475569" strokeWidth="0.5" opacity="0.4" />
        <line x1="21" y1="12" x2="22.5" y2="12" stroke="#475569" strokeWidth="0.4" opacity="0.4" />

        {/* --- Central Precision Settings Cog (Rotating dynamically) --- */}
        <motion.g
          style={{ transformOrigin: '11px 11px' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        >
          {/* Main Gear Outer ring */}
          <circle cx="11" cy="11" r="5.2" fill="none" stroke="url(#cmdPlatinumGrad)" strokeWidth="0.9" />
          
          {/* Gear teeth/studs drawn with sharp precision */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <rect
              key={angle}
              x="10.1"
              y="4.2"
              width="1.8"
              height="2.3"
              rx="0.4"
              fill="url(#cmdPlatinumGrad)"
              stroke="#475569"
              strokeWidth="0.3"
              transform={`rotate(${angle} 11 11)`}
            />
          ))}

          {/* Inner core support ring */}
          <circle cx="11" cy="11" r="2.2" fill="#0f172a" stroke="#64748b" strokeWidth="0.4" />
        </motion.g>

        {/* Companion Small Gear mating perfectly at top-right (Rotating in opposite direction) */}
        <motion.g
          style={{ transformOrigin: '18.5px 7.5px' }}
          animate={{ rotate: -360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        >
          {/* Secondary Gear Outer Ring */}
          <circle cx="18.5" cy="7.5" r="3.2" fill="none" stroke="url(#cmdPlatinumGrad)" strokeWidth="0.75" />

          {/* Secondary teeth */}
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <rect
              key={angle}
              x="17.9"
              y="3.2"
              width="1.2"
              height="1.8"
              rx="0.3"
              fill="url(#cmdPlatinumGrad)"
              stroke="#475569"
              strokeWidth="0.25"
              transform={`rotate(${angle} 18.5 7.5)`}
            />
          ))}

          {/* Secondary Core */}
          <circle cx="18.5" cy="7.5" r="1.2" fill="#0f172a" stroke="#64748b" strokeWidth="0.3" />
        </motion.g>

        {/* --- Rounded Square Status Confirmation Badge (Lower Right) --- */}
        {/* Placed beautifully as a platinum-gray micro-card with a crisp glowing green checkmark */}
        <g>
          {/* Main clean square token (not round!) with rounded corner radius */}
          <rect
            x="13.2"
            y="13.2"
            width="8.6"
            height="8.6"
            rx="2.2"
            fill="url(#badgeBgGrad)"
            stroke="#475569"
            strokeWidth="0.7"
            style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}
          />
          
          {/* Inner accent track for visual organization */}
          <rect
            x="14.2"
            y="14.2"
            width="6.6"
            height="6.6"
            rx="1.5"
            fill="none"
            stroke="#1e293b"
            strokeWidth="0.4"
            opacity="0.2"
          />

          {/* Super crisp premium indicator checkmark representing success status */}
          <motion.path
            d="M 15.2,17.2 L 17.0,19.0 L 19.8,15.4"
            fill="none"
            stroke="url(#cmdGreenGrad)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))' }}
            initial={{ pathLength: 0.2 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8 }}
          />
        </g>
      </motion.svg>
    </div>
  );
};

// 9. PRESENCES (Presenças - animation): Super Premium Pearl White Constellation Hub
// Representing pure human synergy, collaboration and energy sharing. Styled in pristine glowing pearl white
// and glossy silver, featuring 4 spaced-out human avatar nodes connected around a clear outer perimeter, 
// passing luminous sparks to one another, with the center kept completely open and clean.
export const AnimatedPresencesIcon: React.FC<IconProps> = ({ color }) => {
  return (
    <div className="relative w-10 h-10 flex items-center justify-center overflow-visible scale-[1.2]">
      {/* 1. Pristine Pearlescent Ambient Aura - Balanced & Contained */}
      <motion.div
        className="absolute w-6 h-6 rounded-full opacity-25 blur-sm pointer-events-none"
        style={{
          background: `radial-gradient(circle, #ffffff 0%, #cbd5e1 60%, transparent 100%)`
        }}
        animate={{
          scale: [0.85, 1.05, 0.85],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 2. Decentralized Peer-to-Peer Pearl Network */}
      <motion.svg
        viewBox="0 0 24 24"
        className="w-8 h-8 overflow-visible selection:bg-transparent"
        style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.48))' }}
      >
        <defs>
          {/* Pristine high-fidelity pearl gloss gradients */}
          <linearGradient id="pearlCoreGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          <linearGradient id="silverGlossGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>

          <filter id="pearlShineSubconscious" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* --- High-Tech Corner HUD Brackets to frame the Network --- */}
        <g stroke="url(#silverGlossGrad)" strokeWidth="0.65" fill="none" opacity="0.45">
          <path d="M 2,5 L 2,2 L 5,2" />
          <path d="M 22,5 L 22,2 L 19,2" />
          <path d="M 2,19 L 2,22 L 5,22" />
          <path d="M 22,19 L 22,22 L 19,22" />
        </g>

        {/* --- Double Concentric Celestial Orbit Tracks behind the nodes (Center is hollow) --- */}
        <circle cx="12" cy="12" r="8.5" stroke="url(#silverGlossGrad)" strokeWidth="0.4" strokeDasharray="1.5 2" fill="none" opacity="0.45" />
        <circle cx="12" cy="12" r="10.2" stroke="url(#silverGlossGrad)" strokeWidth="0.3" strokeDasharray="4 4" fill="none" opacity="0.3" />

        {/* --- Outer Ring Connection Path (Perimeter cycle of energetic flow) --- */}
        <g stroke="url(#silverGlossGrad)" strokeWidth="0.85" fill="none" opacity="0.7">
          {/* Direct polygonal perimeter lines connecting nodes to one another */}
          <line x1="12" y1="2.5" x2="21.5" y2="12" />
          <line x1="21.5" y1="12" x2="12" y2="21.5" />
          <line x1="12" y1="21.5" x2="2.5" y2="12" />
          <line x1="2.5" y1="12" x2="12" y2="2.5" />
        </g>

        {/* --- Luminous White-Pearl Action Sparks passing energy along the perimeter lines --- */}
        {/* Spark 1: Top Node -> Right Node */}
        <motion.circle
          r="0.95"
          fill="#ffffff"
          filter="url(#pearlShineSubconscious)"
          animate={{
            cx: [12, 21.5],
            cy: [2.5, 12],
            opacity: [0, 1, 1, 0]
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Spark 2: Right Node -> Bottom Node */}
        <motion.circle
          r="0.95"
          fill="#ffffff"
          filter="url(#pearlShineSubconscious)"
          animate={{
            cx: [21.5, 12],
            cy: [12, 21.5],
            opacity: [0, 1, 1, 0]
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.45 }}
        />

        {/* Spark 3: Bottom Node -> Left Node */}
        <motion.circle
          r="0.95"
          fill="#ffffff"
          filter="url(#pearlShineSubconscious)"
          animate={{
            cx: [12, 2.5],
            cy: [21.5, 12],
            opacity: [0, 1, 1, 0]
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
        />

        {/* Spark 4: Left Node -> Top Node */}
        <motion.circle
          r="0.95"
          fill="#ffffff"
          filter="url(#pearlShineSubconscious)"
          animate={{
            cx: [2.5, 12],
            cy: [12, 2.5],
            opacity: [0, 1, 1, 0]
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 1.35 }}
        />

        {/* --- Highly Balanced and Spaced-out Pearl Human Silhouette Avatar Nodes (Inner center is completely open!) --- */}
        
        {/* Node 1: Top Avatar Node */}
        <motion.g
          animate={{ y: [0, -0.6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '12px 2.5px' }}
        >
          {/* Subversive satellite halos around individual node */}
          <circle cx="12" cy="2.5" r="3.3" fill="none" stroke="#ffffff" strokeWidth="0.45" opacity="0.6" strokeDasharray="1.5 1.5" />
          {/* Pristine metallic rim */}
          <circle cx="12" cy="2.5" r="2.5" fill="#0f172a" stroke="url(#silverGlossGrad)" strokeWidth="0.8" />
          {/* Abstract shoulders representation */}
          <path d="M 10.1,4.5 C 10.5,3.9 13.5,3.9 13.9,4.5" stroke="url(#silverGlossGrad)" strokeWidth="0.55" fill="none" strokeLinecap="round" />
          {/* Solid pearl white head/core */}
          <circle cx="12" cy="2.2" r="0.9" fill="url(#pearlCoreGrad)" filter="url(#pearlShineSubconscious)" />
          {/* Floating tiny high-tech beacon dot */}
          <circle cx="12" cy="-0.5" r="0.5" fill="#ffffff" opacity="0.8" />
        </motion.g>

        {/* Node 2: Right Avatar Node */}
        <motion.g
          animate={{ x: [0, 0.6, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          style={{ transformOrigin: '21.5px 12px' }}
        >
          <circle cx="21.5" cy="12" r="3.3" fill="none" stroke="#ffffff" strokeWidth="0.45" opacity="0.6" strokeDasharray="1.5 1.5" />
          <circle cx="21.5" cy="12" r="2.5" fill="#0f172a" stroke="url(#silverGlossGrad)" strokeWidth="0.8" />
          <path d="M 19.6,14 C 20.0,13.4 23.0,13.4 23.4,14" stroke="url(#silverGlossGrad)" strokeWidth="0.55" fill="none" strokeLinecap="round" />
          <circle cx="21.5" cy="11.7" r="0.9" fill="url(#pearlCoreGrad)" filter="url(#pearlShineSubconscious)" />
          <circle cx="24.5" cy="12" r="0.5" fill="#ffffff" opacity="0.8" />
        </motion.g>

        {/* Node 3: Bottom Avatar Node */}
        <motion.g
          animate={{ y: [0, 0.6, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          style={{ transformOrigin: '12px 21.5px' }}
        >
          <circle cx="12" cy="21.5" r="3.3" fill="none" stroke="#ffffff" strokeWidth="0.45" opacity="0.6" strokeDasharray="1.5 1.5" />
          <circle cx="12" cy="21.5" r="2.5" fill="#0f172a" stroke="url(#silverGlossGrad)" strokeWidth="0.8" />
          <path d="M 10.1,23.5 C 10.5,22.9 13.5,22.9 13.9,23.5" stroke="url(#silverGlossGrad)" strokeWidth="0.55" fill="none" strokeLinecap="round" />
          <circle cx="12" cy="21.2" r="0.9" fill="url(#pearlCoreGrad)" filter="url(#pearlShineSubconscious)" />
          <circle cx="12" cy="24.5" r="0.5" fill="#ffffff" opacity="0.8" />
        </motion.g>

        {/* Node 4: Left Avatar Node */}
        <motion.g
          animate={{ x: [0, -0.6, 0] }}
          transition={{ duration: 2.7, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
          style={{ transformOrigin: '2.5px 12px' }}
        >
          <circle cx="2.5" cy="12" r="3.3" fill="none" stroke="#ffffff" strokeWidth="0.45" opacity="0.6" strokeDasharray="1.5 1.5" />
          <circle cx="2.5" cy="12" r="2.5" fill="#0f172a" stroke="url(#silverGlossGrad)" strokeWidth="0.8" />
          <path d="M 0.6,14 C 1.0,13.4 4.0,13.4 4.4,14" stroke="url(#silverGlossGrad)" strokeWidth="0.55" fill="none" strokeLinecap="round" />
          <circle cx="2.5" cy="11.7" r="0.9" fill="url(#pearlCoreGrad)" filter="url(#pearlShineSubconscious)" />
          <circle cx="-0.5" cy="12" r="0.5" fill="#ffffff" opacity="0.8" />
        </motion.g>
      </motion.svg>
    </div>
  );
};
