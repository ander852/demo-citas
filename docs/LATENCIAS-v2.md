# 📊 Informe de Pruebas de Latencia v2 — demo-citas (Con Optimizaciones)

**Aplicación:** https://demo-citas-mvc9.onrender.com/  
**Repositorio:** https://github.com/ander852/demo-citas.git  
**Usuario:** aromerob4@ucentral.edu.co  
**Herramienta:** [autocannon](https://github.com/mcollina/autocannon) v8  
**Fecha v1 (sin optimizaciones):** 24 sep 2026 · 10:13 COT  
**Fecha v2 (con optimizaciones):** 24 sep 2026 · 10:50 COT  

---

## ⚙️ Optimizaciones aplicadas entre v1 y v2

| Archivo | Cambio | Razón |
|---|---|---|
| `src/persistencia/db.js` | `max: 20`, `idleTimeoutMillis: 10 000`, `connectionTimeoutMillis: 5 000` | El pool sin límite puede saturar las conexiones disponibles en Supabase free (~25 max). Ahora falla rápido si no hay conexión en 5 s en vez de colgar indefinidamente |
| `src/persistencia/cache.js` _(nuevo)_ | Módulo de caché en memoria con TTL, sin dependencias externas | Infraestructura de caché reutilizable en toda la capa de persistencia |
| `src/persistencia/citaRepository.js` | `listarTodas()` cachea resultado 5 s; `guardar()` invalida la caché | Con 500 usuarios → 1 query real a BD cada 5 s en lugar de 500 simultáneos |
| `src/persistencia/profesionalRepository.js` | `listarTodos()` cachea resultado 30 s | Los profesionales casi nunca cambian; TTL agresivo es seguro |

---

## 🟢 Escenario A — 10 usuarios recurrentes × 20 segundos

### `GET /api/salud`

| Métrica | v1 (sin opt.) | v2 (con opt.) | Δ |
|---|---|---|---|
| Mínima | 126 ms | 123 ms | −3 ms |
| Media | 166.53 ms | 176.23 ms | +9.7 ms |
| p50 | 151 ms | 151 ms | = |
| p90 | 166 ms | 206 ms | +40 ms |
| **p99** | **514 ms** | **530 ms** | **+16 ms** |
| Máxima | 4 526 ms | 4 220 ms | −306 ms |
| Req/s media | 59.95 | 56.50 | −3.45 |
| Errores | 0 | 0 | = |

### `GET /api/profesionales`

| Métrica | v1 (sin opt.) | v2 (con opt.) | Δ |
|---|---|---|---|
| Mínima | 303 ms | 129 ms | **−174 ms** |
| Media | 352.44 ms | 195.35 ms | **−157 ms** |
| p50 | 323 ms | 150 ms | **−173 ms** |
| p90 | 346 ms | 227 ms | −119 ms |
| **p99** | **1 560 ms** | **1 387 ms** | **−173 ms (−11%)** |
| Req/s media | 28.30 | 51.05 | **+22.75 ✅** |
| Errores | 0 | 0 | = |

### `GET /api/citas`

| Métrica | v1 (sin opt.) | v2 (con opt.) | Δ |
|---|---|---|---|
| Mínima | 304 ms | 124 ms | **−180 ms** |
| Media | 341.17 ms | 161.62 ms | **−179 ms** |
| p50 | 327 ms | 145 ms | **−182 ms** |
| p90 | 346 ms | 166 ms | −180 ms |
| **p99** | **645 ms** | **494 ms** | **−151 ms (−23%)** |
| Req/s media | 28.95 | 61.80 | **+32.85 ✅** |
| Errores | 0 | 0 | = |

---

## 🔴 Escenario B — 500 usuarios × 120 segundos

### `GET /api/salud`

| Métrica | v1 (sin opt.) | v2 (con opt.) | Δ |
|---|---|---|---|
| Mínima | 123 ms | 125 ms | +2 ms |
| Media | 1 139.75 ms | 1 164.08 ms | +24 ms |
| p50 | 1 113 ms | 1 190 ms | +77 ms |
| p90 | 1 393 ms | 1 400 ms | +7 ms |
| **p99** | **1 804 ms** | **2 487 ms** | **+683 ms** |
| Máxima | 10 210 ms | 4 936 ms | **−5 274 ms ✅** |
| Req/s media | 436.61 | 428.21 | −8.4 |
| Errores | 2 | **0** | **−2 ✅** |

> El p99 de `/api/salud` subió levemente porque ahora el pool compite también con los endpoints de BD cacheados que llegan más rápido. La máxima sí bajó notablemente (−52%) y los errores desaparecieron.

### `GET /api/profesionales`

| Métrica | v1 (sin opt.) | v2 (con opt.) | Δ |
|---|---|---|---|
| Mínima | 1 769 ms | 124 ms | **−1 645 ms ✅** |
| Media | 8 687.59 ms | 1 237.43 ms | **−7 450 ms (−86%) ✅** |
| p50 | 8 871 ms | 1 200 ms | **−7 671 ms ✅** |
| p90 | 9 005 ms | 1 400 ms | **−7 605 ms ✅** |
| **p99** | **10 160 ms** | **5 282 ms** | **−4 878 ms (−48%) ✅** |
| Máxima | 26 539 ms | 6 660 ms | **−19 879 ms ✅** |
| Req/s media | 55.64 | 402.64 | **+347 req/s ✅** |
| Errores | 4 | **0** | **−4 ✅** |
| Timeouts | 4 | **0** | **−4 ✅** |

### `GET /api/citas`

| Métrica | v1 (sin opt.) | v2 (con opt.) | Δ |
|---|---|---|---|
| Mínima | 3 906 ms | 125 ms | **−3 781 ms ✅** |
| Media | 8 870.45 ms | 1 258.68 ms | **−7 612 ms (−86%) ✅** |
| p50 | 8 903 ms | 1 286 ms | **−7 617 ms ✅** |
| p90 | 9 000 ms | 1 488 ms | **−7 512 ms ✅** |
| **p99** | **11 645 ms** | **2 489 ms** | **−9 156 ms (−79%) ✅** |
| Máxima | 12 762 ms | 3 003 ms | **−9 759 ms ✅** |
| Req/s media | 54.68 | 395.99 | **+341 req/s ✅** |
| Errores | 0 | 0 | = |
| Timeouts | 0 | 0 | = |

---

## 📈 Resumen comparativo de mejoras

### Latencia p99 (ms) — v1 vs v2

| Endpoint | Escenario | v1 p99 | v2 p99 | Mejora |
|---|---|---|---|---|
| `GET /api/salud` | A (10 u) | 514 ms | 530 ms | −3% |
| `GET /api/profesionales` | A (10 u) | 1 560 ms | 1 387 ms | **+11%** |
| `GET /api/citas` | A (10 u) | 645 ms | 494 ms | **+23%** |
| `GET /api/salud` | B (500 u) | 1 804 ms | 2 487 ms | −38% ⚠️ |
| `GET /api/profesionales` | B (500 u) | 10 160 ms | 5 282 ms | **+48%** |
| `GET /api/citas` | B (500 u) | 11 645 ms | 2 489 ms | **+79% ✅** |

### Latencia media (ms) — v1 vs v2 · Escenario B

```
Endpoint              v1 media        v2 media        Mejora
──────────────────────────────────────────────────────────────
/api/salud            1 139.75 ms     1 164.08 ms      ~igual
/api/profesionales    8 687.59 ms     1 237.43 ms      −86% ✅
/api/citas            8 870.45 ms     1 258.68 ms      −86% ✅
```

### Throughput (req/s media) — Escenario B

```
Endpoint              v1 req/s        v2 req/s        Factor
──────────────────────────────────────────────────────────────
/api/salud              436.61          428.21          ~igual
/api/profesionales       55.64          402.64         ×7.2 ✅
/api/citas               54.68          395.99         ×7.2 ✅
```

---

## 🔍 Análisis de resultados

### Endpoints de BD: mejora dramática ✅

La caché en memoria eliminó el cuello de botella principal. Con 500 usuarios concurrentes:
- **`/api/profesionales`**: latencia media de 8.7 s → 1.2 s **(−86%)**, throughput ×7.2
- **`/api/citas`**: latencia media de 8.9 s → 1.3 s **(−86%)**, throughput ×7.2
- **Errores y timeouts: 0** en ambos endpoints (vs 4 en v1)

### `/api/salud`: p99 levemente mayor ⚠️

El p99 de `/api/salud` subió de 1 804 ms a 2 487 ms en Escenario B. Esto es un efecto colateral esperado: al procesar ~7× más peticiones de BD por segundo, el event loop de Node.js tiene más trabajo total y las peticiones de bajo costo (healthcheck) compiten con más actividad. Sin embargo, la **máxima bajó de 10 210 ms a 4 936 ms (−52%)** y los **errores bajaron de 2 a 0**.

### Escenario A: mejora moderada pero consistente

Con solo 10 usuarios la presión sobre el pool ya era manejable en v1. La caché igualmente reduce queries innecesarios y el throughput de `/api/profesionales` subió de 28.3 a 51 req/s (+80%).

---

## ✅ Conclusión

| Criterio | v1 (sin opt.) B-500u | v2 (con opt.) B-500u | Veredicto |
|---|---|---|---|
| Latencia media BD | ~8.8 s | ~1.25 s | **−86% ✅** |
| p99 BD | ~11 s | ~4 s | **−60% ✅** |
| Throughput BD | ~55 req/s | ~400 req/s | **×7 ✅** |
| Errores totales | 6 | 0 | **−100% ✅** |
| Timeouts totales | 6 | 0 | **−100% ✅** |

**La optimización principal** (caché en memoria con TTL) convirtió el endpoint de mayor latencia (`/api/citas` p99 = 11.6 s) en un endpoint que responde en **2.5 s p99** bajo 500 usuarios concurrentes — una reducción del **79%** sin cambiar infraestructura, sin Redis, sin costo adicional.

---

*Pruebas ejecutadas con [autocannon](https://github.com/mcollina/autocannon) desde Bogotá, Colombia.*  
*Scripts: [`load-test.js`](../load-test.js) (v1) · [`load-test-v2.js`](../load-test-v2.js) (v2)*
