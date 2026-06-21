import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../lib/AuthContext';
import { 
  User, 
  Calendar, 
  FileText, 
  Save, 
  CheckCircle2, 
  Camera, 
  MapPin, 
  Navigation,
  Globe,
  Menu,
  ChevronLeft,
  Download,
  Smartphone,
  Sparkles,
  Palette,
  Link2,
  RotateCcw,
  Upload,
  Image,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { haptics } from '../../services/HapticService';
import { PWAInstallModal } from '../PWAInstallModal';
import { safeLocalStorage } from '../../utils/storage';

interface ProfilePageProps {
  onToggleSidebar?: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onToggleSidebar }) => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    city: user?.city || '',
    ip: user?.ip || '',
    lastKnownLocation: user?.lastKnownLocation || null
  });
  
  const [showSaved, setShowSaved] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Dynamic App Branding Customization States
  const [appCustomName, setAppCustomName] = useState(() => safeLocalStorage.getItem('app_custom_name') || 'Remix 1.7');
  const [appCustomDesc, setAppCustomDesc] = useState(() => safeLocalStorage.getItem('app_custom_description') || 'Evolução Pessoal');
  const [appIconType, setAppIconType] = useState(() => safeLocalStorage.getItem('app_custom_icon_type') || 'default');
  const [appIconValue, setAppIconValue] = useState(() => safeLocalStorage.getItem('app_custom_icon_value') || '/pwa-icon.svg');
  const [showBrandSaved, setShowBrandSaved] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleSaveBrand = () => {
    safeLocalStorage.setItem('app_custom_name', appCustomName);
    safeLocalStorage.setItem('app_custom_description', appCustomDesc);
    safeLocalStorage.setItem('app_custom_icon_type', appIconType);
    safeLocalStorage.setItem('app_custom_icon_value', appIconValue);

    // Dispatch update notification for any system listener
    window.dispatchEvent(new CustomEvent('app-brand-updated'));
    haptics.success();
    setShowBrandSaved(true);
    setTimeout(() => setShowBrandSaved(false), 2500);
  };

  const handleBrandLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAppIconType('upload');
        setAppIconValue(reader.result as string);
        haptics.success();
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      haptics.error();
      setIsInstallModalOpen(true);
      return;
    }
    
    haptics.success();
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
  };

  useEffect(() => {
    const fetchAutoInfo = async () => {
      try {
        // Using Free IP API which is often more reliable for frontend calls
        const response = await fetch('https://freeipapi.com/api/json');
        if (!response.ok) throw new Error('Serviço de IP indisponível');
        const data = await response.json();
        
        setFormData(prev => ({
          ...prev,
          city: prev.city || data.cityName || '',
          ip: data.ipAddress || '',
          lastKnownLocation: prev.lastKnownLocation || {
            latitude: data.latitude,
            longitude: data.longitude,
            timestamp: Date.now()
          }
        }));
      } catch (error) {
        console.warn("Info automática: Não foi possível detectar o IP. Favor preencher manualmente se necessário.");
      }
    };

    fetchAutoInfo();
  }, []);

  // Sync state once user is loaded asynchronously in AuthContext
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        age: user.age || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        city: user.city || prev.city || '',
        ip: user.ip || prev.ip || '',
        lastKnownLocation: user.lastKnownLocation || prev.lastKnownLocation || null
      }));
    }
  }, [user]);

  const handleSave = () => {
    updateProfile(formData);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const updateLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocalização não é suportada pelo seu navegador.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLoc = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: Date.now()
        };
        setFormData(prev => ({ ...prev, lastKnownLocation: newLoc }));
        setIsLocating(false);
      },
      (error) => {
        console.error("Erro ao obter localização:", error);
        setIsLocating(false);
        alert("Não foi possível obter sua localização. Verifique as permissões.");
      }
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header Estilo Cockpit */}
      <header className="relative z-10 flex flex-col items-center justify-start pt-12 md:pt-16 px-4 md:px-10 text-center mb-16 md:mb-20">
        <div className="absolute top-8 left-8 md:top-12 md:left-12 flex items-center gap-4">
          {onToggleSidebar && (
            <button 
              onClick={onToggleSidebar}
              style={{ width: '80.3138px', height: '35.3138px', borderRadius: '10px' }}
              className="bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--surface-hover)] transition-all active:scale-95 backdrop-blur-2xl group shadow-xl"
              title="Menu"
            >
              <Menu size={18} className="text-[var(--muted)] group-hover:text-[var(--text)]" />
            </button>
          )}
          <button 
             onClick={() => navigate('/')}
             className="w-10 h-10 bg-[var(--surface)] border border-[var(--border)] rounded-xl flex items-center justify-center hover:bg-[var(--surface-hover)] transition-all active:scale-95 shadow-lg"
          >
            <ChevronLeft size={20} className="text-[var(--text)]" />
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mt-[42px]"
        >
          <div className="relative group mb-6">
            <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-[var(--text)]/10 bg-[var(--text)]/5 flex items-center justify-center relative shadow-2xl transition-transform group-hover:scale-105">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-[var(--text)]/20" />
              )}
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity backdrop-blur-sm">
                <Camera size={24} className="text-white mb-1" />
                <span className="text-[8px] font-bold text-white uppercase tracking-widest">Alterar Foto</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-[var(--bg)] flex items-center justify-center shadow-lg">
              <CheckCircle2 size={14} className="text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-light tracking-tight text-[var(--text)]">Identidade Pessoal</h1>
          <p className="text-[var(--text)]/40 text-xs uppercase tracking-[0.3em] mt-2">Personal Shell Interface</p>
        </motion.div>
      </header>

      <div className="max-w-3xl mx-auto p-6 space-y-12 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Informações Básicas */}
          <div className="space-y-8 bg-[var(--text)]/[0.02] border border-[var(--text)]/5 rounded-3xl p-8 backdrop-blur-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text)]/40 mb-6">Campos de Identidade</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--text)]/30 flex items-center gap-2">
                  <User size={12} /> Nome Completo
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-transparent border-b border-[var(--text)]/10 py-1 text-base focus:outline-none focus:border-[var(--text)]/40 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--text)]/30 flex items-center gap-2">
                  <Calendar size={12} /> Idade
                </label>
                <input
                  type="text"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full bg-transparent border-b border-[var(--text)]/10 py-1 text-base focus:outline-none focus:border-[var(--text)]/40 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--text)]/30 flex items-center gap-2">
                  <Globe size={12} /> Cidade
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-transparent border-b border-[var(--text)]/10 py-1 text-base focus:outline-none focus:border-[var(--text)]/40 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--text)]/30 flex items-center gap-2">
                  <Navigation size={12} /> IP do Dispositivo
                </label>
                <input
                  type="text"
                  readOnly
                  value={formData.ip}
                  className="w-full bg-transparent border-b border-[var(--text)]/5 py-1 text-sm text-[var(--text)]/40 focus:outline-none cursor-default font-mono"
                  placeholder="Detectando..."
                />
              </div>
            </div>
          </div>

          {/* Localização e Biografia */}
          <div className="space-y-8 bg-[var(--text)]/[0.02] border border-[var(--text)]/5 rounded-3xl p-8 backdrop-blur-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text)]/40 mb-6">Localização & Presença</h3>
            
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[var(--text)]/[0.03] border border-[var(--text)]/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[var(--text)]">Localização Real-time</p>
                      <p className="text-[9px] text-[var(--text)]/40">Sincronizar com GPS do aparelho</p>
                    </div>
                  </div>
                  <button 
                    onClick={updateLocation}
                    disabled={isLocating}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isLocating ? 'bg-[var(--text)]/10' : 'bg-[var(--text)] hover:bg-[var(--text)]/80 text-[var(--bg)] px-6 w-auto text-[9px] font-bold uppercase'}`}
                  >
                    {isLocating ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <Navigation size={14} />
                      </motion.div>
                    ) : 'Ativar'}
                  </button>
                </div>

                {formData.lastKnownLocation && (
                  <div className="pt-2 border-t border-[var(--text)]/5">
                    <div className="flex items-center justify-between text-[10px] text-[var(--text)]/60">
                      <span>Lat: {formData.lastKnownLocation.latitude.toFixed(4)}</span>
                      <span>Long: {formData.lastKnownLocation.longitude.toFixed(4)}</span>
                    </div>
                    <p className="text-[8px] text-[var(--text)]/30 mt-1 uppercase tracking-widest">
                      Última atualização: {new Date(formData.lastKnownLocation.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--text)]/30 flex items-center gap-2">
                  <FileText size={12} /> Biografia
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  className="w-full bg-transparent border border-[var(--text)]/10 rounded-xl p-3 text-sm focus:outline-none focus:border-[var(--text)]/40 transition-colors resize-none"
                  placeholder="Escreva algo sobre você..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mock Devices Section */}
        <div className="bg-[var(--text)]/[0.02] border border-[var(--text)]/5 rounded-3xl p-8 backdrop-blur-sm">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text)]/40 mb-6 flex items-center gap-2">
            <Globe size={14} className="text-emerald-500" /> Dispositivos Conectados (Shell Presence)
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <Navigation size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--text)]">Este Dispositivo (Web Shell)</p>
                  <p className="text-[10px] text-[var(--text)]/40">{formData.city || 'São Paulo, Brasil'} • Ativo agora</p>
                </div>
              </div>
              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest px-2 py-1 rounded bg-emerald-500/10">Sessão Atual</span>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--text)]/[0.02] border border-[var(--text)]/5 opacity-40">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--text)]/10 flex items-center justify-center text-[var(--text)]/40">
                  <Globe size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--text)]">Cloud Instance (Replica)</p>
                  <p className="text-[10px] text-[var(--text)]/40">Remote Server • Há 2 horas</p>
                </div>
              </div>
              <span className="text-[8px] font-bold text-[var(--text)]/20 uppercase tracking-widest">Inativo</span>
            </div>
          </div>
        </div>

        {/* CUSTOM WHITE LABEL APP BRANDING SECTION */}
        <div className="bg-[var(--text)]/[0.02] border border-[var(--text)]/5 rounded-3xl p-8 backdrop-blur-sm space-y-8">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400 mb-2 flex items-center gap-2">
              <Palette size={14} /> Customização do Aplicativo (Estilo WordPress / Elementor)
            </h3>
            <p className="text-xs text-[var(--text)]/50 font-light">
              Envie sua própria imagem da galeria, escolha o nome do aplicativo e sua descrição para personalizar de forma completa toda a experiência.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--text)]/30 flex items-center gap-2">
                Nome do Aplicativo
              </label>
              <input
                type="text"
                value={appCustomName}
                onChange={(e) => setAppCustomName(e.target.value)}
                placeholder="Ex: Remix 1.7"
                className="w-full bg-transparent border-b border-[var(--text)]/10 py-1.5 text-base focus:outline-none focus:border-[var(--text)]/40 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--text)]/30 flex items-center gap-2">
                Lema / Descrição do Negócio
              </label>
              <input
                type="text"
                value={appCustomDesc}
                onChange={(e) => setAppCustomDesc(e.target.value)}
                placeholder="Ex: Evolução Pessoal"
                className="w-full bg-transparent border-b border-[var(--text)]/10 py-1.5 text-base focus:outline-none focus:border-[var(--text)]/40 transition-colors"
              />
            </div>
          </div>

          {/* WordPress Style Image Uploader Box */}
          <div className="space-y-3">
            <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--text)]/30 block">
              Logotipo do Aplicativo (Favicon da Aba)
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Left custom upload click/drop zone */}
              <div 
                onClick={() => logoInputRef.current?.click()}
                className="md:col-span-2 border-2 border-dashed border-[var(--text)]/15 hover:border-violet-500/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-violet-500/[0.01] transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--text)]/5 flex items-center justify-center text-[var(--text)]/45 group-hover:scale-110 group-hover:bg-violet-500/10 group-hover:text-violet-500 transition-all">
                  <Upload size={18} />
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-[var(--text)]/70">Fazer upload de imagem da galeria</p>
                  <p className="text-[10px] text-[var(--text)]/30 mt-1">PNG, SVG, JPG, ICO (Máx. 5MB) para a aba do sistema</p>
                </div>
                
                <input 
                  ref={logoInputRef}
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleBrandLogoChange} 
                />
              </div>

              {/* Real-time logo view and remove button */}
              <div className="flex flex-col items-center justify-center bg-[var(--text)]/[0.01] border border-[var(--text)]/5 rounded-2xl p-4 min-h-[140px] text-center">
                <span className="text-[8px] font-bold uppercase text-[var(--text)]/20 tracking-wider mb-2 block">Seu Logotipo</span>
                <div className="w-16 h-16 rounded-xl border border-[var(--text)]/10 bg-[var(--text)]/5 flex items-center justify-center overflow-hidden shadow-md">
                  {appIconValue ? (
                    appIconType === 'emoji' ? (
                      <span className="text-3xl">{appIconValue}</span>
                    ) : (
                      <img src={appIconValue} alt="App Logo" className="w-full h-full object-contain" />
                    )
                  ) : (
                    <Image size={24} className="text-[var(--text)]/20" />
                  )}
                </div>
                {appIconValue && appIconValue !== '/pwa-icon.svg' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAppIconType('default');
                      setAppIconValue('/pwa-icon.svg');
                      haptics.close();
                    }}
                    className="mt-3 flex items-center gap-1.5 text-[9px] text-red-500 hover:text-red-400 font-bold uppercase tracking-wider"
                  >
                    <Trash2 size={10} /> Remover
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Visual Browser Tab Simulation Preview */}
          <div className="space-y-3 pt-2">
            <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--text)]/30 block">
              Visualização da Aba do Navegador (Mockup Real-Time)
            </span>
            <div className="bg-[#18181b] border border-white/5 rounded-2xl p-4 overflow-hidden shadow-lg select-none">
              {/* Browser control bar */}
              <div className="flex items-center gap-1.5 pb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                <div className="w-4" />
                
                {/* Simulated Address Bar Tab */}
                <div className="flex items-center gap-2 bg-[#27272a] px-3 py-1.5 rounded-t-xl text-white/90 text-xs font-medium w-48 truncate border-t border-x border-white/5 relative">
                  <div className="w-4 h-4 rounded overflow-hidden flex items-center justify-center shrink-0 bg-white/5">
                    {appIconValue ? (
                      appIconType === 'emoji' ? (
                        <span className="text-xs">{appIconValue}</span>
                      ) : (
                        <img src={appIconValue} alt="Favicon" className="w-full h-full object-contain" />
                      )
                    ) : (
                      <Globe size={11} className="text-white/40" />
                    )}
                  </div>
                  <span className="truncate text-[10px] md:text-xs text-white">
                    {appCustomName || 'Sem nome'}
                  </span>
                  <div className="absolute right-2 text-white/20 text-[9px] font-bold">×</div>
                </div>
              </div>
              {/* Virtual URL address field */}
              <div className="bg-[#27272a] rounded-lg px-3 py-1 flex items-center text-white/40 text-[10px] font-mono leading-none">
                <span className="text-emerald-500 mr-1.5">🔒</span>
                <span>https://localhost:3000/</span>
                <span className="text-white/80 font-semibold truncate">app/{appCustomName.toLowerCase().replace(/\s+/g, '-')}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-[var(--text)]/5">
            <span className="text-[10px] text-emerald-500 flex items-center gap-2 transition-all">
              {showBrandSaved ? (
                <>
                  <CheckCircle2 size={14} className="animate-pulse" />
                  <span className="font-semibold">Branding aplicado e atualizado em tempo real!</span>
                </>
              ) : (
                <span className="text-[9px] text-[var(--text)]/30 uppercase tracking-[0.2em] font-light">Visualização ao vivo no navegador integrada</span>
              )}
            </span>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setAppCustomName('Remix 1.7');
                  setAppCustomDesc('Evolução Pessoal');
                  setAppIconType('default');
                  setAppIconValue('/pwa-icon.svg');
                  haptics.close();
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--text)]/10 text-[9px] font-black uppercase tracking-wider text-[var(--text)]/40 hover:text-[var(--text)] hover:border-[var(--text)]/35 active:scale-95 transition-all w-1/2 sm:w-auto"
                title="Resetar Configurações"
              >
                <RotateCcw size={12} /> Reset
              </button>

              <button
                type="button"
                onClick={handleSaveBrand}
                className="flex items-center justify-center gap-2 bg-violet-600 text-white hover:bg-violet-500 px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-violet-600/10 active:scale-95 transition-all w-1/2 sm:w-auto"
              >
                <Save size={12} /> Aplicar Marca
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-8 bg-[var(--text)]/[0.01] border border-[var(--text)]/5 rounded-3xl">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: showSaved ? 1 : 0, x: showSaved ? 0 : -10 }}
            className="flex items-center gap-2 text-emerald-500 text-xs font-medium"
          >
            <CheckCircle2 size={16} />
            <span>Dados sincronizados com o ambiente local</span>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="w-full md:w-auto bg-[var(--text)] text-[var(--bg)] px-6 md:px-12 py-3 md:py-4 rounded-xl flex items-center justify-center gap-3 text-[10px] md:text-sm font-black uppercase tracking-widest shadow-xl shadow-[var(--text)]/20 transition-all hover:shadow-2xl"
          >
            <Save size={18} className="w-4 h-4 md:w-[18px] md:h-[18px]" />
            Sincronizar Perfil
          </motion.button>
        </div>

        {/* PWA INSTALL SECTION */}
        <AnimatePresence>
          {!isInstalled && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-8"
            >
              <button 
                onClick={handleInstallClick}
                className="w-full relative group overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-zinc-900 to-black border border-white/10 p-8 shadow-2xl transition-all hover:scale-[1.01] active:scale-95 text-left"
              >
                {/* Glow Effect */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="relative z-10 flex items-center justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-violet-400 border border-white/5 group-hover:bg-violet-500 group-hover:text-white transition-all transform group-hover:rotate-12">
                        <Smartphone size={18} />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Performance Nativa</span>
                    </div>
                    
                    <h3 className="text-lg md:text-xl font-light text-white leading-tight">
                      Instalar <span className="font-bold italic text-violet-400">{appCustomName}</span> no dispositivo
                    </h3>
                    
                    <p className="text-[10px] md:text-xs text-white/40 font-light leading-relaxed max-w-sm">
                      {appCustomDesc || 'Identidade estratégica com zero latência e notificações em tempo real.'}
                    </p>
                  </div>
                  
                  <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-white/10 group-hover:bg-white text-black transition-all">
                    <Download size={20} className="group-hover:animate-bounce" />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              
              <div className="mt-4 flex justify-center">
                <span className="text-[9px] uppercase tracking-[0.4em] text-white/10 flex items-center gap-2">
                  <Sparkles size={8} /> Disponível para iOS, Android e Desktop
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <PWAInstallModal isOpen={isInstallModalOpen} onClose={() => setIsInstallModalOpen(false)} />

        <div className="text-center space-y-2">
          <p className="text-[9px] uppercase tracking-[0.5em] font-black italic text-[var(--text)]/20 underline decoration-[var(--text)]/10 underline-offset-8">
            Privacy Enforcement & Local Data Encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
