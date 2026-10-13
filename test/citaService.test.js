// test/citaService.test.js (Node.js >= 18)
const test = require('node:test');
const assert = require('node:assert/strict');
const { crearCitaService } = require('../src/aplicacion/citaService');

function crearServicioParaPrueba(ocupado = false) {
  let guardadas = 0;
  const servicio = crearCitaService({
    citaRepository: {
      listarTodas: async () => [],
      existeEnHorario: async () => ocupado,
      guardar: async () => {
        guardadas++;
        return 7;
      },
    },
    profesionalRepository: { listarTodos: async () => [] },
    reloj: () => new Date('2026-10-01T00:00:00Z'),
  });
  return { servicio, guardadas: () => guardadas };
}

// Prueba 1 (Laboratorio)
test('reserva permitida', async () => {
  const x = crearServicioParaPrueba();
  const respuesta = await x.servicio.reservarCita({
    paciente: 'Ana',
    profesional_id: 1,
    fecha_hora: '2026-11-15T10:00:00Z',
  });
  assert.equal(respuesta.id, 7);
  assert.equal(x.guardadas(), 1);
});

// Prueba 2 (Laboratorio)
test('agenda ocupada no genera escritura', async () => {
  const x = crearServicioParaPrueba(true);
  await assert.rejects(
    () =>
      x.servicio.reservarCita({
        paciente: 'Ana',
        profesional_id: 1,
        fecha_hora: '2026-11-15T10:00:00Z',
      }),
    { codigo: 'AGENDA_OCUPADA' }
  );
  assert.equal(x.guardadas(), 0);
});

// Prueba 3 (Laboratorio)
test('fecha pasada se rechaza sin consultar PostgreSQL', async () => {
  const x = crearServicioParaPrueba();
  await assert.rejects(
    () =>
      x.servicio.reservarCita({
        paciente: 'Ana',
        profesional_id: 1,
        fecha_hora: '2026-09-01T10:00:00Z',
      }),
    { codigo: 'FECHA_PASADA' }
  );
  assert.equal(x.guardadas(), 0);
});

// Prueba 4 (Propia del equipo: Verificación del contrato DIP)
test('repositorio incompleto es rechazado por el contrato al ensamblar', () => {
  assert.throws(
    () => {
      crearCitaService({
        citaRepository: {
          listarTodas: async () => [],
          existeEnHorario: async () => false,
          // Omite intencionalmente 'guardar'
        },
        profesionalRepository: { listarTodos: async () => [] },
      });
    },
    {
      name: 'TypeError',
      message: 'citaRepository debe implementar guardar()',
    }
  );
});
