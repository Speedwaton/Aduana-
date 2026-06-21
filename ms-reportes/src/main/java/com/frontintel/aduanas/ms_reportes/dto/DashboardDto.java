package com.frontintel.aduanas.ms_reportes.dto;

import lombok.Builder;
import lombok.Data;

/**
 * DTO con las métricas consolidadas del dashboard del funcionario.
 * Refleja los 4 KPIs principales de la imagen del prototipo.
 */
@Data
@Builder
public class DashboardDto {

    /** Total de viajeros procesados hoy */
    private long viajeroHoy;

    /** Variación porcentual respecto a ayer */
    private String variacionViajeros;

    /** Total de vehículos procesados hoy */
    private long vehiculosHoy;

    /** Variación porcentual respecto a ayer */
    private String variacionVehiculos;

    /** Total de trámites procesados hoy */
    private long tramitesHoy;

    /** Variación porcentual respecto a ayer */
    private String variacionTramites;

    /** Porcentaje de validaciones exitosas */
    private String tasaValidacionExitosa;

    /** Cuántos vehículos hay en la fila virtual ahora mismo */
    private long vehiculosEnFila;

    /** Alertas y notificaciones activas */
    private java.util.List<AlertaDto> alertas;
}
