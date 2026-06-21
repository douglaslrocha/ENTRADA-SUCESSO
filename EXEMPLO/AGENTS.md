# Ciência e Diretrizes do Sistema (App Science & Rules)

Este arquivo define o mapeamento arquitetural e as regras invioláveis de preservação de código para o **Remix 1.7 / A5 Douglas** e o módulo **Objective Central**. Todas as interações de IA devem ler, compreender e aderir estritamente a estas diretrizes.

---

## ─── 1. ARQUITETURA E DIRETÓRIOS ───

O projeto é constituído por uma arquitetura dual bem estruturada:

### A. Frontend SPA (Raiz `/`)
*   **Tecnologias:** React 19, Vite, Tailwind CSS (v4), Framer Motion (`motion/react`).
*   **Ponto de Entrada:** `/src/main.tsx` e `/index.html`.
*   **Componente Central:** `/src/App.tsx` (gerencia as rotas, sincronização automática de tema e sincronização biológica do sistema).
*   **Visual Elements:** Design extremamente refinado com transições fluidas de rotas, resets de scroll automáticos e suporte dinâmico a temas claro (light) e escuro (dark) com base na preferência do sistema.

### B. Backend API (Subdiretório `/backend`)
*   **Tecnologias:** Fastify/Express, Node.js + TypeScript (`tsx`), SQLite/PostgreSQL.
*   **Ponto de Entrada:** `/backend/src/server.ts` monitorado pelo gateway `/backend/src/gateway.ts`.
*   **Rotas Fundamentais:** Finanças, diário, objetivos, workspaces e gerenciador de identidade.

---

## ─── 2. REGRAS INVIOLÁVEIS DE PRESERVAÇÃO ───

Para garantir que o aplicativo nunca quebre, seja corrompido ou perca funcionalidades:

### 🚫 Regra 1: Proibido Deletar ou Modificar Código Existente sem Permissão Explicita
*   Qualquer nova funcionalidade deve ser adicionada de forma **incremental e modular**.
*   **NÃO** altere assinaturas de funções ou apague trechos de lógica legada de sincronização de dados (ex: `useOrganismSync`, `db.syncWithBackend`, `documentService.syncWithBackend`, `fakeDB.seed`).
*   **NÃO** limpe o banco de dados interno ou os estados mock de dados (`fakeDB`). Eles são essenciais para manter as telas populadas de maneira profissional.

### 🚫 Regra 2: Preservação de Lógica de UI e Transições Estáveis
*   Os resets de scroll e transições hápticas (`haptics.transition()`) que ocorrem nas trocas de rota no `App.tsx` **devem permanecer intactos**. Eles evitam falhas visuais no carregamento de telas longas.
*   Os estados de navegação móvel e gestos (como o swipe-back global `useSwipeBack()`) são obrigatórios e não devem ser removidos.

### 🚫 Regra 3: Consistência de Temas e Design
*   O aplicativo sincroniza dinamicamente o tema do sistema (`prefers-color-scheme`) e respeita o estado salvo localmente (`safeLocalStorage`). Nunca force um tema estático de forma destrutiva.
*   **Isolamento de Alterações de Tema (Modo White vs. Modo Dark):**
    *   Quando forem solicitadas alterações para o **Modo White (modo claro)**, elas devem ser aplicadas **exclusivamente** às seleções e classes de modo claro (utilizando a classe `.light`, blocos condicionais de tema claro ou estilos específicos para o tema claro).
    *   **NUNCA**, sob qualquer circunstância, delete, simplifique, desative ou corrompa os estilos e recursos correspondentes do **Modo Dark**. O suporte dual-theme de altíssimo nível deve permanecer 100% íntegro.
*   Use as fontes oficiais integradas (**Inter**, **Plus Jakarta Sans**, **Playfair Display**, **JetBrains Mono** para indicações técnicas) e Tailwind CSS v4 para manter a identidade visual elegante, espaçosa e de altíssimo padrão.

### 🚫 Regra 4: Validação Obrigatória de Compilação
*   Antes de finalizar qualquer alteração, o agente **deve** rodar as verificações do ecossistema:
    1. `lint_applet` para confirmar que não existem erros de sintaxe ou imports órfãos.
    2. `compile_applet` para garantir que o build de produção do Vite e do TypeScript está 100% verde.

---

## ─── 3. ESTRUTURA DE DADOS E PERSISTÊNCIA ───

*   Qualquer nova entidade ou classe de dados deve ser declarada no arquivo de tipos compartilhado `/src/types.ts`.
*   Persistência local: Sempre utilize os wrappers seguros (`safeLocalStorage` ou o adaptador `storage` do workspace) para evitar falhas ou exceptions no iFrame do navegador.
*   Toda operação com APIs e chaves secretas deve rodar server-side ou passar por proxy seguro sem expor credenciais ao client-side.

---

Este arquivo serve como o guardião da integridade do sistema. Qualquer desvio ou alteração destrutiva sem solicitação literal será tratado como erro operacional crítico.
