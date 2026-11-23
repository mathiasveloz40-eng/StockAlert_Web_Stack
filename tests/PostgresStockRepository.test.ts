import { afterAll, describe, expect, it } from 'vitest';
import { pool } from '../src/persistence/db';
import { PostgresStockRepository } from '../src/persistence/PostgresStockRepository';

describe('PostgresStockRepository (Queries y concurrencia QA-01)', () => {
  const repo = new PostgresStockRepository(pool);

  afterAll(async () => {
    await pool.end();
  });

  it('consulta los lotes semilla con sus productos desde PostgreSQL', async () => {
    const lotes = await repo.obtenerLotesConProducto();
    expect(lotes.length).toBeGreaterThan(0);
    expect(lotes[0]).toHaveProperty('codigoLote');
  });

  it('impide saldo negativo ante dos descuentos simultáneos (QA-01)', async () => {
    const lotePrueba = await repo.crearLote({
      productoId: 1,
      codigoLote: 'TEST-CONCURRENCIA',
      cantidad: 6,
      fechaVencimiento: '2026-12-30',
      usuarioRol: 'ENCARGADO',
    });

    const [r1, r2] = await Promise.all([
      repo.descontarLoteAtomico({
        loteId: lotePrueba.id,
        cantidad: 5,
        tipo: 'VENTA',
        motivo: 'Prueba 1',
        usuarioRol: 'ENCARGADO',
      }),
      repo.descontarLoteAtomico({
        loteId: lotePrueba.id,
        cantidad: 5,
        tipo: 'VENTA',
        motivo: 'Prueba 2',
        usuarioRol: 'ENCARGADO',
      }),
    ]);

    const exitosos = [r1, r2].filter((r) => r !== null);
    expect(exitosos).toHaveLength(1);
    expect(exitosos[0]?.saldo).toBe(1);
  });
});