const { ESTADOS_ALERTA } = require('../domain/models');

class EvaluarAlertasService {
  constructor(repo) {
    this.repo = repo;
  }

  async ejecutar(fechaReferencia = new Date()) {
    const lotes = await this.repo.obtenerLotesConProducto();
    return lotes.map((lote) => this.clasificarLote(lote, fechaReferencia));
  }

  clasificarLote(lote, hoy) {
    let estado = ESTADOS_ALERTA.NORMAL;
    let diasRestantes = null;

    if (!lote.fechaVencimiento || lote.diasPreaviso === null || lote.stockMinimo === null) {
      estado = ESTADOS_ALERTA.INDETERMINADO;
    } else {
      const vencimiento = new Date(`${lote.fechaVencimiento}T00:00:00Z`);
      const inicioHoy = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate()));
      diasRestantes = Math.floor((vencimiento.getTime() - inicioHoy.getTime()) / 86400000);

      if (diasRestantes < 0) {
        estado = ESTADOS_ALERTA.VENCIDO;
      } else if (diasRestantes <= lote.diasPreaviso) {
        estado = ESTADOS_ALERTA.POR_VENCER;
      } else if (lote.saldo <= lote.stockMinimo) {
        estado = ESTADOS_ALERTA.STOCK_CRITICO;
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

module.exports = { EvaluarAlertasService };