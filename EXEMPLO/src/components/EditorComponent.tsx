import { useEditor, EditorContent, Editor, ReactRenderer, Extension } from '@tiptap/react';
import { useParams, useNavigate } from 'react-router-dom';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextAlign } from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Highlight } from '@tiptap/extension-highlight';
import { Underline } from '@tiptap/extension-underline';
import { FontFamily } from '@tiptap/extension-font-family';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { ImageCarousel } from '../extensions/ImageCarousel';
import { DocFolderBlock } from '../extensions/DocFolderBlock';
import { AIBlock } from '../extensions/AIBlock';
import { DocFolderSelector } from './DocFolderSelector';
import Suggestion from '@tiptap/suggestion';
import { common, createLowlight } from 'lowlight';
import tippy, { Instance as TippyInstance, hideAll } from 'tippy.js';
import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  X,
  Images,
  Link2,
  ArrowLeft,
  Trash2,
  ChevronLeft,
  Sun,
  Moon,
  Image as ImageIcon,
  ImagePlus,
  Smile,
  Save,
  Sparkles
} from 'lucide-react';
import { SuggestionList } from './SuggestionList';
import { HighlightModal, LinkModal, TextColorModal, CoverModal, IconModal } from './EditorModals';
import { DocumentCover, DocumentIcon } from './DocumentDecoration';
import { documentService } from '../services/documentService';

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
        opacity: [0, 1, 1, 0]
      }}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut",
        repeatDelay: 0.5
      }}
    />
  </motion.svg>
);

// Custom extension for Slash Commands
const Commands = Extension.create({
  name: 'commands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
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
  onEditorReady?: (editor: Editor) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  hideHeader?: boolean;
  initialContent?: string; // Adicionado para suportar a Amparadora
}

const getSuggestionItems = ({ query, editor }: { query: string; editor: Editor }) => {
  return [
    {
      title: 'H1',
      icon: <Heading1 size={18} />,
      command: ({ editor, range }: any) => {
        if (range) {
          editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
        } else {
          editor.chain().focus().setNode('heading', { level: 1 }).run();
        }
      },
    },
    {
      title: 'H2',
      icon: <Heading2 size={18} />,
      command: ({ editor, range }: any) => {
        if (range) {
          editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
        } else {
          editor.chain().focus().setNode('heading', { level: 2 }).run();
        }
      },
    },
    {
      title: 'H3',
      icon: <Heading3 size={18} />,
      command: ({ editor, range }: any) => {
        if (range) {
          editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
        } else {
          editor.chain().focus().setNode('heading', { level: 3 }).run();
        }
      },
    },
    {
      title: 'Texto',
      icon: <Type size={18} />,
      command: ({ editor, range }: any) => {
        if (range) {
          editor.chain().focus().deleteRange(range).setNode('paragraph').run();
        } else {
          editor.chain().focus().setNode('paragraph').run();
        }
      },
    },
    {
      title: 'Lista de Marcadores',
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
      title: 'Lista Numerada',
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
      title: 'Citação',
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
      title: 'Bloco de Código',
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
      title: 'Tabela',
      icon: <TableIcon size={18} />,
      command: ({ editor, range }: any) => {
        if (range) {
          editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        } else {
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        }
      },
    },
    {
      title: 'Linha Divisória',
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
      title: 'Adicionar imagem',
      icon: <ImageIcon size={18} />,
      command: ({ editor, range }: any) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e: any) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              const url = reader.result as string;
              if (range) {
                editor.chain().focus().deleteRange(range).setImage({ src: url }).run();
              } else {
                editor.chain().focus().setImage({ src: url }).run();
              }
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      },
    },
    {
      title: 'Carrossel de Imagens',
      icon: <Images size={18} />,
      command: ({ editor, range }: any) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'image/*';
        input.onchange = async (e: any) => {
          const files = Array.from(e.target.files as FileList);
          if (files.length > 0) {
            const images = await Promise.all(
              files.map(file => new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
              }))
            );
            if (range) {
              editor.chain().focus().deleteRange(range).setImageCarousel({ images }).run();
            } else {
              editor.chain().focus().setImageCarousel({ images }).run();
            }
          }
        };
        input.click();
      },
    },
    {
      title: 'Cor do texto',
      icon: <Type size={18} />,
      command: ({ editor, range }: any) => {
        if (range) {
          editor.chain().focus().deleteRange(range).run();
        }
        window.dispatchEvent(new CustomEvent('open-text-color-modal', { detail: { range: null } }));
      },
    },
    {
      title: 'Marca-texto',
      icon: <Brush size={18} />,
      command: ({ editor, range }: any) => {
        if (range) {
          editor.chain().focus().deleteRange(range).run();
        }
        window.dispatchEvent(new CustomEvent('open-highlight-modal', { detail: { range: null } }));
      },
    },
    {
      title: 'Link',
      icon: <LinkIcon size={18} />,
      command: ({ editor, range }: any) => {
        if (range) {
          editor.chain().focus().deleteRange(range).run();
        }
        window.dispatchEvent(new CustomEvent('open-link-modal', { detail: { range: null } }));
      },
    },
    {
      title: 'Documento ou Pasta',
      icon: <FolderOpen size={18} />,
      command: ({ editor, range }: any) => {
        if (range) {
          editor.chain().focus().deleteRange(range).run();
        }
        window.dispatchEvent(new CustomEvent('open-doc-folder-selector', { 
          detail: { range: null } 
        }));
      },
    },
    {
      title: 'Adicionar capa',
      icon: <ImagePlus size={18} />,
      command: ({ editor, range }: any) => {
        if (range) {
          editor.chain().focus().deleteRange(range).run();
        }
        window.dispatchEvent(new CustomEvent('open-cover-modal'));
      },
    },
    {
      title: 'Adicionar ícone',
      icon: <Smile size={18} />,
      command: ({ editor, range }: any) => {
        if (range) {
          editor.chain().focus().deleteRange(range).run();
        }
        window.dispatchEvent(new CustomEvent('open-icon-modal'));
      },
    },
  ].filter(item => item.title.toLowerCase().startsWith(query.toLowerCase()));
};

