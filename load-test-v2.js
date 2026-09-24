/**
 * Prueba de Latencia v2 — demo-citas CON OPTIMIZACIONES
 * ──────────────────────────────────────────────────────
 * Repositorio : https://github.com/ander852/demo-citas.git
 * Aplicación  : https://demo-citas-mvc9.onrender.com/
 * Usuario     : aromerob4@ucentral.edu.co
 *
 * Optimizaciones aplicadas antes de este test:
 *   - db.js     : pool max=20, idleTimeout=10s, connectionTimeout=5s
 *   - cache.js  : caché en memoria con TTL
 *   - citaRepository      : cache 5 s en listarTodas()
 *   - profesionalRepository: cache 30 s en listarTodos()
 *
 * Escenario A : 10 conexiones concurrentes × 20 s
 * Escenario B : 500 conexiones concurrentes × 120 s
 */

const autocannon = require('autocannon');

const BASE_URL = 'https://demo-citas-mvc9.onrender.com';

function separador(titulo) {
  const line = '═'.repeat(60);
  console.log(`\n${line}`);
  console.log(`  ${titulo}`);
  console.log(`${line}`);
}

function imprimirResultado(resultado) {
  const { latency, requests, throughput, errors, timeouts, duration, connections, title } = resultado;
  console.log(`\n📌 Endpoint : ${title}`);
  console.log(`   Duración  : ${duration} s`);
  console.log(`   Usuarios  : ${connections}`);
  console.log('');
  console.log('  ┌─ LATENCIA (ms) ─────────────────────────────────┐');
  console.log(`  │  Min    : ${String(latency.min).padStart(8)} ms`);
  console.log(`  │  Máx    : ${String(latency.max).padStart(8)} ms`);
  console.log(`  │  Media  : ${String(latency.mean.toFixed(2)).padStart(8)} ms`);
  console.log(`  │  p50    : ${String(latency.p50).padStart(8)} ms`);
  console.log(`  │  p90    : ${String(latency.p90).padStart(8)} ms`);
  console.log(`  │  p99    : ${String(latency.p99).padStart(8)} ms`);
  console.log(`  │  StdDev : ${String(latency.stddev.toFixed(2)).padStart(8)} ms`);
  console.log('  └─────────────────────────────────────────────────┘');
  console.log('');
  console.log('  ┌─ RENDIMIENTO ───────────────────────────────────┐');
  console.log(`  │  Peticiones totales  : ${requests.total}`);
  console.log(`  │  Req/s  (media)      : ${requests.mean.toFixed(2)}`);
  console.log(`  │  Req/s  (max)        : ${requests.max}`);
  console.log(`  │  Throughput (bytes/s): ${throughput.mean.toFixed(0)}`);
  console.log(`  │  Errores             : ${errors}`);
  console.log(`  │  Timeouts            : ${timeouts}`);
  console.log('  └─────────────────────────────────────────────────┘');
}

function benchmark({ title, url, connections, duration }) {
  return new Promise((resolve, reject) => {
    const inst = autocannon(
      {
        title,
        url,
        connections,
        duration,
        pipelining: 1,
        timeout: 30,
        headers: { 'Accept': 'application/json' },
      },
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
    autocannon.track(inst, { renderProgressBar: true });
  });
}

async function main() {
  console.log('\n🚀  PRUEBA DE LATENCIA v2 — demo-citas (CON OPTIMIZACIONES)');
  console.log(`   App      : ${BASE_URL}`);
  console.log(`   Hora     : ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })} (COT)`);
  console.log('   Mejoras  : cache en memoria + pool configurado');

  const endpoints = [
    { label: 'GET /api/salud',         path: '/api/salud'         },
    { label: 'GET /api/profesionales', path: '/api/profesionales' },
    { label: 'GET /api/citas',         path: '/api/citas'         },
  ];

  // ── ESCENARIO A: 10 usuarios × 20 s ─────────────────────
  separador('ESCENARIO A — 10 usuarios recurrentes × 20 segundos');
  const resultadosA = [];
  for (const ep of endpoints) {
    console.log(`\n⏳  Probando ${ep.label} …`);
    const r = await benchmark({ title: ep.label, url: `${BASE_URL}${ep.path}`, connections: 10, duration: 20 });
    resultadosA.push(r);
    imprimirResultado(r);
    await new Promise(res => setTimeout(res, 3000));
  }

  // ── ESCENARIO B: 500 usuarios × 120 s ───────────────────
  separador('ESCENARIO B — 500 usuarios × 120 segundos');
  const resultadosB = [];
  for (const ep of endpoints) {
    console.log(`\n⏳  Probando ${ep.label} …`);
    const r = await benchmark({ title: ep.label, url: `${BASE_URL}${ep.path}`, connections: 500, duration: 120 });
    resultadosB.push(r);
    imprimirResultado(r);
    await new Promise(res => setTimeout(res, 5000));
  }

  // ── RESUMEN ──────────────────────────────────────────────
  separador('RESUMEN COMPARATIVO (p99) — v2 CON OPTIMIZACIONES');
  // Resultados v1 (sin optimizaciones) para comparación directa
  const v1_p99 = { salud: 514, profesionales: 1560, citas: 645 };
  const v1_B_p99 = { salud: 1804, profesionales: 10160, citas: 11645 };

  console.log('\n  [ESCENARIO A — 10 usuarios]');
  console.log('  Endpoint                      │  v1 p99  │  v2 p99  │  Mejora');
  console.log('  ───────────────────────────────────────────────────────────');
  for (let i = 0; i < endpoints.length; i++) {
    const key = ['salud','profesionales','citas'][i];
    const v1  = v1_p99[key];
    const v2  = resultadosA[i]?.latency?.p99 ?? '-';
    const pct = typeof v2 === 'number' ? (((v1 - v2) / v1) * 100).toFixed(0) + '%' : '-';
    console.log(`  ${endpoints[i].label.padEnd(30)}│ ${String(v1).padStart(8)} │ ${String(v2).padStart(8)} │ ${pct.padStart(7)}`);
  }

  console.log('\n  [ESCENARIO B — 500 usuarios]');
  console.log('  Endpoint                      │  v1 p99  │  v2 p99  │  Mejora');
  console.log('  ───────────────────────────────────────────────────────────');
  for (let i = 0; i < endpoints.length; i++) {
    const key = ['salud','profesionales','citas'][i];
    const v1  = v1_B_p99[key];
    const v2  = resultadosB[i]?.latency?.p99 ?? '-';
    const pct = typeof v2 === 'number' ? (((v1 - v2) / v1) * 100).toFixed(0) + '%' : '-';
    console.log(`  ${endpoints[i].label.padEnd(30)}│ ${String(v1).padStart(8)} │ ${String(v2).padStart(8)} │ ${pct.padStart(7)}`);
  }

  console.log('\n✅  Pruebas v2 finalizadas.');
}

main().catch(err => {
  console.error('❌  Error:', err.message || err);
  process.exit(1);
});
