import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Link as LinkIcon, ExternalLink, Palette, Check, Type, Brush, Image as ImageIcon, ImagePlus, Smile, Upload, Search, GripVertical } from 'lucide-react';

interface HighlightModalProps {
  onSelect: (color: string, isGradient: boolean) => void;
  onClose: () => void;
}

export const HighlightModal = ({ onSelect, onClose }: HighlightModalProps) => {
  const sections = [
    {
      title: 'Básicas',
      colors: [
        { color: '#ef4444' }, { color: '#f97316' }, { color: '#f59e0b' }, { color: '#10b981' },
        { color: '#3b82f6' }, { color: '#6366f1' }, { color: '#8b5cf6' }, { color: '#ec4899' },
      ]
    },
    {
      title: 'Pastel',
      colors: [
        { color: '#fecaca' }, { color: '#fed7aa' }, { color: '#fef3c7' }, { color: '#d1fae5' },
        { color: '#dbeafe' }, { color: '#e0e7ff' }, { color: '#ede9fe' }, { color: '#fce7f3' },
      ]
    },
    {
      title: 'Neon',
      colors: [
        { color: '#ff0000' }, { color: '#ffea00' }, { color: '#00ff00' }, { color: '#00ffff' },
        { color: '#0000ff' }, { color: '#ff00ff' }, { color: '#7cfc00' }, { color: '#ff1493' },
      ]
    },
    {
      title: 'Gradientes',
      colors: [
        { color: 'linear-gradient(90deg, #ff9a9e 0%, #fad0c4 100%)', isGradient: true },
        { color: 'linear-gradient(90deg, #a18cd1 0%, #fbc2eb 100%)', isGradient: true },
        { color: 'linear-gradient(90deg, #84fab0 0%, #8fd3f4 100%)', isGradient: true },
        { color: 'linear-gradient(90deg, #a6c0fe 0%, #f68084 100%)', isGradient: true },
        { color: 'linear-gradient(90deg, #7C5CFF 0%, #FF5C8A 100%)', isGradient: true },
        { color: 'linear-gradient(90deg, #00c6ff 0%, #0072ff 100%)', isGradient: true },
        { color: 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)', isGradient: true },
        { color: 'linear-gradient(90deg, #5eeff5 0%, #4568dc 100%)', isGradient: true },
      ]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="rounded-2xl shadow-2xl w-full max-w-[320px] overflow-hidden border transition-colors duration-300"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Palette size={18} className="text-[var(--primary)]" />
            <h3 className="font-semibold" style={{ color: 'var(--text)' }}>Marca-texto</h3>
          </div>
          <button onClick={onClose} className="transition-colors" style={{ color: 'var(--muted)' }}>
            <X size={20} />
          </button>
        </div>
        <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto no-scrollbar">
          {sections.map((section) => (
            <div key={section.title} className="space-y-2">
              <h4 className="text-[10px] uppercase tracking-widest font-bold px-1" style={{ color: 'var(--muted)' }}>{section.title}</h4>
              <div className="grid grid-cols-4 gap-2">
                {section.colors.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelect(item.color, !!item.isGradient)}
                    className="w-full aspect-square rounded-lg border hover:scale-110 transition-transform shadow-inner overflow-hidden"
                    style={{ background: item.color, borderColor: 'var(--border)' }}
                  />
                ))}
              </div>
            </div>
          ))}
          <div className="h-px my-2" style={{ backgroundColor: 'var(--border)' }} />
          <button
            onClick={() => onSelect('', false)}
            className="flex items-center gap-3 p-3 rounded-xl transition-all group text-left w-full hover:bg-[var(--surface-hover)]"
            style={{ backgroundColor: 'transparent' }}
          >
            <div className="w-8 h-8 rounded-lg border border-dashed flex items-center justify-center" style={{ borderColor: 'var(--border)' }}>
              <X size={14} style={{ color: 'var(--muted)' }} />
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Remover destaque</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface TextColorModalProps {
  onSelect: (color: string) => void;
  onClose: () => void;
}

