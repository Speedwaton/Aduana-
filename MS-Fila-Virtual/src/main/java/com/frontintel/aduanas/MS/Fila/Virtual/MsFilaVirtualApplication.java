package com.frontintel.aduanas.MS.Fila.Virtual;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

// El controlador vive en com.frontintel.aduanas.MS.Fila.controller, que NO está
// bajo el paquete de esta clase (...MS.Fila.Virtual). Sin este @ComponentScan
// Spring no lo detecta y /api/fila responde 404.
@SpringBootApplication
@ComponentScan(basePackages = "com.frontintel.aduanas.MS.Fila")
public class MsFilaVirtualApplication {

	public static void main(String[] args) {
		SpringApplication.run(MsFilaVirtualApplication.class, args);
	}

}
