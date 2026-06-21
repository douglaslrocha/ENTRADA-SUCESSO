/**
 * Notebook Context (LLM Notebook).
 * Permite ao usuário ou ao sistema definir um contexto temporário e dinâmico
 * que influencia diretamente o comportamento da IA.
 */

let notebookContext: string = "";

export const notebookManager = {
  /**
   * Define o contexto temporário.
   * Ex: "Use tom emocional", "Escreva como documentário", "Foque em produtividade extrema".
   */
  setContext(text: string) {
    notebookContext = text;
    console.log('[NotebookContext] Contexto definido:', notebookContext);
  },

  /**
   * Recupera o contexto atual para ser incluído no prompt.
   */
  getContext(): string {
    if (!notebookContext) return "";
    
    return `### CONTEXTO DINÂMICO (LLM NOTEBOOK)\n- ${notebookContext}\n`;
  },

  /**
   * Limpa o contexto temporário.
   */
  clearContext() {
    notebookContext = "";
    console.log('[NotebookContext] Contexto limpo.');
  }
};
