import { Request, Response } from 'express';
import { ConsultarHistorialService } from '../application/ConsultarHistorialService';
import { EvaluarAlertasService } from '../application/EvaluarAlertasService';
import { RegistrarLoteService } from '../application/RegistrarLoteService';
import { RegistrarSalidaService } from '../application/RegistrarSalidaService';
import { LoteVencidoError, StockInsuficienteError, ValidacionError } from '../domain/errors';
import { PostgresStockRepository } from '../persistence/PostgresStockRepository';

export class StockAlertController {
  constructor(
    private readonly alertasService: EvaluarAlertasService,
    private readonly salidaService: RegistrarSalidaService,
    private readonly loteService: RegistrarLoteService,
    private readonly historialService: ConsultarHistorialService,
    private readonly repo: PostgresStockRepository
  ) {}

  obtenerAlertas = async (_req: Request, res: Response) => {
    try {
      const alertas = await this.alertasService.ejecutar();
      res.status(200).json({ total: alertas.length, alertas });
    } catch (err) {
      this.manejarError(err, res);
    }
  };

  registrarLote = async (req: Request, res: Response) => {
    try {
      const rol = (req.header('x-user-role') || 'ENCARGADO').toUpperCase();
      const lote = await this.loteService.ejecutar({ ...req.body, usuarioRol: rol });
      res.status(201).json(lote);
    } catch (err) {
      this.manejarError(err, res);
    }
  };

  registrarSalida = async (req: Request, res: Response) => {
    try {
      const rol = (req.header('x-user-role') || 'ENCARGADO').toUpperCase();
      const lote = await this.salidaService.registrarVentaFEFO({ ...req.body, usuarioRol: rol });
      res.status(201).json({ mensaje: 'Salida registrada bajo criterio FEFO', lote });
    } catch (err) {
      this.manejarError(err, res);
    }
  };

  registrarMerma = async (req: Request, res: Response) => {
    try {
      const rol = (req.header('x-user-role') || 'ADMIN').toUpperCase();
      const lote = await this.salidaService.registrarMerma({ ...req.body, usuarioRol: rol });
      res.status(201).json({ mensaje: 'Merma registrada', lote });
    } catch (err) {
      this.manejarError(err, res);
    }
  };

  actualizarUmbral = async (req: Request, res: Response) => {
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

  consultarMovimientos = async (req: Request, res: Response) => {
    try {
      const desde = req.query.desde as string | undefined;
      const hasta = req.query.hasta as string | undefined;
      const movimientos = await this.historialService.ejecutar(desde, hasta);
      res.status(200).json({ total: movimientos.length, movimientos });
    } catch (err) {
      this.manejarError(err, res);
    }
  };

  private manejarError(err: unknown, res: Response) {
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