import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from './db.js';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { aiGateway } from './gateway.js';

// ============================================
// Helpers
// ============================================

function getUserId(request: FastifyRequest): string {
  return (request.headers['x-user-id'] as string) || 'default';
}

const UPLOADS_DIR = process.env.UPLOADS_DIR 
  ? path.join(path.dirname(process.env.UPLOADS_DIR), 'diary')
  : path.resolve(process.cwd(), '../uploads/diary');

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

function safeJsonParse(val: any, fallback: any = []) {
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch (e) { return fallback; }
  }
  return val || fallback;
}

function mapDbToFrontend(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    location: row.location || '',
    status: row.status || 'active',
    startAt: row.start_at ? new Date(row.start_at).getTime() : undefined,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : undefined,
    title: row.title || '',
    temp: row.temp || '',
    waves: row.waves || '',
    rating: row.rating || '',
    mainImage: row.main_image || '',
    eventTitle: row.event_title || '',
    eventDate: row.event_date || '',
    eventImage: row.event_image || '',
    circleImage: row.circle_image || '',
    description: row.description || '',
    categories: safeJsonParse(row.categories, []),
    gallery: safeJsonParse(row.gallery, []),
    time: row.time || '',
    day: row.day || '',
    month: row.month || '',
    monthName: row.month_name || '',
    year: row.year || '',
    weekday: row.weekday || '',
    endAt: row.end_at ? new Date(row.end_at).getTime() : undefined,
    duration: row.duration ? parseInt(row.duration, 10) : 0,
    
    // Estruturas Semânticas / Cognitivas
    dayOpening: safeJsonParse(row.day_opening, {}),
    dreams: safeJsonParse(row.dreams, []),
    actions: safeJsonParse(row.actions, []),
    habits: safeJsonParse(row.habits, []),
    insights: safeJsonParse(row.insights, []),
    state: safeJsonParse(row.state, {}),
    guidance: safeJsonParse(row.guidance, {}),
    daySynthesis: safeJsonParse(row.day_synthesis, {}),
    semanticEntities: safeJsonParse(row.semantic_entities, {}),
    blocks: safeJsonParse(row.blocks, []),
    
    // Conteúdos Textuais e Editores
    essentialActions: safeJsonParse(row.essential_actions, []),
    recurringActions: safeJsonParse(row.recurring_actions, []),
    tomorrowActions: safeJsonParse(row.tomorrow_actions, []),
    content: row.content || '',
    insightsContent: row.insights_content || '',
    guidanceContent: row.guidance_content || '',
    consolidationContent: row.consolidation_content || '',
    freeContent: row.free_content || '',
    posture: safeJsonParse(row.posture, []),
    mental: safeJsonParse(row.mental, []),
    emotion: safeJsonParse(row.emotion, []),
    energy: safeJsonParse(row.energy, [])
  };
}

// ============================================
// Rotas de Diário
// ============================================