export const TextColorModal = ({ onSelect, onClose }: TextColorModalProps) => {
  const colors = [
    '#ffffff', '#d4d4d8', '#a1a1aa', '#71717a', '#3f3f46', '#18181b', '#000000', '#52525b',
    '#ef4444', '#f87171', '#f97316', '#fb923c', '#f59e0b', '#fbbf24', '#10b981', '#34d399',
    '#3b82f6', '#60a5fa', '#6366f1', '#818cf8', '#8b5cf6', '#a78bfa', '#ec4899', '#f472b6',
    '#7C5CFF', '#FF5C8A', '#00ff00', '#00ffff', '#06b6d4', '#84cc16', '#eab308', '#d946ef'
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="rounded-2xl shadow-2xl w-full max-w-[280px] overflow-hidden border transition-colors duration-300"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Type size={18} className="text-[var(--primary)]" />
            <h3 className="font-semibold" style={{ color: 'var(--text)' }}>Cor do Texto</h3>
          </div>
          <button onClick={onClose} className="transition-colors" style={{ color: 'var(--muted)' }}>
            <X size={20} />
          </button>
        </div>
        <div className="p-4 max-h-[320px] overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-4 gap-3">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => onSelect(color)}
                className="w-full aspect-square rounded-full border hover:scale-110 transition-transform shadow-inner"
                style={{ backgroundColor: color, borderColor: 'var(--border)' }}
              />
            ))}
          </div>
          <div className="h-px my-4" style={{ backgroundColor: 'var(--border)' }} />
          <button
            onClick={() => onSelect('')}
            className="flex items-center gap-3 p-3 rounded-xl transition-all group text-left w-full hover:bg-[var(--surface-hover)]"
          >
            <div className="w-8 h-8 rounded-lg border border-dashed flex items-center justify-center" style={{ borderColor: 'var(--border)' }}>
              <X size={14} style={{ color: 'var(--muted)' }} />
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Remover cor</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface LinkModalProps {
  onSelect: (data: { url: string; text: string; color: string; openInNewTab: boolean }) => void;
  onClose: () => void;
  initialData?: { url: string; text: string };
}

