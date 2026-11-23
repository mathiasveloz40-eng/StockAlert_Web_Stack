const express = require('express');
const { ConsultarHistorialService } = require('./application/ConsultarHistorialService');
const { EvaluarAlertasService } = require('./application/EvaluarAlertasService');
const { RegistrarLoteService } = require('./application/RegistrarLoteService');
const { RegistrarSalidaService } = require('./application/RegistrarSalidaService');
const { pool } = require('./persistence/db');
const { PostgresStockRepository } = require('./persistence/PostgresStockRepository');
const { StockAlertController } = require('./presentation/StockAlertController');
const { crearRutasStockAlert } = require('./presentation/stockAlertRoutes');

function createApp() {
  const app = express();
  app.use(express.json());

  const repo = new PostgresStockRepository(pool);
  const controller = new StockAlertController(
    new EvaluarAlertasService(repo),
    new RegistrarSalidaService(repo),
    new RegistrarLoteService(repo),
    new ConsultarHistorialService(repo),
    repo
  );

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'stockalert-web' });
  });

  app.use('/api', crearRutasStockAlert(controller, repo));
  return app;
}

module.exports = { createApp };