import { ValidacionError } from '../domain/errors';
import { PostgresStockRepository } from '../persistence/PostgresStockRepository';

export class ConsultarHistorialService {
  constructor(private readonly repo: PostgresStockRepository) {}

  async ejecutar(desde?: string, hasta?: string) {
    if (desde && hasta && desde > hasta) {
      throw new ValidacionError('La fecha inicial no puede ser mayor que la fecha final.');
    }
    return this.repo.consultarMovimientos(desde, hasta);
  }
}