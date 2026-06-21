package com.frontintel.aduanas.ms_validacion.config;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Configuración del RestTemplate con load balancing vía Eureka.
 * Permite llamar a otros microservicios usando su nombre de aplicación (ej: ms-preregistro).
 */
@Configuration
public class RestTemplateConfig {

    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
