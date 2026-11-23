// src/app.ts
import express from 'express';
import { ConsultarHistorialService } from './application/ConsultarHistorialService';
import { EvaluarAlertasService } from './application/EvaluarAlertasService';
import { RegistrarLoteService } from './application/RegistrarLoteService';
import { RegistrarSalidaService } from './application/RegistrarSalidaService';
import { pool } from './persistence/db';
import { PostgresStockRepository } from './persistence/PostgresStockRepository';
import { StockAlertController } from './presentation/StockAlertController';
import { crearRutasStockAlert } from './presentation/stockAlertRoutes';

export function createApp() {
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