export default function EditorComponent({ 
  onEditorReady, 
  theme, 
  onToggleTheme,
  onToggleSidebar,
  hideHeader = false,
  initialContent // Recebendo o conteúdo inicial
}: EditorProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('Documento sem título');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [activeModal, setActiveModal] = useState<'tools' | 'folder' | 'highlight' | 'link' | 'color' | 'cover' | 'icon' | null>(null);
  const [suggestionProps, setSuggestionProps] = useState<any>(null);
  const [suggestionPosition, setSuggestionPosition] = useState<{ top: number; left: number } | null>(null);
  const suggestionRef = useRef<any>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverPosition, setCoverPosition] = useState(50);
  const [docIcon, setDocIcon] = useState<string | null>(null);
  const [activeRange, setActiveRange] = useState<any>(null);
  const [linkInitialData, setLinkInitialData] = useState<{ url: string; text: string } | undefined>(undefined);
  const sideMenuRef = useRef<HTMLButtonElement>(null);

  const closeMenus = useCallback(() => {
    // Force immediate total cleanup of all Tippy instances in the page
    try {
      hideAll({ duration: 0 });
      // Extra safety: manual cleanup of any stray tippy roots
      document.querySelectorAll('[data-tippy-root]').forEach(el => {
        try {
          (el as any)._tippy?.destroy();
          el.remove();
        } catch (e) {}
      });
    } catch (e) {}
    
    setActiveModal(null);
    setSuggestionProps(null);
    setSuggestionPosition(null);
  }, []);

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
          class: 'text-[#7C5CFF] underline underline-offset-4 decoration-[#7C5CFF]/30 hover:decoration-[#7C5CFF] transition-all cursor-pointer font-medium',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-6',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            background: {
              default: null,
              parseHTML: element => element.style.background,
              renderHTML: attributes => {
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
          class: 'my-8 border-t border-zinc-800',
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
          items: ({ query }: { query: string }) => getSuggestionItems({ query, editor: editor! }),
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
                setActiveModal('tools');
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
                if (props.event.key === 'Escape') {
                  setActiveModal(null);
                  return true;
                }
                return suggestionRef.current?.onKeyDown(props);
              },

              onExit() {
                setActiveModal(null);
                setSuggestionProps(null);
                setSuggestionPosition(null);
              },
            };
          },
        },
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      // Auto-save handled by useEffect
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-[700px] mx-auto px-4 pt-2 pb-20 focus:outline-none min-h-[calc(100vh-120px)] font-sans',
      },
    },
  });

  // Load document metadata by ID
  useEffect(() => {
    if (id) {
      const page = documentService.getPageById(id);
      if (page) {
        setTitle(page.title);
        if (page.coverImage) setCoverImage(page.coverImage);
        else setCoverImage(null);
        
        if (page.coverPosition !== undefined) setCoverPosition(page.coverPosition);
        if (page.icon) setDocIcon(page.icon);
        else setDocIcon(null);
      }
    }
  }, [id]);

  // Load document content by ID when editor is ready
  useEffect(() => {
    if (id && editor) {
      const page = documentService.getPageById(id);
      if (page && editor.getHTML() !== page.content) {
        editor.commands.setContent(page.content);
      }
    }
  }, [id, editor]);

  // NOVA LÓGICA DE CARREGAMENTO (Protege contra o texto sumir)
  useEffect(() => {
    if (!id && editor && initialContent && editor.getHTML() === '<p></p>') {
      editor.commands.setContent(initialContent);
    }
  }, [id, editor, initialContent]);

  const saveDocument = useCallback(() => {
    if (!id || !editor) return;
    
    const currentContent = editor.getHTML();
    const page = documentService.getPageById(id);
    
    const hasChanged = page && (
      page.title !== title ||
      page.content !== currentContent ||
      page.coverImage !== coverImage ||
      page.coverPosition !== coverPosition ||
      page.icon !== docIcon
    );

    if (hasChanged) {
      documentService.updatePage(id, {
        title,
        content: currentContent,
        coverImage,
        coverPosition,
        icon: docIcon
      });
      console.log('Document saved:', title);
    }
  }, [id, editor, title, coverImage, coverPosition, docIcon]);

  // Auto-save logic
  useEffect(() => {
    const timer = setTimeout(saveDocument, 1000);
    return () => clearTimeout(timer);
  }, [saveDocument]);

  // Save on unmount
  useEffect(() => {
    return () => {
      saveDocument();
    };
  }, [saveDocument]);

  const handleSideMenuClick = useCallback(() => {
    if (!editor || !sideMenuRef.current) return;

    // Toggle logic: if already open as tools, close it
    if (activeModal === 'tools') {
      setActiveModal(null);
      return;
    }

    const rect = sideMenuRef.current.getBoundingClientRect();
    setSuggestionPosition({
      top: rect.bottom + 4,
      left: rect.left,
    });

    setSuggestionProps({
      items: getSuggestionItems({ query: '', editor }),
      command: (item: any) => {
        setActiveModal(null);
        item.command({ editor, range: null });
      },
      editor,
    });

    setActiveModal('tools');
  }, [editor, activeModal]);

  const updateMenuPosition = useCallback(() => {
    if (!editor) return;
    
    // Use requestAnimationFrame for smoother and more accurate timing
    requestAnimationFrame(() => {
      if (!editor || !editor.view) return;
      
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
      } catch (e) {
        setMenuPosition(null);
      }
    });
  }, [editor]);

  // Global listeners to ensure menus close
  useEffect(() => {
    const handleGlobalEvent = (e: Event) => {
      // NEVER close on scroll anywhere - strictly forbidden
      if (e.type === 'scroll') return;

      const target = e.target as HTMLElement;
      if (!target || !(target instanceof HTMLElement)) return;
      
      // Backdrop interaction
      if (target.classList?.contains('bg-transparent') || target.closest('.fixed.inset-0')) {
        // The Tools modal (activeModal === 'tools') ONLY closes via double-click on its backdrop
        // or via its dedicated Close button. Single clicks here are ignored.
        if (activeModal === 'tools' && e.type === 'dblclick' && target.classList.contains('bg-transparent')) {
          setActiveModal(null);
          return;
        }

        // If it's not the specific tools backdrop, we can allow single click closing for other overlays
        if (!activeModal && !target.closest('.suggestion-list')) {
          closeMenus();
        }
        return;
      }

      // If we are interacting with tools, don't let single clicks outside close it
      if (activeModal === 'tools') {
        const isInsideButton = sideMenuRef.current?.contains(target);
        const isInsideSuggestion = target.closest('.suggestion-list');
        
        // If we clicked outside everything but it's not a double click, we stay open
        if (!isInsideButton && !isInsideSuggestion) {
          return;
        }
      } else {
        // Standard single-click-outside closure for normal menus
        const isInsideButton = sideMenuRef.current?.contains(target);
        const isInsideSuggestion = target.closest('.suggestion-list');
        if (!isInsideButton && !isInsideSuggestion && e.type !== 'scroll') {
          closeMenus();
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenus();
      }
      // If typing in the editor, close the tools menu if it's open (side menu)
      if (activeModal === 'tools' && !suggestionProps?.clientRect && !e.metaKey && !e.ctrlKey && e.key.length === 1) {
        closeMenus();
      }
    };

    document.addEventListener('mousedown', handleGlobalEvent, true);
    document.addEventListener('touchstart', handleGlobalEvent, true);
    document.addEventListener('scroll', handleGlobalEvent, true);
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('mousedown', handleGlobalEvent, true);
      document.removeEventListener('touchstart', handleGlobalEvent, true);
      document.removeEventListener('scroll', handleGlobalEvent, true);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  // Editor-specific listeners to close menus
  useEffect(() => {
    if (!editor) return;

    editor.on('transaction', () => {
      // Don't close if it was a selection update that might need the plus button
    });
    
    editor.on('focus', () => {
      // Force position update immediately on focus
      updateMenuPosition();
    });
    
    editor.on('blur', (props) => {
      // Only close if we didn't focus into a menu related element
      const target = (props.event as any)?.relatedTarget as HTMLElement;
      if (!target?.closest('.suggestion-list') && !target?.closest('.fixed.inset-0')) {
        closeMenus();
      }
    });

    editor.on('selectionUpdate', () => {
      updateMenuPosition();
    });

    return () => {
      editor.off('transaction', closeMenus);
      editor.off('focus');
      editor.off('blur');
      editor.off('selectionUpdate');
    };
  }, [editor, updateMenuPosition, closeMenus]);

  // Clean up if activeModal changes to null (for example, via closeMenus)
  useEffect(() => {
    if (!activeModal) {
      closeMenus();
    }
  }, [activeModal, closeMenus]);

  // Listen for AI block insertion
  useEffect(() => {
    const handleInsertAIBlock = (e: any) => {
      if (!editor) return;
      const { type, data, content: textContent } = e.detail;
      
      const chain = editor.chain().focus();
      
      if (textContent) {
        chain.insertContent(`<p>${textContent}</p>`);
      }

      chain.insertContent({
        type: 'aiBlock',
        attrs: { type, data }
      }).run();
      
      // Scroll to bottom
      setTimeout(() => {
        const editorElement = document.querySelector('.tiptap');
        if (editorElement) {
          editorElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }, 100);
    };

    window.addEventListener('insert-ai-block', handleInsertAIBlock);

    const handleInsertAIText = (e: any) => {
      if (!editor) return;
      const { text, isHtml } = e.detail;
      if (isHtml) {
        editor.chain().focus().insertContent(text).run();
      } else {
        editor.chain().focus().insertContent(`<p>${text}</p>`).run();
      }
    };
    window.addEventListener('insert-ai-text', handleInsertAIText);

    return () => {
      window.removeEventListener('insert-ai-block', handleInsertAIBlock);
      window.removeEventListener('insert-ai-text', handleInsertAIText);
    };
  }, [editor]);

  const handleClearCanvas = () => {
    if (!editor) return;
    if (window.confirm('Tem certeza que deseja limpar todo o conteúdo?')) {
      editor.commands.setContent('');
      setTitle('Documento sem título');
    }
  };

  const handleSaveDocument = async () => {
    if (!editor) return;
    
    try {
      const html = editor.getHTML();
      const documentData = {
        title,
        content: html,
        coverImage,
        coverPosition,
        icon: docIcon
      };

      if (id) {
        documentService.updatePage(id, documentData);
        // Silent save for better UX while auto-saving
      } else {
        const workspaces = documentService.getWorkspaces();
        const wsId = workspaces[0].id;
        const folderId = workspaces[0].folders[0]?.id || null;
        const page = documentService.addPage(wsId, folderId, title, html);
        
        // Update the page with additional data if needed (addPage currently doesn't take cover/icon)
        if (coverImage || docIcon) {
          documentService.updatePage(page.id, documentData);
        }
        
        navigate(`/editor/${page.id}`);
      }
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Erro ao salvar documento.');
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
      setActiveModal('folder');
    };

    const handleOpenHighlight = (e: any) => {
      setActiveRange(e.detail?.range || null);
      setActiveModal('highlight');
    };

    const handleOpenLink = (e: any) => {
      setActiveRange(e.detail?.range || null);
      
      if (editor) {
        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to, ' ');
        const url = editor.getAttributes('link').href || '';
        setLinkInitialData({ url, text });
      }

      setActiveModal('link');
    };

    const handleOpenTextColor = (e: any) => {
      setActiveRange(e.detail?.range || null);
      setActiveModal('color');
    };

    const handleOpenCover = () => {
      setActiveModal('cover');
    };

    const handleOpenIcon = () => {
      setActiveModal('icon');
    };

    window.addEventListener('open-doc-folder-selector', handleOpenSelector);
    window.addEventListener('open-highlight-modal', handleOpenHighlight);
    window.addEventListener('open-link-modal', handleOpenLink);
    window.addEventListener('open-text-color-modal', handleOpenTextColor);
    window.addEventListener('open-cover-modal', handleOpenCover);
    window.addEventListener('open-icon-modal', handleOpenIcon);
    return () => {
      window.removeEventListener('open-doc-folder-selector', handleOpenSelector);
      window.removeEventListener('open-highlight-modal', handleOpenHighlight);
      window.removeEventListener('open-link-modal', handleOpenLink);
      window.removeEventListener('open-text-color-modal', handleOpenTextColor);
      window.removeEventListener('open-cover-modal', handleOpenCover);
      window.removeEventListener('open-icon-modal', handleOpenIcon);
    };
  }, [editor]);

  const handleDocFolderSelect = (item: any) => {
    if (!editor) return;

    if (activeRange) {
      editor.chain().focus().deleteRange(activeRange).setDocFolderBlock(item).run();
    } else {
      editor.chain().focus().setDocFolderBlock(item).run();
    }
    
    setActiveModal(null);
    setActiveRange(null);
  };

  const handleHighlightSelect = (color: string, isGradient: boolean) => {
    if (!editor) return;

    if (activeRange) {
      editor.chain().focus().deleteRange(activeRange).run();
    }

    const isDarkColor = (c: string) => {
      if (!c) return false;
      if (c.startsWith('linear-gradient')) return true;
      const hex = c.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness < 128;
    };

    if (!color) {
      editor.chain().focus().unsetHighlight().run();
      editor.chain().focus().setMark('textStyle', { background: null }).run();
    } else if (isGradient) {
      editor.chain().focus()
        .setMark('textStyle', { background: color })
        .setColor('#ffffff')
        .run();
    } else {
      const textColor = isDarkColor(color) ? '#ffffff' : '#000000';
      editor.chain().focus()
        .setHighlight({ color })
        .setColor(textColor)
        .run();
    }

    setActiveModal(null);
    setActiveRange(null);
  };

  const handleTextColorSelect = (color: string) => {
    if (!editor) return;

    if (activeRange) {
      editor.chain().focus().deleteRange(activeRange).run();
    }

    if (!color) {
      editor.chain().focus().unsetColor().run();
    } else {
      editor.chain().focus().setColor(color).run();
    }

    setActiveModal(null);
    setActiveRange(null);
  };

  const handleLinkSelect = (data: { url: string; text: string; color: string; openInNewTab: boolean }) => {
    if (!editor) return;

    if (activeRange) {
      editor.chain().focus().deleteRange(activeRange).run();
    }

    const { from, to } = editor.state.selection;
    const hasSelection = from !== to;

    if (hasSelection) {
      editor.chain().focus()
        .extendMarkRange('link')
        .setLink({ href: data.url, target: data.openInNewTab ? '_blank' : '_self' })
        .setMark('textStyle', { color: data.color })
        .run();
    } else {
      editor.chain().focus()
        .insertContent(`<a href="${data.url}" target="${data.openInNewTab ? '_blank' : '_self'}" style="color: ${data.color}">${data.text}</a>`)
        .run();
    }

    setActiveModal(null);
    setActiveRange(null);
    setLinkInitialData(undefined);
  };

  const handleDelete = () => {
    if (!id) return;
    if (window.confirm('Tem certeza que deseja excluir este documento?')) {
      documentService.deletePage(id);
      navigate('/manager');
    }
  };

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const url = reader.result as string;
          editor?.chain().focus().setImage({ src: url }).run();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const addCarousel = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const files = Array.from(e.target.files as FileList);
      if (files.length > 0) {
        const images = await Promise.all(
          files.map(file => new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          }))
        );
        editor?.chain().focus().setImageCarousel({ images }).run();
      }
    };
    input.click();
  };

  const addDocFolder = () => {
    window.dispatchEvent(new CustomEvent('open-doc-folder-selector', { 
      detail: { range: null } 
    }));
  };

  const setLink = () => {
    window.dispatchEvent(new CustomEvent('open-link-modal'));
  };

  const openHighlight = () => {
    window.dispatchEvent(new CustomEvent('open-highlight-modal'));
  };

  const openTextColor = () => {
    window.dispatchEvent(new CustomEvent('open-text-color-modal'));
  };

  const textColor = editor?.getAttributes('textStyle').color || '#FFFFFF';

  const fonts = [
    { label: 'Inter', value: 'Inter' },
    { label: 'Poppins', value: 'Poppins' },
    { label: 'Georgia', value: 'Georgia' },
    { label: 'Monospace', value: 'JetBrains Mono' },
  ];

  return (
    <div className={`flex flex-col w-full ${hideHeader ? 'h-full' : 'min-h-screen'} relative transition-colors duration-300`} style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      {/* Integrated Header & Toolbar */}
      {!hideHeader && (
        <div 
          className="flex items-center gap-1 p-1 border-b sticky top-0 z-20 h-11 overflow-hidden select-none flex-nowrap transition-all duration-300"
          style={{ 
            backgroundColor: 'var(--surface)', 
            borderColor: 'var(--border)', 
            backdropFilter: 'blur(8px)',
            boxShadow: 'var(--header-shadow)'
          }}
        >
          <AnimatePresence mode="wait">
            {isEditingTitle ? (
              <motion.div
                key="editing"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full h-full flex items-center px-1"
              >
                <input
                  autoFocus
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                  className="w-full px-3 py-2 text-sm outline-none transition-all rounded-lg"
                  style={{ 
                    backgroundColor: 'var(--surface-hover)', 
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    boxShadow: 'var(--shadow)'
                  }}
                  placeholder="Nome do documento..."
                />
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
                  onClick={() => navigate('/manager')}
                  className="p-1.5 rounded-full hover:bg-[var(--surface-hover)] transition-colors flex-shrink-0"
                  style={{ color: 'var(--muted)' }}
                  title="Voltar ao Gerenciador"
                >
                  <SilverArrow size={23} />
                </button>
                
                <div 
                  onClick={() => setIsEditingTitle(true)}
                  className="flex flex-col flex-shrink-0 max-w-[100px] sm:max-w-[150px] cursor-pointer p-1 rounded transition-colors overflow-hidden justify-center"
                  style={{ color: 'var(--text)' }}
                >
                  <h1 className="text-[15px] font-bold truncate leading-tight">
                    {title}
                  </h1>
                </div>
  
                {/* Toolbar Icons - Scrollable */}
                <div 
                  className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x border-l ml-1 pl-1 flex-nowrap md:flex-none md:border-l-0 md:ml-4 md:pl-0"
                  style={{ borderColor: 'var(--border)' }}
                >
                  {editor && (
                    <>
                      <div className="flex gap-1 items-center px-1 border-r flex-shrink-0 flex-nowrap" style={{ borderColor: 'var(--border)' }}>
                        <select
                          onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
                          className="text-[13px] sm:text-[15px] rounded px-1.5 py-1 outline-none transition-colors flex-shrink-0"
                          style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--text)' }}
                          value={editor.getAttributes('textStyle').fontFamily || 'Inter'}
                        >
                          {fonts.map((font, idx) => (
                            <option key={`${font.value}-${idx}`} value={font.value}>
                              {font.label}
                            </option>
                          ))}
                        </select>
                      </div>
  
                      <div className="flex gap-0.5 items-center px-1 border-r flex-shrink-0 flex-nowrap" style={{ borderColor: 'var(--border)' }}>
                        <button
                          onClick={() => editor.chain().focus().toggleBold().run()}
                          className={`p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors flex-shrink-0 ${editor.isActive('bold') ? 'bg-[var(--surface-hover)]' : ''}`}
                          style={{ color: editor.isActive('bold') ? 'var(--text)' : 'var(--muted)' }}
                        >
                          <Bold size={17} />
                        </button>
                        <button
                          onClick={() => editor.chain().focus().toggleItalic().run()}
                          className={`p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors flex-shrink-0 ${editor.isActive('italic') ? 'bg-[var(--surface-hover)]' : ''}`}
                          style={{ color: editor.isActive('italic') ? 'var(--text)' : 'var(--muted)' }}
                        >
                          <Italic size={17} />
                        </button>
                      </div>
  
                      <div className="flex gap-0.5 items-center px-1 border-r flex-shrink-0 flex-nowrap" style={{ borderColor: 'var(--border)' }}>
                        <button
                          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                          className={`p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors flex-shrink-0 ${editor.isActive('heading', { level: 1 }) ? 'bg-[var(--surface-hover)]' : ''}`}
                          style={{ color: editor.isActive('heading', { level: 1 }) ? 'var(--text)' : 'var(--muted)' }}
                        >
                          <Heading1 size={17} />
                        </button>
                        <button
                          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                          className={`p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors flex-shrink-0 ${editor.isActive('heading', { level: 2 }) ? 'bg-[var(--surface-hover)]' : ''}`}
                          style={{ color: editor.isActive('heading', { level: 2 }) ? 'var(--text)' : 'var(--muted)' }}
                        >
                          <Heading2 size={17} />
                        </button>
                      </div>
  
                      <div className="flex gap-0.5 items-center px-1 border-r flex-shrink-0 flex-nowrap" style={{ borderColor: 'var(--border)' }}>
                        <button
                          onClick={openHighlight}
                          className={`p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors flex-shrink-0 ${editor.isActive('highlight') || editor.getAttributes('textStyle').background ? 'bg-[var(--surface-hover)]' : ''}`}
                          style={{ color: (editor.isActive('highlight') || editor.getAttributes('textStyle').background) ? 'var(--text)' : 'var(--muted)' }}
                        >
                          <Brush size={17} />
                        </button>
                        <button
                          onClick={openTextColor}
                          className={`p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors relative flex-shrink-0 ${editor.getAttributes('textStyle').color ? 'bg-[var(--surface-hover)]' : ''}`}
                          style={{ color: editor.getAttributes('textStyle').color ? 'var(--text)' : 'var(--muted)' }}
                        >
                          <div className="relative">
                            <Type size={17} />
                            <div 
                              className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                              style={{ background: 'linear-gradient(to right, #4285F4, #EA4335, #FBBC05, #34A853)' }}
                            />
                          </div>
                        </button>
                        <button
                          onClick={setLink}
                          className={`p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors flex-shrink-0 ${editor.isActive('link') ? 'bg-[var(--surface-hover)]' : ''}`}
                          style={{ color: editor.isActive('link') ? 'var(--text)' : 'var(--muted)' }}
                        >
                          <LinkIcon size={17} />
                        </button>
                      </div>
  
                      <div className="flex gap-0.5 items-center px-1 flex-shrink-0 flex-nowrap">
                        <button
                          onClick={() => window.dispatchEvent(new CustomEvent('open-cover-modal'))}
                          className="p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors flex-shrink-0"
                          style={{ color: 'var(--muted)' }}
                          title="Adicionar/Alterar capa"
                        >
                          <ImagePlus size={17} />
                        </button>
                        <button
                          onClick={() => window.dispatchEvent(new CustomEvent('open-icon-modal'))}
                          className="p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors flex-shrink-0"
                          style={{ color: 'var(--muted)' }}
                          title="Adicionar/Alterar ícone"
                        >
                          <Smile size={17} />
                        </button>
                        
                        <div className="w-px h-4 mx-0.5 flex-shrink-0" style={{ backgroundColor: 'var(--border)' }} />
  
                        <button
                          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                          className="p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors flex-shrink-0"
                          style={{ color: 'var(--muted)' }}
                        >
                          <TableIcon size={17} />
                        </button>
                        <button
                          onClick={addImage}
                          className="p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors flex-shrink-0"
                          style={{ color: 'var(--muted)' }}
                          title="Adicionar imagem"
                        >
                          <ImageIcon size={17} />
                        </button>
                        <button
                          onClick={addCarousel}
                          className="p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors flex-shrink-0"
                          style={{ color: 'var(--muted)' }}
                          title="Adicionar carrossel"
                        >
                          <Images size={17} />
                        </button>
                        <button
                          onClick={addDocFolder}
                          className="p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors flex-shrink-0"
                          style={{ color: 'var(--muted)' }}
                          title="Adicionar pasta/documento"
                        >
                          <FolderOpen size={17} />
                        </button>
                        <button
                          onClick={handleDelete}
                          className="p-1.5 rounded hover:bg-[var(--surface-hover)] hover:text-red-500 transition-colors flex-shrink-0"
                          style={{ color: 'var(--muted)' }}
                          title="Excluir"
                        >
                          <Trash2 size={17} />
                        </button>
                        
                        <div className="w-px h-4 mx-0.5 flex-shrink-0" style={{ backgroundColor: 'var(--border)' }} />
                        
                        <button
                          onClick={onToggleTheme}
                          className="p-1.5 rounded hover:bg-[var(--surface-hover)] transition-colors flex-shrink-0"
                          style={{ color: 'var(--muted)' }}
                          title={theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
                        >
                          {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className={`flex-1 ${hideHeader ? '' : 'overflow-y-auto'} relative scroll-smooth group/editor`}>
        <DocumentCover 
          url={coverImage}
          position={coverPosition}
          onAdd={() => setActiveModal('cover')}
          onChange={() => setActiveModal('cover')}
          onRemove={() => setCoverImage(null)}
          onPositionChange={setCoverPosition}
        />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-8 pb-32">
          {/* Combined Add Buttons for Cover and Icon */}
          {(!coverImage || !docIcon) && (
            <div className={`flex items-center gap-2 mb-1 relative z-20 ${coverImage ? 'mt-4 sm:-mt-6' : 'pt-8'}`}>
              {!coverImage && (
                <button
                  onClick={() => setActiveModal('cover')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:bg-[var(--surface-hover)]"
                  style={{ color: 'var(--muted)' }}
                >
                  <ImagePlus size={16} />
                  Adicionar capa
                </button>
              )}
              {!docIcon && (
                <button
                  onClick={() => setActiveModal('icon')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:bg-[var(--surface-hover)]"
                  style={{ color: 'var(--muted)' }}
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
            onAdd={() => setActiveModal('icon')}
            onChange={() => setActiveModal('icon')}
            onRemove={() => setDocIcon(null)}
          />
          
          <div className="relative">
            <AnimatePresence>
              {menuPosition && (
                <motion.button
                  ref={sideMenuRef}
                  onClick={handleSideMenuClick}
                  initial={{ opacity: 0, scale: 0.8, x: -5 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -5 }}
                  style={{ 
                    top: `${menuPosition.top}px`, 
                    left: `${menuPosition.left}px`,
                    transform: 'translateY(-2px)',
                    backgroundColor: 'var(--surface)', 
                    borderColor: 'var(--border)',
                    color: 'var(--muted)',
                    boxShadow: 'var(--shadow)',
                    marginLeft: '-19px'
                  }}
                  className="absolute p-1 rounded hover:bg-[var(--surface-hover)] transition-all z-20 flex items-center justify-center border"
                  title="Adicionar bloco"
                >
                  <Plus size={18} className="md:w-5 md:h-5" />
                </motion.button>
              )}
            </AnimatePresence>
            <EditorContent 
              editor={editor} 
              onClick={() => updateMenuPosition()}
            />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeModal === 'tools' && suggestionProps && suggestionPosition && (
          <div key="tools-modal" className="fixed inset-0 z-[1000] overflow-y-auto no-scrollbar pb-20">
            <div 
              className="absolute inset-0 bg-transparent" 
              onDoubleClick={() => setActiveModal(null)}
            />
            <div 
              className="absolute pointer-events-auto"
              style={{ 
                top: `${suggestionPosition.top}px`, 
                left: `${suggestionPosition.left}px`,
              }}
            >
              <SuggestionList 
                ref={suggestionRef}
                {...suggestionProps}
                onClose={() => setActiveModal(null)}
              />
            </div>
          </div>
        )}
        {activeModal === 'folder' && (
          <DocFolderSelector 
            key="doc-folder-selector-modal"
            onSelect={handleDocFolderSelect}
            onClose={() => {
              setActiveModal(null);
              setActiveRange(null);
              editor?.commands.focus();
            }}
          />
        )}
        {activeModal === 'highlight' && (
          <HighlightModal 
            key="highlight-modal"
            onSelect={handleHighlightSelect}
            onClose={() => {
              setActiveModal(null);
              setActiveRange(null);
              editor?.commands.focus();
            }}
          />
        )}
        {activeModal === 'link' && (
          <LinkModal 
            key="link-modal"
            initialData={linkInitialData}
            onSelect={handleLinkSelect}
            onClose={() => {
              setActiveModal(null);
              setActiveRange(null);
              setLinkInitialData(undefined);
              editor?.commands.focus();
            }}
          />
        )}
        {activeModal === 'color' && (
          <TextColorModal 
            key="text-color-modal"
            onSelect={handleTextColorSelect}
            onClose={() => {
              setActiveModal(null);
              setActiveRange(null);
              editor?.commands.focus();
            }}
          />
        )}
        {activeModal === 'cover' && (
          <CoverModal 
            key="cover-modal"
            onSelect={(url) => {
              setCoverImage(url);
              setActiveModal(null);
            }}
            onClose={() => setActiveModal(null)}
          />
        )}
        {activeModal === 'icon' && (
          <IconModal 
            key="icon-modal"
            onSelect={(icon) => {
              setDocIcon(icon);
              setActiveModal(null);
            }}
            onClose={() => setActiveModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
