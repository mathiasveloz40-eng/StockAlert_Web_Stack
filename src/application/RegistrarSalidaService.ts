import { StockInsuficienteError, ValidacionError } from '../domain/errors';
import { PostgresStockRepository } from '../persistence/PostgresStockRepository';

export class RegistrarSalidaService {
  constructor(private readonly repo: PostgresStockRepository) {}

  async registrarVentaFEFO(input: {
    productoId: number;
    cantidad: number;
    usuarioRol: string;
  }) {
    if (!input.productoId || input.cantidad <= 0) {
      throw new ValidacionError('Producto y cantidad > 0 son obligatorios.');
    }

    const candidatos = await this.repo.obtenerLotesDisponiblesFEFO(input.productoId);
    const loteFEFO = candidatos.find((l) => l.saldo >= input.cantidad);

    if (!loteFEFO) {
      throw new StockInsuficienteError(
        'No existe un lote vigente con saldo suficiente para cubrir la salida.'
      );
    }

    const actualizado = await this.repo.descontarLoteAtomico({
      loteId: loteFEFO.id,
      cantidad: input.cantidad,
      tipo: 'VENTA',
      motivo: 'Venta en mostrador (FEFO)',
      usuarioRol: input.usuarioRol,
    });

    if (!actualizado) {
      throw new StockInsuficienteError(
        'Conflicto de concurrencia: el saldo del lote fue modificado por otra operación.'
      );
    }

    return actualizado;
  }

  async registrarMerma(input: {
    loteId: number;
    cantidad: number;
    motivo: string;
    usuarioRol: string;
  }) {
    if (!input.loteId || input.cantidad <= 0 || !input.motivo?.trim()) {
      throw new ValidacionError('Lote, cantidad > 0 y motivo son obligatorios para merma.');
    }

    const actualizado = await this.repo.descontarLoteAtomico({
      loteId: input.loteId,
      cantidad: input.cantidad,
      tipo: 'MERMA',
      motivo: input.motivo.trim(),
      usuarioRol: input.usuarioRol,
    });

    if (!actualizado) {
      throw new StockInsuficienteError('Saldo insuficiente en el lote para registrar la merma.');
    }

    return actualizado;
  }
}