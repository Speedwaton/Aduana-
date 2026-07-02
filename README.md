# 🛂 Frontera Inteligente Los Libertadores

Sistema de **microservicios Spring Boot + frontend React** para la gestión y
control del paso fronterizo Los Libertadores (Chile–Argentina).

Esta versión usa **MySQL** como base de datos y **no requiere Kafka ni Redis**:
las notificaciones/turnos se manejan por REST y en memoria, para que cualquiera
pueda levantarlo sin instalar infraestructura compleja.

---

## 🏗️ Arquitectura

```
                          ┌──────────────────┐
   Frontend (React/Vite)  │   API GATEWAY    │ :8080
   http://localhost:5173 →│  (punto único)   │
                          └────────┬─────────┘
                                   │  (descubre servicios vía Eureka :8761)
   ┌───────────────┬───────────────┼───────────────┬───────────────┐
   ▼               ▼               ▼               ▼               ▼
ms-autenticacion ms-preregistro ms-validacion ms-operaciones ms-fila-virtual
   :8081            :8084           :8085          :8087          :8082
                     │ REST
                     ▼
              ms-notificaciones :8083   ms-reportes :8086
              (turnos en memoria)       (dashboard)
```

| Servicio            | Puerto | Descripción                                        | Base de datos     |
|---------------------|--------|----------------------------------------------------|-------------------|
| `eureka-server`     | 8761   | Descubrimiento de servicios                        | —                 |
| `api-gateway`       | 8080   | Punto de entrada único (enruta a todos)            | —                 |
| `ms-autenticacion`  | 8081   | Login y registro (JWT)                             | `db_usuarios`     |
| `ms-fila-virtual`   | 8082   | Cola de vehículos en espera                        | — (en memoria)    |
| `ms-notificaciones` | 8083   | Asigna turnos del viajero (REST, en memoria)       | — (en memoria)    |
| `ms-preregistro`    | 8084   | Prerregistro + código QR + **documentos del viajero** | `db_tramites`     |
| `ms-validacion`     | 8085   | Validación de identidad + **revisión PDI**        | `db_validaciones` |
| `ms-reportes`       | 8086   | Dashboard con métricas                             | —                 |
| `ms-operaciones`    | 8087   | Revisión aduanera de vehículos                     | `db_operaciones`  |

> Las bases de datos se **crean solas** la primera vez (`createDatabaseIfNotExist=true`)
> y Hibernate genera las tablas automáticamente (`ddl-auto=update`).

---

## ✅ Requisitos previos

Instala esto en el PC donde vayas a correr el proyecto:

| Herramienta | Versión | Para qué |
|-------------|---------|----------|
| **Java JDK** | 17 o superior | compilar y ejecutar los microservicios |
| **Maven**    | 3.8+         | construir el backend (comando `mvn`) |
| **Node.js**  | 18+          | ejecutar el frontend (`npm`) |
| **MySQL**    | 8.x          | base de datos (recomendado vía **Laragon**) |

Verifica que estén en el PATH:
```bash
java -version
mvn -version
node -v
```

---

## 🗄️ 1. Preparar la base de datos (MySQL)

El proyecto está configurado para **MySQL en `localhost:3306`, usuario `root`, sin contraseña**
(que es el valor por defecto de **Laragon**).

1. Abre **Laragon** → **Start All** (o inicia solo MySQL).
2. ¡Listo! No tienes que crear las bases manualmente: se crean solas al arrancar.

> **¿Tu MySQL usa otra contraseña/usuario?** Edita en estos 4 archivos las líneas
> `spring.datasource.username` / `spring.datasource.password`:
> `ms-autenticacion`, `ms-preregistro`, `ms-validacion`, `ms-operaciones`
> (`src/main/resources/application.properties`).
>
> Si prefieres crear las bases a mano, ejecuta el script
> [`crear-bases-datos.sql`](crear-bases-datos.sql).

---

## ▶️ 2. Levantar el BACKEND

### Opción A — Script automático (Windows, recomendado)
Con MySQL ya encendido, doble clic en:
```
ejecutar-backend.bat
```
Abre una ventana por microservicio (Eureka primero, Gateway al final). Cada servicio
está listo cuando su ventana muestra `Started ...Application in X seconds`.

Para apagar todo: `detener-backend.bat`.

### Opción B — Manual (cualquier sistema)
Respeta el orden. **Primero Eureka, al final el Gateway:**
```bash
cd eureka-server     && mvn spring-boot:run   # 1) :8761  (espera a que arranque)
cd ms-autenticacion  && mvn spring-boot:run   # 2) :8081
cd ms-preregistro    && mvn spring-boot:run   # 3) :8084
cd ms-notificaciones && mvn spring-boot:run   # 4) :8083
cd ms-validacion     && mvn spring-boot:run   # 5) :8085
cd ms-operaciones    && mvn spring-boot:run   # 6) :8087
cd MS-Fila-Virtual   && mvn spring-boot:run   # 7) :8082
cd ms-reportes       && mvn spring-boot:run   # 8) :8086
cd api-gateway       && mvn spring-boot:run   # 9) :8080  (último)
```
> La **primera vez** Maven descarga dependencias: puede tardar varios minutos por servicio.

