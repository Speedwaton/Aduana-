package com.frontintel.aduanas.ms_reportes.dto;

import lombok.Builder;
import lombok.Data;

/**
 * DTO que representa una alerta o notificación para el panel del funcionario.
 */
@Data
@Builder
public class AlertaDto {

    /** Nivel: CRITICO, ADVERTENCIA, INFO */
    private String nivel;

    /** Descripción de la alerta */
    private String mensaje;

    /** Tiempo transcurrido desde la alerta (ej: "Hace 5 min") */
    private String tiempoTranscurrido;
}
