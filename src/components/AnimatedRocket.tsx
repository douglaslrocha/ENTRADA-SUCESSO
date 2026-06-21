import { motion } from 'motion/react';
import React from 'react';

export const AnimatedRocket = ({ color, sizeForSidebar = false, intense = false }: { color: string, sizeForSidebar?: boolean, intense?: boolean }) => {
  const size = intense ? "12" : (sizeForSidebar ? "8" : "6");
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  return (
    <div 
      className={`relative flex items-center justify-center w-${size} h-${size} overflow-visible ${intense ? 'mb-12 mt-6' : (sizeForSidebar ? '' : 'translate-y-[-1px]')}`}
      style={sizeForSidebar ? { transform: 'scale(1.52) rotate(24deg) translate(3px, -2px)' } : undefined}
    >
      
      {/* Camada de Névoa / Atmosfera (Apenas no modo Intenso) */}
      {intense && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            className="absolute bottom-[-10px] w-32 h-20 bg-blue-500/5 rounded-full blur-[40px]"
            animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.1, 1] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
        </div>
      )}

      {/* Mísseis Teleguiados "Lápis" (Fluxo Esporádico) */}
      {(intense || sizeForSidebar) && [...Array(intense ? 3 : 1)].map((_, i) => (
        <motion.div
          key={`missile-${i}`}
          className="absolute z-0"
          style={{ width: sizeForSidebar ? 0.8 : 1.2, height: sizeForSidebar ? 6 : 8 }}
          initial={{ scale: 0, opacity: 0, x: 0, y: 12 }}
          animate={{
            x: i % 2 === 0 ? [0, -22, -26, -10] : [0, 22, 26, 10],
            y: [12, 35, 30, -500],
            scale: [0.5, 1.1, 1, 0],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 5, 
            repeat: Infinity,
            repeatDelay: 5 + (i * 3), // Lançamentos esporádicos
            delay: i * 3, 
            times: [0, 0.2, 0.75, 1], 
            ease: "easeInOut"
          }}
        >
          <div className="w-full h-full bg-slate-100 relative shadow-sm">
            <div className="absolute top-[-2px] left-0 w-full h-[2px] bg-slate-900" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
            <motion.div 
               className="absolute top-full left-1/2 -translate-x-1/2 w-[1.5px] h-8 bg-gradient-to-t from-transparent via-blue-500 to-cyan-300 blur-[0.5px]"
               animate={{ opacity: [1, 0.4, 1], scaleY: [1, 2, 1] }}
               transition={{ duration: 0.04, repeat: Infinity }}
            />
          </div>
        </motion.div>
      ))}

      {/* Rastro Atmosférico / Riscos de Velocidade (Sutis e Elegantes) */}
      {[...Array(18)].map((_, i) => (
        <motion.div
          key={`streak-${i}`}
          className={`absolute w-[0.5px] ${isDark ? 'bg-white/40' : 'bg-black/15'}`}
          style={{ 
            left: `${-5 + (i * 6.5)}%`, 
            height: Math.random() * 20 + 8, 
            top: -15
          }}
          animate={{
            y: [-15, 110], 
            opacity: [0, isDark ? 0.4 : 0.5, 0]
          }}
          transition={{
            duration: 0.07,
            repeat: Infinity,
            delay: i * 0.015,
            ease: "linear"
          }}
        />
      ))}

      {/* Brilho da Turbina Plasma (Sempre Visível) */}
      <motion.div
        className="absolute bottom-[-15px] w-14 h-8 rounded-full blur-[20px]"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        style={{ backgroundColor: intense ? '#0077ff' : '#00d2ff' }}
        transition={{ duration: 0.3, repeat: Infinity }}
      />

      {/* Aeronave F-16 Falcon (Refinada) */}
      <motion.div
        className="relative z-10"
        animate={{
          x: intense ? [0, 6, -4, 2, 0] : [0, 2, -1, 0, 0],
          rotate: intense ? [0, 3, -3, 1, 0] : [0, 0.5, -0.5, 0, 0],
        }}
        transition={{
          y: { duration: 0.12, repeat: Infinity, ease: "linear" },
          x: { duration: 10, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 10, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <svg viewBox="0 0 32 40" className={`w-${size} h-${intense ? "16" : size} overflow-visible drop-shadow-2xl`}>
          <defs>
            {/* Plasma/Afterburner Multi-Stage Gradient with shock diamond color profile */}
            <linearGradient id="plasma-core" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="15%" stopColor="#38bdf8" /> {/* Sky 400 */}
              <stop offset="45%" stopColor="#2563eb" /> {/* Blue 600 */}
              <stop offset="75%" stopColor="#4f46e5" stopOpacity="0.8" /> {/* Indigo 600 */}
              <stop offset="95%" stopColor="#ef4444" stopOpacity="0.25" /> {/* Red 500 */}
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            
            {/* Main F-22 Stealth Low-Observable Camouflage Gradient */}
            <linearGradient id="stealth-skin" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1e293b" /> {/* Slate 800 */}
              <stop offset="35%" stopColor="#334155" /> {/* Slate 700 */}
              <stop offset="50%" stopColor="#475569" /> {/* Slate 600 */}
              <stop offset="65%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            {/* Radiant high-contrast platinum-silver camouflage gradient for Sidebar readability */}
            <linearGradient id="stealth-skin-sidebar" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f8fafc" /> {/* Slate 50 */}
              <stop offset="40%" stopColor="#cbd5e1" /> {/* Slate 300 */}
              <stop offset="75%" stopColor="#64748b" /> {/* Slate 500 */}
              <stop offset="100%" stopColor="#334155" /> {/* Slate 700 */}
            </linearGradient>

            {/* F-22 Indium-Tin-Oxide (ITO) Radar-Absorbent Gold-Amber Tinted Canopy Gradient */}
            <linearGradient id="f22-canopy-gold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fef08a" /> {/* Yellow 200 */}
              <stop offset="25%" stopColor="#f59e0b" /> {/* Amber 500 */}
              <stop offset="70%" stopColor="#b45309" /> {/* Amber 700 */}
              <stop offset="100%" stopColor="#78350f" /> {/* Amber 900 */}
            </linearGradient>

            {/* Futuristic Holographic Space Canopy (F-16 organic bubble with F-22 geometry) */}
            <linearGradient id="holo-canopy" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00f3ff" /> {/* Electric Cyan */}
              <stop offset="35%" stopColor="#0966ff" /> {/* Deep Fighter Blue */}
              <stop offset="75%" stopColor="#9d00ff" /> {/* Cyber Purple */}
              <stop offset="100%" stopColor="#ff00b8" /> {/* High-Energy Magenta */}
            </linearGradient>

            {/* Realistic Light Reflection Overlay for glass canopy */}
            <linearGradient id="canopy-reflection" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="40%" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>

            {/* Dark Metallic Burnished Titanium Nozzles */}
            <linearGradient id="nozzle-titanium" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="50%" stopColor="#475569" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          {/* Afterburner Realista com Shock Diamonds (Par de Motores Pratt & Whitney F119) */}
          <motion.g
            animate={{ scaleY: [0.95, 1.3, 0.95], opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 0.04, repeat: Infinity }}
            style={{ transformOrigin: '16px 26.5px' }}
          >
            {/* Left Flame Envelope */}
            <path d="M 13.0,26.5 L 14.3,55 M 15.6,26.5 L 14.3,55" stroke="url(#plasma-core)" strokeWidth="1.8" strokeLinecap="round" opacity="0.4" />
            <path d="M 13.0,26.5 L 14.3,46 M 15.6,26.5 L 14.3,46" stroke="#00d2ff" strokeWidth="1.0" strokeLinecap="round" />
            
            {/* Left Shock Diamonds */}
            <circle cx="14.3" cy="31" r="0.6" fill="#ffffff" />
            <polygon points="13.9,35 14.3,33.5 14.7,35 14.3,36.5" fill="#e0f2fe" />
            <polygon points="14.1,41 14.3,40 14.5,41 14.3,42" fill="#38bdf8" />

            {/* Right Flame Envelope */}
            <path d="M 16.4,26.5 L 17.7,55 M 19.0,26.5 L 17.7,55" stroke="url(#plasma-core)" strokeWidth="1.8" strokeLinecap="round" opacity="0.4" />
            <path d="M 16.4,26.5 L 17.7,46 M 19.0,26.5 L 17.7,46" stroke="#00d2ff" strokeWidth="1.0" strokeLinecap="round" />
            
            {/* Right Shock Diamonds */}
            <circle cx="17.7" cy="31" r="0.6" fill="#ffffff" />
            <polygon points="17.3,35 17.7,33.5 18.1,35 17.7,36.5" fill="#e0f2fe" />
            <polygon points="17.5,41 17.7,40 17.9,41 17.7,42" fill="#38bdf8" />
          </motion.g>

          {/* Estúdio de Fuselagem Integrada F-22 Raptor (Conceito Stealth de Alta Fidelidade) */}
          <g>
            {/* Mísseis AIM-120 AMRAAM sob as asas (Representação sofisticada e de escala perfeita) */}
            <g transform="translate(5.8, 12.5)" opacity="0.9">
              <rect x="0.8" y="2.5" width="0.4" height="5.0" fill={sizeForSidebar ? "#64748b" : "#334155"} />
              <line x1="1" y1="1.0" x2="1" y2="8.0" stroke={sizeForSidebar ? "#cbd5e1" : "#475569"} strokeWidth="0.3" />
              <path d="M 0.8,1.0 L 1,-0.5 L 1.2,1.0 Z" fill={sizeForSidebar ? "#cbd5e1" : "#94a3b8"} />
              <path d="M 0.5,6.5 L 1.5,6.5" stroke={sizeForSidebar ? "#cbd5e1" : "#94a3b8"} strokeWidth="0.4" />
            </g>
            <g transform="translate(24.2, 12.5)" opacity="0.9">
              <rect x="0.8" y="2.5" width="0.4" height="5.0" fill={sizeForSidebar ? "#64748b" : "#334155"} />
              <line x1="1" y1="1.0" x2="1" y2="8.0" stroke={sizeForSidebar ? "#cbd5e1" : "#475569"} strokeWidth="0.3" />
              <path d="M 0.8,1.0 L 1,-0.5 L 1.2,1.0 Z" fill={sizeForSidebar ? "#cbd5e1" : "#94a3b8"} />
              <path d="M 0.5,6.5 L 1.5,6.5" stroke={sizeForSidebar ? "#cbd5e1" : "#94a3b8"} strokeWidth="0.4" />
            </g>

            {/* 1. Asas Híbridas F-16 LERX + F-22 Stealth Starship (Linhas curvas com extremidades em notch/chevron de nave estelar - Ampliadas e Ultra Agressivas) */}
            <path 
              d="M 16,9.5 
                 C 14.5,10.0 10.5,12.5 8.2,14.2 
                 L -2.5,18.0
                 L -1.5,21.5
                 L 2.5,22.3
                 L 5.5,19.8
                 L 13.0,24.0
                 L 16,24.0
                 L 19,24.0
                 L 26.5,19.8
                 L 29.5,22.3
                 L 33.5,21.5
                 L 34.5,18.0
                 L 23.8,14.2 
                 C 21.5,12.5 17.5,10.0 16,9.5 Z" 
              fill={sizeForSidebar ? "url(#stealth-skin-sidebar)" : "url(#stealth-skin)"} 
              stroke={sizeForSidebar ? "#020617" : "#090d16"} 
              strokeWidth="0.35" 
            />

            {/* Canais de Energia Plasma / Conduítes nas Asas (Cyber Space Glow) */}
            <path 
              d="M 10.0,14.2 L -1.5,18.8 L -0.8,20.8 L 12.0,21.8" 
              fill="none" 
              stroke="url(#plasma-core)" 
              strokeWidth="0.6" 
              opacity="0.85" 
              strokeLinecap="round"
            />
            <path 
              d="M 22.0,14.2 L 33.5,18.8 L 32.8,20.8 L 20.0,21.8" 
              fill="none" 
              stroke="url(#plasma-core)" 
              strokeWidth="0.6" 
              opacity="0.85" 
              strokeLinecap="round"
            />

            {/* Entradas de Ar Caret Air Intakes (Entradas trapezoidais marcantes de caça de Quinta Geração) */}
            <path d="M 11.2,11.3 L 12.7,11.3 L 12.7,14.5 L 11.2,13.7 Z" fill="#090d16" stroke="#020617" strokeWidth="0.2" />
            <path d="M 20.8,11.3 L 19.3,11.3 L 19.3,14.5 L 20.8,13.7 Z" fill="#090d16" stroke="#020617" strokeWidth="0.2" />

            {/* 2. Fuselagem com "Chine" Aerodinâmico Elegante na Proa e Espinha Dorsal */}
            <path
              d="M 16,1.0 
                 C 14.8,4.5 13.0,6.5 12.8,10.0 
                 L 12.8,25.2 
                 L 13.5,26.2 
                 L 16,26.8 
                 L 18.5,26.2 
                 L 19.2,25.2 
                 L 19.2,10.0 
                 C 19.0,6.5 17.2,4.5 16,1.0 Z"
              fill={sizeForSidebar ? "url(#stealth-skin-sidebar)" : "url(#stealth-skin)"}
              stroke={sizeForSidebar ? "#020617" : "#090d16"}
              strokeWidth="0.35"
            />

            {/* Sobriedade Insígnia Militar USAF Estrela e Listras em Baixo Contraste (Asa Esquerda) */}
            <g transform="translate(10.2, 18.8) scale(0.35)" opacity="0.35" fill="none" stroke="#475569">
              <circle cx="0" cy="0" r="3" strokeWidth="0.5" />
              <path d="M -5,0 L 5,0 M -2,1.5 L -2, -1.5 M 2,1.5 L 2,-1.5" strokeWidth="0.5" />
              <polygon points="0,-1.5 0.5,-0.2 1.8,-0.2 0.8,0.6 1.2,1.8 0,1.0 -1.2,1.8 -0.8,0.6 -1.8,-0.2 -0.5,-0.2" fill="#475569" stroke="none" />
            </g>

            {/* Estabilizadores Traseiros Triangulares de Projeção de Ataque (Mais estreitos e com formato agressivo apontado para frente) */}
            <path 
              d="M 12.8,24.8 
                 L 6.5,22.0 
                 L 5.5,25.0 
                 L 9.0,30.0
                 L 12.5,26.5 Z" 
              fill={sizeForSidebar ? "url(#stealth-skin-sidebar)" : "url(#stealth-skin)"} 
              stroke={sizeForSidebar ? "#020617" : "#090d16"} 
              strokeWidth="0.25" 
            />
            <path 
              d="M 19.2,24.8 
                 L 25.5,22.0 
                 L 26.5,25.0 
                 L 23.0,30.0
                 L 19.5,26.5 Z" 
              fill={sizeForSidebar ? "url(#stealth-skin-sidebar)" : "url(#stealth-skin)"} 
              stroke={sizeForSidebar ? "#020617" : "#090d16"} 
              strokeWidth="0.25" 
            />

            {/* Estabilizadores Verticais Duplos Canteados (Estilo Leme Estelar com conduíte neon e formato futurista) */}
            <path 
              d="M 13.0,18.5 
                 L 7.8,27.0 
                 L 9.2,28.2 
                 L 11.0,28.2 
                 L 13.0,21.2 Z" 
              fill={sizeForSidebar ? "url(#stealth-skin-sidebar)" : "url(#stealth-skin)"} 
              stroke={sizeForSidebar ? "#020617" : "#090d16"} 
              strokeWidth="0.3" 
            />
            {/* Glow neon lines inside the stabilizers */}
            <line x1="10.2" y1="21.5" x2="8.8" y2="25.5" stroke="#00f3ff" strokeWidth="0.45" opacity="0.9" />

            <path 
              d="M 19.0,18.5 
                 L 24.2,27.0 
                 L 22.8,28.2 
                 L 21.0,28.2 
                 L 19.0,21.2 Z" 
              fill={sizeForSidebar ? "url(#stealth-skin-sidebar)" : "url(#stealth-skin)"} 
              stroke={sizeForSidebar ? "#020617" : "#090d16"} 
              strokeWidth="0.3" 
            />
            <line x1="21.8" y1="21.5" x2="23.2" y2="25.5" stroke="#00f3ff" strokeWidth="0.45" opacity="0.9" />

            {/* Bocais de Escape de Empuxo Vetorizado 2D (F-22 Flat Vectoring Nozzles) */}
            <path d="M 13.0,25.2 L 12.7,26.5 L 15.7,26.5 L 15.4,25.2 Z" fill="url(#nozzle-titanium)" stroke="#090d16" strokeWidth="0.2" />
            <line x1="13.9" y1="25.4" x2="13.9" y2="26.3" stroke="#090d16" strokeWidth="0.2" />
            <line x1="14.8" y1="25.4" x2="14.8" y2="26.3" stroke="#090d16" strokeWidth="0.2" />
            
            <path d="M 16.6,25.2 L 16.3,26.5 L 19.3,26.5 L 19.0,25.2 Z" fill="url(#nozzle-titanium)" stroke="#090d16" strokeWidth="0.2" />
            <line x1="17.2" y1="25.4" x2="17.2" y2="26.3" stroke="#090d16" strokeWidth="0.2" />
            <line x1="18.1" y1="25.4" x2="18.1" y2="26.3" stroke="#090d16" strokeWidth="0.2" />

            {/* Núcleo de Propulsão Auxiliar (Bocal Redondo Único de Fusão Centralizado estilo F-16) */}
            <circle cx="16.0" cy="25.8" r="1.1" fill="url(#plasma-core)" stroke="#00f3ff" strokeWidth="0.3" opacity="0.95" />

            {/* Tubo de Pitot de Alta Precisão no Bico do Caça */}
            <path d="M 14.3,6.2 C 15,6.5, 17,6.5, 17.7,6.2" fill="none" stroke={sizeForSidebar ? "#94a3b8" : "#0f172a"} strokeWidth="0.2" />
            <line x1="16" y1="1.0" x2="16" y2="-0.8" stroke={sizeForSidebar ? "#94a3b8" : "#475569"} strokeWidth="0.35" strokeLinecap="round" />

            {/* 3. Canopy de Fusão Holográfica Espacial (Mistura da bolha do F-16 com o design agressivo F-22) */}
            <path 
              d="M 14.5,7.8 
                 C 14.5,5.2 17.5,5.2 17.5,7.8 
                 C 17.5,13.2 14.5,13.2 14.5,7.8 Z" 
              fill="url(#holo-canopy)" 
              stroke="#020617" 
              strokeWidth="0.35" 
            />
            {/* Brilho reflexivo diagonal */}
            <path 
              d="M 14.5,7.8 
                 C 14.5,5.2 17.5,5.2 17.5,7.8 
                 C 17.5,13.2 14.5,13.2 14.5,7.8 Z" 
              fill="url(#canopy-reflection)" 
            />
            {/* Focal Points de Luz Solar do Cockpit */}
            <ellipse cx="15.1" cy="6.8" rx="0.35" ry="0.9" fill="#ffffff" opacity="0.95" transform="rotate(-15 15.1 6.8)" />
            <ellipse cx="16.6" cy="10.5" rx="0.18" ry="0.5" fill="#ffffff" opacity="0.55" />

            {/* Sawtooth Radar Receptacle Cover Panel (Receptáculo de reabastecimento aéreo em chevron) */}
            <path d="M 15.5,15.0 L 16.0,15.5 L 16.5,15.0 L 16.5,15.7 L 16.0,16.2 L 15.5,15.7 Z" fill="none" stroke="#64748b" strokeWidth="0.18" opacity="0.5" />

            {/* Linhas de Texturas e Encaixe de Painéis Stealth no Dorso */}
            <path d="M 13.8,17.5 L 16.0,19.2 L 18.2,17.5" fill="none" stroke="#0f172a" strokeWidth="0.25" opacity="0.4" />
            <path d="M 14.2,21.0 L 16.0,22.4 L 17.8,21.0" fill="none" stroke="#0f172a" strokeWidth="0.25" opacity="0.4" />

            {/* Luzes de Formação Slime Green Electroluminescent (O ápice do realismo técnico militar) */}
            <line x1="-1.6" y1="21.1" x2="-0.6" y2="21.4" stroke="#bfff00" strokeWidth="0.5" strokeLinecap="round" opacity="0.9" />
            <line x1="33.6" y1="21.1" x2="32.6" y2="21.4" stroke="#bfff00" strokeWidth="0.5" strokeLinecap="round" opacity="0.9" />
            
            <line x1="5.6" y1="24.6" x2="6.6" y2="24.6" stroke="#bfff00" strokeWidth="0.5" strokeLinecap="round" opacity="0.9" />
            <line x1="26.4" y1="24.6" x2="25.4" y2="24.6" stroke="#bfff00" strokeWidth="0.5" strokeLinecap="round" opacity="0.9" />
          </g>
        </svg>
      </motion.div>
    </div>
  );
};

export default AnimatedRocket;
