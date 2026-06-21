package com.frontintel.aduanas.ms_validacion.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO con los datos capturados del escaneo del documento de identidad.
 * El funcionario escanea la cédula/pasaporte y envía estos datos al sistema.
 */
@Data
public class ValidacionRequestDto {

    @NotBlank(message = "El ID del trámite (código QR) es obligatorio")
    private String idTramite;

    @NotBlank(message = "El RUT o Pasaporte del documento es obligatorio")
    private String rutDocumento;

    @NotBlank(message = "El nombre del documento es obligatorio")
    private String nombreDocumento;

    @NotBlank(message = "La nacionalidad es obligatoria")
    private String nacionalidad;

    private String fechaNacimiento;

    @NotBlank(message = "El RUT del funcionario es obligatorio")
    private String rutFuncionario;
}
