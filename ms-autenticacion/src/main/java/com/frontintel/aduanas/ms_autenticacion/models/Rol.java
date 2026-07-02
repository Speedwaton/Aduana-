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
     * Operador aduanero (agente) en ventanilla física que corrobora los controles.
     */
    FUNCIONARIO,

    /**
     * Policía de Investigaciones: verifica antecedentes penales, carga del
     * vehículo y situación del viajero ANTES de que el agente pueda aprobar.
     */
    PDI,

    /**
     * Personal de jefatura encargado de auditorías, reportes y métricas macro.
     */
    SUPERVISOR
}