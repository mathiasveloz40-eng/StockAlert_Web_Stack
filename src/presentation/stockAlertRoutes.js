
const express = require('express');
const { exigirRolAdmin } = require('./rbacMiddleware');

function crearRutasStockAlert(controller, repo) {
  const router = express.Router();
  const soloAdmin = exigirRolAdmin(repo);

  router.get('/alertas', controller.obtenerAlertas);
  router.post('/salidas', controller.registrarSalida);
  router.post('/mermas', soloAdmin, controller.registrarMerma);
  router.post('/lotes', controller.registrarLote);
  router.put('/productos/:id/umbral', soloAdmin, controller.actualizarUmbral);
  router.get('/movimientos', controller.consultarMovimientos);

  return router;
}

module.exports = { crearRutasStockAlert };