// Conexión a Postgres (Supabase). La cadena llega por variable de entorno
// para no versionar credenciales; ver .env.example.
//
// Optimizaciones de pool para alta concurrencia:
//   max                   → máximo de conexiones físicas al mismo tiempo
//   idleTimeoutMillis     → devuelve conexiones ociosas al pool rápido
//   connectionTimeoutMillis → falla rápido si no hay conexión disponible
//                             en vez de colgar la petición indefinidamente
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Supabase exige TLS
  max: 20,                    // conexiones físicas simultáneas (Supabase free: ~25 max)
  idleTimeoutMillis: 10000,   // liberar conexión ociosa tras 10 s
  connectionTimeoutMillis: 5000, // error rápido si el pool está lleno tras 5 s
});

module.exports = pool;
