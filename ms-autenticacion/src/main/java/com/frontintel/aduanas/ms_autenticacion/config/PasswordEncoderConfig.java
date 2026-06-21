package com.frontintel.aduanas.ms_autenticacion.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class PasswordEncoderConfig {

    /**
     * Define el bean de encriptación que utilizará el servicio de autenticación.
     * BCrypt aplica un hash seguro que protege las contraseñas en PostgreSQL.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
