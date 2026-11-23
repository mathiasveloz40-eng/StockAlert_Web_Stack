import { afterAll, describe, expect, it } from 'vitest';
const request = require('supertest');
const { createApp } = require('../src/app');
const { pool } = require('../src/persistence/db');

describe('StockAlert API Endpoints (QA-03 / QA-06)', () => {
  const app = createApp();

  afterAll(async () => {
    await pool.end();
  });

  it('GET /api/alertas responde 200 con la lista evaluada', async () => {
    const res = await request(app).get('/api/alertas');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.alertas)).toBe(true);
  });

  it('POST /api/mermas bloquea con 403 si el rol es ENCARGADO (QA-03)', async () => {
    const res = await request(app)
      .post('/api/mermas')
      .set('x-user-role', 'ENCARGADO')
      .send({ loteId: 1, cantidad: 1, motivo: 'Envase roto' });
    expect(res.status).toBe(403);
  });

  it('POST /api/lotes rechaza con 422 una fecha ya vencida (QA-06)', async () => {
    const res = await request(app)
      .post('/api/lotes')
      .send({
        productoId: 1,
        codigoLote: 'LOTE-VENCIDO',
        cantidad: 5,
        fechaVencimiento: '2020-01-01',
      });
    expect(res.status).toBe(422);
  });
});