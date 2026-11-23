# StockAlert Web — Monolito en Capas (Arquitectura de Software)

Sistema web centralizado para el control de inventario por lotes, registro ágil de salidas bajo criterio **FEFO** (*First Expired, First Out*) y alertas tempranas de vencimiento y stock crítico en pequeños comercios.

## Arquitectura y Estructura del Proyecto

El sistema sigue un estilo **monolítico organizado en capas** con dependencias estrictamente descendentes (`Presentation -> Application -> Domain <- Persistence`):

- `db/init/001_create_stockalert.sql`: Esquema relacional PostgreSQL (`productos`, `lotes`, `movimientos`, `auditoria`) con restricción `CHECK (saldo >= 0)` y datos semilla.
- `src/domain/`: Modelos, constantes de estado y errores de negocio independientes de frameworks.
- `src/persistence/`: Repositorio PostgreSQL (`pg`) con consultas parametrizadas, selección FEFO y actualización atómica condicional contra concurrencia.
- `src/application/`: Servicios de casos de uso (`EvaluarAlertasService`, `RegistrarSalidaService`, `RegistrarLoteService`, `ConsultarHistorialService`).
- `src/presentation/`: Rutas Express, controladores HTTP y middleware de autorización por roles (`x-user-role: ADMIN | ENCARGADO`).
- `docs/openapi.yaml`: Especificación OpenAPI 3.0 de los endpoints.
- `docs/bitacora.md`: Registro de incrementos y trazabilidad con los drivers arquitectónicos.
- `tests/`: Pruebas unitarias, de persistencia y de API con Vitest y Supertest.

## Requisitos Previos

- **Node.js** v18 o superior
- **Docker** y **Docker Compose**

## Instalación y Ejecución

1. **Clonar el repositorio y entrar al directorio:**
   ```bash
   git clone [https://github.com/mathiasveloz40-eng/StockAlert_Web_Stack.git](https://github.com/mathiasveloz40-eng/StockAlert_Web_Stack.git)
   cd StockAlert_Web_Stack