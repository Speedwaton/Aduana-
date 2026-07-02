package com.frontintel.aduanas.ms_validacion.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Datos que envía el oficial PDI al registrar la revisión de un trámite.
 */
@Data
public class RevisionPdiRequestDto {

    @NotBlank(message = "El ID del trámite es obligatorio")
    private String idTramite;

    @NotBlank(message = "El RUT del viajero es obligatorio")
    private String rutViajero;

    @NotBlank(message = "El resultado de antecedentes penales es obligatorio")
    @Pattern(regexp = "APROBADO|RECHAZADO", message = "antecedentesPenales debe ser APROBADO o RECHAZADO")
    private String antecedentesPenales;

    @NotBlank(message = "El resultado de la revisión del vehículo es obligatorio")
    @Pattern(regexp = "APROBADO|RECHAZADO|NO_APLICA", message = "revisionVehiculo debe ser APROBADO, RECHAZADO o NO_APLICA")
    private String revisionVehiculo;

    @Size(max = 500, message = "Las observaciones no pueden superar 500 caracteres")
    private String observaciones;

    @NotBlank(message = "El RUT del oficial PDI es obligatorio")
    private String rutPdi;
}