Verifica en el navegador que todos se registraron: **http://localhost:8761** (panel de Eureka).

---

## 🖥️ 3. Levantar el FRONTEND

```bash
cd frontend
npm install      # solo la primera vez
npm run dev
```
Abre en **http://localhost:5173**.

El frontend habla con el backend a través de un **proxy** (configurado en `vite.config.js`):
todas las llamadas a `/api/**` se reenvían al API Gateway (`:8080`), así no hay problemas de CORS.

---

## 🔒 Registro seguro por rol

El rol **NO se elige libremente** en el registro (sería inseguro):

- **"Soy viajero"** (registro público): crea SIEMPRE cuentas `VIAJERO`. Aunque
  alguien manipule la petición, el backend fuerza el rol.
- **"Acceso institucional"**: el personal se registra presentando el **código
  secreto** de su rol, configurado en `ms-autenticacion/src/main/resources/application.properties`:

| Rol | Código (por defecto) |
|-----|----------------------|
| `FUNCIONARIO` (agente aduanero) | `AGENTE-ADUANA-2026` |
| `PDI` (Policía de Investigaciones) | `PDI-CHILE-2026` |
| `SUPERVISOR` | `SUPERVISOR-FRONTERA-2026` |

> En producción estos códigos irían en variables de entorno, no en el repositorio.

---

## 👥 Roles y qué ve cada uno

| Rol           | Acceso                                                                        |
|---------------|-------------------------------------------------------------------------------|
| `VIAJERO`     | Prerregistro, Mis Trámites (con subida de documentos), **Mi Turno**          |
| `PDI`         | **Revisión PDI**: verifica antecedentes penales y carga de cada viajero       |
| `FUNCIONARIO` | **Control Viajeros** (tablero en vivo), Validaciones (cola de llegada), Fila, Operaciones, Dashboard, Reportes |
| `SUPERVISOR`  | Todo lo anterior + Estado del Sistema                                         |

---

## 🚦 El flujo completo (la idea del proyecto: agilizar la frontera)

Todo el trámite se hace **desde la casa del viajero**; en la frontera el agente
solo corrobora lo ya verificado:

```
CASA      1. El VIAJERO se registra y crea su prerregistro (recibe QR + turno)
          2. Sube sus documentos: antecedentes penales, licencia, permiso, seguro
             (PDF o imagen, se guardan en MySQL)

PDI       3. Ve la cola de trámites por verificar, abre los documentos del viajero
          4. Marca: antecedentes ✓/✗, vehículo/carga ✓/✗ + observaciones
             → el resultado queda visible para el agente

FRONTERA  5. El AGENTE ve su tablero "Control Viajeros" EN VIVO (se refresca solo):
             cada viajero con su estado PDI y sus documentos
          6. CANDADO: solo puede APROBAR si la PDI aprobó (el backend responde
             409 si se intenta saltar)
          7. En "Validaciones" (llegada a ventanilla): clic en el viajero → los
             datos del QR se cargan solos → compara con el carnet físico → 1 clic
```

**Demo sugerida (3 sesiones):**
1. **Viajero** (registro público) → Prerregistro → Mis Trámites → subir un PDF de antecedentes.
2. **PDI** (código `PDI-CHILE-2026`) → Revisión PDI → abrir el trámite, ver el documento, aprobar.
3. **Funcionario** (código `AGENTE-ADUANA-2026`) → Control Viajeros: el botón aprobar ya está habilitado → Validaciones: validar identidad en 1 clic.

---

## 🔌 ¿Cómo funcionan las notificaciones sin Kafka?

En lugar de un bus de eventos (Kafka) y caché (Redis), se simplificó así:

```
ms-preregistro  ──REST POST /api/notificaciones/turno──▶  ms-notificaciones
   (guarda en MySQL)                                       (guarda el turno EN MEMORIA)
```

Cuando se crea un preregistro, `ms-preregistro` avisa a `ms-notificaciones` por REST
(vía Eureka) para asignar el turno. La pantalla **Mi Turno** lo consulta por RUT.
Cero dependencias externas.

---

## 🆘 Problemas comunes

| Síntoma | Causa / solución |
|---------|------------------|
| Una ventana se cierra y dice `Communications link failure` | **MySQL apagado**. Inicia Laragon/MySQL. |
| `Access denied for user 'root'` | Tu MySQL tiene contraseña. Edítala en los 4 `application.properties`. |
| El dashboard muestra `Service Unavailable` | Aún no levantó `ms-reportes` o el gateway no lo "ve" todavía. Espera 1 min y dale **Reintentar**. |
| `Port already in use` | Ya tenías el backend corriendo. Usa `detener-backend.bat` o cierra las ventanas. |
| El frontend no carga datos | Revisa que el **API Gateway (:8080)** esté arriba. |

---

## 🛠️ Tecnologías

- **Backend:** Spring Boot 3.5, Spring Cloud Gateway, Netflix Eureka, Spring Data JPA, MySQL, JWT, Lombok
- **Frontend:** React 18, Vite, lucide-react, react-qr-code
- **Build:** Maven (backend), npm (frontend)
