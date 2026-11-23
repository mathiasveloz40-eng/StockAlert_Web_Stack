const { LoteVencidoError, StockInsuficienteError, ValidacionError } = require('../domain/errors');
const { ROLES } = require('../domain/models');

class StockAlertController {
  constructor(alertasService, salidaService, loteService, historialService, repo) {
    this.alertasService = alertasService;
    this.salidaService = salidaService;
    this.loteService = loteService;
    this.historialService = historialService;
    this.repo = repo;
  }

  obtenerAlertas = async (_req, res) => {
    try {
      const alertas = await this.alertasService.ejecutar();
      res.status(200).json({ total: alertas.length, alertas });
    } catch (err) {
      this.manejarError(err, res);
    }
  };

  registrarLote = async (req, res) => {
    try {
      const rol = (req.header('x-user-role') || ROLES.ENCARGADO).toUpperCase();
      const lote = await this.loteService.ejecutar({ ...req.body, usuarioRol: rol });
      res.status(201).json(lote);
    } catch (err) {
      this.manejarError(err, res);
    }
  };

  registrarSalida = async (req, res) => {
    try {
      const rol = (req.header('x-user-role') || ROLES.ENCARGADO).toUpperCase();
      const lote = await this.salidaService.registrarVentaFEFO({ ...req.body, usuarioRol: rol });
      res.status(201).json({ mensaje: 'Salida registrada bajo criterio FEFO', lote });
    } catch (err) {
      this.manejarError(err, res);
    }
  };

  registrarMerma = async (req, res) => {
    try {
      const rol = (req.header('x-user-role') || ROLES.ADMIN).toUpperCase();
      const lote = await this.salidaService.registrarMerma({ ...req.body, usuarioRol: rol });
      res.status(201).json({ mensaje: 'Merma registrada', lote });
    } catch (err) {
      this.manejarError(err, res);
    }
  };

  actualizarUmbral = async (req, res) => {
    try {
      const productoId = Number(req.params.id);
      const { stockMinimo, diasPreaviso } = req.body;
      if (stockMinimo < 0 || diasPreaviso < 0) {
        throw new ValidacionError('Los umbrales no pueden ser negativos.');
      }
      const ok = await this.repo.actualizarUmbralProducto(productoId, stockMinimo, diasPreaviso);
      if (!ok) {
        res.status(404).json({ error: 'Producto no encontrado.' });
        return;
      }
      res.status(200).json({ mensaje: 'Umbrales actualizados correctamente.' });
    } catch (err) {
      this.manejarError(err, res);
    }
  };

  consultarMovimientos = async (req, res) => {
    try {
      const { desde, hasta } = req.query;
      const movimientos = await this.historialService.ejecutar(desde, hasta);
      res.status(200).json({ total: movimientos.length, movimientos });
    } catch (err) {
      this.manejarError(err, res);
    }
  };

  manejarError(err, res) {
    if (err instanceof ValidacionError) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (err instanceof StockInsuficienteError) {
      res.status(409).json({ error: err.message });
      return;
    }
    if (err instanceof LoteVencidoError) {
      res.status(422).json({ error: err.message });
      return;
    }
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

module.exports = { StockAlertController };