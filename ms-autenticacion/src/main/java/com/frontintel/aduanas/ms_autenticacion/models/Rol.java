package com.frontintel.aduanas.ms_autenticacion.models;

/**
 * Enumeración que define los roles permitidos en el sistema.
 * Implementa el control de acceso basado en roles (RBAC).
 */
public enum Rol {
    /**
     * Ciudadano o transportista que realiza el pre-registro web o móvil.
     */
    VIAJERO,

    /**
     * Operador aduanero o policía en ventanilla física que valida los controles.
     */
    FUNCIONARIO,

    /**
     * Personal de jefatura encargado de auditorías, reportes y métricas macro.
     */
    SUPERVISOR
}