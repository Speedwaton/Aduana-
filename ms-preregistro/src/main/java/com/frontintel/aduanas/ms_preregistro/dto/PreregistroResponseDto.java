package com.frontintel.aduanas.ms_preregistro.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * DTO de respuesta tras crear un preregistro exitoso.
 * Contiene el código QR que el viajero debe presentar en el control de identidad.
 */
@Data
@Builder
public class PreregistroResponseDto {

    /** ID del trámite que funciona también como código QR */
    private String idTramite;

    /** Nombre del viajero confirmado */
    private String nombreCompleto;

    /** Código QR (mismo valor que idTramite para simplificar) */
    private String codigoQr;

    /** Mensaje de confirmación amigable para el viajero */
    private String mensaje;

    /** Estado actual: PRE_REGISTRADO */
    private String estado;

    /** Fecha y hora exacta en que se creó el preregistro */
    private LocalDateTime fechaCreacion;
}
