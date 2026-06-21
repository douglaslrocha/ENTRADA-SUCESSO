import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { notificationService, RichNotification } from '../../services/NotificationService';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Wallet, 
  ArrowRight 
} from 'lucide-react';

export const RichNotificationSystem: React.FC = () => {
  const [activeNotifications, setActiveNotifications] = useState<RichNotification[]>([]);

  useEffect(() => {
    return notificationService.subscribe((notification) => {
      setActiveNotifications(prev => [...prev, notification]);

      // Auto-remove
      if (notification.duration !== 0) {
        setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration || 5000);
      }
    });
  }, []);

  const removeNotification = (id: string) => {
    setActiveNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-6 left-0 right-0 z-[9999] pointer-events-none flex flex-col items-center gap-3 px-4">
      <AnimatePresence mode="popLayout">
        {activeNotifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: -40, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            className="pointer-events-auto group"
          >
            <div className="relative max-w-[90vw] md:max-w-md bg-white/80 dark:bg-black/60 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden">
              {/* Glow Ambient based on type */}
              <div className={`absolute -top-10 -left-10 w-32 h-32 blur-3xl opacity-20 pointer-events-none ${
                notif.type === 'success' ? 'bg-emerald-500' :
                notif.type === 'error' ? 'bg-red-500' :
                notif.type === 'ai' ? 'bg-violet-500' : 'bg-blue-500'
              }`} />

              <div className="p-4 md:p-5 flex items-start gap-4">
                {/* Icon Circle */}
                <div className={`mt-1 shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
                  notif.type === 'success' ? 'bg-emerald-500/10 text-emerald-600' :
                  notif.type === 'error' ? 'bg-red-500/10 text-red-600' :
                  notif.type === 'ai' ? 'bg-violet-500/10 text-violet-600' : 'bg-blue-500/10 text-blue-600'
                }`}>
                  {notif.type === 'ai' && <Sparkles size={24} />}
                  {notif.type === 'success' && <CheckCircle2 size={24} />}
                  {notif.type === 'error' && <AlertCircle size={24} />}
                  {notif.type === 'info' && <Info size={24} />}
                  {notif.type === 'finance' && <Wallet size={24} />}
                </div>

                <div className="flex-1 pr-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/20 mb-1">
                    {notif.type === 'ai' ? 'Sincronia Inteligente' : 'Sistema Amparadora'}
                  </h4>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                    {notif.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-white/50 mt-1 font-medium leading-relaxed">
                    {notif.body}
                  </p>

                  {/* Slot para Código ou Contêiner Customizado com Layouts Dinâmicos */}
                  {notif.data && (
                    <div className="mt-4 overflow-hidden">
                      {notif.layout === 'ai_code' && (
                        <div className="p-3 rounded-2xl bg-black/80 text-[10px] font-mono text-emerald-400 border border-white/10 max-h-32 overflow-auto">
                           {typeof notif.data === 'string' ? notif.data : JSON.stringify(notif.data, null, 2)}
                        </div>
                      )}
                      
                      {notif.layout === 'progress' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                            <span>Progresso</span>
                            <span>{notif.data.value}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${notif.data.value}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full bg-violet-500 rounded-full"
                            />
                          </div>
                        </div>
                      )}

                      {notif.layout === 'chart' && (
                        <div className="flex items-end gap-1 h-12 pt-2">
                          {notif.data.values?.map((v: number, i: number) => (
                            <motion.div
                              key={i}
                              initial={{ height: 0 }}
                              animate={{ height: `${v}%` }}
                              className="flex-1 bg-violet-500/30 dark:bg-violet-500/50 rounded-t-sm"
                            />
                          ))}
                        </div>
                      )}

                      {notif.layout === 'action_list' && (
                        <div className="space-y-1">
                          {notif.data.actions?.map((action: string, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-[10px] font-medium text-slate-500 dark:text-white/40">
                              <div className="w-1 h-1 rounded-full bg-violet-500" />
                              {action}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {notif.actionLabel && (
                    <button 
                      onClick={() => {
                        notif.onAction?.();
                        removeNotification(notif.id);
                      }}
                      className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-violet-500 hover:text-violet-600 transition-colors"
                    >
                      {notif.actionLabel} <ArrowRight size={12} />
                    </button>
                  )}
                </div>

                <button 
                  onClick={() => removeNotification(notif.id)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 dark:text-white/20 transition-all opacity-0 group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
