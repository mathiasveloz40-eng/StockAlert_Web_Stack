const { ValidacionError } = require('../domain/errors');

class ConsultarHistorialService {
  constructor(repo) {
    this.repo = repo;
  }

  async ejecutar(desde, hasta) {
    if (desde && hasta && desde > hasta) {
      throw new ValidacionError('La fecha inicial no puede ser mayor que la fecha final.');
    }
    return this.repo.consultarMovimientos(desde, hasta);
  }
}

module.exports = { ConsultarHistorialService };