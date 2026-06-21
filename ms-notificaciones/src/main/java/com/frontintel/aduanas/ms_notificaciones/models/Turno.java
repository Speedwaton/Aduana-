package com.frontintel.aduanas.ms_notificaciones.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Representa un Turno en la Fila Virtual.
 * Se almacena EN MEMORIA dentro de FilaVirtualService (ya no usa Redis),
 * para mantener el sistema simple y sin dependencias externas.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Turno {

    /** RUT o pasaporte del viajero (identificador del turno). */
    private String rutViajero;

    /** Código del trámite aduanero asociado. */
    private String idTramite;

    /** Patente del vehículo para el control en los portones. */
    private String patenteVehiculo;

    /** Número de posición en la fila de atención. */
    private Long numeroTurno;

    /** Momento en que el viajero ingresó a la fila virtual. */
    private LocalDateTime fechaHoraIngreso;

    /** Estado actual: "EN_ESPERA", "LLAMADO_A_VENTANILLA", "PROCESADO". */
    private String estadoTurno;
}
