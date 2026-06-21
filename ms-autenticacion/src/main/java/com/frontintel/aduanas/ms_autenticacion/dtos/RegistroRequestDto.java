package com.frontintel.aduanas.ms_autenticacion.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO que transporta los datos necesarios para registrar un nuevo usuario.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistroRequestDto {

    @NotBlank(message = "El RUT o Pasaporte es obligatorio")
    @Size(max = 20, message = "El RUT no puede exceder los 20 caracteres")
    private String rut;

    @NotBlank(message = "El nombre completo es obligatorio")
    @Size(max = 100, message = "El nombre no puede exceder los 100 caracteres")
    private String nombreCompleto;

    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "El formato del correo electrónico no es válido")
    @Size(max = 100, message = "El email no puede exceder los 100 caracteres")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, max = 20, message = "La contraseña debe tener entre 6 y 20 caracteres")
    private String password;

    @NotBlank(message = "El rol es obligatorio")
    private String rol; // Se recibe como texto (VIAJERO, FUNCIONARIO, SUPERVISOR)
}