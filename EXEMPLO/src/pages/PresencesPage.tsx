import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { forceSimulation, forceManyBody, forceCollide, forceCenter, forceX, forceY, SimulationNodeDatum } from 'd3-force';
import { PresenceCircle } from '../components/PresenceCircle';
import { PresenceModal } from '../components/PresenceModal';
import { NewPresenceModal } from '../components/NewPresenceModal';
import { presenceService, Presence } from '../services/presenceService';

interface PresencesPageProps {
  onToggleSidebar: () => void;
  theme?: 'light' | 'dark';
}

interface PresenceNode extends SimulationNodeDatum {
  id: string;
  name: string;
  photo: string;
}

export const PresencesPage: React.FC<PresencesPageProps> = ({ onToggleSidebar, theme }) => {
  const isDark = theme === 'dark';
  const [presences, setPresences] = useState<Presence[]>([]);
  const [selectedPresence, setSelectedPresence] = useState<Presence | null>(null);
  const [isNewPresenceModalOpen, setIsNewPresenceModalOpen] = useState(false);
  const [editingPresence, setEditingPresence] = useState<Presence | null>(null);
  const [nodes, setNodes] = useState<PresenceNode[]>([]);
  const [activeBgIndex, setActiveBgIndex] = useState(0);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const simulationRef = useRef<any>(null);

  const refreshData = () => {
    const data = presenceService.getPresences();
    setPresences(data);
    
    // Create nodes for new presences while keeping existing node positions if possible
    setNodes(prevNodes => {
      const existingIds = new Set(data.map(p => p.id));
      const filteredPrev = prevNodes.filter(n => existingIds.has(n.id));
      
      const currentNodesIds = new Set(filteredPrev.map(n => n.id));
      const newNodes = data
        .filter(p => !currentNodesIds.has(p.id))
        .map(p => ({
          id: p.id,
          name: p.name,
          photo: p.photo,
          x: (Math.random() - 0.5) * 50,
          y: (Math.random() - 0.5) * 50,
        }));
      return [...filteredPrev, ...newNodes];
    });
  };

  const handleEdit = (presence: Presence) => {
    setEditingPresence(presence);
    setSelectedPresence(null);
    setIsNewPresenceModalOpen(true);
  };

  const handleDelete = (presence: Presence) => {
    presenceService.deletePresence(presence.id);
    setSelectedPresence(null);
    refreshData();
  };

  const handleCloseNewModal = () => {
    setIsNewPresenceModalOpen(false);
    setEditingPresence(null);
  };

  const handleCreateNew = () => {
    setEditingPresence(null);
    setIsNewPresenceModalOpen(true);
  };

  // Initialize data and dimensions
  useEffect(() => {
    refreshData();

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute responsive variables
  const isMobile = windowSize.width < 768;
  const circleSize = useMemo(() => {
    const count = presences.length;
    if (isMobile) return count <= 3 ? 120 : 90;
    return count <= 3 ? 220 : count <= 6 ? 180 : 140;
  }, [presences.length, isMobile]);

  // Physics Simulation
  useEffect(() => {
    if (nodes.length === 0) return;

    const simulation = forceSimulation<PresenceNode>(nodes)
      .alphaDecay(0.02)
      .velocityDecay(0.4)
      .force('charge', forceManyBody().strength(isMobile ? -300 : -800))
      .force('center', forceCenter(0, 0).strength(0.05))
      .force('collide', forceCollide<PresenceNode>().radius(circleSize / 2 + 30).iterations(3))
      .force('x', forceX(0).strength(0.01))
      .force('y', forceY(0).strength(0.01))
      .on('tick', () => {
        // Enforce canvas boundaries strictly based on CURRENT window dimensions
        const xLimit = (window.innerWidth / 2) - (circleSize / 2) - 20;
        const yLimit = (window.innerHeight / 2) - (circleSize / 2) - (isMobile ? 140 : 100);

        for (const node of nodes) {
          if (node.fx === null || node.fx === undefined) {
            if (node.x! > xLimit) node.x = xLimit;
            if (node.x! < -xLimit) node.x = -xLimit;
          }
          if (node.fy === null || node.fy === undefined) {
            if (node.y! > yLimit) node.y = yLimit;
            if (node.y! < -yLimit) node.y = -yLimit;
          }
        }
        setNodes([...nodes]);
      });

    simulationRef.current = simulation;
    return () => {
      simulation.stop();
    };
  }, [nodes.length, windowSize, circleSize, isMobile]);

  const handleDragStart = (nodeId: string) => {
    simulationRef.current?.alphaTarget(0.2).restart();
  };

  const handleDrag = (nodeId: string, event: any, info: any) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      const xLimit = (window.innerWidth / 2) - (circleSize / 2) - 10;
      const yLimit = (window.innerHeight / 2) - (circleSize / 2) - 80;

      const newX = (node.x || 0) + info.delta.x;
      const newY = (node.y || 0) + info.delta.y;

      node.fx = Math.max(-xLimit, Math.min(xLimit, newX));
      node.fy = Math.max(-yLimit, Math.min(yLimit, newY));
    }
  };

  const handleDragEnd = (nodeId: string) => {
    simulationRef.current?.alphaTarget(0);
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      node.fx = null;
      node.fy = null;
    }
  };

  useEffect(() => {
    if (presences.length === 0) return;
    const interval = setInterval(() => {
      setActiveBgIndex(prev => (prev + 1) % presences.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [presences.length]);

  return (
    <div className={`relative min-h-[150vh] w-full overflow-x-hidden transition-colors duration-500 ${
      isDark ? 'bg-[#0f1112]' : 'bg-white'
    }`}>
      {/* Background memories - adapted for light/dark theme */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <AnimatePresence mode="wait">
          {presences[activeBgIndex] && (
            <motion.div
              key={presences[activeBgIndex].id}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: isDark ? 0.15 : 0.08, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 5 }}
              className="absolute inset-0"
            >
              <img 
                src={presences[activeBgIndex].photo} 
                alt="" 
                className="w-full h-full object-cover blur-[80px]"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          )}
        </AnimatePresence>
        <div className={`absolute inset-0 bg-gradient-to-b ${
          isDark 
            ? 'from-[#0f1112]/20 via-transparent to-[#0f1112]' 
            : 'from-white/20 via-transparent to-white'
        }`} />
      </div>

      <div className="relative z-10 w-full min-h-screen flex flex-col">
        {/* Header - More subtle and responsive */}
        <header className="fixed top-0 left-0 right-0 z-[100] px-6 py-8 md:px-12 md:py-12 flex items-center justify-between pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pointer-events-auto shrink-0"
          >
            {/* Horizontal Pill Menu Button */}
            <button 
              onClick={onToggleSidebar}
              className={`w-[67px] h-[36px] md:w-[88px] md:h-[46px] rounded-full border flex items-center justify-center shadow-sm transition-all active:scale-90 ${
                isDark 
                  ? 'border-white/10 bg-zinc-900/40 text-zinc-400 hover:text-zinc-100' 
                  : 'border-zinc-100 bg-white/40 text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <span className="material-symbols-outlined text-xl md:text-2xl">menu</span>
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center text-center justify-center mx-4 flex-1 min-w-0 pointer-events-auto"
          >
            <h1 className={`text-xl md:text-4xl font-light tracking-tighter leading-none mb-1 md:mb-1.5 truncate ${
              isDark ? 'text-zinc-100' : 'text-zinc-900'
            }`}>Humanidade</h1>
            <p className={`text-[8px] md:text-[10px] uppercase tracking-[0.4em] md:tracking-[0.6em] font-extrabold whitespace-nowrap truncate ${
              isDark ? 'text-zinc-500' : 'text-zinc-300'
            }`}>Sinfonia Consciente</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pointer-events-auto shrink-0"
          >
            <button 
              onClick={handleCreateNew}
              className={`w-[67px] h-[44px] md:w-[88px] md:h-[56px] rounded-full border flex items-center justify-center shadow-sm transition-all active:scale-95 ${
                isDark 
                  ? 'border-white/10 bg-zinc-900/40 text-zinc-400 hover:text-zinc-100' 
                  : 'border-zinc-100 bg-white/40 text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <span className="material-symbols-outlined text-[28px] md:text-[34px] font-medium">add</span>
            </button>
          </motion.div>
        </header>

        {/* The Simulation Stage - Always centered */}
        <div className="fixed inset-0 z-20 pointer-events-none flex items-center justify-center overflow-hidden">
          {/* This is the center origin (0,0) */}
          <div className="relative w-0 h-0 pointer-events-auto">
            {nodes.map((node, index) => (
              <PresenceCircle 
                key={node.id}
                photo={node.photo}
                name={node.name}
                size={circleSize}
                x={node.x || 0}
                y={node.y || 0}
                index={index}
                theme={theme}
                onDragStart={() => handleDragStart(node.id)}
                onDrag={(e, info) => handleDrag(node.id, e, info)}
                onDragEnd={() => handleDragEnd(node.id)}
                onClick={() => setSelectedPresence(presences.find(p => p.id === node.id) || null)}
              />
            ))}
          </div>
        </div>

        {/* Cinematic Backdrop Overlay for Mobile Intimacy */}
        <div className={`md:hidden fixed inset-0 pointer-events-none z-10 opacity-40 bg-gradient-to-b ${
          isDark ? 'from-[#0f1112] via-transparent to-[#0f1112]' : 'from-white via-transparent to-white'
        }`} />

        {/* Scrollable Spacer */}
        <div className="flex-1 min-h-[120vh]" />

        <footer className="relative z-30 p-12 text-center pb-24 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.3 }}
            className="space-y-4"
          >
            <div className={`w-px h-12 mx-auto ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
          </motion.div>
        </footer>
      </div>

      <PresenceModal 
        presence={selectedPresence} 
        onClose={() => setSelectedPresence(null)} 
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <NewPresenceModal 
        isOpen={isNewPresenceModalOpen}
        onClose={handleCloseNewModal}
        onSave={refreshData}
        initialPresence={editingPresence}
      />

      {/* Film Grain Texture */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
    </div>
  );
};
