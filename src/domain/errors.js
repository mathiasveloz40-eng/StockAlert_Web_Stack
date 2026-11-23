class ValidacionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidacionError';
  }
}

class LoteVencidoError extends Error {
  constructor(message) {
    super(message);
    this.name = 'LoteVencidoError';
  }
}

class StockInsuficienteError extends Error {
  constructor(message) {
    super(message);
    this.name = 'StockInsuficienteError';
  }
}

module.exports = {
  ValidacionError,
  LoteVencidoError,
  StockInsuficienteError,
};