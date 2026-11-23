const { LoteVencidoError, ValidacionError } = require('../domain/errors');

class RegistrarLoteService {
  constructor(repo) {
    this.repo = repo;
  }

  async ejecutar({ productoId, codigoLote, cantidad, fechaVencimiento, usuarioRol }) {
    if (!productoId || !codigoLote || !codigoLote.trim() || !cantidad || cantidad <= 0) {
      throw new ValidacionError('Producto, código de lote y cantidad > 0 son obligatorios.');
    }

    if (fechaVencimiento) {
      const fecha = new Date(`${fechaVencimiento}T00:00:00Z`);
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
      productoId,
      codigoLote: codigoLote.trim(),
      cantidad,
      fechaVencimiento: fechaVencimiento || null,
      usuarioRol,
    });
  }
}

module.exports = { RegistrarLoteService };