import { Router } from 'express';
import { PostgresStockRepository } from '../persistence/PostgresStockRepository';
import { exigirRolAdmin } from './rbacMiddleware';
import { StockAlertController } from './StockAlertController';

export function crearRutasStockAlert(
  controller: StockAlertController,
  repo: PostgresStockRepository
): Router {
  const router = Router();
  const soloAdmin = exigirRolAdmin(repo);

  router.get('/alertas', controller.obtenerAlertas); // CU-01
  router.post('/salidas', controller.registrarSalida); // CU-02 (Venta FEFO)
  router.post('/mermas', soloAdmin, controller.registrarMerma); // CU-02 + QA-03
  router.post('/lotes', controller.registrarLote); // CU-03
  router.put('/productos/:id/umbral', soloAdmin, controller.actualizarUmbral); // QA-03
  router.get('/movimientos', controller.consultarMovimientos); // CU-04

  return router;
}