import { FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';

// ============================================
// Configuração JWT
// ============================================

const JWT_SECRET = process.env.JWT_SECRET || 'dlr-personal-os-secret-change-in-production';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '7d';

// ============================================
// Interfaces
// ============================================

export interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

// ============================================
// Extração de userId (JWT + fallback x-user-id)
// ============================================

/**
 * Extrai o userId do request com suporte a JWT e fallback para header x-user-id.
 * 
 * Ordem de prioridade:
 * 1. Authorization: Bearer <token> → decodifica JWT → userId
 * 2. x-user-id header → valor direto
 * 3. Fallback → 'default'
 */
export function getUserIdFromRequest(request: FastifyRequest): string {
  // 1. Tentar JWT do header Authorization
  const authHeader = request.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.slice(7);
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      if (decoded.userId) {
        return decoded.userId;
      }
    } catch (err) {
      // JWT inválido ou expirado — cai pro fallback
      request.log.warn({ err }, '[Auth] Token JWT inválido ou expirado, usando fallback x-user-id');
    }
  }

  // 2. Fallback para header x-user-id
  const headerUserId = request.headers['x-user-id'];
  if (typeof headerUserId === 'string' && headerUserId.trim().length > 0) {
    return headerUserId.trim();
  }

  // 3. Padrão
  return 'default';
}

// ============================================
// Utilitários de Token
// ============================================

/**
 * Gera um token JWT para o userId informado.
 */
export function generateToken(userId: string): string {
  return jwt.sign({ userId } as JwtPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION as any,
  });
}

/**
 * Verifica e decodifica um token JWT.
 * Retorna o payload decodificado ou null se inválido.
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Verifica se o token está prestes a expirar (dentro de X minutos).
 * Útil para refresh automático.
 */
export function isTokenExpiringSoon(token: string, thresholdMinutes = 30): boolean {
  const decoded = verifyToken(token);
  if (!decoded || !decoded.exp) return true;

  const now = Math.floor(Date.now() / 1000);
  const remaining = decoded.exp - now;
  return remaining < thresholdMinutes * 60;
}
