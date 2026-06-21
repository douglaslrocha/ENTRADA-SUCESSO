import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import { workspaceRoutes } from '../src/workspaceRoutes.js';
import { db } from '../src/db.js';

// Mock dependencies
vi.mock('../src/db.js', () => ({
  db: {
    query: vi.fn(),
    getClient: vi.fn(),
  },
}));

vi.mock('../src/middleware/auth.js', () => ({
  getUserIdFromRequest: vi.fn(() => 'test-user'),
}));

describe('Workspace Routes', () => {
  let fastify: ReturnType<typeof Fastify>;

  beforeEach(async () => {
    vi.clearAllMocks();
    fastify = Fastify();
    await fastify.register(workspaceRoutes);
  });

  describe('GET /api/workspaces', () => {
    it('deve retornar workspaces mapeados corretamente', async () => {
      (db.query as any).mockResolvedValueOnce({
        rows: [
          {
            id: 'ws-1',
            user_id: 'test-user',
            name: 'Meu Workspace',
            is_pinned: false,
            is_hidden: false,
            color: '#000',
            icon: '🚀',
            icon_type: 'emoji',
            image_url: '',
            created_at: '2023-01-01',
            updated_at: '2023-01-01',
          },
        ],
      });
      (db.query as any).mockResolvedValueOnce({ rows: [] }); // folders
      (db.query as any).mockResolvedValueOnce({ rows: [] }); // pages

      const response = await fastify.inject({
        method: 'GET',
        url: '/api/workspaces',
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);
      expect(payload.workspaces).toHaveLength(1);
      expect(payload.workspaces[0].name).toBe('Meu Workspace');
    });
  });

  describe('PUT /api/workspaces/sync', () => {
    it('deve realizar sync com transação mockada', async () => {
      const mockClient = {
        query: vi.fn().mockResolvedValue({}),
        release: vi.fn(),
      };
      (db.getClient as any).mockResolvedValue(mockClient);

      const response = await fastify.inject({
        method: 'PUT',
        url: '/api/workspaces/sync',
        payload: {
          workspaces: [
            {
              id: 'ws-sync-1',
              name: 'Synced Workspace',
              folders: [],
            },
          ],
        },
      });

      expect(response.statusCode).toBe(200);
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('deve falhar se o schema do sync for invalido', async () => {
      const response = await fastify.inject({
        method: 'PUT',
        url: '/api/workspaces/sync',
        payload: {
          workspaces: 'não é array',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
