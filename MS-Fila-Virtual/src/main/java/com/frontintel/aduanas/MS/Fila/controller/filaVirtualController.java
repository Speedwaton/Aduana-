package com.frontintel.aduanas.MS.Fila.controller;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/fila")
public class filaVirtualController {

    // Lista en memoria para simular los vehículos esperando en la aduana
    private final List<Map<String, String>> vehiculosEnFila = new ArrayList<>();
    
    // Herramienta para conectarnos con ms-operaciones
    private final RestTemplate restTemplate = new RestTemplate();

    public filaVirtualController() {
        // Datos de prueba iniciales
        vehiculosEnFila.add(Map.of("patente", "AB-123-CD", "conductor", "Juan Pérez", "tipo", "Camión"));
        vehiculosEnFila.add(Map.of("patente", "XYZ-987", "conductor", "María López", "tipo", "Auto Particular"));
        vehiculosEnFila.add(Map.of("patente", "CC-55-DD", "conductor", "Pedro Soto", "tipo", "Camión"));
    }

    // 1. OBTENER TODA LA FILA: GET http://localhost:8082/api/fila
    @GetMapping
    public List<Map<String, String>> obtenerFila() {
        return vehiculosEnFila;
    }

    // 2. BUSCAR POR PATENTE: GET http://localhost:8082/api/fila/buscar/AB-123-CD
    @GetMapping("/buscar/{patente}")
    public ResponseEntity<?> buscarPorPatente(@PathVariable String patente) {
        return vehiculosEnFila.stream()
                .filter(v -> v.get("patente").equalsIgnoreCase(patente))
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. FILTRAR POR TIPO (Camión/Auto): GET http://localhost:8082/api/fila/tipo/Camión
    @GetMapping("/tipo/{tipo}")
    public List<Map<String, String>> filtrarPorTipo(@PathVariable String tipo) {
        return vehiculosEnFila.stream()
                .filter(v -> v.get("tipo").equalsIgnoreCase(tipo))
                .collect(Collectors.toList());
    }

    // 4. AGREGAR VEHÍCULO A LA FILA: POST http://localhost:8082/api/fila
    @PostMapping
    public String agregarAVila(@RequestBody Map<String, String> nuevoVehiculo) {
        vehiculosEnFila.add(nuevoVehiculo);
        return "Vehículo con patente " + nuevoVehiculo.get("patente") + " ingresado a la fila virtual con éxito.";
    }

    // 5. AVANZAR LA FILA Y REVISAR ADUANA: DELETE http://localhost:8082/api/fila/atender
    @DeleteMapping("/atender")
    public String atenderPrimero() {
        if (vehiculosEnFila.isEmpty()) {
            return "No hay vehículos en la fila de espera.";
        }

        Map<String, String> primerVehiculo = vehiculosEnFila.get(0);
        String patente = primerVehiculo.get("patente");

        try {
            String urlOperaciones = "http://localhost:8087/api/operaciones/validar/" + patente;
            
            // Corregido el Warning usando tipos parametrizados explícitos
            @SuppressWarnings("unchecked")
            Map<String, Object> respuestaAduana = restTemplate.getForObject(urlOperaciones, Map.class);

            if (respuestaAduana == null) {
                return "Error: Respuesta vacía del módulo de operaciones.";
            }

            String controlAduanero = (String) respuestaAduana.get("controlAduanero");
            Boolean permisoParaCruzar = (Boolean) respuestaAduana.get("permisoParaCruzar");

            if (Boolean.TRUE.equals(permisoParaCruzar)) {
                vehiculosEnFila.remove(0);
                return "Vehículo [" + patente + "] de " + primerVehiculo.get("conductor") + 
                       " fue atendido. Resultado Aduana: " + controlAduanero + ". ¡PERMITIDO EL CRUCE A CHILE!";
            } else {
                return "ATENCIÓN: Vehículo [" + patente + "] retenido. Motivo: " + controlAduanero + 
                       ". No puede avanzar hasta solucionar sus papeles.";
            }

        } catch (Exception e) {
            return "Error: No se pudo contactar al módulo de ms-operaciones. Asegúrate de que el puerto 8087 esté encendido.";
        }
    }
}