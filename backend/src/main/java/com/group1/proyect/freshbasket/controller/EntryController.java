package com.group1.proyect.freshbasket.controller;

import io.swagger.v3.oas.annotations.*;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.group1.proyect.freshbasket.dto.request.EntryRequestDTO;
import com.group1.proyect.freshbasket.dto.response.EntryResponseDTO;
import com.group1.proyect.freshbasket.service.EntryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/entries")
@Tag(name = "Entries", description = "API para la gestión de entradas del inventario FreshBasket")
public class EntryController {

    private final EntryService entryService;

    public EntryController(EntryService entryService) {
        this.entryService = entryService;
    }

    @Operation(
        summary = "Crear una nueva entrada",
        description = "Permite registrar una nueva entrada en el inventario con los detalles proporcionados"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Entrada creada exitosamente"),
        @ApiResponse(responseCode = "400", description = "Solicitud inválida")
    })
    @PostMapping
    public ResponseEntity<EntryResponseDTO> createEntry(
            @Parameter(description = "Detalles de la entrada a crear", required = true)
            @Valid @RequestBody EntryRequestDTO request) {
        EntryResponseDTO  newEntry = entryService.createEntry(request);
        return new ResponseEntity<>(newEntry, HttpStatus.CREATED);
    }

    @Operation(
        summary = "Obtener todas las entradas",
        description = "Retorna una lista completa de todas las entradas registradas en el inventario"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Entradas obtenidas exitosamente"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @GetMapping
    public ResponseEntity<List<EntryResponseDTO>> getAllEntries() {
        return ResponseEntity.ok(entryService.getAllEntries());
    }

    @Operation(
        summary = "Obtener una entrada por ID",
        description = "Retorna los detalles de una entrada específica según su ID"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Entrada obtenida exitosamente"),
        @ApiResponse(responseCode = "404", description = "Entrada no encontrada")
    })
    @GetMapping("/{id}")
    public ResponseEntity<EntryResponseDTO> getEntryById(
        @Parameter(description = "ID de la entrada a obtener", example = "1", required = true)
        @PathVariable Long id) {
        return ResponseEntity.ok(entryService.getEntryById(id));
    }
    /* 
    @PutMapping("/{id}")
    public ResponseEntity<EntryResponseDTO> update(
            @Parameter(description = "ID de la entrada a actualizar", example = "1", required = true)
            @PathVariable Long id,
            @Parameter(description = "Detalles de la entrada a actualizar", required = true)
            @RequestBody EntryRequestDTO request) {
        return ResponseEntity.ok(entryService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        entryService.delete(id);
        return ResponseEntity.noContent().build();
    }*/
}
