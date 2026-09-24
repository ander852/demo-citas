# 📊 Informe de Pruebas de Latencia — demo-citas

**Aplicación:** https://demo-citas-mvc9.onrender.com/  
**Repositorio:** https://github.com/ander852/demo-citas.git  
**Usuario:** aromerob4@ucentral.edu.co  
**Herramienta:** [autocannon](https://github.com/mcollina/autocannon) v8  
**Fecha:** 24 de septiembre de 2026 · 10:13 COT  

---

## Configuración de la prueba

| Parámetro | Escenario A | Escenario B |
|---|---|---|
| Usuarios concurrentes | **10** | **500** |
| Duración | **20 s** | **120 s** |
| Timeout por petición | 30 s | 30 s |
| Endpoints probados | 3 | 3 |

**Endpoints probados:**
- `GET /api/salud` — healthcheck (sin acceso a BD)
- `GET /api/profesionales` — lista de profesionales (consulta PostgreSQL)
- `GET /api/citas` — lista de citas (consulta PostgreSQL)

---

## 🟢 Escenario A — 10 usuarios recurrentes × 20 segundos

### `GET /api/salud`

| Métrica de Latencia | Valor |
|---|---|
| Mínima | 126 ms |
| Máxima | 4 526 ms |
| **Media** | **166.53 ms** |
| p50 | 151 ms |
| p90 | 166 ms |
| **p99** | **514 ms** |
| Desviación estándar | 155.73 ms |

| Métrica de Rendimiento | Valor |
|---|---|
| Peticiones totales | 1 199 |
| Req/s (media) | 59.95 |
| Req/s (máx) | 71 |
| Throughput | 31 296 bytes/s |
| Errores | **0** |
| Timeouts | **0** |

---

### `GET /api/profesionales`

| Métrica de Latencia | Valor |
|---|---|
| Mínima | 303 ms |
| Máxima | 1 679 ms |
| **Media** | **352.44 ms** |
| p50 | 323 ms |
| p90 | 346 ms |
| **p99** | **1 560 ms** |
| Desviación estándar | 169.83 ms |

| Métrica de Rendimiento | Valor |
|---|---|
| Peticiones totales | 566 |
| Req/s (media) | 28.30 |
| Req/s (máx) | 32 |
| Throughput | 18 765 bytes/s |
| Errores | **0** |
| Timeouts | **0** |

---

### `GET /api/citas`

| Métrica de Latencia | Valor |
|---|---|
| Mínima | 304 ms |
| Máxima | 2 742 ms |
| **Media** | **341.17 ms** |
| p50 | 327 ms |
| p90 | 346 ms |
| **p99** | **645 ms** |
| Desviación estándar | 123.12 ms |

| Métrica de Rendimiento | Valor |
|---|---|
| Peticiones totales | 579 |
| Req/s (media) | 28.95 |
| Req/s (máx) | 33 |
| Throughput | 32 403 bytes/s |
| Errores | **0** |
| Timeouts | **0** |

---

## 🔴 Escenario B — 500 usuarios × 120 segundos

### `GET /api/salud`

| Métrica de Latencia | Valor |
|---|---|
| Mínima | 123 ms |
| Máxima | 10 210 ms |
| **Media** | **1 139.75 ms** |
| p50 | 1 113 ms |
| p90 | 1 393 ms |
| **p99** | **1 804 ms** |
| Desviación estándar | 281.13 ms |

| Métrica de Rendimiento | Valor |
|---|---|
| Peticiones totales | 52 393 |
| Req/s (media) | 436.61 |
| Req/s (máx) | 520 |
| Throughput | 227 914 bytes/s |
| Errores | **2** |
| Timeouts | **2** |

---

### `GET /api/profesionales`

| Métrica de Latencia | Valor |
|---|---|
| Mínima | 1 769 ms |
| Máxima | 26 539 ms |
| **Media** | **8 687.59 ms** |
| p50 | 8 871 ms |
| p90 | 9 005 ms |
| **p99** | **10 160 ms** |
| Desviación estándar | 1 145.45 ms |

| Métrica de Rendimiento | Valor |
|---|---|
| Peticiones totales | 6 676 |
| Req/s (media) | 55.64 |
| Req/s (máx) | 65 |
| Throughput | 36 884 bytes/s |
| Errores | **4** |
| Timeouts | **4** |

---

### `GET /api/citas`

| Métrica de Latencia | Valor |
|---|---|
| Mínima | 3 906 ms |
| Máxima | 12 762 ms |
| **Media** | **8 870.45 ms** |
| p50 | 8 903 ms |
| p90 | 9 000 ms |
| **p99** | **11 645 ms** |
| Desviación estándar | 724.17 ms |

| Métrica de Rendimiento | Valor |
|---|---|
| Peticiones totales | 6 561 |
| Req/s (media) | 54.68 |
| Req/s (máx) | 63 |
| Throughput | 61 188 bytes/s |
| Errores | **0** |
| Timeouts | **0** |

---

## 📈 Resumen comparativo

### Latencia p99 por escenario

| Endpoint | A: 10 usuarios (20 s) | B: 500 usuarios (120 s) | Δ (ms) | Factor |
|---|---|---|---|---|
| `GET /api/salud` | 514 ms | 1 804 ms | +1 290 ms | ×3.5 |
| `GET /api/profesionales` | 1 560 ms | 10 160 ms | +8 600 ms | ×6.5 |
| `GET /api/citas` | 645 ms | 11 645 ms | +11 000 ms | ×18.1 |

### Latencia media por escenario

| Endpoint | A: 10 usuarios | B: 500 usuarios | Factor |
|---|---|---|---|
| `GET /api/salud` | 166.5 ms | 1 139.8 ms | ×6.8 |
| `GET /api/profesionales` | 352.4 ms | 8 687.6 ms | ×24.7 |
| `GET /api/citas` | 341.2 ms | 8 870.5 ms | ×26.0 |

### Throughput (req/s media)

| Endpoint | A: 10 usuarios | B: 500 usuarios |
|---|---|---|
| `GET /api/salud` | 59.95 req/s | 436.61 req/s ✅ |
| `GET /api/profesionales` | 28.30 req/s | 55.64 req/s ⚠️ |
| `GET /api/citas` | 28.95 req/s | 54.68 req/s ⚠️ |

> El endpoint `/api/salud` escala bien porque no accede a la base de datos.  
> Los endpoints de BD procesan apenas ~55 req/s con 500 conexiones abiertas, indicando saturación del connection pool.

---

## 🔍 Análisis

### Cuello de botella: connection pool de Supabase

Con 10 usuarios la aplicación responde en rangos de **126–352 ms** (muy aceptable). Al escalar a 500 usuarios la latencia media salta a **8.6–8.9 segundos** en los endpoints que consultan PostgreSQL. El patrón confirma que el bottleneck es el pool de conexiones a Supabase, no el servidor Express.

El endpoint `/api/salud`, que devuelve un JSON estático sin tocar la BD, mantiene un throughput de **436 req/s** con latencia media de ~1.1 s bajo 500 usuarios concurrentes, lo que confirma que Node.js/Express no es el problema.

### Errores y timeouts

| Escenario | Endpoint | Errores | Timeouts | % error |
|---|---|---|---|---|
| B (500 u) | `/api/salud` | 2 | 2 | < 0.01% |
| B (500 u) | `/api/profesionales` | 4 | 4 | 0.06% |
| B (500 u) | `/api/citas` | 0 | 0 | 0.00% |

Los errores son mínimos: el servidor no colapsa, pero se degrada significativamente bajo carga alta.

### Limitaciones del entorno

- **Render free tier:** 1 instancia, ~0.5 CPU, 512 MB RAM, sin escala horizontal.
- **Supabase free tier:** pool de conexiones limitado a ~25 conexiones simultáneas.
- **Cold start:** la primera petición después de inactividad puede tener latencia alta (visible en los valores máximos).

---

## ✅ Conclusiones

| Criterio | A (10 u × 20 s) | B (500 u × 120 s) |
|---|---|---|
| Estabilidad | ✅ Estable, 0 errores | ⚠️ Degradación severa en endpoints de BD |
| Latencia media | ✅ 167–352 ms | ❌ 1.1 s – 8.9 s |
| Latencia p99 | ✅ < 1.6 s | ❌ 1.8 s – 11.6 s |
| Throughput | ✅ 29–60 req/s | ⚠️ 55–437 req/s (solo `/salud` escala) |
| Cuello de botella | No evidente | ✅ Identificado: pool de conexiones a BD |

**La aplicación soporta correctamente cargas de 10 usuarios concurrentes.** Para escalar a cientos de usuarios simultáneos se recomienda:

1. **Connection pooling** con PgBouncer en modo transaction (reduce conexiones físicas a Supabase).
2. **Caché HTTP** (`Cache-Control`, Redis) para endpoints de lectura frecuente como `/api/profesionales`.
3. **Restricción de unicidad en BD** para resolver la condición de carrera documentada en el `README.md`.
4. Migrar a un plan de Render con más recursos (CPU/RAM) o habilitar auto-scaling.

---

*Prueba ejecutada con [autocannon](https://github.com/mcollina/autocannon) desde un equipo local en Bogotá, Colombia.*  
*Ver script de prueba: [`load-test.js`](../load-test.js)*
