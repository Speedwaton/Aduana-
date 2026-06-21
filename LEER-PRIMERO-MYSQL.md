# 🟢 Versión MySQL — Frontera Inteligente (para Laragon)

Esta carpeta es una **copia del backend adaptada a MySQL** (el que ya usas en
Laragon). Es idéntica a `D:\Aduana-principal` pero con 4 microservicios
apuntando a MySQL en vez de PostgreSQL. **Mismos puertos, misma estructura.**

> El `README.md` original describe la arquitectura general (menciona PostgreSQL);
> para **correr esta versión** sigue ESTE archivo.

---

## ✅ Lo que cambió respecto al original
- Los 4 servicios con base de datos usan **MySQL** (driver `mysql-connector-j`):
  - `ms-autenticacion` → base `db_usuarios`
  - `ms-preregistro`   → base `db_tramites`
  - `ms-validacion`    → base `db_validaciones`
  - `ms-operaciones`   → base `db_operaciones`
- Conexión: `localhost:3306`, usuario **`root`**, **sin contraseña** (default de Laragon).
- **Las bases se crean solas** (`createDatabaseIfNotExist=true`) y las tablas
  también (Hibernate `ddl-auto=update`). No tienes que crear nada a mano.

---

## ▶️ Cómo levantar todo (paso a paso)

### 1. Enciende MySQL en Laragon
Abre **Laragon → Start All** (o solo MySQL). Debe quedar escuchando en `3306`.
Ya está probado que funciona con `root` sin contraseña.

### 2. Levanta el backend
Doble clic en **`ejecutar-backend.bat`**.
- Abre una ventana por microservicio (Eureka primero, Gateway al final).
- La **primera vez tarda varios minutos** (Maven descarga dependencias).
- Cada servicio está listo cuando su ventana dice `Started ...Application in X seconds`.
- Verifica en el navegador: **http://localhost:8761** (Eureka) → deben aparecer los servicios.

### 3. Levanta el frontend
```
cd frontend
npm run dev
```
Abre solo en **http://localhost:5173**. (Las dependencias ya están instaladas.)

### 4. Para apagar el backend
Doble clic en **`detener-backend.bat`**.

---

## 🧩 Qué funciona

| Módulo | Estado | Por qué |
|--------|--------|--------|
| Login / Registro | ✅ | MySQL `db_usuarios` |
| Prerregistro + QR | ✅ | MySQL `db_tramites` |
| Trámites | ✅ | MySQL |
| Validaciones | ✅ | MySQL `db_validaciones` |
| Operaciones | ✅ | MySQL `db_operaciones` |
| Fila Virtual | ✅ | en memoria (sin BD) |
| Dashboard / Reportes | ✅ | junta datos de los demás |
| Estado Sistema | ✅ | — |
| **Mi Turno** | ✅ | ya **no usa Kafka ni Redis** |

**Notificaciones simplificadas (sin Kafka):** al crear un preregistro,
`ms-preregistro` llama directamente a `ms-notificaciones` por REST y este asigna
el turno guardándolo **en memoria**. La pantalla "Mi Turno" (rol viajero) lo
consulta por RUT. No se necesita instalar Kafka ni Redis.

---

## 🆘 Si algo falla
- **Una ventana se cierra rápido / "Communications link failure"** → MySQL no está
  encendido en Laragon, o no es `root` sin contraseña. Enciende MySQL y reintenta.
- **"Port already in use"** → ya tenías esa versión (u otra) corriendo. Usa
  `detener-backend.bat` o cierra las ventanas viejas.
- **Eureka muestra pocos servicios** → dale 1–2 minutos; cada servicio se registra
  al terminar de arrancar.
