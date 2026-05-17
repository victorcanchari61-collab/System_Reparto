# System Reparto - Backend

## Descripcion del proyecto

API REST SaaS multi-tenant para gestionar repartos y entregas entre empresas. Cada empresa (Company) es un tenant independiente con usuarios, roles y permisos propios. El sistema incluye tracking en tiempo real via WebSockets.

## Stack tecnologico

- **.NET 10.0** - Framework principal
- **PostgreSQL** - Base de datos principal (EF Core 10 + Npgsql)
- **MongoDB** - Tracking de eventos en tiempo real
- **Redis** - Cache distribuida
- **SignalR** - WebSockets para notificaciones en tiempo real
- **ASP.NET Core Identity** - Gestion de usuarios y roles
- **JWT Bearer** - Autenticacion

## Arquitectura

Clean Architecture en 4 capas:

```
Domain → Application → Infrastructure → Presentation
```

- `Domain/` - Entidades, value objects, interfaces de dominio
- `Application/` - Abstracciones, DTOs, comandos/queries (CQRS preparado)
- `Infrastructure/` - EF Core, Identity, JWT, servicios externos
- `Presentation/` - Controllers, SignalR Hubs

## Multi-tenancy

Cada request autenticado lleva el `CompanyId` en el JWT claim. `TenantProvider` lo extrae y EF Core aplica Global Query Filters automaticamente en todas las queries. Nunca filtrar manualmente por CompanyId en los controllers, EF Core lo hace solo.

## Autenticacion y autorizacion

- JWT Access Token (60 min) + Refresh Token (7 dias)
- Refresh tokens almacenados como hash SHA256 en la tabla `refresh_tokens`
- 20 permisos definidos en `Application/Authorization/SystemPermissions.cs`
- Cada permiso tiene una Policy de ASP.NET Core con el mismo nombre (ej. `"users.view"`)
- Los permisos se asignan a Roles, y los roles a usuarios

## Modulos de permisos

| Modulo | Permisos |
|--------|----------|
| companies | view, update |
| users | view, create, update |
| roles | view, create, update |
| permissions | view |
| orders | view, create, assign, cancel |
| drivers | view, create, update |
| hr | employees.view, employees.create |
| erp | invoices.view, invoices.emit |

## Endpoints implementados

### Auth (`/api/auth`)
- `POST /register-company` - Crea empresa + admin + rol + permisos (transaccion ACID)
- `POST /login` - Login con email + password
- `POST /refresh` - Renueva par de tokens
- `POST /logout` - Revoca refresh token
- `GET /me` - Perfil del usuario autenticado

### Users (`/api/users`) - Requieren autorizacion
- `GET /` - Listar usuarios del tenant (`users.view`)
- `GET /{id}` - Obtener usuario (`users.view`)
- `POST /` - Crear usuario (`users.create`)
- `PUT /{id}` - Actualizar usuario (`users.update`)
- `DELETE /{id}` - Activar/desactivar usuario (`users.update`)

### SignalR (`/hubs/delivery-tracking`)
- `JoinOrderTrackingAsync(orderId)` / `LeaveOrderTrackingAsync(orderId)`
- `JoinCourierTrackingAsync(courierId)` / `LeaveCourierTrackingAsync(courierId)`
- Server push: `OrderStatusChanged`, `CourierLocationChanged`

## Modulos pendientes de implementar

Las carpetas `Modules/Deliveries/`, `Modules/ERP/` y `Modules/HR/` estan creadas pero vacias. Son los proximos modulos funcionales del sistema.

## Integraciones externas configuradas

- **WhatsApp** - Notificaciones a clientes
- **Gmail** - Envio de correos
- **SUNAT** - Facturacion electronica peruana
- **RENIEC** - Validacion de identidad peruana

## Comandos utiles

```bash
# Ejecutar backend
cd Reparto-Backend
dotnet run

# Aplicar migraciones
dotnet ef database update

# Crear nueva migracion
dotnet ef migrations add NombreMigracion

# Ejecutar frontend
cd RepartoWeb
npm run dev
```

## Configuracion local

Los secrets de desarrollo estan en `appsettings.Development.json` (ignorado por git). Requiere:
- PostgreSQL en `localhost:5432` con base de datos `reparto_dev`
- MongoDB en `localhost:27017`
- Redis en `localhost:6379`
