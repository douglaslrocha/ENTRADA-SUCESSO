import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { 
  Heading1, 
  Heading2, 
  Heading3, 
  Text, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Table as TableIcon,
  Image as ImageIcon,
  CheckSquare,
  X
} from 'lucide-react';

export const SuggestionList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
      // Close the menu after command execution
      if (props.onClose) {
        props.onClose();
      }
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'Escape' || event.key === 'Tab') {
        props.onClose?.();
        return true;
      }

      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="suggestion-list relative flex flex-col">
      {props.onClose && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] bg-[var(--surface-hover)]/30">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Ferramentas</span>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              props.onClose();
            }}
            className="p-1 rounded-md hover:bg-red-500/10 hover:text-red-500 transition-all text-[var(--muted)]"
            title="Fechar"
          >
            <X size={14} />
          </button>
        </div>
      )}
      <div className="max-h-[300px] overflow-y-auto no-scrollbar">
        {props.items.length ? (
        props.items.map((item: any, index: number) => (
          <button
            className={`suggestion-item ${index === selectedIndex ? 'is-selected' : ''}`}
            key={`${item.title}-${index}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              selectItem(index);
            }}
          >
            {item.icon}
            <span>{item.title}</span>
          </button>
        ))
      ) : (
        <div className="px-4 py-2 text-sm italic" style={{ color: 'var(--muted)' }}>Nenhum resultado</div>
      )}
      </div>
    </div>
  );
});

SuggestionList.displayName = 'SuggestionList';
