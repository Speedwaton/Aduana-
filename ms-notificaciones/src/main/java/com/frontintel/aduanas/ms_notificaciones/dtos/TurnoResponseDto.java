package com.frontintel.aduanas.ms_notificaciones.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de respuesta para las consultas HTTP sobre el estado del turno.
 * Proporciona información amigable para el usuario en la interfaz móvil o web.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TurnoResponseDto {

    /**
     * RUT o documento del viajero consultante.
     */
    private String rutViajero;

    /**
     * El número correlativo de atención asignado en la fila.
     */
    private Long numeroTurno;

    /**
     * Estado actual del turno simplificado (ej: "EN ESPERA", "LLAMADO A VENTANILLA").
     */
    private String estadoTurno;

    /**
     * Cantidad exacta de vehículos que se encuentran adelante en la cola.
     * Campo calculado dinámicamente en el backend.
     */
    private long vehiculosAdelante;

    /**
     * Mensaje informativo o alerta del estado del paso Los Libertadores 
     * (ej: "Tránsito normal", "Paso cerrado por condiciones climáticas").
     */
    private String mensajeInformativo;
}
