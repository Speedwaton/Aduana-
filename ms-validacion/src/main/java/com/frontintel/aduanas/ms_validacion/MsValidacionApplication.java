package com.frontintel.aduanas.ms_validacion;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * Microservicio de Validación de Identidad - Frontera Inteligente Los Libertadores.
 *
 * Responsabilidades:
 *  - Recibir los datos del documento escaneado por el funcionario.
 *  - Cruzar los datos con el preregistro almacenado en ms-preregistro.
 *  - Registrar cada validación en la base de datos para auditoría.
 *  - Retornar si el viajero puede avanzar al control aduanero.
 *
 * Puerto: 8085
 */
@SpringBootApplication
@EnableDiscoveryClient
public class MsValidacionApplication {

    public static void main(String[] args) {
        SpringApplication.run(MsValidacionApplication.class, args);
    }
}
