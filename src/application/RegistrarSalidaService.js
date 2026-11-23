const { StockInsuficienteError, ValidacionError } = require('../domain/errors');

class RegistrarSalidaService {
  constructor(repo) {
    this.repo = repo;
  }

  async registrarVentaFEFO({ productoId, cantidad, usuarioRol }) {
    if (!productoId || !cantidad || cantidad <= 0) {
      throw new ValidacionError('Producto y cantidad > 0 son obligatorios.');
    }

    const candidatos = await this.repo.obtenerLotesDisponiblesFEFO(productoId);
    const loteFEFO = candidatos.find((l) => l.saldo >= cantidad);

    if (!loteFEFO) {
      throw new StockInsuficienteError(
        'No existe un lote vigente con saldo suficiente para cubrir la salida.'
      );
    }

    const actualizado = await this.repo.descontarLoteAtomico({
      loteId: loteFEFO.id,
      cantidad,
      tipo: 'VENTA',
      motivo: 'Venta en mostrador (FEFO)',
      usuarioRol,
    });

    if (!actualizado) {
      throw new StockInsuficienteError(
        'Conflicto de concurrencia: el saldo del lote fue modificado por otra operación.'
      );
    }

    return actualizado;
  }

  async registrarMerma({ loteId, cantidad, motivo, usuarioRol }) {
    if (!loteId || !cantidad || cantidad <= 0 || !motivo || !motivo.trim()) {
      throw new ValidacionError('Lote, cantidad > 0 y motivo son obligatorios para merma.');
    }

    const actualizado = await this.repo.descontarLoteAtomico({
      loteId,
      cantidad,
      tipo: 'MERMA',
      motivo: motivo.trim(),
      usuarioRol,
    });

    if (!actualizado) {
      throw new StockInsuficienteError('Saldo insuficiente en el lote para registrar la merma.');
    }

    return actualizado;
  }
}

module.exports = { RegistrarSalidaService };