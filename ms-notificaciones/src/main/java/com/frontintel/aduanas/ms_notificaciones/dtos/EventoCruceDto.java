package com.frontintel.aduanas.ms_notificaciones.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * DTO que representa el evento de cruce recibido desde Apache Kafka.
 * Transporta los datos esenciales para registrar el turno y gatillar la notificación.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventoCruceDto implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * Identificador único del trámite de aduana generado por ms-operaciones.
     */
    private String idTramite;

    /**
     * RUT o Pasaporte del conductor/viajero.
     */
    private String rutViajero;

    /**
     * Dirección de correo electrónico del viajero para despachar la confirmación.
     */
    private String correoViajero;

    /**
     * Patente o placa única del vehículo que realizará el cruce por la frontera.
     */
    private String patenteVehiculo;

    /**
     * Estado actual de la operación. Ejemplos: "PRE_REGISTRADO", "APROBADO", "CANCELADO".
     */
    private String estado;
}
