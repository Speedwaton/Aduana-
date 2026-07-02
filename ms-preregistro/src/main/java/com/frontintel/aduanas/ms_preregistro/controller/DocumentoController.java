package com.frontintel.aduanas.ms_preregistro.controller;

import com.frontintel.aduanas.ms_preregistro.model.DocumentoTramite;
import com.frontintel.aduanas.ms_preregistro.repository.DocumentoTramiteRepository;
import com.frontintel.aduanas.ms_preregistro.repository.TramiteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Set;

/**
 * Documentos adjuntos al trámite (el viajero los sube desde su casa,
 * la PDI los revisa antes de que el viajero llegue a la frontera).
 * Puerto: 8084 (vía gateway: /api/preregistro/**)
 */
@Slf4j
@RestController
@RequestMapping("/api/preregistro")
@RequiredArgsConstructor
public class DocumentoController {

    private final DocumentoTramiteRepository documentoRepository;
    private final TramiteRepository tramiteRepository;

    private static final Set<String> TIPOS_PERMITIDOS = Set.of(
            "ANTECEDENTES_PENALES", "LICENCIA_CONDUCIR", "PERMISO_VEHICULO", "SEGURO", "OTRO");

    private static final Set<String> CONTENT_TYPES_PERMITIDOS = Set.of(
            "application/pdf", "image/jpeg", "image/png", "image/webp");

    /**
     * Sube un documento al trámite (multipart/form-data).
     * POST /api/preregistro/{idTramite}/documentos   (file + tipoDocumento)
     */
    @PostMapping("/{idTramite}/documentos")
    public ResponseEntity<?> subirDocumento(@PathVariable String idTramite,
                                            @RequestParam("file") MultipartFile file,
                                            @RequestParam("tipoDocumento") String tipoDocumento) {
        log.info("POST /api/preregistro/{}/documentos - tipo {}", idTramite, tipoDocumento);

        if (!tramiteRepository.existsById(idTramite)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No existe el trámite " + idTramite);
        }
        if (!TIPOS_PERMITIDOS.contains(tipoDocumento)) {
            return ResponseEntity.badRequest()
                    .body("Tipo de documento inválido. Permitidos: " + TIPOS_PERMITIDOS);
        }
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("El archivo está vacío.");
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType();
        if (!CONTENT_TYPES_PERMITIDOS.contains(contentType)) {
            return ResponseEntity.badRequest()
                    .body("Formato no permitido (" + contentType + "). Sube PDF o imagen (JPG/PNG/WebP).");
        }

        try {
            DocumentoTramite doc = DocumentoTramite.builder()
                    .idTramite(idTramite)
                    .tipoDocumento(tipoDocumento)
                    .nombreArchivo(file.getOriginalFilename() == null ? "documento" : file.getOriginalFilename())
                    .contentType(contentType)
                    .tamano(file.getSize())
                    .datos(file.getBytes())
                    .build();
            DocumentoTramite guardado = documentoRepository.save(doc);
            log.info("Documento {} ({} bytes) guardado para el trámite {}",
                    guardado.getNombreArchivo(), guardado.getTamano(), idTramite);
            return ResponseEntity.status(HttpStatus.CREATED).body(java.util.Map.of(
                    "id", guardado.getId(),
                    "idTramite", guardado.getIdTramite(),
                    "tipoDocumento", guardado.getTipoDocumento(),
                    "nombreArchivo", guardado.getNombreArchivo(),
                    "tamano", guardado.getTamano(),
                    "mensaje", "Documento subido correctamente."));
        } catch (IOException e) {
            log.error("Error leyendo el archivo subido: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("No se pudo leer el archivo.");
        }
    }

    /**
     * Lista los documentos (solo metadatos) de un trámite.
     * GET /api/preregistro/{idTramite}/documentos
     */
    @GetMapping("/{idTramite}/documentos")
    public ResponseEntity<List<DocumentoTramiteRepository.DocumentoResumen>> listarDocumentos(
            @PathVariable String idTramite) {
        return ResponseEntity.ok(documentoRepository.findResumenByIdTramite(idTramite));
    }

    /**
     * Conteo de documentos por trámite (columna "Docs" del tablero del agente).
     * GET /api/preregistro/documentos-conteo → [{idTramite, cantidad}]
     */
    @GetMapping("/documentos-conteo")
    public ResponseEntity<List<DocumentoTramiteRepository.ConteoDocumentos>> conteoPorTramite() {
        return ResponseEntity.ok(documentoRepository.contarPorTramite());
    }

    /**
     * Descarga/visualiza el contenido de un documento.
     * GET /api/preregistro/documentos/{id}
     */
    @GetMapping("/documentos/{id}")
    public ResponseEntity<byte[]> descargarDocumento(@PathVariable Long id) {
        return documentoRepository.findById(id)
                .map(doc -> ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(doc.getContentType()))
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "inline; filename=\"" + doc.getNombreArchivo() + "\"")
                        .body(doc.getDatos()))
                .orElse(ResponseEntity.notFound().build());
    }
}
