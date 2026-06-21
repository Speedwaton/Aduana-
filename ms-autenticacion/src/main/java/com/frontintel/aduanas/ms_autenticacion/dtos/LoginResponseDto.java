package com.frontintel.aduanas.ms_autenticacion.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO que se devuelve al cliente tras una autenticación exitosa.
 * Contiene el token de acceso y metadatos del usuario.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDto {

    /**
     * El token JWT firmado que autoriza las llamadas a los demás microservicios.
     */
    private String token;

    /**
     * Tipo de token (Estándar Bearer).
     */
    @Builder.Default
    private String tipo = "Bearer";

    private String rut;
    
    private String nombreCompleto;

    /**
     * Rol asignado (Permite a la app ocultar o mostrar botones en la interfaz según el perfil).
     */
    private String rol;
}
