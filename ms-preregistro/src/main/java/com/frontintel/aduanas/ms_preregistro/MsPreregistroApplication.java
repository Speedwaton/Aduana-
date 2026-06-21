package com.frontintel.aduanas.ms_preregistro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * Microservicio de Preregistro - Frontera Inteligente Los Libertadores.
 *
 * Responsabilidades:
 *  - Registrar viajeros y vehículos antes de llegar a la frontera.
 *  - Generar el código QR único (ticket) que se presenta en el control.
 *  - Publicar el evento de preregistro en Kafka para asignar turno en la fila virtual.
 *
 * Puerto: 8084
 */
@SpringBootApplication
@EnableDiscoveryClient
public class MsPreregistroApplication {

    public static void main(String[] args) {
        SpringApplication.run(MsPreregistroApplication.class, args);
    }
}
