import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Smartphone, Monitor, ShieldAlert, ArrowUpFromLine, MoreVertical, Plus, Check, Laptop, HelpCircle } from 'lucide-react';
import { haptics } from '../services/HapticService';
import { safeLocalStorage } from '../utils/storage';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PWAInstallModal({ isOpen, onClose }: PWAInstallModalProps) {
  const [activeTab, setActiveTab] = useState<'safari' | 'chrome' | 'desktop' | 'vps'>('safari');
  const appCustomName = safeLocalStorage.getItem('app_custom_name') || 'Remix 1.7';

  if (!isOpen) return null;

  const handleClose = () => {
    haptics.success();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-zinc-900/90 to-black/95 p-6 shadow-2xl backdrop-blur-2xl md:p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 border border-violet-500/20">
                <Smartphone size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Como Instalar o Aplicativo</h3>
                <p className="text-xs text-white/40">Guia passo a passo para o seu dispositivo</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1 p-1 mt-6 rounded-2xl bg-white/5 border border-white/5 text-xs md:text-sm">
            <button
              onClick={() => { haptics.success(); setActiveTab('safari'); }}
              className={`flex-1 py-2 px-3 rounded-xl font-medium transition-all ${
                activeTab === 'safari'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              iOS (Safari)
            </button>
            <button
              onClick={() => { haptics.success(); setActiveTab('chrome'); }}
              className={`flex-1 py-2 px-3 rounded-xl font-medium transition-all ${
                activeTab === 'chrome'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Android
            </button>
            <button
              onClick={() => { haptics.success(); setActiveTab('desktop'); }}
              className={`flex-1 py-2 px-3 rounded-xl font-medium transition-all ${
                activeTab === 'desktop'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Desktop
            </button>
            <button
              onClick={() => { haptics.success(); setActiveTab('vps'); }}
              className={`flex-1 py-2 px-2 rounded-xl font-medium transition-all flex items-center justify-center gap-1 ${
                activeTab === 'vps'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                  : 'text-amber-400 hover:bg-white/5'
              }`}
            >
              <ShieldAlert size={14} />
              VPS / SSL
            </button>
          </div>

          {/* Content Area */}
          <div className="mt-6 min-h-[220px] text-white/80">
            {activeTab === 'safari' && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <p className="text-sm text-white/60 leading-relaxed font-light">
                  No iOS (iPhone/iPad), a Apple bloqueia a instalação automática direta de PWAs em navegadores. Você precisa instalá-lo manualmente usando o Safari:
                </p>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-3 items-start">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 font-bold text-xs shrink-0 mt-0.5">1</span>
                    <span>Abra a página do {appCustomName} usando o navegador <strong className="text-white">Safari</strong> padrão da Apple.</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 font-bold text-xs shrink-0 mt-0.5">2</span>
                    <span className="flex items-center gap-1.5 flex-wrap">
                      Clique no botão de <strong className="text-white">Compartilhar</strong> 
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-white/10 text-violet-400"><ArrowUpFromLine size={14} /></span>
                      na barra inferior do Safari.
                    </span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 font-bold text-xs shrink-0 mt-0.5">3</span>
                    <span>Role a folha de opções para baixo e clique em <strong className="text-white">Adicionar à Tela de Início</strong>.</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 font-bold text-xs shrink-0 mt-0.5">4</span>
                    <span>Clique em <strong className="text-white">Adicionar</strong> no canto superior direito para confirmar. O app aparecerá na sua tela inicial!</span>
                  </li>
                </ol>
              </motion.div>
            )}

            {activeTab === 'chrome' && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <p className="text-sm text-white/60 leading-relaxed font-light">
                  Se o botão de instalação automática falhar no Android, você pode forçar a instalação rápida manualmente pelo Google Chrome:
                </p>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-3 items-start">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 font-bold text-xs shrink-0 mt-0.5">1</span>
                    <span>Abra o app no navegador de sua preferência (ex: <strong className="text-white">Chrome o Google</strong>).</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 font-bold text-xs shrink-0 mt-0.5">2</span>
                    <span className="flex items-center gap-1.5 flex-wrap">
                      No canto superior direito, clique nos <strong className="text-white">três pontos</strong>
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white/10 text-violet-400"><MoreVertical size={14} /></span>.
                    </span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 font-bold text-xs shrink-0 mt-0.5">3</span>
                    <span>Procure e selecione a opção <strong className="text-white">Instalar aplicativo</strong> ou <strong className="text-white">Adicionar à tela inicial</strong>.</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 font-bold text-xs shrink-0 mt-0.5">4</span>
                    <span>Siga as instruções rápidas do sistema e o app será adicionado à sua lista de aplicativos nativos de imediato!</span>
                  </li>
                </ol>
              </motion.div>
            )}

            {activeTab === 'desktop' && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <p className="text-sm text-white/60 leading-relaxed font-light">
                  Instalar no Computador é excelente para ter uma janela dedicada e limpa do {appCustomName} com zero distrações:
                </p>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-3 items-start">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 font-bold text-xs shrink-0 mt-0.5">1</span>
                    <span>Usando o Google Chrome, Edge ou Brave, olhe para a <strong className="text-white">barra de endereços URL</strong> no topo.</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 font-bold text-xs shrink-0 mt-0.5">2</span>
                    <span>No lado direito da barra, procure por um ícone de <strong className="text-white">tela de computador com seta para baixo</strong> ou um sinal de somar (+).</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 font-bold text-xs shrink-0 mt-0.5">3</span>
                    <span>Clique nele e escolha <strong className="text-white">Instalar</strong> no balão de confirmação.</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 font-bold text-xs shrink-0 mt-0.5">4</span>
                    <span>O {appCustomName} abrirá em uma janela limpa, fluida e com seu próprio ícone nativo na sua Área de Trabalho!</span>
                  </li>
                </ol>
              </motion.div>
            )}

            {activeTab === 'vps' && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-3 text-xs md:text-sm"
              >
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3">
                  <ShieldAlert className="text-amber-400 shrink-0 mt-0.5" size={20} />
                  <div className="space-y-1">
                    <h4 className="font-bold text-amber-400">Requisito de Contexto Seguro (HTTPS)</h4>
                    <p className="text-white/60 leading-relaxed font-light">
                      Os navegadores web modernos <strong className="text-white">proíbem estritamente</strong> a instalação de PWAs e o registro de Service Workers em conexões <strong className="text-amber-400">HTTP inseguras</strong> (como acessar via IP direto de VPS <code className="bg-white/5 px-1 rounded">http://182...</code> sem certificado SSL).
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-white">Como solucionar no seu VPS / Hostinger:</p>
                  <p className="text-white/60 leading-relaxed font-light">
                    Você deve configurar um <strong className="text-white">domínio próprio</strong> (ex: <code className="bg-white/5 px-1 rounded">seuapp.com.br</code>) apoderado de um certificado SSL gratuito <strong className="text-white">HTTPS</strong> (fornecido facilmente pela Hostinger, ou usando o Certbot com Nginx/Apache na sua VPS). Assim que abrir o app no endereço HTTPS, o botão de download passará a funcionar magicamente de forma nativa e automática!
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleClose}
              className="py-2.5 px-6 rounded-2xl bg-white/10 hover:bg-white text-white hover:text-black font-semibold text-xs transition-all shadow-lg shadow-white/5 active:scale-95"
            >
              Compreendido
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
