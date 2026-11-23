import { Pool } from 'pg';
import { Lote, LoteConProducto, Movimiento } from '../domain/models';

export class PostgresStockRepository {
  constructor(private readonly db: Pool) {}

  async obtenerLotesConProducto(): Promise<LoteConProducto[]> {
    const res = await this.db.query(`
      SELECT
        l.id,
        l.producto_id AS "productoId",
        l.codigo_lote AS "codigoLote",
        l.saldo,
        TO_CHAR(l.fecha_vencimiento, 'YYYY-MM-DD') AS "fechaVencimiento",
        p.codigo AS "productoCodigo",
        p.nombre AS "productoNombre",
        p.stock_minimo AS "stockMinimo",
        p.dias_preaviso AS "diasPreaviso"
      FROM lotes l
      JOIN productos p ON p.id = l.producto_id
      ORDER BY l.fecha_vencimiento ASC NULLS LAST, l.id ASC
    `);
    return res.rows;
  }

  async crearLote(data: {
    productoId: number;
    codigoLote: string;
    cantidad: number;
    fechaVencimiento: string | null;
    usuarioRol: string;
  }): Promise<Lote> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      const loteRes = await client.query(
        `INSERT INTO lotes (producto_id, codigo_lote, saldo, fecha_vencimiento)
         VALUES ($1, $2, $3, $4)
         RETURNING id, producto_id AS "productoId", codigo_lote AS "codigoLote",
                   saldo, TO_CHAR(fecha_vencimiento, 'YYYY-MM-DD') AS "fechaVencimiento"`,
        [data.productoId, data.codigoLote, data.cantidad, data.fechaVencimiento]
      );
      const lote = loteRes.rows[0];

      await client.query(
        `INSERT INTO movimientos (lote_id, tipo, cantidad, motivo, usuario_rol)
         VALUES ($1, 'INGRESO', $2, 'Ingreso de mercadería', $3)`,
        [lote.id, data.cantidad, data.usuarioRol]
      );
      await client.query('COMMIT');
      return lote;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Criterio FEFO: obtiene lotes activos vigentes ordenados por vencimiento más próximo
  async obtenerLotesDisponiblesFEFO(productoId: number): Promise<Lote[]> {
    const res = await this.db.query(
      `SELECT id, producto_id AS "productoId", codigo_lote AS "codigoLote",
              saldo, TO_CHAR(fecha_vencimiento, 'YYYY-MM-DD') AS "fechaVencimiento"
       FROM lotes
       WHERE producto_id = $1
         AND saldo > 0
         AND (fecha_vencimiento IS NULL OR fecha_vencimiento >= CURRENT_DATE)
       ORDER BY fecha_vencimiento ASC NULLS LAST, id ASC`,
      [productoId]
    );
    return res.rows;
  }

  // Resolución T-01 / QA-01: actualización atómica condicional sin saldos negativos
  async descontarLoteAtomico(data: {
    loteId: number;
    cantidad: number;
    tipo: 'VENTA' | 'MERMA';
    motivo: string;
    usuarioRol: string;
  }): Promise<Lote | null> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      const updateRes = await client.query(
        `UPDATE lotes
         SET saldo = saldo - $1
         WHERE id = $2 AND saldo >= $1
         RETURNING id, producto_id AS "productoId", codigo_lote AS "codigoLote",
                   saldo, TO_CHAR(fecha_vencimiento, 'YYYY-MM-DD') AS "fechaVencimiento"`,
        [data.cantidad, data.loteId]
      );

      if (updateRes.rowCount === 0) {
        await client.query('ROLLBACK');
        return null;
      }

      await client.query(
        `INSERT INTO movimientos (lote_id, tipo, cantidad, motivo, usuario_rol)
         VALUES ($1, $2, $3, $4, $5)`,
        [data.loteId, data.tipo, data.cantidad, data.motivo, data.usuarioRol]
      );

      await client.query('COMMIT');
      return updateRes.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async actualizarUmbralProducto(
    productoId: number,
    stockMinimo: number,
    diasPreaviso: number
  ): Promise<boolean> {
    const res = await this.db.query(
      `UPDATE productos SET stock_minimo = $1, dias_preaviso = $2 WHERE id = $3`,
      [stockMinimo, diasPreaviso, productoId]
    );
    return (res.rowCount ?? 0) > 0;
  }

  async consultarMovimientos(desde?: string, hasta?: string): Promise<Movimiento[]> {
    const res = await this.db.query(
      `SELECT id, lote_id AS "loteId", tipo, cantidad, motivo,
              usuario_rol AS "usuarioRol", fecha
       FROM movimientos
       WHERE ($1::date IS NULL OR fecha::date >= $1::date)
         AND ($2::date IS NULL OR fecha::date <= $2::date)
       ORDER BY fecha DESC`,
      [desde || null, hasta || null]
    );
    return res.rows;
  }

  async registrarAuditoria(
    usuarioRol: string,
    endpoint: string,
    metodo: string,
    detalle: string
  ): Promise<void> {
    await this.db.query(
      `INSERT INTO auditoria (usuario_rol, endpoint, metodo, detalle)
       VALUES ($1, $2, $3, $4)`,
      [usuarioRol, endpoint, metodo, detalle]
    );
  }
}