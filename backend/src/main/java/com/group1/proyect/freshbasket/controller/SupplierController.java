package com.group1.proyect.freshbasket.controller;

import com.group1.proyect.freshbasket.dto.request.SupplierRequestDTO;
import com.group1.proyect.freshbasket.dto.response.SupplierResponseDTO;
import com.group1.proyect.freshbasket.service.SupplierService;
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
@RequestMapping("/api/suppliers")
@Tag(name = "Suppliers", description = "API para la gestión de proveedores de FreshBasket")
public class SupplierController {

    private final SupplierService supplierService;

    // Inyección por constructor
    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @Operation(
            summary = "Obtener todos los proveedores",
            description = "Retorna una lista completa de todos los proveedores registrados"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Proveedores obtenidos exitosamente"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @GetMapping
    public ResponseEntity<List<SupplierResponseDTO>> getAllSuppliers() {
        return ResponseEntity.ok(supplierService.getAllSuppliers());
    }

    @Operation(
            summary = "Obtener un proveedor por su ID",
            description = "Busca y retorna un proveedor específico utilizando su identificador único"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Proveedor encontrado exitosamente"),
            @ApiResponse(responseCode = "404", description = "Proveedor no encontrado")
    })
    @GetMapping("/{id}")
    public ResponseEntity<SupplierResponseDTO> getSupplierById(
            @Parameter(description = "ID del proveedor a buscar", example = "1", required = true)
            @PathVariable Long id) {
        return ResponseEntity.ok(supplierService.getSupplierById(id));
    }

    @Operation(
            summary = "Crear un nuevo proveedor",
            description = "Registra un nuevo proveedor de FreshBasket"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Proveedor creado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos del proveedor inválidos")
    })
    @PostMapping
    public ResponseEntity<SupplierResponseDTO> createSupplier(
            @Parameter(description = "Datos del proveedor a crear", required = true)
            @Valid @RequestBody SupplierRequestDTO requestDTO) {

        SupplierResponseDTO newSupplier = supplierService.createSupplier(requestDTO);
        return new ResponseEntity<>(newSupplier, HttpStatus.CREATED);
    }

    @Operation(
            summary = "Actualizar un proveedor existente",
            description = "Reemplaza todos los datos de un proveedor existente con la nueva información"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "proveedor actualizado exitosamente"),
            @ApiResponse(responseCode = "404", description = "Proveedor no encontrado"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    @PutMapping("/{id}")
    public ResponseEntity<SupplierResponseDTO> updateSupplier(
            @Parameter(description = "ID del proveedor a actualizar", example = "1", required = true)
            @PathVariable Long id,
            @Parameter(description = "Datos actualizados del proveedor", required = true)
            @RequestBody SupplierRequestDTO requestDTO) {

        return ResponseEntity.ok(supplierService.updateSupplier(id, requestDTO));
    }

    @Operation(
            summary = "Eliminar un proveedor",
            description = "Borra un proveedor usando su ID"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Proveedor eliminado exitosamente"),
            @ApiResponse(responseCode = "404", description = "Proveedor no encontrado con ese ID")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSupplier(
            @Parameter(description = "ID del proveedor a eliminar", example = "1", required = true)
            @PathVariable Long id) {

        supplierService.deleteSupplier(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Buscar proveedores por nombre",
            description = "Retorna proveedores que coincidan con el nombre especificado (búsqueda parcial)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Proveedores encontrados"),
            @ApiResponse(responseCode = "404", description = "No se encontraron proveedores con ese nombre")
    })
    @GetMapping("/search")
    public ResponseEntity<List<SupplierResponseDTO>> searchUsersByName(
            @Parameter(description = "Nombre o parte del nombre a buscar", example = "Distribuidora", required = true)
            @RequestParam String name) {

        return ResponseEntity.ok(supplierService.searchSuppliersByName(name));
    }
}
