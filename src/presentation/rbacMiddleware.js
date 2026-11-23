const { ROLES } = require('../domain/models');

function exigirRolAdmin(repo) {
  return async (req, res, next) => {
    const rol = (req.header('x-user-role') || 'ANONIMO').toUpperCase();
    if (rol !== ROLES.ADMIN) {
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

module.exports = { exigirRolAdmin };