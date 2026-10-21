const allowedIds = new Set([
  'seguranca-branco', 'seguranca-vermelho', 'seguranca-foto',
  'facilities-branco', 'facilities-vermelho', 'facilities-foto',
]);
const allowedStatuses = new Set(['draft', 'approved', 'changes']);
const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers });

async function database(context) {
  const db = context.env.MULTIFORTE_REVIEWS;
  if (!db?.prepare) return null;
  await db.prepare(`CREATE TABLE IF NOT EXISTS creative_reviews (
    id TEXT PRIMARY KEY,
    revision INTEGER NOT NULL,
    status TEXT NOT NULL,
    caption TEXT NOT NULL,
    feedback TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S', 'now'))
  )`).run();
  return db;
}

export async function onRequestGet(context) {
  try {
    const db = await database(context);
    if (!db) return json({ error: 'Armazenamento não configurado' }, 503);
    const { results } = await db.prepare('SELECT id, revision, status, caption, feedback, updated_at FROM creative_reviews').all();
    return json({ reviews: results });
  } catch (error) {
    console.error('Failed to load creative reviews', error);
    return json({ error: 'Falha ao carregar avaliações' }, 503);
  }
}

export async function onRequestPost(context) {
  let body;
  try { body = await context.request.json(); }
  catch { return json({ error: 'JSON inválido' }, 400); }
  if (!body || !allowedIds.has(body.id) || body.revision !== 1 || !allowedStatuses.has(body.status)
      || typeof body.caption !== 'string' || !body.caption.trim() || body.caption.length > 2000
      || typeof body.feedback !== 'string' || body.feedback.length > 2000
      || (body.status === 'changes' && !body.feedback.trim())) {
    return json({ error: 'Dados inválidos' }, 400);
  }
  try {
    const db = await database(context);
    if (!db) return json({ error: 'Armazenamento não configurado' }, 503);
    await db.prepare(`INSERT INTO creative_reviews (id, revision, status, caption, feedback, updated_at)
      VALUES (?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%S', 'now'))
      ON CONFLICT(id) DO UPDATE SET revision=excluded.revision, status=excluded.status,
      caption=excluded.caption, feedback=excluded.feedback, updated_at=excluded.updated_at`)
      .bind(body.id, body.revision, body.status, body.caption.trim(), body.feedback.trim()).run();
    const review = await db.prepare('SELECT id, revision, status, caption, feedback, updated_at FROM creative_reviews WHERE id = ?').bind(body.id).first();
    return json({ review });
  } catch (error) {
    console.error('Failed to save creative review', error);
    return json({ error: 'Falha ao salvar avaliação' }, 503);
  }
}
