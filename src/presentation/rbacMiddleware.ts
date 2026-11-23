import { NextFunction, Request, Response } from 'express';
import { PostgresStockRepository } from '../persistence/PostgresStockRepository';

export function exigirRolAdmin(repo: PostgresStockRepository) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const rol = (req.header('x-user-role') || 'ANONIMO').toUpperCase();
    if (rol !== 'ADMIN') {
      await repo.registrarAuditoria(
        rol,
        req.originalUrl,
        req.method,
        'Intento de acceso denegado (requiere rol ADMIN)'
      );
      res.status(403).json({
        error: 'Acceso denegado: operación exclusiva para el rol ADMIN.',
      });
      return;
    }
    next();
  };
}