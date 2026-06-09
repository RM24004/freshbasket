package com.group1.proyect.freshbasket.controller;

import com.group1.proyect.freshbasket.dto.request.ExitRequestDTO;
import com.group1.proyect.freshbasket.dto.response.ExitResponseDTO;
import com.group1.proyect.freshbasket.service.ExitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exits")
@Tag(name = "Exits", description = "API para la gestión de salidas del inventario FreshBasket")
public class ExitController {

    private final ExitService exitService;

    public ExitController(ExitService exitService) {
        this.exitService = exitService;
    }

    @Operation(
            summary = "Crear una nueva salida",
            description = "Permite registrar una nueva salida en el inventario con los detalles proporcionados"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Salida creada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Solicitud inválida")
    })
    @PostMapping
    public ResponseEntity<ExitResponseDTO> createExit(
            @Parameter(description = "Detalles de la salida a crear", required = true)
            @Valid @RequestBody ExitRequestDTO requestDTO) {
        ExitResponseDTO newExit = exitService.createExit(requestDTO);
        return new ResponseEntity<>(newExit, HttpStatus.CREATED);
    }

    @Operation(
            summary = "Obtener todas las salidas",
            description = "Retorna una lista completa de todas las salidas registradas en el inventario"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Salidas obtenidas exitosamente"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @GetMapping
    public ResponseEntity<List<ExitResponseDTO>> getAllExits() {
        return ResponseEntity.ok(exitService.getAllExits());
    }

    @Operation(
            summary = "Obtener una salida por ID",
            description = "Retorna los detalles de una salida específica según su ID"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Salida obtenida exitosamente"),
            @ApiResponse(responseCode = "404", description = "Salida no encontrada")
    })

    @GetMapping("/{id}")
    public ResponseEntity<ExitResponseDTO> getExitById(
            @Parameter(description = "ID de la salida a obtener", example = "1", required = true)
            @PathVariable Long id) {
        return ResponseEntity.ok(exitService.getExitById(id));
    }

    @Operation(
            summary = "Actualizar una salida existente",
            description = "Reemplaza todos los datos de una salida existente con la nueva información"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Salida actualizada exitosamente"),
            @ApiResponse(responseCode = "404", description = "Salida no encontrada"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    @PutMapping("/{id}")
    public ResponseEntity<ExitResponseDTO> updateExit(
            @Parameter(description = "ID de la salida a actualizar", example = "1", required = true)
            @PathVariable Long id,
            @Parameter(description = "Datos actualizados de la salida", required = true)
            @RequestBody ExitRequestDTO requestDTO) {

        return ResponseEntity.ok(exitService.updateExit(id, requestDTO));
    }

    @Operation(
            summary = "Eliminar una salida",
            description = "Borra una salida usando su ID"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Salida eliminada exitosamente"),
            @ApiResponse(responseCode = "404", description = "Salida no encontrada")
    })

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExit(
            @Parameter(description = "ID de la salida a eliminar", example = "1", required = true)
            @PathVariable Long id) {

        exitService.deleteExit(id);
        return ResponseEntity.noContent().build();
    }

}
