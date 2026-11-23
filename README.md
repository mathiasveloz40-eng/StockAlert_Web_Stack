# Proyecto integrador de Arquitectura de Software - Semana 5


## Qué agrega esta versión

- `GET /api/reservations` para consultar reservas.
- `POST /api/reservations` para crear una reserva.
- Validación en la aplicación de campos, fechas e información no permitida.
- `docs/openapi.yaml` como contrato de la API, también disponible en `GET /openapi.yaml`.
- Pruebas unitarias existentes para la lógica y el repositorio, más pruebas HTTP para los flujos y la publicación del contrato.
- `docs/semana-5.md` con la trazabilidad entre decisiones, código, contrato y pruebas.

## Arquitectura e implementación

```text
Cliente HTTP
    -> presentación (rutas y controlador)
    -> aplicación (casos de uso y validación)
    -> persistencia (consultas SQL)
    -> PostgreSQL
```

El contrato OpenAPI describe la interfaz que ve el cliente. El controlador traduce HTTP, la aplicación coordina el caso de uso y valida la entrada, y el repositorio ejecuta consultas parametrizadas. Consulta `docs/semana-5.md` para seguir el ejemplo archivo por archivo.

## Requisitos y preparación

- Node.js 24 o superior y npm.
- Docker Desktop con Docker Compose.
- Git, si se trabajará con el repositorio del equipo.

En PowerShell, desde la carpeta `starter-project`:

```powershell
Copy-Item .env.example .env
npm ci
docker compose up -d db
npm run dev
```

La API queda disponible en `http://localhost:3000`. El volumen de PostgreSQL ejecuta `db/init/001_create_reservations.sql` en su inicialización. `GET /health` permite comprobar que el proceso HTTP está activo.

## Explorar el contrato

Abre `http://localhost:3000/openapi.yaml` para consultar el documento servido por la API. Para visualizar y explorar sus operaciones, importa `docs/openapi.yaml` en Swagger Editor. El contrato define campos y respuestas; no reemplaza la implementación del servidor.

## Probar manualmente los flujos

Crear una reserva:

```powershell
$body = @{
  customerName = "Ana Pérez"
  resourceName = "Sala A"
  startsAt = "2026-11-10T14:00:00-05:00"
  endsAt = "2026-11-10T15:00:00-05:00"
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri http://localhost:3000/api/reservations `
  -ContentType "application/json" `
  -Body $body
```

Consultar las reservas:

```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:3000/api/reservations
```

La creación responde `201`; una entrada que no cumple las reglas responde `400`. La consulta responde `200` y devuelve la lista ordenada por fecha de inicio.

## Ejecutar las pruebas

```powershell
npm test
npm run build
```

Las pruebas unitarias y de repositorio usan dobles, sin una base de datos activa. Las pruebas HTTP ejercitan Express y las capas del flujo con un `Pool` simulado. La verificación manual con PostgreSQL complementa esas pruebas; la estrategia y su alcance se explican en `docs/semana-5.md`.

## Datos y configuración

`.env` está excluido de Git. `.env.example` contiene valores locales de demostración. No agregues contraseñas reales, tokens ni datos personales reales al repositorio.