export const LinkModal = ({ onSelect, onClose, initialData }: LinkModalProps) => {
  const [url, setUrl] = useState(initialData?.url || '');
  const [text, setText] = useState(initialData?.text || '');
  const [color, setColor] = useState('#7C5CFF');
  const [openInNewTab, setOpenInNewTab] = useState(true);

  const linkColors = [
    { name: 'Roxo', value: '#7C5CFF' },
    { name: 'Azul', value: '#3B82F6' },
    { name: 'Verde', value: '#10B981' },
    { name: 'Rosa', value: '#EC4899' },
    { name: 'Branco', value: '#FFFFFF' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      onSelect({ url, text: text || url, color, openInNewTab });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border transition-colors duration-300"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <LinkIcon size={18} className="text-[var(--primary)]" />
            <h3 className="font-semibold" style={{ color: 'var(--text)' }}>Inserir Link</h3>
          </div>
          <button onClick={onClose} className="transition-colors" style={{ color: 'var(--muted)' }}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Texto de exibição</label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ex: Clique aqui"
                className="w-full rounded-xl px-4 py-3 outline-none transition-all text-base"
                style={{ 
                  backgroundColor: 'var(--surface-hover)', 
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  boxShadow: 'var(--shadow)'
                }}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>URL do Link</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://exemplo.com"
                className="w-full rounded-xl px-4 py-3 outline-none transition-all text-base"
                style={{ 
                  backgroundColor: 'var(--surface-hover)', 
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  boxShadow: 'var(--shadow)'
                }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Cor do Link</label>
            <div className="flex gap-3">
              {linkColors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${color === c.value ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  style={{ backgroundColor: c.value }}
                >
                  {color === c.value && <Check size={14} className={c.value === '#FFFFFF' ? 'text-black' : 'text-white'} />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border" style={{ backgroundColor: 'var(--surface-hover)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <ExternalLink size={18} style={{ color: 'var(--muted)' }} />
              <span className="text-sm" style={{ color: 'var(--text)' }}>Abrir em nova aba</span>
            </div>
            <button
              type="button"
              onClick={() => setOpenInNewTab(!openInNewTab)}
              className={`w-10 h-5 rounded-full transition-colors relative ${openInNewTab ? 'bg-[var(--primary)]' : 'bg-zinc-700'}`}
              style={{ backgroundColor: openInNewTab ? 'var(--primary)' : 'var(--muted)' }}
            >
              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${openInNewTab ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl font-medium transition-colors"
              style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--muted)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!url}
              className="flex-2 px-6 py-3 rounded-xl text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--primary)', boxShadow: 'var(--shadow)' }}
            >
              Confirmar Link
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

interface CoverModalProps {
  onSelect: (url: string) => void;
  onClose: () => void;
  onRemove?: () => void;
  onReposition?: () => void;
  hasCover?: boolean;
}

export const CoverModal = ({ onSelect, onClose, onRemove, onReposition, hasCover }: CoverModalProps) => {
  const categories = [
    {
      title: 'Gradientes',
      items: [
        'https://picsum.photos/seed/grad1/1920/1080',
        'https://picsum.photos/seed/grad2/1920/1080',
        'https://picsum.photos/seed/grad3/1920/1080',
        'https://picsum.photos/seed/grad4/1920/1080',
      ]
    },
    {
      title: 'Abstrato',
      items: [
        'https://picsum.photos/seed/abs1/1920/1080',
        'https://picsum.photos/seed/abs2/1920/1080',
        'https://picsum.photos/seed/abs3/1920/1080',
        'https://picsum.photos/seed/abs4/1920/1080',
      ]
    },
    {
      title: 'Natureza',
      items: [
        'https://picsum.photos/seed/nat1/1920/1080',
        'https://picsum.photos/seed/nat2/1920/1080',
        'https://picsum.photos/seed/nat3/1920/1080',
        'https://picsum.photos/seed/nat4/1920/1080',
      ]
    },
    {
      title: 'Minimal',
      items: [
        'https://picsum.photos/seed/min1/1920/1080',
        'https://picsum.photos/seed/min2/1920/1080',
        'https://picsum.photos/seed/min3/1920/1080',
        'https://picsum.photos/seed/min4/1920/1080',
      ]
    }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onSelect(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border transition-colors duration-300"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <ImagePlus size={18} className="text-[var(--primary)]" />
            <h3 className="font-semibold" style={{ color: 'var(--text)' }}>Capa do Documento</h3>
          </div>
          <button onClick={onClose} className="transition-colors" style={{ color: 'var(--muted)' }}>
            <X size={20} />
          </button>
        </div>
        <div className="p-4 space-y-6 max-h-[500px] overflow-y-auto no-scrollbar">
          <div className="space-y-4">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-[var(--surface-hover)] transition-all" style={{ borderColor: 'var(--border)' }}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload size={24} className="mb-2" style={{ color: 'var(--muted)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Upload de imagem</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>PNG, JPG ou GIF</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
          </div>

          {categories.map((cat) => (
            <div key={cat.title} className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest px-1" style={{ color: 'var(--muted)' }}>{cat.title}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {cat.items.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelect(url)}
                    className="aspect-video rounded-lg border overflow-hidden hover:scale-105 transition-transform shadow-sm"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <img src={url} alt={cat.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>
          ))}

          {hasCover && (
            <div className="pt-2 space-y-2">
              <div className="h-px mb-4" style={{ backgroundColor: 'var(--border)' }} />
              <div className="grid grid-cols-2 gap-3">
                {onReposition && (
                  <button
                    onClick={onReposition}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl transition-all hover:bg-[var(--surface-hover)] border"
                    style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                  >
                    <GripVertical size={16} />
                    <span className="text-sm font-medium">Reposicionar</span>
                  </button>
                )}
                {onRemove && (
                  <button
                    onClick={onRemove}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl transition-all hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
                    style={{ color: '#ef4444' }}
                  >
                    <X size={16} />
                    <span className="text-sm font-medium">Remover capa</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

interface IconModalProps {
  onSelect: (icon: string) => void;
  onClose: () => void;
  onRemove?: () => void;
  hasIcon?: boolean;
}

export const IconModal = ({ onSelect, onClose, onRemove, hasIcon }: IconModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const icons3D = [
    // --- COLORFUL / PLAYFUL ---
    { name: 'Foguete', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Rocket/3D/rocket_3d.png' },
    { name: 'Fogo', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Fire/3D/fire_3d.png' },
    { name: 'Coração', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Heart%20suit/3D/heart_suit_3d.png' },
    { name: 'Estrela', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Star/3D/star_3d.png' },
    { name: 'Lâmpada', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Light%20bulb/3D/light_bulb_3d.png' },
    { name: 'Robô', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Robot/3D/robot_3d.png' },
    { name: 'Alien', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Alien/3D/alien_3d.png' },
    { name: 'Unicórnio', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Unicorn/3D/unicorn_3d.png' },
    { name: 'Arco-íris', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Rainbow/3D/rainbow_3d.png' },
    { name: 'Festa', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Party%20popper/3D/party_popper_3d.png' },
    { name: 'Bolo', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Birthday%20cake/3D/birthday_cake_3d.png' },
    { name: 'Pizza', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Pizza/3D/pizza_3d.png' },
    { name: 'Hambúrguer', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Hamburger/3D/hamburger_3d.png' },
    { name: 'Sorvete', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Soft%20serve/3D/soft_serve_3d.png' },
    { name: 'Café', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Hot%20beverage/3D/hot_beverage_3d.png' },
    { name: 'Cerveja', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Beer%20mug/3D/beer_mug_3d.png' },
    { name: 'Vinho', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Wine%20glass/3D/wine_glass_3d.png' },
    { name: 'Donut', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Doughnut/3D/doughnut_3d.png' },
    { name: 'Melancia', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Watermelon/3D/watermelon_3d.png' },
    { name: 'Morango', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Strawberry/3D/strawberry_3d.png' },
    
    // --- SERIOUS / PROFESSIONAL / MONOCHROMATIC VIBE ---
    { name: 'Pasta', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/File%20folder/3D/file_folder_3d.png' },
    { name: 'Documento', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Page%20facing%20up/3D/page_facing_up_3d.png' },
    { name: 'Calendário', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Calendar/3D/calendar_3d.png' },
    { name: 'Relógio', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Alarm%20clock/3D/alarm_clock_3d.png' },
    { name: 'Cadeado', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Locked/3D/locked_3d.png' },
    { name: 'Chave', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Key/3D/key_3d.png' },
    { name: 'Maleta', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Briefcase/3D/briefcase_3d.png' },
    { name: 'Gráfico', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Chart%20increasing/3D/chart_increasing_3d.png' },
    { name: 'Escudo', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Shield/3D/shield_3d.png' },
    { name: 'Engrenagem', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Gear/3D/gear_3d.png' },
    { name: 'Martelo', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Hammer/3D/hammer_3d.png' },
    { name: 'Caneta', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Pen/3D/pen_3d.png' },
    { name: 'Lápis', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Pencil/3D/pencil_3d.png' },
    { name: 'Clip', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Paperclip/3D/paperclip_3d.png' },
    { name: 'Lupa', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Magnifying%20glass%20tilted%20left/3D/magnifying_glass_tilted_left_3d.png' },
    { name: 'Bússola', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Compass/3D/compass_3d.png' },
    { name: 'Mapa', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/World%20map/3D/world_map_3d.png' },
    { name: 'Globo', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Globe%20showing%20Americas/3D/globe_showing_americas_3d.png' },
    { name: 'Dinheiro', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Money%20bag/3D/money_bag_3d.png' },
    { name: 'Moeda', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Coin/3D/coin_3d.png' },
    { name: 'Cartão', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Credit%20card/3D/credit_card_3d.png' },
    { name: 'Laptop', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Laptop/3D/laptop_3d.png' },
    { name: 'Desktop', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Desktop%20computer/3D/desktop_computer_3d.png' },
    { name: 'Smartphone', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Mobile%20phone/3D/mobile_phone_3d.png' },
    { name: 'Teclado', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Keyboard/3D/keyboard_3d.png' },
    { name: 'Mouse', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Computer%20mouse/3D/computer_mouse_3d.png' },
    { name: 'Impressora', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Printer/3D/printer_3d.png' },
    
    // --- TECH / DIGITAL ---
    { name: 'Nuvem', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Cloud/3D/cloud_3d.png' },
    { name: 'Raio', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/High%20voltage/3D/high_voltage_3d.png' },
    { name: 'Wifi', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Antenna%20bars/3D/antenna_bars_3d.png' },
    { name: 'Bateria', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Battery/3D/battery_3d.png' },
    { name: 'Satélite', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Satellite/3D/satellite_3d.png' },
    { name: 'Telescópio', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Telescope/3D/telescope_3d.png' },
    { name: 'Microscópio', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Microscope/3D/microscope_3d.png' },
    { name: 'DNA', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/DNA/3D/dna_3d.png' },
    
    // --- NATURE / ANIMALS ---
    { name: 'Árvore', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Evergreen%20tree/3D/evergreen_tree_3d.png' },
    { name: 'Flor', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Blossom/3D/blossom_3d.png' },
    { name: 'Sol', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Sun/3D/sun_3d.png' },
    { name: 'Lua', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Crescent%20moon/3D/crescent_moon_3d.png' },
    { name: 'Terra', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Globe%20showing%20Europe-Africa/3D/globe_showing_europe-africa_3d.png' },
    { name: 'Gato', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Cat%20face/3D/cat_face_3d.png' },
    { name: 'Cachorro', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Dog%20face/3D/dog_face_3d.png' },
    { name: 'Leão', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Lion/3D/lion_3d.png' },
    { name: 'Tigre', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Tiger%20face/3D/tiger_face_3d.png' },
    { name: 'Urso', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Bear/3D/bear_3d.png' },
    { name: 'Panda', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Panda/3D/panda_3d.png' },
    { name: 'Coelho', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Rabbit%20face/3D/rabbit_face_3d.png' },
    { name: 'Macaco', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Monkey%20face/3D/monkey_face_3d.png' },
    { name: 'Pássaro', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Bird/3D/bird_3d.png' },
    { name: 'Peixe', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Fish/3D/fish_3d.png' },
    { name: 'Baleia', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Whale/3D/whale_3d.png' },
    { name: 'Borboleta', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Butterfly/3D/butterfly_3d.png' },
    { name: 'Abelha', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Honeybee/3D/honeybee_3d.png' },
    
    // --- TRAVEL / PLACES ---
    { name: 'Avião', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Airplane/3D/airplane_3d.png' },
    { name: 'Navio', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Ship/3D/ship_3d.png' },
    { name: 'Trem', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Bullet%20train/3D/bullet_train_3d.png' },
    { name: 'Carro', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Automobile/3D/automobile_3d.png' },
    { name: 'Bicicleta', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Bicycle/3D/bicycle_3d.png' },
    { name: 'Casa', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/House/3D/house_3d.png' },
    { name: 'Prédio', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Office%20building/3D/office_building_3d.png' },
    { name: 'Hospital', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Hospital/3D/hospital_3d.png' },
    { name: 'Escola', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/School/3D/school_3d.png' },
    { name: 'Banco', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Bank/3D/bank_3d.png' },
    { name: 'Montanha', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Mountain/3D/mountain_3d.png' },
    { name: 'Praia', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Beach%20with%20umbrella/3D/beach_with_umbrella_3d.png' },
    { name: 'Ilha', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Desert%20island/3D/desert_island_3d.png' },
    { name: 'Camping', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Tent/3D/tent_3d.png' },
    
    // --- OBJECTS / MISC ---
    { name: 'Câmera', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Camera/3D/camera_3d.png' },
    { name: 'Vídeo', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Video%20camera/3D/video_camera_3d.png' },
    { name: 'Microfone', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Microphone/3D/microphone_3d.png' },
    { name: 'Fone', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Headphone/3D/headphone_3d.png' },
    { name: 'Televisão', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Television/3D/television_3d.png' },
    { name: 'Rádio', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Radio/3D/radio_3d.png' },
    { name: 'Livro', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Open%20book/3D/open_book_3d.png' },
    { name: 'Troféu', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Trophy/3D/trophy_3d.png' },
    { name: 'Medalha', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/1st%20place%20medal/3D/1st_place_medal_3d.png' },
    { name: 'Presente', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Wrapped%20gift/3D/wrapped_gift_3d.png' },
    { name: 'Mala', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Luggage/3D/luggage_3d.png' },
    { name: 'Guarda-chuva', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Umbrella/3D/umbrella_3d.png' },
    { name: 'Lanterna', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Flashlight/3D/flashlight_3d.png' },
    { name: 'Ferramentas', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Hammer%20and%20wrench/3D/hammer_and_wrench_3d.png' },
    { name: 'Extintor', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Fire%20extinguisher/3D/fire_extinguisher_3d.png' },
    { name: 'Lixo', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Wastebasket/3D/wastebasket_3d.png' },
    
    // --- SYMBOLS / SHAPES ---
    { name: 'Check', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Check%20mark%20button/3D/check_mark_button_3d.png' },
    { name: 'X', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Cross%20mark/3D/cross_mark_3d.png' },
    { name: 'Alerta', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Warning/3D/warning_3d.png' },
    { name: 'Info', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Information/3D/information_3d.png' },
    { name: 'Pergunta', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Question%20mark/3D/question_mark_3d.png' },
    { name: 'Alvo', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Direct%20hit/3D/direct_hit_3d.png' },
    { name: 'Link', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Link/3D/link_3d.png' },
    { name: 'Coração Vermelho', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Red%20heart/3D/red_heart_3d.png' },
    { name: 'Coração Azul', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Blue%20heart/3D/blue_heart_3d.png' },
    { name: 'Coração Verde', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Green%20heart/3D/green_heart_3d.png' },
    { name: 'Coração Amarelo', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Yellow%20heart/3D/yellow_heart_3d.png' },
    { name: 'Coração Roxo', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Purple%20heart/3D/purple_heart_3d.png' },
    
    // --- MONOCHROMATIC / SERIOUS (FLAT STYLE) ---
    { name: 'Pasta Flat', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/File%20folder/Flat/file_folder_flat.png' },
    { name: 'Documento Flat', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Page%20facing%20up/Flat/page_facing_up_flat.png' },
    { name: 'Calendário Flat', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Calendar/Flat/calendar_flat.png' },
    { name: 'Relógio Flat', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Alarm%20clock/Flat/alarm_clock_flat.png' },
    { name: 'Cadeado Flat', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Locked/Flat/locked_flat.png' },
    { name: 'Chave Flat', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Key/Flat/key_flat.png' },
    { name: 'Engrenagem Flat', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Gear/Flat/gear_flat.png' },
    { name: 'Escudo Flat', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Shield/Flat/shield_flat.png' },
    { name: 'Lupa Flat', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Magnifying%20glass%20tilted%20left/Flat/magnifying_glass_tilted_left_flat.png' },
    { name: 'Maleta Flat', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Briefcase/Flat/briefcase_flat.png' },
    
    // --- SMILEYS / FACES ---
    { name: 'Sorriso', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Smiling%20face%20with%20smiling%20eyes/3D/smiling_face_with_smiling_eyes_3d.png' },
    { name: 'Piscada', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Winking%20face/3D/winking_face_3d.png' },
    { name: 'Óculos', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Smiling%20face%20with%20sunglasses/3D/smiling_face_with_sunglasses_3d.png' },
    { name: 'Pensativo', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Thinking%20face/3D/thinking_face_3d.png' },
    { name: 'Legal', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Sign%20of%20the%20horns/3D/sign_of_the_horns_3d.png' },
    { name: 'Joinha', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Thumbs%20up/3D/thumbs_up_3d.png' },
    { name: 'Aplauso', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Clapping%20hands/3D/clapping_hands_3d.png' },
    { name: 'Paz', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Victory%20hand/3D/victory_hand_3d.png' },
    { name: 'Oração', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Folded%20hands/3D/folded_hands_3d.png' },
    { name: 'Músculo', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Flexed%20biceps/3D/flexed_biceps_3d.png' },
    
    // --- MORE OBJECTS ---
    { name: 'Diamante', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Gem%20stone/3D/gem_stone_3d.png' },
    { name: 'Anel', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Ring/3D/ring_3d.png' },
    { name: 'Coroa', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Crown/3D/crown_3d.png' },
    { name: 'Cartola', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Top%20hat/3D/top_hat_3d.png' },
    { name: 'Óculos de Grau', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Glasses/3D/glasses_3d.png' },
    { name: 'Mochila', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Backpack/3D/backpack_3d.png' },
    { name: 'Sapato', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Running%20shoe/3D/running_shoe_3d.png' },
    { name: 'Camiseta', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/T-shirt/3D/t-shirt_3d.png' },
    { name: 'Batom', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Lipstick/3D/lipstick_3d.png' },
    { name: 'Espelho', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Mirror/3D/mirror_3d.png' },
    { name: 'Cama', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Bed/3D/bed_3d.png' },
    { name: 'Cadeira', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Chair/3D/chair_3d.png' },
    { name: 'Sofá', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Couch%20and%20lamp/3D/couch_and_lamp_3d.png' },
    { name: 'Privada', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Toilet/3D/toilet_3d.png' },
    { name: 'Chuveiro', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Shower/3D/shower_3d.png' },
    { name: 'Banheira', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Bathtub/3D/bathtub_3d.png' },
    { name: 'Sabonete', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Soap/3D/soap_3d.png' },
    { name: 'Esponja', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Sponge/3D/sponge_3d.png' },
    { name: 'Vassoura', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Broom/3D/broom_3d.png' },
    { name: 'Cesto', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Basket/3D/basket_3d.png' },
    
    // --- SPORTS / HOBBIES ---
    { name: 'Futebol', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Soccer%20ball/3D/soccer_ball_3d.png' },
    { name: 'Basquete', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Basketball/3D/basketball_3d.png' },
    { name: 'Tênis', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Tennis/3D/tennis_3d.png' },
    { name: 'Vôlei', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Volleyball/3D/volleyball_3d.png' },
    { name: 'Boxe', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Boxing%20glove/3D/boxing_glove_3d.png' },
    { name: 'Skate', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Skateboard/3D/skateboard_3d.png' },
    { name: 'Pesca', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Fishing%20pole/3D/fishing_pole_3d.png' },
    { name: 'Guitarra', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Guitar/3D/guitar_3d.png' },
    { name: 'Piano', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Musical%20keyboard/3D/musical_keyboard_3d.png' },
    { name: 'Saxofone', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Saxophone/3D/saxophone_3d.png' },
    { name: 'Violino', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Violin/3D/violin_3d.png' },
    { name: 'Tambor', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Drum/3D/drum_3d.png' },
    { name: 'Pincel', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Artist%20palette/3D/artist_palette_3d.png' },
    { name: 'Cinema', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Movie%20camera/3D/movie_camera_3d.png' },
    { name: 'Joystick', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Video%20game/3D/video_game_3d.png' },
    { name: 'Dados', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Game%20die/3D/game_die_3d.png' },
    { name: 'Cartas', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Joker/3D/joker_3d.png' },
    { name: 'Xadrez', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Chess%20pawn/3D/chess_pawn_3d.png' },
    
    // --- WEATHER ---
    { name: 'Nuvem Chuva', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Cloud%20with%20rain/3D/cloud_with_rain_3d.png' },
    { name: 'Nuvem Neve', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Cloud%20with%20snow/3D/cloud_with_snow_3d.png' },
    { name: 'Nuvem Raio', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Cloud%20with%20lightning/3D/cloud_with_lightning_3d.png' },
    { name: 'Tornado', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Tornado/3D/tornado_3d.png' },
    { name: 'Vento', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Wind%20face/3D/wind_face_3d.png' },
    { name: 'Gelo', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Ice/3D/ice_3d.png' },
    { name: 'Gotas', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Droplet/3D/droplet_3d.png' },
    { name: 'Onda', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Water%20wave/3D/water_wave_3d.png' },
    
    // --- MORE SERIOUS / BUSINESS ---
    { name: 'Calculadora', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Calculator/3D/calculator_3d.png' },
    { name: 'Abaco', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Abacus/3D/abacus_3d.png' },
    { name: 'Régua', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Straight%20ruler/3D/straight_ruler_3d.png' },
    { name: 'Esquadro', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Triangular%20ruler/3D/triangular_ruler_3d.png' },
    { name: 'Grampeador', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Stapler/3D/stapler_3d.png' },
    { name: 'Tesoura', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Scissors/3D/scissors_3d.png' },
    { name: 'Lupa Direita', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Magnifying%20glass%20tilted%20right/3D/magnifying_glass_tilted_right_3d.png' },
    { name: 'Marcador', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Bookmark/3D/bookmark_3d.png' },
    { name: 'Etiqueta', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Label/3D/label_3d.png' },
    { name: 'Envelope', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Envelope/3D/envelope_3d.png' },
    { name: 'Carta', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Incoming%20envelope/3D/incoming_envelope_3d.png' },
    { name: 'Caixa de Correio', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Closed%20mailbox%20with%20raised%20flag/3D/closed_mailbox_with_raised_flag_3d.png' },
    { name: 'Megafone', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Megaphone/3D/megaphone_3d.png' },
    { name: 'Sino', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Bell/3D/bell_3d.png' },
    { name: 'Sino Cortado', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Bell%20with%20slash/3D/bell_with_slash_3d.png' },
    { name: 'Calendário Rasgado', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Tear-off%20calendar/3D/tear-off_calendar_3d.png' },
    { name: 'Prancheta', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Clipboard/3D/clipboard_3d.png' },
    { name: 'Arquivo', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/File%20cabinet/3D/file_cabinet_3d.png' },
    
    // --- ADDITIONAL MONOCHROMATIC / SERIOUS ---
    { name: 'Lixo Flat', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Wastebasket/Flat/wastebasket_flat.png' },
    { name: 'Caneta Flat', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Pen/Flat/pen_flat.png' },
    { name: 'Lápis Flat', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Pencil/Flat/pencil_flat.png' },
    { name: 'Clip Flat', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Paperclip/Flat/paperclip_flat.png' },
    { name: 'Envelope Flat', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Envelope/Flat/envelope_flat.png' },
    { name: 'Sino Flat', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Bell/Flat/bell_flat.png' },
    { name: 'Estrela Flat', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Star/Flat/star_flat.png' },
    { name: 'Coração Flat', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Heart%20suit/Flat/heart_suit_flat.png' },
    { name: 'Fogo Flat', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Fire/Flat/fire_flat.png' },
    { name: 'Lâmpada Flat', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Light%20bulb/Flat/light_bulb_flat.png' },
    { name: 'Alvo Flat', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Direct%20hit/Flat/direct_hit_flat.png' },
    { name: 'Nuvem Flat', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Cloud/Flat/cloud_flat.png' },
    { name: 'Raio Flat', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/High%20voltage/Flat/high_voltage_flat.png' },
    { name: 'Globo Flat', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Globe%20showing%20Americas/Flat/globe_showing_americas_flat.png' },
    
    // --- ADDITIONAL CUTE / PLAYFUL ---
    { name: 'Piruá', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Lollipop/3D/lollipop_3d.png' },
    { name: 'Bala', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Candy/3D/candy_3d.png' },
    { name: 'Chocolate', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Chocolate%20bar/3D/chocolate_bar_3d.png' },
    { name: 'Pipoca', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Popcorn/3D/popcorn_3d.png' },
    { name: 'Cookie', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Cookie/3D/cookie_3d.png' },
    { name: 'Suco', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Beverage%20box/3D/beverage_box_3d.png' },
    { name: 'Leite', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Glass%20of%20milk/3D/glass_of_milk_3d.png' },
    { name: 'Ovo', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Egg/3D/egg_3d.png' },
    { name: 'Pão', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Bread/3D/bread_3d.png' },
    { name: 'Queijo', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Cheese%20wedge/3D/cheese_wedge_3d.png' },
    
    // --- ADDITIONAL SERIOUS / OFFICE ---
    { name: 'Lupa Direita Flat', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Magnifying%20glass%20tilted%20right/Flat/magnifying_glass_tilted_right_flat.png' },
    { name: 'Envelope Aberto Flat', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Open%20envelope/Flat/open_envelope_flat.png' },
    { name: 'Envelope com Seta Flat', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Envelope%20with%20arrow/Flat/envelope_with_arrow_flat.png' },
    { name: 'Pasta Aberta Flat', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Open%20file%20folder/Flat/open_file_folder_flat.png' },
    { name: 'Pastas Flat', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/File%20folders/Flat/file_folders_flat.png' },
    { name: 'Documentos Flat', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Pages%20facing%20up/Flat/pages_facing_up_flat.png' },
    { name: 'Prancheta Flat', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Clipboard/Flat/clipboard_flat.png' },
    { name: 'Gráfico Flat', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Chart%20increasing/Flat/chart_increasing_flat.png' },
    { name: 'Gráfico Pizza Flat', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Pie%20chart/Flat/pie_chart_flat.png' },
    { name: 'Barra de Status Flat', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Bar%20chart/Flat/bar_chart_flat.png' },
    
    // --- MORE ANIMALS ---
    { name: 'Pinguim', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Penguin/3D/penguin_3d.png' },
    { name: 'Pinto', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Baby%20chick/3D/baby_chick_3d.png' },
    { name: 'Galinha', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Chicken/3D/chicken_3d.png' },
    { name: 'Pato', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Duck/3D/duck_3d.png' },
    { name: 'Coruja', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Owl/3D/owl_3d.png' },
    { name: 'Sapo', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Frog/3D/frog_3d.png' },
    { name: 'Tartaruga', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Turtle/3D/turtle_3d.png' },
    { name: 'Cobra', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Snake/3D/snake_3d.png' },
    { name: 'Dragão', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Dragon%20face/3D/dragon_face_3d.png' },
    { name: 'Polvo', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Octopus/3D/octopus_3d.png' },
    
    // --- MORE SYMBOLS ---
    { name: 'Coração Branco', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/White%20heart/3D/white_heart_3d.png' },
    { name: 'Coração Preto', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Black%20heart/3D/black_heart_3d.png' },
    { name: 'Coração Marrom', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Brown%20heart/3D/brown_heart_3d.png' },
    { name: 'Coração Laranja', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Orange%20heart/3D/orange_heart_3d.png' },
    { name: 'Cem', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Hundred%20points/3D/hundred_points_3d.png' },
    { name: 'Explosão', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Collision/3D/collision_3d.png' },
    { name: 'Zzz', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Zzz/3D/zzz_3d.png' },
    { name: 'Suor', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Sweat%20droplets/3D/sweat_droplets_3d.png' },
    { name: 'Fumaça', url: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Dashing%20away/3D/dashing_away_3d.png' },
  ];

  const filteredIcons = icons3D.filter(icon => 
    icon.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onSelect(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border transition-colors duration-300"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Smile size={18} className="text-[var(--primary)]" />
            <h3 className="font-semibold" style={{ color: 'var(--text)' }}>Ícone do Documento</h3>
          </div>
          <button onClick={onClose} className="transition-colors" style={{ color: 'var(--muted)' }}>
            <X size={20} />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
            <input
              type="text"
              placeholder="Pesquisar ícones (ex: foguete, pasta, coração)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl outline-none transition-all text-base"
              style={{ 
                backgroundColor: 'var(--surface-hover)', 
                border: '1px solid var(--border)',
                color: 'var(--text)'
              }}
            />
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-[350px] overflow-y-auto no-scrollbar p-1">
            {filteredIcons.map((icon, idx) => (
              <button
                key={`${icon.url}-${idx}`}
                onClick={() => onSelect(icon.url)}
                className="aspect-square hover:scale-110 transition-transform p-1.5 rounded-xl hover:bg-[var(--surface-hover)] border border-transparent hover:border-[var(--border)] flex items-center justify-center group relative"
                title={icon.name}
              >
                <img src={icon.url} alt={icon.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none shadow-xl border border-white/10">
                  {icon.name}
                </div>
              </button>
            ))}
            {filteredIcons.length === 0 && (
              <div className="col-span-full py-12 text-center text-sm" style={{ color: 'var(--muted)' }}>
                <Search size={32} className="mx-auto mb-2 opacity-20" />
                <p>Nenhum ícone encontrado para "{searchQuery}"</p>
              </div>
            )}
          </div>
          <div className="h-px my-2" style={{ backgroundColor: 'var(--border)' }} />
          <label className="flex items-center gap-3 p-3 rounded-xl transition-all group text-left w-full hover:bg-[var(--surface-hover)] cursor-pointer">
            <div className="w-8 h-8 rounded-lg border border-dashed flex items-center justify-center" style={{ borderColor: 'var(--border)' }}>
              <Upload size={14} style={{ color: 'var(--muted)' }} />
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Upload de imagem</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
          </label>

          {hasIcon && onRemove && (
            <>
              <div className="h-px my-2" style={{ backgroundColor: 'var(--border)' }} />
              <button
                onClick={onRemove}
                className="flex items-center gap-3 p-3 rounded-xl transition-all group text-left w-full hover:bg-red-500/10"
                style={{ color: '#ef4444' }}
              >
                <div className="w-8 h-8 rounded-lg border border-red-500/20 flex items-center justify-center bg-red-500/5">
                  <X size={14} />
                </div>
                <span className="text-sm font-medium">Remover ícone</span>
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
