package com.frontintel.aduanas.ms_operaciones.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO para solicitar la revisión aduanera de un vehículo.
 */
@Data
public class RevisionRequestDto {

    @NotBlank(message = "La patente es obligatoria")
    private String patente;

    private String tipoVehiculo;
    private String rutConductor;

    @NotBlank(message = "El RUT del funcionario es obligatorio")
    private String rutFuncionario;

    private String observaciones;
}
