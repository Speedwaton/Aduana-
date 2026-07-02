package com.frontintel.aduanas.ms_autenticacion.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para el registro de personal institucional (FUNCIONARIO, PDI, SUPERVISOR).
 * A diferencia del registro público (que siempre crea VIAJERO), aquí se debe
 * presentar un código institucional secreto que autoriza el rol solicitado.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistroInstitucionalDto {

    @NotBlank(message = "El RUT es obligatorio")
    @Size(max = 20)
    private String rut;

    @NotBlank(message = "El nombre completo es obligatorio")
    @Size(max = 100)
    private String nombreCompleto;

    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "El formato del correo electrónico no es válido")
    @Size(max = 100)
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, max = 20, message = "La contraseña debe tener entre 6 y 20 caracteres")
    private String password;

    /** Rol solicitado: FUNCIONARIO, PDI o SUPERVISOR (VIAJERO no requiere esto). */
    @NotBlank(message = "El rol es obligatorio")
    private String rol;

    /** Código institucional que habilita el rol solicitado. */
    @NotBlank(message = "El código institucional es obligatorio")
    private String codigoInstitucional;
}
