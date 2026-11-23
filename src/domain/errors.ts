export class ValidacionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidacionError';
  }
}

export class LoteVencidoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LoteVencidoError';
  }
}

export class StockInsuficienteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StockInsuficienteError';
  }
}