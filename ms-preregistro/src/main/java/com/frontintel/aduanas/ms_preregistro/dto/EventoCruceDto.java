package com.frontintel.aduanas.ms_preregistro.dto;

import lombok.Builder;
import lombok.Data;

/**
 * DTO que se publica al tópico de Kafka 'tramites-aduanas-topic'.
 * Es consumido por ms-notificaciones para asignar el turno en la fila virtual.
 */
@Data
@Builder
public class EventoCruceDto {

    private String idTramite;
    private String rutViajero;
    private String correoViajero;
    private String patenteVehiculo;
    private String estado;
}
