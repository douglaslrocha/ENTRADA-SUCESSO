import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from './db.js';
import { z } from 'zod';
import { getUserIdFromRequest } from './middleware/auth.js';
import crypto from 'crypto';

// ============================================
// TypeScript Interfaces (DB Rows)
// ============================================

interface WorkspaceRow {
  id: string;
  user_id: string;
  name: string;
  is_pinned: boolean;
  is_hidden: boolean;
  color: string;
  icon: string;
  icon_type: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

interface FolderRow {
  id: string;
  user_id: string;
  workspace_id: string;
  name: string;
  is_pinned: boolean;
  color: string;
  icon: string;
  icon_type: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

interface PageRow {
  id: string;
  user_id: string;
  folder_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  cover_image: string | null;
  cover_position: string | number;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// TypeScript Interfaces (Frontend DTOs)
// ============================================

interface WorkspaceDTO {
  id: string;
  name: string;
  isPinned: boolean;
  isHidden: boolean;
  color: string;
  icon: string;
  iconType: string;
  imageUrl: string;
  folders: FolderDTO[];
}

interface FolderDTO {
  id: string;
  name: string;
  isPinned: boolean;
  color: string;
  icon: string;
  iconType: string;
  imageUrl: string;
  pages: PageDTO[];
}

interface PageDTO {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  coverImage: string | null;
  coverPosition: number;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface WorkspaceStats {
  totalWorkspaces: number;
  totalFolders: number;
  totalPages: number;
  lastUpdated: string | null;
}

// ============================================
// Zod Validation Schemas
// ============================================

const iconTypeEnum = z.enum(['emoji', 'lucide', 'image']).default('emoji');

/** Schema para criação/atualização de Workspace */
const workspaceBodySchema = z.object({
  name: z.string().min(1, 'Nome do workspace é obrigatório').max(500, 'Nome muito longo (máx 500 caracteres)'),
  isPinned: z.boolean().default(false),
  isHidden: z.boolean().default(false),
  color: z.string().max(50).default('#000000'),
  icon: z.string().max(100).default('📁'),
  iconType: iconTypeEnum,
  imageUrl: z.string().max(2000).default(''),
  updatedAt: z.string().optional(), // Optimistic locking — se enviado, checa antes de atualizar
});

/** Schema para criação/atualização de Folder */
const folderBodySchema = z.object({
  workspaceId: z.string().min(1, 'workspaceId é obrigatório').max(100),
  name: z.string().min(1, 'Nome da pasta é obrigatório').max(500, 'Nome muito longo (máx 500 caracteres)'),
  isPinned: z.boolean().default(false),
  color: z.string().max(50).default('#000000'),
  icon: z.string().max(100).default('📁'),
  iconType: iconTypeEnum,
  imageUrl: z.string().max(2000).default(''),
  updatedAt: z.string().optional(),
});

/** Schema para criação/atualização de Page */
const pageBodySchema = z.object({
  folderId: z.string().min(1, 'folderId é obrigatório').max(100),
  title: z.string().min(1, 'Título é obrigatório').max(1000, 'Título muito longo (máx 1000 caracteres)'),
  content: z.string().default(''),
  isPinned: z.boolean().default(false),
  coverImage: z.string().max(2000).nullable().default(null),
  coverPosition: z.number().min(0).max(100).default(50),
  icon: z.string().max(100).nullable().default(null),
  updatedAt: z.string().optional(),
});

/** Schema para Page dentro do Sync */
const syncPageSchema = z.object({
  id: z.string().min(1, 'ID da página é obrigatório').max(100),
  title: z.string().min(1).max(1000),
  content: z.string().default(''),
  isPinned: z.boolean().default(false),
  coverImage: z.string().max(2000).nullable().optional(),
  coverPosition: z.number().min(0).max(100).default(50),
  icon: z.string().max(100).nullable().optional(),
});

/** Schema para Folder dentro do Sync */
const syncFolderSchema = z.object({
  id: z.string().min(1, 'ID da pasta é obrigatório').max(100),
  name: z.string().min(1).max(500),
  isPinned: z.boolean().default(false),
  color: z.string().max(50).default('#000000'),
  icon: z.string().max(100).default('📁'),
  iconType: iconTypeEnum,
  imageUrl: z.string().max(2000).default(''),
  pages: z.array(syncPageSchema).default([]),
});

/** Schema para Workspace dentro do Sync */
const syncWorkspaceSchema = z.object({
  id: z.string().min(1, 'ID do workspace é obrigatório').max(100),
  name: z.string().min(1).max(500),
  isPinned: z.boolean().default(false),
  isHidden: z.boolean().default(false),
  color: z.string().max(50).default('#000000'),
  icon: z.string().max(100).default('📁'),
  iconType: iconTypeEnum,
  imageUrl: z.string().max(2000).default(''),
  folders: z.array(syncFolderSchema).default([]),
});

/** Schema para o payload completo de Sync */
const syncPayloadSchema = z.object({
  workspaces: z.array(syncWorkspaceSchema).default([]),
});

// ============================================
// Mappers: DB Row → Frontend DTO
// ============================================

function mapWorkspaceRow(row: WorkspaceRow, folders: FolderDTO[] = []): WorkspaceDTO {
  return {
    id: row.id,
    name: row.name,
    isPinned: row.is_pinned,
    isHidden: row.is_hidden,
    color: row.color,
    icon: row.icon,
    iconType: row.icon_type,
    imageUrl: row.image_url,
    folders,
  };
}

function mapFolderRow(row: FolderRow, pages: PageDTO[] = []): FolderDTO {
  return {
    id: row.id,
    name: row.name,
    isPinned: row.is_pinned,
    color: row.color,
    icon: row.icon,
    iconType: row.icon_type,
    imageUrl: row.image_url,
    pages,
  };
}

function mapPageRow(row: PageRow): PageDTO {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    isPinned: row.is_pinned,
    coverImage: row.cover_image,
    coverPosition: row.cover_position ? Number(row.cover_position) : 50,
    icon: row.icon,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================
// ETag / Cache Helpers
// ============================================

/**
 * Gera um ETag (hash MD5) a partir dos dados de resposta.
 * Usado para cache condicional com If-None-Match.
 */
function generateETag(data: unknown): string {
  const hash = crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
  return `"${hash}"`;
}

/**
 * Verifica se o ETag do request bate com os dados atuais.
 * Se sim, retorna 304 Not Modified.
 * @returns true se o cache é válido (304 enviado)
 */
function handleCacheHeaders(
  request: FastifyRequest,
  reply: FastifyReply,
  data: unknown
): boolean {
  const etag = generateETag(data);
  const ifNoneMatch = request.headers['if-none-match'];

  reply.header('ETag', etag);
  reply.header('Cache-Control', 'private, max-age=0, must-revalidate');

  if (ifNoneMatch === etag) {
    reply.status(304).send();
    return true;
  }

  return false;
}

// ============================================
// Optimistic Locking Helper
// ============================================

/**
 * Verifica se o registro foi modificado desde o updatedAt informado.
 * Se sim, retorna 409 Conflict.
 * @returns true se há conflito (409 enviado)
 */
async function checkOptimisticLock(
  table: string,
  id: string,
  userId: string,
  clientUpdatedAt: string | undefined,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<boolean> {
  if (!clientUpdatedAt) return false; // Sem lock, permitir

  const result = await db.query(
    `SELECT updated_at FROM ${table} WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );

  if (result.rows.length === 0) return false; // Registro novo, sem conflito

  const serverUpdatedAt = new Date(result.rows[0].updated_at).toISOString();
  const clientDate = new Date(clientUpdatedAt).toISOString();

  if (serverUpdatedAt !== clientDate) {
    request.log.warn(
      { id, table, serverUpdatedAt, clientUpdatedAt: clientDate },
      '[Workspace API] Conflito de concorrência detectado'
    );
    reply.status(409).send({
      error: 'Conflito de concorrência: o registro foi modificado por outra sessão.',
      serverUpdatedAt,
      clientUpdatedAt: clientDate,
    });
    return true;
  }

  return false;
}

// ============================================
// Zod Error Handler
// ============================================

function handleZodError(error: unknown, reply: FastifyReply): void {
  if (error instanceof z.ZodError) {
    reply.status(400).send({
      error: 'Dados inválidos.',
      details: error.issues.map((e: any) => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code,
      })),
    });
  } else {
    throw error; // Re-throw para o catch externo
  }
}

// ============================================
// Rotas do Workspace
// ============================================

export async function workspaceRoutes(fastify: FastifyInstance) {

  // --------------------------------------------------
  // GET /api/workspaces
  // Retorna a árvore completa de workspaces do usuário
  // Suporta paginação opcional via ?page=1&limit=50
  // Suporta cache via ETag / If-None-Match
  // --------------------------------------------------
  fastify.get('/api/workspaces', {
    schema: {
      description: 'Retorna a árvore completa de workspaces, pastas e páginas do usuário',
      tags: ['Workspaces'],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, description: 'Número da página (opcional)' },
          limit: { type: 'integer', minimum: 1, maximum: 100, description: 'Itens por página (opcional, máx 100)' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserIdFromRequest(request);
    const query = request.query as { page?: string; limit?: string };
    const pageNum = parseInt(query.page || '0', 10) || 0;
    const limitNum = parseInt(query.limit || '0', 10) || 0;
    const usePagination = pageNum > 0 && limitNum > 0;

    try {
      // 1. Contagem total (só se paginação ativa)
      let total = 0;
      if (usePagination) {
        const countResult = await db.query(
          'SELECT COUNT(*) as total FROM workspaces WHERE user_id = $1',
          [userId]
        );
        total = parseInt(countResult.rows[0].total, 10) || 0;
      }

      // 2. Carrega Workspaces
      let workspacesQuery = 'SELECT * FROM workspaces WHERE user_id = $1 ORDER BY created_at ASC';
      const workspacesParams: (string | number)[] = [userId];

      if (usePagination) {
        workspacesQuery += ' LIMIT $2 OFFSET $3';
        workspacesParams.push(limitNum, (pageNum - 1) * limitNum);
      }

      const workspacesResult = await db.query(workspacesQuery, workspacesParams);
      const workspaceIds = (workspacesResult.rows as WorkspaceRow[]).map(w => w.id);

      // Se não há workspaces, retorna vazio
      if (workspaceIds.length === 0) {
        const response = usePagination
          ? { workspaces: [] as WorkspaceDTO[], total: 0, page: pageNum, limit: limitNum, totalPages: 0 }
          : { workspaces: [] as WorkspaceDTO[] };

        if (handleCacheHeaders(request, reply, response)) return;
        return response;
      }

      // 3. Carrega Folders (apenas dos workspaces carregados)
      const workspacePlaceholders = workspaceIds.map((_, i) => `$${i + 2}`).join(', ');
      const foldersResult = await db.query(
        `SELECT * FROM folders WHERE user_id = $1 AND workspace_id IN (${workspacePlaceholders}) ORDER BY created_at ASC`,
        [userId, ...workspaceIds]
      );
      const folderIds = (foldersResult.rows as FolderRow[]).map(f => f.id);

      // 4. Carrega Pages (apenas das folders carregadas)
      let pagesRows: PageRow[] = [];
      if (folderIds.length > 0) {
        const folderPlaceholders = folderIds.map((_, i) => `$${i + 2}`).join(', ');
        const pagesResult = await db.query(
          `SELECT * FROM pages WHERE user_id = $1 AND folder_id IN (${folderPlaceholders}) ORDER BY created_at ASC`,
          [userId, ...folderIds]
        );
        pagesRows = pagesResult.rows as PageRow[];
      }

      // 5. Monta árvore: Pages → Folders → Workspaces
      const pagesByFolder = new Map<string, PageDTO[]>();
      for (const p of pagesRows) {
        const page = mapPageRow(p);
        if (!pagesByFolder.has(p.folder_id)) {
          pagesByFolder.set(p.folder_id, []);
        }
        pagesByFolder.get(p.folder_id)!.push(page);
      }

      const foldersByWorkspace = new Map<string, FolderDTO[]>();
      for (const f of foldersResult.rows as FolderRow[]) {
        const folder = mapFolderRow(f, pagesByFolder.get(f.id) || []);
        if (!foldersByWorkspace.has(f.workspace_id)) {
          foldersByWorkspace.set(f.workspace_id, []);
        }
        foldersByWorkspace.get(f.workspace_id)!.push(folder);
      }

      const workspaces: WorkspaceDTO[] = (workspacesResult.rows as WorkspaceRow[]).map(w =>
        mapWorkspaceRow(w, foldersByWorkspace.get(w.id) || [])
      );

      // 6. Monta resposta com ou sem paginação
      const response = usePagination
        ? {
            workspaces,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
          }
        : { workspaces };

      // 7. Cache com ETag
      if (handleCacheHeaders(request, reply, response)) return;

      return response;
    } catch (error: unknown) {
      request.log.error({ err: error, userId }, '[Workspace API] Erro ao carregar workspaces');
      reply.status(500).send({ error: 'Erro ao carregar workspaces.' });
    }
  });

  // --------------------------------------------------
  // GET /api/workspaces/workspace/:id
  // Retorna um workspace específico com suas pastas e páginas
  // --------------------------------------------------
  fastify.get('/api/workspaces/workspace/:id', {
    schema: {
      description: 'Retorna um workspace individual com sua árvore de pastas e páginas',
      tags: ['Workspaces'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'ID do workspace' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserIdFromRequest(request);
    const { id } = request.params as { id: string };

    try {
      // 1. Busca o workspace
      const wsResult = await db.query(
        'SELECT * FROM workspaces WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      if (wsResult.rows.length === 0) {
        reply.status(404).send({ error: 'Workspace não encontrado.' });
        return;
      }

      const wsRow = wsResult.rows[0] as WorkspaceRow;

      // 2. Busca folders desse workspace
      const foldersResult = await db.query(
        'SELECT * FROM folders WHERE workspace_id = $1 AND user_id = $2 ORDER BY created_at ASC',
        [id, userId]
      );
      const folderIds = (foldersResult.rows as FolderRow[]).map(f => f.id);

      // 3. Busca pages dessas folders
      let pagesRows: PageRow[] = [];
      if (folderIds.length > 0) {
        const placeholders = folderIds.map((_, i) => `$${i + 2}`).join(', ');
        const pagesResult = await db.query(
          `SELECT * FROM pages WHERE user_id = $1 AND folder_id IN (${placeholders}) ORDER BY created_at ASC`,
          [userId, ...folderIds]
        );
        pagesRows = pagesResult.rows as PageRow[];
      }

      // 4. Monta árvore
      const pagesByFolder = new Map<string, PageDTO[]>();
      for (const p of pagesRows) {
        if (!pagesByFolder.has(p.folder_id)) {
          pagesByFolder.set(p.folder_id, []);
        }
        pagesByFolder.get(p.folder_id)!.push(mapPageRow(p));
      }

      const folders: FolderDTO[] = (foldersResult.rows as FolderRow[]).map(f =>
        mapFolderRow(f, pagesByFolder.get(f.id) || [])
      );

      const workspace = mapWorkspaceRow(wsRow, folders);

      // Cache
      if (handleCacheHeaders(request, reply, workspace)) return;

      return { success: true, workspace };
    } catch (error: unknown) {
      request.log.error({ err: error, userId, workspaceId: id }, '[Workspace API] Erro ao buscar workspace');
      reply.status(500).send({ error: 'Erro ao buscar workspace.' });
    }
  });

  // --------------------------------------------------
  // GET /api/workspaces/stats
  // Retorna estatísticas gerais dos workspaces do usuário
  // --------------------------------------------------
  fastify.get('/api/workspaces/stats', {
    schema: {
      description: 'Retorna contagens e estatísticas dos workspaces do usuário',
      tags: ['Workspaces'],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserIdFromRequest(request);

    try {
      const statsResult = await db.query(`
        SELECT
          (SELECT COUNT(*) FROM workspaces WHERE user_id = $1) as total_workspaces,
          (SELECT COUNT(*) FROM folders WHERE user_id = $1) as total_folders,
          (SELECT COUNT(*) FROM pages WHERE user_id = $1) as total_pages,
          (SELECT MAX(updated_at) FROM workspaces WHERE user_id = $1) as last_workspace_update,
          (SELECT MAX(updated_at) FROM pages WHERE user_id = $1) as last_page_update
      `, [userId]);

      const row = statsResult.rows[0];
      const lastWs = row.last_workspace_update ? new Date(row.last_workspace_update).toISOString() : null;
      const lastPg = row.last_page_update ? new Date(row.last_page_update).toISOString() : null;

      const stats: WorkspaceStats = {
        totalWorkspaces: parseInt(row.total_workspaces, 10) || 0,
        totalFolders: parseInt(row.total_folders, 10) || 0,
        totalPages: parseInt(row.total_pages, 10) || 0,
        lastUpdated: lastPg && lastWs
          ? (new Date(lastPg) > new Date(lastWs) ? lastPg : lastWs)
          : (lastPg || lastWs),
      };

      if (handleCacheHeaders(request, reply, stats)) return;

      return { stats };
    } catch (error: unknown) {
      request.log.error({ err: error, userId }, '[Workspace API] Erro ao buscar estatísticas');
      reply.status(500).send({ error: 'Erro ao buscar estatísticas.' });
    }
  });

  // --------------------------------------------------
  // PUT /api/workspaces/sync
  // Sincronização completa da árvore em lote (transação)
  // --------------------------------------------------
  fastify.put('/api/workspaces/sync', {
    schema: {
      description: 'Sincronização completa (full replace) da árvore de workspaces, pastas e páginas',
      tags: ['Workspaces'],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserIdFromRequest(request);

    // Validação Zod
    let payload: z.infer<typeof syncPayloadSchema>;
    try {
      payload = syncPayloadSchema.parse(request.body);
    } catch (error) {
      handleZodError(error, reply);
      return;
    }

    const { workspaces } = payload;

    // Transação segura — client obtido DENTRO do try
    let client: Awaited<ReturnType<typeof db.getClient>> | null = null;

    try {
      client = await db.getClient();
      await client.query('BEGIN');

      // 1. Sincroniza Workspaces
      const workspaceIds = workspaces.map(w => w.id);
      if (workspaceIds.length > 0) {
        const placeholders = workspaceIds.map((_, i) => `$${i + 2}`).join(', ');
        await client.query(
          `DELETE FROM workspaces WHERE user_id = $1 AND id NOT IN (${placeholders})`,
          [userId, ...workspaceIds]
        );
      } else {
        await client.query('DELETE FROM workspaces WHERE user_id = $1', [userId]);
      }

      for (const ws of workspaces) {
        await client.query(`
          INSERT INTO workspaces (id, user_id, name, is_pinned, is_hidden, color, icon, icon_type, image_url, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            is_pinned = EXCLUDED.is_pinned,
            is_hidden = EXCLUDED.is_hidden,
            color = EXCLUDED.color,
            icon = EXCLUDED.icon,
            icon_type = EXCLUDED.icon_type,
            image_url = EXCLUDED.image_url,
            updated_at = CURRENT_TIMESTAMP
        `, [
          ws.id, userId, ws.name,
          ws.isPinned, ws.isHidden,
          ws.color, ws.icon, ws.iconType, ws.imageUrl,
        ]);
      }

      // 2. Sincroniza Folders
      const allFolders = workspaces.flatMap(w =>
        (w.folders || []).map(f => ({ ...f, workspaceId: w.id }))
      );
      const folderIds = allFolders.map(f => f.id);

      if (folderIds.length > 0) {
        const placeholders = folderIds.map((_, i) => `$${i + 2}`).join(', ');
        await client.query(
          `DELETE FROM folders WHERE user_id = $1 AND id NOT IN (${placeholders})`,
          [userId, ...folderIds]
        );
      } else {
        await client.query('DELETE FROM folders WHERE user_id = $1', [userId]);
      }

      for (const f of allFolders) {
        await client.query(`
          INSERT INTO folders (id, user_id, workspace_id, name, is_pinned, color, icon, icon_type, image_url, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO UPDATE SET
            workspace_id = EXCLUDED.workspace_id,
            name = EXCLUDED.name,
            is_pinned = EXCLUDED.is_pinned,
            color = EXCLUDED.color,
            icon = EXCLUDED.icon,
            icon_type = EXCLUDED.icon_type,
            image_url = EXCLUDED.image_url,
            updated_at = CURRENT_TIMESTAMP
        `, [
          f.id, userId, f.workspaceId,
          f.name, f.isPinned,
          f.color, f.icon, f.iconType, f.imageUrl,
        ]);
      }

      // 3. Sincroniza Pages
      const allPages = allFolders.flatMap(f =>
        (f.pages || []).map(p => ({ ...p, folderId: f.id }))
      );
      const pageIds = allPages.map(p => p.id);

      if (pageIds.length > 0) {
        const placeholders = pageIds.map((_, i) => `$${i + 2}`).join(', ');
        await client.query(
          `DELETE FROM pages WHERE user_id = $1 AND id NOT IN (${placeholders})`,
          [userId, ...pageIds]
        );
      } else {
        await client.query('DELETE FROM pages WHERE user_id = $1', [userId]);
      }

      for (const p of allPages) {
        await client.query(`
          INSERT INTO pages (id, user_id, folder_id, title, content, is_pinned, cover_image, cover_position, icon, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO UPDATE SET
            folder_id = EXCLUDED.folder_id,
            title = EXCLUDED.title,
            content = EXCLUDED.content,
            is_pinned = EXCLUDED.is_pinned,
            cover_image = EXCLUDED.cover_image,
            cover_position = EXCLUDED.cover_position,
            icon = EXCLUDED.icon,
            updated_at = CURRENT_TIMESTAMP
        `, [
          p.id, userId, p.folderId,
          p.title, p.content || '',
          p.isPinned || false,
          p.coverImage ?? null,
          p.coverPosition ?? 50.00,
          p.icon ?? null,
        ]);
      }

      await client.query('COMMIT');

      request.log.info(
        { userId, workspaces: workspaceIds.length, folders: folderIds.length, pages: pageIds.length },
        '[Workspace API] Sync completo realizado'
      );

      return { success: true };
    } catch (error: unknown) {
      // ROLLBACK seguro
      if (client) {
        try {
          await client.query('ROLLBACK');
        } catch (rollbackError) {
          request.log.error({ err: rollbackError }, '[Workspace API] Erro ao fazer ROLLBACK');
        }
      }
      request.log.error({ err: error, userId }, '[Workspace API] Erro ao sincronizar workspaces em lote');
      reply.status(500).send({ error: 'Erro ao sincronizar workspaces em lote.' });
    } finally {
      // Release seguro — verifica se client existe
      if (client) {
        try {
          client.release();
        } catch (releaseError) {
          request.log.error({ err: releaseError }, '[Workspace API] Erro ao liberar conexão do pool');
        }
      }
    }
  });

  // --------------------------------------------------
  // PUT /api/workspaces/workspace/:id
  // Cria ou atualiza um workspace individual
  // Suporta optimistic locking via campo updatedAt
  // --------------------------------------------------
  fastify.put('/api/workspaces/workspace/:id', {
    schema: {
      description: 'Cria ou atualiza um workspace individual',
      tags: ['Workspaces'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserIdFromRequest(request);
    const { id } = request.params as { id: string };

    // Validação Zod
    let body: z.infer<typeof workspaceBodySchema>;
    try {
      body = workspaceBodySchema.parse(request.body);
    } catch (error) {
      handleZodError(error, reply);
      return;
    }

    try {
      // Optimistic locking
      if (await checkOptimisticLock('workspaces', id, userId, body.updatedAt, request, reply)) {
        return;
      }

      const result = await db.query(`
        INSERT INTO workspaces (id, user_id, name, is_pinned, is_hidden, color, icon, icon_type, image_url, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          is_pinned = EXCLUDED.is_pinned,
          is_hidden = EXCLUDED.is_hidden,
          color = EXCLUDED.color,
          icon = EXCLUDED.icon,
          icon_type = EXCLUDED.icon_type,
          image_url = EXCLUDED.image_url,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [
        id, userId, body.name,
        body.isPinned, body.isHidden,
        body.color, body.icon, body.iconType, body.imageUrl,
      ]);

      const workspace = mapWorkspaceRow(result.rows[0] as WorkspaceRow);

      request.log.info({ userId, workspaceId: id }, '[Workspace API] Workspace salvo');

      return { success: true, workspace };
    } catch (error: unknown) {
      request.log.error({ err: error, userId, workspaceId: id }, '[Workspace API] Erro ao salvar workspace');
      reply.status(500).send({ error: 'Erro ao salvar workspace.' });
    }
  });

  // --------------------------------------------------
  // DELETE /api/workspaces/workspace/:id
  // Remove um workspace (CASCADE deleta folders e pages)
  // --------------------------------------------------
  fastify.delete('/api/workspaces/workspace/:id', {
    schema: {
      description: 'Remove um workspace e todas as suas pastas e páginas (CASCADE)',
      tags: ['Workspaces'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserIdFromRequest(request);
    const { id } = request.params as { id: string };

    try {
      const result = await db.query(
        'DELETE FROM workspaces WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, userId]
      );

      if (result.rowCount === 0) {
        reply.status(404).send({ error: 'Workspace não encontrado.' });
        return;
      }

      request.log.info({ userId, workspaceId: id }, '[Workspace API] Workspace deletado');

      return { success: true };
    } catch (error: unknown) {
      request.log.error({ err: error, userId, workspaceId: id }, '[Workspace API] Erro ao deletar workspace');
      reply.status(500).send({ error: 'Erro ao deletar workspace.' });
    }
  });

  // --------------------------------------------------
  // PUT /api/workspaces/folder/:id
  // Cria ou atualiza uma pasta (Folder) individual
  // --------------------------------------------------
  fastify.put('/api/workspaces/folder/:id', {
    schema: {
      description: 'Cria ou atualiza uma pasta dentro de um workspace',
      tags: ['Folders'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserIdFromRequest(request);
    const { id } = request.params as { id: string };

    // Validação Zod
    let body: z.infer<typeof folderBodySchema>;
    try {
      body = folderBodySchema.parse(request.body);
    } catch (error) {
      handleZodError(error, reply);
      return;
    }

    try {
      // Optimistic locking
      if (await checkOptimisticLock('folders', id, userId, body.updatedAt, request, reply)) {
        return;
      }

      // Verifica se o workspace pai existe
      const wsCheck = await db.query(
        'SELECT id FROM workspaces WHERE id = $1 AND user_id = $2',
        [body.workspaceId, userId]
      );
      if (wsCheck.rows.length === 0) {
        reply.status(400).send({ error: 'Workspace pai não encontrado. Crie o workspace antes de adicionar pastas.' });
        return;
      }

      const result = await db.query(`
        INSERT INTO folders (id, user_id, workspace_id, name, is_pinned, color, icon, icon_type, image_url, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          workspace_id = EXCLUDED.workspace_id,
          name = EXCLUDED.name,
          is_pinned = EXCLUDED.is_pinned,
          color = EXCLUDED.color,
          icon = EXCLUDED.icon,
          icon_type = EXCLUDED.icon_type,
          image_url = EXCLUDED.image_url,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [
        id, userId, body.workspaceId,
        body.name, body.isPinned,
        body.color, body.icon, body.iconType, body.imageUrl,
      ]);

      const folder = mapFolderRow(result.rows[0] as FolderRow);

      request.log.info({ userId, folderId: id, workspaceId: body.workspaceId }, '[Workspace API] Pasta salva');

      return { success: true, folder };
    } catch (error: unknown) {
      request.log.error({ err: error, userId, folderId: id }, '[Workspace API] Erro ao salvar pasta');
      reply.status(500).send({ error: 'Erro ao salvar pasta.' });
    }
  });

  // --------------------------------------------------
  // DELETE /api/workspaces/folder/:id
  // Remove uma pasta (CASCADE deleta pages)
  // --------------------------------------------------
  fastify.delete('/api/workspaces/folder/:id', {
    schema: {
      description: 'Remove uma pasta e todas as suas páginas (CASCADE)',
      tags: ['Folders'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserIdFromRequest(request);
    const { id } = request.params as { id: string };

    try {
      const result = await db.query(
        'DELETE FROM folders WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, userId]
      );

      if (result.rowCount === 0) {
        reply.status(404).send({ error: 'Pasta não encontrada.' });
        return;
      }

      request.log.info({ userId, folderId: id }, '[Workspace API] Pasta deletada');

      return { success: true };
    } catch (error: unknown) {
      request.log.error({ err: error, userId, folderId: id }, '[Workspace API] Erro ao deletar pasta');
      reply.status(500).send({ error: 'Erro ao deletar pasta.' });
    }
  });

  // --------------------------------------------------
  // PUT /api/workspaces/page/:id
  // Cria ou atualiza uma página individual
  // --------------------------------------------------
  fastify.put('/api/workspaces/page/:id', {
    schema: {
      description: 'Cria ou atualiza uma página dentro de uma pasta',
      tags: ['Pages'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserIdFromRequest(request);
    const { id } = request.params as { id: string };

    // Validação Zod
    let body: z.infer<typeof pageBodySchema>;
    try {
      body = pageBodySchema.parse(request.body);
    } catch (error) {
      handleZodError(error, reply);
      return;
    }

    try {
      // Optimistic locking
      if (await checkOptimisticLock('pages', id, userId, body.updatedAt, request, reply)) {
        return;
      }

      // Verifica se a folder pai existe
      const folderCheck = await db.query(
        'SELECT id FROM folders WHERE id = $1 AND user_id = $2',
        [body.folderId, userId]
      );
      if (folderCheck.rows.length === 0) {
        reply.status(400).send({ error: 'Pasta pai não encontrada. Crie a pasta antes de adicionar páginas.' });
        return;
      }

      const result = await db.query(`
        INSERT INTO pages (id, user_id, folder_id, title, content, is_pinned, cover_image, cover_position, icon, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          folder_id = EXCLUDED.folder_id,
          title = EXCLUDED.title,
          content = EXCLUDED.content,
          is_pinned = EXCLUDED.is_pinned,
          cover_image = EXCLUDED.cover_image,
          cover_position = EXCLUDED.cover_position,
          icon = EXCLUDED.icon,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [
        id, userId, body.folderId,
        body.title, body.content,
        body.isPinned,
        body.coverImage,
        body.coverPosition,
        body.icon,
      ]);

      const page = mapPageRow(result.rows[0] as PageRow);

      request.log.info({ userId, pageId: id, folderId: body.folderId }, '[Workspace API] Página salva');

      return { success: true, page };
    } catch (error: unknown) {
      request.log.error({ err: error, userId, pageId: id }, '[Workspace API] Erro ao salvar página');
      reply.status(500).send({ error: 'Erro ao salvar página.' });
    }
  });

  // --------------------------------------------------
  // DELETE /api/workspaces/page/:id
  // Remove uma página
  // --------------------------------------------------
  fastify.delete('/api/workspaces/page/:id', {
    schema: {
      description: 'Remove uma página específica',
      tags: ['Pages'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserIdFromRequest(request);
    const { id } = request.params as { id: string };

    try {
      const result = await db.query(
        'DELETE FROM pages WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, userId]
      );

      if (result.rowCount === 0) {
        reply.status(404).send({ error: 'Página não encontrada.' });
        return;
      }

      request.log.info({ userId, pageId: id }, '[Workspace API] Página deletada');

      return { success: true };
    } catch (error: unknown) {
      request.log.error({ err: error, userId, pageId: id }, '[Workspace API] Erro ao deletar página');
      reply.status(500).send({ error: 'Erro ao deletar página.' });
    }
  });
}
