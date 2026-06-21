package com.frontintel.aduanas.ms_preregistro.dto;

import com.frontintel.aduanas.ms_preregistro.model.MotivoViaje;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

/**
 * DTO para recibir los datos del viajero al crear un preregistro.
 * Se envía desde la app móvil o el portal web.
 */
@Data
public class PreregistroRequestDto {

    @NotBlank(message = "El RUT o Pasaporte es obligatorio")
    private String rutViajero;

    @NotBlank(message = "El nombre completo es obligatorio")
    @Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres")
    private String nombreCompleto;

    @NotBlank(message = "La nacionalidad es obligatoria")
    private String nacionalidad;

    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "El formato del correo electrónico no es válido")
    private String correoElectronico;

    @NotNull(message = "La fecha de ingreso es obligatoria")
    @Future(message = "La fecha de ingreso debe ser una fecha futura")
    private LocalDate fechaIngreso;

    @NotNull(message = "El motivo del viaje es obligatorio")
    private MotivoViaje motivoViaje;

    /** Opcional: Patente del vehículo si el viajero cruza en automóvil */
    private String patenteVehiculo;
}
