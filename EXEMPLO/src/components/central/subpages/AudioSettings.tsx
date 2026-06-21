import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Volume2, 
  Waves, 
  Cpu, 
  Zap, 
  Music,
  Check,
  Play
} from 'lucide-react';
import { haptics, SoundStyle } from '../../../services/HapticService';
import { notificationService } from '../../../services/NotificationService';
import { 
  X,
  BellRing
} from 'lucide-react';

export const AudioSettings: React.FC = () => {
  const [currentStyle, setCurrentStyle] = useState<SoundStyle>(haptics.getCurrentStyle());

  const styles = [
    { 
      id: SoundStyle.CRYSTAL, 
      label: 'Studio Premium', 
      description: 'Assinatura acústica de alta fidelidade, inspirada em dispositivos de elite (Apple style).',
      icon: Waves,
      color: 'text-blue-400'
    },
    { 
      id: SoundStyle.MECHANICAL, 
      label: 'Engenharia Tátil', 
      description: 'Feedback sólido e técnico, focado em precisão industrial.',
      icon: Cpu,
      color: 'text-amber-400'
    },
    { 
      id: SoundStyle.FLUID, 
      label: 'Orgânico', 
      description: 'Interfaces vivas com decaimento natural e suavidade extrema.',
      icon: Music,
      color: 'text-emerald-400'
    },
    { 
      id: SoundStyle.RETRO, 
      label: 'Retro', 
      description: 'Sintetizadores 8-bit e formas de onda clássicas dos anos 80.',
      icon: Zap,
      color: 'text-fuchsia-400'
    }
  ];

  const handleStyleSelect = (style: SoundStyle) => {
    haptics.setStyle(style);
    setCurrentStyle(style);
  };

  const [activeBtn, setActiveBtn] = useState<string | null>(null);

  const testSound = (type: any) => {
    setActiveBtn(type);
    setTimeout(() => setActiveBtn(null), 200);

    switch (type) {
      case 'click': haptics.lightClick(); break;
      case 'success': haptics.success(); break;
      case 'notification': haptics.notification(); break;
      case 'send': haptics.send(); break;
      case 'toggle_on': haptics.toggle(true); break;
      case 'toggle_off': haptics.toggle(false); break;
      case 'open': haptics.open(); break;
      case 'close': haptics.close(); break;
      case 'transition': haptics.transition(); break;
      case 'heavy': haptics.heavyClick(); break;
      case 'selection': haptics.selection(); break;
      case 'data_save': haptics.dataSave(); break;
      case 'action_critical': haptics.actionCritical(); break;
      case 'error': haptics.error(); break;
    }
  };

  const testRichNotification = (layout: any) => {
    switch (layout) {
      case 'ai_code':
        notificationService.notify({
          title: 'Algoritmo Otimizado',
          body: 'A Amparadora gerou uma nova estrutura de dados para seus investimentos.',
          type: 'ai',
          layout: 'ai_code',
          data: 'const optimize = () => {\n  return portfolio.map(a => a.yield * 1.25);\n}',
          actionLabel: 'Aplicar'
        });
        break;
      case 'chart':
        notificationService.notify({
          title: 'Economia Semanal',
          body: 'Seu gráfico de gastos mostra uma queda de 12% em categorias supérfluas.',
          type: 'finance',
          layout: 'chart',
          data: { values: [30, 45, 20, 60, 40, 80, 50] },
          actionLabel: 'Detalhes'
        });
        break;
      case 'progress':
        notificationService.notify({
          title: 'Sincronia Total',
          body: 'O organismo está 85% alinhado com seus novos objetivos biológicos.',
          type: 'success',
          layout: 'progress',
          data: { value: 85 },
          actionLabel: 'Otimizar Restante'
        });
        break;
      case 'action_list':
        notificationService.notify({
          title: 'Ações Prioritárias',
          body: 'Três pendências críticas exigem sua atenção imediata.',
          type: 'warning',
          layout: 'action_list',
          data: { actions: ['Revisar PIX pendente', 'Confirmar reunião às 15h', 'Atualizar saldo Nubank'] }
        });
        break;
    }
  };

  const [notifPermission, setNotifPermission] = useState(
    'Notification' in window ? Notification.permission : 'denied'
  );

  const requestSystemPermission = async () => {
    const granted = await notificationService.requestPermission();
    setNotifPermission(granted ? 'granted' : 'denied');
    if (granted) {
      notificationService.notify({
        title: 'Permissão Concedida',
        body: 'Agora a Amparadora pode se comunicar com você mesmo fora deste aplicativo.',
        type: 'success'
      });
    }
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-2 text-[var(--text)]">
            <Volume2 className="text-violet-500 dark:text-violet-400" size={20} />
            Arquitetura Sensorial
          </h2>
          <p className="text-sm text-[var(--text-secondary)] font-medium">Engenharia de som focada em profundidade emocional e valor percebido.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${
            notifPermission === 'granted' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
              : 'bg-slate-500/10 border-slate-500/20 text-slate-500'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${notifPermission === 'granted' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            {notifPermission === 'granted' ? 'Sistema Ativo' : 'Sistema Inativo'}
          </div>

          {notifPermission !== 'granted' && (
            <button 
              onClick={requestSystemPermission}
              className="px-4 py-2 rounded-full bg-violet-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-violet-600 transition-all flex items-center gap-2 shadow-lg shadow-violet-500/20 active:scale-95"
            >
              <BellRing size={14} /> Ativar Notificações do Sistema
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {styles.map((style) => {
          const Icon = style.icon;
          const isActive = currentStyle === style.id;
          
          return (
            <button
              key={style.id}
              onClick={() => handleStyleSelect(style.id)}
              className={`relative p-6 rounded-[2rem] border transition-all text-left group overflow-hidden ${
                isActive 
                  ? 'bg-white dark:bg-white/5 border-violet-500 shadow-xl shadow-violet-500/10' 
                  : 'bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/5 hover:border-white/20'
              }`}
            >
              {/* Background Glow */}
              {isActive && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 blur-3xl -mr-16 -mt-16" />
              )}
              
              <div className="flex items-start gap-4 relative z-10">
                <div className={`p-3 rounded-2xl ${isActive ? 'bg-violet-500 text-white' : 'bg-slate-200 dark:bg-white/5 text-slate-400'}`}>
                  <Icon size={24} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-black uppercase tracking-widest text-xs ${isActive ? 'text-[var(--text)]' : 'text-[var(--text-secondary)] opacity-60'}`}>
                      {style.label}
                    </h3>
                    {isActive && <Check size={16} className="text-violet-500" />}
                  </div>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-2 leading-relaxed">
                    {style.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Test Section */}
      <div className="p-8 rounded-[2.5rem] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] opacity-70 mb-6 flex items-center gap-2">
          <BellRing size={10} /> Notificações de Próxima Geração (Rich UI)
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { id: 'ai_code', label: 'IA (Código)' },
            { id: 'chart', label: 'Finanças (Grafico)' },
            { id: 'progress', label: 'Sucesso (Progresso)' },
            { id: 'action_list', label: 'Ações (Lista)' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => testRichNotification(btn.id as any)}
              className="px-4 py-4 rounded-2xl bg-violet-500/5 dark:bg-violet-500/10 border border-violet-500/20 hover:border-violet-500 hover:scale-[1.02] active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-400 flex items-center justify-center gap-2"
            >
              Simular {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Families Section */}
      <div className="p-8 rounded-[2.5rem] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] opacity-70 mb-6 flex items-center gap-2">
          <Play size={10} /> Laboratório Sensorial (Famílias de Som)
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { id: 'click', label: 'Tap Dinâmico' },
            { id: 'heavy', label: 'Tap Profundo' },
            { id: 'selection', label: 'Seleção' },
            { id: 'toggle_on', label: 'Ativar' },
            { id: 'toggle_off', label: 'Desativar' },
            { id: 'open', label: 'Abertura/Foco' },
            { id: 'close', label: 'Recolhimento' },
            { id: 'transition', label: 'Navegação' },
            { id: 'data_save', label: 'Persistência' },
            { id: 'action_critical', label: 'Crítico' },
            { id: 'success', label: 'Triunfo/Valor' },
            { id: 'send', label: 'Fluxo/Envio' },
            { id: 'notification', label: 'Presença' },
            { id: 'error', label: 'Dissolução' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => testSound(btn.id as any)}
              className={`px-4 py-4 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 ${
                activeBtn === btn.id 
                  ? 'bg-violet-500 text-white border-violet-600 scale-95 shadow-lg shadow-violet-500/40' 
                  : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-[var(--text-secondary)] hover:border-violet-500/50 hover:scale-[1.02] active:scale-95'
              }`}
            >
              <Zap size={12} className={activeBtn === btn.id ? 'opacity-100' : 'opacity-40'} />
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center">
        <p className="text-[9px] text-[var(--text-secondary)] opacity-50 uppercase tracking-[0.4em] italic font-light">
          A vibração hápica é ativada apenas em dispositivos móveis compatíveis.
        </p>
      </div>
    </div>
  );
};
