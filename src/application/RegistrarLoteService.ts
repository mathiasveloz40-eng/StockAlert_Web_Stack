import { LoteVencidoError, ValidacionError } from '../domain/errors';
import { PostgresStockRepository } from '../persistence/PostgresStockRepository';

export class RegistrarLoteService {
  constructor(private readonly repo: PostgresStockRepository) {}

  async ejecutar(input: {
    productoId: number;
    codigoLote: string;
    cantidad: number;
    fechaVencimiento?: string | null;
    usuarioRol: string;
  }) {
    if (!input.productoId || !input.codigoLote?.trim() || input.cantidad <= 0) {
      throw new ValidacionError('Producto, código de lote y cantidad > 0 son obligatorios.');
    }

    if (input.fechaVencimiento) {
      const fecha = new Date(`${input.fechaVencimiento}T00:00:00Z`);
      if (Number.isNaN(fecha.getTime())) {
        throw new ValidacionError('Formato de fecha de vencimiento inválido (use YYYY-MM-DD).');
      }
      const hoy = new Date();
      hoy.setUTCHours(0, 0, 0, 0);
      if (fecha < hoy) {
        throw new LoteVencidoError('No se permite ingresar un lote con fecha ya vencida.');
      }
    }

    return this.repo.crearLote({
      productoId: input.productoId,
      codigoLote: input.codigoLote.trim(),
      cantidad: input.cantidad,
      fechaVencimiento: input.fechaVencimiento || null,
      usuarioRol: input.usuarioRol,
    });
  }
}