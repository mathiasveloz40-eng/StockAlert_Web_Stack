# Semana 5 - Arquitectura, implementación, API y pruebas

## Propósito didáctico

Relacionar una decisión arquitectónica con los archivos que la implementan; describir la interfaz HTTP mediante un contrato OpenAPI; y comprobar con Vitest que los flujos y respuestas se comportan como se documentaron.

## Trazabilidad de una decisión

| Elemento | Ejemplo del proyecto | Ubicación |
|---|---|---|
| Necesidad funcional | El cliente registra una reserva y recibe un resultado observable. | `POST /api/reservations` |
| Decisión arquitectónica | La presentación recibe HTTP; la aplicación valida y coordina; persistencia encapsula SQL. | `src/presentation/`, `src/application/`, `src/persistence/` |
| Restricción de datos | La fecha final debe ser posterior a la inicial. | Aplicación y `reservations_valid_time` en PostgreSQL |
| Contrato público | Campos de entrada, formato de fechas, respuestas y errores. | `docs/openapi.yaml` |
| Verificación | Casos válidos, inválidos, consulta de reservas y acceso al contrato. | `tests/` |

La arquitectura expresa límites y responsabilidades. La implementación realiza esos límites con módulos y llamadas. Las pruebas aportan evidencia de que la implementación conserva las reglas observables. Un hallazgo en una prueba puede llevar al equipo a ajustar el código o revisar una decisión.

## Recorrido de implementación

### Crear una reserva

1. `src/presentation/reservationRoutes.ts` registra la ruta HTTP.
2. `src/presentation/ReservationController.ts` llama al caso de uso y convierte el resultado en `201` o el error de entrada en `400`.
3. `src/application/CreateReservationService.ts` valida el cuerpo, normaliza texto y fechas y verifica que `endsAt` sea posterior a `startsAt`.
4. `src/persistence/PostgresReservationRepository.ts` escribe con parámetros SQL y traduce la fila al modelo TypeScript.
5. `db/init/001_create_reservations.sql` declara la tabla y repite la regla temporal como restricción de datos.

### Consultar reservas

`GET /api/reservations` recorre ruta, controlador, caso de uso `ListReservationsService` y repositorio. El repositorio ordena por fecha de inicio e identificador, y el controlador responde `200` con `{ "data": [...] }`.

## API y contrato OpenAPI

Una API es la interfaz por la que otro programa solicita operaciones y recibe respuestas. El contrato hace explícito el acuerdo entre consumidor y servidor: métodos, rutas, campos, formatos, códigos y estructuras de respuesta.

`docs/openapi.yaml` usa OpenAPI 3.0.3 para describir `GET /api/reservations`, `POST /api/reservations` y `GET /health`. La aplicación sirve ese mismo archivo en `GET /openapi.yaml`. OpenAPI describe el contrato; Express y las capas del proyecto implementan el comportamiento.

Puntos que se pueden revisar en clase:

- `CreateReservation`: cuatro campos requeridos, fechas `date-time` y campos adicionales rechazados.
- `Reservation`: agrega `id` y `createdAt` al contenido de la solicitud.
- `201`: reserva creada; `400`: entrada inválida; `500`: error interno.
- Importa el archivo en Swagger Editor para recorrer rutas y esquemas; contrasta cada respuesta descrita con el controlador y las pruebas.

## Estrategia de pruebas automatizadas

| Nivel / enfoque | Qué comprueba | Ejemplo |
|---|---|---|
| Unitario | Una regla o caso de uso aislado. | El servicio rechaza un intervalo inválido sin llamar al repositorio. |
| Repositorio | SQL parametrizado y conversión de filas. | Los parámetros y nombres de columnas se mapean a `Reservation`. |
| HTTP de integración | La colaboración entre Express, rutas, controladores, aplicación y persistencia simulada. | `POST` devuelve la forma acordada; `GET` lista y ordena reservas. |
| Contrato | El documento OpenAPI está publicado y sus campos y códigos corresponden a la interfaz implementada. | La prueba obtiene `/openapi.yaml`; pruebas HTTP verifican `201`, `200` y `400`. |
| Recorrido manual | El sistema completo con PostgreSQL real. | Levantar Docker y enviar `POST` y `GET` con PowerShell. |

Las pruebas HTTP usan un `Pool` simulado para poder ejecutarse sin Docker. No demuestran el comportamiento real de PostgreSQL; por eso se complementan con la comprobación manual del flujo conectado a la base de datos. Las pruebas deben ser independientes, cubrir casos válidos y errores, y comprobar resultados observables además de ejecutar código.

Comandos de ejecución desde la raíz del proyecto:

```powershell
npm test
npm run build
```

## Actividad sugerida para la clase

1. Abrir `docs/openapi.yaml` y localizar la entrada de `POST /api/reservations`.
2. Seguir una petición por ruta, controlador, aplicación, repositorio y tabla.
3. Comparar el esquema de entrada con la validación de `CreateReservationService`.
4. Ejecutar las pruebas y relacionar cada resultado con su nivel y archivo.
5. Cambiar un campo o código de respuesta de forma deliberada, observar la discrepancia y actualizar contrato, implementación y pruebas en conjunto.
6. Levantar PostgreSQL y repetir los flujos HTTP para distinguir la prueba con dobles de una prueba contra infraestructura real.

## Alcance de esta versión

La implementación de semana 5 mantiene el monolito en capas introducido en semana 4. No reorganiza el sistema como arquitectura hexagonal ni agrega API Gateway; esos temas corresponden a etapas posteriores del sílabo.
