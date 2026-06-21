package com.frontintel.aduanas.ms_autenticacion.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO que transporta las credenciales de inicio de sesión del usuario.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequestDto {

    @NotBlank(message = "El RUT o Pasaporte es obligatorio")
    private String rut;

    @NotBlank(message = "La contraseña es obligatoria")
    private String password;
}
