package com.frontintel.aduanas.ms_preregistro.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * RestTemplate con balanceo de carga (resuelve nombres de servicio vía Eureka,
 * p. ej. http://ms-notificaciones). Reemplaza el uso de Kafka para avisar a
 * ms-notificaciones que asigne el turno del viajero.
 *
 * Lleva timeouts cortos para que, si ms-notificaciones no responde, el
 * preregistro no se quede colgado (el llamado se hace dentro de un try/catch).
 */
@Configuration
public class RestTemplateConfig {

    @Bean
    @LoadBalanced
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .connectTimeout(Duration.ofSeconds(3))
                .readTimeout(Duration.ofSeconds(3))
                .build();
    }
}
