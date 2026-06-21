export interface SessionState {
  lastIntent: string | null;
  lastAIResponse: any | null;
  pendingAction: any | null;
  status: 'idle' | 'awaiting_confirmation';
}

let state: SessionState = {
  lastIntent: null,
  lastAIResponse: null,
  pendingAction: null,
  status: 'idle'
};

export const sessionContext = {
  getState(): SessionState {
    return { ...state };
  },

  updateState(newState: Partial<SessionState>) {
    state = { ...state, ...newState };
    console.log('[SessionContext] Estado atualizado:', state);
  },

  clearPendingAction() {
    state.pendingAction = null;
    state.status = 'idle';
    console.log('[SessionContext] Ação pendente limpa.');
  },

  isAwaitingConfirmation(): boolean {
    return state.status === 'awaiting_confirmation' && !!state.pendingAction;
  }
};
