import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React from 'react';
import { DynamicRenderer } from '../components/DynamicRenderer';

const AIBlockView = (props: any) => {
  const { type, data } = props.node.attrs;

  return (
    <NodeViewWrapper className="my-8 w-full max-w-4xl mx-auto">
      <DynamicRenderer type={type} data={data} />
    </NodeViewWrapper>
  );
};

export const AIBlock = Node.create({
  name: 'aiBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      type: {
        default: 'card',
      },
      data: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="ai-block"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'ai-block' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AIBlockView);
  },
});
