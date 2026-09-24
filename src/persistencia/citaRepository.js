// Acceso a datos de citas. Todo el SQL de la tabla citas vive en este módulo.
const pool = require('./db');
const cache = require('./cache');

const CACHE_KEY_CITAS = 'citas:todas';

async function listarTodas() {
  // Servir desde caché si está fresco (evita N queries simultáneos a Supabase)
  const cached = cache.get(CACHE_KEY_CITAS);
  if (cached) return cached;

  const resultado = await pool.query(
    `SELECT c.id, c.paciente, c.fecha_hora, p.nombre AS profesional
       FROM citas c
       JOIN profesionales p ON p.id = c.profesional_id
      ORDER BY c.fecha_hora`
  );
  cache.set(CACHE_KEY_CITAS, resultado.rows);
  return resultado.rows;
}

async function existeEnHorario(profesional_id, fecha_hora) {
  const resultado = await pool.query(
    'SELECT id FROM citas WHERE profesional_id = $1 AND fecha_hora = $2',
    [profesional_id, fecha_hora]
  );
  return resultado.rows.length > 0;
}

async function guardar({ paciente, profesional_id, fecha_hora }) {
  const resultado = await pool.query(
    `INSERT INTO citas (paciente, profesional_id, fecha_hora)
     VALUES ($1, $2, $3) RETURNING id`,
    [paciente, profesional_id, fecha_hora]
  );
  // Invalidar caché para que la próxima lectura refleje la nueva cita
  cache.invalidate(CACHE_KEY_CITAS);
  return resultado.rows[0].id;
}

module.exports = { listarTodas, existeEnHorario, guardar };

