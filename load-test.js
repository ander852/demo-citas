/**
 * Prueba de Latencia — demo-citas
 * Repositorio : https://github.com/ander852/demo-citas.git
 * Aplicación  : https://demo-citas-mvc9.onrender.com/
 * Usuario     : aromerob4@ucentral.edu.co
 *
 * Escenario A : 10 conexiones concurrentes (usuarios recurrentes) × 20 s
 * Escenario B : 500 conexiones concurrentes                        × 120 s
 *
 * Endpoints probados:
 *   GET  /api/salud          → healthcheck
 *   GET  /api/profesionales  → lista de profesionales
 *   GET  /api/citas          → lista de citas
 */

const autocannon = require('autocannon');

const BASE_URL = 'https://demo-citas-mvc9.onrender.com';

// ─────────────────────────────────────────────────────────────
// Formateadores de resultados
// ─────────────────────────────────────────────────────────────
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
  console.log(`  │  Peticiones totales : ${requests.total}`);
  console.log(`  │  Req/s  (media)     : ${requests.mean.toFixed(2)}`);
  console.log(`  │  Req/s  (max)       : ${requests.max}`);
  console.log(`  │  Throughput (bytes/s): ${throughput.mean.toFixed(0)}`);
  console.log(`  │  Errores            : ${errors}`);
  console.log(`  │  Timeouts           : ${timeouts}`);
  console.log('  └─────────────────────────────────────────────────┘');
}

// ─────────────────────────────────────────────────────────────
// Ejecutar un benchmark y devolver la promesa con resultado
// ─────────────────────────────────────────────────────────────
function benchmark({ title, url, connections, duration, pipelining = 1 }) {
  return new Promise((resolve, reject) => {
    const inst = autocannon(
      {
        title,
        url,
        connections,
        duration,
        pipelining,
        timeout: 30,          // timeout por petición (s)
        bailout: 1000,        // abortar si acumula >1000 errores
        headers: {
          'Accept': 'application/json',
        },
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
    autocannon.track(inst, { renderProgressBar: true });
  });
}

// ─────────────────────────────────────────────────────────────
// Función principal — secuencial para no solapar cargas
// ─────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀  PRUEBA DE LATENCIA — demo-citas');
  console.log(`   App      : ${BASE_URL}`);
  console.log(`   Hora     : ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })} (COT)`);

  const endpointsA = [
    { label: 'GET /api/salud',         path: '/api/salud'         },
    { label: 'GET /api/profesionales', path: '/api/profesionales' },
    { label: 'GET /api/citas',         path: '/api/citas'         },
  ];

  // ── ESCENARIO A: 10 usuarios × 20 s ─────────────────────────
  separador('ESCENARIO A — 10 usuarios recurrentes × 20 segundos');

  const resultadosA = [];
  for (const ep of endpointsA) {
    console.log(`\n⏳  Probando ${ep.label} …`);
    const r = await benchmark({
      title: ep.label,
      url: `${BASE_URL}${ep.path}`,
      connections: 10,
      duration: 20,
    });
    resultadosA.push(r);
    imprimirResultado(r);
    // pausa de 3 s entre endpoints para no saturar Render
    await new Promise(res => setTimeout(res, 3000));
  }

  // ── ESCENARIO B: 500 usuarios × 120 s ───────────────────────
  separador('ESCENARIO B — 500 usuarios × 120 segundos');

  const endpointsB = [
    { label: 'GET /api/salud',         path: '/api/salud'         },
    { label: 'GET /api/profesionales', path: '/api/profesionales' },
    { label: 'GET /api/citas',         path: '/api/citas'         },
  ];

  const resultadosB = [];
  for (const ep of endpointsB) {
    console.log(`\n⏳  Probando ${ep.label} …`);
    const r = await benchmark({
      title: ep.label,
      url: `${BASE_URL}${ep.path}`,
      connections: 500,
      duration: 120,
    });
    resultadosB.push(r);
    imprimirResultado(r);
    // pausa de 5 s entre endpoints
    await new Promise(res => setTimeout(res, 5000));
  }

  // ── RESUMEN COMPARATIVO ──────────────────────────────────────
  separador('RESUMEN COMPARATIVO DE LATENCIAS (p99)');
  console.log('\n  Endpoint                      │ A: p99 (ms) │ B: p99 (ms) │ Δ (ms)');
  console.log('  ─────────────────────────────────────────────────────────────────');
  for (let i = 0; i < endpointsA.length; i++) {
    const pA = resultadosA[i]?.latency?.p99 ?? '-';
    const pB = resultadosB[i]?.latency?.p99 ?? '-';
    const delta = (typeof pA === 'number' && typeof pB === 'number') ? (pB - pA) : '-';
    const label = endpointsA[i].label.padEnd(30);
    console.log(`  ${label}│ ${String(pA).padStart(11)} │ ${String(pB).padStart(11)} │ ${String(delta).padStart(6)}`);
  }
  console.log('\n✅  Pruebas finalizadas.');
}

main().catch(err => {
  console.error('❌  Error en la prueba:', err.message || err);
  process.exit(1);
});
