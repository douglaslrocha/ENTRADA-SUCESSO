import {
  useEditor,
  EditorContent,
  Editor,
  ReactRenderer,
  Extension,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useNavigate, useParams } from "react-router-dom";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TextAlign } from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Highlight } from "@tiptap/extension-highlight";
import { Underline } from "@tiptap/extension-underline";
import { FontFamily } from "@tiptap/extension-font-family";
import { HorizontalRule } from "@tiptap/extension-horizontal-rule";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { ImageCarousel } from "../extensions/ImageCarousel";
import { DocFolderBlock } from "../extensions/DocFolderBlock";
import { AIBlock } from "../extensions/AIBlock";
import { DocFolderSelector } from "../components/DocFolderSelector";
import Suggestion from "@tiptap/suggestion";
import { common, createLowlight } from "lowlight";
import tippy, { Instance as TippyInstance } from "tippy.js";
import { AnimatePresence, motion } from "motion/react";
import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
  memo,
} from "react";
import { createPortal } from "react-dom";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Brush,
  Link as LinkIcon,
  FolderOpen,
  Table as TableIcon,
  Code as CodeIcon,
  Type,
  Quote,
  Plus,
  Minus,
  Images,
  Link2,
  ArrowLeft,
  Trash2,
  ChevronLeft,
  ArrowRight,
  Sun,
  Moon,
  Image as ImageIcon,
  ImagePlus,
  Smile,
  Save,
  Sparkles,
  Brain,
  CheckCircle2,
  Check,
  Circle,
  ListTodo,
  Repeat,
  Lightbulb,
  PenLine,
  Activity,
  Heart,
  Compass,
} from "lucide-react";
import { SuggestionList } from "../components/SuggestionList";
import {
  HighlightModal,
  LinkModal,
  TextColorModal,
  CoverModal,
  IconModal,
} from "../components/EditorModals";
import { DocumentCover, DocumentIcon } from "../components/DocumentDecoration";
import { documentService } from "../services/documentService";
import { aiService } from "../services/aiService";
import { fakeDB } from "../core/fakeDB";
import { safeLocalStorage } from "../utils/storage";
import { diaryService } from "../services/diaryService";
import { objectivesService } from "../services/objectivesService";
import { organismEventBus } from "../services/organismEventBus";
import MultimodalExecutionModal from "../components/objectives_new/components/MultimodalExecutionModal";
import TaskExecutionModal from "../components/objectives_new/components/TaskExecutionModal";
import {
  Play,
  Pause,
  Clock,
  TrendingUp,
  Volume2,
  BookOpen,
  Eye,
  Zap,
  Calendar,
  Flame,
  Timer,
  Trophy
} from "lucide-react";

const lowlight = createLowlight(common);

const SilverArrow = ({ size = 20 }: { size?: number }) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
  >
    <defs>
      <linearGradient id="silver-base" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="50%" stopColor="#A1A1AA" />
        <stop offset="100%" stopColor="#27272A" />
      </linearGradient>

      <linearGradient id="shine-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="rgba(255,255,255,0)" />
        <stop offset="50%" stopColor="rgba(255,255,255,0.9)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </linearGradient>
    </defs>

    {/* Base Arrow Path */}
    <path
      d="M20 12H4M4 12L10 18M4 12L10 6"
      stroke="url(#silver-base)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ opacity: 0.8 }}
    />

    {/* Traveling Shine - Strictly inside the stroke */}
    <motion.path
      d="M20 12H4M4 12L10 18M4 12L10 6"
      stroke="url(#shine-gradient)"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0.3, pathOffset: -0.3, opacity: 0 }}
      animate={{
        pathOffset: [0, 1.3],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut",
        repeatDelay: 0.5,
      }}
    />
  </motion.svg>
);

