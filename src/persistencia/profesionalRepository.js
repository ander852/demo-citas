// Acceso a datos del catálogo de profesionales.
// Los profesionales cambian raramente → TTL de caché más largo (30 s).
const pool = require('./db');
const cache = require('./cache');

const CACHE_KEY_PROFESIONALES = 'profesionales:todos';
const TTL_PROFESIONALES_MS = 30000; // 30 segundos

async function listarTodos() {
  const cached = cache.get(CACHE_KEY_PROFESIONALES);
  if (cached) return cached;

  const resultado = await pool.query(
    'SELECT id, nombre, especialidad FROM profesionales ORDER BY nombre'
  );
  cache.set(CACHE_KEY_PROFESIONALES, resultado.rows, TTL_PROFESIONALES_MS);
  return resultado.rows;
}

module.exports = { listarTodos };

