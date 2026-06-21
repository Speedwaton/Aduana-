-- ============================================================
-- (OPCIONAL) Bases de datos del backend en MySQL / Laragon
-- ------------------------------------------------------------
-- NO es necesario ejecutar esto: cada microservicio tiene en su
-- application.properties la opción 'createDatabaseIfNotExist=true',
-- por lo que MySQL crea la base que falte automáticamente al
-- arrancar el servicio, y Hibernate crea las tablas solo.
--
-- Este script queda solo por si quieres crearlas tú mismo a mano
-- (por ejemplo desde HeidiSQL: pega y ejecuta).
-- ============================================================

CREATE DATABASE IF NOT EXISTS db_usuarios;      -- ms-autenticacion (:8081)
CREATE DATABASE IF NOT EXISTS db_tramites;      -- ms-preregistro   (:8084)
CREATE DATABASE IF NOT EXISTS db_validaciones;  -- ms-validacion    (:8085)
CREATE DATABASE IF NOT EXISTS db_operaciones;   -- ms-operaciones   (:8087)
