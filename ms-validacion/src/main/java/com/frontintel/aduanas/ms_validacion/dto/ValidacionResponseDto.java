package com.frontintel.aduanas.ms_validacion.dto;

import lombok.Builder;
import lombok.Data;

/**
 * DTO de respuesta para el funcionario tras validar la identidad del viajero.
 */
@Data
@Builder
public class ValidacionResponseDto {

    private String idTramite;
    private String rutDocumento;
    private String nombreDocumento;
    private String resultado;
    private String motivoRechazo;
    private boolean puedeAvanzar;
    private String mensaje;
}
