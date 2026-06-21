import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React from 'react';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageCarousel: {
      setImageCarousel: (options: { images: string[] }) => ReturnType;
    };
  }
}

const ImageCarouselComponent = ({ node }: any) => {
  const images = Array.isArray(node?.attrs?.images) ? node.attrs.images : [];

  return (
    <NodeViewWrapper className="image-carousel-wrapper my-8">
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory outline-none">
        {images.map((src: string, index: number) => (
          <div 
            key={index} 
            className="flex-none w-full rounded-xl overflow-hidden snap-center shadow-xl border"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <img 
              src={src} 
              alt={`Carousel item ${index + 1}`} 
              className="w-full h-auto object-contain block"
              referrerPolicy="no-referrer"
            />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {images.map((_: any, index: number) => (
            <div key={index} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--border)' }} />
          ))}
        </div>
      )}
    </NodeViewWrapper>
  );
};

export const ImageCarousel = Node.create({
  name: 'imageCarousel',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      images: {
        default: [],
        parseHTML: element => {
          try {
            return JSON.parse(element.getAttribute('data-images') || '[]');
          } catch (err) {
            return [];
          }
        },
        renderHTML: attributes => {
          return {
            'data-images': JSON.stringify(attributes.images),
          }
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="image-carousel"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'image-carousel' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageCarouselComponent);
  },

  addCommands() {
    return {
      setImageCarousel:
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