export async function diaryRoutes(fastify: FastifyInstance) {

  // -----------------------------------------------
  // GET /api/diary
  // Listar diários com filtros, busca e paginação
  // -----------------------------------------------
  fastify.get('/api/diary', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    const { page = '1', limit = '50', search = '', status = '' } = request.query as any;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const offset = (pageNum - 1) * limitNum;

    try {
      let queryText = 'SELECT * FROM diary_entries WHERE user_id = $1';
      const params: any[] = [userId];

      if (status) {
        params.push(status);
        queryText += ` AND status = $${params.length}`;
      }

      if (search) {
        params.push(`%${search}%`);
        const searchIdx = params.length;
        queryText += ` AND (title ILIKE $${searchIdx} OR description ILIKE $${searchIdx} OR content ILIKE $${searchIdx})`;
      }

      queryText += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      const queryParams = [...params, limitNum, offset];

      const result = await db.query(queryText, queryParams);

      // Total count para paginação
      let countQueryText = 'SELECT COUNT(*) as total FROM diary_entries WHERE user_id = $1';
      const countParams: any[] = [userId];
      if (status) {
        countParams.push(status);
        countQueryText += ` AND status = $${countParams.length}`;
      }
      if (search) {
        countParams.push(`%${search}%`);
        countQueryText += ` AND (title ILIKE $${countParams.length} OR description ILIKE $${countParams.length} OR content ILIKE $${countParams.length})`;
      }
      const countResult = await db.query(countQueryText, countParams);
      const total = parseInt(countResult.rows[0].total, 10) || 0;

      const entries = result.rows.map(mapDbToFrontend);

      return {
        entries,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      };
    } catch (error: any) {
      console.error('[Diary] Erro ao buscar diários:', error);
      reply.status(500).send({ error: 'Erro ao buscar diários.' });
    }
  });

  // -----------------------------------------------
  // GET /api/diary/:id
  // Obter diário específico
  // -----------------------------------------------
  fastify.get('/api/diary/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    const { id } = request.params as { id: string };

    try {
      const result = await db.query(
        'SELECT * FROM diary_entries WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      if (result.rows.length === 0) {
        reply.status(404).send({ error: 'Diário não encontrado.' });
        return;
      }

      return { entry: mapDbToFrontend(result.rows[0]) };
    } catch (error: any) {
      console.error('[Diary] Erro ao buscar diário:', error);
      reply.status(500).send({ error: 'Erro ao buscar diário.' });
    }
  });

  // -----------------------------------------------
  // PUT /api/diary/:id
  // Salvar/Atualizar diário (Merge / Upsert)
  // -----------------------------------------------
  fastify.put('/api/diary/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    const { id } = request.params as { id: string };
    const data = request.body as any;

    try {
      // Verifica se o diário existe
      const checkResult = await db.query(
        'SELECT 1 FROM diary_entries WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
      const exists = checkResult.rows.length > 0;

      const updateableFields = [
        { js: 'location', db: 'location' },
        { js: 'status', db: 'status' },
        { js: 'startAt', db: 'start_at', isDate: true },
        { js: 'createdAt', db: 'created_at', isDate: true },
        { js: 'title', db: 'title' },
        { js: 'temp', db: 'temp' },
        { js: 'waves', db: 'waves' },
        { js: 'rating', db: 'rating' },
        { js: 'mainImage', db: 'main_image' },
        { js: 'eventTitle', db: 'event_title' },
        { js: 'eventDate', db: 'event_date' },
        { js: 'eventImage', db: 'event_image' },
        { js: 'circleImage', db: 'circle_image' },
        { js: 'description', db: 'description' },
        { js: 'categories', db: 'categories' },
        { js: 'gallery', db: 'gallery' },
        { js: 'time', db: 'time' },
        { js: 'day', db: 'day' },
        { js: 'month', db: 'month' },
        { js: 'monthName', db: 'month_name' },
        { js: 'year', db: 'year' },
        { js: 'weekday', db: 'weekday' },
        { js: 'endAt', db: 'end_at', isDate: true },
        { js: 'duration', db: 'duration' },
        { js: 'dayOpening', db: 'day_opening', isJson: true },
        { js: 'dreams', db: 'dreams', isJson: true },
        { js: 'actions', db: 'actions', isJson: true },
        { js: 'habits', db: 'habits', isJson: true },
        { js: 'insights', db: 'insights', isJson: true },
        { js: 'state', db: 'state', isJson: true },
        { js: 'guidance', db: 'guidance', isJson: true },
        { js: 'daySynthesis', db: 'day_synthesis', isJson: true },
        { js: 'semanticEntities', db: 'semantic_entities', isJson: true },
        { js: 'blocks', db: 'blocks', isJson: true },
        { js: 'essentialActions', db: 'essential_actions', isJson: true },
        { js: 'recurringActions', db: 'recurring_actions', isJson: true },
        { js: 'tomorrowActions', db: 'tomorrow_actions', isJson: true },
        { js: 'content', db: 'content' },
        { js: 'insightsContent', db: 'insights_content' },
        { js: 'guidanceContent', db: 'guidance_content' },
        { js: 'consolidationContent', db: 'consolidation_content' },
        { js: 'freeContent', db: 'free_content' },
        { js: 'posture', db: 'posture', isJson: true },
        { js: 'mental', db: 'mental', isJson: true },
        { js: 'emotion', db: 'emotion', isJson: true },
        { js: 'energy', db: 'energy', isJson: true }
      ];

      if (exists) {
        // Atualiza diário
        const fields: string[] = [];
        const values: any[] = [];
        let index = 1;

        for (const f of updateableFields) {
          if (data[f.js] !== undefined) {
            fields.push(`${f.db} = $${index}`);
            if (f.isDate) {
              values.push(data[f.js] ? new Date(data[f.js]) : null);
            } else if (f.isJson) {
              values.push(JSON.stringify(data[f.js]));
            } else {
              values.push(data[f.js]);
            }
            index++;
          }
        }

        if (fields.length > 0) {
          fields.push(`updated_at = CURRENT_TIMESTAMP`);
          const queryText = `UPDATE diary_entries SET ${fields.join(', ')} WHERE id = $${index} AND user_id = $${index + 1} RETURNING *`;
          const result = await db.query(queryText, [...values, id, userId]);
          return { success: true, entry: mapDbToFrontend(result.rows[0]) };
        } else {
          const result = await db.query('SELECT * FROM diary_entries WHERE id = $1 AND user_id = $2', [id, userId]);
          return { success: true, entry: mapDbToFrontend(result.rows[0]) };
        }
      } else {
        // Cria diário novo
        const insertFields = ['id', 'user_id', 'created_at', 'updated_at'];
        const placeholders = ['$1', '$2', 'COALESCE($3, CURRENT_TIMESTAMP)', 'CURRENT_TIMESTAMP'];
        let createdAtVal = data.createdAt ? new Date(data.createdAt) : new Date();
        const values: any[] = [id, userId, createdAtVal];
        let index = 4;

        for (const f of updateableFields) {
          if (f.js === 'createdAt') continue; // Já tratado
          if (data[f.js] !== undefined) {
            insertFields.push(f.db);
            placeholders.push(`$${index}`);
            if (f.isDate) {
              values.push(data[f.js] ? new Date(data[f.js]) : null);
            } else if (f.isJson) {
              values.push(JSON.stringify(data[f.js]));
            } else {
              values.push(data[f.js]);
            }
            index++;
          }
        }

        const queryText = `INSERT INTO diary_entries (${insertFields.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`;
        const result = await db.query(queryText, values);
        return { success: true, entry: mapDbToFrontend(result.rows[0]) };
      }
    } catch (error: any) {
      console.error('[Diary] Erro ao salvar/atualizar diário:', error);
      reply.status(500).send({ error: 'Erro ao salvar/atualizar diário.' });
    }
  });

  // -----------------------------------------------
  // DELETE /api/diary/:id
  // Excluir diário específico
  // -----------------------------------------------
  fastify.delete('/api/diary/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    const { id } = request.params as { id: string };

    try {
      // Opcional: Buscar diário e remover imagens associadas fisicamente do disco
      const checkResult = await db.query(
        'SELECT gallery, main_image, event_image, circle_image FROM diary_entries WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      if (checkResult.rows.length === 0) {
        reply.status(404).send({ error: 'Diário não encontrado.' });
        return;
      }

      const row = checkResult.rows[0];
      const imagesToDelete = [
        row.main_image,
        row.event_image,
        row.circle_image,
        ...(row.gallery || [])
      ];

      for (const imgUrl of imagesToDelete) {
        if (imgUrl && imgUrl.startsWith('/uploads/diary/')) {
          const relativePath = imgUrl.replace('/uploads/diary/', '');
          const filePath = path.join(UPLOADS_DIR, relativePath);
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
            } catch (err) {
              console.error(`[Diary] Erro ao deletar arquivo ${filePath}:`, err);
            }
          }
        }
      }

      await db.query(
        'DELETE FROM diary_entries WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      return { success: true };
    } catch (error: any) {
      console.error('[Diary] Erro ao excluir diário:', error);
      reply.status(500).send({ error: 'Erro ao excluir diário.' });
    }
  });

  // -----------------------------------------------
  // POST /api/diary/upload
  // Fazer upload de imagem (Multipart - sem base64, tamanho livre)
  // -----------------------------------------------
  fastify.post('/api/diary/upload', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);

    try {
      const data = await request.file();
      if (!data) {
        reply.status(400).send({ error: 'Nenhum arquivo enviado.' });
        return;
      }

      ensureUploadsDir();

      // Gera nome único com timestamp e extensão original
      const ext = path.extname(data.filename) || '.jpg';
      const filename = `diary_${userId}_${Date.now()}${ext}`;
      const filePath = path.join(UPLOADS_DIR, filename);

      // Salva o stream do arquivo no disco
      await pipeline(data.file, fs.createWriteStream(filePath));

      // Retorna a URL relativa compatível com Nginx e front
      const url = `/uploads/diary/${filename}`;
      return { success: true, url };
    } catch (error: any) {
      console.error('[Diary] Erro ao fazer upload de imagem:', error);
      reply.status(500).send({ error: 'Erro ao fazer upload de imagem.' });
    }
  });

  // -----------------------------------------------
  // GET /api/diary/stats
  // Obter estatísticas do diário
  // -----------------------------------------------
  fastify.get('/api/diary/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);

    try {
      const statsResult = await db.query(
        `SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
          COALESCE(AVG(duration), 0) as avg_duration
         FROM diary_entries WHERE user_id = $1`,
        [userId]
      );

      // Calcula sequência ativa (streak) buscando diários dos dias anteriores
      const datesResult = await db.query(
        `SELECT DISTINCT date_trunc('day', created_at) as day 
         FROM diary_entries 
         WHERE user_id = $1 AND status = 'completed'
         ORDER BY day DESC`,
        [userId]
      );

      let streak = 0;
      if (datesResult.rows.length > 0) {
        const today = new Date();
        today.setHours(0,0,0,0);
        
        let lastDate = new Date(datesResult.rows[0].day);
        lastDate.setHours(0,0,0,0);

        // Se o último diário finalizado foi hoje ou ontem, inicia contagem
        const diffTime = Math.abs(today.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 1) {
          streak = 1;
          for (let i = 1; i < datesResult.rows.length; i++) {
            const nextDate = new Date(datesResult.rows[i].day);
            nextDate.setHours(0,0,0,0);
            
            const gap = Math.ceil(Math.abs(lastDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
            if (gap === 1) {
              streak++;
              lastDate = nextDate;
            } else if (gap > 1) {
              break;
            }
          }
        }
      }

      return {
        total: parseInt(statsResult.rows[0].total, 10) || 0,
        completed: parseInt(statsResult.rows[0].completed, 10) || 0,
        active: parseInt(statsResult.rows[0].active, 10) || 0,
        avgDuration: Math.round(parseFloat(statsResult.rows[0].avg_duration)) || 0,
        streak
      };
    } catch (error: any) {
      console.error('[Diary] Erro ao buscar estatísticas:', error);
      reply.status(500).send({ error: 'Erro ao buscar estatísticas.' });
    }
  });

  // -----------------------------------------------
  // POST /api/diary/amparo/synthesis
  // Realiza síntese de Conscienciologia do diário e práticas e retorna JSON
  // -----------------------------------------------
  fastify.post('/api/diary/amparo/synthesis', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);

    try {
      // 1. Fetch recent diaries (last 30)
      const diariesResult = await db.query(
        'SELECT * FROM diary_entries WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30',
        [userId]
      );
      const diaries = diariesResult.rows.map(mapDbToFrontend);

      // 2. Fetch completed energy practices
      const practicesResult = await db.query(
        "SELECT * FROM tasks WHERE user_id = $1 AND execution_type = 'energy-work' AND status = 'completed' ORDER BY date DESC LIMIT 20",
        [userId]
      );
      const practices = practicesResult.rows;

      // Compile text summary
      let dataSummary = '';
      if (diaries.length === 0 && practices.length === 0) {
        dataSummary = 'O usuário ainda não possui registros no sistema de diários nem práticas energéticas de EV cadastradas.';
      } else {
        dataSummary += `REGISTROS DE DIÁRIO RECENTES (${diaries.length}):\n`;
        diaries.forEach((d: any, idx: number) => {
          dataSummary += `- diário #${idx + 1}: "${d.title || 'Sem título'}" em ${d.createdAt ? new Date(d.createdAt).toLocaleDateString('pt-BR') : 'Data n/d'}\n`;
          if (d.content) {
            const stripped = d.content.replace(/<[^>]*>/g, '').substring(0, 300);
            dataSummary += `  Conteúdo: "${stripped}"\n`;
          }
          if (d.dreams && d.dreams.length > 0) {
            dataSummary += `  Sonhos/Parapsiquismo: ${JSON.stringify(d.dreams)}\n`;
          }
          if (d.energy && d.energy.length > 0) {
            dataSummary += `  Parâmetros Energossoma: ${d.energy.join(', ')}\n`;
          }
          if (d.mental && d.mental.length > 0) {
            dataSummary += `  Marcadores Mentalsoma: ${d.mental.join(', ')}\n`;
          }
          if (d.emotion && d.emotion.length > 0) {
            dataSummary += `  Marcadores Holopensene: ${d.emotion.join(', ')}\n`;
          }
          if (d.posture && d.posture.length > 0) {
            dataSummary += `  Postura do Dia: ${d.posture.join(', ')}\n`;
          }
        });

        if (practices.length > 0) {
          dataSummary += `\nPRÁTICAS ENERGÉTICAS COMPLETADAS (${practices.length}):\n`;
          practices.forEach((p: any, idx: number) => {
            const exec = p.energy_work_execution ? safeJsonParse(p.energy_work_execution, null) : null;
            dataSummary += `- Prática #${idx + 1}: "${p.title || 'Circularização'}" em ${p.date ? new Date(p.date).toLocaleDateString('pt-BR') : 'Data n/d'}\n`;
            if (exec) {
              dataSummary += `  Intensidade: ${exec.intensity || 0}/10, Simetria: ${exec.symmetry || 0}/5, Lucidez: ${exec.lucidity || 0}/5\n`;
              if (exec.signals) dataSummary += `  Sinais/Sinalética: "${exec.signals}"\n`;
              if (exec.sensations && exec.sensations.length > 0) {
                dataSummary += `  Sensações: ${exec.sensations.join(', ')}\n`;
              }
              if (exec.phenomena && exec.phenomena.length > 0) {
                dataSummary += `  Fenômenos: ${exec.phenomena.join(', ')}\n`;
              }
            }
          });
        }
      }

      // Build Prompt and call AI Gateway
      const systemInstruction = `Você é um Amparador Intrafísico e Mentor extrafísico especializado em Autopesquisa Consciencial, Evoluciologia e Conscienciologia estrita conforme os conceitos do Prof. Waldo Vieira.
Sua missão é analisar o histórico do diário de evolução consciencial, sonhos (sonhoteca), avisos de amparador e parapsiquismo do usuário e fornecer um feedback multidimensional inspirador e científico estruturado no formato JSON.

Sua resposta DEVE ser um objeto JSON válido, contendo EXATAMENTE esses campos em português:
{
  "retrospectiva": "Sua retrospectiva consciencial sintetizando o que vem acontecendo nos dias/semanas anteriores baseado em seus padrões de sonhos, lembranças extrafísicas, mensagens do amparador e parapsiquismo.",
  "vibeConselho": "Uma frase de conselho espiritual, motivacional e conscienciológico dinâmica inspiradora para o dia do usuário.",
  "estadoAtual": "Sua análise parapsíquica do que se passa Atualmente (no seu dia do 'Hoje') em termos de holossoma (energossoma, mentalsoma, psicossoma, circulação de energia, e assepsia simpática).",
  "futuroAtitude": "Recomendações e avisos assistenciais/evoluciológicos do que pode acontecer ou caminhos a seguir futuramente de acordo com sua conduta atual.",
  "sinteseCientifica": "Uma lição acadêmica sintética utilizando o jargão científico específico da Conscienciologia (ex: autopensene, holofote, holothon, cosmoconsciência, pangrafia, proexologia)."
}

Sua resposta DEVE ser estritamente JSON. Não inclua blocos de código com trechos normais ou explicações fora do JSON parser-friendly.`;

      const promptPay = `Aqui está o histórico das minhas autopesquisas e práticas para sua análise de Amparo:
${dataSummary}

Por favor, analise esses padrões conscienciológicos com inteligência profunda. Retorne apenas o JSON em português brasileiro.`;

      const gatewayResponse = await aiGateway.handleRequest({
        provider: 'gemini',
        model: 'gemini-3.5-flash',
        messages: [
          { role: 'user', content: promptPay }
        ],
        config: {
          systemInstruction,
          temperature: 0.3,
          responseMimeType: 'application/json'
        }
      });

      const responseText = gatewayResponse.text || '{}';
      let parsedPayload;
      try {
        parsedPayload = JSON.parse(responseText.trim().replace(/^```json\x0a?|```$/gi, ''));
      } catch (err) {
        // Fallback case
        parsedPayload = {
          retrospectiva: "Análise retrospectiva indisponível devido a erro de formatação temporário.",
          vibeConselho: "Mantenha a circularidade de energias e a lucidez ativa nos seus veículos.",
          estadoAtual: "Energias em circulação ativa sob análise holosomática.",
          futuroAtitude: "Mantenha sintonia fina com o amparador parapsíquico extrafísico.",
          sinteseCientifica: "Autoconscienciometria em processamento secundário."
        };
      }

      return { success: true, synthesis: parsedPayload };
    } catch (error: any) {
      console.error('[Amparo AI Synthesis Route Error]:', error);
      reply.status(500).send({ error: error.message || 'Erro ao realizar síntese inteligente.' });
    }
  });
}
