import { describe, expect, it } from 'vitest';
const { EvaluarAlertasService } = require('../src/application/EvaluarAlertasService');

describe('EvaluarAlertasService (CU-01 / QA-06)', () => {
  const service = new EvaluarAlertasService({});
  const hoy = new Date('2026-11-20T00:00:00Z');

  it('marca como INDETERMINADO un lote sin fecha de vencimiento (R-02)', () => {
    const res = service.clasificarLote(
      {
        id: 1,
        productoId: 3,
        codigoLote: 'L-01',
        saldo: 5,
        fechaVencimiento: null,
        productoCodigo: 'SIN-003',
        productoNombre: 'Producto Sin Umbral',
        stockMinimo: null,
        diasPreaviso: null,
      },
      hoy
    );
    expect(res.estado).toBe('INDETERMINADO');
  });

  it('marca como POR_VENCER cuando los días restantes están dentro del preaviso', () => {
    const res = service.clasificarLote(
      {
        id: 2,
        productoId: 1,
        codigoLote: 'L-02',
        saldo: 20,
        fechaVencimiento: '2026-11-24',
        productoCodigo: 'LAC-001',
        productoNombre: 'Leche',
        stockMinimo: 10,
        diasPreaviso: 7,
      },
      hoy
    );
    expect(res.estado).toBe('POR_VENCER');
    expect(res.diasRestantes).toBe(4);
  });
});