// Custom extension for Slash Commands
const Commands = Extension.create({
  name: "commands",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

interface EditorProps {
  content: string;
  onUpdate: (content: string) => void;
  onEditorReady?: (editor: Editor) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
}

const getSuggestionItems = ({
  query,
  editor,
}: {
  query: string;
  editor: Editor;
}) => {
  return [
    {
      title: "H1",
      icon: <Heading1 size={18} />,
      command: ({ editor, range }: any) => {
        if (range) {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setNode("heading", { level: 1 })
            .run();
        } else {
          editor.chain().focus().setNode("heading", { level: 1 }).run();
        }
      },
    },
    {
      title: "H2",
      icon: <Heading2 size={18} />,
      command: ({ editor, range }: any) => {
        if (range) {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setNode("heading", { level: 2 })
            .run();
        } else {
          editor.chain().focus().setNode("heading", { level: 2 }).run();
        }
      },
    },
    {
      title: "H3",
      icon: <Heading3 size={18} />,
      command: ({ editor, range }: any) => {
        if (range) {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setNode("heading", { level: 3 })
            .run();
        } else {
          editor.chain().focus().setNode("heading", { level: 3 }).run();
        }
      },
    },
    {
      title: "Texto",
      icon: <Type size={18} />,
      command: ({ editor, range }: any) => {
        if (range) {
          editor.chain().focus().deleteRange(range).setNode("paragraph").run();
        } else {
          editor.chain().focus().setNode("paragraph").run();
        }
      },
    },
    {
      title: "Lista de Marcadores",
      icon: <List size={18} />,
      command: ({ editor, range }: any) => {
        if (range) {
          editor.chain().focus().deleteRange(range).toggleBulletList().run();
        } else {
          editor.chain().focus().toggleBulletList().run();
        }
      },
    },
    {
      title: "Lista Numerada",
      icon: <ListOrdered size={18} />,
      command: ({ editor, range }: any) => {
        if (range) {
          editor.chain().focus().deleteRange(range).toggleOrderedList().run();
        } else {
          editor.chain().focus().toggleOrderedList().run();
        }
      },
    },
    {
      title: "Citação",
      icon: <Quote size={18} />,
      command: ({ editor, range }: any) => {
        if (range) {
          editor.chain().focus().deleteRange(range).toggleBlockquote().run();
        } else {
          editor.chain().focus().toggleBlockquote().run();
        }
      },
    },
    {
      title: "Bloco de Código",
      icon: <CodeIcon size={18} />,
      command: ({ editor, range }: any) => {
        if (range) {
          editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
        } else {
          editor.chain().focus().toggleCodeBlock().run();
        }
      },
    },
    {
      title: "Tabela",
      icon: <TableIcon size={18} />,
      command: ({ editor, range }: any) => {
        if (range) {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run();
        } else {
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run();
        }
      },
    },
    {
      title: "Linha Divisória",
      icon: <Minus size={18} />,
      command: ({ editor, range }: any) => {
        if (range) {
          editor.chain().focus().deleteRange(range).setHorizontalRule().run();
        } else {
          editor.chain().focus().setHorizontalRule().run();
        }
      },
    },
    {
      title: "Adicionar imagem",
      icon: <ImageIcon size={18} />,
      command: ({ editor, range }: any) => {
        if (range) {
          editor.chain().focus().deleteRange(range).run();
        }
        const savedSelection = {
          from: editor.state.selection.from,
          to: editor.state.selection.to,
        };
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async (e: any) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              const url = reader.result as string;
              const docLen = editor.state.doc.content.size;
              let chain = editor.chain().focus();
              if (savedSelection && savedSelection.from <= docLen && savedSelection.to <= docLen) {
                chain = chain.setTextSelection({
                  from: savedSelection.from,
                  to: savedSelection.to,
                });
              }
              chain.setImage({ src: url }).run();
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      },
    },
    {
      title: "Carrossel de Imagens",
      icon: <Images size={18} />,
      command: ({ editor, range }: any) => {
        if (range) {
          editor.chain().focus().deleteRange(range).run();
        }
        const savedSelection = {
          from: editor.state.selection.from,
          to: editor.state.selection.to,
        };
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        input.accept = "image/*";
        input.onchange = async (e: any) => {
          const files = Array.from(e.target.files as FileList);
          if (files.length > 0) {
            try {
              const images = await Promise.all(
                files.map(
                  (file) =>
                    new Promise<string>((resolve) => {
                      const reader = new FileReader();
                      reader.onload = () => resolve(reader.result as string);
                      reader.readAsDataURL(file);
                    }),
                ),
              );
              const docLen = editor.state.doc.content.size;
              let chain = editor.chain().focus();
              if (savedSelection && savedSelection.from <= docLen && savedSelection.to <= docLen) {
                chain = chain.setTextSelection({
                  from: savedSelection.from,
                  to: savedSelection.to,
                });
              }
              chain.setImageCarousel({ images }).run();
            } catch (err) {
              console.error(
                "[DiaryEditor] Falha ao carregar imagens do carrossel:",
                err,
              );
              alert("Erro ao processar imagens para o carrossel.");
            }
          }
        };
        input.click();
      },
    },
    {
      title: "Cor do texto",
      icon: <Type size={18} />,
      command: ({ editor, range }: any) => {
        if (range) {
          editor.chain().focus().deleteRange(range).run();
        }
        window.dispatchEvent(
          new CustomEvent("open-text-color-modal", {
            detail: { range: null, editor },
          }),
        );
      },
    },
    {
      title: "Marca-texto",
      icon: <Brush size={18} />,
      command: ({ editor, range }: any) => {
        if (range) {
          editor.chain().focus().deleteRange(range).run();
        }
        window.dispatchEvent(
          new CustomEvent("open-highlight-modal", {
            detail: { range: null, editor },
          }),
        );
      },
    },
    {
      title: "Link",
      icon: <LinkIcon size={18} />,
      command: ({ editor, range }: any) => {
        if (range) {
          editor.chain().focus().deleteRange(range).run();
        }
        window.dispatchEvent(
          new CustomEvent("open-link-modal", {
            detail: { range: null, editor },
          }),
        );
      },
    },
    {
      title: "Documento ou Pasta",
      icon: <FolderOpen size={18} />,
      command: ({ editor, range }: any) => {
        if (range) {
          editor.chain().focus().deleteRange(range).run();
        }
        window.dispatchEvent(
          new CustomEvent("open-doc-folder-selector", {
            detail: { range: null, editor },
          }),
        );
      },
    },
    {
      title: "Adicionar capa",
      icon: <ImagePlus size={18} />,
      command: ({ editor, range }: any) => {
        if (range) {
          editor.chain().focus().deleteRange(range).run();
        }
        window.dispatchEvent(new CustomEvent("open-cover-modal"));
      },
    },
    {
      title: "Adicionar ícone",
      icon: <Smile size={18} />,
      command: ({ editor, range }: any) => {
        if (range) {
          editor.chain().focus().deleteRange(range).run();
        }
        window.dispatchEvent(new CustomEvent("open-icon-modal"));
      },
    },
  ].filter((item) => item.title.toLowerCase().startsWith(query.toLowerCase()));
};

// Componente de Nuvem Estilo "Sticker/Figurinha"
const CloudSticker = ({
  className,
  scale = 1,
  opacity = 1,
  delay = 0,
  duration = 15,
}: {
  className?: string;
  scale?: number;
  opacity?: number;
  delay?: number;
  duration?: number;
}) => (
  <motion.div
    animate={{
      y: [-8 * scale, 8 * scale, -8 * scale],
      x: [-5 * scale, 5 * scale, -5 * scale],
    }}
    transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
    className={`relative pointer-events-none ${className}`}
    style={{ transform: `scale(${scale})`, opacity }}
  >
    {/* Base da Nuvem */}
    <div className="absolute top-4 left-0 w-32 h-12 bg-white rounded-full shadow-[inset_-4px_-4px_12px_rgba(0,0,0,0.1),4px_4px_8px_rgba(255,255,255,0.8)]" />
    {/* Bolhas Superiores */}
    <div className="absolute -top-2 left-4 w-16 h-16 bg-white rounded-full shadow-[inset_-4px_-4px_12px_rgba(0,0,0,0.1),2px_2px_6px_rgba(255,255,255,0.8)]" />
    <div className="absolute -top-6 left-12 w-20 h-20 bg-white rounded-full shadow-[inset_-4px_-4px_12px_rgba(0,0,0,0.1),2px_2px_6px_rgba(255,255,255,0.8)]" />
    <div className="absolute -top-2 left-24 w-14 h-14 bg-white rounded-full shadow-[inset_-4px_-4px_12px_rgba(0,0,0,0.1),2px_2px_6px_rgba(255,255,255,0.8)]" />

    {/* Brilho de Relevo */}
    <div className="absolute top-0 left-6 w-12 h-4 bg-white/40 rounded-full blur-[2px]" />
  </motion.div>
);

// Componente de Animação do Dia (Isolado para o sistema de troca)
const DayAnimation = ({ isDark }: { isDark: boolean }) => (
  <>
    {/* Sky Gradient - Deep Cinematic Blue */}
    <div
      className="absolute inset-0 transition-opacity duration-1000"
      style={{
        background:
          "linear-gradient(180deg, #020617 0%, #0f172a 45%, #1e293b 75%, #334155 100%)",
        opacity: isDark ? 1 : 0.85,
      }}
    />

    {/* Objeto de Linha Animado (Traveling Light) */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      <motion.div
        animate={{
          x: ["-200%", "300%"],
          y: ["20%", "80%"],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute w-[800px] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-[-15deg] blur-[2px]"
      />
    </div>

    {/* Sun with Radiant Glow and Continuous Loop */}
    <motion.div
      animate={{
        y: [30, -10, 30],
        scale: [0.98, 1.05, 0.98],
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute right-[15%] top-[15%] z-20"
    >
      <div className="relative w-[130px] h-[130px]">
        {/* Radiant Sun Core with Relief */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-100 via-orange-400 to-orange-600 shadow-[0_0_100px_rgba(251,191,36,0.6),inset_-10px_-10px_20px_rgba(0,0,0,0.2)]" />

        {/* Sun Highlight */}
        <div className="absolute top-[15%] left-[15%] w-[40%] h-[40%] rounded-full bg-white/40 blur-md" />

        {/* Rotating Rays */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-40px]"
        >
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-[240px] h-[2px] bg-gradient-to-r from-orange-300/20 via-orange-300/5 to-transparent origin-left"
              style={{ transform: `rotate(${i * 22.5}deg)` }}
            />
          ))}
        </motion.div>

        {/* Pulsing Atmospheric Glow */}
        <motion.div
          animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.4, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-[-80px] rounded-full bg-orange-400/20 blur-[90px]"
        />
      </div>
    </motion.div>

    {/* Sticker Clouds - Large Numbers and Various Sizes */}
    <div className="absolute inset-0 z-30 pointer-events-none">
      {/* Grandes */}
      <CloudSticker
        className="top-[15%] left-[10%]"
        scale={1.2}
        opacity={0.8}
        delay={0}
        duration={12}
      />
      <CloudSticker
        className="top-[40%] right-[15%]"
        scale={1.4}
        opacity={0.6}
        delay={2}
        duration={18}
      />
      <CloudSticker
        className="bottom-[15%] left-[25%]"
        scale={1.1}
        opacity={0.7}
        delay={4}
        duration={14}
      />

      {/* Médias */}
      <CloudSticker
        className="top-[25%] right-[35%]"
        scale={0.8}
        opacity={0.9}
        delay={1}
        duration={11}
      />
      <CloudSticker
        className="top-[60%] left-[15%]"
        scale={0.7}
        opacity={0.5}
        delay={3}
        duration={16}
      />
      <CloudSticker
        className="bottom-[30%] right-[10%]"
        scale={0.9}
        opacity={0.8}
        delay={5}
        duration={13}
      />

      {/* Pequenas */}
      <CloudSticker
        className="top-[10%] right-[20%]"
        scale={0.4}
        opacity={0.9}
        delay={0.5}
        duration={10}
      />
      <CloudSticker
        className="top-[35%] left-[40%]"
        scale={0.5}
        opacity={0.7}
        delay={1.5}
        duration={12}
      />
      <CloudSticker
        className="top-[50%] right-[45%]"
        scale={0.3}
        opacity={0.6}
        delay={2.5}
        duration={15}
      />
      <CloudSticker
        className="bottom-[40%] left-[35%]"
        scale={0.4}
        opacity={0.8}
        delay={3.5}
        duration={17}
      />
      <CloudSticker
        className="bottom-[10%] right-[30%]"
        scale={0.5}
        opacity={0.9}
        delay={4.5}
        duration={11}
      />
    </div>

    {/* Sharp Twinkling Stars */}
    {[...Array(40)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,1)]"
        style={{
          width: Math.random() * 2 + 1 + "px",
          height: Math.random() * 2 + 1 + "px",
          top: Math.random() * 80 + "%",
          left: Math.random() * 100 + "%",
        }}
        animate={{
          opacity: [0.2, 1, 0.2],
          scale: [0.7, 1.4, 0.7],
        }}
        transition={{
          duration: 1.5 + Math.random() * 3,
          repeat: Infinity,
          delay: Math.random() * 5,
        }}
      />
    ))}
  </>
);

// Componente de Animação da Noite (Isolado para o sistema de troca)
const NightAnimation = ({ isDark }: { isDark: boolean }) => (
  <>
    {/* Sky Gradient */}
    <div
      className="absolute inset-0 transition-opacity duration-1000"
      style={{
        background:
          "linear-gradient(135deg, #020617 0%, #0f172a 40%, #1e1b4b 100%)",
        opacity: isDark ? 1 : 0.95,
      }}
    />

    {/* Objeto de Linha Animado (Traveling Light) */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      <motion.div
        animate={{
          x: ["-200%", "300%"],
          y: ["30%", "60%"],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute w-[800px] h-[1px] bg-gradient-to-r from-transparent via-blue-200/20 to-transparent rotate-[-10deg] blur-[2px]"
      />
    </div>

    {/* Moon (Realistic 3D Crescent) */}
    <motion.div
      animate={{
        y: [-15, 15, -15],
        scale: [1, 1.08, 1],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute right-[10%] top-[15%] z-20 perspective-[1000px]"
    >
      <div className="relative w-[150px] h-[150px]">
        <div className="absolute inset-0 overflow-hidden rounded-full transform rotate-[25deg]">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `url('https://images.unsplash.com/photo-1532693322450-2cb5c511067d?auto=format&fit=crop&q=80&w=300&h=300')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "brightness(1.2) contrast(1.1) saturate(0.8)",
              boxShadow: "inset -20px -20px 50px rgba(0,0,0,0.8)",
            }}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "#020617",
              transform: "translate(-38%, -18%) scale(1.15)",
              filter: "blur(12px)",
            }}
          />
        </div>
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.3, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-[-60px] rounded-full blur-[90px] bg-blue-400/20"
        />
      </div>
    </motion.div>

    {/* Sticker Clouds - Night Version (Slightly darker/bluer) */}
    <div className="absolute inset-0 z-30 pointer-events-none">
      <CloudSticker
        className="top-[20%] left-[15%] brightness-75"
        scale={1}
        opacity={0.4}
        delay={0}
        duration={15}
      />
      <CloudSticker
        className="top-[50%] right-[25%] brightness-75"
        scale={1.3}
        opacity={0.3}
        delay={2}
        duration={20}
      />
      <CloudSticker
        className="bottom-[20%] left-[30%] brightness-75"
        scale={0.8}
        opacity={0.5}
        delay={4}
        duration={14}
      />
      <CloudSticker
        className="top-[10%] right-[10%] brightness-75"
        scale={0.5}
        opacity={0.4}
        delay={1}
        duration={12}
      />
    </div>

    {/* Vibrant Stars with Depth and Twinkle */}
    {[...Array(60)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,1)]"
        style={{
          width: Math.random() * 2.5 + 1 + "px",
          height: Math.random() * 2.5 + 1 + "px",
          top: Math.random() * 100 + "%",
          left: Math.random() * 100 + "%",
        }}
        animate={{
          opacity: [0.3, 1, 0.3],
          scale: [0.8, 1.5, 0.8],
        }}
        transition={{
          duration: 2 + Math.random() * 4,
          repeat: Infinity,
          delay: Math.random() * 5,
        }}
      />
    ))}
  </>
);

const DayOpeningBlock = ({
  forcedPeriod,
  forcedTheme,
  currentEntry,
  theme,
}: {
  forcedPeriod?: "DIA" | "NOITE";
  forcedTheme?: "light" | "dark";
  currentEntry: any;
  theme: "light" | "dark";
}) => {
  // MODIFICAÇÃO: Usar useMemo para que mude ao carregar do banco de dados, mas mantenha-se
  // congelado no horário de início registrado, sem sofrer re-inicialização incorreta.
  const now = useMemo(() => {
    if (currentEntry?.createdAt) return new Date(currentEntry.createdAt);
    if (currentEntry?.startAt) return new Date(currentEntry.startAt);
    return new Date();
  }, [currentEntry?.createdAt, currentEntry?.startAt]);

  const getDayPeriod = (date: Date) => {
    const hour = date.getHours();
    // DIA: 03:00 às 18:59
    if (hour >= 3 && hour < 19) return "DIA";
    // NOITE: 19:00 às 02:59
    return "NOITE";
  };

  const period = forcedPeriod || getDayPeriod(now);
  const activeTheme = forcedTheme || theme;
  // Forçamos a estética dark para ambos os períodos (DIA e NOITE), conforme solicitado
  const isDark = true;

  // Estilos dinâmicos unificados para a estética dark cinematográfica
  const getStyles = () => {
    return {
      headerIcon: "text-white/60",
      headerLabel: "text-white text-[14px]",
      aberturaLabel: "text-white/60",
      weekdayLabel: "text-white/40",
      dateLabel: "text-white",
      timeWidget: {
        bg: "bg-white",
        text: "text-[#000000]",
        label: period === "DIA" ? "text-[#323232]" : "text-[#726d6d]",
      },
      estadoLabel: "text-white/40",
      estadoValue: "text-white",
    };
  };

  const s = getStyles();

  const context = {
    icon: period === "DIA" ? "☀️" : "🌙",
    label: period === "DIA" ? "BOM DIA" : "BOA NOITE",
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const formatWeekday = (date: Date) => {
    const weekday = new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
    }).format(date);
    return weekday.toUpperCase();
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  };

  // Função que decide qual animação renderizar
  const renderAnimation = () => {
    if (period === "DIA") return <DayAnimation isDark={isDark} />;
    return <NightAnimation isDark={isDark} />;
  };

  return (
    <div
      className="relative mb-16 mt-8 overflow-hidden rounded-[40px] border border-white/10 shadow-2xl transition-all duration-500 group/card"
      style={{
        backgroundColor: isDark
          ? "rgba(24, 24, 27, 0.6)"
          : "rgba(255, 255, 255, 0.7)",
        boxShadow: isDark
          ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
          : "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Background Animation Layer - Contained within card */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {renderAnimation()}
      </div>

      {/* Subtle Overlay to prevent artifacts */}
      <div className="absolute inset-0 z-[5] bg-gradient-to-b from-transparent to-black/5 pointer-events-none" />

      {/* Content Layer */}
      <div className="relative z-10 p-8 md:p-12 flex flex-col gap-10">
        {/* Header */}
        <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.4em] uppercase">
          <span className={s.headerIcon} style={{ fontSize: "26px" }}>
            {context.icon}
          </span>
          <span className={s.headerLabel}>{context.label}</span>
          <span className="opacity-20 mx-1">•</span>
          <span
            className={s.aberturaLabel}
            style={{
              width: "188.96px",
              marginLeft: "-20px",
              marginRight: "-26px",
              paddingLeft: "-16px",
              paddingRight: "-26px",
            }}
          >
            ABERTURA DO DIA
          </span>
        </div>

        {/* Main Info */}
        <div className="space-y-3">
          <p
            className={`text-[13px] font-black tracking-[0.4em] uppercase ${s.weekdayLabel}`}
          >
            {formatWeekday(now)}
          </p>
          <h1
            className={`font-serif italic font-bold tracking-tight leading-none text-[30px] p-0 ${s.dateLabel}`}
          >
            {formatDate(now)}
          </h1>
        </div>

        {/* Bottom Stats */}
        <div
          className="flex flex-wrap items-center gap-12"
          style={{ marginTop: "-20px", paddingTop: "0px" }}
        >
          <div
            className={`flex items-center gap-5 rounded-[28px] p-5 pr-8 border transition-all duration-500 ${s.timeWidget.bg} border-black/5`}
            style={{ height: "88.82px", width: "166.5px" }}
          >
            <div className="space-y-1">
              <p
                className={`font-bold tracking-tighter tabular-nums leading-none text-[46px] ${s.timeWidget.text}`}
              >
                {formatTime(now)}
              </p>
              <p
                className={`text-[9px] font-black tracking-[0.2em] uppercase ${s.timeWidget.label}`}
              >
                INICIADO ÀS
              </p>
            </div>
          </div>

          <div className="space-y-1.5" style={{ marginTop: "-22px" }}>
            <p
              className={`text-[9px] font-black tracking-[0.2em] uppercase ${s.estadoLabel}`}
            >
              ESTADO
            </p>
            <p
              className={`font-bold tracking-[0.15em] uppercase text-[10px] ${s.estadoValue}`}
            >
              CONSCIÊNCIA PLENA
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Animação de Sonhos (Névoa e Brilho Difuso)

// Componente de Animação de Sonhos (Névoa e Brilho) - LÓGICA: NASCER E SE PÔR (Lifecycle)
const DreamsAnimation = memo(({ theme }: { theme: "light" | "dark" }) => {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ transform: "translateZ(0)" }}
    >
      {/* Luz Central Ultra Difusa (Foco de Escrita) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{
            opacity: theme === "dark" ? [0.04, 0.07, 0.04] : [0.12, 0.2, 0.12],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`w-[80%] h-[80%] rounded-full blur-[100px] md:blur-[180px] transition-all duration-1000 ${
            theme === "dark" ? "bg-indigo-500/20" : "bg-blue-100/50"
          }`}
          style={{
            maskImage: "radial-gradient(circle, black 30%, transparent 90%)",
            WebkitMaskImage:
              "radial-gradient(circle, black 30%, transparent 90%)",
          }}
        />

        {/* Spot de Realce Central (Ponto de Luz Suave) */}
        <motion.div
          animate={{
            opacity: theme === "dark" ? [0.02, 0.05, 0.02] : [0.06, 0.12, 0.06],
            scale: [0.7, 1.3, 0.7],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute w-[50%] h-[50%] rounded-full blur-[90px] md:blur-[140px] transition-colors duration-1000 ${
            theme === "dark" ? "bg-white/5" : "bg-white/60"
          }`}
          style={{
            maskImage: "radial-gradient(circle, black 20%, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(circle, black 20%, transparent 80%)",
          }}
        />
      </div>

      {/* Névoa Ambiente Fluida (Movimento sutil para quebrar estática) */}
      <motion.div
        animate={{
          x: ["-10%", "10%", "-10%"],
          y: ["-5%", "5%", "-5%"],
          opacity: [0.05, 0.08, 0.05],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className={`absolute inset-[-30%] blur-[150px] transition-colors duration-1000 ${
          theme === "dark" ? "bg-indigo-900/10" : "bg-blue-50/30"
        }`}
      />
    </div>
  );
});

const DreamsBlock = ({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: "light" | "dark";
}) => (
  <div className="relative mt-12 mb-24 group/dreams -mx-4 sm:-mx-8 md:-mx-16 lg:-mx-24 overflow-hidden">
    {/* Fundo com Gradiente em vez de Mask (Mais performante e sem bugs de piscar) */}
    <div className="absolute inset-0 z-0 transition-colors duration-1000 bg-transparent">
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[var(--bg)] to-transparent z-[1]" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[var(--bg)] to-transparent z-[1]" />
      <DreamsAnimation theme={theme} />
    </div>

    {/* Conteúdo */}
    <div className="relative z-10 px-4 sm:px-8 md:px-16 lg:px-24 py-6 md:py-8">
      <div className="flex flex-col gap-6">
        {/* Header Reforçado e Elegante */}
        <div className="flex items-center gap-5 md:gap-6">
          <div className="relative">
            {/* Glow Platinado */}
            <div className="absolute -inset-4 bg-slate-400/20 rounded-full blur-2xl animate-pulse" />

            <div className="relative p-3.5 md:p-4 rounded-2xl bg-gradient-to-br from-slate-200/50 via-white/80 to-slate-300/50 border border-slate-300/30 shadow-[0_0_20px_rgba(148,163,184,0.2)] dark:from-slate-700/50 dark:via-slate-800/80 dark:to-slate-900/50 dark:border-slate-600/30">
              <Brain size={32} className="text-slate-400 dark:text-slate-300" />

              {/* Efeito de Sinapse Platinada (Pulsos de Conexão) */}
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0, 0.3, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-slate-200 rounded-full blur-md"
              />
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0, 0.4, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute inset-0 bg-white rounded-full blur-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`text-2xl md:text-3xl font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-gray-900"}`}
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Sonhos de Hoje
            </motion.h2>
            <div className="flex items-center gap-3">
              <span
                className={`text-[10px] md:text-xs font-semibold tracking-[0.2em] uppercase opacity-50 ${theme === "dark" ? "text-white" : "text-gray-600"}`}
              >
                Ações durante o repouso
              </span>
              <div
                className={`h-px w-12 md:w-16 ${theme === "dark" ? "bg-white/10" : "bg-gray-200"}`}
              />
            </div>
          </div>
        </div>

        {/* Área do Editor - Altura Dinâmica (Sem min-height excessivo) */}
        <div className="relative min-h-[50px]">{children}</div>
      </div>
    </div>
  </div>
);

// Bloco de Ações do Dia
const EssentialActionsBlock = ({
  actions,
  onToggle,
  onAdd,
  theme,
}: {
  actions: {
    id: string;
    text: string;
    completed: boolean;
    isFromYesterday?: boolean;
  }[];
  onToggle: (id: string) => void;
  onAdd: (text: string) => void;
  theme: "light" | "dark";
}) => {
  const [newAction, setNewAction] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAction.trim()) {
      onAdd(newAction.trim());
      setNewAction("");
    }
  };

  const yesterdayActions = actions.filter((a) => a.isFromYesterday);
  const todayActions = actions.filter((a) => !a.isFromYesterday);

  const renderActionItem = (
    action: (typeof actions)[0],
    isYesterday: boolean,
  ) => (
    <motion.div
      key={action.id}
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{
        opacity: 1,
        x: 0,
        ...(action.completed
          ? { backgroundPosition: ["0% 0%", "200% 0%"] }
          : {}),
      }}
      className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-500 overflow-hidden ${
        isYesterday && !action.completed ? "opacity-60 grayscale-[0.3]" : ""
      }`}
      style={{
        background: action.completed
          ? `linear-gradient(rgba(10, 47, 31, 0.5), rgba(10, 47, 31, 0.5)) padding-box, 
             linear-gradient(90deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)) border-box`
          : "transparent",
        border: "1px solid transparent",
        backgroundSize: action.completed ? "200% 100%" : "auto",
      }}
      transition={{
        backgroundPosition: action.completed
          ? { duration: 3, repeat: Infinity, ease: "linear" }
          : undefined,
      }}
    >
      <button
        onClick={() => onToggle(action.id)}
        className="relative z-10 flex-shrink-0 transition-transform active:scale-90"
      >
        {action.completed ? (
          <motion.div
            initial={{ scale: 0.5, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <CheckCircle2
              size={18}
              style={{ color: "#00f079" }}
              className="drop-shadow-[0_0_8px_rgba(0,240,121,0.4)]"
            />
          </motion.div>
        ) : (
          <Circle size={18} className="text-[var(--muted)] transition-colors" />
        )}
      </button>

      <div className="relative z-10 flex flex-1 items-center gap-2 min-w-0">
        <span
          className={`text-[14.5px] transition-all duration-500 truncate font-medium ${
            action.completed ? "" : "opacity-90"
          }`}
          style={{ color: action.completed ? "#ffffff" : "var(--foreground)" }}
        >
          {action.text}
        </span>
        {isYesterday && !action.completed && (
          <span className="text-[9px] font-black uppercase tracking-[0.15em] px-1.5 py-0.5 rounded bg-blue-500/5 text-blue-500/40 whitespace-nowrap border border-blue-500/10">
            de ontem
          </span>
        )}
      </div>
    </motion.div>
  );

  return (
    <div
      className="mb-12 rounded-2xl border transition-all duration-300 overflow-hidden"
      style={{
        backgroundColor: theme === "dark" ? "#191a24" : "#edf0f4",
        borderColor: theme === "dark" ? "#313346" : "#cbd5e1",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
      }}
    >
      <div
        className="p-4 border-b flex items-center gap-3"
        style={{ borderColor: "var(--border)" }}
      >
        <ListTodo size={18} style={{ color: "#1a3b75" }} />
        <h2
          className="text-[14px] font-black tracking-[0.1em] uppercase opacity-70"
          style={{ color: "var(--foreground)", fontSize: "14px" }}
        >
          Ações do Dia
        </h2>
      </div>

      <div className="p-2">
        {/* Seção 1: Continuidade (De Ontem) */}
        {yesterdayActions.length > 0 && (
          <div className="mb-4">
            <div className="px-3 mb-1">
              <span className="text-[10px] font-black tracking-[0.2em] uppercase opacity-30">
                Continuidade
              </span>
            </div>
            <div className="space-y-0.5">
              {yesterdayActions.map((action) => renderActionItem(action, true))}
            </div>
          </div>
        )}

        {/* Seção 2: Ações de Hoje */}
        <div>
          {yesterdayActions.length > 0 && (
            <div className="px-3 mb-1 mt-2">
              <span className="text-[10px] font-black tracking-[0.2em] uppercase opacity-30">
                Hoje
              </span>
            </div>
          )}
          <div className="space-y-0.5">
            {todayActions.map((action) => renderActionItem(action, false))}
            {todayActions.length === 0 && yesterdayActions.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-[13px] italic opacity-40">
                  Nenhuma ação definida para hoje.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-3 bg-[var(--surface-hover)]/20 border-t transition-all duration-300 focus-within:bg-[var(--surface-hover)]/40 focus-within:border-blue-500/20"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <Plus size={16} className="text-[var(--muted)] ml-1" />
          <input
            type="text"
            value={newAction}
            onChange={(e) => setNewAction(e.target.value)}
            placeholder="Adicionar nova ação..."
            className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-[13.5px] placeholder:text-[var(--muted)] transition-opacity focus:placeholder:opacity-70"
            style={{ color: "var(--foreground)" }}
          />
          {newAction && (
            <button
              type="submit"
              className="text-[11px] font-black tracking-wider text-blue-500 px-2 py-1 hover:bg-blue-500/10 rounded transition-colors"
            >
              ADICIONAR
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

// Bloco de Ações de Amanhã
const TomorrowActionsBlock = ({
  actions,
  onToggle,
  onAdd,
  theme,
}: {
  actions: { id: string; text: string; completed: boolean }[];
  onToggle: (id: string) => void;
  onAdd: (text: string) => void;
  theme: "light" | "dark";
}) => {
  const [newAction, setNewAction] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAction.trim()) {
      onAdd(newAction.trim());
      setNewAction("");
    }
  };

  const renderActionItem = (action: (typeof actions)[0]) => (
    <motion.div
      key={action.id}
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{
        opacity: 1,
        x: 0,
        ...(action.completed
          ? { backgroundPosition: ["0% 0%", "200% 0%"] }
          : {}),
      }}
      className="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-500 overflow-hidden"
      style={{
        background: action.completed
          ? theme === "light"
            ? "linear-gradient(rgba(241, 245, 249, 0.8), rgba(241, 245, 249, 0.8)) padding-box, linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6) border-box"
            : "linear-gradient(rgba(10, 47, 31, 0.5), rgba(10, 47, 31, 0.5)) padding-box, linear-gradient(90deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.2)) border-box"
          : "transparent",
        border: "1px solid transparent",
        backgroundSize: action.completed ? "200% 100%" : "auto",
      }}
      transition={{
        backgroundPosition: action.completed
          ? { duration: 3, repeat: Infinity, ease: "linear" }
          : undefined,
      }}
    >
      <button
        onClick={() => onToggle(action.id)}
        className="relative z-10 flex-shrink-0 transition-transform active:scale-90"
      >
        {action.completed ? (
          <motion.div
            initial={{ scale: 0.5, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <CheckCircle2
              size={18}
              style={{ color: theme === "light" ? "#059669" : "#00f079" }}
              className="drop-shadow-[0_0_8px_rgba(0,240,121,0.4)]"
            />
          </motion.div>
        ) : (
          <Circle size={18} className="text-[var(--muted)] transition-colors" />
        )}
      </button>

      <div className="relative z-10 flex flex-1 items-center gap-2 min-w-0">
        <span
          className={`text-[14px] md:text-[14.5px] transition-all duration-500 truncate font-medium ${
            action.completed ? "" : "opacity-90"
          }`}
          style={{
            color: action.completed
              ? theme === "light"
                ? "#0f172a"
                : "#ffffff"
              : "var(--foreground)",
          }}
        >
          {action.text}
        </span>
      </div>
    </motion.div>
  );

  return (
    <div
      className="mb-8 md:mb-12 rounded-2xl border transition-all duration-300 overflow-hidden"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
      }}
    >
      <div
        className="p-3 md:p-4 border-b flex items-center gap-3"
        style={{ borderColor: "var(--border)" }}
      >
        <ListTodo size={18} className="text-blue-600 dark:text-blue-400" />
        <h2
          className="text-[12px] md:text-[14px] font-black tracking-[0.1em] uppercase opacity-70"
          style={{ color: "var(--foreground)" }}
        >
          Ações de Amanhã
        </h2>
      </div>

      <div className="p-1.5 md:p-2">
        <div className="space-y-0.5">
          {actions.map((action) => renderActionItem(action))}
          {actions.length === 0 && (
            <div className="py-6 md:py-8 text-center">
              <p className="text-[12px] md:text-[13px] italic opacity-40">
                O que você vai executar amanhã?
              </p>
            </div>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-2 md:p-3 bg-[var(--surface-hover)]/20 border-t transition-all duration-300 focus-within:bg-[var(--surface-hover)]/40 focus-within:border-blue-500/20"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <Plus size={16} className="text-[var(--muted)] ml-1" />
          <input
            type="text"
            value={newAction}
            onChange={(e) => setNewAction(e.target.value)}
            placeholder="Defina a próxima ação..."
            className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-[13px] md:text-[13.5px] placeholder:text-[var(--muted)] transition-opacity focus:placeholder:opacity-70"
            style={{ color: "var(--foreground)" }}
          />
          {newAction && (
            <button
              type="submit"
              className="text-[10px] md:text-[11px] font-black tracking-wider text-blue-600 dark:text-blue-400 px-2 py-1 hover:bg-blue-500/10 rounded transition-colors"
            >
              ADICIONAR
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

const formatTimeLocal = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours > 0 ? `${hours}:` : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const RecurringActionsBlock = ({
  tasks,
  activeInlineTaskId,
  isInlinePaused,
  inlineElapsedSeconds,
  handleStartInline,
  handlePauseInline,
  handleFinishInline,
  openExecution,
  onUpdate,
  theme,
}: {
  tasks: any[];
  activeInlineTaskId: string | null;
  isInlinePaused: boolean;
  inlineElapsedSeconds: number;
  handleStartInline: (e: React.MouseEvent, task: any) => void;
  handlePauseInline: (e: React.MouseEvent) => void;
  handleFinishInline: (e: React.MouseEvent, task: any) => void;
  openExecution: (task: any) => void;
  onUpdate: (updatedTask: any) => void;
  theme: string;
}) => {
  const handleStartPauseToggle = (e: React.MouseEvent, task: any) => {
    e.stopPropagation();
    if (activeInlineTaskId === task.id && !isInlinePaused) {
      handlePauseInline(e);
    } else {
      handleStartInline(e, task);
    }
  };

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6 px-1">
        <Repeat size={18} style={{ color: "var(--foreground)" }} className="opacity-70 animate-pulse" />
        <h2
          className="text-[14px] font-black tracking-[0.1em] uppercase opacity-75"
          style={{ color: "var(--foreground)", fontSize: "16px" }}
        >
          Ações Recorrentes
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tasks.map((task) => {
          const isActive = activeInlineTaskId === task.id;
          const isCompleted = task.status === 'completed';

          // Unified premium dark model - works elegantly in both light and dark backgrounds
          let cardClasses = "";
          let accentStyle = {};
          let badgeClasses = "";
          let titleClasses = "";
          let timerClasses = "";
          let metaClasses = "";
          let metaIconColors = {
            clock: "",
            trending: "",
            calendar: ""
          };

          if (isActive) {
            // Stage 2: Active / Running (Sleek minimalist graphite body, no purple background, white timer numbers, bright white footer text)
            cardClasses = "border-zinc-700 bg-gradient-to-br from-[#18181b] to-black shadow-[0_12px_45px_rgba(0,0,0,0.55)]";
            accentStyle = { 
              background: 'linear-gradient(180deg, #a5b4fc 0%, #6366f1 50%, #312e81 100%)',
              boxShadow: '0 0 15px rgba(99,102,241,0.5)'
            }; // Indigo-to-purple premium gradient with physical emissive glow
            badgeClasses = "bg-zinc-800 text-white border-zinc-700/60 shadow-sm";
            titleClasses = "text-zinc-50 font-black";
            timerClasses = "bg-zinc-950 border border-zinc-850 text-white shadow-[0_4px_25px_rgba(255,255,255,0.08)]";
            metaClasses = "border-zinc-900 text-white font-black";
            metaIconColors = { clock: "#ffffff", trending: "#ffffff", calendar: "#ffffff" };
          } else if (isCompleted) {
            // Stage 3: Completed (Elegant Dark Jade & Silver Zen theme, quiet, sober, zero gambling icons/flicker)
            cardClasses = "border-emerald-500/20 bg-gradient-to-br from-[#0c2218] via-[#05110d] to-[#010403] shadow-[inset_0_1px_20px_rgba(16,185,129,0.05)] hover:border-emerald-500/40 transition-all duration-500";
            accentStyle = { 
              background: 'linear-gradient(180deg, #a7f3d0 0%, #10b981 50%, #064e3b 100%)',
              boxShadow: '0 0 15px rgba(16,185,129,0.5)'
            }; // Left accent bar is beautiful, glowing emerald gradient
            badgeClasses = "bg-emerald-950/80 text-emerald-300 border-emerald-900/40 font-bold";
            titleClasses = "text-zinc-500 line-through decoration-zinc-700/80 font-bold opacity-75";
            metaClasses = "border-emerald-950/40 text-white font-extrabold";
            metaIconColors = { clock: "#ffffff", trending: "#ffffff", calendar: "#ffffff" };
          } else {
            // Stage 1: Available (Burnished Obsidian & Silver-Platinum - high detailed active look)
            cardClasses = "border-[#242538] bg-gradient-to-br from-[#121320] to-[#07080d] shadow-[0_15px_40px_rgba(0,0,0,0.65)] hover:border-zinc-500";
            accentStyle = { 
              background: 'linear-gradient(180deg, #ffffff 0%, #a1a1aa 50%, #52525b 100%)',
              boxShadow: '0 0 10px rgba(255,255,255,0.15)'
            }; // Luxury Silver/Platinum bar
            badgeClasses = "bg-zinc-850/90 text-zinc-300 border-zinc-750/70";
            titleClasses = "text-zinc-100 font-extrabold";
            metaClasses = "border-zinc-850/60 text-white font-extrabold";
            metaIconColors = { clock: "#ffffff", trending: "#ffffff", calendar: "#ffffff" };
          }

          return (
            <motion.div
              key={task.id}
              onClick={() => openExecution(task)}
              className={`group relative flex flex-col justify-between p-5 rounded-[2.2rem] border overflow-hidden cursor-pointer backdrop-blur-2xl transition-all duration-300 ${cardClasses}`}
            >
              {/* Premium Neon-Tube Left Accent - Sleek rounded accent bar with ambient glow */}
              <div 
                className="absolute left-1.5 top-5 bottom-5 w-1 rounded-full transition-all duration-300 pointer-events-none"
                style={accentStyle}
              />

              <div className="flex justify-between items-start gap-4">
                <div 
                  className="flex-1 min-w-0 pl-2"
                  style={isCompleted ? {
                    width: '199.737px',
                    paddingRight: '0px',
                    paddingLeft: '0px',
                    marginLeft: '0px',
                    marginRight: '-19px',
                  } : undefined}
                >
                  <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
                    <span className={`px-2.5 py-0.5 text-[8.5px] md:text-[9.5px] font-black rounded-full uppercase tracking-wider border transition-all duration-300 flex items-center gap-1 ${badgeClasses}`}>
                      {isActive ? 'Em Execução' : isCompleted ? 'Concluído' : 'Ação Recorrente'}
                    </span>
                    {task.metaIntention && (
                      <span className={`text-[8.5px] md:text-[9.5px] font-black uppercase tracking-widest transition-colors max-w-[150px] truncate ${
                        isCompleted
                          ? "text-zinc-500"
                          : isActive ? "text-zinc-300" : "text-zinc-400"
                      }`}>
                        {task.metaIntention}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className={`text-[17px] font-black tracking-tight break-words transition-all duration-300 ${titleClasses}`}>
                      {task.title}
                    </h3>
                  </div>
                  {isCompleted && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 0.95, y: 0 }}
                      className="uppercase tracking-widest flex items-center gap-1.5"
                      style={{
                        width: '260.741px',
                        marginBottom: '-30px',
                        marginTop: '33px',
                        fontSize: '11px',
                        fontWeight: 900,
                        color: '#ffffff'
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
                      <span className="text-[#a5bbb1]" style={{ color: '#a5bbb1' }}>Missão Cumprida com Sucesso</span>
                    </motion.div>
                  )}

                  {isActive && (
                    <div className={`flex items-center gap-3 mt-2.5 px-3.5 py-1.5 rounded-2xl w-fit ${timerClasses}`}>
                      <Clock size={16} className="animate-spin text-zinc-400" />
                      <span className="text-[21px] md:text-[23px] font-black font-mono tracking-widest leading-none text-white">
                        {formatTimeLocal(inlineElapsedSeconds)}
                      </span>
                      <span className="text-[8.5px] font-black uppercase tracking-[0.14em] border-l border-zinc-800 pl-2.5 leading-none text-zinc-400">
                        Ativa
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 self-center">
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.90 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = {
                          ...task,
                          status: 'todo' as any,
                          completedAt: undefined
                        };
                        onUpdate(updated);
                      }}
                      className="w-[92px] h-[92px] flex items-center justify-center transition-all bg-transparent border-none cursor-pointer group"
                      title="Clique para reiniciar tarefa"
                    >
                      <Check 
                        strokeWidth={3} 
                        className="text-[#10b981] drop-shadow-[0_0_15px_rgba(16,185,129,0.7)]" 
                        style={{ 
                          width: '66.9906px', 
                          height: '66.9906px',
                          marginRight: '-19px',
                          borderWidth: '1px',
                          borderColor: '#5c7186',
                          borderRadius: '18px',
                        }}
                      />
                    </motion.div>
                  ) : isActive ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleStartPauseToggle(e, task)}
                        className="w-10 h-10 rounded-2xl flex items-center justify-center hover:scale-115 active:scale-90 transition-all shadow-md border bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border-zinc-750 cursor-pointer"
                      >
                        {isInlinePaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
                      </button>
                      <button
                        onClick={(e) => handleFinishInline(e, task)}
                        className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center hover:scale-115 active:scale-90 transition-all shadow-[0_6px_20px_rgba(16,185,129,0.35)] border border-emerald-400/20 cursor-pointer"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => handleStartInline(e, task)}
                      className="w-10 h-10 rounded-2xl bg-gradient-to-br from-white via-[#f4f4f5] to-zinc-200 text-zinc-950 font-black flex items-center justify-center hover:scale-115 active:scale-90 transition-all shadow-[0_6px_22px_rgba(255,255,255,0.18)] border border-white cursor-pointer"
                    >
                      <Play size={18} fill="currentColor" className="ml-0.5 text-zinc-950" />
                    </button>
                  )}
                </div>
              </div>

              {/* Card Meta details - High precision design layout & bright white contrast legible on mobile */}
              <div 
                className={`flex flex-wrap items-center gap-y-2.5 gap-x-5 mt-4 pt-4 border-t text-[13px] md:text-[14.5px] uppercase tracking-wider font-black pl-2 ${metaClasses}`}
                style={isCompleted ? {
                  height: '34.1442px',
                  marginTop: '17px',
                  paddingTop: '0px',
                  paddingLeft: '8px',
                  marginBottom: '-19px',
                } : undefined}
              >
                <div className="flex items-center gap-1.5 transition-opacity" style={{ color: metaIconColors.clock }}>
                  <Clock size={14} className="opacity-95" />
                  <span>{task.estimatedDuration || '30m'}</span>
                </div>
                <div className="flex items-center gap-1.5 transition-opacity" style={{ color: metaIconColors.trending }}>
                  <TrendingUp size={14} className="opacity-95" />
                  <span>{task.priority || 'MEDIUM'}</span>
                </div>
                {task.date && (
                  <div className="flex items-center gap-1.5 transition-opacity" style={{ color: metaIconColors.calendar }}>
                    <Calendar size={14} className="opacity-95" />
                    <span>{new Date(task.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
        {tasks.length === 0 && (
          <div className="col-span-full py-12 px-4 border border-dashed border-[var(--border)] rounded-[1.5rem] flex flex-col items-center justify-center text-center">
            <Repeat size={32} className="opacity-25 mb-3 text-[var(--foreground)]" />
            <p className="text-xs font-bold uppercase tracking-wider opacity-60 text-[var(--foreground)] mb-1">Nenhuma ação recorrente ativa</p>
            <p className="text-[10px] font-medium opacity-40 text-[var(--foreground)]">Crie tarefas práticas nas metas do Atacar Objetivos para vê-las aqui.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const DailyNewsBlock = ({
  theme,
  title,
  id,
  onSelectionUpdate,
}: {
  theme: "light" | "dark";
  title: string;
  id?: string;
  onSelectionUpdate?: (editor: Editor) => void;
}) => {
  const [newsContent, setNewsContent] = useState(() => {
    if (id) {
      const entry = fakeDB.diaries.find((e) => String(e.id) === String(id));
      if (entry?.newsContent) return entry.newsContent;
    }
    return "";
  });
  const sideMenuRef = useRef<HTMLButtonElement>(null);
  const suggestionRef = useRef<any>(null);
  const [suggestionProps, setSuggestionProps] = useState<any>(null);
  const [suggestionPosition, setSuggestionPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [suggestionVisible, setSuggestionVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({
        placeholder: "O que surgiu hoje que não estava planejado...",
      }),
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      FontFamily,
      HorizontalRule,
      Color,
      Highlight.configure({ multicolor: true }),
      Table.configure({ resizable: true }),
      ImageCarousel,
      DocFolderBlock,
      AIBlock,
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({ lowlight }),
      Commands.configure({
        suggestion: {
          items: ({ query }: { query: string }) =>
            getSuggestionItems({ query, editor: editor! }),
          render: () => {
            return {
              onStart: (props: any) => {
                const { clientRect } = props;
                if (clientRect) {
                  const rect = clientRect();
                  if (rect) {
                    setSuggestionPosition({
                      top: rect.bottom + 4,
                      left: rect.left,
                    });
                  }
                }
                setSuggestionProps(props);
                setSuggestionVisible(true);
              },
              onUpdate(props: any) {
                const { clientRect } = props;
                if (clientRect) {
                  const rect = clientRect();
                  if (rect) {
                    setSuggestionPosition({
                      top: rect.bottom + 4,
                      left: rect.left,
                    });
                  }
                }
                setSuggestionProps(props);
              },
              onKeyDown(props: any) {
                if (props.event.key === "Escape") {
                  setSuggestionVisible(false);
                  return true;
                }
                return suggestionRef.current?.onKeyDown(props);
              },
              onExit() {
                setSuggestionVisible(false);
                setSuggestionProps(null);
                setSuggestionPosition(null);
              },
            };
          },
        },
      }),
    ],
    content: newsContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setNewsContent(html);
      if (id) fakeDB.updateDiaryEntry(id, { newsContent: html });
    },
    onSelectionUpdate: ({ editor }) => {
      onSelectionUpdate?.(editor);
    },
    onFocus: ({ editor }) => {
      onSelectionUpdate?.(editor);
    },
    editorProps: {
      attributes: {
        class: `prose ${theme === "dark" ? "prose-invert text-white" : "text-zinc-800"} max-w-[700px] mx-auto px-4 pt-2 pb-10 focus:outline-none min-h-[100px] font-sans`,
      },
    },
  });

  // Sincronizar conteúdo com o banco de dados dinamicamente após carregamento assíncrono
  useEffect(() => {
    if (!editor) return;
    const entry = id
      ? fakeDB.diaries.find((e) => String(e.id) === String(id))
      : null;
    const dbContent = entry?.newsContent || "";
    const currentHTML = editor.getHTML();
    if (dbContent !== currentHTML && !editor.isFocused) {
      editor.commands.setContent(dbContent);
      setNewsContent(dbContent);
    }
  }, [id, editor]);

  const handleSideMenuClick = useCallback(() => {
    if (!editor || !sideMenuRef.current) return;
    if (suggestionVisible) {
      setSuggestionVisible(false);
      return;
    }
    const items = getSuggestionItems({ query: "", editor });
    const rect = sideMenuRef.current.getBoundingClientRect();
    setSuggestionPosition({
      top: rect.bottom + 4,
      left: rect.left,
    });
    setSuggestionProps({
      items,
      editor,
      range: null,
      command: (item: any) => {
        setSuggestionVisible(false);
        item.command({ editor, range: null });
      },
    });
    setSuggestionVisible(true);
  }, [editor, suggestionVisible]);

  useEffect(() => {
    if (!editor) return;
    const closeMenus = () => {
      setSuggestionVisible(false);
    };
    editor.on("transaction", closeMenus);
    const updatePlusButton = () => {
      const { selection } = editor.state;
      const { view } = editor;
      try {
        const coords = view.coordsAtPos(selection.from);
        const editorElement = view.dom.parentElement;
        if (editorElement) {
          const rect = editorElement.getBoundingClientRect();
          const contentElement = view.dom;
          const contentRect = contentElement.getBoundingClientRect();
          const isMobile = window.innerWidth < 768;
          setMenuPosition({
            top: coords.top - rect.top + editorElement.scrollTop,
            left: isMobile
              ? contentRect.left - rect.left + 4
              : contentRect.left - rect.left - 40,
          });
        }
      } catch (err) {
        setMenuPosition(null);
      }
    };
    editor.on("selectionUpdate", updatePlusButton);
    editor.on("focus", () => {
      closeMenus();
      updatePlusButton();
    });
    return () => {
      editor.off("transaction", closeMenus);
      editor.off("focus");
      editor.off("selectionUpdate", updatePlusButton);
    };
  }, [editor]);

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
          <Sparkles size={22} />
        </div>
        <div>
          <h2
            className="text-xl font-bold tracking-tight"
            style={{ color: "var(--text)" }}
          >
            Novidades do Dia
          </h2>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            O que surgiu hoje que não estava planejado
          </p>
        </div>
      </div>
      <div className="relative">
        {menuPosition && (
          <button
            ref={sideMenuRef}
            onPointerDown={(e) => { e.preventDefault(); handleSideMenuClick(); }}
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              transform: "translateY(-2px)",
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--muted)",
              boxShadow: "var(--shadow)",
              marginLeft: "-19px",
            }}
            className="absolute p-1 rounded hover:bg-[var(--surface-hover)] transition-all z-20 flex items-center justify-center border"
            title="Adicionar bloco"
          >
            <Plus size={18} className="md:w-5 md:h-5" />
          </button>
        )}
        <EditorContent editor={editor} />

        
            {createPortal(
              <AnimatePresence>
                {suggestionVisible && suggestionPosition && (
                  <div className="fixed inset-0 z-[9999] pointer-events-none">
                    
                <div
                  className="absolute bg-transparent"
                  style={{ inset: 0, pointerEvents: "auto" }}
                  onClick={() => setSuggestionVisible(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute pointer-events-auto min-w-[200px] bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden"
                  style={{
                    top: `${suggestionPosition.top}px`,
                    left: `${suggestionPosition.left}px`,
                  }}
                >
                  <SuggestionList
                    ref={suggestionRef}
                    {...suggestionProps}
                    onClose={() => setSuggestionVisible(false)}
                  />
                </motion.div>
              
                  </div>
                )}
              </AnimatePresence>,
              document.body
            )}
          
      </div>
    </div>
  );
};

const InsightsBlock = ({
  theme,
  title,
  id,
  onSelectionUpdate,
}: {
  theme: "light" | "dark";
  title: string;
  id?: string;
  onSelectionUpdate?: (editor: Editor) => void;
}) => {
  const [insightsContent, setInsightsContent] = useState(() => {
    if (id) {
      const entry = fakeDB.diaries.find((e) => String(e.id) === String(id));
      if (entry?.insightsContent) return entry.insightsContent;
    }
    return "";
  });
  const sideMenuRef = useRef<HTMLButtonElement>(null);
  const suggestionRef = useRef<any>(null);
  const [suggestionProps, setSuggestionProps] = useState<any>(null);
  const [suggestionPosition, setSuggestionPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [suggestionVisible, setSuggestionVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const tippyInstance = useRef<TippyInstance | null>(null);
  const slashCommandTippy = useRef<TippyInstance | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({ placeholder: "Clarezas e percepções do dia..." }),
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      FontFamily,
      HorizontalRule,
      Color,
      Highlight.configure({ multicolor: true }),
      Table.configure({ resizable: true }),
      ImageCarousel,
      DocFolderBlock,
      AIBlock,
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({ lowlight }),
      Commands.configure({
        suggestion: {
          items: ({ query }: { query: string }) =>
            getSuggestionItems({ query, editor: editor! }),
          render: () => {
            return {
              onStart: (props: any) => {
                const { clientRect } = props;
                if (clientRect) {
                  const rect = clientRect();
                  if (rect) {
                    setSuggestionPosition({
                      top: rect.bottom + 4,
                      left: rect.left,
                    });
                  }
                }
                setSuggestionProps(props);
                setSuggestionVisible(true);
              },
              onUpdate(props: any) {
                const { clientRect } = props;
                if (clientRect) {
                  const rect = clientRect();
                  if (rect) {
                    setSuggestionPosition({
                      top: rect.bottom + 4,
                      left: rect.left,
                    });
                  }
                }
                setSuggestionProps(props);
              },
              onKeyDown(props: any) {
                if (props.event.key === "Escape") {
                  setSuggestionVisible(false);
                  return true;
                }
                return suggestionRef.current?.onKeyDown(props);
              },
              onExit() {
                setSuggestionVisible(false);
                setSuggestionProps(null);
                setSuggestionPosition(null);
              },
            };
          },
        },
      }),
    ],
    content: insightsContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setInsightsContent(html);
      if (id) fakeDB.updateDiaryEntry(id, { insightsContent: html });
    },
    onSelectionUpdate: ({ editor }) => {
      onSelectionUpdate?.(editor);
    },
    onFocus: ({ editor }) => {
      onSelectionUpdate?.(editor);
    },
    editorProps: {
      attributes: {
        class: `prose ${theme === "dark" ? "prose-invert text-white" : "text-zinc-800"} max-w-[700px] mx-auto px-4 pt-2 pb-10 focus:outline-none min-h-[100px] font-sans`,
      },
    },
  });

  // Sincronizar conteúdo com o banco de dados dinamicamente após carregamento assíncrono
  useEffect(() => {
    if (!editor) return;
    const entry = id
      ? fakeDB.diaries.find((e) => String(e.id) === String(id))
      : null;
    const dbContent = entry?.insightsContent || "";
    const currentHTML = editor.getHTML();
    if (dbContent !== currentHTML && !editor.isFocused) {
      editor.commands.setContent(dbContent);
      setInsightsContent(dbContent);
    }
  }, [id, editor]);

  const handleSideMenuClick = useCallback(() => {
    if (!editor || !sideMenuRef.current) return;
    if (suggestionVisible) {
      setSuggestionVisible(false);
      return;
    }
    const items = getSuggestionItems({ query: "", editor });
    const rect = sideMenuRef.current.getBoundingClientRect();
    setSuggestionPosition({
      top: rect.bottom + 4,
      left: rect.left,
    });
    setSuggestionProps({
      items,
      editor,
      range: null,
      command: (item: any) => {
        setSuggestionVisible(false);
        item.command({ editor, range: null });
      },
    });
    setSuggestionVisible(true);
  }, [editor, suggestionVisible]);

  useEffect(() => {
    if (!editor) return;
    const closeMenus = () => {
      tippyInstance.current?.hide();
      slashCommandTippy.current?.hide();
    };
    editor.on("transaction", closeMenus);
    const updatePlusButton = () => {
      const { selection } = editor.state;
      const { view } = editor;
      try {
        const coords = view.coordsAtPos(selection.from);
        const editorElement = view.dom.parentElement;
        if (editorElement) {
          const rect = editorElement.getBoundingClientRect();
          const contentElement = view.dom;
          const contentRect = contentElement.getBoundingClientRect();
          const isMobile = window.innerWidth < 768;
          setMenuPosition({
            top: coords.top - rect.top + editorElement.scrollTop,
            left: isMobile
              ? contentRect.left - rect.left + 4
              : contentRect.left - rect.left - 40,
          });
        }
      } catch (err) {
        setMenuPosition(null);
      }
    };
    editor.on("selectionUpdate", updatePlusButton);
    editor.on("focus", () => {
      closeMenus();
      updatePlusButton();
    });
    return () => {
      editor.off("transaction", closeMenus);
      editor.off("focus");
      editor.off("selectionUpdate", updatePlusButton);
    };
  }, [editor]);

  return (
    <div className="mb-12 relative group">
      {/* Subtle background glow for "illumination" */}
      <div className="absolute -inset-4 bg-yellow-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="flex items-center gap-3 mb-6 relative">
        <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
          <Lightbulb size={22} />
        </div>
        <div>
          <h2
            className="text-xl font-bold tracking-tight"
            style={{ color: "var(--text)" }}
          >
            Insights
          </h2>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Clarezas e percepções do dia
          </p>
        </div>
      </div>
      <div className="relative">
        {menuPosition && (
          <button
            ref={sideMenuRef}
            onPointerDown={(e) => { e.preventDefault(); handleSideMenuClick(); }}
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              transform: "translateY(-2px)",
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--muted)",
              boxShadow: "var(--shadow)",
              marginLeft: "-19px",
            }}
            className="absolute p-1 rounded hover:bg-[var(--surface-hover)] transition-all z-20 flex items-center justify-center border"
            title="Adicionar bloco"
          >
            <Plus size={18} className="md:w-5 md:h-5" />
          </button>
        )}
        <EditorContent editor={editor} />

        
            {createPortal(
              <AnimatePresence>
                {suggestionVisible && suggestionPosition && (
                  <div className="fixed inset-0 z-[9999] pointer-events-none">
                    
                <div
                  className="absolute bg-transparent"
                  style={{ inset: 0, pointerEvents: "auto" }}
                  onClick={() => setSuggestionVisible(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute pointer-events-auto min-w-[200px] bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden"
                  style={{
                    top: `${suggestionPosition.top}px`,
                    left: `${suggestionPosition.left}px`,
                  }}
                >
                  <SuggestionList
                    ref={suggestionRef}
                    {...suggestionProps}
                    onClose={() => setSuggestionVisible(false)}
                  />
                </motion.div>
              
                  </div>
                )}
              </AnimatePresence>,
              document.body
            )}
          
      </div>
    </div>
  );
};

const FreeWritingBlock = ({
  theme,
  title,
  id,
  onSelectionUpdate,
}: {
  theme: "light" | "dark";
  title: string;
  id?: string;
  onSelectionUpdate?: (editor: Editor) => void;
}) => {
  const [freeContent, setFreeContent] = useState(() => {
    if (id) {
      const entry = fakeDB.diaries.find((e) => String(e.id) === String(id));
      if (entry?.freeContent) return entry.freeContent;
    }
    return "";
  });
  const sideMenuRef = useRef<HTMLButtonElement>(null);
  const suggestionRef = useRef<any>(null);
  const [suggestionProps, setSuggestionProps] = useState<any>(null);
  const [suggestionPosition, setSuggestionPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [suggestionVisible, setSuggestionVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({
        placeholder: "Escreva livremente, sem estrutura...",
      }),
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      FontFamily,
      HorizontalRule,
      Color,
      Highlight.configure({ multicolor: true }),
      Table.configure({ resizable: true }),
      ImageCarousel,
      DocFolderBlock,
      AIBlock,
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({ lowlight }),
      Commands.configure({
        suggestion: {
          items: ({ query }: { query: string }) =>
            getSuggestionItems({ query, editor: editor! }),
          render: () => {
            return {
              onStart: (props: any) => {
                const { clientRect } = props;
                if (clientRect) {
                  const rect = clientRect();
                  if (rect) {
                    setSuggestionPosition({
                      top: rect.bottom + 4,
                      left: rect.left,
                    });
                  }
                }
                setSuggestionProps(props);
                setSuggestionVisible(true);
              },
              onUpdate(props: any) {
                const { clientRect } = props;
                if (clientRect) {
                  const rect = clientRect();
                  if (rect) {
                    setSuggestionPosition({
                      top: rect.bottom + 4,
                      left: rect.left,
                    });
                  }
                }
                setSuggestionProps(props);
              },
              onKeyDown(props: any) {
                if (props.event.key === "Escape") {
                  setSuggestionVisible(false);
                  return true;
                }
                return suggestionRef.current?.onKeyDown(props);
              },
              onExit() {
                setSuggestionVisible(false);
                setSuggestionProps(null);
                setSuggestionPosition(null);
              },
            };
          },
        },
      }),
    ],
    content: freeContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setFreeContent(html);
      if (id) fakeDB.updateDiaryEntry(id, { freeContent: html });
    },
    onSelectionUpdate: ({ editor }) => {
      onSelectionUpdate?.(editor);
    },
    onFocus: ({ editor }) => {
      onSelectionUpdate?.(editor);
    },
    editorProps: {
      attributes: {
        class: `prose ${theme === "dark" ? "prose-invert text-white" : "text-zinc-800"} max-w-[700px] mx-auto px-4 pt-2 pb-10 focus:outline-none min-h-[100px] font-sans`,
      },
    },
  });

  // Sincronizar conteúdo com o banco de dados dinamicamente após carregamento assíncrono
  useEffect(() => {
    if (!editor) return;
    const entry = id
      ? fakeDB.diaries.find((e) => String(e.id) === String(id))
      : null;
    const dbContent = entry?.freeContent || "";
    const currentHTML = editor.getHTML();
    if (dbContent !== currentHTML && !editor.isFocused) {
      editor.commands.setContent(dbContent);
      setFreeContent(dbContent);
    }
  }, [id, editor]);

  const handleSideMenuClick = useCallback(() => {
    if (!editor || !sideMenuRef.current) return;
    if (suggestionVisible) {
      setSuggestionVisible(false);
      return;
    }
    const items = getSuggestionItems({ query: "", editor });
    const rect = sideMenuRef.current.getBoundingClientRect();
    setSuggestionPosition({
      top: rect.bottom + 4,
      left: rect.left,
    });
    setSuggestionProps({
      items,
      editor,
      range: null,
      command: (item: any) => {
        setSuggestionVisible(false);
        item.command({ editor, range: null });
      },
    });
    setSuggestionVisible(true);
  }, [editor, suggestionVisible]);

  useEffect(() => {
    if (!editor) return;
    const closeMenus = () => {
      setSuggestionVisible(false);
    };
    editor.on("transaction", closeMenus);
    const updatePlusButton = () => {
      const { selection } = editor.state;
      const { view } = editor;
      try {
        const coords = view.coordsAtPos(selection.from);
        const editorElement = view.dom.parentElement;
        if (editorElement) {
          const rect = editorElement.getBoundingClientRect();
          const contentElement = view.dom;
          const contentRect = contentElement.getBoundingClientRect();
          const isMobile = window.innerWidth < 768;
          setMenuPosition({
            top: coords.top - rect.top + editorElement.scrollTop,
            left: isMobile
              ? contentRect.left - rect.left + 4
              : contentRect.left - rect.left - 40,
          });
        }
      } catch (err) {
        setMenuPosition(null);
      }
    };
    editor.on("selectionUpdate", updatePlusButton);
    editor.on("focus", () => {
      closeMenus();
      updatePlusButton();
    });
    return () => {
      editor.off("transaction", closeMenus);
      editor.off("focus");
      editor.off("selectionUpdate", updatePlusButton);
    };
  }, [editor]);

  return (
    <div className="mb-12 relative">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-zinc-500/10 text-zinc-400">
          <PenLine size={22} />
        </div>
        <div>
          <h2
            className="text-xl font-bold tracking-tight"
            style={{ color: "var(--text)" }}
          >
            Escrita Livre
          </h2>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Escreva livremente, sem estrutura
          </p>
        </div>
      </div>
      <div className="relative">
        {menuPosition && (
          <button
            ref={sideMenuRef}
            onPointerDown={(e) => { e.preventDefault(); handleSideMenuClick(); }}
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              transform: "translateY(-2px)",
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--muted)",
              boxShadow: "var(--shadow)",
              marginLeft: "-19px",
            }}
            className="absolute p-1 rounded hover:bg-[var(--surface-hover)] transition-all z-20 flex items-center justify-center border"
            title="Adicionar bloco"
          >
            <Plus size={18} className="md:w-5 md:h-5" />
          </button>
        )}
        <EditorContent editor={editor} />

        
            {createPortal(
              <AnimatePresence>
                {suggestionVisible && suggestionPosition && (
                  <div className="fixed inset-0 z-[9999] pointer-events-none">
                    
                <div
                  className="absolute bg-transparent"
                  style={{ inset: 0, pointerEvents: "auto" }}
                  onClick={() => setSuggestionVisible(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute pointer-events-auto min-w-[200px] bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden"
                  style={{
                    top: `${suggestionPosition.top}px`,
                    left: `${suggestionPosition.left}px`,
                  }}
                >
                  <SuggestionList
                    ref={suggestionRef}
                    {...suggestionProps}
                    onClose={() => setSuggestionVisible(false)}
                  />
                </motion.div>
              
                  </div>
                )}
              </AnimatePresence>,
              document.body
            )}
          
      </div>
    </div>
  );
};

const DayStateBlock = ({
  energy,
  setEnergy,
  mental,
  setMental,
  emotion,
  setEmotion,
  internalState,
  setInternalState,
  interferences,
  setInterferences,
  posture,
  setPosture,
  theme,
}: {
  energy: string[];
  setEnergy: (v: string[]) => void;
  mental: string[];
  setMental: (v: string[]) => void;
  emotion: string[];
  setEmotion: (v: string[]) => void;
  internalState: string[];
  setInternalState: (v: string[]) => void;
  interferences: string[];
  setInterferences: (v: string[]) => void;
  posture: string[];
  setPosture: (v: string[]) => void;
  theme: "light" | "dark";
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [customEnergy, setCustomEnergy] = useState<string[]>([]);
  const [customEmotion, setCustomEmotion] = useState<string[]>([]);
  const [customInternal, setCustomInternal] = useState<string[]>([]);
  const [customInterferences, setCustomInterferences] = useState<string[]>([]);
  const [customMental, setCustomMental] = useState<string[]>([]);
  const [customPosture, setCustomPosture] = useState<string[]>([]);

  const energyOptions = [
    { label: "Baixa", color: "zinc", hex: "#71717a", type: "negative" },
    { label: "Média", color: "amber", hex: "#f59e0b", type: "neutral" },
    { label: "Alta", color: "orange", hex: "#f97316", type: "positive" },
    { label: "Drenado", color: "slate", hex: "#64748b", type: "negative" },
    { label: "Saturado", color: "red", hex: "#ef4444", type: "negative" },
    { label: "Bloqueado", color: "stone", hex: "#78716c", type: "negative" },
    { label: "Vibrando", color: "emerald", hex: "#10b981", type: "positive" },
    { label: "Pesado", color: "neutral", hex: "#404040", type: "negative" },
    ...customEnergy.map((label) => ({
      label,
      color: "indigo",
      hex: "#6366f1",
      type: "neutral",
    })),
  ];

  const mentalOptions = [
    { label: "Foco", color: "green", hex: "#22c55e", type: "positive" },
    { label: "Confusão", color: "orange", hex: "#f97316", type: "negative" },
    { label: "Clareza", color: "sky", hex: "#0ea5e9", type: "positive" },
    { label: "Disperso", color: "pink", hex: "#ec4899", type: "negative" },
    { label: "Acelerado", color: "yellow", hex: "#eab308", type: "neutral" },
    { label: "Lento", color: "blue", hex: "#3b82f6", type: "negative" },
    { label: "Racional", color: "slate", hex: "#64748b", type: "neutral" },
    { label: "Criativo", color: "violet", hex: "#8b5cf6", type: "positive" },
    ...customMental.map((label) => ({
      label,
      color: "indigo",
      hex: "#6366f1",
      type: "neutral",
    })),
  ];

  const emotionOptions = [
    { label: "Calma", color: "blue", hex: "#3b82f6", type: "positive" },
    { label: "Alegria", color: "yellow", hex: "#eab308", type: "positive" },
    { label: "Ansiedade", color: "purple", hex: "#a855f7", type: "negative" },
    { label: "Tristeza", color: "indigo", hex: "#6366f1", type: "negative" },
    { label: "Irritação", color: "red", hex: "#ef4444", type: "negative" },
    {
      label: "Pressão Interna",
      color: "orange",
      hex: "#f97316",
      type: "negative",
    },
    { label: "Motivação", color: "emerald", hex: "#10b981", type: "positive" },
    { label: "Apatia", color: "zinc", hex: "#71717a", type: "negative" },
    ...customEmotion.map((label) => ({
      label,
      color: "indigo",
      hex: "#6366f1",
      type: "neutral",
    })),
  ];

  const internalOptions = [
    { label: "Conectado", color: "teal", hex: "#14b8a6", type: "positive" },
    { label: "Presente", color: "indigo", hex: "#6366f1", type: "positive" },
    { label: "Disperso", color: "pink", hex: "#ec4899", type: "negative" },
    { label: "Autolúcido", color: "rose", hex: "#f43f5e", type: "positive" },
    { label: "Automático", color: "slate", hex: "#64748b", type: "negative" },
    { label: "Observador", color: "emerald", hex: "#10b981", type: "positive" },
    { label: "Reativo", color: "red", hex: "#ef4444", type: "negative" },
    ...customInternal.map((label) => ({
      label,
      color: "indigo",
      hex: "#6366f1",
      type: "neutral",
    })),
  ];

  const interferenceOptions = [
    { label: "Assediado", color: "red", hex: "#ef4444", type: "negative" },
    {
      label: "Influenciado",
      color: "orange",
      hex: "#f97316",
      type: "negative",
    },
    { label: "Pesado", color: "neutral", hex: "#404040", type: "negative" },
    { label: "Instável", color: "amber", hex: "#f59e0b", type: "negative" },
    { label: "Sob Pressão", color: "rose", hex: "#f43f5e", type: "negative" },
    {
      label: "Desorganizado",
      color: "slate",
      hex: "#64748b",
      type: "negative",
    },
    ...customInterferences.map((label) => ({
      label,
      color: "indigo",
      hex: "#6366f1",
      type: "neutral",
    })),
  ];

  const postureOptions = [
    { label: "Agindo", color: "emerald", hex: "#10b981", type: "positive" },
    { label: "Travado", color: "red", hex: "#ef4444", type: "negative" },
    {
      label: "Procrastinando",
      color: "orange",
      hex: "#f97316",
      type: "negative",
    },
    { label: "Consistente", color: "blue", hex: "#3b82f6", type: "positive" },
    {
      label: "Disciplinado",
      color: "indigo",
      hex: "#6366f1",
      type: "positive",
    },
    { label: "Claro", color: "sky", hex: "#0ea5e9", type: "positive" },
    { label: "Perdido", color: "zinc", hex: "#71717a", type: "negative" },
    { label: "Indeciso", color: "amber", hex: "#f59e0b", type: "negative" },
    { label: "Alinhado", color: "teal", hex: "#14b8a6", type: "positive" },
    { label: "Crescimento", color: "lime", hex: "#84cc16", type: "positive" },
    { label: "Fuga", color: "rose", hex: "#f43f5e", type: "negative" },
    { label: "Conforto", color: "yellow", hex: "#eab308", type: "negative" },
    { label: "Evolução", color: "violet", hex: "#8b5cf6", type: "positive" },
    { label: "Obrigação", color: "slate", hex: "#64748b", type: "negative" },
    ...customPosture.map((label) => ({
      label,
      color: "indigo",
      hex: "#6366f1",
      type: "neutral",
    })),
  ];

  const steps = [
    {
      id: "energy",
      title: "Energossoma",
      subtitle: "Como está sua vitalidade?",
      icon: <Activity size={18} />,
      options: energyOptions,
      state: energy,
      setter: setEnergy,
      category: "Energia",
    },
    {
      id: "mental",
      title: "Mentalsoma",
      subtitle: "Qual o estado dos seus pensamentos?",
      icon: <Compass size={18} />,
      options: mentalOptions,
      state: mental,
      setter: setMental,
      category: "Mental",
    },
    {
      id: "emotion",
      title: "Holopensene",
      subtitle: "Como está o seu campo emocional?",
      icon: <Heart size={18} />,
      options: emotionOptions,
      state: emotion,
      setter: setEmotion,
      category: "Emocional",
    },
    {
      id: "internal",
      title: "Consciencial",
      subtitle: "Qual o seu nível de presença?",
      icon: <Activity size={18} />,
      options: internalOptions,
      state: internalState,
      setter: setInternalState,
      category: "Estado Interno",
    },
    {
      id: "interferences",
      title: "Interferências",
      subtitle: "Sente alguma pressão externa?",
      icon: <Activity size={18} />,
      options: interferenceOptions,
      state: interferences,
      setter: setInterferences,
      category: "Interferências",
    },
    {
      id: "posture",
      title: "Direção / Postura",
      subtitle: "Como você está se posicionando?",
      icon: <Compass size={18} />,
      options: postureOptions,
      state: posture,
      setter: setPosture,
      category: "Direção",
    },
  ];

  const toggleSelection = (
    list: string[],
    setList: (v: string[]) => void,
    item: string,
  ) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors: Record<string, string> = {
      zinc: isSelected
        ? "border-zinc-500 bg-zinc-500/20 text-zinc-500 shadow-[0_0_15px_rgba(113,113,122,0.3)]"
        : "border-zinc-500/10 text-zinc-500/40 hover:border-zinc-500/30",
      amber: isSelected
        ? "border-amber-500 bg-amber-500/20 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
        : "border-amber-500/10 text-amber-500/40 hover:border-amber-500/30",
      orange: isSelected
        ? "border-orange-500 bg-orange-500/20 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]"
        : "border-orange-500/10 text-orange-500/40 hover:border-orange-500/30",
      blue: isSelected
        ? "border-blue-500 bg-blue-500/20 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
        : "border-blue-500/10 text-blue-500/40 hover:border-blue-500/30",
      yellow: isSelected
        ? "border-yellow-500 bg-yellow-500/20 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
        : "border-yellow-500/10 text-yellow-500/40 hover:border-yellow-500/30",
      purple: isSelected
        ? "border-purple-500 bg-purple-500/20 text-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
        : "border-purple-500/10 text-purple-500/40 hover:border-purple-500/30",
      green: isSelected
        ? "border-green-500 bg-green-500/20 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
        : "border-green-500/10 text-green-500/40 hover:border-green-500/30",
      teal: isSelected
        ? "border-teal-500 bg-teal-500/20 text-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.3)]"
        : "border-teal-500/10 text-teal-500/40 hover:border-teal-500/30",
      pink: isSelected
        ? "border-pink-500 bg-pink-500/20 text-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]"
        : "border-pink-500/10 text-pink-500/40 hover:border-pink-500/30",
      indigo: isSelected
        ? "border-indigo-500 bg-indigo-500/20 text-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
        : "border-indigo-500/10 text-indigo-500/40 hover:border-indigo-500/30",
      slate: isSelected
        ? "border-slate-500 bg-slate-500/20 text-slate-500 shadow-[0_0_15px_rgba(100,116,139,0.3)]"
        : "border-slate-500/10 text-slate-500/40 hover:border-slate-500/30",
      emerald: isSelected
        ? "border-emerald-500 bg-emerald-500/20 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        : "border-emerald-500/10 text-emerald-500/40 hover:border-emerald-500/30",
      cyan: isSelected
        ? "border-cyan-500 bg-cyan-500/20 text-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
        : "border-cyan-500/10 text-cyan-500/40 hover:border-cyan-500/30",
      sky: isSelected
        ? "border-sky-500 bg-sky-500/20 text-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.3)]"
        : "border-sky-500/10 text-sky-500/40 hover:border-sky-500/30",
      violet: isSelected
        ? "border-violet-500 bg-violet-500/20 text-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
        : "border-violet-500/10 text-violet-500/40 hover:border-violet-500/30",
      lime: isSelected
        ? "border-lime-500 bg-lime-500/20 text-lime-500 shadow-[0_0_15px_rgba(132,204,22,0.3)]"
        : "border-lime-500/10 text-lime-500/40 hover:border-lime-500/30",
      rose: isSelected
        ? "border-rose-500 bg-rose-500/20 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
        : "border-rose-500/10 text-rose-500/40 hover:border-rose-500/30",
      red: isSelected
        ? "border-red-500 bg-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
        : "border-red-500/10 text-red-500/40 hover:border-red-500/30",
      stone: isSelected
        ? "border-stone-500 bg-stone-500/20 text-stone-500 shadow-[0_0_15px_rgba(120,113,108,0.3)]"
        : "border-stone-500/10 text-stone-500/40 hover:border-stone-500/30",
      neutral: isSelected
        ? "border-neutral-500 bg-neutral-500/20 text-neutral-500 shadow-[0_0_15px_rgba(64,64,64,0.3)]"
        : "border-neutral-500/10 text-neutral-500/40 hover:border-neutral-500/30",
    };
    return colors[color] || colors.zinc;
  };

  const handleAddCustom = (category: string) => {
    const val = prompt(`Adicionar novo estado em ${category}:`);
    if (val && val.trim()) {
      const label = val.trim();
      if (category === "Energia") {
        setCustomEnergy((prev) => [...prev, label]);
        setEnergy([...energy, label]);
      } else if (category === "Mental") {
        setCustomMental((prev) => [...prev, label]);
        setMental([...mental, label]);
      } else if (category === "Emocional") {
        setCustomEmotion((prev) => [...prev, label]);
        setEmotion([...emotion, label]);
      } else if (category === "Estado Interno") {
        setCustomInternal((prev) => [...prev, label]);
        setInternalState([...internalState, label]);
      } else if (category === "Interferências") {
        setCustomInterferences((prev) => [...prev, label]);
        setInterferences([...interferences, label]);
      } else if (category === "Direção") {
        setCustomPosture((prev) => [...prev, label]);
        setPosture([...posture, label]);
      }
    }
  };

  const getGuidance = () => {
    if (
      interferences.some((i) =>
        ["Assediado", "Influenciado", "Pesado"].includes(i),
      )
    ) {
      return "Realize uma manobra de exteriorização energética e reforce seu campo pessoal imediatamente.";
    }
    if (energy.some((e) => ["Baixa", "Drenado", "Saturado"].includes(e))) {
      return "Sua prioridade é a recuperação; reduza o ritmo e evite decisões complexas agora.";
    }
    if (posture.includes("Travado") || posture.includes("Procrastinando")) {
      if (internalState.includes("Presente") || mental.includes("Clareza")) {
        return "A clareza está presente; quebre a inércia com uma ação mínima de 2 minutos.";
      }
      return "Desconecte-se do resultado e foque apenas no movimento inicial, sem julgamento.";
    }
    if (
      emotion.includes("Ansiedade") &&
      energy.some((e) => ["Alta", "Vibrando"].includes(e))
    ) {
      return "Canalize o excesso de energia para uma atividade física intensa ou foco técnico absoluto.";
    }
    if (posture.includes("Disciplinado") || posture.includes("Consistente")) {
      if (energy.includes("Alta") || mental.includes("Foco")) {
        return "Fluxo de alta performance detectado; avance nos projetos que exigem maior carga cognitiva.";
      }
      return "Mantenha a consistência; o ritmo é mais importante que a velocidade hoje.";
    }
    if (mental.includes("Confusão") || posture.includes("Perdido")) {
      return "Pare o processamento mental; organize o ambiente físico para recuperar a ordem interna.";
    }
    if (emotion.includes("Irritação") || internalState.includes("Reativo")) {
      return "Recue para a posição de observador e evite interações impulsivas até recuperar o centro.";
    }
    if (
      internalState.includes("Autolúcido") ||
      internalState.includes("Conectado")
    ) {
      return "Aproveite a lucidez para realizar assistencialidade ou planejar seus próximos passos evolutivos.";
    }
    return "Mantenha a autovigilância constante e observe as nuances do seu estado consciencial.";
  };

  const activeStep = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isResultStep = currentStep === steps.length;

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const reset = () => {
    setCurrentStep(0);
    setEnergy([]);
    setMental([]);
    setEmotion([]);
    setInternalState([]);
    setInterferences([]);
    setPosture([]);
  };

  return (
    <div className="mb-16 md:mb-24 relative group isolate">
      <div className="relative space-y-4 md:space-y-6">
        <div className="flex flex-col gap-1 px-1">
          <h2
            className="text-xl md:text-2xl font-black tracking-tighter"
            style={{ color: "var(--text)" }}
          >
            Estado do Dia
          </h2>
          <p
            className="text-[10px] md:text-xs font-medium opacity-50"
            style={{ color: "var(--text)" }}
          >
            Condução guiada para o seu diagnóstico consciencial.
          </p>
        </div>

        <div
          className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] border bg-[var(--surface)]/20 backdrop-blur-xl shadow-xl transition-all duration-500"
          style={{ borderColor: "var(--border)" }}
        >
          <AnimatePresence mode="wait">
            {!isResultStep ? (
              <motion.div
                key={activeStep.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-5 md:p-8 space-y-6 md:space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                      {activeStep.icon}
                    </div>
                    <div>
                      <h3 className="text-[10px] md:text-sm font-black tracking-[0.2em] uppercase opacity-40">
                        {activeStep.title}
                      </h3>
                      <p className="text-[10px] md:text-xs font-medium opacity-60">
                        {activeStep.subtitle}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddCustom(activeStep.category)}
                    className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1"
                  >
                    <Plus size={10} className="md:w-3 md:h-3" /> Outro
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 md:gap-3">
                  {activeStep.options.map((opt) => (
                    <motion.button
                      key={opt.label}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        toggleSelection(
                          activeStep.state,
                          activeStep.setter,
                          opt.label,
                        )
                      }
                      className={`px-3 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl border text-[9px] md:text-[11px] font-black tracking-widest transition-all duration-300 ${getColorClasses(opt.color, activeStep.state.includes(opt.label))}`}
                    >
                      {opt.label.toUpperCase()}
                    </motion.button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                  <button
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className="px-4 md:px-6 py-2 rounded-xl text-[9px] md:text-[10px] font-black tracking-widest uppercase opacity-40 hover:opacity-100 disabled:opacity-0 transition-all"
                  >
                    Voltar
                  </button>
                  <div className="flex gap-1 md:gap-1.5">
                    {steps.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-1 md:h-1.5 h-1 md:w-1.5 rounded-full transition-all duration-500 ${idx === currentStep ? "w-3 md:w-4 bg-purple-500" : "bg-purple-500/20"}`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={handleNext}
                    className="px-6 md:px-8 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-purple-500 text-white text-[9px] md:text-[10px] font-black tracking-widest uppercase shadow-lg shadow-purple-500/20 hover:scale-105 transition-all"
                  >
                    {isLastStep ? "Finalizar" : "Próximo"}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 md:p-8 space-y-6 md:space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <Sparkles size={16} className="md:w-[18px] md:h-[18px]" />
                    </div>
                    <div>
                      <h3 className="text-[10px] md:text-sm font-black tracking-[0.2em] uppercase text-emerald-500">
                        Diagnóstico Concluído
                      </h3>
                      <p className="text-[10px] md:text-xs font-medium opacity-60">
                        Sua leitura consciencial está pronta.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={reset}
                    className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-purple-500 hover:opacity-70 transition-opacity"
                  >
                    Refazer
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                  <div className="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-purple-500/5 border border-purple-500/10 space-y-3 md:space-y-4">
                    <span className="text-[8px] md:text-[9px] font-black tracking-[0.3em] uppercase opacity-40">
                      Leitura Combinada
                    </span>
                    <p className="text-xs md:text-sm font-medium leading-relaxed italic opacity-80">
                      "Você está{" "}
                      <span className="font-black text-[var(--text)]">
                        {internalState.join(", ") || "em observação"}
                      </span>
                      ,
                      {posture.length > 0 ? (
                        <>
                          {" "}
                          porém sua direção atual é{" "}
                          <span className="font-black text-[var(--text)]">
                            {posture.join(", ")}
                          </span>
                          .
                        </>
                      ) : (
                        <> e ainda definindo sua postura.</>
                      )}
                    </p>
                  </div>

                  <div className="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-emerald-500/5 border border-emerald-500/10 space-y-3 md:space-y-4">
                    <span className="text-[8px] md:text-[9px] font-black tracking-[0.3em] uppercase text-emerald-500/60">
                      Direcionamento Prático
                    </span>
                    <p className="text-xs md:text-sm font-bold tracking-tight text-[var(--text)] flex items-start gap-2 md:gap-3">
                      <span className="text-base md:text-lg">👉</span>
                      {getGuidance()}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 md:gap-2 pt-4 border-t border-[var(--border)]">
                  {[
                    ...energy,
                    ...mental,
                    ...emotion,
                    ...internalState,
                    ...interferences,
                    ...posture,
                  ].map((tag, idx) => (
                    <span
                      key={`${tag}-${idx}`}
                      className="px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-[var(--surface-hover)] text-[9px] md:text-[10px] font-bold opacity-60 border border-[var(--border)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const MentorGuidanceBlock = ({
  theme,
  title,
  id,
  onSelectionUpdate,
}: {
  theme: "light" | "dark";
  title: string;
  id?: string;
  onSelectionUpdate?: (editor: Editor) => void;
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const [guidanceContent, setGuidanceContent] = useState(() => {
    if (id) {
      const entry = fakeDB.diaries.find((e) => String(e.id) === String(id));
      if (entry?.guidanceContent) return entry.guidanceContent;
    }
    return "";
  });
  const sideMenuRef = useRef<HTMLButtonElement>(null);
  const suggestionRef = useRef<any>(null);
  const [suggestionProps, setSuggestionProps] = useState<any>(null);
  const [suggestionPosition, setSuggestionPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [suggestionVisible, setSuggestionVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({
        placeholder: "Receba e escreva o direcionamento...",
      }),
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      FontFamily,
      HorizontalRule,
      Color,
      Highlight.configure({ multicolor: true }),
      Table.configure({ resizable: true }),
      ImageCarousel,
      DocFolderBlock,
      AIBlock,
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({ lowlight }),
      Commands.configure({
        suggestion: {
          items: ({ query }: { query: string }) =>
            getSuggestionItems({ query, editor: editor! }),
          render: () => {
            return {
              onStart: (props: any) => {
                const { clientRect } = props;
                if (clientRect) {
                  const rect = clientRect();
                  if (rect) {
                    setSuggestionPosition({
                      top: rect.bottom + 4,
                      left: rect.left,
                    });
                  }
                }
                setSuggestionProps(props);
                setSuggestionVisible(true);
              },
              onUpdate(props: any) {
                const { clientRect } = props;
                if (clientRect) {
                  const rect = clientRect();
                  if (rect) {
                    setSuggestionPosition({
                      top: rect.bottom + 4,
                      left: rect.left,
                    });
                  }
                }
                setSuggestionProps(props);
              },
              onKeyDown(props: any) {
                if (props.event.key === "Escape") {
                  setSuggestionVisible(false);
                  return true;
                }
                return suggestionRef.current?.onKeyDown(props);
              },
              onExit() {
                setSuggestionVisible(false);
                setSuggestionProps(null);
                setSuggestionPosition(null);
              },
            };
          },
        },
      }),
    ],
    content: guidanceContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setGuidanceContent(html);
      if (id) fakeDB.updateDiaryEntry(id, { guidanceContent: html });
    },
    onSelectionUpdate: ({ editor }) => {
      onSelectionUpdate?.(editor);
    },
    onFocus: ({ editor }) => {
      onSelectionUpdate?.(editor);
    },
    editorProps: {
      attributes: {
        class: `prose ${theme === "dark" ? "prose-invert text-white" : "text-zinc-800"} max-w-[800px] mx-auto px-8 py-16 focus:outline-none min-h-[150px] font-sans`,
      },
    },
  });

  // Sincronizar conteúdo com o banco de dados dinamicamente após carregamento assíncrono
  useEffect(() => {
    if (!editor) return;
    const entry = id
      ? fakeDB.diaries.find((e) => String(e.id) === String(id))
      : null;
    const dbContent = entry?.guidanceContent || "";
    const currentHTML = editor.getHTML();
    if (dbContent !== currentHTML && !editor.isFocused) {
      editor.commands.setContent(dbContent);
      setGuidanceContent(dbContent);
    }
  }, [id, editor]);

  const handleSideMenuClick = useCallback(() => {
    if (!editor || !sideMenuRef.current) return;
    if (suggestionVisible) {
      setSuggestionVisible(false);
      return;
    }
    const items = getSuggestionItems({ query: "", editor });
    const rect = sideMenuRef.current.getBoundingClientRect();
    setSuggestionPosition({
      top: rect.bottom + 4,
      left: rect.left,
    });
    setSuggestionProps({
      items,
      editor,
      range: null,
      command: (item: any) => {
        setSuggestionVisible(false);
        item.command({ editor, range: null });
      },
    });
    setSuggestionVisible(true);
  }, [editor, suggestionVisible]);

  useEffect(() => {
    if (!editor) return;
    const closeMenus = () => {
      setSuggestionVisible(false);
    };
    editor.on("transaction", closeMenus);
    const updatePlusButton = () => {
      const { selection } = editor.state;
      const { view } = editor;
      try {
        const coords = view.coordsAtPos(selection.from);
        const editorElement = view.dom.parentElement;
        if (editorElement) {
          const rect = editorElement.getBoundingClientRect();
          const contentElement = view.dom;
          const contentRect = contentElement.getBoundingClientRect();
          const isMob = window.innerWidth < 768;
          setMenuPosition({
            top: coords.top - rect.top + editorElement.scrollTop,
            left: isMob
              ? contentRect.left - rect.left + 4
              : contentRect.left - rect.left - 40,
          });
        }
      } catch (err) {
        setMenuPosition(null);
      }
    };
    editor.on("selectionUpdate", updatePlusButton);
    editor.on("focus", () => {
      closeMenus();
      updatePlusButton();
    });
    return () => {
      editor.off("transaction", closeMenus);
      editor.off("focus");
      editor.off("selectionUpdate", updatePlusButton);
    };
  }, [editor]);

  // Manual styles preserved for mobile as requested
  const mobileContainerStyle: React.CSSProperties = {
    width: "90vw",
    position: "relative",
    left: "50%",
    transform: "translateX(-50%)",
  };
  const mobileHeroStyle = {
    marginTop: "0px",
    marginBottom: "0px",
    height: "362.315px",
    width: "100%",
    paddingRight: "0px",
    marginRight: "0px",
    marginLeft: "0px",
    border: "none",
    borderRadius: "3.5rem",
  };
  const mobileWritingAreaStyle = {
    paddingTop: "8px",
    paddingBottom: "41px",
    paddingLeft: "0px",
  };

  return (
    <div
      className="mb-24 relative group"
      style={isMobile ? mobileContainerStyle : {}}
    >
      {/* HERO Header - 100% Fidelity Match to Image with Soft Edge Fade */}
      <div
        className="relative overflow-hidden rounded-[3.5rem] mb-12 flex flex-row items-stretch min-h-[280px] md:min-h-[340px] md:max-w-4xl md:mx-auto"
        style={{
          ...(isMobile ? mobileHeroStyle : {}),
          background: theme === "light" ? "white" : "#09090b",
          maskImage:
            "radial-gradient(circle at center, black 60%, transparent 100%), linear-gradient(to bottom, transparent, black 15%, black 85%, transparent), linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage:
            "radial-gradient(circle at center, black 60%, transparent 100%), linear-gradient(to bottom, transparent, black 15%, black 85%, transparent), linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
          border: "none",
          boxShadow: "none",
        }}
      >
        {/* Left Side: Rose and Aura (Always on left, fixed width for mobile) */}
        <div className="relative w-[42%] md:w-[45%] flex items-center justify-center overflow-visible p-4 md:p-12">
          {/* Continuous Animated Aura & Petals */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Soft Purple Glow */}
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-48 h-48 md:w-80 md:h-80 bg-purple-500/20 blur-[60px] md:blur-[100px] rounded-full"
            />

            {/* Star Aura (Pointy) */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
              className="absolute w-56 h-56 md:w-80 md:h-80 opacity-20"
            >
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full text-purple-500 fill-current"
              >
                <path d="M100 0 L103 97 L200 100 L103 103 L100 200 L97 103 L0 100 L97 97 Z" />
              </svg>
            </motion.div>

            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="absolute w-48 h-48 md:w-64 md:h-64 opacity-30 rotate-45"
            >
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full text-purple-400 fill-current"
              >
                <path d="M100 0 L103 97 L200 100 L103 103 L100 200 L97 103 L0 100 L97 97 Z" />
              </svg>
            </motion.div>

            {/* White Lotus Petals behind the rose */}
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-48 h-48 md:w-72 md:h-72 flex items-center justify-center"
            >
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <div
                  key={deg}
                  className={`absolute w-20 h-10 md:w-36 md:h-16 rounded-full blur-[1px] md:blur-[2px] bg-gradient-to-r to-transparent ${theme === "light" ? "from-black/5" : "from-white/90"}`}
                  style={{
                    transform: `rotate(${deg}deg) translateX(${window.innerWidth < 768 ? "25px" : "45px"})`,
                    opacity: theme === "light" ? 0.3 : 0.7,
                  }}
                />
              ))}
            </motion.div>

            {/* Floating Sparkles */}
            <div className="absolute top-1/4 left-1/4 text-purple-400/40 animate-pulse">
              <Sparkles size={8} />
            </div>
            <div
              className="absolute bottom-1/4 right-1/4 text-purple-400/40 animate-pulse"
              style={{ animationDelay: "1.5s" }}
            >
              <Sparkles size={12} />
            </div>
          </div>

          {/* The Amparadora Image (Continuous Breathing Animation) */}
          <motion.div
            animate={{
              scale: [1, 1.02, 1],
              rotate: [0, 0.5, 0, -0.5, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 w-48 h-64 md:w-72 md:h-96 flex items-center justify-center"
          >
            {/* Asymmetric Layered Borders - 100% Fidelity to Request with Silver-Black Animation */}
            <div className="absolute -inset-6 border-[3px] border-zinc-800 rounded-[2.5rem] rotate-6 scale-110 blur-[1px] animate-silver-black-reluzente" />
            <div className="absolute -inset-4 border-2 border-zinc-700 rounded-[3.5rem] -rotate-3 scale-105 animate-silver-black-reluzente" />
            <div className="absolute -inset-2 bg-gradient-to-br from-white/5 to-transparent rounded-[2rem] blur-xl" />

            <div className="relative w-full h-full overflow-hidden rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.4)] border-[6px] border-zinc-800 animate-silver-black-reluzente transition-colors duration-500">
              {/* High-fidelity Image (User provided link) */}
              <img
                src="https://d363e3cb0fedde3cc603722077e49900.cdn.bubble.io/f1776312777859x497477088948183230/file_00000000784071f58b78d26239086bee.png"
                alt="Amparadora"
                className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
                style={{
                  filter: "brightness(1.05) contrast(1.1) saturate(1.1)",
                }}
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Floating Detail Elements around the image */}
            <motion.div
              animate={{
                y: [0, -15, 0],
                rotate: [0, 10, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-8 -right-8 w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 flex items-center justify-center shadow-2xl z-20"
            >
              <Sparkles size={24} className="text-purple-300" />
            </motion.div>

            <motion.div
              animate={{
                y: [0, 15, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute -bottom-6 -left-6 w-10 h-10 bg-purple-600/30 backdrop-blur-md rounded-full border border-purple-400/40 shadow-lg"
            />

            {/* Extra Layer: Glass card behind */}
            <div className="absolute -z-10 inset-0 bg-white/5 backdrop-blur-sm rounded-[2rem] translate-x-4 translate-y-4 border border-white/10" />
          </motion.div>
        </div>

        {/* Vertical Divider with Star (Visible on mobile too) */}
        <div className="relative w-px flex items-center justify-center py-8">
          <div className="h-full w-full bg-purple-500/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-purple-500 bg-white dark:bg-zinc-950 rounded-full flex items-center justify-center z-10">
            <div className="w-3 h-3 text-purple-600">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Right Side: Content */}
        <div className="flex-1 p-4 md:p-16 flex flex-col justify-center space-y-3 md:space-y-6 text-left">
          {/* Badge */}
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1 rounded-full bg-purple-500/5 border border-purple-500/10">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 text-purple-600 dark:text-purple-400">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
                </svg>
              </div>
              <span className="text-[8px] md:text-[10px] font-black tracking-[0.3em] text-purple-900/90 dark:text-purple-200/90 uppercase">
                Amparadora
              </span>
            </div>
          </div>

          {/* Titles */}
          <div className="space-y-0.5 md:space-y-2">
            <h2
              className={`text-lg md:text-4xl font-bold tracking-tight leading-tight ${theme === "light" ? "text-[#0f172a]" : "text-white"}`}
            >
              Direcionamento da Amparadora
            </h2>
            <h3 className="text-[11px] md:text-lg text-zinc-500 dark:text-zinc-400 font-medium">
              Ajuste sua direção com consciência.
            </h3>
          </div>

          {/* Footer Note */}
          <div className="flex items-center justify-start gap-2 md:gap-3 pt-3 md:pt-4 border-t border-purple-500/5">
            <div className="text-purple-600/70">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M12 22c-1.5-2-3.5-4-3.5-6.5 0-2 1.5-3.5 3.5-3.5s3.5 1.5 3.5 3.5c0 2.5-2 4.5-3.5 6.5z"
                  opacity="0.4"
                />
                <path d="M12 22c-2.5-1.5-5-3.5-5-6.5 0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5c0 3-2.5 5-5 6.5z" />
                <path d="M12 22c2.5-1.5 5-3.5 5-6.5 0-2.5-2-4.5-4.5-4.5s-4.5 2-4.5 4.5c0 3 2.5 5 5 6.5z" />
              </svg>
            </div>
            <p className="text-[9px] md:text-sm text-zinc-400 dark:text-zinc-500 leading-relaxed">
              Este é um momento de escuta.{" "}
              <span
                className={`font-bold ${theme === "light" ? "text-[#1e293b]" : "text-zinc-300"}`}
              >
                Confie
              </span>{" "}
              na orientação que chega.
            </p>
          </div>
        </div>
      </div>

      {/* Writing Field - Fluid and Organic Integration */}
      <div className="relative mt-2 px-4 md:px-0">
        {/* Atmospheric Glow behind the writing area */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-full bg-purple-500/[0.02] blur-[120px] pointer-events-none" />

        <div className="relative">
          {menuPosition && (
            <button
              ref={sideMenuRef}
              onPointerDown={(e) => { e.preventDefault(); handleSideMenuClick(); }}
              style={{
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
                transform: "translateY(-2px)",
                backgroundColor: "var(--surface)",
                borderColor: "var(--border)",
                color: "var(--muted)",
                boxShadow: "var(--shadow)",
                paddingRight: "4px",
                marginLeft: "-19px",
              }}
              className="absolute p-1 rounded hover:bg-[var(--surface-hover)] transition-all z-20 flex items-center justify-center border"
              title="Adicionar bloco"
            >
              <Plus size={18} className="md:w-5 md:h-5" />
            </button>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            viewport={{ once: true }}
            className="relative z-10"
            style={{
              marginTop: "0px",
              marginBottom: "-34px",
              paddingBottom: "25px",
            }}
          >
            {/* The "Dissolving" Container with side fades - Applied User Manual Styles */}
            <div
              className="relative transition-all duration-1000 max-w-[807px] mx-auto rounded-[2.5rem] prose dark:prose-invert"
              style={{
                paddingTop: isMobile
                  ? mobileWritingAreaStyle.paddingTop
                  : "32px",
                paddingBottom: isMobile
                  ? mobileWritingAreaStyle.paddingBottom
                  : "16px",
                paddingLeft: isMobile
                  ? mobileWritingAreaStyle.paddingLeft
                  : "32px",
                marginBottom: "-34px",
                marginTop: isMobile ? "0px" : "-45px",
                background:
                  theme === "light" ? "#f1f8ff" : "rgba(9, 9, 11, 0.6)",
                maskImage:
                  "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
              }}
            >
              <EditorContent editor={editor} />
            </div>

            
            {createPortal(
              <AnimatePresence>
                {suggestionVisible && suggestionPosition && (
                  <div className="fixed inset-0 z-[9999] pointer-events-none">
                    
                    <div
                      className="absolute bg-transparent"
                      style={{ inset: 0, pointerEvents: "auto" }}
                      onClick={() => setSuggestionVisible(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute pointer-events-auto min-w-[200px] bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden"
                      style={{
                        top: `${suggestionPosition.top}px`,
                        left: `${suggestionPosition.left}px`,
                      }}
                    >
                      <SuggestionList
                        ref={suggestionRef}
                        {...suggestionProps}
                        onClose={() => setSuggestionVisible(false)}
                      />
                    </motion.div>
                  
                  </div>
                )}
              </AnimatePresence>,
              document.body
            )}
          

            {/* Subtle floating particles for atmosphere */}
            <div className="absolute -top-12 left-1/3 w-1 h-1 bg-purple-400/20 rounded-full animate-pulse" />
            <div
              className="absolute top-24 right-1/4 w-1.5 h-1.5 bg-purple-300/10 rounded-full animate-pulse"
              style={{ animationDuration: "4s" }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// BLOCO 11: Consolidação do Dia
const DayConsolidationBlock = ({
  theme,
  id,
  onSelectionUpdate,
}: {
  theme: "light" | "dark";
  id?: string;
  onSelectionUpdate?: (editor: Editor) => void;
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const [consolidationContent, setConsolidationContent] = useState(() => {
    if (id) {
      const entry = fakeDB.diaries.find((e) => String(e.id) === String(id));
      if (entry?.consolidationContent) return entry.consolidationContent;
    }
    return "";
  });
  const sideMenuRef = useRef<HTMLButtonElement>(null);
  const suggestionRef = useRef<any>(null);
  const [suggestionProps, setSuggestionProps] = useState<any>(null);
  const [suggestionPosition, setSuggestionPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [suggestionVisible, setSuggestionVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({
        placeholder: "O que este dia prova sobre quem você está se tornando?",
      }),
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      FontFamily,
      HorizontalRule,
      Color,
      Highlight.configure({ multicolor: true }),
      Table.configure({ resizable: true }),
      ImageCarousel,
      DocFolderBlock,
      AIBlock,
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({ lowlight }),
      Commands.configure({
        suggestion: {
          items: ({ query }: { query: string }) =>
            getSuggestionItems({ query, editor: editor! }),
          render: () => {
            return {
              onStart: (props: any) => {
                const { clientRect } = props;
                if (clientRect) {
                  const rect = clientRect();
                  if (rect) {
                    setSuggestionPosition({
                      top: rect.bottom + 4,
                      left: rect.left,
                    });
                  }
                }
                setSuggestionProps(props);
                setSuggestionVisible(true);
              },
              onUpdate(props: any) {
                const { clientRect } = props;
                if (clientRect) {
                  const rect = clientRect();
                  if (rect) {
                    setSuggestionPosition({
                      top: rect.bottom + 4,
                      left: rect.left,
                    });
                  }
                }
                setSuggestionProps(props);
              },
              onKeyDown(props: any) {
                if (props.event.key === "Escape") {
                  setSuggestionVisible(false);
                  return true;
                }
                return suggestionRef.current?.onKeyDown(props);
              },
              onExit() {
                setSuggestionVisible(false);
                setSuggestionProps(null);
                setSuggestionPosition(null);
              },
            };
          },
        },
      }),
    ],
    content: consolidationContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setConsolidationContent(html);
      if (id) fakeDB.updateDiaryEntry(id, { consolidationContent: html });
    },
    onSelectionUpdate: ({ editor }) => {
      onSelectionUpdate?.(editor);
    },
    onFocus: ({ editor }) => {
      onSelectionUpdate?.(editor);
    },
    editorProps: {
      attributes: {
        class: `prose ${theme === "dark" ? "prose-invert text-white" : "text-zinc-800"} max-w-[800px] mx-auto px-8 py-16 focus:outline-none min-h-[150px] font-sans`,
      },
    },
  });

  // Sincronizar conteúdo com o banco de dados dinamicamente após carregamento assíncrono
  useEffect(() => {
    if (!editor) return;
    const entry = id
      ? fakeDB.diaries.find((e) => String(e.id) === String(id))
      : null;
    const dbContent = entry?.consolidationContent || "";
    const currentHTML = editor.getHTML();
    if (dbContent !== currentHTML && !editor.isFocused) {
      editor.commands.setContent(dbContent);
      setConsolidationContent(dbContent);
    }
  }, [id, editor]);

  const handleSideMenuClick = useCallback(() => {
    if (!editor || !sideMenuRef.current) return;
    if (suggestionVisible) {
      setSuggestionVisible(false);
      return;
    }
    const items = getSuggestionItems({ query: "", editor });
    const rect = sideMenuRef.current.getBoundingClientRect();
    setSuggestionPosition({
      top: rect.bottom + 4,
      left: rect.left,
    });
    setSuggestionProps({
      items,
      editor,
      range: null,
      command: (item: any) => {
        setSuggestionVisible(false);
        item.command({ editor, range: null });
      },
    });
    setSuggestionVisible(true);
  }, [editor, suggestionVisible]);

  useEffect(() => {
    if (!editor) return;
    const closeMenus = () => {
      setSuggestionVisible(false);
    };
    editor.on("transaction", closeMenus);
    const updatePlusButton = () => {
      const { selection } = editor.state;
      const { view } = editor;
      try {
        const coords = view.coordsAtPos(selection.from);
        const editorElement = view.dom.parentElement;
        if (editorElement) {
          const rect = editorElement.getBoundingClientRect();
          const contentElement = view.dom;
          const contentRect = contentElement.getBoundingClientRect();
          const isMob = window.innerWidth < 768;
          setMenuPosition({
            top: coords.top - rect.top + editorElement.scrollTop,
            left: isMob
              ? contentRect.left - rect.left + 4
              : contentRect.left - rect.left - 40,
          });
        }
      } catch (err) {
        setMenuPosition(null);
      }
    };
    editor.on("selectionUpdate", updatePlusButton);
    editor.on("focus", () => {
      closeMenus();
      updatePlusButton();
    });
    return () => {
      editor.off("transaction", closeMenus);
      editor.off("focus");
      editor.off("selectionUpdate", updatePlusButton);
    };
  }, [editor]);

  // Manual styles preserved for mobile as requested
  const mobileHeroStyle = {
    border: "none",
    marginBottom: "-65px",
    marginTop: "5px",
    width: "337.078px",
    height: "320.518px",
    paddingTop: "18px",
  };
  const mobileImageSideStyle = {
    paddingLeft: "5px",
    paddingTop: "21px",
    paddingRight: "5px",
    paddingBottom: "16px",
    marginLeft: "0px",
    marginTop: "0px",
    marginBottom: "0px",
  };
  const mobileSparkleStyle = {
    width: "29.993px",
    height: "54.9907px",
    marginRight: "0px",
    marginLeft: "-3px",
    paddingRight: "0px",
    paddingLeft: "-1px",
  };
  const mobileTitleStyle = {
    width: "180.519px",
    marginBottom: "2px",
    marginRight: "0px",
  };
  const mobileWritingAreaStyle = {
    marginTop: "-13px",
    marginBottom: "-10px",
    paddingBottom: "18px",
    height: "379.311px",
  };
  const mobileEditorWrapperStyle = {
    height: "443.994px",
    marginBottom: "-21px",
    marginTop: "0px",
    marginLeft: "0px",
    paddingTop: "0px",
    paddingBottom: "0px",
    width: "256.767px",
  };

  // Manual styles for desktop as requested
  const desktopContentStyle = { paddingLeft: "30px", paddingRight: "0px" };
  const desktopWritingAreaInnerStyle = { marginTop: "-155px" };
  const desktopSparkleIconStyle = { marginTop: "24px", color: "#007200" };
  const desktopDividerSparkleContainerStyle = { height: "85.9987px" };
  const desktopDividerSparkleIconStyle = { color: "#b50000" };
  const desktopEditorWrapperStyle = {
    marginBottom: "-54px",
    marginTop: "0px",
    paddingTop: "-10px",
    paddingBottom: "-15px",
    height: "463.994px",
  };

  return (
    <div className="mb-24 relative group">
      {/* HERO Header - Transparent Background, Theme-responsive Colors */}
      <div
        className="relative overflow-hidden rounded-[3.5rem] border transition-all duration-700 mb-6 bg-transparent border-purple-500/10 dark:border-white/10 shadow-sm md:max-w-4xl md:mx-auto md:mb-12 md:shadow-none md:border-purple-500/5"
        style={isMobile ? mobileHeroStyle : {}}
      >
        <div className="relative flex flex-row items-stretch min-h-[240px] md:min-h-[340px]">
          {/* Left Side: Larger Image and Asymmetric Animated Borders (Side-by-side on mobile) */}
          <div
            className="relative w-[42%] md:w-[45%] flex items-center justify-center p-4 md:p-12 overflow-visible"
            style={isMobile ? mobileImageSideStyle : {}}
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute w-32 h-32 md:w-[400px] md:h-[400px] bg-purple-400/20 blur-[40px] md:blur-[120px] rounded-full"
              />
            </div>

            <motion.div
              animate={{
                scale: [1, 1.03, 1],
                rotate: [0, 1, 0, -1, 0],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 w-32 aspect-[9/16] md:w-80 md:aspect-[9/16] flex items-center justify-center"
            >
              {/* Animated Asymmetric Borders - Maintaining 9:16 feel with Silver-Black Animation */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 md:-inset-12 border-[2px] md:border-[4px] border-zinc-800 rounded-[2rem] md:rounded-[4rem] opacity-60 animate-silver-black-reluzente"
                style={{ borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }}
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-3 md:-inset-8 border md:border-2 border-zinc-700 rounded-[2.5rem] md:rounded-[5rem] opacity-40 animate-silver-black-reluzente"
                style={{ borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" }}
              />
              <div
                className="absolute -inset-1 md:-inset-3 bg-white/40 dark:bg-white/5 backdrop-blur-sm rounded-[1.5rem] md:rounded-[3rem] shadow-xl"
                style={
                  isMobile
                    ? {
                        paddingLeft: "0px",
                        paddingTop: "0px",
                        marginTop: "-9px",
                      }
                    : {}
                }
              />

              <div className="relative w-full h-full overflow-hidden rounded-[1.5rem] md:rounded-[2.8rem] shadow-2xl border-[4px] md:border-[8px] border-zinc-800 animate-silver-black-reluzente">
                <img
                  src="https://d363e3cb0fedde3cc603722077e49900.cdn.bubble.io/f1776312777859x497477088948183230/file_00000000784071f58b78d26239086bee.png"
                  alt="Consolidation Mentor"
                  className="w-full h-full object-cover scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Floating Sparkles */}
              <motion.div
                animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 md:-top-10 md:-right-10 text-purple-400"
                style={
                  isMobile
                    ? { color: "#00c276" }
                    : !isMobile
                      ? desktopSparkleIconStyle
                      : {}
                }
              >
                <Sparkles size={16} className="md:w-10 md:h-10" />
              </motion.div>
            </motion.div>
          </div>

          {/* Vertical Divider */}
          <div className="relative w-px flex items-center justify-center py-6 md:py-20">
            <div className="h-full w-full bg-gradient-to-b from-transparent via-purple-500/20 to-transparent" />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 md:w-12 md:h-12 text-purple-500 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center z-10 border border-purple-100 dark:border-white/10 shadow-sm"
              style={
                isMobile
                  ? mobileSparkleStyle
                  : desktopDividerSparkleContainerStyle
              }
            >
              <Sparkles
                size={12}
                className="md:w-6 md:h-6"
                style={
                  isMobile
                    ? { color: "#a70000" }
                    : !isMobile
                      ? desktopDividerSparkleIconStyle
                      : {}
                }
              />
            </div>
          </div>

          {/* Right Side: Content */}
          <div
            className="flex-1 p-4 md:p-16 flex flex-col justify-center space-y-3 md:space-y-6"
            style={!isMobile ? desktopContentStyle : {}}
          >
            <div className="space-y-2 md:space-y-4">
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-1.5 md:gap-3 px-3 md:px-6 py-1 md:py-2 rounded-full bg-purple-500/5 border border-purple-500/10">
                  <Sparkles
                    size={10}
                    className="text-purple-600 dark:text-purple-400 md:w-4 md:h-4"
                  />
                  <span className="text-[8px] md:text-xs font-black tracking-[0.4em] text-purple-900/90 dark:text-purple-200/90 uppercase">
                    BLOCO 11
                  </span>
                </div>
              </div>

              <div className="space-y-0.5 md:space-y-2">
                <h2
                  className={`text-lg md:text-4xl font-bold tracking-tight leading-tight ${theme === "light" ? "text-[#0f172a]" : "text-white"}`}
                  style={isMobile ? mobileTitleStyle : {}}
                >
                  Consolidação do Dia
                </h2>
                <h3 className="text-[10px] md:text-lg text-zinc-500 dark:text-zinc-400 font-medium">
                  Transforme suas experiências em evolução consciente.
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 pt-2 md:pt-4 border-t border-purple-500/10">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-purple-500 animate-pulse" />
              <p className="text-[9px] md:text-sm text-zinc-400 dark:text-zinc-500 leading-relaxed italic">
                <span
                  className="font-bold text-purple-600 dark:text-purple-400"
                  style={
                    isMobile
                      ? { color: theme === "light" ? "#0012bf" : "#818cf8" }
                      : {}
                  }
                >
                  Veja, compreenda e integre
                </span>{" "}
                seu crescimento.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Writing Area - Positioned Below the Header with Theme-responsive Background */}
      <div className="relative px-4 md:px-0 md:mt-12">
        <div
          className={`relative transition-all duration-500 rounded-[2.5rem] border p-6 md:p-12 max-w-[807px] mx-auto
            ${
              theme === "light"
                ? "bg-gradient-to-br from-[#fffdfa] via-[#fdfaff] to-[#fff5f9] border-purple-200/40 shadow-inner"
                : "bg-white/5 border-white/10 shadow-2xl"
            }`}
          style={
            isMobile ? mobileWritingAreaStyle : desktopWritingAreaInnerStyle
          }
        >
          <div className="relative">
            {menuPosition && (
              <button
                ref={sideMenuRef}
                onPointerDown={(e) => { e.preventDefault(); handleSideMenuClick(); }}
                style={{
                  top: `${menuPosition.top}px`,
                  left: `${menuPosition.left}px`,
                  transform: "translateY(-2px)",
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--muted)",
                  boxShadow: "var(--shadow)",
                  paddingRight: "4px",
                  marginLeft: "-19px",
                  marginTop: "88px",
                  marginRight: "0px",
                  marginBottom: "0px",
                }}
                className="absolute p-1 rounded hover:bg-[var(--surface-hover)] transition-all z-20 flex items-center justify-center border"
                title="Adicionar bloco"
              >
                <Plus size={18} className="md:w-5 md:h-5" />
              </button>
            )}

            <div className="prose dark:prose-invert max-w-none text-base md:text-xl">
              <div
                style={
                  isMobile
                    ? mobileEditorWrapperStyle
                    : desktopEditorWrapperStyle
                }
              >
                {/* Block Toolbar */}
                {editor && (
                  <div className="flex flex-wrap items-center gap-1 mb-4 p-1 border-b border-purple-500/10 pb-2 sticky top-0 z-20 bg-inherit backdrop-blur-sm">
                    <button
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      className={`p-1.5 rounded hover:bg-purple-500/10 transition-colors ${editor.isActive("bold") ? "text-purple-600 bg-purple-500/10" : "text-zinc-500"}`}
                    >
                      <Bold size={16} />
                    </button>
                    <button
                      onClick={() =>
                        editor.chain().focus().toggleItalic().run()
                      }
                      className={`p-1.5 rounded hover:bg-purple-500/10 transition-colors ${editor.isActive("italic") ? "text-purple-600 bg-purple-500/10" : "text-zinc-500"}`}
                    >
                      <Italic size={16} />
                    </button>
                    <button
                      onClick={() =>
                        editor.chain().focus().toggleUnderline().run()
                      }
                      className={`p-1.5 rounded hover:bg-purple-500/10 transition-colors ${editor.isActive("underline") ? "text-purple-600 bg-purple-500/10" : "text-zinc-500"}`}
                    >
                      <UnderlineIcon size={16} />
                    </button>
                    <div className="w-px h-4 bg-purple-500/10 mx-1" />
                    <button
                      onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 1 }).run()
                      }
                      className={`p-1.5 rounded hover:bg-purple-500/10 transition-colors ${editor.isActive("heading", { level: 1 }) ? "text-purple-600 bg-purple-500/10" : "text-zinc-500"}`}
                    >
                      <Heading1 size={16} />
                    </button>
                    <button
                      onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                      }
                      className={`p-1.5 rounded hover:bg-purple-500/10 transition-colors ${editor.isActive("heading", { level: 2 }) ? "text-purple-600 bg-purple-500/10" : "text-zinc-500"}`}
                    >
                      <Heading2 size={16} />
                    </button>
                    <div className="w-px h-4 bg-purple-500/10 mx-1" />
                    <button
                      onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                      }
                      className={`p-1.5 rounded hover:bg-purple-500/10 transition-colors ${editor.isActive("bulletList") ? "text-purple-600 bg-purple-500/10" : "text-zinc-500"}`}
                    >
                      <List size={16} />
                    </button>
                    <button
                      onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                      }
                      className={`p-1.5 rounded hover:bg-purple-500/10 transition-colors ${editor.isActive("orderedList") ? "text-purple-600 bg-purple-500/10" : "text-zinc-500"}`}
                    >
                      <ListOrdered size={16} />
                    </button>
                    <div className="w-px h-4 bg-purple-500/10 mx-1" />
                    <button
                      onClick={() =>
                        editor.chain().focus().setTextAlign("left").run()
                      }
                      className={`p-1.5 rounded hover:bg-purple-500/10 transition-colors ${editor.isActive({ textAlign: "left" }) ? "text-purple-600 bg-purple-500/10" : "text-zinc-500"}`}
                    >
                      <AlignLeft size={16} />
                    </button>
                    <button
                      onClick={() =>
                        editor.chain().focus().setTextAlign("center").run()
                      }
                      className={`p-1.5 rounded hover:bg-purple-500/10 transition-colors ${editor.isActive({ textAlign: "center" }) ? "text-purple-600 bg-purple-500/10" : "text-zinc-500"}`}
                    >
                      <AlignCenter size={16} />
                    </button>
                    <div className="w-px h-4 bg-purple-500/10 mx-1" />
                    <button
                      onClick={() => editor.chain().focus().undo().run()}
                      className="p-1.5 rounded hover:bg-purple-500/10 transition-colors text-zinc-500"
                    >
                      <Undo size={16} />
                    </button>
                    <button
                      onClick={() => editor.chain().focus().redo().run()}
                      className="p-1.5 rounded hover:bg-purple-500/10 transition-colors text-zinc-500"
                    >
                      <Redo size={16} />
                    </button>
                  </div>
                )}
                <EditorContent editor={editor} />
              </div>
            </div>

            
            {createPortal(
              <AnimatePresence>
                {suggestionVisible && suggestionPosition && (
                  <div className="fixed inset-0 z-[9999] pointer-events-none">
                    
                    <div
                      className="absolute bg-transparent"
                      style={{ inset: 0, pointerEvents: "auto" }}
                      onClick={() => setSuggestionVisible(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute pointer-events-auto min-w-[200px] bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden"
                      style={{
                        top: `${suggestionPosition.top}px`,
                        left: `${suggestionPosition.left}px`,
                      }}
                    >
                      <SuggestionList
                        ref={suggestionRef}
                        {...suggestionProps}
                        onClose={() => setSuggestionVisible(false)}
                      />
                    </motion.div>
                  
                  </div>
                )}
              </AnimatePresence>,
              document.body
            )}
          
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DiaryEditorPage({
  content,
  onUpdate,
  onEditorReady,
  theme,
  onToggleTheme,
  onToggleSidebar,
}: EditorProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [title, setTitle] = useState("Novo Diário");
  const [description, setDescription] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const generateAISummary = async () => {
    if (!editor || isGeneratingSummary) return;

    setIsGeneratingSummary(true);
    try {
      const content = editor.getHTML();
      // Remover tags HTML para o prompt
      const textContent = content.replace(/<[^>]*>?/gm, " ");

      // Fazer as duas requisições de IA em paralelo
      const [summary, semanticAnalysis] = await Promise.all([
        aiService.generateDiarySummary(textContent),
        id && currentEntry
          ? aiService.generateDiarySemanticAnalysis(currentEntry)
          : Promise.resolve(null),
      ]);

      setDescription(summary);
      if (id) {
        const updates: any = { description: summary };
        if (semanticAnalysis) {
          // Mesclar as propriedades cognitivas extraídas por IA
          Object.assign(updates, semanticAnalysis);
        }
        fakeDB.updateDiaryEntry(id, updates);
      }
    } catch (error) {
      console.error("Erro ao gerar resumo e analise semantica:", error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };
  const [currentEntry, setCurrentEntry] = useState<any>(null);

  const [tasksRefreshKey, setTasksRefreshKey] = useState<number>(0);
  const [activeInlineTaskId, setActiveInlineTaskId] = useState<string | null>(null);
  const [isInlinePaused, setIsInlinePaused] = useState<boolean>(false);
  const [inlineElapsedSeconds, setInlineElapsedSeconds] = useState<number>(0);
  const [selectedTaskForExecution, setSelectedTaskForExecution] = useState<any>(null);
  const [isExecutionModalOpen, setIsExecutionModalOpen] = useState<boolean>(false);

  useEffect(() => {
    fakeDB.syncWithBackend()
      .then(() => setTasksRefreshKey(prev => prev + 1))
      .catch(err => console.warn('[DiaryEditor] Erro ao sincronizar tarefas:', err));
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeInlineTaskId && !isInlinePaused) {
      interval = setInterval(() => {
        setInlineElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeInlineTaskId, isInlinePaused]);

  useEffect(() => {
    const handleGoalUpdated = () => {
      setTasksRefreshKey(prev => prev + 1);
    };
    const unsubscribe = organismEventBus.subscribe('goalUpdated', handleGoalUpdated);
    return () => {
      unsubscribe();
    };
  }, []);

  const mappedTasks = useMemo(() => {
    const realTasks = fakeDB.tasks.filter((t: any) => {
      const hasDate = !!t.date;
      const isRecurring = t.executionType && t.executionType !== 'standard';
      return isRecurring || hasDate;
    });

    return realTasks.map((t: any) => {
      const metaId = (t.projectId && t.projectId !== 'none') 
        ? fakeDB.projects.find((p: any) => p.id === t.projectId)?.goalId 
        : t.goalId;

      const meta = fakeDB.goals.find((g: any) => g.id === metaId);
      const objective = meta ? fakeDB.objectives.find((o: any) => o.id === meta.objectiveId) : null;

      return {
        ...t,
        id: t.id,
        title: t.title,
        status: t.status === 'done' || t.status === 'completed' ? 'completed' : t.status === 'doing' || t.status === 'in-progress' ? 'in-progress' : 'todo',
        metaId: metaId || 'none',
        objectiveTitle: objective ? objective.title : 'Estratégia',
        metaIntention: meta ? (meta.intention || meta.title) : 'Ação Estratégica',
        estimatedDuration: t.estimatedDuration || '30m',
        actualDuration: t.actualDuration || 0,
        priority: t.priority || 'medium',
        executionType: t.executionType || 'standard',
        imageUrl: t.imageUrl || '',
        date: t.date
      };
    });
  }, [fakeDB.tasks, tasksRefreshKey]);

  const handleStartInline = (e: React.MouseEvent, task: any) => {
    e.stopPropagation();
    if (activeInlineTaskId === task.id) {
      setIsInlinePaused(false);
    } else {
      setActiveInlineTaskId(task.id);
      setInlineElapsedSeconds(task.actualDuration || 0);
      setIsInlinePaused(false);
    }
  };

  const handlePauseInline = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsInlinePaused(true);
  };

  const handleFinishInline = (e: React.MouseEvent, task: any) => {
    e.stopPropagation();
    const updatedTask = {
      ...task,
      status: 'completed' as const,
      actualDuration: inlineElapsedSeconds,
      completedAt: new Date().toISOString()
    };
    handleUpdateTaskLocal(updatedTask);
    setActiveInlineTaskId(null);
    setInlineElapsedSeconds(0);
  };

  const openExecution = (task: any) => {
    setSelectedTaskForExecution(task);
    setIsExecutionModalOpen(true);
  };

  const handleUpdateTaskLocal = (updatedTask: any) => {
    const foundTask = fakeDB.tasks.find(t => t.id === updatedTask.id);
    if (foundTask) {
      // Preserve existing valid associations to avoid orphaning tasks when status is changed
      const originalGoalId = foundTask.goalId;
      const originalProjectId = foundTask.projectId;

      Object.assign(foundTask, updatedTask);
      foundTask.status = updatedTask.status === 'completed' ? 'done' : updatedTask.status === 'in-progress' ? 'doing' : 'todo';
      foundTask.title = updatedTask.title;

      let finalGoalId = 'none';
      if (updatedTask.goalId && updatedTask.goalId !== 'none') {
        finalGoalId = updatedTask.goalId;
      } else if (updatedTask.metaId && updatedTask.metaId !== 'none') {
        finalGoalId = updatedTask.metaId;
      } else if (originalGoalId && originalGoalId !== 'none') {
        finalGoalId = originalGoalId;
      }
      foundTask.goalId = finalGoalId;

      if (!foundTask.projectId || foundTask.projectId === 'none') {
        if (originalProjectId && originalProjectId !== 'none') {
          foundTask.projectId = originalProjectId;
        }
      }

      if (updatedTask.date) {
        foundTask.date = new Date(updatedTask.date).getTime();
      }

      // Replicar no localStorage para que os objetivos leiam a tarefa atualizada
      const objectiveTitle = updatedTask.objectiveTitle || 'Estratégia';
      if (objectiveTitle) {
        const tasksKey = `tasks_${objectiveTitle}`;
        try {
          const savedTasksString = safeLocalStorage.getItem(tasksKey);
          let savedTasks = savedTasksString ? JSON.parse(savedTasksString) : [];
          if (Array.isArray(savedTasks)) {
            const index = savedTasks.findIndex((t: any) => t.id === foundTask.id);
            if (index >= 0) {
              savedTasks[index] = {
                ...savedTasks[index],
                ...foundTask,
                status: foundTask.status
              };
            } else {
              savedTasks.push({
                ...foundTask,
                status: foundTask.status
              });
            }
            safeLocalStorage.setItem(tasksKey, JSON.stringify(savedTasks));
          }
        } catch (e) {
          console.error('[DiaryEditor] Erro ao persistir tarefa de objetivo localmente:', e);
        }
      }

      safeLocalStorage.setItem('dashboard_snapshot_dirty', 'true');
      organismEventBus.emit('goalUpdated', foundTask);
      setTasksRefreshKey(prev => prev + 1);

      objectivesService.saveTask(foundTask.id, foundTask).catch(err => {
        console.warn('[DiaryEditor] Erro ao sincronizar atualização com o backend:', err);
      });
    }

    if (selectedTaskForExecution?.id === updatedTask.id) {
      setSelectedTaskForExecution(updatedTask);
    }
    
    if (activeInlineTaskId === updatedTask.id) {
      setInlineElapsedSeconds(updatedTask.actualDuration || 0);
      setIsInlinePaused(updatedTask.status !== 'in-progress');
      if (updatedTask.status === 'completed') {
        setActiveInlineTaskId(null);
        setInlineElapsedSeconds(0);
      }
    }
  };

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [isDocFolderSelectorOpen, setIsDocFolderSelectorOpen] = useState(false);
  const [isHighlightModalOpen, setIsHighlightModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isTextColorModalOpen, setIsTextColorModalOpen] = useState(false);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [bgImageIndex, setBgImageIndex] = useState(0);
  const CLOSURE_IMAGES = [
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1920",
    "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=1920",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1920",
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&q=80&w=1920",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setBgImageIndex((prev) => (prev + 1) % CLOSURE_IMAGES.length);
    }, 6000); // Crossfade every 6 seconds
    return () => clearInterval(interval);
  }, []);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [viewportOffset, setViewportOffset] = useState(0);
  const [dayStatus, setDayStatus] = useState<"pendente" | "finalizado">(() => {
    if (id) {
      const entry = fakeDB.diaries.find((e) => String(e.id) === String(id));
      if (entry)
        return entry.status === "completed" ? "finalizado" : "pendente";
    }
    return "pendente";
  });
  const [closureData, setClosureData] = useState<any>(() => {
    if (id) {
      const entry = fakeDB.diaries.find((e) => String(e.id) === String(id));
      if (entry && entry.status === "completed") {
        const metrics = fakeDB.getSleepMetrics(id);
        const formatDuration = (ms: number) => {
          const hrs = Math.floor(ms / 3600000);
          const mins = Math.floor((ms % 3600000) / 60000);
          return `${hrs}h ${mins}m`;
        };
        const durMs = entry.duration || 0;
        const durHrs = Math.floor(durMs / 3600000);
        const durMins = Math.floor((durMs % 3600000) / 60000);
        return {
          inicio_dia: entry.time,
          fim_dia: entry.endAt
            ? new Date(entry.endAt).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "--:--",
          duracao: durHrs > 0 ? `${durHrs}h ${durMins}m` : `${durMins}m`,
          tempo_sono: metrics.currentSleepMs
            ? formatDuration(metrics.currentSleepMs)
            : null,
          media_sono: metrics.averageSleepMs
            ? formatDuration(metrics.averageSleepMs)
            : null,
        };
      }
    }
    return null;
  });

  useEffect(() => {
    if (id) {
      safeLocalStorage.setItem("last_edited_diary_id", String(id));
      if (!safeLocalStorage.getItem(`day_start_time_${id}`)) {
        safeLocalStorage.setItem(
          `day_start_time_${id}`,
          new Date().toISOString(),
        );
      }

      // Reset scroll position to top when switching entries
      const scrollToTop = () => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({ top: 0, behavior: "instant" });
        }
        window.scrollTo({ top: 0, behavior: "instant" });
      };

      scrollToTop();
      // Double tap to ensure layout shifts or editor auto-focusing doesn't move the scroll
      const timeoutId = setTimeout(scrollToTop, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [id]);

  useEffect(() => {
    if (!window.visualViewport) return;

    const handleViewportChange = () => {
      setViewportOffset(window.visualViewport?.offsetTop || 0);
    };

    window.visualViewport.addEventListener("resize", handleViewportChange);
    window.visualViewport.addEventListener("scroll", handleViewportChange);

    return () => {
      window.visualViewport?.removeEventListener(
        "resize",
        handleViewportChange,
      );
      window.visualViewport?.removeEventListener(
        "scroll",
        handleViewportChange,
      );
    };
  }, []);

  const centerSelection = useCallback((editor: Editor) => {
    if (!editor || !scrollContainerRef.current) return;

    // Only center on mobile or when keyboard is likely up
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    setTimeout(() => {
      try {
        const { selection } = editor.state;
        const { view } = editor;
        const coords = view.coordsAtPos(selection.from);

        const container = scrollContainerRef.current;
        if (!container) return;

        const viewportHeight =
          window.visualViewport?.height || window.innerHeight;
        const headerHeight = 44; // h-11

        // Target position is the center of the available viewport (between header and keyboard)
        const targetY = coords.top - viewportHeight / 2 + headerHeight / 2;

        container.scrollBy({
          top: targetY - container.getBoundingClientRect().top,
          behavior: "smooth",
        });
      } catch (e) {
        // Ignore errors if coords can't be calculated
      }
    }, 100);
  }, []);

  const handleBlockSelection = useCallback(
    (subEditor: any) => {
      setActiveEditor(subEditor);
      centerSelection(subEditor);
    },
    [centerSelection],
  );

  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverPosition, setCoverPosition] = useState(50);
  const [isRepositioning, setIsRepositioning] = useState(false);
  const [docIcon, setDocIcon] = useState<string | null>(null);

  // Estado para Estado do Dia
  const [energy, setEnergy] = useState<string[]>([]);
  const [mental, setMental] = useState<string[]>([]);
  const [emotion, setEmotion] = useState<string[]>([]);
  const [internalState, setInternalState] = useState<string[]>([]);
  const [interferences, setInterferences] = useState<string[]>([]);
  const [posture, setPosture] = useState<string[]>([]);

  // Estado para Ações Essenciais
  const [essentialActions, setEssentialActions] = useState([
    {
      id: "1",
      text: "Revisar metas do trimestre",
      completed: false,
      isFromYesterday: true,
    },
    {
      id: "2",
      text: "Finalizar relatório de performance",
      completed: true,
      isFromYesterday: true,
    },
    {
      id: "3",
      text: "Meditação matinal",
      completed: false,
      isFromYesterday: false,
    },
  ]);

  // Estado para Ações de Amanhã
  const [tomorrowActions, setTomorrowActions] = useState<
    { id: string; text: string; completed: boolean }[]
  >([]);

  // Estado para Ações Recorrentes
  const [recurringActions, setRecurringActions] = useState([
    { id: "r1", text: "Treino de Força", completed: false },
    { id: "r2", text: "Leitura Técnica (30 min)", completed: false },
    { id: "r3", text: "Revisão de Metas", completed: true },
  ]);

  const loadedEntryId = useRef<string | null>(null);

  const initialEssentialActions = [
    {
      id: "1",
      text: "Revisar metas do trimestre",
      completed: false,
      isFromYesterday: true,
    },
    {
      id: "2",
      text: "Finalizar relatório de performance",
      completed: true,
      isFromYesterday: true,
    },
    {
      id: "3",
      text: "Meditação matinal",
      completed: false,
      isFromYesterday: false,
    },
  ];

  const initialRecurringActions = [
    { id: "r1", text: "Treino de Força", completed: false },
    { id: "r2", text: "Leitura Técnica (30 min)", completed: false },
    { id: "r3", text: "Revisão de Metas", completed: true },
  ];

  // Sync currentEntry when editing individual fields
  useEffect(() => {
    if (id && loadedEntryId.current === String(id) && currentEntry) {
      const updatedEntry = {
        ...currentEntry,
        title,
        description,
        energy,
        mental,
        emotion,
        internalState,
        interferences,
        posture,
        essentialActions,
        tomorrowActions,
        recurringActions,
        coverImage,
        coverPosition,
        docIcon,
      };

      // Update local object
      setCurrentEntry(updatedEntry);

      // Update Source of Truth (fakeDB)
      fakeDB.updateDiaryEntry(id, updatedEntry);
    }
  }, [
    id,
    title,
    description,
    energy,
    mental,
    emotion,
    internalState,
    interferences,
    posture,
    essentialActions,
    tomorrowActions,
    recurringActions,
    coverImage,
    coverPosition,
    docIcon,
  ]);

  const toggleAction = (id: string) => {
    setEssentialActions((prev) =>
      prev.map((action) =>
        action.id === id ? { ...action, completed: !action.completed } : action,
      ),
    );
  };

  const addAction = (text: string) => {
    const newAction = {
      id: Date.now().toString(),
      text,
      completed: false,
      isFromYesterday: false,
    };
    setEssentialActions((prev) => [...prev, newAction]);
  };

  const toggleTomorrowAction = (id: string) => {
    setTomorrowActions((prev) =>
      prev.map((action) =>
        action.id === id ? { ...action, completed: !action.completed } : action,
      ),
    );
  };

  const addTomorrowAction = (text: string) => {
    const newAction = {
      id: Date.now().toString(),
      text,
      completed: false,
    };
    setTomorrowActions((prev) => [...prev, newAction]);
  };

  const toggleRecurringAction = (id: string) => {
    setRecurringActions((prev) =>
      prev.map((action) =>
        action.id === id ? { ...action, completed: !action.completed } : action,
      ),
    );
  };

  const [activeRange, setActiveRange] = useState<any>(null);
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);
  const [linkInitialData, setLinkInitialData] = useState<
    { url: string; text: string } | undefined
  >(undefined);
  const sideMenuRef = useRef<HTMLButtonElement>(null);
  const suggestionRef = useRef<any>(null);
  const [suggestionProps, setSuggestionProps] = useState<any>(null);
  const [suggestionPosition, setSuggestionPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [suggestionVisible, setSuggestionVisible] = useState(false);
  const tippyInstance = useRef<TippyInstance | null>(null);
  const slashCommandTippy = useRef<TippyInstance | null>(null);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Disable default code block to use lowlight
      }),
      Placeholder.configure({
        placeholder: "Pressione '/' para comandos...",
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-[#7C5CFF] underline underline-offset-4 decoration-[#7C5CFF]/30 hover:decoration-[#7C5CFF] transition-all cursor-pointer font-medium",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg my-6",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            background: {
              default: null,
              parseHTML: (element) => element.style.background,
              renderHTML: (attributes) => {
                if (!attributes.background) {
                  return {};
                }
                return {
                  style: `background: ${attributes.background}; padding: 0.1em 0.3em; border-radius: 0.2em;`,
                };
              },
            },
          };
        },
      }),
      FontFamily,
      HorizontalRule.configure({
        HTMLAttributes: {
          class: "my-8 border-t border-zinc-800",
        },
      }),
      Color,
      Highlight.configure({ multicolor: true }),
      Table.configure({
        resizable: true,
      }),
      ImageCarousel,
      DocFolderBlock,
      AIBlock,
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Commands.configure({
        suggestion: {
          items: ({ query }: { query: string }) =>
            getSuggestionItems({ query, editor: editor! }),
          render: () => {
            return {
              onStart: (props: any) => {
                const { clientRect } = props;
                if (clientRect) {
                  const rect = clientRect();
                  if (rect) {
                    setSuggestionPosition({
                      top: rect.bottom + 4,
                      left: rect.left,
                    });
                  }
                }
                setSuggestionProps(props);
                setSuggestionVisible(true);
              },
              onUpdate(props: any) {
                const { clientRect } = props;
                if (clientRect) {
                  const rect = clientRect();
                  if (rect) {
                    setSuggestionPosition({
                      top: rect.bottom + 4,
                      left: rect.left,
                    });
                  }
                }
                setSuggestionProps(props);
              },
              onKeyDown(props: any) {
                if (props.event.key === "Escape") {
                  setSuggestionVisible(false);
                  return true;
                }
                return suggestionRef.current?.onKeyDown(props);
              },
              onExit() {
                setSuggestionVisible(false);
                setSuggestionProps(null);
                setSuggestionPosition(null);
              },
            };
          },
        },
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onUpdate(html);

      // Debounce the heavy save and state update to avoid flushSync warnings and excessive disk IO
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        // Extrair imagens do conteúdo para atualizar os cards automaticamente
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const allImages = Array.from(doc.querySelectorAll("img"))
          .map((img) => img.getAttribute("src"))
          .filter(Boolean) as string[];

        // LIMIT GALERY SIZE:
        // We only need a few to rotate. To save localStorage space, we only store the first 6 unique images.
        // Even better, for base64 strings, we should be very careful.
        const images = allImages.slice(0, 6);

        if (id) {
          const updates: any = { content: html };
          // Atualiza a galeria completa e as imagens de destaque
          updates.gallery = images;
          if (images.length > 0) updates.mainImage = images[0];
          if (images.length > 1) updates.eventImage = images[1];
          if (images.length > 2) updates.circleImage = images[2];

          const updated = fakeDB.updateDiaryEntry(id, updates);
          if (updated) {
            // Wrap state update to decouple from Tiptap internal update cycle
            requestAnimationFrame(() => {
              setCurrentEntry(updated);
            });
          }
        }
      }, 500);
    },
    onSelectionUpdate: ({ editor }) => {
      handleBlockSelection(editor);
    },
    onFocus: ({ editor }) => {
      handleBlockSelection(editor);
    },
    editorProps: {
      attributes: {
        class: `prose ${theme === "dark" ? "prose-invert text-white" : "text-zinc-800"} max-w-[700px] mx-auto px-4 pt-2 pb-10 focus:outline-none min-h-[100px] font-sans`,
      },
    },
  });

  useEffect(() => {
    if (id) {
      const entry = fakeDB.diaries.find((e) => String(e.id) === String(id));
      if (entry) {
        // Source of Truth: setCurrentEntry
        setCurrentEntry(entry);

        // Load individual states for editing buffer
        setTitle(entry.title.replace(/\n/g, " "));
        setDescription(entry.description || "");
        setCoverImage(entry.coverImage || null);
        setCoverPosition(entry.coverPosition !== undefined ? entry.coverPosition : 50);
        setDocIcon(entry.docIcon || null);

        // Reset and Load content states with robust parsing to prevent string/array mismatch crashes
        const parseArray = (val: any) => {
          if (Array.isArray(val)) return val;
          if (typeof val === 'string' && val.trim()) {
            if (val.startsWith('[') && val.endsWith(']')) {
              try { return JSON.parse(val); } catch (e) {}
            }
            return val.split(',').map((s: string) => s.trim()).filter(Boolean);
          }
          return [];
        };

        setEnergy(parseArray(entry.energy));
        setMental(parseArray(entry.mental));
        setEmotion(parseArray(entry.emotion));
        setInternalState(parseArray(entry.internalState));
        setInterferences(parseArray(entry.interferences));
        setPosture(parseArray(entry.posture));
        setEssentialActions(entry.essentialActions || initialEssentialActions);
        setTomorrowActions(entry.tomorrowActions || []);
        setRecurringActions(entry.recurringActions || initialRecurringActions);

        // Load Tiptap content if editor is ready
        if (editor && entry.content) {
          editor.commands.setContent(entry.content);
        }

        // If entry has saved status/data, load it
        if (entry.status === "completed") {
          setDayStatus("finalizado");
          const metrics = fakeDB.getSleepMetrics(id);
          const formatDuration = (ms: number) => {
            const hrs = Math.floor(ms / 3600000);
            const mins = Math.floor((ms % 3600000) / 60000);
            return `${hrs}h ${mins}m`;
          };
          const durMs = entry.duration || 0;
          const durHrs = Math.floor(durMs / 3600000);
          const durMins = Math.floor((durMs % 3600000) / 60000);
          setClosureData({
            inicio_dia: entry.time,
            fim_dia: entry.endAt
              ? new Date(entry.endAt).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "--:--",
            duracao: durHrs > 0 ? `${durHrs}h ${durMins}m` : `${durMins}m`,
            tempo_sono: metrics.currentSleepMs
              ? formatDuration(metrics.currentSleepMs)
              : null,
            media_sono: metrics.averageSleepMs
              ? formatDuration(metrics.averageSleepMs)
              : null,
          });
        } else {
          setDayStatus("pendente");
          setClosureData(null);
        }

        // Mark as loaded to enable sync
        loadedEntryId.current = String(id);
      }
    }
  }, [id, editor]);

  const handleSideMenuClick = useCallback(() => {
    if (!editor || !sideMenuRef.current) return;
    if (suggestionVisible) {
      setSuggestionVisible(false);
      return;
    }
    const items = getSuggestionItems({ query: "", editor });
    const rect = sideMenuRef.current.getBoundingClientRect();
    setSuggestionPosition({
      top: rect.bottom + 4,
      left: rect.left,
    });
    setSuggestionProps({
      items,
      editor,
      range: null,
      command: (item: any) => {
        setSuggestionVisible(false);
        item.command({ editor, range: null });
      },
    });
    setSuggestionVisible(true);
  }, [editor, suggestionVisible]);

  // Global listeners to ensure menus close
  useEffect(() => {
    const handleGlobalEvent = (e: Event) => {
      // Rule 1: NEVER close on scroll (inside or outside menus)
      if (e.type === "scroll") return;

      const target = e.target as Node;
      if (!target) return;

      // Side menu (Tippy) logic simplification
      if (tippyInstance.current?.state.isVisible) {
        const isInsideButton = sideMenuRef.current?.contains(target);
        const isInsideTippy = tippyInstance.current.popper.contains(target);

        // Rule 2: Only close on double click outside or Esc (handled in handleKeyDown)
        if (e.type === "dblclick" && !isInsideButton && !isInsideTippy) {
          tippyInstance.current.hide();
          return;
        }

        // Rule 3: Single clicks outside are intentionally ignored to prevent accidental closures while scrolling/navigating
        return;
      }

      // Slash command menu cleanup
      if (slashCommandTippy.current?.state.isVisible) {
        const isInsideTippy = slashCommandTippy.current.popper.contains(target);
        if (!isInsideTippy && e.type !== "scroll") {
          slashCommandTippy.current.hide();
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") {
        tippyInstance.current?.hide();
      }
      // If typing in the editor, close the side menu
      if (
        tippyInstance.current?.state.isVisible &&
        !e.metaKey &&
        !e.ctrlKey &&
        e.key.length === 1
      ) {
        tippyInstance.current.hide();
      }
    };

    document.addEventListener("mousedown", handleGlobalEvent, true);
    document.addEventListener("touchstart", handleGlobalEvent, true);
    document.addEventListener("dblclick", handleGlobalEvent, true);
    document.addEventListener("scroll", handleGlobalEvent, true);
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("mousedown", handleGlobalEvent, true);
      document.removeEventListener("touchstart", handleGlobalEvent, true);
      document.removeEventListener("dblclick", handleGlobalEvent, true);
      document.removeEventListener("scroll", handleGlobalEvent, true);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);

  // Editor-specific listeners to close menus
  useEffect(() => {
    if (!editor) return;

    const closeMenus = () => {
      if (tippyInstance.current?.state.isVisible) {
        tippyInstance.current.hide();
      }
      if (slashCommandTippy.current?.state.isVisible) {
        slashCommandTippy.current.hide();
      }
    };

    editor.on("transaction", closeMenus);
    editor.on("focus", closeMenus);
    editor.on("selectionUpdate", ({ editor: e }) => {
      closeMenus();

      // Update menu position
      const { selection } = e.state;
      const { view } = e;

      try {
        const coords = view.coordsAtPos(selection.from);
        const editorElement = view.dom.parentElement;

        if (editorElement) {
          const rect = editorElement.getBoundingClientRect();
          const contentElement = view.dom;
          const contentRect = contentElement.getBoundingClientRect();
          const isMobile = window.innerWidth < 768;

          setMenuPosition({
            top: coords.top - rect.top + editorElement.scrollTop,
            left: isMobile
              ? contentRect.left - rect.left + 4
              : contentRect.left - rect.left - 40,
          });
        }
      } catch (err) {
        setMenuPosition(null);
      }
    });

    return () => {
      editor.off("transaction", closeMenus);
      editor.off("focus", closeMenus);
      editor.off("selectionUpdate");
    };
  }, [editor]);

  // Listen for AI block insertion
  useEffect(() => {
    const handleInsertAIBlock = (e: any) => {
      if (!editor) return;
      const { type, data, content: textContent } = e.detail;

      const chain = editor.chain().focus();

      if (textContent) {
        chain.insertContent(`<p>${textContent}</p>`);
      }

      chain
        .insertContent({
          type: "aiBlock",
          attrs: { type, data },
        })
        .run();

      // Scroll to bottom
      setTimeout(() => {
        const editorElement = document.querySelector(".tiptap");
        if (editorElement) {
          editorElement.scrollIntoView({ behavior: "smooth", block: "end" });
        }
      }, 100);
    };

    window.addEventListener("insert-ai-block", handleInsertAIBlock);

    const handleInsertAIText = (e: any) => {
      if (!editor) return;
      const { text } = e.detail;
      editor.chain().focus().insertContent(`<p>${text}</p>`).run();
    };
    window.addEventListener("insert-ai-text", handleInsertAIText);

    return () => {
      window.removeEventListener("insert-ai-block", handleInsertAIBlock);
      window.removeEventListener("insert-ai-text", handleInsertAIText);
    };
  }, [editor]);

  const handleClearCanvas = () => {
    if (!editor) return;
    if (window.confirm("Tem certeza que deseja limpar todo o conteúdo?")) {
      editor.commands.setContent("");
      setTitle("Novo Diário");
    }
  };

  const handleSaveDocument = async () => {
    if (!editor) return;

    try {
      const html = editor.getHTML();
      const id = await documentService.createDocument(title, html);
      alert(`Diário "${title}" salvo com sucesso!`);
    } catch (error) {
      console.error("Error saving document:", error);
      alert("Erro ao salvar diário.");
    }
  };

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  useEffect(() => {
    const handleOpenSelector = (e: any) => {
      setActiveRange(e.detail.range);
      setActiveEditor(e.detail.editor || editor);
      setIsDocFolderSelectorOpen(true);
      // Close any open menus
      tippyInstance.current?.hide();
      slashCommandTippy.current?.hide();
    };

    const handleOpenHighlight = (e: any) => {
      setActiveRange(e.detail?.range || null);
      setActiveEditor(e.detail?.editor || editor);
      setIsHighlightModalOpen(true);
      tippyInstance.current?.hide();
      slashCommandTippy.current?.hide();
    };

    const handleOpenLink = (e: any) => {
      setActiveRange(e.detail?.range || null);
      const currentEditor = e.detail?.editor || editor;
      setActiveEditor(currentEditor);

      if (currentEditor) {
        const { from, to } = currentEditor.state.selection;
        const text = currentEditor.state.doc.textBetween(from, to, " ");
        const url = currentEditor.getAttributes("link").href || "";
        setLinkInitialData({ url, text });
      }

      setIsLinkModalOpen(true);
      tippyInstance.current?.hide();
      slashCommandTippy.current?.hide();
    };

    const handleOpenTextColor = (e: any) => {
      setActiveRange(e.detail?.range || null);
      setActiveEditor(e.detail?.editor || editor);
      setIsTextColorModalOpen(true);
      tippyInstance.current?.hide();
      slashCommandTippy.current?.hide();
    };

    const handleOpenCover = () => {
      setIsCoverModalOpen(true);
      tippyInstance.current?.hide();
      slashCommandTippy.current?.hide();
    };

    const handleOpenIcon = () => {
      setIsIconModalOpen(true);
      tippyInstance.current?.hide();
      slashCommandTippy.current?.hide();
    };

    window.addEventListener("open-doc-folder-selector", handleOpenSelector);
    window.addEventListener("open-highlight-modal", handleOpenHighlight);
    window.addEventListener("open-link-modal", handleOpenLink);
    window.addEventListener("open-text-color-modal", handleOpenTextColor);
    window.addEventListener("open-cover-modal", handleOpenCover);
    window.addEventListener("open-icon-modal", handleOpenIcon);
    return () => {
      window.removeEventListener(
        "open-doc-folder-selector",
        handleOpenSelector,
      );
      window.removeEventListener("open-highlight-modal", handleOpenHighlight);
      window.removeEventListener("open-link-modal", handleOpenLink);
      window.removeEventListener("open-text-color-modal", handleOpenTextColor);
      window.removeEventListener("open-cover-modal", handleOpenCover);
      window.removeEventListener("open-icon-modal", handleOpenIcon);
    };
  }, [editor]);

  const handleDocFolderSelect = (item: any) => {
    const currentEditor = activeEditor || editor;
    if (!currentEditor) return;

    if (activeRange) {
      currentEditor
        .chain()
        .focus()
        .deleteRange(activeRange)
        .setDocFolderBlock(item)
        .run();
    } else {
      currentEditor.chain().focus().setDocFolderBlock(item).run();
    }

    setIsDocFolderSelectorOpen(false);
    setActiveRange(null);
  };

  const handleHighlightSelect = (color: string, isGradient: boolean) => {
    const currentEditor = activeEditor || editor;
    if (!currentEditor) return;

    if (activeRange) {
      currentEditor.chain().focus().deleteRange(activeRange).run();
    }

    const isDarkColor = (c: string) => {
      if (!c) return false;
      if (c.startsWith("linear-gradient")) return true;
      const hex = c.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness < 128;
    };

    if (!color) {
      currentEditor.chain().focus().unsetHighlight().run();
      currentEditor
        .chain()
        .focus()
        .setMark("textStyle", { background: null })
        .run();
    } else if (isGradient) {
      currentEditor
        .chain()
        .focus()
        .setMark("textStyle", { background: color })
        .setColor("#ffffff")
        .run();
    } else {
      const textColor = isDarkColor(color) ? "#ffffff" : "#000000";
      currentEditor
        .chain()
        .focus()
        .setHighlight({ color })
        .setColor(textColor)
        .run();
    }

    setIsHighlightModalOpen(false);
    setActiveRange(null);
  };

  const handleTextColorSelect = (color: string) => {
    const currentEditor = activeEditor || editor;
    if (!currentEditor) return;

    if (activeRange) {
      currentEditor.chain().focus().deleteRange(activeRange).run();
    }

    if (!color) {
      currentEditor.chain().focus().unsetColor().run();
    } else {
      currentEditor.chain().focus().setColor(color).run();
    }

    setIsTextColorModalOpen(false);
    setActiveRange(null);
  };

  const handleLinkSelect = (data: {
    url: string;
    text: string;
    color: string;
    openInNewTab: boolean;
  }) => {
    const currentEditor = activeEditor || editor;
    if (!currentEditor) return;

    if (activeRange) {
      currentEditor.chain().focus().deleteRange(activeRange).run();
    }

    const { from, to } = currentEditor.state.selection;
    const hasSelection = from !== to;

    if (hasSelection) {
      currentEditor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({
          href: data.url,
          target: data.openInNewTab ? "_blank" : "_self",
        })
        .setMark("textStyle", { color: data.color })
        .run();
    } else {
      currentEditor
        .chain()
        .focus()
        .insertContent(
          `<a href="${data.url}" target="${data.openInNewTab ? "_blank" : "_self"}" style="color: ${data.color}">${data.text}</a>`,
        )
        .run();
    }

    setIsLinkModalOpen(false);
    setActiveRange(null);
    setLinkInitialData(undefined);
  };

  const handleDelete = () => {
    if (id && window.confirm("Tem certeza que deseja excluir este diário?")) {
      if (fakeDB.deleteDiaryEntry(id)) {
        navigate("/diary");
      }
    }
  };

  const addImage = () => {
    const currentEditor = activeEditor || editor;
    if (!currentEditor) return;
    const savedSelection = {
      from: currentEditor.state.selection.from,
      to: currentEditor.state.selection.to,
    };
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const url = reader.result as string;
          const docLen = currentEditor.state.doc.content.size;
          let chain = currentEditor.chain().focus();
          if (savedSelection && savedSelection.from <= docLen && savedSelection.to <= docLen) {
            chain = chain.setTextSelection({
              from: savedSelection.from,
              to: savedSelection.to,
            });
          }
          chain.setImage({ src: url }).run();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const addCarousel = () => {
    const currentEditor = activeEditor || editor;
    if (!currentEditor) return;
    const savedSelection = {
      from: currentEditor.state.selection.from,
      to: currentEditor.state.selection.to,
    };
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = async (e: any) => {
      const files = Array.from(e.target.files as FileList);
      if (files.length > 0) {
        try {
          const images = await Promise.all(
            files.map(
              (file) =>
                new Promise<string>((resolve) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(reader.result as string);
                  reader.readAsDataURL(file);
                }),
            ),
          );
          const docLen = currentEditor.state.doc.content.size;
          let chain = currentEditor.chain().focus();
          if (savedSelection && savedSelection.from <= docLen && savedSelection.to <= docLen) {
            chain = chain.setTextSelection({
              from: savedSelection.from,
              to: savedSelection.to,
            });
          }
          chain.setImageCarousel({ images }).run();
        } catch (err) {
          console.error(
            "[DiaryEditor] Falha ao processar imagens para o carrossel:",
            err,
          );
          alert("Erro ao processar uma ou mais imagens.");
        }
      }
    };
    input.click();
  };

  const addDocFolder = () => {
    window.dispatchEvent(
      new CustomEvent("open-doc-folder-selector", {
        detail: { range: null, editor: activeEditor || editor },
      }),
    );
  };

  const setLink = () => {
    window.dispatchEvent(
      new CustomEvent("open-link-modal", {
        detail: { editor: activeEditor || editor },
      }),
    );
  };

  const openHighlight = () => {
    window.dispatchEvent(
      new CustomEvent("open-highlight-modal", {
        detail: { editor: activeEditor || editor },
      }),
    );
  };

  const openTextColor = () => {
    window.dispatchEvent(
      new CustomEvent("open-text-color-modal", {
        detail: { editor: activeEditor || editor },
      }),
    );
  };

  const textColor = editor?.getAttributes("textStyle").color || "#FFFFFF";

  const fonts = [
    { label: "Inter", value: "Inter" },
    { label: "Poppins", value: "Poppins" },
    { label: "Georgia", value: "Georgia" },
    { label: "Monospace", value: "JetBrains Mono" },
  ];

  return (
    <div
      className={`flex flex-col w-full min-h-screen relative transition-colors duration-300 ${theme === "dark" ? "dark" : ""}`}
      style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
    >
      {/* Integrated Header & Toolbar */}
      <div
        className="flex items-center gap-1 p-1 border-b fixed left-0 right-0 z-50 min-h-[44px] overflow-hidden select-none flex-nowrap transition-all duration-300"
        style={{
          top: isMobile ? `${viewportOffset}px` : "0px",
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
          backdropFilter: "blur(8px)",
          boxShadow: "var(--header-shadow)",
        }}
      >
        <AnimatePresence mode="wait">
          {isEditingTitle ? (
            <motion.div
              key="editing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full h-full flex flex-col justify-center px-1 gap-1"
            >
              <input
                autoFocus
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === "Enter" && setIsEditingTitle(false)}
                className="w-full px-2 py-1 text-sm outline-none transition-all rounded-md"
                style={{
                  backgroundColor: "var(--surface-hover)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  boxShadow: "var(--shadow)",
                }}
                placeholder="Nome do diário..."
              />
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && setIsEditingTitle(false)
                  }
                  className="flex-1 px-2 py-0.5 text-[10px] outline-none transition-all rounded-md opacity-70"
                  style={{
                    backgroundColor: "var(--surface-hover)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                  }}
                  placeholder="Descrição curta para o card..."
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    generateAISummary();
                  }}
                  disabled={isGeneratingSummary}
                  className={`p-1 rounded-md hover:bg-white/10 transition-all ${isGeneratingSummary ? "animate-pulse opacity-50" : ""}`}
                  title="Gerar resumo com IA"
                >
                  <Sparkles
                    size={12}
                    className={
                      isGeneratingSummary ? "text-purple-400" : "text-white/40"
                    }
                  />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="normal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center w-full gap-1 h-full overflow-hidden flex-nowrap md:justify-center"
            >
              <button
                onClick={() => navigate("/diary")}
                className="p-1.5 rounded-full hover:bg-[var(--surface-hover)] transition-colors flex-shrink-0"
                style={{ color: "var(--muted)" }}
                title="Voltar para Diários"
              >
                <SilverArrow size={23} />
              </button>

              <div
                onClick={() => setIsEditingTitle(true)}
                className="flex flex-col flex-shrink-1 min-w-0 max-w-[150px] xs:max-w-[180px] sm:max-w-[320px] cursor-pointer p-1 rounded transition-colors overflow-hidden justify-center"
                style={{ color: "var(--text)" }}
              >
                <h1 className="text-[14px] font-bold truncate leading-tight">
                  {title}
                </h1>
                {description && (
                  <p className="text-[9px] opacity-40 truncate leading-tight">
                    {description}
                  </p>
                )}
              </div>

              {/* Toolbar Icons - Scrollable */}
              <div
                className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x border-l ml-1 pl-1 flex-nowrap md:flex-none md:border-l-0 md:ml-4 md:pl-0"
                style={{ borderColor: "var(--border)" }}
              >
                {editor && (
                  <>
                    <div
                      className="flex gap-1 items-center px-1 border-r flex-shrink-0 flex-nowrap"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <select
                        onChange={(e) =>
                          editor
                            .chain()
                            .focus()
                            .setFontFamily(e.target.value)
                            .run()
                        }
                        className="text-[13px] sm:text-[15px] rounded px-1.5 py-1 outline-none transition-colors flex-shrink-0"
                        style={{
                          backgroundColor: "var(--surface-hover)",
                          color: "var(--text)",
                          height: "27.5628px",
                          width: "81.622px",
                        }}
                        value={
                          editor.getAttributes("textStyle").fontFamily ||
                          "Inter"
                        }
                      >
                        {fonts.map((font, idx) => (
                          <option
                            key={`${font.value}-${idx}`}
                            value={font.value}
                          >
                            {font.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div
                      className="flex gap-0.5 items-center px-1 border-r flex-shrink-0 flex-nowrap"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <button
                        onClick={() =>
                          editor.chain().focus().toggleBold().run()
                        }
                        className={`p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors flex-shrink-0 ${editor.isActive("bold") ? "bg-[var(--surface-hover)]" : ""}`}
                        style={{
                          color: editor.isActive("bold")
                            ? "var(--text)"
                            : "var(--muted)",
                        }}
                      >
                        <Bold size={17} />
                      </button>
                      <button
                        onClick={() =>
                          editor.chain().focus().toggleItalic().run()
                        }
                        className={`p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors flex-shrink-0 ${editor.isActive("italic") ? "bg-[var(--surface-hover)]" : ""}`}
                        style={{
                          color: editor.isActive("italic")
                            ? "var(--text)"
                            : "var(--muted)",
                        }}
                      >
                        <Italic size={17} />
                      </button>
                    </div>

                    <div
                      className="flex gap-0.5 items-center px-1 border-r flex-shrink-0 flex-nowrap"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <button
                        onClick={() =>
                          editor
                            .chain()
                            .focus()
                            .toggleHeading({ level: 1 })
                            .run()
                        }
                        className={`p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors flex-shrink-0 ${editor.isActive("heading", { level: 1 }) ? "bg-[var(--surface-hover)]" : ""}`}
                        style={{
                          color: editor.isActive("heading", { level: 1 })
                            ? "var(--text)"
                            : "var(--muted)",
                        }}
                      >
                        <Heading1 size={17} />
                      </button>
                      <button
                        onClick={() =>
                          editor
                            .chain()
                            .focus()
                            .toggleHeading({ level: 2 })
                            .run()
                        }
                        className={`p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors flex-shrink-0 ${editor.isActive("heading", { level: 2 }) ? "bg-[var(--surface-hover)]" : ""}`}
                        style={{
                          color: editor.isActive("heading", { level: 2 })
                            ? "var(--text)"
                            : "var(--muted)",
                        }}
                      >
                        <Heading2 size={17} />
                      </button>
                    </div>

                    <div
                      className="flex gap-0.5 items-center px-1 border-r flex-shrink-0 flex-nowrap"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <button
                        onClick={openHighlight}
                        className={`p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors flex-shrink-0 ${editor.isActive("highlight") || editor.getAttributes("textStyle").background ? "bg-[var(--surface-hover)]" : ""}`}
                        style={{
                          color:
                            editor.isActive("highlight") ||
                            editor.getAttributes("textStyle").background
                              ? "var(--text)"
                              : "var(--muted)",
                        }}
                      >
                        <Brush size={17} />
                      </button>
                      <button
                        onClick={openTextColor}
                        className={`p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors relative flex-shrink-0 ${editor.getAttributes("textStyle").color ? "bg-[var(--surface-hover)]" : ""}`}
                        style={{
                          color: editor.getAttributes("textStyle").color
                            ? "var(--text)"
                            : "var(--muted)",
                        }}
                      >
                        <div className="relative">
                          <Type size={17} />
                          <div
                            className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                            style={{
                              background:
                                "linear-gradient(to right, #4285F4, #EA4335, #FBBC05, #34A853)",
                            }}
                          />
                        </div>
                      </button>
                      <button
                        onClick={setLink}
                        className={`p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors flex-shrink-0 ${editor.isActive("link") ? "bg-[var(--surface-hover)]" : ""}`}
                        style={{
                          color: editor.isActive("link")
                            ? "var(--text)"
                            : "var(--muted)",
                        }}
                      >
                        <LinkIcon size={17} />
                      </button>
                    </div>

                    <div className="flex gap-0.5 items-center px-1 flex-shrink-0 flex-nowrap">
                      <button
                        onClick={() =>
                          window.dispatchEvent(
                            new CustomEvent("open-cover-modal"),
                          )
                        }
                        className="p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors flex-shrink-0"
                        style={{ color: "var(--muted)" }}
                        title="Adicionar/Alterar capa"
                      >
                        <ImagePlus size={17} />
                      </button>
                      <button
                        onClick={() =>
                          window.dispatchEvent(
                            new CustomEvent("open-icon-modal"),
                          )
                        }
                        className="p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors flex-shrink-0"
                        style={{ color: "var(--muted)" }}
                        title="Adicionar/Alterar ícone"
                      >
                        <Smile size={17} />
                      </button>

                      <div
                        className="w-px h-4 mx-0.5 flex-shrink-0"
                        style={{ backgroundColor: "var(--border)" }}
                      />

                      <button
                        onClick={() =>
                          editor
                            .chain()
                            .focus()
                            .insertTable({
                              rows: 3,
                              cols: 3,
                              withHeaderRow: true,
                            })
                            .run()
                        }
                        className="p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors flex-shrink-0"
                        style={{ color: "var(--muted)" }}
                      >
                        <TableIcon size={17} />
                      </button>
                      <button
                        onClick={addImage}
                        className="p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors flex-shrink-0"
                        style={{ color: "var(--muted)" }}
                        title="Adicionar imagem"
                      >
                        <ImageIcon size={17} />
                      </button>
                      <button
                        onClick={addCarousel}
                        className="p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors flex-shrink-0"
                        style={{ color: "var(--muted)" }}
                        title="Adicionar carrossel"
                      >
                        <Images size={17} />
                      </button>
                      <button
                        onClick={addDocFolder}
                        className="p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors flex-shrink-0"
                        style={{ color: "var(--muted)" }}
                        title="Adicionar pasta/documento"
                      >
                        <FolderOpen size={17} />
                      </button>
                      <button
                        onClick={handleDelete}
                        className="p-1.5 rounded hover:bg-[var(--surface-hover)] hover:text-red-500 transition-colors flex-shrink-0"
                        style={{ color: "var(--muted)" }}
                        title="Excluir"
                      >
                        <Trash2 size={17} />
                      </button>

                      <div
                        className="w-px h-4 mx-0.5 flex-shrink-0"
                        style={{ backgroundColor: "var(--border)" }}
                      />

                      <button
                        onClick={onToggleTheme}
                        className="p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors flex-shrink-0"
                        style={{ color: "var(--muted)" }}
                        title={theme === "light" ? "Modo Escuro" : "Modo Claro"}
                      >
                        {theme === "light" ? (
                          <Moon size={17} />
                        ) : (
                          <Sun size={17} />
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth group/editor pt-11"
      >
        <DocumentCover
          url={coverImage}
          position={coverPosition}
          onAdd={() => setIsCoverModalOpen(true)}
          onChange={() => setIsCoverModalOpen(true)}
          onRemove={() => {
            setCoverImage(null);
            setIsRepositioning(false);
          }}
          onPositionChange={setCoverPosition}
          isRepositioning={isRepositioning}
          onEndReposition={() => setIsRepositioning(false)}
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-8 pb-32">
          {/* Combined Add Buttons for Cover and Icon */}
          {(!coverImage || !docIcon) && (
            <div
              className={`flex items-center gap-2 mb-2 relative z-20 ${coverImage ? "mt-4" : "pt-8"}`}
            >
              {!coverImage && (
                <button
                  onClick={() => setIsCoverModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:bg-[var(--surface-hover)]"
                  style={{ color: "var(--muted)" }}
                >
                  <ImagePlus size={16} />
                  Adicionar capa
                </button>
              )}
              {!docIcon && (
                <button
                  onClick={() => setIsIconModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:bg-[var(--surface-hover)]"
                  style={{ color: "var(--muted)" }}
                >
                  <Smile size={16} />
                  Adicionar ícone
                </button>
              )}
            </div>
          )}

          <DocumentIcon
            icon={docIcon}
            hasCover={!!coverImage}
            onAdd={() => setIsIconModalOpen(true)}
            onChange={() => setIsIconModalOpen(true)}
            onRemove={() => setDocIcon(null)}
          />

          {/* Bloco 1: ABERTURA DO DIA - REAL TIME MODE */}
          <div className="mb-16">
            <DayOpeningBlock currentEntry={currentEntry} theme={theme} />
          </div>

          <DreamsBlock theme={theme}>
            <div className="relative">
              {menuPosition && (
                <button
                  ref={sideMenuRef}
                  onPointerDown={(e) => { e.preventDefault(); handleSideMenuClick(); }}
                  style={{
                    top: `${menuPosition.top}px`,
                    left: `${menuPosition.left}px`,
                    transform: "translateY(-2px)",
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border)",
                    color: "var(--muted)",
                    boxShadow: "var(--shadow)",
                    marginLeft: "-19px",
                  }}
                  className="absolute p-1 rounded hover:bg-[var(--surface-hover)] transition-all z-20 flex items-center justify-center border"
                  title="Adicionar bloco"
                >
                  <Plus size={18} className="md:w-5 md:h-5" />
                </button>
              )}
              <EditorContent editor={editor} />
            </div>

            
            {createPortal(
              <AnimatePresence>
                {suggestionVisible && suggestionPosition && (
                  <div className="fixed inset-0 z-[9999] pointer-events-none">
                    
                    <div
                      className="absolute bg-transparent"
                      style={{ inset: 0, pointerEvents: "auto" }}
                      onClick={() => setSuggestionVisible(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute pointer-events-auto min-w-[200px] bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden"
                      style={{
                        top: `${suggestionPosition.top}px`,
                        left: `${suggestionPosition.left}px`,
                      }}
                    >
                      <SuggestionList
                        ref={suggestionRef}
                        {...suggestionProps}
                        onClose={() => setSuggestionVisible(false)}
                      />
                    </motion.div>
                  
                  </div>
                )}
              </AnimatePresence>,
              document.body
            )}
          
          </DreamsBlock>

          <EssentialActionsBlock
            actions={essentialActions}
            onToggle={toggleAction}
            onAdd={addAction}
            theme={theme}
          />

          <RecurringActionsBlock
            tasks={mappedTasks}
            activeInlineTaskId={activeInlineTaskId}
            isInlinePaused={isInlinePaused}
            inlineElapsedSeconds={inlineElapsedSeconds}
            handleStartInline={handleStartInline}
            handlePauseInline={handlePauseInline}
            handleFinishInline={handleFinishInline}
            openExecution={openExecution}
            onUpdate={handleUpdateTaskLocal}
            theme={theme}
          />

          <DailyNewsBlock
            key={`news-${id}`}
            theme={theme}
            title={title}
            id={id}
            onSelectionUpdate={handleBlockSelection}
          />

          <InsightsBlock
            key={`insights-${id}`}
            theme={theme}
            title={title}
            id={id}
            onSelectionUpdate={handleBlockSelection}
          />

          <FreeWritingBlock
            key={`free-${id}`}
            theme={theme}
            title={title}
            id={id}
            onSelectionUpdate={handleBlockSelection}
          />

          <DayStateBlock
            energy={energy}
            setEnergy={setEnergy}
            mental={mental}
            setMental={setMental}
            emotion={emotion}
            setEmotion={setEmotion}
            internalState={internalState}
            setInternalState={setInternalState}
            interferences={interferences}
            setInterferences={setInterferences}
            posture={posture}
            setPosture={setPosture}
            theme={theme}
          />

          <MentorGuidanceBlock
            key={`mentor-${id}`}
            theme={theme}
            title={title}
            id={id}
            onSelectionUpdate={handleBlockSelection}
          />

          <TomorrowActionsBlock
            actions={tomorrowActions}
            onToggle={toggleTomorrowAction}
            onAdd={addTomorrowAction}
            theme={theme}
          />

          <DayConsolidationBlock
            key={`consolidation-${id}`}
            theme={theme}
            id={id}
            onSelectionUpdate={handleBlockSelection}
          />

          {/* Ritualistic Final Moment — Day Closure Trigger Section */}
          <div className="relative w-screen left-1/2 -ml-[50vw] overflow-hidden group/closure mt-20">
            {/* Immersive Background System */}
            <div className="absolute inset-0 z-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={bgImageIndex}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 3, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <img
                    src={CLOSURE_IMAGES[bgImageIndex]}
                    alt="Ritualistic closure background"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Always Dark Overlay: Maintains consistency regardless of system theme */}
              <div className="absolute inset-0 bg-black/60 transition-opacity duration-1000" />

              {/* Atmospheric Depth, Gradient & Grain */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-90" />
              <div
                className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
              />

              {/* Soft Fade at Top - Creating the "Entering Dark Night" transition from light/dark diary */}
              <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[var(--bg)] via-black/80 to-transparent" />

              {/* Clean Hard Bottom Edge (Explicitly no fade) */}
            </div>

            <div className="relative z-10 w-full px-6 sm:px-8 py-16 sm:py-24 text-center min-h-[450px] sm:min-h-[500px] flex flex-col justify-center items-center overflow-visible">
              {dayStatus === "pendente" ? (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center gap-8 sm:gap-12 px-6"
                >
                  <div className="flex flex-col items-center gap-4">
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.5em] sm:tracking-[0.6em] font-bold text-white/50 text-center">
                      DIA EM ABERTO
                    </span>
                    <div className="w-8 h-px bg-white/20" />
                  </div>

                  <motion.p
                    animate={{ opacity: [0.6, 0.8, 0.6] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="text-2xl sm:text-3xl lg:text-4xl font-light text-white italic tracking-tight max-w-2xl leading-tight drop-shadow-2xl text-center"
                  >
                    Seu dia está completo.
                    <br />
                    <span className="text-base sm:text-lg lg:text-xl opacity-60 font-serif block mt-3 sm:mt-4">
                      Encerre com consciência.
                    </span>
                  </motion.p>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                      if (id) {
                        // Se não houver resumo, gera um automaticamente antes de finalizar
                        if (
                          !description ||
                          description.includes("Diário recém-criado")
                        ) {
                          await generateAISummary();
                        }
                        fakeDB.finishDiaryEntry(id);
                      }
                      navigate("/diary/closure");
                    }}
                    className="group relative px-10 sm:px-20 py-6 sm:py-8 rounded-full border border-white/20 text-white font-bold transition-all duration-700 overflow-hidden shadow-2xl bg-white/5 backdrop-blur-2xl w-full sm:w-auto"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-2000" />
                    <span className="relative z-10 flex items-center justify-center gap-4 sm:gap-6 tracking-[0.3em] sm:tracking-[0.5em] uppercase text-[11px] sm:text-[12px] whitespace-nowrap">
                      ENCERRAR RITUAL DO DIA
                    </span>
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 2.5 }}
                  className="flex flex-col items-center w-full max-w-7xl px-4 sm:px-6"
                >
                  {/* Subtle Label - Floating */}
                  <div className="flex flex-col items-center gap-4 mb-12 sm:mb-20">
                    <motion.span
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 0.5, y: 0 }}
                      className="text-[11px] sm:text-[12px] uppercase font-black tracking-[0.8em] sm:tracking-[1.2em] text-white"
                    >
                      DIA CONCLUÍDO
                    </motion.span>
                  </div>

                  {/* MODULAR ARCHITECTURE: Separate Glass Containers */}
                  <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-6 lg:gap-10 mb-12 sm:mb-20 w-full overflow-hidden">
                    {/* INÍCIO CONTAINER */}
                    <div className="flex flex-col items-center justify-center p-6 sm:p-10 lg:p-14 rounded-[30px] sm:rounded-[40px] bg-white/[0.05] backdrop-blur-2xl border border-white/10 shadow-2xl min-w-0 sm:min-w-[240px] w-full sm:w-auto hover:bg-white/[0.1] transition-colors duration-500">
                      <span className="text-[10px] sm:text-[10px] uppercase tracking-[0.4em] sm:tracking-[0.5em] font-bold text-white/40 mb-3 sm:mb-6">
                        INÍCIO
                      </span>
                      <div className="text-[36px] sm:text-5xl lg:text-7xl font-serif font-light text-white tracking-tighter drop-shadow-2xl">
                        {closureData?.inicio_dia || "--:--"}
                      </div>
                    </div>

                    {/* FIM CONTAINER */}
                    <div className="flex flex-col items-center justify-center p-6 sm:p-10 lg:p-14 rounded-[30px] sm:rounded-[40px] bg-white/[0.05] backdrop-blur-2xl border border-white/10 shadow-2xl min-w-0 sm:min-w-[240px] w-full sm:w-auto hover:bg-white/[0.1] transition-colors duration-500">
                      <span className="text-[10px] sm:text-[10px] uppercase tracking-[0.4em] sm:tracking-[0.5em] font-bold text-white/40 mb-3 sm:mb-6">
                        FIM
                      </span>
                      <div className="text-[36px] sm:text-5xl lg:text-7xl font-serif font-light text-white tracking-tighter drop-shadow-2xl">
                        {closureData?.fim_dia || "--:--"}
                      </div>
                    </div>

                    {/* DURAÇÃO CONTAINER */}
                    <div className="flex flex-col items-center justify-center p-6 sm:p-10 lg:p-14 rounded-[30px] sm:rounded-[40px] bg-white/[0.05] backdrop-blur-2xl border border-white/10 shadow-2xl min-w-0 sm:min-w-[240px] w-full sm:w-auto hover:bg-white/[0.1] transition-colors duration-500">
                      <span className="text-[10px] sm:text-[10px] uppercase tracking-[0.4em] sm:tracking-[0.5em] font-bold text-white/40 mb-3 sm:mb-6">
                        DURAÇÃO
                      </span>
                      <div className="text-[36px] sm:text-5xl lg:text-7xl font-serif font-light text-white tracking-tighter drop-shadow-2xl">
                        {closureData?.duracao || "--:--"}
                      </div>
                    </div>

                    {/* SONO CONTAINER */}
                    <div className="flex flex-col items-center justify-center p-6 sm:p-10 lg:p-14 rounded-[30px] sm:rounded-[40px] bg-white/[0.05] backdrop-blur-2xl border border-white/10 shadow-2xl min-w-0 sm:min-w-[240px] w-full sm:w-auto hover:bg-white/[0.1] transition-colors duration-500">
                      <span className="text-[10px] sm:text-[10px] uppercase tracking-[0.4em] sm:tracking-[0.5em] font-bold text-white/40 mb-3 sm:mb-6">
                        DESCANSO
                      </span>
                      <div className="text-[36px] sm:text-5xl lg:text-7xl font-serif font-light text-white tracking-tighter drop-shadow-2xl">
                        {closureData?.tempo_sono || "--:--"}
                      </div>
                      <span className="text-[8px] uppercase tracking-[0.2em] text-white/20 mt-2">
                        Última Noite
                      </span>
                    </div>

                    {/* MÉDIA SONO CONTAINER */}
                    <div className="flex flex-col items-center justify-center p-6 sm:p-10 lg:p-14 rounded-[30px] sm:rounded-[40px] bg-white/[0.05] backdrop-blur-2xl border border-white/10 shadow-2xl min-w-0 sm:min-w-[240px] w-full sm:w-auto hover:bg-white/[0.1] transition-colors duration-500">
                      <span className="text-[10px] sm:text-[10px] uppercase tracking-[0.4em] sm:tracking-[0.5em] font-bold text-white/40 mb-3 sm:mb-6">
                        MÉDIA SONO
                      </span>
                      <div className="text-[36px] sm:text-5xl lg:text-7xl font-serif font-light text-white tracking-tighter drop-shadow-2xl">
                        {closureData?.media_sono || "--:--"}
                      </div>
                      <span className="text-[8px] uppercase tracking-[0.2em] text-white/20 mt-2">
                        Geral de Descanso
                      </span>
                    </div>
                  </div>

                  {/* Emotional Legacy Line (Floating) */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ delay: 1 }}
                    className="flex flex-col items-center gap-6 sm:gap-8 mb-16 sm:mb-24"
                  >
                    <p className="text-xl sm:text-2xl lg:text-3xl font-light text-white italic tracking-wide px-6 sm:px-10 max-w-3xl leading-relaxed text-center">
                      "O dia foi vivido. Agora ele existe."
                    </p>
                    <div className="w-10 sm:w-12 h-px bg-white/20" />
                  </motion.div>

                  {/* BUTTON CONTAINER (Separate Primary Action) */}
                  <div className="p-2 sm:p-4 rounded-[35px] sm:rounded-[50px] bg-white/[0.05] backdrop-blur-3xl border border-white/10 shadow-inner w-[311px] sm:w-auto">
                    <motion.button
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 0 40px rgba(255, 77, 0, 0.4)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={async () => {
                        if (id) {
                          // Se não houver resumo, gera um automaticamente antes de finalizar
                          if (
                            !description ||
                            description.includes("Diário recém-criado")
                          ) {
                            await generateAISummary();
                          }
                          fakeDB.finishDiaryEntry(id);
                        }
                        navigate("/diary/closure");
                      }}
                      className="group relative px-12 sm:px-24 py-6 sm:py-10 rounded-[30px] sm:rounded-[40px] bg-gradient-to-br from-[#FF8A00] to-[#FF4D00] text-white transition-all w-full sm:w-auto flex items-center justify-center gap-4 sm:gap-6 text-[11px] sm:text-[14px] font-black tracking-[0.4em] sm:tracking-[0.6em] uppercase shadow-[0_15px_30px_rgba(0,0,0,0.3)] hover:brightness-110"
                    >
                      <span className="whitespace-nowrap">
                        VER ANÁLISE PROFUNDA
                      </span>
                      <div className="relative flex items-center justify-center">
                        <Sparkles className="w-4 h-4 sm:w-5 h-5 text-white/80 group-hover:text-white transition-all duration-500" />
                        <div className="absolute inset-0 bg-white blur-xl opacity-0 group-hover:opacity-30 rounded-full transition-opacity" />
                      </div>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isDocFolderSelectorOpen && (
          <DocFolderSelector
            onSelect={handleDocFolderSelect}
            onClose={() => {
              setIsDocFolderSelectorOpen(false);
              setActiveRange(null);
              editor?.commands.focus();
            }}
          />
        )}
        {isHighlightModalOpen && (
          <HighlightModal
            onSelect={handleHighlightSelect}
            onClose={() => {
              setIsHighlightModalOpen(false);
              setActiveRange(null);
              editor?.commands.focus();
            }}
          />
        )}
        {isLinkModalOpen && (
          <LinkModal
            initialData={linkInitialData}
            onSelect={handleLinkSelect}
            onClose={() => {
              setIsLinkModalOpen(false);
              setActiveRange(null);
              setLinkInitialData(undefined);
              editor?.commands.focus();
            }}
          />
        )}
        {isTextColorModalOpen && (
          <TextColorModal
            onSelect={handleTextColorSelect}
            onClose={() => {
              setIsTextColorModalOpen(false);
              setActiveRange(null);
              editor?.commands.focus();
            }}
          />
        )}
        {isCoverModalOpen && (
          <CoverModal
            onSelect={(url) => {
              setCoverImage(url);
              setIsCoverModalOpen(false);
            }}
            onClose={() => setIsCoverModalOpen(false)}
            onRemove={() => {
              setCoverImage(null);
              setIsCoverModalOpen(false);
              setIsRepositioning(false);
            }}
            onReposition={() => {
              setIsCoverModalOpen(false);
              setIsRepositioning(true);
            }}
            hasCover={!!coverImage}
          />
        )}
        {isIconModalOpen && (
          <IconModal
            onSelect={(icon) => {
              setDocIcon(icon);
              setIsIconModalOpen(false);
            }}
            onClose={() => setIsIconModalOpen(false)}
            onRemove={() => {
              setDocIcon(null);
              setIsIconModalOpen(false);
            }}
            hasIcon={!!docIcon}
          />
        )}
        {isExecutionModalOpen && selectedTaskForExecution && (
          selectedTaskForExecution.executionType && selectedTaskForExecution.executionType !== 'standard' ? (
            <MultimodalExecutionModal
              isOpen={isExecutionModalOpen}
              onClose={() => {
                setIsExecutionModalOpen(false);
                setSelectedTaskForExecution(null);
              }}
              task={selectedTaskForExecution}
              onUpdate={handleUpdateTaskLocal}
              objectiveTitle={selectedTaskForExecution.objectiveTitle || 'Prática'}
              metaIntention={selectedTaskForExecution.metaIntention}
              initialElapsedSeconds={activeInlineTaskId === selectedTaskForExecution.id ? inlineElapsedSeconds : undefined}
              initialStatus={activeInlineTaskId === selectedTaskForExecution.id ? (isInlinePaused ? 'paused' : 'in-progress') : undefined}
            />
          ) : (
            <TaskExecutionModal
              isOpen={isExecutionModalOpen}
              onClose={() => {
                setIsExecutionModalOpen(false);
                setSelectedTaskForExecution(null);
              }}
              task={selectedTaskForExecution}
              onUpdate={handleUpdateTaskLocal}
              objectiveTitle={selectedTaskForExecution.objectiveTitle || 'Tarefa'}
              metaIntention={selectedTaskForExecution.metaIntention}
              initialElapsedSeconds={activeInlineTaskId === selectedTaskForExecution.id ? inlineElapsedSeconds : undefined}
              initialStatus={activeInlineTaskId === selectedTaskForExecution.id ? (isInlinePaused ? 'paused' : 'in-progress') : undefined}
            />
          )
        )}
      </AnimatePresence>
    </div>
  );
}
