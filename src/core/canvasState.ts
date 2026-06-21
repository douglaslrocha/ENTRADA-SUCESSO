import { useState, useEffect } from 'react';

export interface CanvasState {
  blocks: any[];
  type: string;
  meta: any;
}

let state: CanvasState = {
  blocks: [],
  type: 'text',
  meta: {}
};

const listeners: Set<(state: CanvasState) => void> = new Set();

export const setCanvasState = (newState: Partial<CanvasState>) => {
  state = { ...state, ...newState };
  listeners.forEach(listener => listener(state));
};

export const resetCanvasState = () => {
  state = {
    blocks: [],
    type: 'text',
    meta: {}
  };
  listeners.forEach(listener => listener(state));
};

export const useCanvasState = () => {
  const [currentState, setCurrentState] = useState(state);

  useEffect(() => {
    const listener = (s: CanvasState) => setCurrentState(s);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return currentState;
};
