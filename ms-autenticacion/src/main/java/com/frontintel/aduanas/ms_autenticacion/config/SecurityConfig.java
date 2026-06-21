package com.frontintel.aduanas.ms_autenticacion.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Configura la seguridad HTTP del microservicio.
     * Define rutas públicas y asegura que el servicio no guarde estados de sesión (Stateless).
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Deshabilitamos CSRF ya que los microservicios REST basados en tokens JWT no lo necesitan
            .csrf(csrf -> csrf.disable())
            
            // Establecemos las reglas de autorización de las URLs
            .authorizeHttpRequests(auth -> auth
                // Permitimos acceso total y público a los endpoints de autenticación y registro
                .requestMatchers("/api/v1/auth/**").permitAll()
                // Cualquier otra ruta requerirá que el usuario esté autenticado
                .anyRequest().authenticated()
            )
            
            // Forzamos a que la arquitectura sea completamente sin estado (Stateless)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS
            ));

        return http.build();
    }
}
