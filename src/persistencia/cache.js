// Caché en memoria ultraligera para respuestas de lectura frecuente.
// Reduce drásticamente los queries a Supabase bajo alta concurrencia:
// con TTL=5 s y 500 usuarios simultáneos, 500 peticiones al mismo
// endpoint resultan en 1 query real a la BD cada 5 s en lugar de 500.
//
// API:
//   cache.get(key)           → valor o undefined
//   cache.set(key, value)    → guarda con TTL
//   cache.invalidate(key)    → borra entrada (usarlo tras mutaciones)

const CACHE_TTL_MS = 5000; // 5 segundos

const store = new Map(); // key → { value, expiresAt }

function get(key) {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

function set(key, value, ttlMs = CACHE_TTL_MS) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

function invalidate(key) {
  store.delete(key);
}

module.exports = { get, set, invalidate };
