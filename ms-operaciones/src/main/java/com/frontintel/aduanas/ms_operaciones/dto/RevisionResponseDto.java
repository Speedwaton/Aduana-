package com.frontintel.aduanas.ms_operaciones.dto;

import lombok.Builder;
import lombok.Data;

/**
 * DTO de respuesta tras la revisión aduanera de un vehículo.
 */
@Data
@Builder
public class RevisionResponseDto {

    private String patente;
    private String controlAduanero;
    private boolean permisoParaCruzar;
    private String motivoDetencion;
    private String mensaje;
}
