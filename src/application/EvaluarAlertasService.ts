import { AlertaLote, EstadoAlerta, LoteConProducto } from '../domain/models';
import { PostgresStockRepository } from '../persistence/PostgresStockRepository';

export class EvaluarAlertasService {
  constructor(private readonly repo: PostgresStockRepository) {}

  async ejecutar(fechaReferencia = new Date()): Promise<AlertaLote[]> {
    const lotes = await this.repo.obtenerLotesConProducto();
    return lotes.map((lote) => this.clasificarLote(lote, fechaReferencia));
  }

  // Función pura aislada del SQL (resuelve T-03 / QA-05)
  clasificarLote(lote: LoteConProducto, hoy: Date): AlertaLote {
    let estado: EstadoAlerta = 'NORMAL';
    let diasRestantes: number | null = null;

    if (!lote.fechaVencimiento || lote.diasPreaviso === null || lote.stockMinimo === null) {
      estado = 'INDETERMINADO'; // Regla R-02 y QA-06
    } else {
      const vencimiento = new Date(`${lote.fechaVencimiento}T00:00:00Z`);
      const inicioHoy = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate()));
      diasRestantes = Math.floor((vencimiento.getTime() - inicioHoy.getTime()) / 86400000);

      if (diasRestantes < 0) {
        estado = 'VENCIDO';
      } else if (diasRestantes <= lote.diasPreaviso) {
        estado = 'POR_VENCER';
      } else if (lote.saldo <= lote.stockMinimo) {
        estado = 'STOCK_CRITICO';
      }
    }

    return {
      loteId: lote.id,
      codigoLote: lote.codigoLote,
      productoId: lote.productoId,
      productoNombre: lote.productoNombre,
      saldo: lote.saldo,
      fechaVencimiento: lote.fechaVencimiento,
      diasRestantes,
      estado,
    };
  }
}