import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React from 'react';
import { FileText, Folder, ExternalLink } from 'lucide-react';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    docFolderBlock: {
      setDocFolderBlock: (options: { id: string; title: string; type: 'folder' | 'document'; icon?: string; color?: string }) => ReturnType;
    };
  }
}

const DocFolderBlockComponent = ({ node }: any) => {
  const { title, type, color, icon } = node.attrs;
  
  // Map icon string to component
  const getIcon = () => {
    if (icon === 'folder') return Folder;
    if (icon === 'file-text') return FileText;
    return type === 'folder' ? Folder : FileText;
  };
  
  const Icon = getIcon();

  return (
    <NodeViewWrapper className="doc-folder-block-wrapper my-4">
      <div 
        className="group relative flex items-center gap-3 p-3 rounded-xl border select-none active:scale-[0.98] shadow-md"
        style={{ 
          backgroundColor: 'var(--surface)', 
          borderColor: 'var(--border)' 
        }}
        onClick={() => console.log(`Opening ${type}: ${title}`)}
      >
        {/* Background overlay for energy - now static */}
        <div 
          className="absolute inset-0 opacity-100 rounded-xl pointer-events-none"
          style={{ 
            backgroundColor: `${color}08`,
            boxShadow: `inset 0 0 20px ${color}05`
          }}
        />

        <div 
          className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 scale-110 relative z-10"
          style={{ backgroundColor: `${color}15`, color: color }}
        >
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0 relative z-10">
          <div className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{title}</div>
          <div className="text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5" style={{ color: 'var(--muted)' }}>
            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: color }} />
            {type === 'folder' ? 'Pasta' : 'Documento'}
          </div>
        </div>
        <div className="pr-1 relative z-10" style={{ color: 'var(--muted)' }}>
          <ExternalLink size={14} />
        </div>
        
        {/* Visual highlight line - now static */}
        <div 
          className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full opacity-100 translate-x-0"
          style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}40` }}
        />
      </div>
    </NodeViewWrapper>
  );
};

export const DocFolderBlock = Node.create({
  name: 'docFolderBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      id: { default: null },
      title: { default: 'Sem título' },
      type: { default: 'document' },
      icon: { default: null },
      color: { default: '#3b82f6' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="doc-folder-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'doc-folder-block' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DocFolderBlockComponent);
  },

  addCommands() {
    return {
      setDocFolderBlock:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});
